import { mockBrands } from '../api/mocks/products.js';
const MAX_INT = 2147483647;
function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}
function integer(value, min, max, label) {
  if (String(value ?? '').trim() === '') invalid(`${label}을 입력해 주세요.`);
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max)
    invalid(`${label}은 ${min}~${max} 범위의 정수여야 합니다.`);
  return number;
}
// Sample form rules; not a confirmed admin API request DTO.
export function validateSampleProduct(input) {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name || name.length > 255)
    invalid('상품명은 앞뒤 공백을 제외한 1~255자여야 합니다.');
  if (!mockBrands.includes(input.brand))
    invalid('샘플 브랜드를 선택해 주세요.');
  if (!['ON_SALE', 'STOPPED'].includes(input.status))
    invalid('판매 상태를 확인해 주세요.');
  if (!Array.isArray(input.options) || !input.options.length)
    invalid('샘플 상품에는 사이즈 옵션이 최소 1개 필요합니다.');
  const sizes = new Set();
  const options = input.options.map((option) => {
    const sizeMm = integer(option.sizeMm, 150, 350, '사이즈');
    if (sizes.has(sizeMm)) invalid('같은 사이즈를 중복 등록할 수 없습니다.');
    sizes.add(sizeMm);
    return {
      id: option.id,
      sizeMm,
      stock: integer(option.stock, 0, MAX_INT, '재고'),
    };
  });
  return {
    name,
    brand: input.brand,
    price: integer(input.price, 1, MAX_INT, '가격'),
    description: String(input.description || '').trim(),
    status: input.status,
    options,
  };
}
