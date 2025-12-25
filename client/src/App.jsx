import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import ProtectedRoute from './components/common/ProtectedRoute';
import Spinner from './components/common/Spinner';

// --- Shared Pages ---
const Login = lazy(() => import('./pages/shared/Login'));
const Register = lazy(() => import('./pages/shared/Register'));
const NotFound = lazy(() => import('./pages/shared/NotFound'));

// --- Student Pages ---
const StudentLayout = lazy(() => import('./pages/student/StudentLayout'));
const Home = lazy(() => import('./pages/student/Home'));
const CanteenMenu = lazy(() => import('./pages/student/CanteenMenu'));
const Cart = lazy(() => import('./pages/student/Cart'));
const OrderStatus = lazy(() => import('./pages/student/OrderStatus'));
const OrderHistory = lazy(() => import('./pages/student/OrderHistory'));
const Profile = lazy(() => import('./pages/student/Profile'));

// --- Manager Pages ---
const ManagerLayout = lazy(() => import('./pages/manager/ManagerLayout'));
const Dashboard = lazy(() => import('./pages/manager/Dashboard'));
const MenuManagement = lazy(() => import('./pages/manager/MenuManagement'));
const CanteenSettings = lazy(() => import('./pages/manager/CanteenSettings'));

// --- Admin Pages ---
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));

function App() {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl p-4 min-h-[calc(100vh-64px)]">
        <Suspense fallback={<Spinner />}>
          <Routes>
            {/* --- Shared Routes --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* --- Student Routes (Default) --- */}
            <Route
              path="/"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="canteen/:id" element={<CanteenMenu />} />
              <Route path="cart" element={<Cart />} />
              <Route path="order/:id" element={<OrderStatus />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* --- Manager Routes --- */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute roles={['manager']}>
                  <ManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="settings" element={<CanteenSettings />} />
            </Route>

            {/* --- Admin Routes --- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* --- Not Found --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}

export default App;