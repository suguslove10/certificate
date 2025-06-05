import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Cloud as CloudIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

// Redux actions
import { checkAwsCredentialsStatus } from '../store/slices/aws';
import { getSubdomains } from '../store/slices/subdomain';
import { getWebServerDetections } from '../store/slices/webserver';
import { getCertificates } from '../store/slices/ssl';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isConfigured, region } = useSelector((state) => state.aws);
  const { subdomains, loading: subdomainsLoading } = useSelector((state) => state.subdomain);
  const { detections, loading: webserverLoading } = useSelector((state) => state.webserver);
  const { certificates, loading: sslLoading } = useSelector((state) => state.ssl);
  
  const loading = subdomainsLoading || webserverLoading || sslLoading;

  useEffect(() => {
    dispatch(checkAwsCredentialsStatus());
    
    if (isConfigured) {
      dispatch(getSubdomains());
    }
    
    dispatch(getWebServerDetections());
    
    if (isConfigured) {
      dispatch(getCertificates());
    }
  }, [dispatch, isConfigured]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Welcome to CertiRoute - Manage your AWS credentials, subdomains, and SSL certificates in one place.
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* AWS Credentials Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CloudIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      AWS Credentials
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Status: {isConfigured ? 'Configured' : 'Not Configured'}
                  </Typography>
                  {isConfigured && (
                    <Typography variant="body2" color="text.secondary">
                      Region: {region}
                    </Typography>
                  )}
                </CardContent>
                <Box flexGrow={1} />
                <CardActions>
                  <Button size="small" onClick={() => navigate('/aws')}>
                    {isConfigured ? 'Manage' : 'Configure'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            {/* Subdomains Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LanguageIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Subdomains
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total: {subdomains.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    With SSL: {subdomains.filter(s => s.sslInstalled).length}
                  </Typography>
                </CardContent>
                <Box flexGrow={1} />
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/subdomains')}
                    disabled={!isConfigured}
                  >
                    {isConfigured ? 'Manage' : 'Configure AWS First'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            {/* Web Servers Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <StorageIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      Web Servers
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Detected: {detections.length}
                  </Typography>
                  {detections.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Types: {[...new Set(detections.map(d => d.serverType))].join(', ')}
                    </Typography>
                  )}
                </CardContent>
                <Box flexGrow={1} />
                <CardActions>
                  <Button size="small" onClick={() => navigate('/webservers')}>
                    Scan
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            {/* SSL Certificates Card */}
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <SecurityIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      SSL Certificates
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total: {certificates.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Installed: {certificates.filter(c => c.status === 'installed').length}
                  </Typography>
                </CardContent>
                <Box flexGrow={1} />
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/certificates')}
                    disabled={!isConfigured}
                  >
                    {isConfigured ? 'Manage' : 'Configure AWS First'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
}

export default Dashboard; 