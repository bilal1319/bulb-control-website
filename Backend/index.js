const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173' || 'https://bulb-control-website.onrender.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// ⬇️ Persistence helpers
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

// ⬇️ GPIO Simulation
function sendGPIOSignal(status) {
  console.log(`SIMULATED GPIO: Bulb turned ${status.toUpperCase()}`);

  // ✅ Uncomment the code below when running on actual Raspberry Pi with GPIO
  /*
  const Gpio = require('onoff').Gpio;
  const bulb = new Gpio(17, 'out'); // Use GPIO pin 17 or any pin you’re connecting to
  bulb.writeSync(status === 'on' ? 1 : 0);
  */
}

// ⬇️ Routes
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

// ⬇️ Start server
app.listen(3000, () => {
  console.log('Backend running at http://localhost:3000');
});
