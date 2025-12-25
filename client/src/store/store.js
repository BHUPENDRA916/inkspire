import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';

/**
 * Configures the Redux store.
 * This brings together all the different slices of state (auth, cart, etc.)
 * into a single global state object.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});