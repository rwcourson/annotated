/**
 * Optional warm pastel wash for quiet secondary surfaces.
 */
export default function PastelWash() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -top-[30%] left-[-10%] h-[60vmax] w-[60vmax] animate-wash-drift rounded-full opacity-[0.13] blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, #c8b5ff 0%, #eee8ff 45%, transparent 72%)",
        }}
      />
      <div
        className="absolute -bottom-[35%] right-[-12%] h-[55vmax] w-[55vmax] rounded-full opacity-[0.11] blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 60% 60%, #fdba74 0%, #fed7aa 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute left-[35%] top-[30%] h-[40vmax] w-[40vmax] rounded-full opacity-[0.07] blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #ffd66d 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
