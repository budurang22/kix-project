import { Component } from 'react';
import { Link, useLocation } from 'react-router';
import Button from './Button.jsx';
export default function ScreenErrorBoundary({ children }) {
  const location = useLocation();
  return (
    <RenderBoundary resetKey={location.pathname + location.search}>
      {children}
    </RenderBoundary>
  );
}
class RenderBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    document.title = '화면 오류 | KIX.';
    document.getElementById('screen-error-title')?.focus();
  }
  componentDidUpdate(previous) {
    if (this.state.hasError && previous.resetKey !== this.props.resetKey)
      this.setState({ hasError: false });
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="mx-auto max-w-xl px-5 py-20">
        <h1
          id="screen-error-title"
          tabIndex={-1}
          className="text-3xl font-black"
        >
          화면을 표시하지 못했습니다
        </h1>
        <p role="alert" className="mt-6 leading-relaxed text-secondary">
          잠시 후 다시 불러오거나 홈으로 이동해 주세요. 새로 불러오면 로그인과
          샘플 내역이 초기화됩니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button onClick={() => window.location.reload()}>
            다시 불러오기
          </Button>
          <Link className="border border-primary px-5 py-3 font-bold" to="/">
            홈으로 이동
          </Link>
        </div>
      </main>
    );
  }
}
