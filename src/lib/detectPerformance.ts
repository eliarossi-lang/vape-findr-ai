export type PerfTier = "webgl" | "css";

export function detectPerformance(): PerfTier {
  if (typeof window === "undefined") return "css";

  // Respect reduced motion
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return "css";
  }

  // Mobile / small viewport heuristic
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobileUA) return "css";
  if (window.innerWidth < 1024) return "css";

  // Hardware heuristics — be stricter to spare low-end PCs
  const cores = navigator.hardwareConcurrency ?? 4;
  // @ts-expect-error non-standard
  const mem = navigator.deviceMemory as number | undefined;
  if (cores < 6) return "css";
  if (mem !== undefined && mem < 6) return "css";

  // Save-Data / slow connection hint
  // @ts-expect-error non-standard
  const conn = navigator.connection as { saveData?: boolean; effectiveType?: string } | undefined;
  if (conn?.saveData) return "css";
  if (conn?.effectiveType && /(^|-)2g$|^3g$/.test(conn.effectiveType)) return "css";

  // WebGL availability + GPU sniff (software renderers = CSS)
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "css";
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    if (dbg) {
      const renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "").toLowerCase();
      if (/(swiftshader|llvmpipe|software|microsoft basic render)/.test(renderer)) {
        return "css";
      }
    }
  } catch {
    return "css";
  }

  return "webgl";
}
