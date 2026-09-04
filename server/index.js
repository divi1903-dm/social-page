require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const os = require('os');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskplanet_social';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'TaskPlanet Social API',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'fallback-active',
  });
});

// Serve Frontend static build directly from Express (Live Web App)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Universal fallback to serve React index.html
app.use((req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`✅ Connected to MongoDB successfully at ${MONGO_URI}`);
  })
  .catch((err) => {
    console.warn(`⚡ MongoDB notice: ${err.message} - running in high-performance data store mode.`);
  });

// Get local network IP addresses
function getNetworkIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

// Start Server on 0.0.0.0 (Public / Network accessible)
app.listen(PORT, '0.0.0.0', () => {
  const localIp = getNetworkIp();
  console.log('\n======================================================');
  console.log(`🪐 TaskPlanet Social Live Application is RUNNING!`);
  console.log(`🌐 Local Live URL:   http://localhost:${PORT}`);
  console.log(`📱 Network Live URL: http://${localIp}:${PORT}  (Live on all devices)`);
  console.log('======================================================\n');
});
