import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';

import {
  createSubdomain,
  fetchSubdomains,
  deleteSubdomain,
  checkAwsDnsConfiguration
} from '../store/slices/subdomain';

// Validation schema
const SubdomainSchema = Yup.object().shape({
  name: Yup.string()
    .required('Subdomain name is required')
    .min(2, 'Subdomain must be at least 2 characters')
    .max(63, 'Subdomain must be at most 63 characters')
    .matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, 'Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen'),
});

function Subdomains() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, subdomain: null });

  const {
    subdomains,
    loading,
    error,
    dnsConfiguration,
    publicIp
  } = useSelector((state) => state.subdomain);

  const { isConfigured } = useSelector((state) => state.aws);

  useEffect(() => {
    if (isConfigured) {
      dispatch(fetchSubdomains());
      dispatch(checkAwsDnsConfiguration());
    }
  }, [dispatch, isConfigured]);

  const handleCreateDialogOpen = () => {
    setOpenCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
  };

  const handleCreateSubdomain = async (values, { resetForm, setSubmitting }) => {
    try {
      await dispatch(createSubdomain(values)).unwrap();
      enqueueSnackbar('Subdomain created successfully', { variant: 'success' });
      resetForm();
      handleCreateDialogClose();
    } catch (err) {
      enqueueSnackbar(err.error || 'Failed to create subdomain', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOpen = (subdomain) => {
    setDeleteConfirmation({ open: true, subdomain });
  };

  const handleDeleteClose = () => {
    setDeleteConfirmation({ open: false, subdomain: null });
  };

  const handleDeleteSubdomain = async () => {
    if (!deleteConfirmation.subdomain) return;
    
    try {
      await dispatch(deleteSubdomain(deleteConfirmation.subdomain.id)).unwrap();
      enqueueSnackbar('Subdomain deleted successfully', { variant: 'success' });
      handleDeleteClose();
    } catch (err) {
      enqueueSnackbar(err.error || 'Failed to delete subdomain', { variant: 'error' });
    }
  };

  const handleRefresh = () => {
    dispatch(fetchSubdomains());
    dispatch(checkAwsDnsConfiguration());
  };

  if (!isConfigured) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Subdomains
          </Typography>
          <Alert severity="info">
            You need to configure your AWS credentials first to manage subdomains.
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
            Subdomains
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
              onClick={handleCreateDialogOpen}
              disabled={loading}
            >
              Create Subdomain
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              DNS Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Public IP:
                </Typography>
                <Typography variant="body1">
                  {publicIp || 'Detecting...'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  AWS Route53 Status:
                </Typography>
                <Box mt={1}>
                  {dnsConfiguration ? (
                    <Chip
                      label={dnsConfiguration.configured ? "Configured" : "Not Configured"}
                      color={dnsConfiguration.configured ? "success" : "error"}
                    />
                  ) : (
                    <CircularProgress size={20} />
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : subdomains.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subdomain</TableCell>
                  <TableCell>Full Domain</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subdomains.map((subdomain) => (
                  <TableRow key={subdomain.id}>
                    <TableCell>{subdomain.name}</TableCell>
                    <TableCell>{subdomain.fullDomain}</TableCell>
                    <TableCell>{new Date(subdomain.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={subdomain.active ? "Active" : "Pending"}
                        color={subdomain.active ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteOpen(subdomain)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1">
            No subdomains created yet. Click the "Create Subdomain" button to get started.
          </Typography>
        )}

        {/* Create Subdomain Dialog */}
        <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
          <DialogTitle>Create New Subdomain</DialogTitle>
          <Formik
            initialValues={{ name: '' }}
            validationSchema={SubdomainSchema}
            onSubmit={handleCreateSubdomain}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <DialogContent>
                  <DialogContentText>
                    Enter a name for your subdomain. This will create a new DNS record in your AWS Route53 zone.
                  </DialogContentText>
                  <Box mt={2}>
                    <Field
                      as={TextField}
                      name="name"
                      label="Subdomain Name"
                      fullWidth
                      variant="outlined"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCreateDialogClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmation.open} onClose={handleDeleteClose}>
          <DialogTitle>Delete Subdomain</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the subdomain "{deleteConfirmation.subdomain?.name}"?
              This will remove the DNS record from AWS Route53 and any associated certificates.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteSubdomain} 
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

export default Subdomains; 