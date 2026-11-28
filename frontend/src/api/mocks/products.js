// Frontend-only samples, not backend DTOs or real stock/price information.
const names = [
  '로우 스니커즈',
  '하이 스니커즈',
  '코트 스니커즈',
  '러닝 스니커즈',
  '클래식 로우',
  '트레일 스니커즈',
  '캔버스 하이',
  '레트로 러너',
  '플랫폼 로우',
  '데일리 스니커즈',
];
export const mockBrands = ['KIX SAMPLE', 'STUDIO SAMPLE'];
const products = names.map((name, index) => ({
  id: `sample-${index + 1}`,
  brand: mockBrands[index % 2],
  name: `${name} 샘플`,
  price: 139000 + index * 10000,
  status: index === 8 ? 'STOPPED' : 'ON_SALE',
  description:
    '화면과 옵션 선택을 확인하기 위한 가상 상품입니다. 실제 판매 상품이 아니며 표시 가격과 재고도 샘플입니다.',
  options: [250, 255, 260, 265, 270, 275, 280].map((sizeMm, offset) => ({
    id: `sample-${index + 1}-${sizeMm}`,
    sizeMm,
    stock: index === 3 || offset === 2 ? 0 : (offset % 3) + 1,
  })),
}));
export async function listMockProducts({
  query = '',
  brand = '',
  page = 0,
  size = 8,
} = {}) {
  const keyword = query.trim().toLocaleLowerCase('ko-KR');
  const matches = products.filter(
    (product) =>
      (!brand || product.brand === brand) &&
      `${product.name} ${product.brand}`
        .toLocaleLowerCase('ko-KR')
        .includes(keyword),
  );
  const totalPages = Math.ceil(matches.length / size);
  const currentPage = Math.min(Math.max(0, page), Math.max(0, totalPages - 1));
  return {
    items: matches
      .slice(currentPage * size, (currentPage + 1) * size)
      .map((product) => structuredClone(product)),
    total: matches.length,
    totalPages,
    page: currentPage,
  };
}
export async function getMockProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) {
    const error = new Error('상품을 찾을 수 없습니다.');
    error.status = 404;
    throw error;
  }
  return structuredClone(product);
}
