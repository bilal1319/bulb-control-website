const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

const allowedOrigins = ['http://localhost:5173', 'https://bulb-control-website.onrender.com'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy does not allow this origin'), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Persistence helpers
const statusFile = path.join(__dirname, 'bulb-status.json');

function saveStatus(status) {
  fs.writeFileSync(statusFile, JSON.stringify({ status }), 'utf-8');
}

function loadStatus() {
  try {
    const data = fs.readFileSync(statusFile, 'utf-8');
    return JSON.parse(data).status;
  } catch {
    return 'off'; // default
  }
}

let bulbStatus = loadStatus();

// GPIO Simulation
function sendGPIOSignal(status) {
  console.log(`SIMULATED GPIO: Bulb turned ${status.toUpperCase()}`);

  /*
  const Gpio = require('onoff').Gpio;
  const bulb = new Gpio(17, 'out');
  bulb.writeSync(status === 'on' ? 1 : 0);
  */
}

// API routes
app.post('/api/toggle-bulb', (req, res) => {
  const { status } = req.body;
  bulbStatus = status;
  saveStatus(status);
  sendGPIOSignal(status);
  res.json({ message: `Bulb is now ${status}` });
});

app.get('/api/bulb-status', (req, res) => {
  res.json({ status: bulbStatus });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../Frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
