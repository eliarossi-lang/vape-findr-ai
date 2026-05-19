import LiquidEther from "./LiquidEther.jsx";

export const SmokeBackground = () => {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: "#050505" }}
    >
      <LiquidEther
        colors={["#9d64ff", "#ffffff", "#00cff3"]}
        mouseForce={34}
        cursorSize={120}
        isViscous={false}
        resolution={0.5}
        autoDemo
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
        style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
      />
    </div>
  );
};
