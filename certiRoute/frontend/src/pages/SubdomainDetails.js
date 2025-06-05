import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';

function SubdomainDetails() {
  const { id } = useParams();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Subdomain Details
        </Typography>
        <Typography variant="body1">
          Viewing details for subdomain with ID: {id}
        </Typography>
      </Box>
    </Container>
  );
}

export default SubdomainDetails; 