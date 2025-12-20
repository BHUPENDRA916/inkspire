import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCart } from 'lucide-react';
import { selectCartTotal } from '../../store/cartSlice'; // <-- FIX: Import selector

const StickyCartBar = () => {
  // <-- FIX: Used correct state property and selector
  const { cartItems } = useSelector((state) => state.cart);
  const cartTotal = useSelector(selectCartTotal); 
  // ---
  
  const cartCount = cartItems.length;

  if (cartCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="container mx-auto max-w-4xl p-4">
        <Link
          to="/cart"
          className="flex justify-between items-center bg-primary text-white p-4 rounded-lg shadow-xl"
        >
          <div className="flex items-center gap-3">
            <span className="bg-white/20 p-2 rounded-full">
              <ShoppingCart size={20} />
            </span>
            <span className="font-semibold">
              {cartCount} {cartCount > 1 ? 'items' : 'item'} in cart
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">
              ${cartTotal.toFixed(2)}
            </span>
            <span className="font-semibold">View Cart &rarr;</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StickyCartBar;