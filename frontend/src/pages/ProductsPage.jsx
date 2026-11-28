import { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { listProducts, productBrands } from '../api/products-api.js';
import { useResource } from '../hooks/use-resource.js';
import { parseProductPage } from '../utils/product-selection.js';
import { Loading, EmptyState, ErrorState } from '../components/Feedback.jsx';
import Pagination from '../components/Pagination.jsx';
import ProductCard from '../features/products/ProductCard.jsx';
export default function ProductsPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const brand = params.get('brand') || '';
  const page = parseProductPage(params.get('page'));
  return (
    <ProductResults
      key={JSON.stringify([query, brand, page])}
      query={query}
      brand={brand}
      page={page}
    />
  );
}
function ProductResults({ query, brand, page }) {
  const [, setParams] = useSearchParams();
  const load = useCallback(
    () => listProducts({ query, brand, page }),
    [query, brand, page],
  );
  const { data, error, retry } = useResource(load);
  function handleFilter(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setParams({ q: fields.get('q').trim(), brand: fields.get('brand') });
  }
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs tracking-widest text-secondary">
            FIND YOUR NEXT PAIR
          </p>
          <h1 className="text-3xl font-black">상품 탐색</h1>
        </div>
        <p className="text-sm text-secondary">MOCK · 샘플 데이터 / 구매 불가</p>
      </div>
      <form
        onSubmit={handleFilter}
        className="mb-8 flex flex-wrap items-end gap-3 border-y border-primary/15 py-5"
      >
        <label className="min-w-40 flex-1 text-sm">
          상품명 검색
          <input
            name="q"
            defaultValue={query}
            maxLength={100}
            className="mt-2 block w-full border border-primary/20 px-3 py-3"
            placeholder="상품명 또는 브랜드"
          />
        </label>
        <label className="text-sm">
          브랜드
          <select
            aria-label="브랜드"
            name="brand"
            defaultValue={brand}
            className="mt-2 block min-h-12 border border-primary/20 bg-background px-3"
          >
            {' '}
            <option value="">전체 브랜드</option>
            {productBrands.map((item) => (
              <option key={item}>{item}</option>
            ))}
            {brand && !productBrands.includes(brand) && (
              <option value={brand}>알 수 없는 브랜드</option>
            )}
          </select>
        </label>
        <button className="min-h-12 bg-accent px-6 font-bold" type="submit">
          검색 적용
        </button>
        <Link to="/products" className="px-3 py-3 text-sm underline">
          초기화
        </Link>
      </form>
      {error ? (
        <ErrorState message={error.message} onRetry={retry} />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          <p role="status" className="mb-6 text-sm text-secondary">
            총 {data.total}개{query ? ` · “${query}” 검색 결과` : ''}
          </p>
          {data.items.length ? (
            <div className="mb-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState>
              검색 결과가 없습니다. 검색어나 브랜드를 변경해 주세요.
            </EmptyState>
          )}
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(next) =>
              setParams({ q: query, brand, page: String(next) })
            }
          />
        </>
      )}
    </>
  );
}
