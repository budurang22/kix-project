// Maps locally observed Java records. Recheck fields when the backend contract changes.
// ProductOptionResponse currently spells the JSON field sizeMn; keep mapping aligned if renamed.
function invalid() {
  const error = new Error(
    '상품 응답 형식을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  );
  error.code = 'INVALID_PRODUCT_RESPONSE';
  throw error;
}
function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  return value;
}
function integer(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < min || value > max) invalid();
  return value;
}
function id(value) {
  if (typeof value === 'number') return String(integer(value, 1));
  if (typeof value === 'string' && /^[1-9][0-9]*$/.test(value)) return value;
  invalid();
}
function text(value) {
  if (typeof value !== 'string' || !value.trim()) invalid();
  return value;
}
export function mapProductSummary(value) {
  const dto = object(value);
  if (
    !['ON_SALE', 'STOPPED'].includes(dto.status) ||
    typeof dto.soldOut !== 'boolean'
  )
    invalid();
  if (dto.imageUrl != null && typeof dto.imageUrl !== 'string') invalid();
  return {
    source: 'api',
    id: id(dto.id),
    brandId: id(dto.brandId),
    brand: text(dto.brandName),
    name: text(dto.name),
    price: integer(dto.price, 1, 2147483647),
    imageUrl: dto.imageUrl ?? null,
    status: dto.status,
    soldOut: dto.soldOut,
  };
}
export function mapProductDetail(value) {
  const summary = mapProductSummary(value);
  if (
    !Array.isArray(value.options) ||
    (value.description != null && typeof value.description !== 'string')
  )
    invalid();
  const sizes = new Set();
  const ids = new Set();
  const options = value.options.map((value) => {
    const dto = object(value);
    const option = {
      id: id(dto.id),
      sizeMm: integer(dto.sizeMn, 150, 350),
      stock: integer(dto.stock, 0, 2147483647),
    };
    if (sizes.has(option.sizeMm) || ids.has(option.id)) invalid();
    sizes.add(option.sizeMm);
    ids.add(option.id);
    return option;
  });
  return { ...summary, description: value.description ?? '', options };
}
export function mapProductPage(value) {
  const dto = object(value);
  if (!Array.isArray(dto.content)) invalid();
  const page = integer(dto.page);
  const size = integer(dto.size, 1);
  const total = integer(dto.totalElements);
  const totalPages = integer(dto.totalPages);
  if (dto.content.length > size) invalid();
  return {
    items: dto.content.map(mapProductSummary),
    page,
    size,
    total,
    totalPages,
  };
}
