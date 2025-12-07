import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const imageUrl = product.gambar
    ? product.gambar
    : '/default-product.jpg'; // Pastikan kamu punya gambar ini di folder /public

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={product.nama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.nama}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-purple-600">
            {formatPrice(product.harga)}
          </span>

          <Link
            to={`/produk/${product.id}`}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
