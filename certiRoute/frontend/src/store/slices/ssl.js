import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async thunks
export const generateCertificate = createAsyncThunk(
  'ssl/generateCertificate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/ssl/generate`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to generate certificate' });
    }
  }
);

export const installCertificate = createAsyncThunk(
  'ssl/installCertificate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/ssl/install`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to install certificate' });
    }
  }
);

export const getCertificates = createAsyncThunk(
  'ssl/getCertificates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/ssl/certificates`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get certificates' });
    }
  }
);

export const getCertificateById = createAsyncThunk(
  'ssl/getCertificateById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/ssl/certificates/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get certificate' });
    }
  }
);

export const getCertificatesBySubdomain = createAsyncThunk(
  'ssl/getCertificatesBySubdomain',
  async (subdomainId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/ssl/certificates/subdomain/${subdomainId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get certificates' });
    }
  }
);

export const deleteCertificate = createAsyncThunk(
  'ssl/deleteCertificate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/api/ssl/certificates/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to delete certificate' });
    }
  }
);

// Slice
const sslSlice = createSlice({
  name: 'ssl',
  initialState: {
    certificates: [],
    currentCertificate: null,
    subdomainCertificates: [],
    installationResult: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearInstallationResult: (state) => {
      state.installationResult = null;
    },
    setCurrentCertificate: (state, action) => {
      state.currentCertificate = action.payload;
    },
    clearCurrentCertificate: (state) => {
      state.currentCertificate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate certificate
      .addCase(generateCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates.push(action.payload);
        state.currentCertificate = action.payload;
      })
      .addCase(generateCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to generate certificate';
      })
      
      // Install certificate
      .addCase(installCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.installationResult = null;
      })
      .addCase(installCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.installationResult = action.payload;
        
        // Update certificate status if it's in the list
        const certIndex = state.certificates.findIndex(
          cert => cert.id === action.meta.arg.certId
        );
        if (certIndex !== -1) {
          state.certificates[certIndex].status = 'installed';
          state.certificates[certIndex].serverType = action.meta.arg.serverType;
        }
        
        // Update current certificate if it's the one being installed
        if (state.currentCertificate?.id === action.meta.arg.certId) {
          state.currentCertificate.status = 'installed';
          state.currentCertificate.serverType = action.meta.arg.serverType;
        }
      })
      .addCase(installCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to install certificate';
      })
      
      // Get certificates
      .addCase(getCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload;
      })
      .addCase(getCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get certificates';
      })
      
      // Get certificate by ID
      .addCase(getCertificateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCertificateById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCertificate = action.payload;
      })
      .addCase(getCertificateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get certificate';
      })
      
      // Get certificates by subdomain
      .addCase(getCertificatesBySubdomain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCertificatesBySubdomain.fulfilled, (state, action) => {
        state.loading = false;
        state.subdomainCertificates = action.payload;
      })
      .addCase(getCertificatesBySubdomain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get certificates';
      })
      
      // Delete certificate
      .addCase(deleteCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = state.certificates.filter(
          cert => cert.id !== action.payload.id
        );
        state.subdomainCertificates = state.subdomainCertificates.filter(
          cert => cert.id !== action.payload.id
        );
        if (state.currentCertificate?.id === action.payload.id) {
          state.currentCertificate = null;
        }
      })
      .addCase(deleteCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to delete certificate';
      });
  },
});

export const { 
  clearError, 
  clearInstallationResult, 
  setCurrentCertificate, 
  clearCurrentCertificate 
} = sslSlice.actions;

export default sslSlice.reducer; 