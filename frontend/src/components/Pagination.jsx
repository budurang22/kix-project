import Button from './Button.jsx';
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="페이지 탐색"
      className="flex items-center justify-center gap-5"
    >
      <Button
        variant="secondary"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </Button>
      <span aria-live="polite">
        {page + 1} / {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </Button>
    </nav>
  );
}
