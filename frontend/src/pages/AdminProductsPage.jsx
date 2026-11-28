import { useCallback, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { useSampleAdmin } from '../hooks/use-sample-admin.js';
import { useResource } from '../hooks/use-resource.js';
import { usePendingAction } from '../hooks/use-pending-action.js';
import { parseProductPage } from '../utils/product-selection.js';
import { Loading, EmptyState, ErrorState } from '../components/Feedback.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';
export default function AdminProductsPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const status = params.get('status') || '';
  const page = parseProductPage(params.get('page'));
  return (
    <AdminResults
      key={JSON.stringify([query, status, page])}
      query={query}
      status={status}
      page={page}
    />
  );
}
function AdminResults({ query, status, page }) {
  const service = useSampleAdmin();
  const location = useLocation();
  const [, setParams] = useSearchParams();
  const load = useCallback(
    () => service.list({ query, status, page }),
    [service, query, status, page],
  );
  const { data, error, retry } = useResource(load);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState(location.state?.message || '');
  const { run, isPending, error: deleteError } = usePendingAction();
  function handleFilter(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setParams({ q: values.get('q').trim(), status: values.get('status') });
  }
  async function handleDelete() {
    const result = await run(() => service.remove(selected.id));
    if (result) {
      setSelected(null);
      setMessage('샘플 상품을 논리 삭제했습니다.');
      retry();
    }
  }
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-black">관리자 샘플 상품</h1>
        <Link
          to="/admin/products/new"
          className="bg-accent px-5 py-3 font-bold"
        >
          샘플 상품 등록
        </Link>
      </div>
      <form
        onSubmit={handleFilter}
        className="mb-6 flex flex-wrap items-end gap-3"
      >
        <label className="min-w-40 flex-1 text-sm">
          관리자 상품 검색
          <input
            name="q"
            defaultValue={query}
            maxLength={255}
            className="mt-2 block w-full border border-primary/20 px-3 py-3"
          />
        </label>
        <label className="text-sm">
          판매 상태
          <select
            aria-label="판매 상태 필터"
            name="status"
            defaultValue={status}
            className="mt-2 block min-h-12 border border-primary/20 bg-background px-3"
          >
            <option value="">전체</option>
            <option value="ON_SALE">판매 중</option>
            <option value="STOPPED">판매 중지</option>
            {status && !['ON_SALE', 'STOPPED'].includes(status) && (
              <option value={status}>알 수 없는 상태</option>
            )}
          </select>
        </label>
        <Button type="submit">필터 적용</Button>
        <Link to="/admin" className="px-3 py-3 text-sm underline">
          초기화
        </Link>
      </form>
      {message && (
        <p role="status" className="my-4">
          {message}
        </p>
      )}
      {error ? (
        <ErrorState message={error.message} onRetry={retry} />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          <p role="status" className="mb-4 text-sm text-secondary">
            샘플 상품 {data.total}개
          </p>
          {!data.items.length ? (
            <EmptyState>조건에 맞는 샘플 상품이 없습니다.</EmptyState>
          ) : (
            <ul className="mb-8 divide-y divide-primary/15 border-y border-primary/15">
              {data.items.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-5 py-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-secondary">
                      {product.brand} ·{' '}
                      {product.status === 'ON_SALE' ? '판매 중' : '판매 중지'}
                    </p>
                    <h2 className="mt-2 break-words font-bold">
                      {product.name}
                    </h2>
                    <p className="mt-2 text-sm">
                      {product.price.toLocaleString('ko-KR')}원 · 옵션{' '}
                      {product.options.length}개 · 총 재고{' '}
                      {product.options.reduce(
                        (total, option) => total + option.stock,
                        0,
                      )}
                      개
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      aria-label={`${product.name} 수정`}
                      className="border border-primary px-4 py-3 text-sm"
                    >
                      수정
                    </Link>
                    <Button
                      variant="secondary"
                      aria-label={`${product.name} 삭제`}
                      onClick={() => setSelected(product)}
                    >
                      삭제
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(next) =>
              setParams({ q: query, status, page: String(next) })
            }
          />
        </>
      )}
      <Modal
        isOpen={!!selected}
        title="샘플 상품 삭제 확인"
        onClose={() => {
          if (!isPending) setSelected(null);
        }}
      >
        <p className="break-words">{selected?.name}</p>
        <p className="mt-4 text-sm text-secondary">
          관리자 샘플 목록에서 논리 삭제합니다. 사용자용 샘플·서버 데이터는
          변경하지 않습니다.
        </p>
        {deleteError && (
          <p role="alert" className="mt-4 text-danger">
            {deleteError}
          </p>
        )}
        <Button className="mt-6" disabled={isPending} onClick={handleDelete}>
          {isPending ? '처리 중…' : '샘플 삭제 확인'}
        </Button>
      </Modal>
    </>
  );
}
