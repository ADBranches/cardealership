/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
// Import other slices as needed
// import userReducer from './userSlice';
// import carReducer from './carSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here
    // user: userReducer,
    // cars: carReducer,
  },
});

export default store;