export interface User {
  id: number;
  nama: string;
  email: string;
  no_wa: string;
}

export interface Produk {
  id: number;
  nama: string;
  deskripsi: string;
  harga: number;
  stok: number;
  gambar: string;
}

export interface CartItem {
  id: number;
  product: Produk;
  quantity: number;
}

export interface Order {
  id: number;
  user_id?: number; // Opsional karena backend tidak kirim ini
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | string; // Tambahkan string supaya fleksibel
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  produk_id: number;
  nama_produk: string;
  quantity: number; // Untuk frontend
  jumlah: number;    // Dari backend
  price: number;     // Untuk frontend
  harga_satuan: number; // Dari backend
}
