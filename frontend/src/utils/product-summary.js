// A card does not require detail-only options; mirrors the list/detail boundary of the backend DTOs.
export function toProductSummary(product) {
  const { id, brand, brandId, name, price, status, imageUrl } = product;
  return {
    id,
    brand,
    brandId,
    name,
    price,
    status,
    imageUrl: imageUrl ?? null,
    soldOut:
      typeof product.soldOut === 'boolean'
        ? product.soldOut
        : !product.options?.some((option) => option.stock > 0),
  };
}
export function applySampleInventory(product, stocks) {
  if (!stocks) return product;
  if (!Array.isArray(product.options))
    return {
      ...product,
      soldOut: Object.values(stocks).every((stock) => stock <= 0),
    };
  const options = product.options.map((option) => ({
    ...option,
    stock: stocks[option.id] ?? option.stock,
  }));
  return {
    ...product,
    options,
    soldOut: options.every((option) => option.stock <= 0),
  };
}
