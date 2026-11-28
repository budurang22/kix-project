import { useState } from 'react';
import { Link } from 'react-router';
import { productBrands } from '../../api/products-api.js';
import { usePendingAction } from '../../hooks/use-pending-action.js';
import Button from '../../components/Button.jsx';
import InputField from '../../components/InputField.jsx';
export default function ProductForm({ product, onSave, onSaved }) {
  const [options, setOptions] = useState(() =>
    (product?.options || [{ sizeMm: '', stock: '0' }]).map((option) => ({
      ...option,
      clientId: crypto.randomUUID(),
    })),
  );
  const { run, isPending, error } = usePendingAction();
  function handleOptionChange(clientId, field, value) {
    setOptions((items) =>
      items.map((item) =>
        item.clientId === clientId ? { ...item, [field]: value } : item,
      ),
    );
  }
  async function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const result = await run(() => onSave({ ...values, options }));
    if (result) onSaved(result);
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6"
      aria-label="관리자 샘플 상품 양식"
      aria-busy={isPending}
    >
      <fieldset disabled={isPending} className="space-y-6">
        <legend className="sr-only">상품 기본 정보와 사이즈 옵션</legend>
        <InputField
          label="상품명"
          name="name"
          defaultValue={product?.name || ''}
          required
          maxLength={255}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            브랜드
            <select
              aria-label="상품 브랜드"
              name="brand"
              defaultValue={product?.brand || productBrands[0]}
              className="mt-2 block min-h-12 w-full border border-primary/20 bg-background px-3"
            >
              {productBrands.map((brand) => (
                <option key={brand}>{brand}</option>
              ))}
            </select>
          </label>
          <InputField
            label="가격 (원)"
            name="price"
            type="number"
            required
            min={1}
            max={2147483647}
            step={1}
            defaultValue={product?.price || ''}
          />
        </div>
        <label className="block text-sm font-bold">
          판매 상태
          <select
            aria-label="상품 판매 상태"
            name="status"
            defaultValue={product?.status || 'ON_SALE'}
            className="mt-2 block min-h-12 w-full border border-primary/20 bg-background px-3"
          >
            <option value="ON_SALE">판매 중</option>
            <option value="STOPPED">판매 중지</option>
          </select>
        </label>
        <label className="block text-sm font-bold">
          설명
          <textarea
            name="description"
            defaultValue={product?.description || ''}
            className="mt-2 min-h-28 w-full resize-y border border-primary/20 p-3"
          />
        </label>
        <section>
          <h2 className="text-xl font-bold">사이즈별 샘플 재고</h2>
          <p className="my-4 text-sm text-secondary">
            사이즈 150~350 mm · 재고는 0 이상의 정수 · 중복 사이즈 불가
          </p>
          <div className="space-y-4">
            {options.map((option, index) => (
              <div
                key={option.clientId}
                className="grid grid-cols-2 items-end gap-3 border border-primary/15 p-4 sm:grid-cols-[1fr_1fr_auto]"
              >
                <InputField
                  label={`사이즈 (mm) 옵션 ${index + 1}`}
                  type="number"
                  min={150}
                  max={350}
                  step={1}
                  required
                  value={option.sizeMm}
                  onChange={(event) =>
                    handleOptionChange(
                      option.clientId,
                      'sizeMm',
                      event.target.value,
                    )
                  }
                />
                <InputField
                  label={`재고 옵션 ${index + 1}`}
                  type="number"
                  min={0}
                  max={2147483647}
                  step={1}
                  required
                  value={option.stock}
                  onChange={(event) =>
                    handleOptionChange(
                      option.clientId,
                      'stock',
                      event.target.value,
                    )
                  }
                />
                <Button
                  variant="secondary"
                  aria-label={`옵션 ${index + 1} 제거`}
                  disabled={options.length <= 1}
                  onClick={() =>
                    setOptions((items) =>
                      items.filter((item) => item.clientId !== option.clientId),
                    )
                  }
                >
                  옵션 제거
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() =>
              setOptions((items) => [
                ...items,
                { clientId: crypto.randomUUID(), sizeMm: '', stock: '0' },
              ])
            }
          >
            사이즈 옵션 추가
          </Button>
        </section>
      </fieldset>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? '저장 중…'
            : product
              ? '샘플 수정 저장'
              : '샘플 등록 저장'}
        </Button>
        <Link to="/admin" className="px-4 py-3 text-sm underline">
          목록으로
        </Link>
      </div>
      <p className="text-sm text-secondary">
        이미지 업로드는 제공하지 않습니다. 저장은 관리자 체험 메모리에만
        반영됩니다.
      </p>
    </form>
  );
}
