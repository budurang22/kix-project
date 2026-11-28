import { useCallback } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useSampleAdmin } from '../hooks/use-sample-admin.js';
import { useResource } from '../hooks/use-resource.js';
import { Loading, ErrorState } from '../components/Feedback.jsx';
import ProductForm from '../features/admin/ProductForm.jsx';
export default function AdminProductEditorPage() {
  const { id } = useParams();
  return id ? <EditProduct key={id} id={id} /> : <NewProduct />;
}
function NewProduct() {
  const service = useSampleAdmin();
  const navigate = useNavigate();
  return (
    <>
      <h1 className="mb-8 text-3xl font-black">샘플 상품 등록</h1>
      <ProductForm
        onSave={(input) => service.save(input)}
        onSaved={(product) =>
          navigate(`/admin/products/${product.id}/edit`, {
            replace: true,
            state: { saved: true },
          })
        }
      />
    </>
  );
}
function EditProduct({ id }) {
  const location = useLocation();
  const service = useSampleAdmin();
  const navigate = useNavigate();
  const load = useCallback(() => service.get(id), [service, id]);
  const { data, error, retry } = useResource(load);
  if (error)
    return (
      <>
        <ErrorState
          message={error.message}
          onRetry={error.status === 404 ? undefined : retry}
        />
        <Link to="/admin" className="underline">
          관리자 목록으로
        </Link>
      </>
    );
  if (!data) return <Loading />;
  return (
    <>
      <h1 className="mb-8 text-3xl font-black">샘플 상품 수정</h1>
      {location.state?.saved && (
        <p role="status" className="mb-6">
          샘플 상품을 등록했습니다.
        </p>
      )}
      <ProductForm
        product={data}
        onSave={(input) => service.save(input, id)}
        onSaved={() =>
          navigate('/admin', {
            state: { message: '샘플 상품을 수정했습니다.' },
          })
        }
      />
    </>
  );
}
