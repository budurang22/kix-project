import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSampleCommerce } from '../hooks/use-sample-commerce.js';
import OrderSummary from '../features/orders/OrderSummary.jsx';
import Button from '../components/Button.jsx';
import { EmptyState } from '../components/Feedback.jsx';
export default function OrderConfirmPage() {
  const { draft, submitOrder } = useSampleCommerce();
  const navigate = useNavigate();
  const lock = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [hasAgreed, setHasAgreed] = useState(false);
  if (!draft)
    return (
      <>
        <h1 className="mb-6 text-3xl font-black">샘플 주문 확인</h1>
        <EmptyState>
          선택한 상품이 없거나 샘플 세션이 초기화되었습니다.
        </EmptyState>
        <Link className="mt-6 inline-block underline" to="/products">
          상품 선택으로
        </Link>
      </>
    );
  const { product, option, quantity } = draft;
  async function handleSubmit(event) {
    event.preventDefault();
    if (lock.current || !hasAgreed || error?.status === 409) return;
    lock.current = true;
    setIsPending(true);
    setError(null);
    try {
      const order = await submitOrder();
      if (active.current)
        navigate(`/orders/sample/${order.id}`, {
          replace: true,
          state: { completed: true },
        });
    } catch (failure) {
      if (active.current) setError(failure);
    } finally {
      lock.current = false;
      if (active.current) setIsPending(false);
    }
  }
  return (
    <section className="mx-auto max-w-xl">
      <p className="mb-3 text-xs tracking-widest text-secondary">
        SAMPLE CHECKOUT
      </p>
      <h1 className="mb-6 text-3xl font-black">샘플 주문 확인</h1>
      <p className="mb-8 leading-relaxed text-secondary">
        MOCK 체험입니다. 서버에 주문하지 않으며 실제 결제·배송은 발생하지
        않습니다. 로그아웃·새로고침하면 샘플 내역이 사라집니다.
      </p>
      <OrderSummary
        order={{
          productName: product.name,
          brand: product.brand,
          sizeMm: option.sizeMm,
          quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity,
        }}
      />
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6"
        aria-busy={isPending}
      >
        <label className="flex items-start gap-3 text-sm">
          <input
            className="mt-1 size-4 accent-primary"
            type="checkbox"
            checked={hasAgreed}
            disabled={isPending}
            onChange={(event) => setHasAgreed(event.target.checked)}
          />
          실제 주문이 아닌 샘플 체험임을 확인했습니다.
        </label>
        {error && (
          <p role="alert" className="text-danger">
            {error.message}
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={!hasAgreed || isPending || error?.status === 409}
        >
          {isPending
            ? '샘플 처리 중…'
            : error
              ? '동일한 샘플 요청 재시도'
              : '샘플 주문 체험'}
        </Button>
        <Link
          to={`/products/${product.id}`}
          className={`inline-block text-sm underline ${isPending ? 'pointer-events-none' : ''}`}
          aria-disabled={isPending}
        >
          상품·옵션 다시 선택
        </Link>
      </form>
      <p className="mt-6 text-xs leading-relaxed text-secondary">
        표시 금액은 가상 데이터입니다. 실제 주문 연동 시 최종 금액·재고는 서버
        응답을 따릅니다.
      </p>
    </section>
  );
}
