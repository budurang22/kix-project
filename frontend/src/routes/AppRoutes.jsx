import { Route, Routes } from 'react-router';
import RootLayout from '../layouts/RootLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import AccountPage from '../pages/AccountPage.jsx';
import PendingPage from '../pages/PendingPage.jsx';
import RequireAuth from './RequireAuth.jsx';
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route
          path="products/:id"
          element={<PendingPage title="상품 상세 준비 중" />}
        />
        <Route path="login" element={<AuthPage key="login" />} />
        <Route path="signup" element={<AuthPage key="signup" isSignup />} />
        <Route element={<RequireAuth />}>
          <Route path="my" element={<AccountPage />} />
          <Route
            path="orders/*"
            element={<PendingPage title="주문 기능 준비 중" />}
          />
        </Route>
        <Route element={<RequireAuth role="ADMIN" />}>
          <Route
            path="admin/*"
            element={<PendingPage title="상품·옵션 관리 준비 중" />}
          />
        </Route>
        <Route
          path="*"
          element={<PendingPage title="페이지를 찾을 수 없습니다" />}
        />
      </Route>
    </Routes>
  );
}
