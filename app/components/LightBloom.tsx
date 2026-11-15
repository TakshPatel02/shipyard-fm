/* eslint-disable */
"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

const MAX_DPR = 2;

const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform int   uStyle;
uniform int   uDirection;
uniform vec3  uBg;
uniform vec3  uBase;
uniform vec3  uAccent;
uniform float uRise;
uniform float uSpread;
uniform float uOriginX;
uniform float uLift;
uniform float uShaftCount;
uniform float uShaftAmount;
uniform float uShaftDrift;
uniform float uGrain;
uniform float uVignette;

float h11(float x) { return fract(sin(x * 127.1) * 43758.5453123); }

float vn1(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(h11(i), h11(i + 1.0), f);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    float t = uTime;
    float breathe = 1.0 + 0.06 * sin(t * 0.35);

    float depth = mix(0.05, 1.20, uSpread);
    vec2 lp;
    float acrossUv;
    float edgeCoord;
    if (uDirection == 1) {
        lp = vec2(uOriginX, 1.0 + depth);
        acrossUv = uv.x;
        edgeCoord = 1.0 - uv.y;
    } else if (uDirection == 2) {
        lp = vec2(-depth / aspect, uOriginX);
        acrossUv = uv.y;
        edgeCoord = uv.x;
    } else if (uDirection == 3) {
        lp = vec2(1.0 + depth / aspect, uOriginX);
        acrossUv = uv.y;
        edgeCoord = 1.0 - uv.x;
    } else {
        lp = vec2(uOriginX, -depth);
        acrossUv = uv.x;
        edgeCoord = uv.y;
    }
    vec2 q = vec2((uv.x - lp.x) * aspect, uv.y - lp.y);
    float d = length(q);

    float k = mix(9.0, 1.4, uRise) / breathe;
    float g = exp(-d * k) / max(exp(-depth * k), 1e-4);
    g = clamp(g, 0.0, 1.0);

    if (uStyle == 1) {
        float sx = acrossUv * uShaftCount;
        float dr = t * uShaftDrift;
        float s = vn1(sx + dr) * 0.6 + vn1(sx * 2.17 - dr * 0.8) * 0.4;
        float mask = smoothstep(0.0, 0.35, edgeCoord);
        g *= mix(1.0, 0.45 + 1.25 * s, uShaftAmount * mask);
    }

    g = clamp(g * (1.0 + uLift * 0.25), 0.0, 1.0);

    vec3 col = mix(uBg, uBase, smoothstep(0.0, 0.68, g));
    col = mix(col, uAccent, smoothstep(0.58, 0.99, g));

    vec2 vc = uv - 0.5;
    vc.x *= aspect;
    col *= 1.0 - uVignette * smoothstep(0.35, 0.95, length(vc));

    float rnd = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (rnd - 0.5) * (uGrain * 0.06 + 1.5 / 255.0);

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function parseColor(input: string | undefined, fallback: [number, number, number]): [number, number, number] {
  if (!input) return fallback;
  const value = input.trim();
  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255];
    }
    return fallback;
  }
  const match = value.match(/[\d.]+/g);
  if (match && match.length >= 3) {
    return [
      Math.min(255, parseFloat(match[0])) / 255,
      Math.min(255, parseFloat(match[1])) / 255,
      Math.min(255, parseFloat(match[2])) / 255,
    ];
  }
  return fallback;
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && isFinite(value) ? value : fallback;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("LightBloom shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

type Props = {
  style?: React.CSSProperties;
  variant?: "bloom" | "shafts";
  direction?: "bottom" | "top" | "left" | "right";
  background?: string;
  baseColor?: string;
  accentColor?: string;
  speed?: number;
  hover?: number;
  light?: { rise?: number; spread?: number };
  shafts?: { count?: number; amount?: number; drift?: number };
  finish?: { grain?: number; vignette?: number };
  width?: number;
  height?: number;
};

const DEFAULT_LIGHT = { rise: 79, spread: 72 };
const DEFAULT_SHAFTS = { count: 17, amount: 70, drift: 79 };
const DEFAULT_FINISH = { grain: 12, vignette: 25 };

export default function LightBloom({
  style,
  variant = "shafts",
  direction = "bottom",
  background = "#050509",
  baseColor = "#5B2EE6",
  accentColor = "#8B6CFF",
  speed = 100,
  hover = 114,
  light,
  shafts,
  finish,
  width,
  height,
}: Props) {
  const L = { ...DEFAULT_LIGHT, ...(light ?? {}) };
  const S = { ...DEFAULT_SHAFTS, ...(shafts ?? {}) };
  const F = { ...DEFAULT_FINISH, ...(finish ?? {}) };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  sizeRef.current = { w: num(width, 0), h: num(height, 0) };

  const valuesRef = useRef({
    style: 0,
    direction: 0,
    bg: [0, 0, 0] as [number, number, number],
    base: [0, 0, 0] as [number, number, number],
    accent: [0, 0, 0] as [number, number, number],
    rise: 0.55,
    spread: 0.6,
    speed: 1,
    hover: 1,
    count: 9,
    amount: 0.55,
    drift: 0.4,
    grain: 0.12,
    vignette: 0.25,
  });
  valuesRef.current = {
    style: variant === "shafts" ? 1 : 0,
    direction: direction === "top" ? 1 : direction === "left" ? 2 : direction === "right" ? 3 : 0,
    bg: parseColor(background, [0.02, 0.02, 0.035]),
    base: parseColor(baseColor, [0.36, 0.18, 0.9]),
    accent: parseColor(accentColor, [0.55, 0.42, 1]),
    rise: num(L.rise, 79) / 100,
    spread: num(L.spread, 72) / 100,
    speed: num(speed, 50) / 50,
    hover: num(hover, 100) / 100,
    count: Math.max(1, num(S.count, 17)),
    amount: num(S.amount, 70) / 100,
    drift: num(S.drift, 79) / 100,
    grain: num(F.grain, 12) / 100,
    vignette: num(F.vignette, 25) / 100,
  };

  const pointerRef = useRef({ x: 0.5, target: 0.5, on: 0, onTarget: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      console.error("LightBloom: WebGL unavailable");
      return;
    }

    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("LightBloom link:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      res: gl.getUniformLocation(program, "uRes"),
      time: gl.getUniformLocation(program, "uTime"),
      style: gl.getUniformLocation(program, "uStyle"),
      direction: gl.getUniformLocation(program, "uDirection"),
      bg: gl.getUniformLocation(program, "uBg"),
      base: gl.getUniformLocation(program, "uBase"),
      accent: gl.getUniformLocation(program, "uAccent"),
      rise: gl.getUniformLocation(program, "uRise"),
      spread: gl.getUniformLocation(program, "uSpread"),
      originX: gl.getUniformLocation(program, "uOriginX"),
      lift: gl.getUniformLocation(program, "uLift"),
      count: gl.getUniformLocation(program, "uShaftCount"),
      amount: gl.getUniformLocation(program, "uShaftAmount"),
      drift: gl.getUniformLocation(program, "uShaftDrift"),
      grain: gl.getUniformLocation(program, "uGrain"),
      vignette: gl.getUniformLocation(program, "uVignette"),
    };

    let animationFrame = 0;
    let last = performance.now();
    let clock = 0;
    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const values = valuesRef.current;
      clock = (clock + dt * values.speed) % 3600;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const canvasWidth = sizeRef.current.w || canvas.clientWidth || 1200;
      const canvasHeight = sizeRef.current.h || canvas.clientHeight || 800;
      const widthInPixels = Math.max(1, Math.round(canvasWidth * dpr));
      const heightInPixels = Math.max(1, Math.round(canvasHeight * dpr));
      if (canvas.width !== widthInPixels || canvas.height !== heightInPixels) {
        canvas.width = widthInPixels;
        canvas.height = heightInPixels;
        gl.viewport(0, 0, widthInPixels, heightInPixels);
      }

      const pointer = pointerRef.current;
      const pointerEase = 1 - Math.exp(-8 * dt);
      const hoverEase = 1 - Math.exp(-5 * dt);
      pointer.x += (pointer.target - pointer.x) * pointerEase;
      pointer.on += (pointer.onTarget - pointer.on) * hoverEase;
      const originX = 0.5 + (pointer.x - 0.5) * Math.min(1, values.hover) * pointer.on;

      gl.uniform2f(uniforms.res, widthInPixels, heightInPixels);
      gl.uniform1f(uniforms.time, clock);
      gl.uniform1i(uniforms.style, values.style);
      gl.uniform1i(uniforms.direction, values.direction);
      gl.uniform3f(uniforms.bg, values.bg[0], values.bg[1], values.bg[2]);
      gl.uniform3f(uniforms.base, values.base[0], values.base[1], values.base[2]);
      gl.uniform3f(uniforms.accent, values.accent[0], values.accent[1], values.accent[2]);
      gl.uniform1f(uniforms.rise, values.rise);
      gl.uniform1f(uniforms.spread, values.spread);
      gl.uniform1f(uniforms.originX, originX);
      gl.uniform1f(uniforms.lift, values.hover * pointer.on);
      gl.uniform1f(uniforms.count, values.count);
      gl.uniform1f(uniforms.amount, values.amount);
      gl.uniform1f(uniforms.drift, values.drift);
      gl.uniform1f(uniforms.grain, values.grain);
      gl.uniform1f(uniforms.vignette, values.vignette);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animationFrame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (valuesRef.current.direction === 2 || valuesRef.current.direction === 3) {
        const height = canvas.offsetHeight || 1;
        const scale = rect.height > 0 ? height / rect.height : 1;
        pointerRef.current.target = Math.max(
          0,
          Math.min(1, 1 - ((event.clientY - rect.top) * scale) / height)
        );
      } else {
        const width = canvas.offsetWidth || 1;
        const scale = rect.width > 0 ? width / rect.width : 1;
        pointerRef.current.target = Math.max(
          0,
          Math.min(1, ((event.clientX - rect.left) * scale) / width)
        );
      }
    };
    const onEnter = () => {
      pointerRef.current.onTarget = 1;
    };
    const onLeave = () => {
      pointerRef.current.onTarget = 0;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background,
        minWidth: 1200,
        minHeight: 800,
        width: typeof width === "number" && width > 0 ? width : "100%",
        height: typeof height === "number" && height > 0 ? height : "100%",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
