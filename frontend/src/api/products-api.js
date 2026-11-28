import { apiClient } from './api-client.js';
import { createProductReader } from './product-reader.js';
import {
  getMockProduct,
  listMockProducts,
  mockBrands,
} from './mocks/products.js';
import { toProductSummary } from '../utils/product-summary.js';
// Explicit opt-in while the backend is being developed. API errors never fall back to mocks.
export const productDataSource =
  import.meta.env?.VITE_PRODUCT_DATA_SOURCE === 'api' ? 'api' : 'mock';
const reader = createProductReader(apiClient);
export async function listProducts(params) {
  if (productDataSource === 'api') return reader.list(params);
  const result = await listMockProducts(params);
  return { ...result, items: result.items.map(toProductSummary) };
}
export const getProduct =
  productDataSource === 'api' ? reader.detail : getMockProduct;
// Reserved for sample management forms. There is no confirmed live brand list endpoint.
export const productBrands = mockBrands;
