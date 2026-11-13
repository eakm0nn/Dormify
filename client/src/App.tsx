import React, { lazy, Suspense } from 'react';
import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import type { Role } from './types/api';

import Home from './pages/Home';

import { EmptyState, Loading } from './components/Feedback';
import Layout from './components/Layout';
import { adminMenus, userMenus } from './config/navigation';
import { useAuth } from './context/AuthContext';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AddProperty = lazy(() => import('./pages/AddProperty'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const ManageBookings = lazy(() => import('./pages/ManageBookings'));
const AdminOverview = lazy(() => import('./pages/AdminOverview'));
const AdminRooms = lazy(() => import('./pages/AdminRooms'));
const Profile = lazy(() => import('./pages/Profile'));
const Unavailable = lazy(() => import('./pages/Unavailable'));

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: Role[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading text="กำลังตรวจสอบการเข้าสู่ระบบ…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};
const Account = () => {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/user'} replace />;
};
const App = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="rooms/:roomId" element={<PropertyDetails />} />
        <Route path="properties/:id" element={<PropertyDetails />} />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="dormitory" element={<AddProperty />} />
          <Route path="bookings" element={<ManageBookings />} />
          {adminMenus
            .filter((menu) => !menu.ready)
            .map((menu) => (
              <Route
                key={menu.to}
                path={menu.to.replace('/admin/', '')}
                element={<Unavailable title={menu.label} />}
              />
            ))}
        </Route>
        <Route
          path="user"
          element={
            <ProtectedRoute roles={['USER']}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<Profile />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="room" element={<MyBookings roomView />} />
          {userMenus
            .filter((menu) => !menu.ready && menu.to !== '/user/room')
            .map((menu) => (
              <Route
                key={menu.to}
                path={menu.to.replace('/user/', '')}
                element={<Unavailable title={menu.label} />}
              />
            ))}
        </Route>
        <Route
          path="add-property"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Navigate to="/admin/dormitory" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="manage-bookings"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Navigate to="/admin/bookings" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-bookings"
          element={
            <ProtectedRoute roles={['USER']}>
              <Navigate to="/user/bookings" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div className="container-page py-14">
              <EmptyState title="ไม่พบหน้าที่ต้องการ" description="ลิงก์นี้อาจไม่ถูกต้อง หรือหน้าเว็บไซต์ถูกย้ายแล้ว">
                <Link to="/" className="btn btn-primary">
                  กลับหน้าหลัก
                </Link>
              </EmptyState>
            </div>
          }
        />
      </Route>
    </Routes>
  </Suspense>
);
export default App;
