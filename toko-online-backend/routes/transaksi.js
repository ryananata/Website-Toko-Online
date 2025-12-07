const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');

console.log('🎯 transaksiController.getTransaksiByUser:', transaksiController.getTransaksiByUser);

router.post('/token', transaksiController.createTransaction);
router.post('/callback', transaksiController.handleCallback);
router.get('/by-user/:user_id', transaksiController.getTransaksiByUser);
router.get('/snap-token/:pesanan_id', transaksiController.getSnapTokenByPesananId);

module.exports = router;
