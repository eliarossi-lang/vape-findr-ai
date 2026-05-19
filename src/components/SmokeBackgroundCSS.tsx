export const SmokeBackgroundCSS = () => {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{ background: "#050505" }}
    >
      <div className="smoke-blob smoke-blob-a" />
      <div className="smoke-blob smoke-blob-b" />
      <div className="smoke-blob smoke-blob-c" />
      <div className="smoke-noise" />
    </div>
  );
};
