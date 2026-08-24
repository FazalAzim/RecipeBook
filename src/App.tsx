import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import { ToastContainer } from './components/common/ToastContainer';
import { AppRoutes } from './routes/AppRoutes';
import { seedService } from './services/firebase/seedService';

function useAdminSeed() {
  useEffect(() => {
    const key = 'recipebooks_admin_seeded';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    seedService.seedAdminAccount().then((res) => {
      if (res.created) console.log('Admin seed:', res.message);
    }).catch((err) => {
      console.error('Admin seed failed:', err);
    });
  }, []);
}

export function App() {
  useAdminSeed();

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
            <ToastContainer />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
