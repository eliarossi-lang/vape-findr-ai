import { useEffect, useState } from "react";
import { detectPerformance, type PerfTier } from "@/lib/detectPerformance";
import { SmokeBackgroundCSS } from "./SmokeBackgroundCSS";
import LiquidEther from "./LiquidEther.jsx";

export const SmokeBackground = () => {
  const [tier, setTier] = useState<PerfTier | null>(null);

  useEffect(() => {
    // Defer detection to idle so initial paint isn't blocked
    const run = () => setTier(detectPerformance());
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(run, { timeout: 500 });
    } else {
      setTimeout(run, 0);
    }
  }, []);

  // Until detection finishes, render the cheap CSS background to avoid
  // booting WebGL on low-end devices.
  if (tier !== "webgl") {
    return <SmokeBackgroundCSS />;
  }

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "#050505" }}
    >
      <LiquidEther
        colors={["#5227FF", "#FF9FFC", "#B497CF"]}
        mouseForce={20}
        cursorSize={100}
        isViscous
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
