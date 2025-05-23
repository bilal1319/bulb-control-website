const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://bulb-control-website.onrender.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// File to persist bulb status
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

function sendGPIOSignal(status) {
  console.log(`SIMULATED GPIO: Bulb turned ${status.toUpperCase()}`);
  // Actual GPIO code can be uncommented on Raspberry Pi:
  /*
  const Gpio = require('onoff').Gpio;
  const bulb = new Gpio(17, 'out');
  bulb.writeSync(status === 'on' ? 1 : 0);
  */
}

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../Frontend/dist')));

  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../Frontend/dist/index.html'));
  });
}


// API routes
app.get('/api/bulb-status', (req, res) => {
  res.json({ status: bulbStatus });
});

app.post('/api/toggle-bulb', (req, res) => {
  const { status } = req.body;
  if (status !== 'on' && status !== 'off') {
    return res.status(400).json({ message: 'Invalid status' });
  }
  bulbStatus = status;
  saveStatus(status);
  sendGPIOSignal(status);
  res.json({ message: `Bulb is now ${status}` });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
