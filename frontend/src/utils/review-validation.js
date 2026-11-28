export function validateSampleReview({ rating, content }) {
  const trimmed = typeof content === 'string' ? content.trim() : '';
  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    !trimmed ||
    trimmed.length > 1000
  ) {
    const error = new Error(
      '평점 1~5점과 앞뒤 공백을 제외한 리뷰 내용 1~1000자를 입력해 주세요.',
    );
    error.status = 400;
    throw error;
  }
  return { rating, content: trimmed };
}
