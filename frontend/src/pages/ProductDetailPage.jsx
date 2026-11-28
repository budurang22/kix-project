import { useCallback } from 'react';
import { useSampleCommerce } from '../hooks/use-sample-commerce.js';
import { Link, useParams } from 'react-router';
import { getProduct } from '../api/products-api.js';
import { useResource } from '../hooks/use-resource.js';
import { Loading, ErrorState } from '../components/Feedback.jsx';
import ProductImage from '../features/products/ProductImage.jsx';
import LikeButton from '../features/engagement/LikeButton.jsx';
import ProductReviews from '../features/engagement/ProductReviews.jsx';
import ProductOptions from '../features/products/ProductOptions.jsx';
export default function ProductDetailPage() {
  const { id } = useParams();
  return <ProductDetail key={id} id={id} />;
}
function ProductDetail({ id }) {
  const load = useCallback(() => getProduct(id), [id]);
  const { data, error, retry } = useResource(load);
  const { applyInventory } = useSampleCommerce();
  const product = data ? applyInventory(data) : null;
  if (error)
    return (
      <>
        <ErrorState
          message={error.message}
          onRetry={
            error.status === 404 || error.code === 'INVALID_PRODUCT_ID'
              ? undefined
              : retry
          }
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
        {product.source === 'api'
          ? '상품 정보 · 주문·좋아요·리뷰는 준비 중입니다.'
          : 'MOCK · 가격·재고는 샘플이며 구매할 수 없습니다.'}
      </p>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductImage name={product.name} imageUrl={product.imageUrl} />
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
          {product.source !== 'api' && <LikeButton product={product} />}
          <ProductOptions product={product} />
          {product.source === 'api' ? (
            <p className="mt-10 border-t border-primary/15 pt-6 text-sm text-secondary">
              상품 리뷰는 준비 중입니다.
            </p>
          ) : (
            <ProductReviews product={product} />
          )}
        </section>
      </div>
    </>
  );
}
