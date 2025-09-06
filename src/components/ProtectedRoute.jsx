// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

 
  if (!isAuthenticated) {
   
    localStorage.setItem('redirectPath', location.pathname);
    
    
    return <Navigate to="/login" replace />;
  }

  
  return <Outlet />;
};

export default ProtectedRoute;