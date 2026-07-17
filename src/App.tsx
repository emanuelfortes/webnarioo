import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/Landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const RoomPage = lazy(() => import('./pages/Room/RoomPage').then((m) => ({ default: m.RoomPage })));
const ApplicationPage = lazy(() => import('./pages/Application/ApplicationPage').then((m) => ({ default: m.ApplicationPage })));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage').then((m) => ({ default: m.AdminPage })));

export function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sala" element={<RoomPage />} />
        <Route path="/aplicacao" element={<ApplicationPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Suspense>
  );
}
