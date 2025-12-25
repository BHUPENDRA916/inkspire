import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Your Profile
      </h1>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="text-lg font-semibold text-gray-800">{user.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-lg font-semibold text-gray-800">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Role</label>
          <p className="text-lg font-semibold text-gray-800 capitalize">
            {user.role}
          </p>
        </div>
        <Button onClick={handleLogout} variant="danger" className="w-full">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;