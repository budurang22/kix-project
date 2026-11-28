import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';

test('SSR smoke: public routes, authenticated member, denied admin and unknown route', async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  });
  try {
    const { default: AppRoutes } = await server.ssrLoadModule(
      '/src/routes/AppRoutes.jsx',
    );
    const { AuthContext } = await server.ssrLoadModule(
      '/src/features/auth/auth-context.js',
    );
    const render = (path, session = null) =>
      renderToString(
        createElement(
          MemoryRouter,
          { initialEntries: [path] },
          createElement(
            AuthContext.Provider,
            { value: { session, logout() {} } },
            createElement(AppRoutes),
          ),
        ),
      );
    assert.match(render('/'), /GET YOUR/);
    assert.match(render('/products'), /MOCK/);
    assert.match(render('/login'), /비밀번호/);
    assert.match(render('/signup'), /닉네임/);
    assert.doesNotMatch(render('/my'), /회원 번호/);
    const session = { member: { id: '42', role: 'USER' } };
    assert.match(render('/my', session), /42/);
    assert.match(render('/admin', session), /접근 권한이 없습니다/);
    assert.match(
      render('/admin', { member: { id: '1', role: 'ADMIN' } }),
      /상품·옵션 관리 준비 중/,
    );
    assert.match(render('/missing'), /페이지를 찾을 수 없습니다/);
  } finally {
    await server.close();
  }
});
