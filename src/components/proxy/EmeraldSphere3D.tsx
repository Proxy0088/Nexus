import React, { useRef, useEffect } from "react";

export interface EmeraldSphere3DProps {
  normX: number; // Normalized mouse X [-1, 1]
  normY: number; // Normalized mouse Y [-1, 1]
  className?: string;
  style?: React.CSSProperties;
}

export const EmeraldSphere3D: React.FC<EmeraldSphere3DProps> = ({
  normX,
  normY,
  className = "",
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: normX, y: normY });
  const animFrameRef = useRef<number | null>(null);

  // Keep mouseRef updated with smooth interpolation
  useEffect(() => {
    mouseRef.current.x = normX;
    mouseRef.current.y = normY;
  }, [normX, normY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl", { alpha: true, antialias: true }) ||
      canvas.getContext("experimental-webgl", { alpha: true, antialias: true })) as WebGLRenderingContext | null;

    if (!gl) {
      // Graceful 2D Canvas Fallback if WebGL is unavailable
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const draw2D = () => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const radius = w * 0.42;

        const lightX = cx + mouseRef.current.x * radius * 0.35 - radius * 0.15;
        const lightY = cy + mouseRef.current.y * radius * 0.35 - radius * 0.2;

        const grad = ctx.createRadialGradient(
          lightX,
          lightY,
          radius * 0.1,
          cx,
          cy,
          radius
        );
        grad.addColorStop(0, "#D4FFF5");
        grad.addColorStop(0.2, "#A3EEDC");
        grad.addColorStop(0.45, "#49D4B7");
        grad.addColorStop(0.7, "#0FB294");
        grad.addColorStop(0.9, "#089482");
        grad.addColorStop(1, "#007567");

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = "rgba(0, 46, 40, 0.45)";
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;
        ctx.fill();

        animFrameRef.current = requestAnimationFrame(draw2D);
      };

      draw2D();
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }

    // High-Precision WebGL Shader Sphere
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / (min(u_resolution.x, u_resolution.y) * 0.5);
        float dist = length(uv);

        // Ambient volumetric emerald glow behind and around the sphere
        float pulse = 0.85 + 0.15 * sin(u_time * 1.8);
        vec3 glowColor = vec3(0.06, 0.70, 0.58) * pulse;

        if (dist > 0.86) {
          float glowAlpha = smoothstep(1.35, 0.86, dist) * 0.42 * pulse;
          gl_FragColor = vec4(glowColor, glowAlpha);
          return;
        }

        // Ray-Sphere Surface Normal
        float z = sqrt(max(0.0, 0.86 * 0.86 - dist * dist));
        vec3 normal = normalize(vec3(uv, z));

        // Light tracking cursor
        vec3 lightPos = normalize(vec3(u_mouse.x * 0.85 - 0.25, -u_mouse.y * 0.85 + 0.35, 1.1));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfDir = normalize(lightPos + viewDir);

        // Diffuse & Specular (Blinn-Phong)
        float NdotL = max(0.0, dot(normal, lightPos));
        float NdotH = max(0.0, dot(normal, halfDir));
        float spec = pow(NdotH, 32.0) * 1.1;

        // Fresnel Edge Sheen
        float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 2.8);

        // Figma Emerald Color Palette
        vec3 cDeep = vec3(0.0, 0.46, 0.40);     // #007567
        vec3 cMid = vec3(0.06, 0.70, 0.58);     // #0FB294
        vec3 cBright = vec3(0.29, 0.83, 0.72);  // #49D4B7
        vec3 cHighlight = vec3(0.83, 1.0, 0.96); // #D4FFF5

        vec3 sphereColor = mix(cDeep, cMid, smoothstep(0.0, 0.55, NdotL));
        sphereColor = mix(sphereColor, cBright, smoothstep(0.55, 0.92, NdotL));
        sphereColor += spec * cHighlight;
        sphereColor += fresnel * cBright * 0.55;

        // Anti-aliased outer rim
        float edgeAlpha = smoothstep(0.86, 0.848, dist);
        gl_FragColor = vec4(sphereColor, edgeAlpha);
      }
    `;

    function createShader(glCtx: WebGLRenderingContext, type: number, src: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, src);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "a_position");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uTime = gl.getUniformLocation(program, "u_time");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let currentMouseX = mouseRef.current.x;
    let currentMouseY = mouseRef.current.y;
    const startTime = performance.now();

    const render = (time: number) => {
      // Silky smooth interpolation of light direction towards cursor
      currentMouseX += (mouseRef.current.x - currentMouseX) * 0.12;
      currentMouseY += (mouseRef.current.y - currentMouseY) * 0.12;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, currentMouseX, currentMouseY);
      gl.uniform1f(uTime, (time - startTime) * 0.001);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(posBuffer);
    };
  }, []);

  return (
    <div className={`emerald-sphere-3d-wrapper ${className}`.trim()} style={style}>
      {/* Dynamic ambient backlight pulse (casts glowing refraction through glass cards) */}
      <div className="emerald-sphere-ambient-glow" aria-hidden="true" />
      {/* 3D WebGL / Canvas Sphere */}
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="emerald-sphere-canvas"
        aria-hidden="true"
      />
    </div>
  );
};
