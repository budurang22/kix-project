import { useCallback } from 'react';
import { Link } from 'react-router';
import { listProducts, productBrands } from '../../api/products-api.js';
import { useResource } from '../../hooks/use-resource.js';
import { Loading, ErrorState } from '../../components/Feedback.jsx';
import ProductCard from './ProductCard.jsx';
export default function HomeProducts() {
  const load = useCallback(() => listProducts({ size: 4 }), []);
  const { data, error, retry } = useResource(load);
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-black">브랜드로 탐색</h2>
      <div className="my-6 flex flex-wrap gap-3">
        {productBrands.map((brand) => (
          <Link
            key={brand}
            to={`/products?brand=${encodeURIComponent(brand)}`}
            className="border border-primary/20 px-5 py-3 text-sm font-bold"
          >
            {brand}
          </Link>
        ))}
      </div>
      <div className="mb-6 mt-12 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-black">상품 미리보기</h2>
        <span className="text-xs text-secondary">
          MOCK · 가상 상품 / 구매 불가
        </span>
      </div>
      {error ? (
        <ErrorState message={error.message} onRetry={retry} />
      ) : !data ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {data.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
