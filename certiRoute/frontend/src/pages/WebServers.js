import React, { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { scanWebServers, getWebServerDetections } from '../store/slices/webserver';

function WebServers() {
  const dispatch = useDispatch();
  const { detections, loading, error, lastScan } = useSelector((state) => state.webserver);

  useEffect(() => {
    // Load any existing detections when component mounts
    dispatch(getWebServerDetections());
  }, [dispatch]);

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
          sx={{ mb: 3 }}
        >
          {loading ? 'Scanning...' : 'Scan for Web Servers'}
        </Button>
        
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {lastScan && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Last scan: {new Date(lastScan).toLocaleString()}
          </Typography>
        )}
        
        {detections && detections.length > 0 ? (
          <TableContainer component={Paper}>
            <Table aria-label="web servers table">
              <TableHead>
                <TableRow>
                  <TableCell>Server Type</TableCell>
                  <TableCell>Port</TableCell>
                  <TableCell>Process</TableCell>
                  <TableCell>PID</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detections.map((server, index) => (
                  <TableRow key={index}>
                    <TableCell>{server.serverType}</TableCell>
                    <TableCell>
                      {server.port}
                      {server.isSecure && (
                        <Chip 
                          label="HTTPS" 
                          color="success" 
                          size="small" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                    </TableCell>
                    <TableCell>{server.processName}</TableCell>
                    <TableCell>{server.pid}</TableCell>
                    <TableCell>{server.serverVersion}</TableCell>
                    <TableCell>
                      {server.httpResponse ? (
                        <Chip 
                          label={`${server.httpResponse.statusCode} OK`} 
                          color="success" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          label="Not Responding" 
                          color="error" 
                          size="small" 
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          !loading && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No web servers detected. Click the scan button to detect web servers.
            </Typography>
          )
        )}
      </Box>
    </Container>
  );
}

export default WebServers; 