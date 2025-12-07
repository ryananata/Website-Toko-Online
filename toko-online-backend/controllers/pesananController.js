const db = require('../config/db');

// Ambil semua pesanan (jika dibutuhkan untuk admin)
exports.getAllPesanan = (req, res) => {
  db.query('SELECT * FROM pesanan', (err, results) => {
    if (err) {
      console.error('❌ Gagal ambil data pesanan:', err.message);
      return res.status(500).json({ error: 'Gagal ambil data pesanan' });
    }
    res.json(results);
  });
};

// POST tambah pesanan (multi-produk)
exports.createPesanan = (req, res) => {
  const { user_id, items } = req.body;

  if (!user_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'user_id dan items wajib diisi' });
  }

  const produkIds = items.map(item => item.produk_id);
  const placeholders = produkIds.map(() => '?').join(',');
  const getHargaSQL = `SELECT id, harga FROM produk WHERE id IN (${placeholders})`;

  db.query(getHargaSQL, produkIds, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Gagal ambil harga produk' });

    const hargaMap = {};
    rows.forEach(row => hargaMap[row.id] = row.harga);

    let total_harga = 0;
    items.forEach(item => {
      const harga = hargaMap[item.produk_id] || 0;
      total_harga += harga * item.jumlah;
    });

    const insertPesananSQL = `INSERT INTO pesanan (user_id, total_harga) VALUES (?, ?)`;
    db.query(insertPesananSQL, [user_id, total_harga], (err, result) => {
      if (err) return res.status(500).json({ error: 'Gagal simpan pesanan' });

      const pesanan_id = result.insertId;
      const pesananItems = items.map(item => [
        pesanan_id,
        item.produk_id,
        item.jumlah,
        hargaMap[item.produk_id]
      ]);

      const insertItemSQL = `
        INSERT INTO pesanan_item (pesanan_id, produk_id, jumlah, harga_satuan)
        VALUES ?
      `;

      db.query(insertItemSQL, [pesananItems], (err2) => {
        if (err2) return res.status(500).json({ error: 'Gagal simpan item pesanan' });

        res.status(201).json({
          message: '✅ Pesanan berhasil ditambahkan',
          pesanan_id,
          total_harga
        });
      });
    });
  });
};

// PUT update status manual (opsional)
exports.updatePesanan = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sql = 'UPDATE pesanan SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err) => {
    if (err) {
      console.error('❌ Gagal update pesanan:', err.message);
      return res.status(500).json({ error: 'Gagal update pesanan' });
    }
    res.json({ message: '✅ Status pesanan berhasil diupdate' });
  });
};

// DELETE pesanan
exports.deletePesanan = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM pesanan WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('❌ Gagal hapus pesanan:', err.message);
      return res.status(500).json({ error: 'Gagal hapus pesanan' });
    }
    res.json({ message: '✅ Pesanan berhasil dihapus' });
  });
};

// GET pesanan berdasarkan user_id (lengkap dengan item & status dari transaksi)
exports.getPesananByUserId = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT 
      p.id AS pesanan_id,
      p.total_harga AS total,
      COALESCE(t.status, 'belum bayar') AS status,
      p.created_at,
      pr.id AS produk_id,
      pr.nama AS nama_produk,
      pi.jumlah,
      pi.harga_satuan
    FROM pesanan p
    JOIN pesanan_item pi ON p.id = pi.pesanan_id
    JOIN produk pr ON pi.produk_id = pr.id
    LEFT JOIN transaksi t ON t.pesanan_id = p.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `;

  db.query(sql, [user_id], (err, rows) => {
    if (err) {
      console.error('❌ Gagal ambil pesanan user:', err.message);
      return res.status(500).json({ error: 'Gagal ambil pesanan user' });
    }

    // Grup hasil berdasarkan pesanan_id
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.pesanan_id]) {
        grouped[row.pesanan_id] = {
          id: row.pesanan_id,
          total: row.total,
          status: row.status,
          created_at: row.created_at,
          items: []
        };
      }

      grouped[row.pesanan_id].items.push({
        produk_id: row.produk_id,
        nama_produk: row.nama_produk,
        jumlah: row.jumlah,
        harga_satuan: row.harga_satuan
      });
    });

    res.json(Object.values(grouped));
  });
};
