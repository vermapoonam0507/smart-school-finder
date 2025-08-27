// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser as apiLogin } from '../api/authService'; // Corrected path
import apiClient from '../api/axios'; // Corrected path

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); // To check initial auth status

  useEffect(() => {
    // When the app loads, this effect runs.
    // If a token exists, we should verify it with the backend to get user data.
    // For now, we'll just set the token in our API client.
    
    // if (token) {
      // You might want to add an API call here like `apiClient.get('/auth/me')`
      // to fetch user data based on the token and verify it's still valid.
      // For this example, we'll assume the token is valid if it exists.
      // In a real app, you would decode the token or fetch user data.
      // For now, we'll set a placeholder user if a token is found.
      // setUser({ loggedIn: true }); // Replace with actual user data later
    // }
    setLoading(false);
  }, [token]);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      console.log(response)
      const { token, auth: userData } = response.data.data; // Assuming API returns token and user object
      setToken(token);
      setUser(userData); // Set the full user object from the API
      localStorage.setItem('authToken', token);
      return true; // Indicate success
    } catch (error) {
      console.error("Login failed in AuthContext:", error);
      // Re-throw the error so the component can display a message
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  // The value that will be available to all children components
  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token, // A simple boolean to check if user is logged in
  };

  // We show a loading state until we've checked for a token
  if (loading) {
    return <div>Loading application...</div>; // Or a proper spinner component
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access
export const useAuth = () => {
  return useContext(AuthContext);
};
