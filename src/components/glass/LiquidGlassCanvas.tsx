import React, { useEffect, useRef } from "react";

interface LiquidGlassCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  lightIntensity?: number;
  dispersion?: number;
  refraction?: number;
  cornerRadius?: number;
}

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = (position + 1.0) * 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;
uniform float uLightIntensity;
uniform float uDispersion;
uniform float uRefraction;
uniform float uCornerRadius;

// Signed distance function for a 2D rounded box
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  vec2 halfSize = uResolution * 0.5;
  vec2 p = (vUv - 0.5) * uResolution;
  float radius = min(uCornerRadius, min(halfSize.x, halfSize.y));
  
  // Outer shape boundary
  float d = sdRoundedBox(p, halfSize, radius);
  if (d > 1.0) {
    discard;
  }

  // Optical bevel width in pixels
  float bevelWidth = min(28.0, min(halfSize.x, halfSize.y) * 0.55);
  float bevelDist = clamp(-d, 0.0, bevelWidth) / bevelWidth;
  float slope = 1.0 - bevelDist;

  // Normal approximation based on distance gradient
  vec2 eps = vec2(1.5, 0.0);
  vec2 grad = vec2(
    sdRoundedBox(p + eps.xy, halfSize, radius) - sdRoundedBox(p - eps.xy, halfSize, radius),
    sdRoundedBox(p + eps.yx, halfSize, radius) - sdRoundedBox(p - eps.yx, halfSize, radius)
  );
  grad = normalize(grad + vec2(0.0001));

  // High-curvature dome normal along the bevel contour
  vec3 normal = normalize(vec3(grad * slope * 2.2, 1.0 - slope * 0.5));

  // Smooth continuous optical rim lighting (no spot/halo blobs in any corner)
  float rim = pow(slope, 2.0) * uLightIntensity * 0.40;
  
  // Top edge specular reflection
  float topHighlight = clamp(grad.y, 0.0, 1.0) * pow(slope, 1.5) * 0.50;

  // Bottom bounce reflection (gives 3D physical thickness)
  float bottomBounce = clamp(-grad.y, 0.0, 1.0) * slope * 0.25;

  // Prismatic edge dispersion along outer rim (balanced neutral RGB)
  float chromatic = smoothstep(0.75, 1.0, slope) * uDispersion * 0.10;

  vec3 col = vec3(rim + topHighlight + bottomBounce * 0.4);
  col.r += chromatic * 0.4;
  col.g += chromatic * 0.15;
  col.b += chromatic * 0.45;

  float alpha = clamp(rim * 0.75 + topHighlight * 0.85 + bottomBounce * 0.35 + chromatic * 0.35, 0.0, 0.70);
  gl_FragColor = vec4(col, alpha);
}
`;

export const LiquidGlassCanvas: React.FC<LiquidGlassCanvasProps> = ({
  className = "",
  style,
  lightIntensity = 0.85,
  dispersion = 0.65,
  refraction = 0.75,
  cornerRadius = 36,
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

    // Compile shader helper
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

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
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

    const posAttrib = gl.getAttribLocation(program, "position");
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uLightIntensityLoc = gl.getUniformLocation(program, "uLightIntensity");
    const uDispersionLoc = gl.getUniformLocation(program, "uDispersion");
    const uRefractionLoc = gl.getUniformLocation(program, "uRefraction");
    const uCornerRadiusLoc = gl.getUniformLocation(program, "uCornerRadius");

    let mouseX = 0;
    let mouseY = 0;
    let rafId: number | null = null;

    const render = () => {
      if (!canvas || !gl) return;
      gl.useProgram(program);
      gl.enableVertexAttribArray(posAttrib);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uTime, performance.now() * 0.001);
      gl.uniform1f(uLightIntensityLoc, lightIntensity);
      gl.uniform1f(uDispersionLoc, dispersion);
      gl.uniform1f(uRefractionLoc, refraction);
      gl.uniform1f(uCornerRadiusLoc, cornerRadius * dpr);

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
      mouseX = e.clientX - rect.left;
      mouseY = canvas.height - (e.clientY - rect.top);
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
  }, [lightIntensity, dispersion, refraction, cornerRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`liquid-glass-canvas ${className}`.trim()}
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
    />
  );
};
