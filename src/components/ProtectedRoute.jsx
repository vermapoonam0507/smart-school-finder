// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, isAuthenticated} = useAuth();
  const location = useLocation();

  // if (loading) {
  //   return <div className="flex justify-center items-center h-screen">Loading...</div>;
  // }

 if (isAuthenticated && !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }


  if (!isAuthenticated) {
    // If user is not logged in, save their intended path and redirect to login.
    localStorage.setItem('redirectPath', location.pathname);
    return <Navigate to="/login" replace />;
  }

  // --- THIS IS THE NEW, CRITICAL LOGIC ---
  // We check for a field that ONLY exists on a full student profile, like 'contactNo'.
  // If the user object is missing this field, their profile is incomplete.
  const isProfileComplete = user && user.hasOwnProperty('contactNo');

  if (user.userType !== 'school' && user.userType !== 'admin' && !isProfileComplete) {
    // If the user is a student/parent and their profile is incomplete,
    // force them to the create-profile page.
    return <Navigate to="/create-profile" replace />;
  }

  // If the user is authenticated and their profile is complete, let them pass.
  return <Outlet />;
};

export default ProtectedRoute;