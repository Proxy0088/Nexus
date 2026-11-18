import React, { useRef, useEffect } from "react";

export interface ModalLiquidGlassOverlayProps {
  className?: string;
  style?: React.CSSProperties;
  cornerRadius?: number;
  zRadius?: number;
  refraction?: number;
  dispersion?: number;
  specular?: number;
  edgeHighlight?: number;
}

const VS_SOURCE = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// WebGL Fragment Shader directly adapted from @ybouane/liquidglass & VisionOS preset
const FS_SOURCE = `
precision highp float;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;
uniform float uCornerRadius;
uniform float uZRadius;
uniform float uRefraction;
uniform float uDispersion;
uniform float uSpecular;
uniform float uEdgeHighlight;

// Rounded-rect signed distance field from @ybouane/liquidglass
float rrSDF(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, vec2(0.0))) - r;
}

// Biconvex pill-bevel height field from @ybouane/liquidglass
float bevelHeight(float d, float zR) {
  if (d <= 0.0) return 0.0;
  if (d >= zR) return zR;
  return sqrt(d * (2.0 * zR - d));
}

void main() {
  vec2 halfSize = uResolution * 0.5;
  // Convert to local coordinates centered at (0, 0), Y pointing up
  vec2 p = gl_FragCoord.xy - halfSize;
  float r = min(uCornerRadius, min(halfSize.x, halfSize.y));
  float sdf = rrSDF(p, halfSize, r);

  if (sdf > 0.0) {
    discard;
  }

  // Anti-aliased edge mask
  float mask = 1.0 - smoothstep(-1.5, 0.0, sdf);
  float inside = -sdf;
  float zR = max(uZRadius, 4.0);

  // Surface normals via bevel height field
  float e = 1.5;
  float hC = bevelHeight(inside, zR);
  float hR = bevelHeight(-rrSDF(p + vec2(e, 0.0), halfSize, r), zR);
  float hL = bevelHeight(-rrSDF(p - vec2(e, 0.0), halfSize, r), zR);
  float hU = bevelHeight(-rrSDF(p + vec2(0.0, e), halfSize, r), zR);
  float hD = bevelHeight(-rrSDF(p - vec2(0.0, e), halfSize, r), zR);
  vec2 hGrad = vec2(hR - hL, hU - hD) / (2.0 * e);
  vec3 N = normalize(vec3(-hGrad, 1.0));

  // Multi-light Blinn-Phong specular glints from @ybouane/liquidglass
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L1 = normalize(vec3(0.4, 0.7, 1.0));
  vec3 H1 = normalize(L1 + V);
  float sp1 = pow(max(dot(N, H1), 0.0), 80.0);

  vec3 L2 = normalize(vec3(-0.3, -0.5, 1.0));
  vec3 H2 = normalize(L2 + V);
  float sp2 = pow(max(dot(N, H2), 0.0), 45.0) * 0.35;

  // Interactive cursor reflection light
  vec2 mouseNorm = (uMouse - halfSize) / halfSize;
  vec3 LMouse = normalize(vec3(mouseNorm.x * 0.8, mouseNorm.y * 0.8, 1.0));
  vec3 HMouse = normalize(LMouse + V);
  float spMouse = pow(max(dot(N, HMouse), 0.0), 65.0) * 0.50;

  float totalSpec = (sp1 + sp2 + spMouse) * uSpecular;

  // Fresnel rim sheen
  float fresnel = pow(1.0 - max(0.0, N.z), 3.2);

  // Inner border highlight with top bias (Apple specular rim)
  float borderWidth = 1.2;
  float innerStroke = smoothstep(-borderWidth - 1.0, -borderWidth, sdf) * (1.0 - smoothstep(-1.0, 0.0, sdf));
  float topBias = 0.5 + 0.5 * (p.y / halfSize.y);
  innerStroke *= (0.35 + 0.65 * topBias);

  // Edge highlight along bevel contour
  float edge = 1.0 - smoothstep(0.0, zR, inside);
  float rim = edge * uEdgeHighlight * 0.35;

  // Prismatic chromatic dispersion (RGB split on bevel edge)
  vec3 chromatic = vec3(0.0);
  chromatic.r = smoothstep(0.4, 1.0, edge) * uDispersion * 0.28;
  chromatic.g = smoothstep(0.6, 1.0, edge) * uDispersion * 0.14;
  chromatic.b = smoothstep(0.3, 1.0, edge) * uDispersion * 0.35;

  // Composite physical glass surface reflections
  vec3 col = vec3(0.0);
  col += vec3(totalSpec);
  col += vec3(rim);
  col += vec3(innerStroke * 0.55);
  col += chromatic;
  col += vec3(fresnel * 0.25);

  float alpha = clamp(
    (totalSpec * 1.1 + rim * 0.85 + innerStroke * 0.75 + fresnel * 0.35 + length(chromatic) * 0.6) * mask,
    0.0,
    0.85
  );

  gl_FragColor = vec4(col, alpha);
}
`;

export const ModalLiquidGlassOverlay: React.FC<ModalLiquidGlassOverlayProps> = ({
  className = "",
  style,
  cornerRadius = 28,
  zRadius = 24,
  refraction = 0.75,
  dispersion = 0.65,
  specular = 0.35,
  edgeHighlight = 0.45,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "a_pos");
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uCornerRadiusLoc = gl.getUniformLocation(program, "uCornerRadius");
    const uZRadiusLoc = gl.getUniformLocation(program, "uZRadius");
    const uRefractionLoc = gl.getUniformLocation(program, "uRefraction");
    const uDispersionLoc = gl.getUniformLocation(program, "uDispersion");
    const uSpecularLoc = gl.getUniformLocation(program, "uSpecular");
    const uEdgeHighlightLoc = gl.getUniformLocation(program, "uEdgeHighlight");

    let mouseX = 0;
    let mouseY = 0;
    let rafId: number | null = null;

    const render = () => {
      if (!canvas || !gl) return;
      gl.useProgram(program);
      gl.enableVertexAttribArray(aPos);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uTime, performance.now() * 0.001);
      gl.uniform1f(uCornerRadiusLoc, cornerRadius * dpr);
      gl.uniform1f(uZRadiusLoc, zRadius * dpr);
      gl.uniform1f(uRefractionLoc, refraction);
      gl.uniform1f(uDispersionLoc, dispersion);
      gl.uniform1f(uSpecularLoc, specular);
      gl.uniform1f(uEdgeHighlightLoc, edgeHighlight);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const requestRender = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        render();
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mouseX = (e.clientX - rect.left) * dpr;
      mouseY = (canvas.clientHeight - (e.clientY - rect.top)) * dpr;
      requestRender();
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      requestRender();
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (gl) {
        gl.deleteBuffer(posBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
    };
  }, [cornerRadius, zRadius, refraction, dispersion, specular, edgeHighlight]);

  return (
    <canvas
      ref={canvasRef}
      className={`modal-liquid-glass-overlay ${className}`.trim()}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        borderRadius: "inherit",
        zIndex: 1,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};
