# CertiRoute

CertiRoute is a comprehensive Dockerized web application for managing AWS credentials, subdomains, and SSL certificates. It provides a user-friendly interface to handle Route53 DNS records, detect web servers, and issue/install SSL certificates.

## Features

- **AWS Credentials Management**: Securely store and manage AWS credentials through the web UI
- **Subdomain Management**: Create and manage subdomains using Route53
- **Web Server Detection**: Automatically detect web servers running on the host machine
- **SSL Certificate Management**: Issue and install SSL certificates for your subdomains

## Prerequisites

- Docker and Docker Compose
- AWS account with Route53 access
- A domain managed by Route53

## Getting Started

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/certiroute.git
   cd certiroute
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the web interface at http://localhost:3000

### Usage

#### 1. Configure AWS Credentials

1. Navigate to the "AWS Credentials" page
2. Enter your AWS Access Key ID, Secret Access Key, and select your preferred region
3. Click "Validate Credentials" to verify they work correctly
4. Click "Save Credentials" to store them securely

#### 2. Create a Subdomain

1. Navigate to the "Subdomains" page
2. Click "Create Subdomain"
3. Enter the subdomain name and select the hosted zone
4. Click "Create" to create the subdomain in Route53
5. The application will automatically use your public IP address

#### 3. Detect Web Servers

1. Navigate to the "Web Servers" page
2. Click "Scan for Web Servers"
3. The application will detect any web servers running on common ports
4. View details about detected web servers

#### 4. Issue and Install SSL Certificates

1. Navigate to the "SSL Certificates" page
2. Click "Generate Certificate" for a subdomain
3. Select the web server where you want to install the certificate
4. Click "Install Certificate" to configure the web server with SSL

## Architecture

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Database**: File-based storage (JSON)
- **Containerization**: Docker with Docker Compose

## Security Considerations

- AWS credentials are encrypted before storage
- The application runs with the necessary permissions to detect web servers
- SSL certificates are stored securely

## Development

To run the application in development mode:

```bash
docker-compose up
```

## License

MIT 