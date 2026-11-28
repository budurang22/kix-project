// Frontend-only display model. This is not a confirmed backend DTO.
export const mockProducts = [
  {
    id: 'sample-1',
    brand: 'KIX SAMPLE',
    name: '로우 스니커즈 샘플',
    price: 159000,
  },
  {
    id: 'sample-2',
    brand: 'KIX SAMPLE',
    name: '하이 스니커즈 샘플',
    price: 189000,
  },
  {
    id: 'sample-3',
    brand: 'STUDIO SAMPLE',
    name: '코트 스니커즈 샘플',
    price: 139000,
  },
  {
    id: 'sample-4',
    brand: 'STUDIO SAMPLE',
    name: '러닝 스니커즈 샘플',
    price: 169000,
  },
];
export async function listMockProducts({
  query = '',
  page = 0,
  size = 4,
} = {}) {
  const matches = mockProducts.filter(
    (product) =>
      product.name.includes(query) ||
      product.brand.toLowerCase().includes(query.toLowerCase()),
  );
  return {
    items: matches.slice(page * size, (page + 1) * size),
    totalPages: Math.ceil(matches.length / size),
  };
}
