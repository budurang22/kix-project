export default function OrderSummary({ order }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 border-y border-primary/15 py-6 text-sm">
      <dt className="text-secondary">상품</dt>
      <dd className="break-words font-bold">{order.productName}</dd>
      <dt className="text-secondary">브랜드</dt>
      <dd>{order.brand}</dd>
      <dt className="text-secondary">사이즈</dt>
      <dd>{order.sizeMm} mm</dd>
      <dt className="text-secondary">수량</dt>
      <dd>{order.quantity}개</dd>
      <dt className="text-secondary">단가</dt>
      <dd>{order.unitPrice.toLocaleString('ko-KR')}원</dd>
      <dt className="text-secondary">샘플 금액</dt>
      <dd className="text-lg font-bold">
        {order.totalPrice.toLocaleString('ko-KR')}원
      </dd>
    </dl>
  );
}
