import { listMockProducts } from './products.js';
import { validateSampleProduct } from '../../utils/admin-product-validation.js';
function missing() {
  const error = new Error('관리자 샘플 상품을 찾을 수 없습니다.');
  error.status = 404;
  throw error;
}
// Isolated admin sandbox. No shared catalog mutation and no HTTP calls.
export function createSampleAdminService() {
  const initial = listMockProducts({ size: 100 }).then(({ items }) =>
    items.map((product) => ({ ...product, deleted: false })),
  );
  let sequence = 0;
  let optionSequence = 0;
  return {
    async list({ query = '', status = '', page = 0, size = 8 } = {}) {
      const records = await initial;
      const matches = records.filter(
        (product) =>
          !product.deleted &&
          (!status || product.status === status) &&
          product.name
            .toLocaleLowerCase('ko-KR')
            .includes(query.trim().toLocaleLowerCase('ko-KR')),
      );
      const totalPages = Math.ceil(matches.length / size);
      const currentPage = Math.min(
        Math.max(0, page),
        Math.max(0, totalPages - 1),
      );
      return structuredClone({
        items: matches.slice(currentPage * size, (currentPage + 1) * size),
        total: matches.length,
        totalPages,
        page: currentPage,
      });
    },
    async get(id) {
      const records = await initial;
      const product = records.find((item) => item.id === id && !item.deleted);
      if (!product) missing();
      return structuredClone(product);
    },
    async save(input, id) {
      const records = await initial;
      const previous = id
        ? records.find((item) => item.id === id && !item.deleted)
        : null;
      if (id && !previous) missing();
      const data = validateSampleProduct(input);
      const productId = previous?.id || `admin-sample-${++sequence}`;
      const product = {
        ...data,
        id: productId,
        deleted: false,
        options: data.options.map((option) => ({
          ...option,
          id: previous?.options.some((item) => item.id === option.id)
            ? option.id
            : `${productId}-option-${++optionSequence}`,
        })),
      };
      if (previous) records[records.indexOf(previous)] = product;
      else records.unshift(product);
      return structuredClone(product);
    },
    async remove(id) {
      const records = await initial;
      const product = records.find((item) => item.id === id && !item.deleted);
      if (!product) missing();
      product.deleted = true;
      return { id, deleted: true };
    },
  };
}
