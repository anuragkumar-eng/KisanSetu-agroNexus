const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS (Allow local Vite frontend in development)
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));

// Enable JSON payload parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Public Endpoints ---

// Health Endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const isDbConnected = mongoose.connection.readyState === 1;

  res.json({
    success: true,
    message: 'KisanSetu API is running',
    database: isDbConnected ? 'connected' : 'disconnected'
  });
});

// --- API Route Placeholders ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/mandi', require('./routes/mandiRoutes'));
app.use('/api/lots', require('./routes/lotRoutes'));
app.use('/api/buyers', require('./routes/buyerRoutes'));
app.use('/api/requirements', require('./routes/requirementRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/transport', require('./routes/transportRoutes'));
app.use('/api/storage', require('./routes/storageRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/grievances', require('./routes/grievanceRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/net-realisation', require('./routes/netRealisationRoutes'));

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
