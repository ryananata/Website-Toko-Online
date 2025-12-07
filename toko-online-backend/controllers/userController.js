const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ambil semua user
exports.getAllUser = (req, res) => {
  db.query('SELECT id, nama, email, no_wa FROM user', (err, results) => {
    if (err) {
      console.error('❌ Gagal ambil data user:', err.message);
      return res.status(500).json({ error: 'Gagal ambil data user' });
    }
    res.json(results);
  });
};

// Register user baru
exports.register = async (req, res) => {
  const { nama, email, no_wa, password } = req.body;

  if (!nama || !email || !password) {
    return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO user (nama, email, no_wa, password) VALUES (?, ?, ?, ?)';

    db.query(sql, [nama, email, no_wa, hashedPassword], (err, result) => {
      if (err) {
        console.error('❌ Gagal register:', err.message);
        return res.status(500).json({ error: 'Gagal register' });
      }

      res.status(201).json({
        message: '✅ User terdaftar',
        id: result.insertId
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
};

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Email tidak ditemukan' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      'RAHASIA', // Gunakan proses.env.JWT_SECRET di production
      { expiresIn: '1d' }
    );

    res.json({
      message: '✅ Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        no_wa: user.no_wa
      }
    });
  });
};

// Update user
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { nama, email, no_wa } = req.body;
  const sql = 'UPDATE user SET nama = ?, email = ?, no_wa = ? WHERE id = ?';

  db.query(sql, [nama, email, no_wa, id], (err) => {
    if (err) {
      console.error('❌ Gagal update user:', err.message);
      return res.status(500).json({ error: 'Gagal update user' });
    }
    res.json({ message: '✅ User berhasil diupdate' });
  });
};

// Hapus user
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM user WHERE id = ?';

  db.query(sql, [id], (err) => {
    if (err) {
      console.error('❌ Gagal hapus user:', err.message);
      return res.status(500).json({ error: 'Gagal hapus user' });
    }
    res.json({ message: '✅ User berhasil dihapus' });
  });
};
