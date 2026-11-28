import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSampleEngagementService } from '../src/api/mocks/engagement.js';
import { createSampleOrderService } from '../src/api/mocks/orders.js';
import { validateSampleReview } from '../src/utils/review-validation.js';
test('desired like state is idempotent and isolated by session', async () => {
  const one = createSampleEngagementService({
    hasPurchased: () => false,
    latency: 0,
  });
  const two = createSampleEngagementService({
    hasPurchased: () => false,
    latency: 0,
  });
  assert.equal((await one.setLiked('sample-1', true)).length, 1);
  assert.equal((await one.setLiked('sample-1', true)).length, 1);
  const likes = await one.setLiked('sample-2', true);
  assert.equal(likes.length, 2);
  likes[0].name = 'mutated';
  assert.notEqual((await one.setLiked('sample-1', true))[0].name, 'mutated');
  assert.equal((await one.setLiked('sample-1', false)).length, 1);
  assert.equal((await one.setLiked('sample-1', false)).length, 1);
  assert.equal((await two.setLiked('sample-1', false)).length, 0);
  await assert.rejects(one.setLiked('missing', true), { status: 404 });
});
test('sample purchase required, one review per product, update existing only', async () => {
  const orders = createSampleOrderService({ latency: 0 });
  const service = createSampleEngagementService({
    hasPurchased: orders.hasPurchased,
    latency: 0,
  });
  const input = { productId: 'sample-1', rating: 4, content: '  샘플 후기  ' };
  await assert.rejects(service.saveReview(input), { status: 403 });
  await orders.submit({
    input: { productId: 'sample-1', optionId: 'sample-1-250', quantity: 1 },
    idempotencyKey: 'sample-purchase',
  });
  await assert.rejects(service.saveReview(input, { isEditing: true }), {
    status: 404,
  });
  const review = await service.saveReview(input);
  assert.equal(review.content, '샘플 후기');
  await assert.rejects(service.saveReview(input), { status: 409 });
  const updated = await service.saveReview(
    { ...input, rating: 5, content: '<script>sample</script>' },
    { isEditing: true },
  );
  assert.equal(updated.rating, 5);
  assert.equal(updated.content, '<script>sample</script>');
  const other = createSampleEngagementService({
    hasPurchased: () => false,
    latency: 0,
  });
  await assert.rejects(other.saveReview(input, { isEditing: true }), {
    status: 403,
  });
});
test('review validation: rating range, trimmed blank, length boundaries', () => {
  for (const rating of [0, 6, 1.5, '5', NaN])
    assert.throws(() => validateSampleReview({ rating, content: '내용' }), {
      status: 400,
    });
  for (const content of ['', '   ', null, 'a'.repeat(1001)])
    assert.throws(() => validateSampleReview({ rating: 5, content }), {
      status: 400,
    });
  assert.equal(
    validateSampleReview({ rating: 1, content: 'a'.repeat(1000) }).content
      .length,
    1000,
  );
});
