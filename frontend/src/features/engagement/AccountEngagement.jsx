import { Link } from 'react-router';
import { useSampleCommerce } from '../../hooks/use-sample-commerce.js';
import ProductCard from '../products/ProductCard.jsx';
import { EmptyState } from '../../components/Feedback.jsx';
export default function AccountEngagement() {
  const { likes, reviews } = useSampleCommerce();
  return (
    <>
      <section className="mt-12">
        <h2 className="text-xl font-bold">샘플 좋아요 상품</h2>
        <p className="my-4 text-sm text-secondary">
          MOCK · 현재 세션에서 선택한 상품입니다. 로그아웃·새로고침하면
          사라집니다.
        </p>
        {likes.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {likes.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState>샘플 좋아요 상품이 없습니다.</EmptyState>
        )}
      </section>
      <section className="mt-12">
        <h2 className="text-xl font-bold">내 샘플 리뷰 목록</h2>
        <p className="my-4 text-sm text-secondary">
          공개 리뷰가 아닌 현재 세션의 작성 체험 기록입니다.
        </p>
        {reviews.length ? (
          <ul className="divide-y divide-primary/15 border-y border-primary/15">
            {reviews.map((review) => (
              <li key={review.productId} className="py-5">
                <Link
                  to={`/products/${review.productId}#sample-reviews`}
                  className="font-bold underline"
                >
                  {review.productName}
                </Link>
                <p className="mt-3 text-sm">평점 {review.rating} / 5</p>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {review.content}
                </p>
                <Link
                  to={`/products/${review.productId}#sample-reviews`}
                  className="mt-4 inline-block text-sm underline"
                >
                  상품에서 리뷰 확인·수정
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>작성한 샘플 리뷰가 없습니다.</EmptyState>
        )}
      </section>
    </>
  );
}
