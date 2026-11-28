import { mapProductPage, mapProductDetail } from './product-response.js';
// Matches the locally observed list Controller. Detail route is observed too; brand list endpoint is not assumed.
export function createProductReader(client) {
  return {
    async list({ query = '', brandId = '', page = 0, size = 8 } = {}) {
      if (brandId && !/^[1-9][0-9]*$/.test(String(brandId)))
        throw new Error('브랜드 ID는 양의 정수여야 합니다.');
      const response = await client.get('/products', {
        params: {
          keyword: query.trim() || undefined,
          brandId: brandId || undefined,
          page,
          size,
        },
      });
      return mapProductPage(response.data);
    },
    async detail(id) {
      if (!/^[1-9][0-9]*$/.test(String(id))) {
        const error = new Error('상품 ID를 확인해 주세요.');
        error.code = 'INVALID_PRODUCT_ID';
        throw error;
      }
      return mapProductDetail(
        (await client.get(`/products/${encodeURIComponent(id)}`)).data,
      );
    },
  };
}
