// frontend/pages/_app.js
import '../styles/globals.css'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { NotificationProvider } from '../components/Notification'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <Component {...pageProps} />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}

