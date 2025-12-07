import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Order } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders
  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const response = await api.get(`/api/pesanan/user/${userId}`);
        const formattedOrders: Order[] = response.data.map((order: any) => ({
          ...order,
          items: order.items.map((item: any) => ({
            produk_id: item.produk_id,
            nama_produk: item.nama_produk,
            quantity: item.jumlah,
            price: item.harga_satuan,
          })),
        }));
        setOrders(formattedOrders);
      } catch (error) {
        console.error('❌ Gagal ambil pesanan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // Load Snap Midtrans
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'; // ✅ sandbox
    script.setAttribute('data-client-key', 'Mid-client-VrLCE8eU2AdryYYv'); // ganti dengan client key kamu
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Bayar Sekarang
  const handleBayarSekarang = async (pesananId: number) => {
    try {
      const response = await api.get(`/api/transaksi/snap-token/${pesananId}`);
      const { token } = response.data; // ✅ gunakan "token"

      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: () => {
            alert('✅ Pembayaran berhasil!');
            window.location.reload();
          },
          onPending: () => {
            alert('⏳ Menunggu pembayaran...');
          },
          onError: () => {
            alert('❌ Pembayaran gagal!');
          },
          onClose: () => {
            console.log('❎ Pembayaran dibatalkan user.');
          },
        });
      } else {
        alert('❗ Midtrans Snap belum dimuat.');
      }
    } catch (err) {
      console.error('❌ Gagal ambil token pembayaran:', err);
      alert('Gagal ambil token pembayaran.');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'settlement': return 'Lunas';
      case 'pending': return 'Belum Bayar';
      case 'expire':
      case 'cancel': return 'Dibatalkan';
      default: return status;
    }
  };

  const isBisaBayar = (status: string) =>
    ['pending', 'expire'].includes(status);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Daftar Pesanan</h1>
      {orders.length === 0 ? (
        <p>Tidak ada pesanan.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="p-4 border rounded-lg shadow-sm">
              <p><strong>ID:</strong> {order.id}</p>
              <p><strong>Total:</strong> Rp {order.total.toLocaleString('id-ID')}</p>
              <p><strong>Status:</strong> {getStatusLabel(order.status)}</p>
              <p><strong>Tanggal:</strong> {new Date(order.created_at).toLocaleDateString('id-ID')}</p>

              {order.items?.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold">🛒 Produk:</p>
                  <ul className="list-disc list-inside text-sm">
                    {order.items.map((item) => (
                      <li key={item.produk_id}>
                        {item.nama_produk} (x{item.quantity}) - Rp {item.price.toLocaleString('id-ID')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isBisaBayar(order.status) && (
                <button
                  onClick={() => handleBayarSekarang(order.id)}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                >
                  Bayar Sekarang
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders;
