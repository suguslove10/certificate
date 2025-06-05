import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { scanWebServers } from '../store/slices/webserver';

function WebServers() {
  const dispatch = useDispatch();
  const { detections, loading } = useSelector((state) => state.webserver);

  const handleScan = () => {
    dispatch(scanWebServers());
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Web Servers
        </Typography>
        <Typography variant="body1" paragraph>
          This page will show detected web servers on your system.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleScan}
          disabled={loading}
        >
          {loading ? 'Scanning...' : 'Scan for Web Servers'}
        </Button>
      </Box>
    </Container>
  );
}

export default WebServers; 