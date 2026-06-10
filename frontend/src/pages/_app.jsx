// src/pages/_app.jsx
import '../styles/globals.css';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <AuthProvider>
      <CartProvider>
        {getLayout(<Component {...pageProps} />)}
      </CartProvider>
    </AuthProvider>
  );
}
