const express = require('express');
const path = require('path');
const { createBareServer } = require('@tomphttp/bare-server-node');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer();

// Create Bare server for proxy
const bareServer = createBareServer('/bare/');

// Serve static files (all your HTML, CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

// Main entry point - serves index.html which redirects to home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback routes for HTML pages
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/games', (req, res) => {
  res.sendFile(path.join(__dirname, 'games.html'));
});

app.get('/apps', (req, res) => {
  res.sendFile(path.join(__dirname, 'apps.html'));
});

app.get('/browser', (req, res) => {
  res.sendFile(path.join(__dirname, 'browser.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'settings.html'));
});

app.get('/proxy', (req, res) => {
  res.sendFile(path.join(__dirname, 'proxy.html'));
});

// Legal pages
app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'terms.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});

app.get('/dmca', (req, res) => {
  res.sendFile(path.join(__dirname, 'dmca.html'));
});

// Handle bare server requests
server.on('request', (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on('upgrade', (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

server.on('listening', () => {
  console.log(`\n🚀 Nova is running!`);
  console.log(`📍 Local:            http://localhost:${PORT}`);
  console.log(`🔧 Proxy endpoint:   http://localhost:${PORT}/bare/`);
  console.log(`\n✨ Ready to deploy to Vercel!\n`);
});

server.listen(PORT);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Nova...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
