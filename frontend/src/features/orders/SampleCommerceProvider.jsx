import { useRef, useState } from 'react';
import { applySampleInventory } from '../../utils/product-summary.js';
import { useAuth } from '../../hooks/use-auth.js';
import { createSampleOrderService } from '../../api/mocks/orders.js';
import { createSampleEngagementService } from '../../api/mocks/engagement.js';
import { createOrderIntent } from './order-intent.js';
import { SampleCommerceContext } from './sample-commerce-context.js';
export default function SampleCommerceBoundary({ children }) {
  const { session } = useAuth();
  return (
    <SampleCommerceProvider key={session?.token || 'guest'}>
      {children}
    </SampleCommerceProvider>
  );
}
function SampleCommerceProvider({ children }) {
  const [service] = useState(createSampleOrderService);
  const [engagement] = useState(() =>
    createSampleEngagementService({ hasPurchased: service.hasPurchased }),
  );
  const [likes, setLikes] = useState([]);
  const [reviews, setReviews] = useState([]);
  async function setLiked(productId, isLiked) {
    const result = await engagement.setLiked(productId, isLiked);
    setLikes(result);
    return result;
  }
  async function saveReview(input, options) {
    const result = await engagement.saveReview(input, options);
    setReviews((value) => [
      result,
      ...value.filter((review) => review.productId !== result.productId),
    ]);
    return result;
  }
  const [draft, setDraft] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState({});
  const pending = useRef(null);
  function beginOrder(product, option, quantity) {
    if (pending.current) return false;
    setDraft({
      product,
      option,
      quantity,
      intent: createOrderIntent({
        productId: product.id,
        optionId: option.id,
        quantity,
      }),
    });
    return true;
  }
  function submitOrder() {
    if (!draft)
      return Promise.reject(new Error('선택한 샘플 상품이 없습니다.'));
    if (pending.current) return pending.current;
    pending.current = draft.intent
      .execute(service.submit)
      .then((result) => {
        setInventory((value) => ({
          ...value,
          [draft.product.id]: {
            ...Object.fromEntries(
              draft.product.options.map((option) => [option.id, option.stock]),
            ),
            ...value[draft.product.id],
            [result.optionId]: result.remainingStock,
          },
        }));
        setOrders((value) =>
          value.some((order) => order.id === result.order.id)
            ? value
            : [result.order, ...value],
        );
        return result.order;
      })
      .finally(() => {
        pending.current = null;
      });
    return pending.current;
  }
  function applyInventory(product) {
    return applySampleInventory(product, inventory[product.id]);
  }
  return (
    <SampleCommerceContext.Provider
      value={{
        draft,
        orders,
        beginOrder,
        submitOrder,
        applyInventory,
        likes,
        reviews,
        setLiked,
        saveReview,
      }}
    >
      {children}
    </SampleCommerceContext.Provider>
  );
}
