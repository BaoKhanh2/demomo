const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
}));

// Parse JSON bodies
app.use(express.json());

// Proxy for localhost:8070 (User service)
app.use('/api/users', createProxyMiddleware({
  target: 'http://localhost:8070',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/users'
  },
  onError: (err, req, res) => {
    console.error('Proxy error for users:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Proxy for localhost:8060 (Product service)
app.use('/api/products', createProxyMiddleware({
  target: 'http://localhost:8060',
  changeOrigin: true,
  pathRewrite: {
    '^/api/products': '/products'
  },
  onError: (err, req, res) => {
    console.error('Proxy error for products:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Proxy for localhost:8000 (Gateway service)
app.use('/api/gateway', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/gateway': ''
  },
  onError: (err, req, res) => {
    console.error('Proxy error for gateway:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CORS Proxy Server is running',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'CORS Proxy Server for Admin Panel',
    endpoints: [
      'GET /health - Health check',
      'ALL /api/users/* - Proxy to localhost:8070/users/*',
      'ALL /api/products/* - Proxy to localhost:8060/products/*',
      'ALL /api/gateway/* - Proxy to localhost:8000/*'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying:`);
  console.log(`   - /api/users/* → http://localhost:8070/users/*`);
  console.log(`   - /api/products/* → http://localhost:8060/products/*`);
  console.log(`   - /api/gateway/* → http://localhost:8000/*`);
});

module.exports = app;
