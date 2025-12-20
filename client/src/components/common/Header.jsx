import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import {
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  ClipboardList,
  LayoutDashboard,
  Shield,
  Utensils,
} from 'lucide-react';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart); // <-- FIX: Renamed 'items' to 'cartItems'
  const cartCount = cartItems.length; // Number of unique items

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) {
      return (
        <Link
          to="/login"
          className="flex items-center gap-2 text-gray-600 hover:text-primary"
        >
          <LogIn size={20} />
          <span>Login</span>
        </Link>
      );
    }

    if (user.role === 'student') {
      return (
        <>
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-primary"
          >
            <Utensils size={20} />
            <span>Canteens</span>
          </Link>
          <Link
            to="/orders"
            className="flex items-center gap-2 text-gray-600 hover:text-primary"
          >
            <ClipboardList size={20} />
            <span>My Orders</span>
          </Link>
          <Link
            to="/cart"
            className="flex items-center gap-2 text-gray-600 hover:text-primary relative"
          >
            <ShoppingCart size={20} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </>
      );
    }

    if (user.role === 'manager') {
      return (
        <>
          <Link
            to="/manager/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-primary"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/manager/menu"
            className="flex items-center gap-2 text-gray-600 hover:text-primary"
          >
            <Utensils size={20} />
            <span>Menu</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </>
      );
    }

    if (user.role === 'admin') {
      return (
        <>
          <Link
            to="/admin"
            className="flex items-center gap-2 text-gray-600 hover:text-primary"
          >
            <Shield size={20} />
            <span>Admin Panel</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </>
      );
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto max-w-4xl p-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          CampusEats
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          {getNavLinks()}
        </div>
      </nav>
    </header>
  );
};

export default Header;