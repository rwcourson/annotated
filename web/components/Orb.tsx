export default function Orb({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`relative inline-block shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #ff674d 0%, #ffb2a2 45%, #7a68ff 100%)",
        boxShadow: "inset 0 0 0 1px rgba(33,29,24,0.08), 0 5px 16px -8px rgba(102,69,255,.7)",
      }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          inset: "34%",
          background: "white",
        }}
      />
    </span>
  );
}
