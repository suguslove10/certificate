import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// Components
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import AwsCredentials from './pages/AwsCredentials';
import Subdomains from './pages/Subdomains';
import SubdomainDetails from './pages/SubdomainDetails';
import WebServers from './pages/WebServers';
import SSLCertificates from './pages/SSLCertificates';
import CertificateDetails from './pages/CertificateDetails';

// Redux actions
import { checkAwsCredentialsStatus } from './store/slices/aws';

function App() {
  const dispatch = useDispatch();
  const { isConfigured, loading } = useSelector((state) => state.aws);

  useEffect(() => {
    dispatch(checkAwsCredentialsStatus());
  }, [dispatch]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="aws" element={<AwsCredentials />} />
        
        {/* Protected routes that require AWS credentials */}
        <Route
          path="subdomains"
          element={isConfigured ? <Subdomains /> : <Navigate to="/aws" />}
        />
        <Route
          path="subdomains/:id"
          element={isConfigured ? <SubdomainDetails /> : <Navigate to="/aws" />}
        />
        <Route path="webservers" element={<WebServers />} />
        <Route
          path="certificates"
          element={isConfigured ? <SSLCertificates /> : <Navigate to="/aws" />}
        />
        <Route
          path="certificates/:id"
          element={isConfigured ? <CertificateDetails /> : <Navigate to="/aws" />}
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App; 