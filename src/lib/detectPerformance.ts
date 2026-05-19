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

  // Hardware heuristics
  const cores = navigator.hardwareConcurrency ?? 4;
  // @ts-expect-error non-standard
  const mem = navigator.deviceMemory as number | undefined;
  if (cores < 4) return "css";
  if (mem !== undefined && mem < 4) return "css";

  // WebGL availability
  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl");
    if (!gl) return "css";
  } catch {
    return "css";
  }

  return "webgl";
}
