import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/use-auth.js';
import { useSampleCommerce } from '../../hooks/use-sample-commerce.js';
import { usePendingAction } from '../../hooks/use-pending-action.js';
export default function LikeButton({ product }) {
  const { session } = useAuth();
  const { likes, setLiked } = useSampleCommerce();
  const { run, isPending, error } = usePendingAction();
  const navigate = useNavigate();
  const location = useLocation();
  const isLiked = likes.some((item) => item.id === product.id);
  function handleLike() {
    if (!session) {
      navigate('/login', {
        state: { from: location.pathname + location.search },
      });
      return;
    }
    run(() => setLiked(product.id, !isLiked));
  }
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleLike}
        disabled={isPending}
        aria-pressed={isLiked}
        aria-label={`${isLiked ? '샘플 좋아요 취소' : '샘플 좋아요'}: ${product.name}`}
        className={`min-h-11 w-full border px-3 py-2 text-sm disabled:opacity-40 ${isLiked ? 'border-primary bg-accent' : 'border-primary/20 bg-background'}`}
      >
        <span aria-hidden="true">{isLiked ? '♥' : '♡'}</span>{' '}
        {isPending ? '처리 중…' : '샘플 좋아요'}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
