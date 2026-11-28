import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { createSampleAdminService } from '../api/mocks/admin-products.js';
import { SampleAdminContext } from '../features/admin/sample-admin-context.js';
export default function AdminLayout() {
  const [service] = useState(createSampleAdminService);
  return (
    <SampleAdminContext.Provider value={service}>
      <div className="mb-8 border border-primary/15 bg-surface p-5">
        <p className="text-xs font-bold tracking-widest">
          ADMIN SANDBOX · MOCK
        </p>
        <p className="mt-3 text-sm leading-relaxed text-secondary">
          관리자 UI 체험입니다. 사용자용 샘플 상품과 분리되어 있으며 서버나 실제
          재고를 변경하지 않습니다. 관리자 화면을 벗어나거나
          새로고침·로그아웃하면 초기화됩니다.
        </p>
      </div>
      <nav
        aria-label="관리자 메뉴"
        className="mb-10 flex flex-wrap gap-5 text-sm"
      >
        <NavLink to="/admin" end>
          상품 관리
        </NavLink>
        <NavLink to="/admin/products/new">상품 등록</NavLink>
      </nav>
      <Outlet />
    </SampleAdminContext.Provider>
  );
}
