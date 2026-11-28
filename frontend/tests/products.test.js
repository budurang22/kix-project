import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listProducts, getProduct } from '../src/api/products-api.js';
import {
  canSelectOption,
  isProductAvailable,
  clampQuantity,
  parseProductPage,
} from '../src/utils/product-selection.js';
test('combined search/brand filtering, normalized pagination and isolated samples', async () => {
  const all = await listProducts();
  assert.equal(all.total, 10);
  assert.equal(all.items.length, 8);
  assert.equal((await listProducts({ page: 1 })).items.length, 2);
  assert.equal((await listProducts({ page: 999 })).page, 1);
  const filtered = await listProducts({
    query: '  STUDIO ',
    brand: 'STUDIO SAMPLE',
  });
  assert.equal(filtered.total, 5);
  assert.ok(
    filtered.items.every((product) => product.brand === 'STUDIO SAMPLE'),
  );
  assert.equal((await listProducts({ query: '없는상품' })).total, 0);
  all.items[0].options[0].stock = 999;
  assert.notEqual((await getProduct('sample-1')).options[0].stock, 999);
  await assert.rejects(getProduct('unknown'), { status: 404 });
});
test('stock, stopped sales and quantity boundaries', async () => {
  const product = await getProduct('sample-1');
  assert.ok(canSelectOption(product, product.options[0]));
  assert.equal(canSelectOption(product, product.options[2]), false);
  assert.equal(isProductAvailable(await getProduct('sample-4')), false);
  const stopped = await getProduct('sample-9');
  assert.equal(isProductAvailable(stopped), false);
  assert.equal(canSelectOption(stopped, stopped.options[0]), false);
  assert.equal(clampQuantity(50, 3), 3);
  assert.equal(clampQuantity(-1, 3), 1);
  for (const invalid of ['Infinity', '1.5', '-1', 'garbage'])
    assert.equal(parseProductPage(invalid), 0);
});
