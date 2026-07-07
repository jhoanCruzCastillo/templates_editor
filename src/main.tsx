import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppProvider } from './lib/context';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './components/Toast';
import { initStore } from './lib/store';
import AppRouter from './routes/AppRouter';

initStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  </StrictMode>
);
