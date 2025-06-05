const express = require('express');
const { body, param, validationResult } = require('express-validator');
const sslService = require('../services/ssl.service');

const router = express.Router();

/**
 * @route   POST /api/ssl/generate
 * @desc    Generate SSL certificate for a subdomain
 * @access  Public
 */
router.post(
  '/generate',
  [
    body('subdomainId').notEmpty().withMessage('Subdomain ID is required'),
    body('webServerPort').isInt().withMessage('Web server port must be an integer')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { subdomainId, webServerPort } = req.body;
      const certificate = await sslService.generateCertificate(subdomainId, webServerPort);
      return res.status(201).json(certificate);
    } catch (error) {
      console.error('Error generating certificate:', error);
      return res.status(500).json({ error: 'Failed to generate certificate', details: error.message });
    }
  }
);

/**
 * @route   POST /api/ssl/install
 * @desc    Install SSL certificate
 * @access  Public
 */
router.post(
  '/install',
  [
    body('certId').notEmpty().withMessage('Certificate ID is required'),
    body('serverType').notEmpty().withMessage('Server type is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { certId, serverType } = req.body;
      const result = await sslService.installCertificate(certId, serverType);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error installing certificate:', error);
      return res.status(500).json({ error: 'Failed to install certificate', details: error.message });
    }
  }
);

/**
 * @route   GET /api/ssl/certificates
 * @desc    Get all SSL certificates
 * @access  Public
 */
router.get('/certificates', async (req, res) => {
  try {
    const certificates = await sslService.getCertificates();
    return res.status(200).json(certificates);
  } catch (error) {
    console.error('Error getting certificates:', error);
    return res.status(500).json({ error: 'Failed to get certificates' });
  }
});

/**
 * @route   GET /api/ssl/certificates/:id
 * @desc    Get a certificate by ID
 * @access  Public
 */
router.get('/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await sslService.getCertificateById(id);
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    return res.status(200).json(certificate);
  } catch (error) {
    console.error('Error getting certificate:', error);
    return res.status(500).json({ error: 'Failed to get certificate' });
  }
});

/**
 * @route   GET /api/ssl/certificates/subdomain/:subdomainId
 * @desc    Get certificates by subdomain ID
 * @access  Public
 */
router.get('/certificates/subdomain/:subdomainId', async (req, res) => {
  try {
    const { subdomainId } = req.params;
    const certificates = await sslService.getCertificatesBySubdomain(subdomainId);
    return res.status(200).json(certificates);
  } catch (error) {
    console.error('Error getting certificates by subdomain:', error);
    return res.status(500).json({ error: 'Failed to get certificates by subdomain' });
  }
});

/**
 * @route   DELETE /api/ssl/certificates/:id
 * @desc    Delete a certificate
 * @access  Public
 */
router.delete('/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sslService.deleteCertificate(id);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    return res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return res.status(500).json({ error: 'Failed to delete certificate', details: error.message });
  }
});

module.exports = router; 