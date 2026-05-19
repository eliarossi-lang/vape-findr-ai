import { useEffect, useState } from "react";
import { detectPerformance, type PerfTier } from "@/lib/detectPerformance";
import { SmokeBackgroundCSS } from "./SmokeBackgroundCSS";
import { SmokeBackgroundWebGL } from "./SmokeBackgroundWebGL";

export const SmokeBackground = () => {
  const [tier, setTier] = useState<PerfTier | null>(null);

  useEffect(() => {
    setTier(detectPerformance());
  }, []);

  if (tier === null) return null;
  return tier === "webgl" ? <SmokeBackgroundWebGL /> : <SmokeBackgroundCSS />;
};
