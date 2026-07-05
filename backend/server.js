const express = require('express');
const prisma = require('./models/db');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');

// Process-level error handling for production stability
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

dotenv.config();

const app = express();

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[REQ] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Time: ${duration}ms`);
  });
  next();
});

// Get local IP address for network access
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

app.use(cors({
  origin: [
    "https://www.shuddheats.co.in",
    "https://shuddheats.co.in",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({ extended: true }));

// Routes
// Serve uploaded product images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/twofa', require('./routes/twofa'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payment', require('./routes/payment'));

// Health check
app.get('/', (req, res) => {
  res.status(200).send('Backend running');
});

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      prisma: 'connected',
      environment: 'loaded'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'ShuddhEats API is running but Database connection failed',
      database: 'Disconnected',
      error: error.message,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend is live' });
});

// Global error handling middleware for production stability
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Connect Database and start server
const PORT = process.env.PORT || 5000;

// Lazy-connect Prisma: We no longer wrap app.listen inside $connect
// This prevents the server from crashing if the DB is temporarily unavailable at startup
prisma.$connect()
  .then(() => {
    console.log('✅ PostgreSQL Connected');
    console.log('✅ Prisma Connected');
  })
  .catch((err) => {
    console.error('❌ Database connection error:');
    console.error(err);
    console.error(err.stack);
  });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ShuddhEats Server running on:`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Network: http://${localIP}:${PORT}`);
  console.log(`   - Health: http://localhost:${PORT}/health\n`);
});

module.exports = app;
