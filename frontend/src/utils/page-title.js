export function getPageTitle(pathname) {
  if (pathname === '/') return '홈';
  if (pathname === '/products') return '상품 탐색';
  if (/^\/products\/[^/]+$/.test(pathname)) return '상품 상세';
  if (pathname === '/login') return '로그인';
  if (pathname === '/signup') return '회원가입';
  if (pathname === '/my') return '마이페이지';
  if (pathname === '/orders/confirm') return '샘플 주문 확인';
  if (pathname.startsWith('/orders/sample/')) return '샘플 주문 상세';
  if (pathname === '/admin') return '관리자 상품';
  if (pathname === '/admin/products/new') return '관리자 상품 등록';
  if (/^\/admin\/products\/[^/]+\/edit$/.test(pathname))
    return '관리자 상품 수정';
  return '페이지를 찾을 수 없습니다';
}
