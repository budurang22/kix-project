export default function PendingPage({ title = '준비 중입니다' }) {
  return (
    <>
      <h1 className="mb-6 text-3xl font-black">{title}</h1>
      <p className="text-secondary">해당 기능은 아직 제공되지 않습니다.</p>
    </>
  );
}
