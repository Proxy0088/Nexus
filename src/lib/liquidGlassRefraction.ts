/**
 * Apple Liquid Glass SVG Displacement Refraction Engine (Performance-Optimized)
 * Adapted from `xenitV1/liquid-glass-skill` (apple-liquid-glass/assets/refraction.js)
 * for React + Tauri (Chromium WebView2):
 *  - Pre-softens the 0.5x displacement map ONCE on Canvas (zero per-frame feGaussianBlur on GPU)
 *  - Caches generated displacement PNGs across same-sized cards (e.g., 2 status cards, 4 diagnostic cards)
 *  - Uses objectBoundingBox (0%..100%) so all 4 edges (top, bottom, left, right) align on any Windows DPI
 *  - Uses IntersectionObserver to run live SVG backdrop-filter ONLY on cards near/inside the viewport
 */

const SVG_NS = "http://www.w3.org/2000/svg";

interface RefractState {
  key: string;
  id: string;
  filterValue: string;
  isVisible: boolean;
}

declare global {
  interface Window {
    LiquidGlassRefraction?: {
      refresh: () => void;
      supported: () => boolean;
      applyToElement: (el: HTMLElement) => void;
      cleanupElement: (el: HTMLElement) => void;
    };
  }
}

let filterCounter = 0;
let svgDefs: SVGDefsElement | null = null;
const observed = new WeakMap<HTMLElement, RefractState>();
const mapPngCache = new Map<string, string>();

function isChromium(): boolean {
  const nav = navigator as Navigator & {
    userAgentData?: { brands?: Array<{ brand: string }> };
  };
  const brands = nav.userAgentData?.brands;
  if (brands && brands.some((b) => /Chromium|Chrome|Edge|WebView/i.test(b.brand))) {
    return true;
  }
  const ua = navigator.userAgent;
  return /Chrome\/\d+|Edg\/\d+|EdgW\/\d+/.test(ua) && !/Firefox|FxiOS|EdgiOS|CriOS/.test(ua);
}

function reducedTransparency(): boolean {
  return (
    window.matchMedia("(prefers-reduced-transparency: reduce)").matches ||
    document.documentElement.hasAttribute("data-rt")
  );
}

export function isBackdropRefractionSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (!isChromium()) return false;
  if (!window.CSS || !CSS.supports("backdrop-filter", "url(#a)")) return false;
  return !reducedTransparency();
}

function ensureDefs(): SVGDefsElement {
  if (svgDefs && svgDefs.isConnected) return svgDefs;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.cssText =
    "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
  svgDefs = document.createElementNS(SVG_NS, "defs");
  svg.appendChild(svgDefs);
  document.body.appendChild(svg);
  return svgDefs;
}

/**
 * Signed distance from a point to a rounded rectangle centred at (0, 0).
 * Negative inside. Also returns the outward unit normal.
 */
function roundedRectField(
  x: number,
  y: number,
  hw: number,
  hh: number,
  r: number
): { d: number; nx: number; ny: number } {
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const qx = ax - (hw - r);
  const qy = ay - (hh - r);
  const sx = x < 0 ? -1 : 1;
  const sy = y < 0 ? -1 : 1;

  let dist: number;
  let nx: number;
  let ny: number;

  if (qx > 0 && qy > 0) {
    const len = Math.sqrt(qx * qx + qy * qy) || 1;
    dist = len - r;
    nx = (qx / len) * sx;
    ny = (qy / len) * sy;
  } else if (qx > qy) {
    dist = qx - r;
    nx = sx;
    ny = 0;
  } else {
    dist = qy - r;
    nx = 0;
    ny = sy;
  }

  return { d: dist, nx, ny };
}

/**
 * Generates & caches a pre-smoothed 0.5x displacement map PNG.
 * Pre-smoothing in JS eliminates per-frame <feGaussianBlur> from the live GPU SVG filter!
 */
