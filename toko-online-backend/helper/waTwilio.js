const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886';

/**
 * Kirim pesan WA
 * @param {string} to - Nomor tujuan seperti 6285xxxxx
 * @param {string} message - Isi pesan
 */
const sendWa = async (to, message) => {
  try {
    // Tambahkan prefix "+" jika belum ada
    const normalized = to.startsWith('+') ? to : `+${to}`;
    const formatted = `whatsapp:${normalized}`;

    const msg = await client.messages.create({
      body: message,
      from: TWILIO_WHATSAPP_NUMBER,
      to: formatted
    });

    console.log('📤 WA berhasil dikirim! SID:', msg.sid);
    return msg.sid;
  } catch (error) {
    console.error('❌ Gagal kirim WA:', error.message);
    return null;
  }
};

module.exports = { sendWa };
