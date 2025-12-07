const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const produkController = require('../controllers/produkController');

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Route GET semua produk
router.get('/', produkController.getAllProduk);

// Route GET produk by ID
router.get('/:id', produkController.getProdukById);

// Route POST tambah produk dengan upload gambar
router.post('/', upload.single('gambar'), produkController.createProduk);

// Route PUT update produk
router.put('/:id', produkController.updateProduk);

// Route DELETE produk
router.delete('/:id', produkController.deleteProduk);

module.exports = router;
