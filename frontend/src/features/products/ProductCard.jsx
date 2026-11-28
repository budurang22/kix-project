import { Link } from 'react-router';
import { useSampleCommerce } from '../../hooks/use-sample-commerce.js';
import { isProductAvailable } from '../../utils/product-selection.js';
import LikeButton from '../engagement/LikeButton.jsx';
import ProductImage from './ProductImage.jsx';
export default function ProductCard({ product: source }) {
  const { applyInventory } = useSampleCommerce();
  const product = applyInventory(source);
  const isAvailable = isProductAvailable(product);
  return (
    <article className="min-w-0">
      <CardContent product={product}>
        <div className="relative">
          <ProductImage name={product.name} imageUrl={product.imageUrl} />
          {!isAvailable && (
            <span className="absolute bottom-3 left-3 bg-primary px-3 py-1 text-xs text-background">
              {product.status === 'STOPPED' ? '판매 중지' : '품절'}
            </span>
          )}
        </div>
        <p className="mt-4 text-xs font-bold tracking-wide">{product.brand}</p>
        <h2 className="mt-2 text-sm group-hover:underline">{product.name}</h2>
        <p className="mt-3 font-bold">
          {product.price.toLocaleString('ko-KR')}원
        </p>
      </CardContent>
      {product.source !== 'api' && <LikeButton product={product} />}
    </article>
  );
}

function CardContent({ product, children }) {
  return (
    <Link to={`/products/${product.id}`} className="group block">
      {children}
    </Link>
  );
}
