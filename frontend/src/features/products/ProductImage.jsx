export default function ProductImage({ name, className = '' }) {
  return (
    <div
      className={`flex aspect-square items-center justify-center bg-surface ${className}`}
      role="img"
      aria-label={`${name} 이미지 준비 중`}
    >
      <div className="text-center text-secondary">
        <span
          aria-hidden="true"
          className="block text-4xl font-black italic tracking-tighter opacity-30"
        >
          KIX.
        </span>
        <span className="mt-3 block text-[10px] tracking-[0.15em]">
          IMAGE COMING SOON
        </span>
      </div>
    </div>
  );
}
