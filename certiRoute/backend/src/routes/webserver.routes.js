const express = require('express');
const webserverService = require('../services/webserver.service');

const router = express.Router();

/**
 * @route   GET /api/webserver/scan
 * @desc    Scan for web servers
 * @access  Public
 */
router.get('/scan', async (req, res) => {
  try {
    const detections = await webserverService.detectWebServers();
    return res.status(200).json({
      lastScan: new Date().toISOString(),
      detections
    });
  } catch (error) {
    console.error('Error scanning for web servers:', error);
    return res.status(500).json({ error: 'Failed to scan for web servers' });
  }
});

/**
 * @route   GET /api/webserver/detections
 * @desc    Get the last web server detections
 * @access  Public
 */
router.get('/detections', async (req, res) => {
  try {
    const data = await webserverService.getWebServerDetections();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error getting web server detections:', error);
    return res.status(500).json({ error: 'Failed to get web server detections' });
  }
});

/**
 * @route   GET /api/webserver/ports
 * @desc    Scan ports only
 * @access  Public
 */
router.get('/ports', async (req, res) => {
  try {
    const portScanResults = await webserverService.scanPorts();
    return res.status(200).json({
      scannedAt: new Date().toISOString(),
      ...portScanResults
    });
  } catch (error) {
    console.error('Error scanning ports:', error);
    return res.status(500).json({ error: 'Failed to scan ports' });
  }
});

module.exports = router; 