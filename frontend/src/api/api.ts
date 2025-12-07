import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tambahkan token dari localStorage jika ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Tambahan: Fungsi ambil data produk =====
export const fetchProduk = async () => {
  const response = await api.get('/api/produk');
  return response.data;
};

export const createTransaction = async (pesanan_id: number) => {
  const response = await api.post('/transaksi/token', { pesanan_id });
  return response.data;
};

export default api;