function buildDisplacementMap(
  w: number,
  h: number,
  radius: number,
  bezel: number,
  magnify: number
): string {
  const mapScale = 0.5;
  const mw = Math.max(24, Math.round(w * mapScale));
  const mh = Math.max(24, Math.round(h * mapScale));
  const mr = radius * mapScale;
  const mb = Math.max(3, bezel * mapScale);

  const cacheKey = `${mw}x${mh}|${mr.toFixed(1)}|${mb.toFixed(1)}|${magnify}`;
  const cached = mapPngCache.get(cacheKey);
  if (cached) return cached;

  const rawCanvas = document.createElement("canvas");
  rawCanvas.width = mw;
  rawCanvas.height = mh;
  const rawCtx = rawCanvas.getContext("2d");
  if (!rawCtx) return "";

  const img = rawCtx.createImageData(mw, mh);
  const data = img.data;
  const hw = mw / 2;
  const hh = mh / 2;
  const maxMag = Math.max(1e-6, magnify);

  for (let py = 0; py < mh; py++) {
    for (let px = 0; px < mw; px++) {
      const x = px + 0.5 - hw;
      const y = py + 0.5 - hh;
      const f = roundedRectField(x, y, hw, hh, mr);
      const inside = -f.d;
      let vx = 0;
      let vy = 0;

      if (inside < mb && inside > -1) {
        // Smooth C2 quintic easing along the bezel produces silk-smooth rounded corners without needing GPU feGaussianBlur
        const t = 1 - Math.max(0, inside) / mb;
        let m = t * t * t * (t * (t * 6 - 15) + 10);
        m = Math.pow(m, 1.35);
        vx = -f.nx * m;
        vy = -f.ny * m;
      }

      if (magnify > 0) {
        vx -= ((x / hw) * magnify) / maxMag * 0.25;
        vy -= ((y / hh) * magnify) / maxMag * 0.25;
      }

      const i = (py * mw + px) * 4;
      data[i] = Math.round(128 + Math.max(-1, Math.min(1, vx)) * 127);
      data[i + 1] = Math.round(128 + Math.max(-1, Math.min(1, vy)) * 127);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  rawCtx.putImageData(img, 0, 0);

  // Light 1-time pre-blur on a padded canvas (replaces per-frame SVG feGaussianBlur with edgeMode="duplicate")
  const blurPx = Math.max(1, Math.min(3, mb * 0.2));
  const pad = Math.ceil(blurPx * 3);
  const padded = document.createElement("canvas");
  padded.width = mw + pad * 2;
  padded.height = mh + pad * 2;
  const pCtx = padded.getContext("2d");

  let resultUrl: string;
  if (pCtx) {
    // Replicate edges into padding so blur never bleeds transparent black
    pCtx.drawImage(rawCanvas, pad, pad);
    pCtx.drawImage(rawCanvas, 0, 0, mw, 1, pad, 0, mw, pad);
    pCtx.drawImage(rawCanvas, 0, mh - 1, mw, 1, pad, pad + mh, mw, pad);
    pCtx.drawImage(rawCanvas, 0, 0, 1, mh, 0, pad, pad, mh);
    pCtx.drawImage(rawCanvas, mw - 1, 0, 1, mh, pad + mw, pad, pad, mh);
    pCtx.drawImage(rawCanvas, 0, 0, 1, 1, 0, 0, pad, pad);
    pCtx.drawImage(rawCanvas, mw - 1, 0, 1, 1, pad + mw, 0, pad, pad);
    pCtx.drawImage(rawCanvas, 0, mh - 1, 1, 1, 0, pad + mh, pad, pad);
    pCtx.drawImage(rawCanvas, mw - 1, mh - 1, 1, 1, pad + mw, pad + mh, pad, pad);

    const outCanvas = document.createElement("canvas");
    outCanvas.width = mw;
    outCanvas.height = mh;
    const outCtx = outCanvas.getContext("2d");
    if (outCtx) {
      outCtx.filter = `blur(${blurPx.toFixed(1)}px)`;
      outCtx.drawImage(padded, -pad, -pad);
      resultUrl = outCanvas.toDataURL("image/png");
    } else {
      resultUrl = rawCanvas.toDataURL("image/png");
    }
  } else {
    resultUrl = rawCanvas.toDataURL("image/png");
  }

  if (mapPngCache.size > 32) {
    mapPngCache.clear();
  }
  mapPngCache.set(cacheKey, resultUrl);
  return resultUrl;
}

function readNumber(el: HTMLElement, name: string, fallback: number): number {
  const raw = el.getAttribute(name);
  if (raw === null || raw === "") return fallback;
  const v = parseFloat(raw);
  return Number.isFinite(v) ? v : fallback;
}

function setActiveFilter(el: HTMLElement, state: RefractState, active: boolean): void {
  state.isVisible = active;
  if (active) {
    el.style.setProperty("backdrop-filter", state.filterValue);
    el.style.setProperty("-webkit-backdrop-filter", state.filterValue);
    el.classList.add("is-refracting");
  } else {
    el.style.removeProperty("backdrop-filter");
    el.style.removeProperty("-webkit-backdrop-filter");
    el.classList.remove("is-refracting");
  }
}

// Only run live GPU SVG backdrop-filter on cards inside or near the visible viewport
const intersectionObserver: IntersectionObserver | null =
  typeof IntersectionObserver === "function"
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const target = entry.target as HTMLElement;
            const state = observed.get(target);
            if (!state) continue;
            if (state.isVisible !== entry.isIntersecting) {
              setActiveFilter(target, state, entry.isIntersecting);
            }
          }
        },
        { rootMargin: "140px 0px" }
      )
    : null;

