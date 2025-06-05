import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Redux actions
import { 
  saveAwsCredentials, 
  validateAwsCredentials, 
  deleteAwsCredentials,
  checkAwsCredentialsStatus,
  clearError,
  clearValidationResult,
} from '../store/slices/aws';

// Validation schema
const CredentialsSchema = Yup.object().shape({
  accessKeyId: Yup.string()
    .required('AWS Access Key ID is required')
    .min(16, 'AWS Access Key ID must be at least 16 characters')
    .max(128, 'AWS Access Key ID must be at most 128 characters'),
  secretAccessKey: Yup.string()
    .required('AWS Secret Access Key is required')
    .min(30, 'AWS Secret Access Key must be at least 30 characters'),
  region: Yup.string()
    .required('AWS Region is required'),
});

// AWS regions
const awsRegions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'eu-north-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-south-1',
  'sa-east-1',
];

function AwsCredentials() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    isConfigured, 
    region, 
    loading, 
    error, 
    validationResult 
  } = useSelector((state) => state.aws);

  useEffect(() => {
    dispatch(checkAwsCredentialsStatus());
    
    return () => {
      dispatch(clearError());
      dispatch(clearValidationResult());
    };
  }, [dispatch]);

  const handleToggleShowSecretKey = () => {
    setShowSecretKey(!showSecretKey);
  };

  const handleValidate = async (values) => {
    setIsValidating(true);
    await dispatch(validateAwsCredentials(values));
    setIsValidating(false);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(saveAwsCredentials(values)).unwrap();
      enqueueSnackbar('AWS credentials saved successfully', { variant: 'success' });
      navigate('/');
    } catch (err) {
      enqueueSnackbar(err.error || 'Failed to save AWS credentials', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your AWS credentials?')) {
      setIsDeleting(true);
      try {
        await dispatch(deleteAwsCredentials()).unwrap();
        enqueueSnackbar('AWS credentials deleted successfully', { variant: 'success' });
      } catch (err) {
        enqueueSnackbar(err.error || 'Failed to delete AWS credentials', { variant: 'error' });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AWS Credentials
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {isConfigured
            ? 'Your AWS credentials are configured. You can update or delete them below.'
            : 'Configure your AWS credentials to use Route53 for subdomain management and SSL certificate issuance.'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Formik
              initialValues={{
                accessKeyId: '',
                secretAccessKey: '',
                region: region || 'us-east-1',
              }}
              validationSchema={CredentialsSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, isSubmitting, handleChange }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="accessKeyId"
                        label="AWS Access Key ID"
                        fullWidth
                        variant="outlined"
                        error={touched.accessKeyId && Boolean(errors.accessKeyId)}
                        helperText={touched.accessKeyId && errors.accessKeyId}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="secretAccessKey"
                        label="AWS Secret Access Key"
                        fullWidth
                        variant="outlined"
                        type={showSecretKey ? 'text' : 'password'}
                        error={touched.secretAccessKey && Boolean(errors.secretAccessKey)}
                        helperText={touched.secretAccessKey && errors.secretAccessKey}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleToggleShowSecretKey}
                                edge="end"
                              >
                                {showSecretKey ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="region"
                        label="AWS Region"
                        select
                        fullWidth
                        variant="outlined"
                        error={touched.region && Boolean(errors.region)}
                        helperText={touched.region && errors.region}
                        SelectProps={{
                          native: true,
                        }}
                        onChange={handleChange}
                      >
                        {awsRegions.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </Field>
                    </Grid>

                    {validationResult && (
                      <Grid item xs={12}>
                        <Alert 
                          severity={validationResult.valid ? 'success' : 'error'}
                          sx={{ mb: 2 }}
                        >
                          {validationResult.valid 
                            ? 'AWS credentials are valid!' 
                            : `AWS credentials validation failed: ${validationResult.error}`}
                        </Alert>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="space-between">
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleValidate(values)}
                          disabled={isValidating || isSubmitting}
                          startIcon={isValidating && <CircularProgress size={20} />}
                        >
                          {isValidating ? 'Validating...' : 'Validate Credentials'}
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={isSubmitting}
                          startIcon={isSubmitting && <CircularProgress size={20} />}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Credentials'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>

            {isConfigured && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Credentials'}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default AwsCredentials; 