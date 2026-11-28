import { Link } from 'react-router';
import HomeProducts from '../features/products/HomeProducts.jsx';
export default function HomePage() {
  return (
    <>
      <section className="bg-primary px-6 py-16 text-background sm:px-12 sm:py-24">
        <p className="text-xs tracking-[0.2em]">
          LIMITED SNEAKERS &amp; FASHION
        </p>
        <h1 className="my-8 max-w-3xl text-5xl leading-none font-black tracking-tighter sm:text-8xl">
          GET YOUR
          <br />
          NEXT KICKS.
        </h1>
        <Link
          to="/products"
          className="inline-block bg-accent px-6 py-4 font-bold text-primary"
        >
          상품 탐색 →
        </Link>
        <p className="mt-10 text-sm">
          기본 레이아웃 미리보기 · 최종 디자인 리소스 적용 예정
        </p>
      </section>
      <HomeProducts />
    </>
  );
}
