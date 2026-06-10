// src/pages/_app.jsx
// Punto de entrada global de Next.js
import '../styles/globals.css';
import { CartProvider } from '../context/CartContext';

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <CartProvider>
      {getLayout(<Component {...pageProps} />)}
    </CartProvider>
  );
}
