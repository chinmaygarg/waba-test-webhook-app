// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// In-memory storage for last WhatsApp message
let lastWhatsAppMessage = null;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // Store the last received message in memory
  lastWhatsAppMessage = {
    data: req.body,
    timestamp: new Date().toISOString(),
    received_at: Date.now()
  };

  res.status(200).end();
});

// API endpoint to get the last received WhatsApp message
app.get('/api/last-message', (req, res) => {
  if (lastWhatsAppMessage) {
    res.json(lastWhatsAppMessage);
  } else {
    res.status(404).json({
      message: "No messages received yet",
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    lastMessageReceived: lastWhatsAppMessage ? lastWhatsAppMessage.timestamp : null
  });
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
