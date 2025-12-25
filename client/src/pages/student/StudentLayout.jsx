import React from 'react';
import { Outlet } from 'react-router-dom';
import StickyCartBar from '../../components/student/StickyCartBar';

const StudentLayout = () => {
  return (
    <div>
      <Outlet />
      <StickyCartBar />
    </div>
  );
};

export default StudentLayout;