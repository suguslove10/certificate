import { configureStore } from '@reduxjs/toolkit';
import awsReducer from './slices/aws';
import subdomainReducer from './slices/subdomain';
import webserverReducer from './slices/webserver';
import sslReducer from './slices/ssl';

const store = configureStore({
  reducer: {
    aws: awsReducer,
    subdomain: subdomainReducer,
    webserver: webserverReducer,
    ssl: sslReducer,
  },
});

export default store; 