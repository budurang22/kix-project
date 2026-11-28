import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from './features/auth/AuthProvider.jsx';
import ScreenErrorBoundary from './components/ScreenErrorBoundary.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import './styles/index.css';
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScreenErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ScreenErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
