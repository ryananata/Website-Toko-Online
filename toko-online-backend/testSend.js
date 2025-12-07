// testSend.js
require('dotenv').config(); // pastikan .env bisa dibaca
const { sendWhatsApp } = require('./helper/wa');

// Ganti dengan nomor WA tujuan yang valid (dalam format internasional, tanpa tanda +)
const targetPhone = '6285792175032'; // contoh nomor
const message = 'Halo! Ini adalah pesan tes dari sistem kamu.';

sendWhatsApp(targetPhone, message)
  .then(result => {
    console.log('📤 Hasil kirim:', result);
  })
  .catch(err => {
    console.error('❌ Error kirim WA:', err);
  });
