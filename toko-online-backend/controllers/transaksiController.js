const midtransClient = require('midtrans-client');
const db = require('../config/db');
const { sendWa } = require('../helper/waTwilio');

require('dotenv').config();

// Ambil nomor admin dari environment
const ADMIN_WA_NUMBER = process.env.ADMIN_WA_NUMBER || '+6285792175032';

// Membuat transaksi baru
exports.createTransaction = (req, res) => {
  const { pesanan_id } = req.body;

  if (!pesanan_id) {
    return res.status(400).json({ error: 'pesanan_id wajib diisi' });
  }

  const sql = `
    SELECT ps.id AS pesanan_id, ps.total_harga, ps.status, ps.user_id,
           u.nama, u.email
    FROM pesanan ps
    JOIN user u ON ps.user_id = u.id
    WHERE ps.id = ?
  `;

  db.query(sql, [pesanan_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal ambil data pesanan' });
    if (results.length === 0) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

    const pesanan = results[0];
    if (pesanan.status !== 'Belum Bayar') {
      return res.status(400).json({ error: 'Pesanan sudah dibayar atau dibatalkan' });
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY
    });

    const order_id = `ORDER-${pesanan_id}-${Date.now()}`;
    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: pesanan.total_harga
      },
      customer_details: {
        first_name: pesanan.nama,
        email: pesanan.email
      },
      callbacks: {
        finish: 'http://localhost:5173/' // ✅ Redirect ke halaman Home setelah transaksi selesai
      }
    };

    snap.createTransaction(parameter)
      .then(transaction => {
        const snapToken = transaction.token;
        const insertSQL = `
          INSERT INTO transaksi (pesanan_id, user_id, order_id, snap_token, status)
          VALUES (?, ?, ?, ?, 'Belum Bayar')
        `;

        db.query(insertSQL, [pesanan_id, pesanan.user_id, order_id, snapToken], (err) => {
          if (err) return res.status(500).json({ error: 'Gagal simpan transaksi' });

          res.json({
            message: '✅ Transaksi berhasil dibuat',
            order_id,
            token: snapToken
          });
        });
      })
      .catch(error => {
        console.error('❌ Midtrans error:', error.message);
        res.status(500).json({ error: 'Gagal membuat token pembayaran' });
      });
  });
};


// Callback dari Midtrans
exports.handleCallback = (req, res) => {
  const { order_id, transaction_status } = req.body;

  if (!order_id || !transaction_status) {
    return res.status(400).json({ error: 'order_id dan transaction_status wajib dikirim' });
  }

  const updateSQL = 'UPDATE transaksi SET status = ? WHERE order_id = ?';
  db.query(updateSQL, [transaction_status, order_id], (err) => {
    if (err) return res.status(500).json({ error: 'Gagal update status transaksi' });

    const updatePesanan = `
      UPDATE pesanan SET status = ?
      WHERE id = (SELECT pesanan_id FROM transaksi WHERE order_id = ?)
    `;
    db.query(updatePesanan, [transaction_status, order_id], (err2) => {
      if (err2) console.error('⚠️ Gagal update status pesanan:', err2.message);
    });

    // Jika berhasil dibayar, kirim WA
    if (transaction_status === 'settlement') {
      const infoSQL = `
        SELECT u.nama, u.no_wa, ps.total_harga
        FROM transaksi t
        JOIN user u ON t.user_id = u.id
        JOIN pesanan ps ON t.pesanan_id = ps.id
        WHERE t.order_id = ?
      `;

      db.query(infoSQL, [order_id], async (err3, rows) => {
        if (!err3 && rows.length > 0) {
          const user = rows[0];
          const formatted = parseInt(user.total_harga).toLocaleString('id-ID');
          const userWa = user.no_wa.startsWith('+') ? user.no_wa : `+${user.no_wa}`;

          const userMsg = `✅ Halo ${user.nama}, pembayaran sebesar Rp${formatted} telah berhasil. Terima kasih telah berbelanja!`;
          const adminMsg = `📥 Pesanan dari ${user.nama} sebesar Rp${formatted} telah dibayar. Silakan cek dashboard.`;

          try {
            await sendWa(userWa, userMsg);
            await sendWa(ADMIN_WA_NUMBER, adminMsg);
          } catch (errWa) {
            console.error('❌ Error kirim WA:', errWa.message);
          }
        }
      });
    }

    console.log(`✅ Callback: status ${order_id} -> ${transaction_status}`);
    res.status(200).json({ message: 'Status transaksi diperbarui' });
  });
};

// Get transaksi by user_id
exports.getTransaksiByUser = (req, res) => {
  const userId = req.params.user_id;

  const sql = `
    SELECT t.*, ps.total_harga, ps.status AS status_pesanan
    FROM transaksi t
    LEFT JOIN pesanan ps ON t.pesanan_id = ps.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal ambil data transaksi' });
    res.json(results);
  });
};


// GET /api/transaksi/snap-token/:pesanan_id
exports.getSnapTokenByPesananId = (req, res) => {
  const { pesanan_id } = req.params;

  const sql = 'SELECT snap_token FROM transaksi WHERE pesanan_id = ? ORDER BY created_at DESC LIMIT 1';
  db.query(sql, [pesanan_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal ambil token' });
    if (results.length === 0) return res.status(404).json({ error: 'Token tidak ditemukan' });

    res.json({ token: results[0].snap_token }); // ✅ Ubah jadi "token"
  });
};
