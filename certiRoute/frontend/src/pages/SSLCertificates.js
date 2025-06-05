import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function SSLCertificates() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          SSL Certificates
        </Typography>
        <Typography variant="body1">
          This page will display and manage your SSL certificates.
        </Typography>
      </Box>
    </Container>
  );
}

export default SSLCertificates; 