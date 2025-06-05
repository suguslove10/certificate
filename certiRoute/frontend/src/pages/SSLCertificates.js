import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  CloudDownload as CloudDownloadIcon,
  FileCopy as FileCopyIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import {
  getCertificates,
  generateCertificate,
  installCertificate,
  deleteCertificate,
  clearInstallationResult
} from '../store/slices/ssl';
import { getSubdomains } from '../store/slices/subdomain';

function SSLCertificates() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [openInstallDialog, setOpenInstallDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedSubdomain, setSelectedSubdomain] = useState('');
  const [webserverType, setWebserverType] = useState('nginx');
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, certificate: null });

  const { 
    certificates, 
    loading, 
    error, 
    installationResult 
  } = useSelector((state) => state.ssl);
  
  const { subdomains } = useSelector((state) => state.subdomain);
  const { isConfigured } = useSelector((state) => state.aws);
  const { detections: webservers } = useSelector((state) => state.webserver);

  useEffect(() => {
    if (isConfigured) {
      dispatch(getCertificates());
      dispatch(getSubdomains());
    }
  }, [dispatch, isConfigured]);

  const handleGenerateDialogOpen = () => {
    setOpenGenerateDialog(true);
  };

  const handleGenerateDialogClose = () => {
    setOpenGenerateDialog(false);
  };

  const handleInstallDialogOpen = (certificate) => {
    setSelectedCertificate(certificate);
    setOpenInstallDialog(true);
  };

  const handleInstallDialogClose = () => {
    setOpenInstallDialog(false);
    setSelectedCertificate(null);
    dispatch(clearInstallationResult());
  };

  const handleSubdomainChange = (event) => {
    setSelectedSubdomain(event.target.value);
  };

  const handleWebserverTypeChange = (event) => {
    setWebserverType(event.target.value);
  };

  const handleGenerateCertificate = async () => {
    if (!selectedSubdomain) {
      enqueueSnackbar('Please select a subdomain', { variant: 'error' });
      return;
    }

    try {
      await dispatch(generateCertificate({ subdomainId: selectedSubdomain })).unwrap();
      enqueueSnackbar('Certificate generation initiated', { variant: 'success' });
      handleGenerateDialogClose();
    } catch (err) {
      enqueueSnackbar(err.error || 'Failed to generate certificate', { variant: 'error' });
    }
  };

  const handleInstallCertificate = async () => {
    if (!selectedCertificate || !webserverType) {
      enqueueSnackbar('Please select a certificate and web server type', { variant: 'error' });
      return;
    }

    try {
      await dispatch(installCertificate({ 
        certificateId: selectedCertificate.id, 
        webserverType 
      })).unwrap();
      enqueueSnackbar('Certificate installation complete', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.error || 'Failed to install certificate', { variant: 'error' });
    }
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      enqueueSnackbar('Certificate download functionality is not yet implemented', { variant: 'info' });
    } catch (err) {
      enqueueSnackbar(err.error || 'Failed to download certificate', { variant: 'error' });
    }
  };

  const handleDeleteOpen = (certificate) => {
    setDeleteConfirmation({ open: true, certificate });
  };

  const handleDeleteClose = () => {
    setDeleteConfirmation({ open: false, certificate: null });
  };

  const handleDeleteCertificate = async () => {
    if (!deleteConfirmation.certificate) return;
    
    try {
      await dispatch(deleteCertificate(deleteConfirmation.certificate.id)).unwrap();
      enqueueSnackbar('Certificate deleted successfully', { variant: 'success' });
      handleDeleteClose();
    } catch (err) {
      enqueueSnackbar(err.error || 'Failed to delete certificate', { variant: 'error' });
    }
  };

  const handleRefresh = () => {
    dispatch(getCertificates());
  };

  if (!isConfigured) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            SSL Certificates
          </Typography>
          <Alert severity="info">
            You need to configure your AWS credentials first to manage SSL certificates.
            Please go to the AWS Credentials page.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            SSL Certificates
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={handleRefresh}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={handleGenerateDialogOpen}
              disabled={loading || subdomains.length === 0}
            >
              Generate Certificate
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : certificates.length > 0 ? (
          <Grid container spacing={3}>
            {certificates.map((certificate) => (
              <Grid item xs={12} md={6} key={certificate.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {certificate.domain}
                      {certificate.isWildcard && (
                        <Chip label="Wildcard" color="primary" size="small" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                    <Box mt={2}>
                      <Typography variant="body2" color="textSecondary">
                        Status:
                      </Typography>
                      <Chip 
                        label={certificate.status} 
                        color={
                          certificate.status === 'valid' ? 'success' : 
                          certificate.status === 'pending' ? 'warning' : 'error'
                        } 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <Box mt={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Issued:
                          </Typography>
                          <Typography variant="body2">
                            {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : 'Pending'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Expires:
                          </Typography>
                          <Typography variant="body2">
                            {certificate.expiresAt ? new Date(certificate.expiresAt).toLocaleDateString() : 'Pending'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<CloudDownloadIcon />}
                      onClick={() => handleDownloadCertificate(certificate)}
                      disabled={certificate.status !== 'valid'}
                    >
                      Download
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<FileCopyIcon />}
                      onClick={() => handleInstallDialogOpen(certificate)}
                      disabled={certificate.status !== 'valid'}
                    >
                      Install
                    </Button>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteOpen(certificate)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1">
            No certificates found. Click the "Generate Certificate" button to create one.
          </Typography>
        )}

        {/* Generate Certificate Dialog */}
        <Dialog open={openGenerateDialog} onClose={handleGenerateDialogClose}>
          <DialogTitle>Generate SSL Certificate</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Select a subdomain to generate an SSL certificate. This will use Let's Encrypt to issue a certificate.
            </DialogContentText>
            <Box mt={2}>
              <FormControl fullWidth>
                <FormLabel>Subdomain</FormLabel>
                <Select
                  value={selectedSubdomain}
                  onChange={handleSubdomainChange}
                  fullWidth
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select a subdomain
                  </MenuItem>
                  {subdomains.map((subdomain) => (
                    <MenuItem key={subdomain.id} value={subdomain.id}>
                      {subdomain.fullDomain}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleGenerateDialogClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCertificate} 
              variant="contained" 
              color="primary"
              disabled={!selectedSubdomain}
            >
              Generate
            </Button>
          </DialogActions>
        </Dialog>

        {/* Install Certificate Dialog */}
        <Dialog 
          open={openInstallDialog} 
          onClose={handleInstallDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Install Certificate</DialogTitle>
          <DialogContent>
            {selectedCertificate && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Installing certificate for: {selectedCertificate.domain}
                </Typography>
                
                <Box mt={2}>
                  <FormControl fullWidth>
                    <FormLabel>Web Server Type</FormLabel>
                    <RadioGroup
                      value={webserverType}
                      onChange={handleWebserverTypeChange}
                    >
                      <FormControlLabel value="nginx" control={<Radio />} label="Nginx" />
                      <FormControlLabel value="apache" control={<Radio />} label="Apache" />
                      <FormControlLabel value="node" control={<Radio />} label="Node.js / Express" />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {installationResult && (
                  <Box mt={3}>
                    <Alert 
                      severity={installationResult.success ? "success" : "error"}
                    >
                      {installationResult.message}
                    </Alert>
                    
                    {installationResult.success && installationResult.configPath && (
                      <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1}>
                        <Typography variant="body2" fontFamily="monospace">
                          Configuration updated at: {installationResult.configPath}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleInstallDialogClose}>
              {installationResult ? 'Close' : 'Cancel'}
            </Button>
            {!installationResult && (
              <Button 
                onClick={handleInstallCertificate} 
                variant="contained" 
                color="primary"
              >
                Install Certificate
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmation.open} onClose={handleDeleteClose}>
          <DialogTitle>Delete Certificate</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the certificate for "{deleteConfirmation.certificate?.domain}"?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteCertificate} 
              color="error" 
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default SSLCertificates; 