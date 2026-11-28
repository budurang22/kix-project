import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { signup } from '../api/auth-api.js';
import { useAuth } from '../hooks/use-auth.js';
import Button from '../components/Button.jsx';
import InputField from '../components/InputField.jsx';
export default function AuthPage({ isSignup = false }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lock = useRef(false);
  const request = useRef(null);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      request.current?.abort();
    };
  }, []);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  async function handleSubmit(event) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    const controller = new AbortController();
    request.current = controller;
    setIsPending(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (isSignup) {
        await signup(data, { signal: controller.signal });
        if (controller.signal.aborted) return;
        navigate('/login', {
          replace: true,
          state: { message: '회원가입이 완료되었습니다. 로그인해 주세요.' },
        });
      } else {
        const hasLoggedIn = await login(data, {
          signal: controller.signal,
          onAuthenticated: () => {
            // A successful session remounts this page through the sample boundary.
            if (request.current === controller) request.current = null;
          },
        });
        if (!hasLoggedIn || controller.signal.aborted) return;
        const from = location.state?.from;
        navigate(
          typeof from === 'string' &&
            from.startsWith('/') &&
            !from.startsWith('//')
            ? from
            : '/my',
          { replace: true },
        );
      }
    } catch (failure) {
      if (active.current && !controller.signal.aborted)
        setError(failure.message);
    } finally {
      lock.current = false;
      if (active.current && !controller.signal.aborted) setIsPending(false);
      if (request.current === controller) request.current = null;
    }
  }
  return (
    <section className="mx-auto max-w-sm py-8">
      <h1 className="mb-8 text-3xl font-black">
        {isSignup ? '회원가입' : '로그인'}
      </h1>
      {location.state?.message && (
        <p role="status" className="mb-6">
          {location.state.message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isPending}>
        <InputField
          label="이메일"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={255}
        />
        <InputField
          label="비밀번호"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          required
          minLength={isSignup ? 8 : undefined}
          maxLength={isSignup ? 50 : undefined}
        />
        {isSignup && (
          <InputField
            label="닉네임"
            name="nickname"
            autoComplete="nickname"
            required
            maxLength={30}
          />
        )}{' '}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? '요청 중…' : isSignup ? '가입하기' : '로그인'}
        </Button>
      </form>
      <Link
        className="mt-6 inline-block text-sm underline"
        to={isSignup ? '/login' : '/signup'}
      >
        {isSignup ? '로그인으로 이동' : '회원가입'}
      </Link>
      <p className="mt-6 text-xs text-secondary">
        새로고침하면 로그인 상태가 초기화됩니다.
      </p>
    </section>
  );
}
