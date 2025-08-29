// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If auth state is still loading, show a loading message
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // ===> FIX: Check for authentication <===
  if (!isAuthenticated) {
    // ===> FIX: Save the path the user was trying to access <===
    localStorage.setItem('redirectPath', location.pathname);
    
    // Redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the child route's element
  return <Outlet />;
};

export default ProtectedRoute;