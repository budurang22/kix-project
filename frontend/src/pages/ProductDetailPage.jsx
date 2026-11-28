import { useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { getProduct } from '../api/products-api.js';
import { useResource } from '../hooks/use-resource.js';
import { Loading, ErrorState } from '../components/Feedback.jsx';
import ProductImage from '../features/products/ProductImage.jsx';
import ProductOptions from '../features/products/ProductOptions.jsx';
export default function ProductDetailPage() {
  const { id } = useParams();
  return <ProductDetail key={id} id={id} />;
}
function ProductDetail({ id }) {
  const load = useCallback(() => getProduct(id), [id]);
  const { data: product, error, retry } = useResource(load);
  if (error)
    return (
      <>
        <ErrorState
          message={error.message}
          onRetry={error.status === 404 ? undefined : retry}
        />
        <Link to="/products" className="underline">
          상품 목록으로
        </Link>
      </>
    );
  if (!product) return <Loading />;
  return (
    <>
      <nav aria-label="현재 위치" className="mb-8 text-sm text-secondary">
        <Link to="/products" className="underline">
          상품 목록
        </Link>
        <span aria-hidden="true"> / </span>
        {product.brand}
      </nav>
      <p className="mb-5 text-sm text-secondary">
        MOCK · 가격·재고는 샘플이며 구매할 수 없습니다.
      </p>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductImage name={product.name} />
        <section>
          <p className="text-xs font-bold tracking-widest">{product.brand}</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-6 text-2xl font-bold">
            {product.price.toLocaleString('ko-KR')}원
          </p>
          <p className="mt-6 leading-relaxed text-secondary">
            {product.description}
          </p>
          <ProductOptions product={product} />
          <p className="mt-8 border-t border-primary/15 pt-5 text-sm text-secondary">
            좋아요와 상품 리뷰는 백엔드 API 준비 후 제공됩니다.
          </p>
        </section>
      </div>
    </>
  );
}
