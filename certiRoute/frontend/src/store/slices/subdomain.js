import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async thunks
export const getPublicIp = createAsyncThunk(
  'subdomain/getPublicIp',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/subdomains/ip`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get public IP' });
    }
  }
);

export const getHostedZones = createAsyncThunk(
  'subdomain/getHostedZones',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/subdomains/zones`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get hosted zones' });
    }
  }
);

export const createSubdomain = createAsyncThunk(
  'subdomain/createSubdomain',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/subdomains`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to create subdomain' });
    }
  }
);

export const getSubdomains = createAsyncThunk(
  'subdomain/getSubdomains',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/subdomains`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get subdomains' });
    }
  }
);

export const getSubdomainById = createAsyncThunk(
  'subdomain/getSubdomainById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/subdomains/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get subdomain' });
    }
  }
);

export const deleteSubdomain = createAsyncThunk(
  'subdomain/deleteSubdomain',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/api/subdomains/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to delete subdomain' });
    }
  }
);

// Slice
const subdomainSlice = createSlice({
  name: 'subdomain',
  initialState: {
    publicIp: null,
    hostedZones: [],
    subdomains: [],
    currentSubdomain: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSubdomain: (state, action) => {
      state.currentSubdomain = action.payload;
    },
    clearCurrentSubdomain: (state) => {
      state.currentSubdomain = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get public IP
      .addCase(getPublicIp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicIp.fulfilled, (state, action) => {
        state.loading = false;
        state.publicIp = action.payload.ip;
      })
      .addCase(getPublicIp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get public IP';
      })
      
      // Get hosted zones
      .addCase(getHostedZones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHostedZones.fulfilled, (state, action) => {
        state.loading = false;
        state.hostedZones = action.payload;
      })
      .addCase(getHostedZones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get hosted zones';
      })
      
      // Create subdomain
      .addCase(createSubdomain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubdomain.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createSubdomain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create subdomain';
      })
      
      // Get subdomains
      .addCase(getSubdomains.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubdomains.fulfilled, (state, action) => {
        state.loading = false;
        state.subdomains = action.payload;
      })
      .addCase(getSubdomains.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get subdomains';
      })
      
      // Get subdomain by ID
      .addCase(getSubdomainById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubdomainById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubdomain = action.payload;
      })
      .addCase(getSubdomainById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get subdomain';
      })
      
      // Delete subdomain
      .addCase(deleteSubdomain.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubdomain.fulfilled, (state, action) => {
        state.loading = false;
        state.subdomains = state.subdomains.filter(
          (subdomain) => subdomain.id !== action.payload.id
        );
        if (state.currentSubdomain?.id === action.payload.id) {
          state.currentSubdomain = null;
        }
      })
      .addCase(deleteSubdomain.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to delete subdomain';
      });
  },
});

export const { clearError, setCurrentSubdomain, clearCurrentSubdomain } = subdomainSlice.actions;

export default subdomainSlice.reducer; 