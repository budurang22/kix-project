import AccountEngagement from '../features/engagement/AccountEngagement.jsx';
import { Link } from 'react-router';
import { useAuth } from '../hooks/use-auth.js';
import { useSampleCommerce } from '../hooks/use-sample-commerce.js';
import { EmptyState } from '../components/Feedback.jsx';
export default function AccountPage() {
  const { session } = useAuth();
  const { orders } = useSampleCommerce();
  return (
    <>
      <h1 className="mb-8 text-3xl font-black">마이페이지</h1>
      <section className="bg-surface p-6">
        <h2 className="mb-4 font-bold">회원 정보</h2>
        <p>회원 번호: {session.member.id}</p>
        <p className="mt-2 text-sm text-secondary">
          권한: {session.member.role}
        </p>
      </section>
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold">샘플 주문 내역</h2>
        <p className="mb-6 text-sm leading-relaxed text-secondary">
          MOCK · 실제 주문 내역이 아닙니다. 현재 로그인 세션에서 체험한 내역만
          표시하며 로그아웃·새로고침 시 초기화됩니다.
        </p>
        {orders.length ? (
          <ul className="divide-y divide-primary/15 border-y border-primary/15">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/sample/${order.id}`}
                  className="flex flex-wrap justify-between gap-4 py-6"
                >
                  <div>
                    <p className="text-xs text-secondary">{order.id}</p>
                    <h3 className="mt-2 font-bold">{order.productName}</h3>
                    <p className="mt-2 text-sm text-secondary">
                      {order.sizeMm} mm · {order.quantity}개
                    </p>
                  </div>
                  <span className="font-bold">
                    {order.totalPrice.toLocaleString('ko-KR')}원 →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>체험한 샘플 주문이 없습니다.</EmptyState>
        )}
        <Link to="/products" className="mt-6 inline-block text-sm underline">
          상품 탐색
        </Link>
      </section>
      <AccountEngagement />
      <p className="mt-12 border-t border-primary/15 pt-6 text-sm text-secondary">
        실제 주문 내역·좋아요·리뷰는 API 준비 후 제공됩니다.
      </p>
    </>
  );
}
