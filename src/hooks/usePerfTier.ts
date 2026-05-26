import { useEffect, useState } from "react";
import { detectPerformance, type PerfTier } from "@/lib/detectPerformance";

export function usePerfTier(): PerfTier {
  // Start pessimistic so first render is cheap.
  const [tier, setTier] = useState<PerfTier>("css");
  useEffect(() => {
    const run = () => setTier(detectPerformance());
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(run, { timeout: 500 });
    } else {
      setTimeout(run, 0);
    }
  }, []);
  return tier;
}
