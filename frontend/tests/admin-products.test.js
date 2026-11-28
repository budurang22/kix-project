import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSampleAdminService } from '../src/api/mocks/admin-products.js';
import { listProducts } from '../src/api/products-api.js';
import { validateSampleProduct } from '../src/utils/admin-product-validation.js';
const input = {
  name: '  관리자 테스트  ',
  brand: 'KIX SAMPLE',
  price: '100000',
  description: '샘플',
  status: 'ON_SALE',
  options: [
    { sizeMm: '250', stock: '2' },
    { sizeMm: '260', stock: '0' },
  ],
};
test('admin create/edit/stock/logical delete are isolated from public catalog and other sandboxes', async () => {
  const admin = createSampleAdminService();
  const other = createSampleAdminService();
  const created = await admin.save(input);
  assert.equal(created.name, '관리자 테스트');
  assert.equal(created.options.length, 2);
  assert.equal((await admin.list()).total, 11);
  assert.equal((await admin.list({ query: '관리자' })).total, 1);
  const edited = await admin.save(
    {
      ...created,
      price: '120000',
      status: 'STOPPED',
      options: [{ ...created.options[0], stock: '0' }],
    },
    created.id,
  );
  assert.equal(edited.options[0].id, created.options[0].id);
  assert.equal(edited.price, 120000);
  assert.equal(edited.options[0].stock, 0);
  assert.equal((await admin.list({ status: 'STOPPED' })).total, 2);
  edited.name = 'mutated';
  assert.equal((await admin.get(created.id)).name, '관리자 테스트');
  assert.deepEqual(await admin.remove(created.id), {
    id: created.id,
    deleted: true,
  });
  await assert.rejects(admin.get(created.id), { status: 404 });
  await assert.rejects(admin.save(input, created.id), { status: 404 });
  await assert.rejects(admin.remove(created.id), { status: 404 });
  assert.equal((await admin.list()).total, 10);
  assert.equal((await other.list()).total, 10);
  assert.equal((await listProducts()).total, 10);
  assert.equal((await admin.list({ page: 999 })).page, 1);
});
test('admin validates positive price, integer stock, size range, uniqueness and required fields', () => {
  const invalid = [
    { name: '  ' },
    { name: 'a'.repeat(256) },
    { brand: 'unknown' },
    { status: 'INVALID' },
    { price: 0 },
    { price: 1.5 },
    { price: 2147483648 },
    { price: '' },
    { options: [] },
    { options: [{ sizeMm: 149, stock: 0 }] },
    { options: [{ sizeMm: 351, stock: 0 }] },
    { options: [{ sizeMm: 250, stock: -1 }] },
    { options: [{ sizeMm: 250, stock: '' }] },
    { options: [{ sizeMm: 250, stock: 0.5 }] },
    { options: [{ sizeMm: 250, stock: 2147483648 }] },
    {
      options: [
        { sizeMm: 250, stock: 1 },
        { sizeMm: '250', stock: 2 },
      ],
    },
  ];
  for (const change of invalid)
    assert.throws(() => validateSampleProduct({ ...input, ...change }), {
      status: 400,
    });
  const result = validateSampleProduct({
    ...input,
    price: 2147483647,
    options: [
      { sizeMm: 150, stock: 0 },
      { sizeMm: 350, stock: 2147483647 },
    ],
  });
  assert.equal(result.options.length, 2);
});
