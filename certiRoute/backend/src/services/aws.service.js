const AWS = require('aws-sdk');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

const CREDENTIALS_PATH = path.join(__dirname, '../data/aws-credentials.json');

// Simple encryption/decryption for storing credentials
// In production, use a proper secret management system
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ENCRYPTION_ALGORITHM = 'aes-256-ctr';

// Initialize filesystem
fs.ensureFileSync(CREDENTIALS_PATH);
if (!fs.readFileSync(CREDENTIALS_PATH).toString()) {
  fs.writeJSONSync(CREDENTIALS_PATH, {});
}

/**
 * Encrypt sensitive data
 */
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt sensitive data
 */
function decrypt(text) {
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Save AWS credentials
 */
async function saveCredentials(credentials) {
  const { accessKeyId, secretAccessKey, region } = credentials;
  
  const encryptedData = {
    accessKeyId: encrypt(accessKeyId),
    secretAccessKey: encrypt(secretAccessKey),
    region
  };

  await fs.writeJSON(CREDENTIALS_PATH, encryptedData, { spaces: 2 });
  
  return { success: true };
}

/**
 * Get AWS credentials
 */
async function getCredentials() {
  try {
    const encryptedData = await fs.readJSON(CREDENTIALS_PATH);
    
    if (!encryptedData.accessKeyId || !encryptedData.secretAccessKey) {
      return null;
    }
    
    return {
      accessKeyId: decrypt(encryptedData.accessKeyId),
      secretAccessKey: decrypt(encryptedData.secretAccessKey),
      region: encryptedData.region
    };
  } catch (error) {
    console.error('Error reading credentials:', error);
    return null;
  }
}

/**
 * Validate AWS credentials by making a test API call
 */
async function validateCredentials(credentials) {
  const { accessKeyId, secretAccessKey, region } = credentials;
  
  // Configure AWS with the provided credentials
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region: region || 'us-east-1'
  });
  
  try {
    // Try to list Route 53 hosted zones as a test
    const route53 = new AWS.Route53();
    await route53.listHostedZones().promise();
    return { valid: true };
  } catch (error) {
    console.error('AWS credentials validation failed:', error);
    return { valid: false, error: error.message };
  }
}

/**
 * Initialize AWS SDK with stored credentials
 */
async function initializeAwsSdk() {
  const credentials = await getCredentials();
  
  if (!credentials) {
    return { success: false, error: 'AWS credentials not found' };
  }
  
  AWS.config.update({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    region: credentials.region || 'us-east-1'
  });
  
  return { success: true };
}

/**
 * Delete stored AWS credentials
 */
async function deleteCredentials() {
  try {
    await fs.writeJSON(CREDENTIALS_PATH, {}, { spaces: 2 });
    return { success: true };
  } catch (error) {
    console.error('Error deleting credentials:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  saveCredentials,
  getCredentials,
  validateCredentials,
  initializeAwsSdk,
  deleteCredentials
}; 