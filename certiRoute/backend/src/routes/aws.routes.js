const express = require('express');
const { body, validationResult } = require('express-validator');
const awsService = require('../services/aws.service');

const router = express.Router();

/**
 * @route   POST /api/aws/credentials
 * @desc    Save AWS credentials
 * @access  Public
 */
router.post(
  '/credentials',
  [
    body('accessKeyId').notEmpty().withMessage('AWS Access Key ID is required'),
    body('secretAccessKey').notEmpty().withMessage('AWS Secret Access Key is required'),
    body('region').notEmpty().withMessage('AWS Region is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { accessKeyId, secretAccessKey, region } = req.body;
      
      // Validate credentials before saving
      const validationResult = await awsService.validateCredentials({
        accessKeyId,
        secretAccessKey,
        region
      });
      
      if (!validationResult.valid) {
        return res.status(400).json({ 
          error: 'Invalid AWS credentials', 
          details: validationResult.error 
        });
      }
      
      // Save credentials
      const result = await awsService.saveCredentials({
        accessKeyId,
        secretAccessKey,
        region
      });
      
      return res.status(200).json({ message: 'AWS credentials saved successfully' });
    } catch (error) {
      console.error('Error saving AWS credentials:', error);
      return res.status(500).json({ error: 'Failed to save AWS credentials' });
    }
  }
);

/**
 * @route   GET /api/aws/credentials/status
 * @desc    Check if AWS credentials are configured
 * @access  Public
 */
router.get('/credentials/status', async (req, res) => {
  try {
    const credentials = await awsService.getCredentials();
    return res.status(200).json({ 
      configured: !!credentials,
      region: credentials ? credentials.region : null
    });
  } catch (error) {
    console.error('Error checking AWS credentials status:', error);
    return res.status(500).json({ error: 'Failed to check AWS credentials status' });
  }
});

/**
 * @route   DELETE /api/aws/credentials
 * @desc    Delete stored AWS credentials
 * @access  Public
 */
router.delete('/credentials', async (req, res) => {
  try {
    const result = await awsService.deleteCredentials();
    if (result.success) {
      return res.status(200).json({ message: 'AWS credentials deleted successfully' });
    } else {
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error deleting AWS credentials:', error);
    return res.status(500).json({ error: 'Failed to delete AWS credentials' });
  }
});

/**
 * @route   POST /api/aws/credentials/validate
 * @desc    Validate AWS credentials
 * @access  Public
 */
router.post(
  '/credentials/validate',
  [
    body('accessKeyId').notEmpty().withMessage('AWS Access Key ID is required'),
    body('secretAccessKey').notEmpty().withMessage('AWS Secret Access Key is required'),
    body('region').notEmpty().withMessage('AWS Region is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { accessKeyId, secretAccessKey, region } = req.body;
      const result = await awsService.validateCredentials({
        accessKeyId,
        secretAccessKey,
        region
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error validating AWS credentials:', error);
      return res.status(500).json({ error: 'Failed to validate AWS credentials' });
    }
  }
);

module.exports = router; 