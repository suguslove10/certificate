const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const acme = require('acme-client');
const subdomainService = require('./subdomain.service');

const SSL_DATA_PATH = path.join(__dirname, '../data/ssl-data.json');
const CERTS_DIR = path.join(__dirname, '../data/certs');

// Initialize filesystem
fs.ensureFileSync(SSL_DATA_PATH);
if (!fs.readFileSync(SSL_DATA_PATH).toString()) {
  fs.writeJSONSync(SSL_DATA_PATH, [], { spaces: 2 });
}
fs.ensureDirSync(CERTS_DIR);

/**
 * Generate a Let's Encrypt certificate using HTTP-01 challenge
 * 
 * Note: This is a simplified implementation. In production, you would need to:
 * 1. Handle setting up the HTTP-01 challenge properly
 * 2. Configure web servers for automatic cert installation
 * 3. Handle certificate renewal
 */
async function generateCertificate(subdomainId, webServerPort) {
  // Get subdomain details
  const subdomain = await subdomainService.getSubdomainById(subdomainId);
  if (!subdomain) {
    throw new Error('Subdomain not found');
  }

  // Create directory for this domain's certs
  const domainCertDir = path.join(CERTS_DIR, subdomain.fullName);
  fs.ensureDirSync(domainCertDir);

  // Create a new ACME client
  const client = new acme.Client({
    directoryUrl: acme.directory.letsencrypt.staging,  // Use staging for testing
    accountKey: await acme.forge.createPrivateKey()
  });

  try {
    // 1. Create a CSR
    console.log('Creating Certificate Signing Request...');
    const [key, csr] = await acme.forge.createCsr({
      commonName: subdomain.fullName,
      altNames: [subdomain.fullName]
    });

    // 2. Get certificate
    console.log('Requesting certificate...');
    
    // In a real implementation, you would:
    // - Set up HTTP server to respond to ACME challenges
    // - Handle authorization challenges properly
    // For this example, we're simulating the process

    // Store the cert info
    const timestamp = new Date().toISOString();
    const certInfo = {
      id: `cert-${Date.now()}`,
      subdomainId: subdomain.id,
      domain: subdomain.fullName,
      createdAt: timestamp,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      webServerPort,
      certPath: path.join(domainCertDir, 'cert.pem'),
      keyPath: path.join(domainCertDir, 'privkey.pem'),
      fullchainPath: path.join(domainCertDir, 'fullchain.pem'),
      status: 'simulated' // In a real implementation, this would be 'valid'
    };

    // Save empty files to simulate certificate files
    // In a real implementation, these would contain actual certificate data
    await fs.writeFile(certInfo.certPath, 'SIMULATED CERTIFICATE');
    await fs.writeFile(certInfo.keyPath, 'SIMULATED PRIVATE KEY');
    await fs.writeFile(certInfo.fullchainPath, 'SIMULATED FULLCHAIN');

    // Save cert info
    const certs = await fs.readJSON(SSL_DATA_PATH);
    certs.push(certInfo);
    await fs.writeJSON(SSL_DATA_PATH, certs, { spaces: 2 });

    // Update subdomain SSL status
    await subdomainService.updateSubdomainSslStatus(subdomainId, true);

    return certInfo;

    /* In a real implementation, the certificate would be obtained like this:
    const cert = await client.auto({
      csr,
      email: 'admin@example.com',
      termsOfServiceAgreed: true,
      challengePriority: ['http-01'],
      challengeCreateFn: async (authz, challenge, keyAuthorization) => {
        // This function would set up the challenge response on your web server
        // e.g., create a file at /.well-known/acme-challenge/${challenge.token}
        // with content: keyAuthorization
      },
      challengeRemoveFn: async (authz, challenge) => {
        // This function would clean up after the challenge
      }
    });

    // Write the certificate files
    await fs.writeFile(certInfo.certPath, cert.cert);
    await fs.writeFile(certInfo.keyPath, key.toString());
    await fs.writeFile(certInfo.fullchainPath, cert.fullchain);
    */

  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
}

/**
 * Install certificate in a web server
 */
async function installCertificate(certId, serverType) {
  // Get certificate info
  const certs = await fs.readJSON(SSL_DATA_PATH);
  const certInfo = certs.find(c => c.id === certId);
  
  if (!certInfo) {
    throw new Error('Certificate not found');
  }
  
  // For demo purposes, let's just simulate installation based on server type
  let installationSteps = [];
  
  if (serverType === 'nginx') {
    installationSteps = [
      'Backing up existing configuration...',
      'Creating Nginx configuration for SSL...',
      'Linking certificate files...',
      'Testing configuration...',
      'Reloading Nginx...'
    ];
  } else if (serverType === 'apache') {
    installationSteps = [
      'Backing up existing configuration...',
      'Enabling SSL module...',
      'Creating Apache configuration for SSL...',
      'Linking certificate files...',
      'Testing configuration...',
      'Reloading Apache...'
    ];
  } else if (serverType.includes('node')) {
    installationSteps = [
      'Generating sample code for Node.js HTTPS server...',
      'Linking certificate files...'
    ];
  } else {
    installationSteps = [
      'Generating generic installation instructions...',
      'Linking certificate files...'
    ];
  }
  
  // Simulate installation process
  for (const step of installationSteps) {
    console.log(step);
    // In a real implementation, we would execute actual commands here
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Update certificate status
  const index = certs.findIndex(c => c.id === certId);
  certs[index].status = 'installed';
  certs[index].installedAt = new Date().toISOString();
  certs[index].serverType = serverType;
  
  await fs.writeJSON(SSL_DATA_PATH, certs, { spaces: 2 });
  
  return { 
    success: true,
    message: `SSL certificate installed successfully for ${certInfo.domain} on ${serverType}`,
    steps: installationSteps
  };
}

/**
 * Get all certificates
 */
async function getCertificates() {
  try {
    return await fs.readJSON(SSL_DATA_PATH);
  } catch (error) {
    console.error('Error reading certificates:', error);
    return [];
  }
}

/**
 * Get certificate by ID
 */
async function getCertificateById(id) {
  try {
    const certs = await fs.readJSON(SSL_DATA_PATH);
    return certs.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Error reading certificates:', error);
    return null;
  }
}

/**
 * Get certificates by subdomain ID
 */
async function getCertificatesBySubdomain(subdomainId) {
  try {
    const certs = await fs.readJSON(SSL_DATA_PATH);
    return certs.filter(c => c.subdomainId === subdomainId);
  } catch (error) {
    console.error('Error reading certificates:', error);
    return [];
  }
}

/**
 * Delete a certificate
 */
async function deleteCertificate(id) {
  try {
    const certs = await fs.readJSON(SSL_DATA_PATH);
    const index = certs.findIndex(c => c.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Certificate not found' };
    }
    
    const certInfo = certs[index];
    
    // Delete certificate files if they exist
    try {
      await fs.remove(path.dirname(certInfo.certPath));
    } catch (error) {
      console.error('Error removing certificate files:', error);
    }
    
    // Remove from storage
    certs.splice(index, 1);
    await fs.writeJSON(SSL_DATA_PATH, certs, { spaces: 2 });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateCertificate,
  installCertificate,
  getCertificates,
  getCertificateById,
  getCertificatesBySubdomain,
  deleteCertificate
}; 