const express = require('express');
const router = express.Router();
const pesananController = require('../controllers/pesananController');

// Route utama pesanan
router.get('/', pesananController.getAllPesanan);
router.post('/', pesananController.createPesanan);
router.put('/:id', pesananController.updatePesanan);
router.delete('/:id', pesananController.deletePesanan);

// Ambil pesanan berdasarkan user ID
router.get('/user/:user_id', pesananController.getPesananByUserId);

module.exports = router;
