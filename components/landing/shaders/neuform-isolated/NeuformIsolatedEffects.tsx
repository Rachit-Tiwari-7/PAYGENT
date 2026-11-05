"use client";

import React, { useEffect, useRef, CSSProperties } from "react";
import "../threeui.css";

export type EffectMode = "light" | "dark";

export type StructureFlowCollectionProps = {
  variant?: "expanse-field" | string;
  mode?: EffectMode;
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * ExpanseFieldCanvas - Native high-performance WebGL implementation
 * of the Expanse Field shader (Aura Asset Library / ThreeUI r128-r160).
 */
export function ExpanseFieldCanvas({
  hue = 0,
  saturation = 1,
  brightness = 1,
  className = "",
  style = {},
}: {
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: false, depth: false }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      console.warn("WebGL not supported for Expanse Field");
      return;
    }

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float numBars = 11.0;
        float barIndex = floor(st.x * numBars);
        float t = barIndex / (numBars - 1.0);

        // Breathing pulse animation
        float anim = sin(u_time * 0.5 + t * 3.0) * 0.025;

        // Curve for horizon line
        float targetHeight = 0.15 + pow(t, 1.3) * 0.5 + anim;

        // Color gradient: Dark base -> Blue/Pink mid -> Cutoff
        vec3 colorBase = vec3(0.04, 0.04, 0.06);
        vec3 colorMid = mix(vec3(0.1, 0.3, 0.8), vec3(0.8, 0.2, 0.5), st.x);
        vec3 color = mix(colorBase, colorMid, smoothstep(0.1, 0.7, st.y));

        // Stepped horizon cutoff matching container background
        if (st.y > targetHeight) {
          gl_FragColor = vec4(0.965, 0.961, 0.957, 1.0);
          return;
        }

        // High-frequency film grain
        float noise = random(st * (u_time * 0.1)) * 0.15;
        gl_FragColor = vec4(color + noise, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer [-1,-1] to [1,1]
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");

    let animId: number;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      const w = Math.floor(width * dpr);
      const h = Math.floor(height * dpr);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();
    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      gl.uniform1f(uTime, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  const filterStyle =
    hue !== 0 || saturation !== 1 || brightness !== 1
      ? `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness})`
      : undefined;

  return (
    <div
      className={`threeui-background ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        filter: filterStyle,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
      />
      {/* Subtle Diagonal Texture Overlay from canonical source */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(0,0,0,0.018) 0, rgba(0,0,0,0.018) 1px, transparent 1px, transparent 6px)",
          zIndex: 1,
        }}
      />
    </div>
  );
}

/**
 * StructureFlowCollection — ThreeUI component export
 */
export function StructureFlowCollection({
  variant = "expanse-field",
  hue = 0,
  saturation = 1,
  brightness = 1,
  className = "",
  style = {},
}: StructureFlowCollectionProps) {
  if (variant === "expanse-field") {
    return (
      <ExpanseFieldCanvas
        hue={hue}
        saturation={saturation}
        brightness={brightness}
        className={className}
        style={style}
      />
    );
  }

  return (
    <ExpanseFieldCanvas
      hue={hue}
      saturation={saturation}
      brightness={brightness}
      className={className}
      style={style}
    />
  );
}

export const ExpanseField = ExpanseFieldCanvas;
export default StructureFlowCollection;
