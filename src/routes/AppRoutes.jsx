import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPlaceholder from '../pages/DashboardPlaceholder';
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

        {/* Protected MRO Modules */}
        <Route
          path="/aircraft"
          element={
            <ProtectedRoute>
              <ModulePlaceholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <ModulePlaceholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/work-orders"
          element={
            <ProtectedRoute>
              <ModulePlaceholder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <ModulePlaceholder />
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
