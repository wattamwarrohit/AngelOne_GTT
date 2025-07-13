const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration for development
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
}

// Angel One API configuration
const ANGEL_ONE_BASE_URL = 'https://apiconnect.angelbroking.com';
let currentSession = null;

// Utility functions
function generateTOTP(secret) {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32'
  });
}

function generateChecksum(apiKey, clientCode, pin, totp) {
  const data = `${apiKey}${clientCode}${pin}${totp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// API Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { apiKey, clientCode, pin, totpSecret } = req.body;
    
    if (!apiKey || !clientCode || !pin || !totpSecret) {
      return res.status(400).json({ error: 'Missing required credentials' });
    }

    const totp = generateTOTP(totpSecret);
    const checksum = generateChecksum(apiKey, clientCode, pin, totp);

    const loginData = {
      apiKey,
      clientCode,
      pin,
      totp,
      checksum
    };

    const response = await axios.post(`${ANGEL_ONE_BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`, loginData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });

    if (response.data && response.data.data && response.data.data.jwtToken) {
      currentSession = {
        jwtToken: response.data.data.jwtToken,
        refreshToken: response.data.data.refreshToken,
        feedToken: response.data.data.feedToken,
        clientCode,
        apiKey
      };
      
      res.json({ 
        success: true, 
        message: 'Login successful',
        session: {
          clientCode,
          isActive: true
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Login failed', 
      details: error.response?.data?.message || error.message 
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  currentSession = null;
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/session/status', (req, res) => {
  res.json({ 
    isActive: !!currentSession,
    clientCode: currentSession?.clientCode || null
  });
});

// Holdings API
app.get('/api/holdings', async (req, res) => {
  try {
    if (!currentSession) {
      return res.status(401).json({ error: 'No active session' });
    }

    const response = await axios.get(`${ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/order/v1/getHolding`, {
      headers: {
        'Authorization': `Bearer ${currentSession.jwtToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Holdings error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch holdings',
      details: error.response?.data?.message || error.message
    });
  }
});

// Portfolio API
app.get('/api/portfolio', async (req, res) => {
  try {
    if (!currentSession) {
      return res.status(401).json({ error: 'No active session' });
    }

    const response = await axios.get(`${ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/order/v1/getPosition`, {
      headers: {
        'Authorization': `Bearer ${currentSession.jwtToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Portfolio error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch portfolio',
      details: error.response?.data?.message || error.message
    });
  }
});

// GTT Orders API
app.get('/api/gtt/orders', async (req, res) => {
  try {
    if (!currentSession) {
      return res.status(401).json({ error: 'No active session' });
    }

    const response = await axios.get(`${ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/order/v1/getGttOrderList`, {
      headers: {
        'Authorization': `Bearer ${currentSession.jwtToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('GTT orders error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch GTT orders',
      details: error.response?.data?.message || error.message
    });
  }
});

// Create GTT Order API
app.post('/api/gtt/create', async (req, res) => {
  try {
    if (!currentSession) {
      return res.status(401).json({ error: 'No active session' });
    }

    const { symbol, exchange, quantity, triggerPrice, limitPrice, orderType } = req.body;
    
    if (!symbol || !exchange || !quantity || !triggerPrice || !limitPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const gttData = {
      symbol,
      exchange,
      quantity,
      triggerPrice,
      limitPrice,
      orderType: orderType || 'BUY'
    };

    const response = await axios.post(`${ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/order/v1/placeGttOrder`, gttData, {
      headers: {
        'Authorization': `Bearer ${currentSession.jwtToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Create GTT error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create GTT order',
      details: error.response?.data?.message || error.message
    });
  }
});

// Search Instruments API
app.get('/api/search/instruments', async (req, res) => {
  try {
    if (!currentSession) {
      return res.status(401).json({ error: 'No active session' });
    }

    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    const response = await axios.get(`${ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/order/v1/searchScrip`, {
      params: { symbol },
      headers: {
        'Authorization': `Bearer ${currentSession.jwtToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Search instruments error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to search instruments',
      details: error.response?.data?.message || error.message
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Angel One Trading Dashboard server running on port ${PORT}`);
  console.log(`📊 Dashboard available at: http://localhost:${PORT}`);
  console.log(`🔐 API endpoints available at: http://localhost:${PORT}/api/`);
});