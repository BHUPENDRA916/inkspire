import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

// Function to load the cart state from localStorage
const loadCartFromStorage = () => {
  const storedCart = localStorage.getItem('campuseats-cart');
  const storedCanteen = localStorage.getItem('campuseats-cart-canteen');
  return {
    cartItems: storedCart ? JSON.parse(storedCart) : [],
    canteen: storedCanteen ? JSON.parse(storedCanteen) : null,
  };
};

// Function to save the cart state to localStorage
const saveCartToStorage = (cartItems, canteen) => {
  localStorage.setItem('campuseats-cart', JSON.stringify(cartItems));
  if (canteen) {
    localStorage.setItem('campuseats-cart-canteen', JSON.stringify(canteen));
  } else {
    localStorage.removeItem('campuseats-cart-canteen');
  }
};

const initialState = loadCartFromStorage();

/**
 * Manages the shopping cart state.
 * Replaces the old CartContext.
 * Note: The "window.confirm" logic for switching canteens lives in
 * the CanteenMenu.jsx component, *before* dispatching these actions.
 */

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { item, canteenInfo } = action.payload; // <-- FIX: Changed 'canteen' to 'canteenInfo'

      // Set canteen if this is the first item
      if (!state.canteen) {
        state.canteen = canteenInfo; // <-- FIX: Use canteenInfo
      }

      const existingItem = state.cartItems.find((i) => i._id === item._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({ ...item, quantity: 1 });
      }
      
      toast.success(`${item.name} added to cart`);
      saveCartToStorage(state.cartItems, state.canteen);
    },
    
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.cartItems = state.cartItems.filter((i) => i._id !== itemId);
      
      if (state.cartItems.length === 0) {
        state.canteen = null;
      }
      saveCartToStorage(state.cartItems, state.canteen);
    },
    
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const newQty = Math.max(1, quantity); // Ensure quantity is at least 1
      
      const itemToUpdate = state.cartItems.find((i) => i._id === itemId);
      if (itemToUpdate) {
        itemToUpdate.quantity = newQty;
      }
      saveCartToStorage(state.cartItems, state.canteen);
    },
    
    clearCart: (state) => {
      state.cartItems = [];
      state.canteen = null;
      saveCartToStorage(state.cartItems, state.canteen);
    },
  },
});


export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

// Selectors for components to use
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartCanteen = (state) => state.cart.canteen;
export const selectCartCount = (state) => state.cart.cartItems.length;
export const selectCartTotal = (state) =>
  state.cart.cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

export default cartSlice.reducer;