import Button from './Button.jsx';
export function Loading({ children = '불러오는 중입니다.' }) {
  return (
    <p role="status" className="py-12 text-secondary">
      {children}
    </p>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="space-y-4 py-8">
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>다시 시도</Button>}
    </div>
  );
}
export function EmptyState({ children = '표시할 정보가 없습니다.' }) {
  return (
    <p role="status" className="bg-surface p-8 text-secondary">
      {children}
    </p>
  );
}
