// Only the mock source is available. Wire an explicit server DTO adapter here when confirmed.
import {
  getMockProduct,
  listMockProducts,
  mockBrands,
} from './mocks/products.js';
export const productDataSource = 'mock';
export const listProducts = listMockProducts;
export const getProduct = getMockProduct;
export const productBrands = mockBrands;
