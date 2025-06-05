import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async thunks
export const saveAwsCredentials = createAsyncThunk(
  'aws/saveCredentials',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/aws/credentials`, credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to save credentials' });
    }
  }
);

export const checkAwsCredentialsStatus = createAsyncThunk(
  'aws/checkCredentialsStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/aws/credentials/status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to check credentials status' });
    }
  }
);

export const deleteAwsCredentials = createAsyncThunk(
  'aws/deleteCredentials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/api/aws/credentials`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to delete credentials' });
    }
  }
);

export const validateAwsCredentials = createAsyncThunk(
  'aws/validateCredentials',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/aws/credentials/validate`, credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to validate credentials' });
    }
  }
);

// Slice
const awsSlice = createSlice({
  name: 'aws',
  initialState: {
    isConfigured: false,
    region: null,
    loading: false,
    error: null,
    validationResult: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearValidationResult: (state) => {
      state.validationResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save credentials
      .addCase(saveAwsCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveAwsCredentials.fulfilled, (state) => {
        state.loading = false;
        state.isConfigured = true;
      })
      .addCase(saveAwsCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to save AWS credentials';
      })
      
      // Check credentials status
      .addCase(checkAwsCredentialsStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAwsCredentialsStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isConfigured = action.payload.configured;
        state.region = action.payload.region;
      })
      .addCase(checkAwsCredentialsStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to check AWS credentials status';
      })
      
      // Delete credentials
      .addCase(deleteAwsCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAwsCredentials.fulfilled, (state) => {
        state.loading = false;
        state.isConfigured = false;
        state.region = null;
      })
      .addCase(deleteAwsCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to delete AWS credentials';
      })
      
      // Validate credentials
      .addCase(validateAwsCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationResult = null;
      })
      .addCase(validateAwsCredentials.fulfilled, (state, action) => {
        state.loading = false;
        state.validationResult = action.payload;
      })
      .addCase(validateAwsCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to validate AWS credentials';
        state.validationResult = { valid: false };
      });
  },
});

export const { clearError, clearValidationResult } = awsSlice.actions;

export default awsSlice.reducer; 