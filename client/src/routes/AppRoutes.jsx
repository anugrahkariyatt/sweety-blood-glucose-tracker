import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Readings from '../pages/Readings.jsx';
import Reports from '../pages/Reports.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Readings Route */}
      <Route
        path="/readings"
        element={
          <ProtectedRoute>
            <Readings />
          </ProtectedRoute>
        }
      />

      {/* Protected Reports Route */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
