import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOrderIntent } from '../src/features/orders/order-intent.js';
import { createSampleOrderService } from '../src/api/mocks/orders.js';
const request = {
  productId: 'sample-1',
  optionId: 'sample-1-255',
  quantity: 1,
};
test('one intent deduplicates in-flight clicks and completed requests', async () => {
  let calls = 0;
  let release;
  const result = { order: { id: 'test' } };
  const intent = createOrderIntent(request, () => 'key-1');
  const submit = async ({ input, idempotencyKey }) => {
    calls++;
    assert.deepEqual(input, request);
    assert.equal(idempotencyKey, 'key-1');
    await new Promise((resolve) => {
      release = resolve;
    });
    return result;
  };
  const first = intent.execute(submit);
  assert.equal(intent.execute(submit), first);
  await Promise.resolve();
  release();
  assert.equal(await first, result);
  assert.equal(await intent.execute(submit), result);
  assert.equal(calls, 1);
});
test('lost response retry retains key and does not deduct mock stock twice', async () => {
  const service = createSampleOrderService({ latency: 0 });
  const keys = [];
  let loseResponse = true;
  const submit = async (args) => {
    keys.push(args.idempotencyKey);
    const result = await service.submit(args);
    if (loseResponse) {
      loseResponse = false;
      throw new Error('response lost');
    }
    return result;
  };
  const intent = createOrderIntent(request, () => 'retry-key');
  await assert.rejects(intent.execute(submit), /response lost/);
  const result = await intent.execute(submit);
  assert.equal(result.remainingStock, 1);
  assert.deepEqual(keys, ['retry-key', 'retry-key']);
  const next = createOrderIntent(request, () => 'new-key');
  assert.equal((await next.execute(service.submit)).remainingStock, 0);
  await assert.rejects(
    service.submit({ input: request, idempotencyKey: 'third-key' }),
    { status: 409 },
  );
});
test('mock request conflict, sold out and session inventory isolation', async () => {
  const first = createSampleOrderService({ latency: 0 });
  const result = await first.submit({
    input: request,
    idempotencyKey: 'same-key',
  });
  assert.equal(
    result.order.totalPrice,
    result.order.unitPrice * result.order.quantity,
  );
  await assert.rejects(
    first.submit({
      input: { ...request, quantity: 2 },
      idempotencyKey: 'same-key',
    }),
    { status: 409 },
  );
  await assert.rejects(
    first.submit({
      input: { productId: 'sample-4', optionId: 'sample-4-250', quantity: 1 },
      idempotencyKey: 'sold-out',
    }),
    { status: 409 },
  );
  await assert.rejects(
    first.submit({
      input: { ...request, quantity: 0 },
      idempotencyKey: 'invalid',
    }),
    { status: 400 },
  );
  const second = createSampleOrderService({ latency: 0 });
  assert.equal(
    (await second.submit({ input: request, idempotencyKey: 'other-session' }))
      .remainingStock,
    1,
  );
});
