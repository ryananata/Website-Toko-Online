// src/pages/Cart.tsx
import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';

declare global {
  interface Window {
    snap: any;
  }
}

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    if (isNaN(price)) return 'Rp0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!user) {
      alert('⚠️ Kamu harus login terlebih dahulu!');
      navigate('/login');
      return;
    }

    const payload = {
      user_id: user.id,
      items: items.map((item) => ({
        produk_id: item.product.id,
        jumlah: item.quantity
      }))
    };

    try {
      // 👇 Menambahkan /api langsung di endpoint
      const pesananRes = await api.post('/api/pesanan', payload);
      const pesanan_id = pesananRes.data.pesanan_id;

      const transaksiRes = await api.post('/api/transaksi/token', { pesanan_id });
      const { token } = transaksiRes.data;

      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: () => {
            alert('✅ Pembayaran berhasil!');
            clearCart();
            navigate('/pesanan');
          },
          onPending: () => {
            alert('⏳ Menunggu pembayaran...');
            clearCart();
            navigate('/pesanan');
          },
          onError: () => {
            alert('❌ Terjadi kesalahan saat pembayaran.');
          },
          onClose: () => {
            alert('⚠️ Kamu belum menyelesaikan pembayaran.');
          }
        });
      } else {
        alert('❌ Snap Midtrans tidak ditemukan.');
      }
    } catch (error: any) {
      console.error('❌ Gagal checkout:', error.response?.data || error.message);
      alert('Gagal melakukan checkout: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Keranjang kamu masih kosong</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-2 mb-8">
        <ShoppingBag className="text-purple-600" size={24} />
        <h1 className="text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={item.product.gambar}
                  alt={item.product.nama}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.product.nama}
                  </h3>
                  <p className="text-purple-600 font-medium">
                    {formatPrice(item.product.harga)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-100 rounded-full"
                  >
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 bg-purple-100 rounded-full text-purple-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 sticky top-24">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Belanja</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ongkir</span>
                <span>Gratis</span>
              </div>
              <div className="border-t pt-3 font-bold flex justify-between">
                <span>Total</span>
                <span className="text-purple-600">{formatPrice(getTotalPrice())}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl"
            >
              Checkout Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
