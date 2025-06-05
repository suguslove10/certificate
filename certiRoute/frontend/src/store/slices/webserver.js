import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async thunks
export const scanWebServers = createAsyncThunk(
  'webserver/scanWebServers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/webserver/scan`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to scan web servers' });
    }
  }
);

export const getWebServerDetections = createAsyncThunk(
  'webserver/getWebServerDetections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/webserver/detections`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get web server detections' });
    }
  }
);

export const scanPorts = createAsyncThunk(
  'webserver/scanPorts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/webserver/ports`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to scan ports' });
    }
  }
);

// Slice
const webserverSlice = createSlice({
  name: 'webserver',
  initialState: {
    lastScan: null,
    detections: [],
    ports: {
      open: [],
      closed: [],
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Scan web servers
      .addCase(scanWebServers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanWebServers.fulfilled, (state, action) => {
        state.loading = false;
        state.lastScan = action.payload.lastScan;
        state.detections = action.payload.detections;
      })
      .addCase(scanWebServers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to scan web servers';
      })
      
      // Get web server detections
      .addCase(getWebServerDetections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWebServerDetections.fulfilled, (state, action) => {
        state.loading = false;
        state.lastScan = action.payload.lastScan;
        state.detections = action.payload.detections;
      })
      .addCase(getWebServerDetections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to get web server detections';
      })
      
      // Scan ports
      .addCase(scanPorts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanPorts.fulfilled, (state, action) => {
        state.loading = false;
        state.ports.open = action.payload.open;
        state.ports.closed = action.payload.closed;
      })
      .addCase(scanPorts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to scan ports';
      });
  },
});

export const { clearError } = webserverSlice.actions;

export default webserverSlice.reducer; 