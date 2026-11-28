import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapProductSummary,
  mapProductDetail,
  mapProductPage,
} from '../src/api/product-response.js';
import {
  isProductAvailable,
  canSelectOption,
} from '../src/utils/product-selection.js';
import {
  applySampleInventory,
  toProductSummary,
} from '../src/utils/product-summary.js';
import { getProductImageSource } from '../src/utils/product-image-source.js';
// Fixtures match observed local Java records, not a tested HTTP response.
const summary = {
  id: 12,
  brandId: 3,
  brandName: 'Brand',
  name: 'Test product',
  price: 100000,
  imageUrl: null,
  status: 'ON_SALE',
  soldOut: false,
};
test('summary maps without detail options and honors server soldOut/status', () => {
  const product = mapProductSummary(summary);
  assert.equal(product.id, '12');
  assert.equal(product.brand, 'Brand');
  assert.equal(product.options, undefined);
  assert.equal(isProductAvailable(product), true);
  assert.equal(isProductAvailable({ ...product, soldOut: true }), false);
  assert.equal(isProductAvailable({ ...product, status: 'STOPPED' }), false);
  assert.equal(
    canSelectOption({ ...product, soldOut: true }, { stock: 2 }),
    false,
  );
  assert.equal(
    mapProductSummary({ ...summary, id: '9223372036854775807' }).id,
    '9223372036854775807',
  );
});
test('observed sizeMn field maps explicitly; detail and page never invent fields', () => {
  const product = mapProductDetail({
    ...summary,
    description: null,
    options: [{ id: 21, sizeMn: 250, stock: 2 }],
  });
  assert.deepEqual(product.options, [{ id: '21', sizeMm: 250, stock: 2 }]);
  assert.equal(product.description, '');
  const page = mapProductPage({
    content: [summary],
    page: 0,
    size: 8,
    totalElements: 1,
    totalPages: 1,
  });
  assert.equal(page.total, 1);
  assert.equal(page.items[0].options, undefined);
  assert.equal(
    mapProductPage({
      content: [],
      page: 5,
      size: 8,
      totalElements: 1,
      totalPages: 1,
    }).page,
    5,
  );
  assert.equal(mapProductDetail({ ...summary, options: [] }).options.length, 0);
});
test('invalid payloads fail visibly rather than silently becoming empty products', () => {
  const badSummaries = [
    null,
    [],
    { ...summary, id: 9007199254740992 },
    { ...summary, price: -1 },
    { ...summary, soldOut: 'false' },
    { ...summary, brandName: null },
    { ...summary, status: 'unknown' },
  ];
  for (const value of badSummaries)
    assert.throws(() => mapProductSummary(value), {
      code: 'INVALID_PRODUCT_RESPONSE',
    });
  for (const options of [
    null,
    [{ id: 1, sizeMm: 250, stock: 1 }],
    [{ id: 1, sizeMn: 250, stock: -1 }],
    [
      { id: 1, sizeMn: 250, stock: 1 },
      { id: 2, sizeMn: 250, stock: 1 },
    ],
  ]) {
    assert.throws(() => mapProductDetail({ ...summary, options }), {
      code: 'INVALID_PRODUCT_RESPONSE',
    });
  }
  assert.throws(
    () =>
      mapProductPage({
        content: {},
        page: 0,
        size: 8,
        totalElements: 0,
        totalPages: 0,
      }),
    { code: 'INVALID_PRODUCT_RESPONSE' },
  );
});
test('sample inventory updates both summary and detail without option data on cards', () => {
  const product = {
    ...mapProductSummary(summary),
    options: [
      { id: 'a', sizeMm: 250, stock: 1 },
      { id: 'b', sizeMm: 260, stock: 0 },
    ],
  };
  const card = toProductSummary(product);
  assert.equal(card.options, undefined);
  assert.equal(card.soldOut, false);
  const sold = applySampleInventory(card, { a: 0, b: 0 });
  assert.equal(sold.soldOut, true);
  const detail = applySampleInventory(product, { a: 0, b: 0 });
  assert.equal(detail.soldOut, true);
  assert.equal(detail.options[0].stock, 0);
  assert.equal(product.options[0].stock, 1);
});
test('image sources allow root assets/http(s) and reject unsafe or unsupported inputs', () => {
  assert.equal(getProductImageSource('/products/a.png'), '/products/a.png');
  assert.equal(
    getProductImageSource('https://example.com/a.png'),
    'https://example.com/a.png',
  );
  for (const source of [
    null,
    '',
    '//external/a.png',
    'javascript:alert(1)',
    'data:image/svg+xml,a',
    'file:///tmp/a.png',
    'https://user:pass@example.com/a.png',
  ])
    assert.equal(getProductImageSource(source), '');
});

test('list reader sends only observed Controller params and does not fall back after failure', async () => {
  const { createProductReader } = await import('../src/api/product-reader.js');
  const calls = [];
  const reader = createProductReader({
    get: async (url, config) => {
      calls.push({ url, params: config?.params });
      if (url === '/products/12')
        return {
          data: { ...summary, options: [{ id: 21, sizeMn: 250, stock: 2 }] },
        };
      return {
        data: {
          content: [summary],
          page: 2,
          size: 8,
          totalElements: 17,
          totalPages: 3,
        },
      };
    },
  });
  assert.equal(
    (await reader.list({ query: '  runner  ', brandId: '3', page: 2 })).total,
    17,
  );
  assert.deepEqual(calls, [
    {
      url: '/products',
      params: { keyword: 'runner', brandId: '3', page: 2, size: 8 },
    },
  ]);
  assert.equal((await reader.detail('12')).options[0].sizeMm, 250);
  assert.equal(calls.length, 2);
  await assert.rejects(reader.detail('invalid'), {
    code: 'INVALID_PRODUCT_ID',
  });
  const failing = createProductReader({
    get: async () => {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    },
  });
  await assert.rejects(failing.list(), { status: 401 });
  await assert.rejects(reader.list({ brandId: 'invalid' }), /브랜드 ID/);
});
