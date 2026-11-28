import { useState } from 'react';
import { getProductImageSource } from '../../utils/product-image-source.js';
export default function ProductImage({ name, imageUrl, className = '' }) {
  const source = getProductImageSource(imageUrl);
  return (
    <div
      className={`flex aspect-square items-center justify-center overflow-hidden bg-surface ${className}`}
    >
      <ImageContent key={source} source={source} name={name} />
    </div>
  );
}
function ImageContent({ source, name }) {
  const [hasFailed, setHasFailed] = useState(false);
  if (source && !hasFailed)
    return (
      <img
        src={source}
        alt={name}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="h-full w-full object-contain"
        onError={() => setHasFailed(true)}
      />
    );
  return (
    <div
      role="img"
      aria-label={`${name} 이미지 준비 중`}
      className="text-center text-secondary"
    >
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
  );
}
