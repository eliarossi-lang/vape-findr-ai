import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2, Vec3 } from "ogl";
import { smokeVert } from "@/shaders/smoke.vert";
import { smokeFrag } from "@/shaders/smoke.frag";

export const SmokeBackgroundWebGL = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const renderer = new Renderer({ dpr, alpha: false, antialias: false });
    const gl = renderer.gl;
    gl.clearColor(0.02, 0.02, 0.03, 1);
    container.appendChild(gl.canvas);
    gl.canvas.style.position = "absolute";
    gl.canvas.style.inset = "0";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: smokeVert,
      fragment: smokeFrag,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2(1, 1) },
        uMouse: { value: new Vec2(0, 0) },
        uMouseStrength: { value: 0 },
        uColorA: { value: new Vec3(0.55, 0.25, 1.0) },  // violet
        uColorB: { value: new Vec3(0.1, 0.85, 1.0) },   // cyan
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value.set(w * dpr, h * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse handling with inertia
    const mouseTarget = { x: 0, y: 0 };
    const mouseSmooth = { x: 0, y: 0 };
    let strengthTarget = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const aspect = rect.width / rect.height;
      mouseTarget.x = (nx - 0.5) * aspect * 2.0;
      mouseTarget.y = -(ny - 0.5) * 2.0;
      strengthTarget = 1.0;
    };
    const onMouseLeave = () => {
      strengthTarget = 0;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseout", onMouseLeave);

    let raf = 0;
    let strength = 0;
    const start = performance.now();
    let last = start;

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // ease mouse + strength
      mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * Math.min(1, dt * 6);
      mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * Math.min(1, dt * 6);
      strength += (strengthTarget - strength) * Math.min(1, dt * 2.5);

      program.uniforms.uTime.value = (now - start) / 1000;
      program.uniforms.uMouse.value.set(mouseSmooth.x, mouseSmooth.y);
      program.uniforms.uMouseStrength.value = strength;

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseLeave);
      gl.canvas.parentElement?.removeChild(gl.canvas);
      const lose = gl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: "#050505" }}
    />
  );
};
