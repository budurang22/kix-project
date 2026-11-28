export function isProductAvailable(product) {
  return (
    product.status === 'ON_SALE' &&
    product.options.some((option) => option.stock > 0)
  );
}
export function canSelectOption(product, option) {
  return product.status === 'ON_SALE' && !!option && option.stock > 0;
}
export function parseProductPage(value) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 0 ? page : 0;
}
export function clampQuantity(quantity, stock) {
  return Math.min(
    Math.max(1, Number.isFinite(quantity) ? Math.floor(quantity) : 1),
    Math.max(1, stock),
  );
}
