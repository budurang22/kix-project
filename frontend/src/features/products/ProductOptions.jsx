import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/use-auth.js';
import { useSampleCommerce } from '../../hooks/use-sample-commerce.js';
import Button from '../../components/Button.jsx';
import {
  canSelectOption,
  clampQuantity,
  isProductAvailable,
} from '../../utils/product-selection.js';
export default function ProductOptions({ product }) {
  const isSample = product.source !== 'api';
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const { beginOrder } = useSampleCommerce();
  function handleSampleOrder() {
    if (
      !isSample ||
      !selected ||
      !canSelectOption(product, selected) ||
      quantity > selected.stock
    )
      return;
    if (!session) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (beginOrder(product, selected, quantity)) navigate('/orders/confirm');
  }
  const [optionId, setOptionId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const selected = product.options.find(
    (option) => option.id === optionId && canSelectOption(product, option),
  );
  const isAvailable = isProductAvailable(product);
  function handleSelect(option) {
    if (!canSelectOption(product, option)) return;
    setOptionId(option.id);
    setQuantity(1);
  }
  return (
    <div className="mt-10 space-y-6">
      {!isAvailable && (
        <p role="status" className="font-bold">
          {product.status === 'STOPPED'
            ? '판매가 중지된 상품입니다.'
            : '모든 사이즈가 품절되었습니다.'}
        </p>
      )}
      <fieldset>
        <legend className="mb-3 text-sm font-bold">사이즈 (mm)</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {product.options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={!canSelectOption(product, option)}
              aria-pressed={optionId === option.id}
              onClick={() => handleSelect(option)}
              className={`min-h-14 border px-2 py-2 text-sm disabled:cursor-not-allowed disabled:text-secondary ${optionId === option.id ? 'border-primary bg-accent' : 'border-primary/20 bg-background'}`}
            >
              <span className="block font-bold">{option.sizeMm}</span>
              <span className="text-xs">
                {product.status === 'STOPPED'
                  ? '판매 중지'
                  : option.stock
                    ? `${option.stock}개 남음`
                    : '품절'}
              </span>
            </button>
          ))}
        </div>
      </fieldset>
      {selected && (
        <div>
          <label className="text-sm font-bold" htmlFor="product-quantity">
            수량
          </label>
          <div className="mt-3 flex items-center gap-4">
            <Button
              variant="secondary"
              aria-label="수량 줄이기"
              disabled={quantity <= 1}
              onClick={() =>
                setQuantity((value) => clampQuantity(value - 1, selected.stock))
              }
            >
              −
            </Button>
            <output
              id="product-quantity"
              aria-live="polite"
              aria-label="선택 수량"
            >
              {quantity}
            </output>
            <Button
              variant="secondary"
              aria-label="수량 늘리기"
              disabled={quantity >= selected.stock}
              onClick={() =>
                setQuantity((value) => clampQuantity(value + 1, selected.stock))
              }
            >
              +
            </Button>
          </div>
          <p role="status" className="mt-4 text-sm">
            선택: {selected.sizeMm} mm · {quantity}개
          </p>
          <p className="mt-3 font-bold">
            {isSample ? '샘플 예상 금액 ' : '예상 금액 '}
            {(product.price * quantity).toLocaleString('ko-KR')}원
          </p>
        </div>
      )}
      <Button
        className="w-full"
        disabled={
          !isSample ||
          !selected ||
          !canSelectOption(product, selected) ||
          quantity > selected.stock
        }
        onClick={handleSampleOrder}
        aria-describedby="purchase-unavailable"
      >
        {isSample ? '샘플 주문 확인' : '주문 준비 중'}
      </Button>
      <p
        id="purchase-unavailable"
        className="text-sm leading-relaxed text-secondary"
      >
        {isSample
          ? '샘플 주문 체험만 가능합니다. 실제 주문·결제·배송은 발생하지 않습니다. 로그인이 필요하며 샘플 내역은 새로고침 시 사라집니다.'
          : '주문 기능은 준비 중입니다. 표시 금액은 선택한 상품의 예상 금액이며 실제 주문은 진행되지 않습니다.'}
      </p>
    </div>
  );
}
