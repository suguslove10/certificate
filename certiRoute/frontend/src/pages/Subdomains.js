import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function Subdomains() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Subdomains
        </Typography>
        <Typography variant="body1">
          This page will display and manage your subdomains.
        </Typography>
      </Box>
    </Container>
  );
}

export default Subdomains; 