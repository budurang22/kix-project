import { Link, useLocation, useParams } from 'react-router';
import { useSampleCommerce } from '../hooks/use-sample-commerce.js';
import OrderSummary from '../features/orders/OrderSummary.jsx';
import { EmptyState } from '../components/Feedback.jsx';
export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { orders } = useSampleCommerce();
  const order = orders.find((item) => item.id === id);
  return (
    <section className="mx-auto max-w-xl">
      <h1 className="mb-6 text-3xl font-black">
        {order && location.state?.completed
          ? '샘플 체험 완료'
          : '샘플 주문 상세'}
      </h1>
      {order ? (
        <>
          <p role="status" className="mb-6 leading-relaxed text-secondary">
            MOCK · 실제 주문·결제·배송은 발생하지 않았습니다.
          </p>
          <p className="mb-3 break-all text-sm">샘플 번호: {order.id}</p>
          <OrderSummary order={order} />
          <Link
            to={`/products/${order.productId}#sample-reviews`}
            className="mt-6 inline-block text-sm underline"
          >
            이 상품의 샘플 리뷰 작성·수정
          </Link>
        </>
      ) : (
        <EmptyState>
          샘플 내역이 없거나 현재 로그인 세션에서 확인할 수 없습니다.
        </EmptyState>
      )}
      <Link
        to="/my"
        className="mt-8 inline-block bg-accent px-5 py-3 font-bold"
      >
        마이페이지로
      </Link>
    </section>
  );
}
