const app = require('./app');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Ensure port is provided by environment or default to 5000
const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`🚀 KisanSetu Backend is running`);
    console.log(`🌍 Local URL: http://localhost:${PORT}`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===========================================`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
});
