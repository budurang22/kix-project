import { getMockProduct } from './products.js';
import { validateSampleReview } from '../../utils/review-validation.js';
function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
// Private session-only samples, not public likes/reviews or a confirmed server DTO.
export function createSampleEngagementService({ hasPurchased, latency = 100 }) {
  const likes = new Map();
  const reviews = new Map();
  const wait = () =>
    latency
      ? new Promise((resolve) => setTimeout(resolve, latency))
      : Promise.resolve();
  return {
    async setLiked(productId, isLiked) {
      const product = await getMockProduct(productId);
      await wait();
      if (isLiked) likes.set(productId, product);
      else likes.delete(productId);
      return structuredClone([...likes.values()]);
    },
    async saveReview(
      { productId, rating, content },
      { isEditing = false } = {},
    ) {
      const product = await getMockProduct(productId);
      await wait();
      if (!hasPurchased(productId))
        fail(
          403,
          '현재 세션에서 샘플 주문을 완료한 상품만 리뷰를 작성할 수 있습니다.',
        );
      const fields = validateSampleReview({ rating, content });
      if (!isEditing && reviews.has(productId))
        fail(409, '이미 샘플 리뷰를 작성했습니다. 수정 기능을 이용해 주세요.');
      if (isEditing && !reviews.has(productId))
        fail(404, '수정할 샘플 리뷰가 없습니다.');
      const review = {
        productId,
        productName: product.name,
        ...fields,
        updatedAt: new Date().toISOString(),
      };
      reviews.set(productId, review);
      return structuredClone(review);
    },
  };
}
