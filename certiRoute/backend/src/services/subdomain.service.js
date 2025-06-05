const AWS = require('aws-sdk');
const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fetch = require('node-fetch');
const awsService = require('./aws.service');

const SUBDOMAINS_PATH = path.join(__dirname, '../data/subdomains.json');

// Initialize filesystem
fs.ensureFileSync(SUBDOMAINS_PATH);
if (!fs.readFileSync(SUBDOMAINS_PATH).toString()) {
  fs.writeJSONSync(SUBDOMAINS_PATH, [], { spaces: 2 });
}

/**
 * Get public IP address of the host
 */
async function getPublicIpAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting public IP:', error);
    throw new Error('Failed to get public IP address');
  }
}

/**
 * List all hosted zones in Route53
 */
async function listHostedZones() {
  // Initialize AWS SDK
  const initResult = await awsService.initializeAwsSdk();
  if (!initResult.success) {
    throw new Error(initResult.error);
  }
  
  const route53 = new AWS.Route53();
  const result = await route53.listHostedZones().promise();
  
  return result.HostedZones.map(zone => ({
    id: zone.Id.replace('/hostedzone/', ''),
    name: zone.Name.endsWith('.') ? zone.Name.slice(0, -1) : zone.Name,
    recordCount: zone.ResourceRecordSetCount
  }));
}

/**
 * Create a subdomain in Route53
 */
async function createSubdomain(subdomain, hostedZoneId) {
  // Initialize AWS SDK
  const initResult = await awsService.initializeAwsSdk();
  if (!initResult.success) {
    throw new Error(initResult.error);
  }
  
  // Get the public IP address
  const publicIp = await getPublicIpAddress();
  
  // Get hosted zone details
  const route53 = new AWS.Route53();
  const hostedZoneResponse = await route53.getHostedZone({ Id: hostedZoneId }).promise();
  const zoneName = hostedZoneResponse.HostedZone.Name;
  const domainName = zoneName.endsWith('.') ? zoneName.slice(0, -1) : zoneName;
  
  // Full subdomain name
  const fullSubdomainName = `${subdomain}.${domainName}`;
  
  // Create DNS record
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: fullSubdomainName,
            ResourceRecords: [
              {
                Value: publicIp
              }
            ],
            TTL: 300,
            Type: 'A'
          }
        }
      ],
      Comment: `Created by CertiRoute for ${fullSubdomainName}`
    },
    HostedZoneId: hostedZoneId
  };
  
  // Add record to Route53
  await route53.changeResourceRecordSets(params).promise();
  
  // Save subdomain to local storage
  const subdomains = await fs.readJSON(SUBDOMAINS_PATH);
  const timestamp = new Date().toISOString();
  
  subdomains.push({
    id: `${subdomain}-${Date.now()}`,
    name: subdomain,
    fullName: fullSubdomainName,
    hostedZoneId,
    domainName,
    ipAddress: publicIp,
    createdAt: timestamp,
    updatedAt: timestamp,
    sslInstalled: false
  });
  
  await fs.writeJSON(SUBDOMAINS_PATH, subdomains, { spaces: 2 });
  
  return {
    subdomain: fullSubdomainName,
    ipAddress: publicIp
  };
}

/**
 * Get all subdomains
 */
async function getSubdomains() {
  try {
    return await fs.readJSON(SUBDOMAINS_PATH);
  } catch (error) {
    console.error('Error reading subdomains:', error);
    return [];
  }
}

/**
 * Get a subdomain by id
 */
async function getSubdomainById(id) {
  try {
    const subdomains = await fs.readJSON(SUBDOMAINS_PATH);
    return subdomains.find(s => s.id === id) || null;
  } catch (error) {
    console.error('Error reading subdomains:', error);
    return null;
  }
}

/**
 * Update subdomain SSL status
 */
async function updateSubdomainSslStatus(id, sslInstalled) {
  try {
    const subdomains = await fs.readJSON(SUBDOMAINS_PATH);
    const index = subdomains.findIndex(s => s.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Subdomain not found' };
    }
    
    subdomains[index].sslInstalled = sslInstalled;
    subdomains[index].updatedAt = new Date().toISOString();
    
    await fs.writeJSON(SUBDOMAINS_PATH, subdomains, { spaces: 2 });
    
    return { success: true, subdomain: subdomains[index] };
  } catch (error) {
    console.error('Error updating subdomain:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a subdomain
 */
async function deleteSubdomain(id) {
  try {
    // Initialize AWS SDK
    const initResult = await awsService.initializeAwsSdk();
    if (!initResult.success) {
      throw new Error(initResult.error);
    }
    
    // Get subdomain details
    const subdomains = await fs.readJSON(SUBDOMAINS_PATH);
    const index = subdomains.findIndex(s => s.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Subdomain not found' };
    }
    
    const subdomain = subdomains[index];
    
    // Delete DNS record
    const route53 = new AWS.Route53();
    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'DELETE',
            ResourceRecordSet: {
              Name: subdomain.fullName,
              ResourceRecords: [
                {
                  Value: subdomain.ipAddress
                }
              ],
              TTL: 300,
              Type: 'A'
            }
          }
        ],
        Comment: `Deleted by CertiRoute for ${subdomain.fullName}`
      },
      HostedZoneId: subdomain.hostedZoneId
    };
    
    await route53.changeResourceRecordSets(params).promise();
    
    // Remove from local storage
    subdomains.splice(index, 1);
    await fs.writeJSON(SUBDOMAINS_PATH, subdomains, { spaces: 2 });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting subdomain:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getPublicIpAddress,
  listHostedZones,
  createSubdomain,
  getSubdomains,
  getSubdomainById,
  updateSubdomainSslStatus,
  deleteSubdomain
}; 