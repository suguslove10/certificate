const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Import routes
const awsRoutes = require('./routes/aws.routes');
const subdomainRoutes = require('./routes/subdomain.routes');
const webServerRoutes = require('./routes/webserver.routes');
const sslRoutes = require('./routes/ssl.routes');

// Initialize express
const app = express();

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
fs.ensureDirSync(dataDir);

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/aws', awsRoutes);
app.use('/api/subdomains', subdomainRoutes);
app.use('/api/webserver', webServerRoutes);
app.use('/api/ssl', sslRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'CertiRoute API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 