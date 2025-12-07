const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();

require('./config/db');

app.use(cors());
app.use(bodyParser.json());

// ROUTES
const produkRoute = require('./routes/produk');
app.use('/api/produk', produkRoute);

const pesananRoutes = require('./routes/pesanan');
app.use('/api/pesanan', pesananRoutes);


const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const transaksiRoutes = require('./routes/transaksi');
app.use('/api/transaksi', transaksiRoutes);

app.use('/uploads', express.static('uploads'));



// START SERVER
app.listen(3000, () => console.log('✅ Server berjalan di http://localhost:3000'));


