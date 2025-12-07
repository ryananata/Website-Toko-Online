import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { Produk } from '../types';
import { useCart } from '../contexts/CartContext';
import api from '../api/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Produk | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/produk/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('❌ Gagal fetch produk:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setIsAddingToCart(true);
    setTimeout(() => {
      addToCart(product);
      setIsAddingToCart(false);
    }, 300);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Produk tidak ditemukan</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Kembali</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={product.gambar}
            alt={product.nama}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.nama}</h1>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">(4.5)</span>
            </div>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-600">100+ terjual</span>
          </div>

          <div className="text-3xl font-bold text-purple-600">
            {formatPrice(product.harga)}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deskripsi</h3>
            <p className="text-gray-700">{product.deskripsi}</p>
          </div>

          <div className="text-sm text-gray-600">Stok: {product.stok}</div>

          <div className="flex mt-4">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <ShoppingCart size={20} />
              <span>{isAddingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
