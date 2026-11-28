import { useState } from 'react';
import Button from '../../components/Button.jsx';
import {
  canSelectOption,
  clampQuantity,
  isProductAvailable,
} from '../../utils/product-selection.js';
export default function ProductOptions({ product }) {
  const [optionId, setOptionId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const selected = product.options.find((option) => option.id === optionId);
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
            샘플 예상 금액 {(product.price * quantity).toLocaleString('ko-KR')}
            원
          </p>
        </div>
      )}
      <Button
        className="w-full"
        disabled
        aria-describedby="purchase-unavailable"
      >
        구매 준비 중
      </Button>
      <p
        id="purchase-unavailable"
        className="text-sm leading-relaxed text-secondary"
      >
        현재 상품은 샘플입니다. 실제 주문 기능과 최종 금액은 백엔드 연동 후
        제공됩니다.
      </p>
    </div>
  );
}
