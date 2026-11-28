import { useAuth } from '../hooks/use-auth.js';
export default function AccountPage() {
  const { session } = useAuth();
  return (
    <>
      <h1 className="mb-6 text-3xl font-black">마이페이지</h1>
      <p>회원 번호: {session.member.id}</p>
      <p className="mt-3">권한: {session.member.role}</p>
      <p className="mt-8 text-secondary">
        주문 내역·좋아요·리뷰는 API 준비 후 제공됩니다.
      </p>
    </>
  );
}
