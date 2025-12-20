import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, roles }) => {
  const { user, status } = useSelector((state) => state.auth);
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // User is logged in but doesn't have the required role
    // Redirect to their default page
    let defaultPath = '/';
    if (user.role === 'manager') defaultPath = '/manager';
    if (user.role === 'admin') defaultPath = '/admin';
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default ProtectedRoute;