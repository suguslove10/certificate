# CertiRoute - Application Architecture

CertiRoute is a comprehensive Dockerized web application for managing AWS credentials, subdomains, and SSL certificates. This document provides an overview of the application architecture.

## Overview

The application consists of three main components:

1. **Frontend**: A React.js application with Material-UI for the user interface
2. **Backend**: A Node.js Express API for handling business logic
3. **Nginx**: A reverse proxy for routing requests and handling SSL certificates

## Docker Composition

The application is containerized using Docker and orchestrated with Docker Compose:

- **Frontend Container**: Serves the React application on port 3000
- **Backend Container**: Runs the Express API on port 5000
- **Nginx Container**: Acts as a reverse proxy on ports 80 and 443

## Backend Architecture

The backend follows a modular architecture with the following components:

### Services

1. **AWS Service**: Manages AWS credentials, encryption, and SDK initialization
2. **Subdomain Service**: Handles Route53 DNS record creation and management
3. **Web Server Service**: Detects web servers running on the host machine
4. **SSL Service**: Issues and installs SSL certificates

### Routes

1. **AWS Routes**: API endpoints for AWS credential management
2. **Subdomain Routes**: API endpoints for subdomain management
3. **Web Server Routes**: API endpoints for web server detection
4. **SSL Routes**: API endpoints for SSL certificate management

### Data Storage

The application uses file-based storage for:
- AWS credentials (encrypted)
- Subdomain information
- Web server detection results
- SSL certificate data

## Frontend Architecture

The frontend is built with React and follows a modern architecture:

### State Management

- **Redux Toolkit**: For global state management
- **Redux Slices**: Modular state management for each feature

### Components

- **Layout**: Main application layout with navigation
- **Pages**: Individual pages for each feature
- **Components**: Reusable UI components

### Features

1. **Dashboard**: Overview of all resources
2. **AWS Credentials**: Management of AWS credentials
3. **Subdomains**: Creation and management of subdomains
4. **Web Servers**: Detection and information about web servers
5. **SSL Certificates**: Generation and installation of SSL certificates

## Security Considerations

- AWS credentials are encrypted before storage
- The application runs with necessary permissions to detect web servers
- SSL certificates are stored securely
- The backend container runs with host networking to detect local services

## Workflow

1. User configures AWS credentials through the web UI
2. User creates subdomains using Route53
3. Application detects web servers running on the host
4. User generates and installs SSL certificates for subdomains

## Future Improvements

- Add user authentication and authorization
- Implement automatic certificate renewal
- Add support for multiple domains and accounts
- Implement monitoring and alerting for certificate expiration 