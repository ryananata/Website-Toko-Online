const db = require('../config/db');

// Ambil semua produk
exports.getAllProduk = (req, res) => {
  db.query('SELECT * FROM produk', (err, results) => {
    if (err) {
      console.error('❌ Error saat ambil data produk:', err.message);
      return res.status(500).json({ error: 'Gagal ambil data produk' });
    }

    const produkWithGambar = results.map((produk) => ({
      ...produk,
      gambar: produk.gambar
        ? `${req.protocol}://${req.get('host')}/uploads/${produk.gambar}`
        : null
    }));

    res.json(produkWithGambar);
  });
};

// Ambil produk berdasarkan ID
exports.getProdukById = (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM produk WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Gagal ambil produk:', err.message);
      return res.status(500).json({ error: 'Gagal ambil produk' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    const produk = results[0];
    produk.gambar = produk.gambar
      ? `${req.protocol}://${req.get('host')}/uploads/${produk.gambar}`
      : null;

    res.json(produk);
  });
};

// Tambah produk baru
exports.createProduk = (req, res) => {
  const { nama, deskripsi, harga, stok } = req.body;
  const gambar = req.file ? req.file.filename : null;

  if (!nama || !harga || !stok || !gambar) {
    return res.status(400).json({ error: 'Nama, harga, stok, dan gambar wajib diisi' });
  }

  const sql = 'INSERT INTO produk (nama, deskripsi, harga, stok, gambar) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nama, deskripsi, harga, stok, gambar], (err, result) => {
    if (err) {
      console.error('❌ Gagal tambah produk:', err.message);
      return res.status(500).json({ error: 'Gagal tambah produk' });
    }
    res.status(201).json({ message: '✅ Produk berhasil ditambahkan', id: result.insertId });
  });
};

// Update produk
exports.updateProduk = (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, harga, stok, gambar } = req.body;

  const sql = 'UPDATE produk SET nama = ?, deskripsi = ?, harga = ?, stok = ?, gambar = ? WHERE id = ?';
  db.query(sql, [nama, deskripsi, harga, stok, gambar, id], (err, result) => {
    if (err) {
      console.error('❌ Gagal update produk:', err.message);
      return res.status(500).json({ error: 'Gagal update produk' });
    }
    res.json({ message: '✅ Produk berhasil diupdate' });
  });
};

// Hapus produk
exports.deleteProduk = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM produk WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('❌ Gagal hapus produk:', err.message);
      return res.status(500).json({ error: 'Gagal hapus produk' });
    }
    res.json({ message: '✅ Produk berhasil dihapus' });
  });
};


