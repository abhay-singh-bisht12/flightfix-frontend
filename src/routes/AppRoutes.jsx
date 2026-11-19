import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPlaceholder from '../pages/DashboardPlaceholder';
import AircraftPage from '../pages/AircraftPage';
import MaintenancePage from '../pages/MaintenancePage';
import WorkOrdersPage from '../pages/WorkOrdersPage';
import PartsPage from '../pages/PartsPage';
import ModulePlaceholder from '../pages/ModulePlaceholder';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPlaceholder />
            </ProtectedRoute>
          }
        />

        {/* Module 1: Aircraft & Equipment Management */}
        <Route
          path="/aircraft"
          element={
            <ProtectedRoute>
              <AircraftPage />
            </ProtectedRoute>
          }
        />

        {/* Module 2: Maintenance Planning & Scheduling */}
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <MaintenancePage />
            </ProtectedRoute>
          }
        />

        {/* Module 3: Work Order Management */}
        <Route
          path="/work-orders"
          element={
            <ProtectedRoute>
              <WorkOrdersPage />
            </ProtectedRoute>
          }
        />
        {/* Module 4: Spare Parts Inventory */}
        <Route
          path="/parts"
          element={
            <ProtectedRoute>
              <PartsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <PartsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/execution"
          element={
            <ProtectedRoute>
              <ModulePlaceholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance"
          element={
            <ProtectedRoute>
              <ModulePlaceholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supply-chain"
          element={
            <ProtectedRoute>
              <ModulePlaceholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mobile"
          element={
            <ProtectedRoute>
              <ModulePlaceholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <ModulePlaceholder />
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
