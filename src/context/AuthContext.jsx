// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { loginAdmin as apiLoginAdmin } from '../api/adminService';
import { loginUser as apiLoginUser } from '../api/authService';
import { getUserProfile, getUserPreferences } from '../api/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const safeParseJSON = (value) => {
    if (!value || value === 'undefined' || value === 'null') return null;
    try {
      return JSON.parse(value);
    } catch (_) {
      return null;
    }
  };

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('userData');
    const parsed = safeParseJSON(raw);
    if (!parsed && raw) {
      // Clean up corrupted value
      localStorage.removeItem('userData');
    }
    return parsed;
  });

  const [token, setToken] = useState(() => {
    const raw = localStorage.getItem('authToken');
    return raw && raw !== 'undefined' && raw !== 'null' ? raw : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const updateUserContext = useCallback((newUserData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const login = async (credentials, userType = 'user') => {
    try {
      let response;

      if (userType === 'admin') {
        try {
          response = await apiLoginAdmin(credentials);
          console.log('Full admin response:', response);
          
          // Handle different response structures
          let token, adminData;
          
          // Check if response has nested data structure (response.data.data)
          if (response?.data?.data) {
            token = response.data.data.token;
            adminData = response.data.data.admin || response.data.data.user || response.data.data.auth;
          } 
          // Check if response has flat structure (response.data)
          else if (response?.data) {
            token = response.data.token;
            adminData = response.data.admin || response.data.user || response.data.auth;
            
            // If still no adminData, create minimal admin object
            if (!adminData) {
              console.log('Creating minimal admin data from response');
              adminData = {
                email: credentials.email,
                userType: 'admin',
                isAdmin: true
              };
            }
          }

          // Validate token exists
          if (!token) {
            console.error('No token in response:', response.data);
            throw new Error('No authentication token received');
          }

          // Create complete admin user object
          const adminUser = {
            ...adminData,
            userType: 'admin',
            isAdmin: true,
            email: credentials.email
          };

          console.log('Setting admin user:', adminUser);

          setToken(token);
          localStorage.setItem('authToken', token);
          setUser(adminUser);
          localStorage.setItem('userData', JSON.stringify(adminUser));
          
          toast.success('Admin login successful!');
          return;
        } catch (error) {
          const message = error.response?.data?.message || error.message;
          console.error('Admin login error:', message);
          throw new Error(`Admin login failed: ${message}`);
        }
      }

      // --- Normal user login ---
      response = await apiLoginUser(credentials);
      const { token, auth: basicAuthData } = response.data.data;

      setToken(token);
      localStorage.setItem('authToken', token);

      const userId = basicAuthData?._id;
      if (!userId || basicAuthData.userType === 'school') {
        setUser(basicAuthData);
        localStorage.setItem('userData', JSON.stringify(basicAuthData));
        toast.success('Login successful!');
        return;
      }

      // Fetch full profile and preferences
      const profileResponse = await getUserProfile(basicAuthData.authId || userId);
      const studentId = profileResponse.data?.data?._id || profileResponse.data?._id;

      let preferences = null;
      try {
        if (studentId) {
          const prefResponse = await getUserPreferences(studentId);
          preferences = prefResponse?.data || prefResponse;
        }
      } catch (_) {
        // Preferences are optional, continue without them
      }

      const fullUserData = {
        ...basicAuthData,
        ...(profileResponse.data?.data || profileResponse.data),
        ...(preferences ? { preferences } : {})
      };

      setUser(fullUserData);
      localStorage.setItem('userData', JSON.stringify(fullUserData));
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      toast.error("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    toast.success('Logged out successfully');
  };

  const value = useMemo(() => ({
    user,
    token,
    login,
    logout,
    updateUserContext,
    isAuthenticated: !!token,
    loading
  }), [user, token, loading, updateUserContext]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading application...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};