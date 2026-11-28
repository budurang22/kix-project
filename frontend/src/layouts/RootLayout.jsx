import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../hooks/use-auth.js';
import Button from '../components/Button.jsx';
export default function RootLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  function handleSearch(event) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('q').trim();
    navigate(`/products?q=${encodeURIComponent(query)}`);
  }
  return (
    <>
      <a className="skip-link" href="#main">
        본문 바로가기
      </a>
      <header className="border-b border-primary/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-6">
          <Link
            to="/"
            aria-label="KIX 홈"
            className="text-4xl font-black italic tracking-tighter"
          >
            KIX.
          </Link>
          <nav
            aria-label="주 메뉴"
            className="flex flex-wrap items-center gap-5 text-sm"
          >
            <NavLink to="/products">상품 탐색</NavLink>
            <NavLink to="/my">마이페이지</NavLink>
            {session?.member.role === 'ADMIN' && (
              <NavLink to="/admin">관리자</NavLink>
            )}
            {session ? (
              <Button variant="secondary" onClick={logout}>
                로그아웃
              </Button>
            ) : (
              <Link to="/login">로그인</Link>
            )}
          </nav>
          <form
            role="search"
            onSubmit={handleSearch}
            className="flex w-full gap-2 sm:w-auto"
          >
            <input
              name="q"
              aria-label="상품명 검색"
              placeholder="다음 스니커즈를 찾아보세요"
              className="min-w-0 flex-1 border-b px-2 py-2"
              maxLength={100}
            />
            <button type="submit" className="px-3">
              검색
            </button>
          </form>
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto min-h-[65vh] max-w-7xl px-5 py-10"
      >
        <Outlet />
      </main>
      <footer className="border-t border-primary/15 px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-2xl font-black italic">KIX.</p>
          <p className="mt-3 text-xs tracking-widest">
            LIMITED SNEAKERS &amp; FASHION
          </p>
          <p className="mt-6 text-sm text-secondary">
            포트폴리오용 커머스 · 실제 결제 및 배송을 제공하지 않습니다.
          </p>
        </div>
      </footer>
    </>
  );
}
