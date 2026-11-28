import { getMockProduct } from './products.js';
function conflict(message) {
  const error = new Error(message);
  error.status = 409;
  return error;
}
// Session-local UI simulation. Not an HTTP API contract or server concurrency guarantee.
export function createSampleOrderService({ latency = 200 } = {}) {
  const ordersByKey = new Map();
  const inventory = new Map();
  let sequence = 0;
  return {
    hasPurchased(productId) {
      return [...ordersByKey.values()].some(
        (entry) => entry.result.order.productId === productId,
      );
    },
    async submit({ input, idempotencyKey }) {
      if (latency) await new Promise((resolve) => setTimeout(resolve, latency));
      const product = await getMockProduct(input.productId);
      const previous = ordersByKey.get(idempotencyKey);
      if (previous) {
        if (
          ['productId', 'optionId', 'quantity'].some(
            (field) => previous.input[field] !== input[field],
          )
        )
          throw conflict(
            '동일한 샘플 요청 키의 내용이 다릅니다. 상품을 다시 선택해 주세요.',
          );
        return structuredClone(previous.result);
      }
      const option = product.options.find((item) => item.id === input.optionId);
      if (
        !option ||
        !Number.isSafeInteger(input.quantity) ||
        input.quantity < 1
      ) {
        const error = new Error('사이즈와 수량을 다시 확인해 주세요.');
        error.status = 400;
        throw error;
      }
      const stock = inventory.get(option.id) ?? option.stock;
      if (product.status !== 'ON_SALE' || stock < input.quantity)
        throw conflict(
          '샘플 재고가 부족하거나 판매가 중지되었습니다. 상품을 다시 선택해 주세요.',
        );
      const order = {
        id: `sample-order-${++sequence}`,
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        sizeMm: option.sizeMm,
        quantity: input.quantity,
        unitPrice: product.price,
        totalPrice: product.price * input.quantity,
        createdAt: new Date().toISOString(),
      };
      const result = {
        order,
        optionId: option.id,
        remainingStock: stock - input.quantity,
      };
      inventory.set(option.id, result.remainingStock);
      ordersByKey.set(idempotencyKey, {
        input: structuredClone(input),
        result,
      });
      return structuredClone(result);
    },
  };
}
