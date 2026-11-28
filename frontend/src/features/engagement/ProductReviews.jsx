import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../../hooks/use-auth.js';
import { useSampleCommerce } from '../../hooks/use-sample-commerce.js';
import { usePendingAction } from '../../hooks/use-pending-action.js';
import Button from '../../components/Button.jsx';
export default function ProductReviews({ product }) {
  const { session } = useAuth();
  const section = useRef(null);
  useEffect(() => {
    if (window.location.hash === '#sample-reviews')
      section.current?.scrollIntoView();
  }, [product.id]);
  const { orders, reviews, saveReview } = useSampleCommerce();
  const [isEditing, setIsEditing] = useState(false);
  const review = reviews.find((item) => item.productId === product.id);
  const hasPurchased = orders.some((order) => order.productId === product.id);
  return (
    <section
      ref={section}
      id="sample-reviews"
      className="mt-12 border-t border-primary/15 pt-8"
    >
      <h2 className="text-xl font-bold">내 샘플 리뷰</h2>
      <p className="my-4 text-sm leading-relaxed text-secondary">
        MOCK · 현재 로그인 세션의 리뷰 체험입니다. 공개 리뷰가 아니며 서버에
        저장되지 않습니다. 로그아웃·새로고침하면 초기화됩니다.
      </p>
      {!session ? (
        <p className="text-sm">
          로그인하고 샘플 주문을 완료하면 리뷰를 체험할 수 있습니다.
        </p>
      ) : !hasPurchased ? (
        <p className="text-sm">
          현재 세션에서 이 상품의 샘플 주문을 먼저 완료해 주세요.
        </p>
      ) : review && !isEditing ? (
        <article className="bg-surface p-5">
          <p className="font-bold">평점 {review.rating} / 5</p>
          <p className="mt-4 whitespace-pre-wrap break-words leading-relaxed">
            {review.content}
          </p>
          <Button
            variant="secondary"
            className="mt-5"
            onClick={() => setIsEditing(true)}
          >
            샘플 리뷰 수정
          </Button>
        </article>
      ) : (
        <ReviewForm
          key={review ? 'edit' : 'create'}
          review={review}
          productId={product.id}
          saveReview={saveReview}
          onSaved={() => setIsEditing(false)}
          onCancel={review ? () => setIsEditing(false) : null}
        />
      )}
    </section>
  );
}
function ReviewForm({ review, productId, saveReview, onSaved, onCancel }) {
  const id = useId();
  const { run, isPending, error } = usePendingAction();
  async function handleSubmit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const saved = await run(() =>
      saveReview(
        {
          productId,
          rating: Number(fields.get('rating')),
          content: fields.get('content'),
        },
        { isEditing: !!review },
      ),
    );
    if (saved) onSaved();
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-label={review ? '샘플 리뷰 수정 양식' : '샘플 리뷰 작성 양식'}
      aria-busy={isPending}
    >
      <div>
        <label
          htmlFor={`${id}-rating`}
          className="mb-2 block text-sm font-bold"
        >
          평점
        </label>
        <select
          id={`${id}-rating`}
          name="rating"
          defaultValue={review?.rating || 5}
          disabled={isPending}
          className="min-h-11 border border-primary/20 bg-background px-3"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value}점
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor={`${id}-content`}
          className="mb-2 block text-sm font-bold"
        >
          리뷰 내용
        </label>
        <textarea
          id={`${id}-content`}
          name="content"
          required
          maxLength={1000}
          defaultValue={review?.content || ''}
          disabled={isPending}
          aria-describedby={`${id}-help`}
          className="min-h-32 w-full resize-y border border-primary/20 bg-background p-3"
        />
        <p id={`${id}-help`} className="mt-2 text-xs text-secondary">
          앞뒤 공백 제외 1~1000자 · 개인정보를 입력하지 마세요.
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? '저장 중…'
            : review
              ? '샘플 리뷰 수정 저장'
              : '샘플 리뷰 등록'}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            수정 취소
          </Button>
        )}
      </div>
    </form>
  );
}
