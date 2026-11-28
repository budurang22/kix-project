import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { listMockProducts } from '../api/mocks/products.js';
import { Loading, EmptyState, ErrorState } from '../components/Feedback.jsx';
import Pagination from '../components/Pagination.jsx';
export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const page = Math.max(0, Number(params.get('page')) || 0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    listMockProducts({ query, page })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch(() => {
        if (active) setError('샘플을 불러오지 못했습니다.');
      });
    return () => {
      active = false;
    };
  }, [query, page]);
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-black">상품 탐색</h1>
        <p className="text-sm text-secondary">MOCK · 샘플 데이터 / 구매 불가</p>
      </div>
      {query && <p className="mb-6">검색: {query}</p>}
      {error ? (
        <ErrorState message={error} />
      ) : !result ? (
        <Loading />
      ) : !result.items.length ? (
        <EmptyState>검색 결과가 없습니다.</EmptyState>
      ) : (
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((product) => (
            <article key={product.id}>
              <div
                className="flex aspect-square items-center justify-center bg-surface text-xs text-secondary"
                role="img"
                aria-label="상품 이미지 준비 중"
              >
                IMAGE COMING SOON
              </div>
              <p className="mt-4 text-xs font-bold">{product.brand}</p>
              <h2 className="my-2 text-sm">{product.name}</h2>
              <p className="font-bold">
                {product.price.toLocaleString('ko-KR')}원
              </p>
            </article>
          ))}
        </div>
      )}
      {result && (
        <Pagination
          page={page}
          totalPages={result.totalPages}
          onPageChange={(next) => setParams({ q: query, page: String(next) })}
        />
      )}
    </>
  );
}