const resizeObserver: ResizeObserver | null =
  typeof ResizeObserver === "function"
    ? new ResizeObserver((entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          if (isBackdropRefractionSupported()) {
            applyRefractionToElement(target);
          } else {
            cleanupRefractionElement(target);
          }
        }
      })
    : null;

export function applyRefractionToElement(el: HTMLElement): void {
  if (!isBackdropRefractionSupported()) {
    cleanupRefractionElement(el);
    return;
  }

  const w = Math.round(el.offsetWidth);
  const h = Math.round(el.offsetHeight);
  if (w < 8 || h < 8) return;

  const cs = getComputedStyle(el);
  let radius = parseFloat(cs.borderTopLeftRadius) || 0;
  radius = Math.min(radius, w / 2, h / 2);

  const strength = Math.max(0, Math.min(2, readNumber(el, "data-refract", 1.45)));
  let bezel = readNumber(
    el,
    "data-refract-bezel",
    Math.max(8, Math.min(24, radius * 0.54 || 16))
  );
  bezel = Math.min(bezel, Math.min(w, h) * 0.32);

  const isClear = el.classList.contains("glass-clear");
  const blur = readNumber(el, "data-refract-blur", isClear ? 1.8 : 10);
  // Default 0 = ultra-fast 2-node GPU filter (feImage + single feDisplacementMap) -> ~5x faster than 3-channel RGB split
  const dispersion = Math.max(
    0,
    Math.min(0.2, readNumber(el, "data-refract-dispersion", 0))
  );
  const magnify = readNumber(el, "data-refract-magnify", 0);
  const scale = Math.round(bezel * 1.2 * strength);

  const key = [w, h, radius, bezel, scale, blur, magnify, dispersion].join("|");
  const prev = observed.get(el);
  if (prev && prev.key === key) {
    resizeObserver?.observe(el);
    intersectionObserver?.observe(el);
    return;
  }

  const id = prev ? prev.id : `lg-refract-${++filterCounter}`;
  document.getElementById(id)?.remove();

  const filter = document.createElementNS(SVG_NS, "filter");
  filter.setAttribute("id", id);
  // objectBoundingBox (0%..100%) maps exact top-to-bottom & left-to-right on all Windows DPI scales
  filter.setAttribute("filterUnits", "objectBoundingBox");
  filter.setAttribute("x", "0%");
  filter.setAttribute("y", "0%");
  filter.setAttribute("width", "100%");
  filter.setAttribute("height", "100%");
  filter.setAttribute("color-interpolation-filters", "sRGB");

  const addNode = (tag: string, attrs: Record<string, string | number>) => {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      node.setAttribute(k, String(v));
    }
    filter.appendChild(node);
    return node;
  };

  // Pre-smoothed map PNG fills 100% of filter region — zero per-frame feGaussianBlur overhead!
  addNode("feImage", {
    href: buildDisplacementMap(w, h, radius, bezel, magnify),
    preserveAspectRatio: "none",
    result: "map",
  });

  if (dispersion > 0) {
    const channels = [
      { c: "r", s: scale, m: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" },
      { c: "g", s: scale * (1 - dispersion), m: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" },
      { c: "b", s: scale * (1 - 2 * dispersion), m: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" },
    ];
    for (const ch of channels) {
      addNode("feDisplacementMap", {
        in: "SourceGraphic",
        in2: "map",
        scale: ch.s.toFixed(2),
        xChannelSelector: "R",
        yChannelSelector: "G",
        result: `d${ch.c}`,
      });
      addNode("feColorMatrix", {
        in: `d${ch.c}`,
        type: "matrix",
        values: ch.m,
        result: ch.c,
      });
    }
    addNode("feComposite", {
      in: "r",
      in2: "g",
      operator: "arithmetic",
      k1: 0,
      k2: 1,
      k3: 1,
      k4: 0,
      result: "rg",
    });
    addNode("feComposite", {
      in: "rg",
      in2: "b",
      operator: "arithmetic",
      k1: 0,
      k2: 1,
      k3: 1,
      k4: 0,
    });
  } else {
    // Fast single-pass GPU displacement (2 SVG primitives total!)
    addNode("feDisplacementMap", {
      in: "SourceGraphic",
      in2: "map",
      scale,
      xChannelSelector: "R",
      yChannelSelector: "G",
    });
  }

  ensureDefs().appendChild(filter);

  const filterValue =
    blur > 0
      ? `url(#${id}) blur(${blur}px) saturate(165%)`
      : `url(#${id}) saturate(165%)`;

  const rect = el.getBoundingClientRect();
  const initiallyVisible =
    rect.bottom >= -140 && rect.top <= window.innerHeight + 140;

  const nextState: RefractState = {
    key,
    id,
    filterValue,
    isVisible: initiallyVisible,
  };
  observed.set(el, nextState);
  setActiveFilter(el, nextState, initiallyVisible);

  resizeObserver?.observe(el);
  intersectionObserver?.observe(el);
}

export function cleanupRefractionElement(el: HTMLElement): void {
  resizeObserver?.unobserve(el);
  intersectionObserver?.unobserve(el);
  const state = observed.get(el);
  if (!state) return;
  document.getElementById(state.id)?.remove();
  el.style.removeProperty("backdrop-filter");
  el.style.removeProperty("-webkit-backdrop-filter");
  el.classList.remove("is-refracting");
  observed.delete(el);
}

export function refreshAllRefraction(): void {
  const els = document.querySelectorAll<HTMLElement>("[data-refract]");
  let any = false;
  els.forEach((el) => {
    if (isBackdropRefractionSupported()) {
      applyRefractionToElement(el);
      any = true;
    } else {
      cleanupRefractionElement(el);
    }
  });
  document.documentElement.classList.toggle("refraction-on", any);
}

if (typeof window !== "undefined") {
  window.LiquidGlassRefraction = {
    refresh: refreshAllRefraction,
    supported: isBackdropRefractionSupported,
    applyToElement: applyRefractionToElement,
    cleanupElement: cleanupRefractionElement,
  };

  const mq = window.matchMedia("(prefers-reduced-transparency: reduce)");
  mq.addEventListener?.("change", refreshAllRefraction);
}
