const mongoose = require('mongoose');

let cachedConnection = null;

async function connectToMongoDB(uri) {
  // Reuse existing connection (critical for serverless like Vercel)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
    return cachedConnection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    cachedConnection = null;
    // Do NOT call process.exit() — it kills Vercel serverless functions
    throw error;
  }
}

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
  cachedConnection = null;
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
  cachedConnection = null;
});

module.exports = {
  connectToMongoDB,
};