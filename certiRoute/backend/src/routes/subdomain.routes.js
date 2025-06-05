const express = require('express');
const { body, param, validationResult } = require('express-validator');
const subdomainService = require('../services/subdomain.service');
const awsService = require('../services/aws.service');

const router = express.Router();

/**
 * @route   GET /api/subdomains/ip
 * @desc    Get public IP address
 * @access  Public
 */
router.get('/ip', async (req, res) => {
  try {
    const ip = await subdomainService.getPublicIpAddress();
    return res.status(200).json({ ip });
  } catch (error) {
    console.error('Error getting public IP:', error);
    return res.status(500).json({ error: 'Failed to get public IP address' });
  }
});

/**
 * @route   GET /api/subdomains/zones
 * @desc    Get all hosted zones
 * @access  Public
 */
router.get('/zones', async (req, res) => {
  try {
    // Check if AWS credentials are configured
    const credentials = await awsService.getCredentials();
    if (!credentials) {
      return res.status(400).json({ error: 'AWS credentials not configured' });
    }
    
    const zones = await subdomainService.listHostedZones();
    return res.status(200).json(zones);
  } catch (error) {
    console.error('Error listing hosted zones:', error);
    return res.status(500).json({ error: 'Failed to list hosted zones' });
  }
});

/**
 * @route   POST /api/subdomains
 * @desc    Create a subdomain
 * @access  Public
 */
router.post(
  '/',
  [
    body('subdomain').notEmpty().withMessage('Subdomain is required')
      .matches(/^[a-zA-Z0-9-]+$/).withMessage('Subdomain can only contain letters, numbers, and hyphens'),
    body('hostedZoneId').notEmpty().withMessage('Hosted Zone ID is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { subdomain, hostedZoneId } = req.body;
      
      // Check if AWS credentials are configured
      const credentials = await awsService.getCredentials();
      if (!credentials) {
        return res.status(400).json({ error: 'AWS credentials not configured' });
      }
      
      const result = await subdomainService.createSubdomain(subdomain, hostedZoneId);
      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating subdomain:', error);
      return res.status(500).json({ error: 'Failed to create subdomain', details: error.message });
    }
  }
);

/**
 * @route   GET /api/subdomains
 * @desc    Get all subdomains
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const subdomains = await subdomainService.getSubdomains();
    return res.status(200).json(subdomains);
  } catch (error) {
    console.error('Error getting subdomains:', error);
    return res.status(500).json({ error: 'Failed to get subdomains' });
  }
});

/**
 * @route   GET /api/subdomains/:id
 * @desc    Get a subdomain by id
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subdomain = await subdomainService.getSubdomainById(id);
    
    if (!subdomain) {
      return res.status(404).json({ error: 'Subdomain not found' });
    }
    
    return res.status(200).json(subdomain);
  } catch (error) {
    console.error('Error getting subdomain:', error);
    return res.status(500).json({ error: 'Failed to get subdomain' });
  }
});

/**
 * @route   DELETE /api/subdomains/:id
 * @desc    Delete a subdomain
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if AWS credentials are configured
    const credentials = await awsService.getCredentials();
    if (!credentials) {
      return res.status(400).json({ error: 'AWS credentials not configured' });
    }
    
    const result = await subdomainService.deleteSubdomain(id);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    return res.status(200).json({ message: 'Subdomain deleted successfully' });
  } catch (error) {
    console.error('Error deleting subdomain:', error);
    return res.status(500).json({ error: 'Failed to delete subdomain', details: error.message });
  }
});

module.exports = router; 