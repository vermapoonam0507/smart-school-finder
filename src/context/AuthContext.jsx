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
        // --- Admin login ---
        response = await apiLoginAdmin(credentials);
        // Support both endpoint shapes:
        // 1) { token, admin }
        // 2) { data: { token, auth } }
        const directToken = response?.data?.token;
        const directAdmin = response?.data?.admin;
        const nestedToken = response?.data?.data?.token;
        const nestedAuth = response?.data?.data?.auth;

        const resolvedToken = directToken || nestedToken;
        const resolvedAdmin = directAdmin || nestedAuth || {};

        if (!resolvedToken) {
          throw new Error('Admin login response missing token');
        }

        // Ensure userType is set to admin for route guards
        const adminUser = { ...resolvedAdmin, userType: 'admin' };

        setToken(resolvedToken);
        localStorage.setItem('authToken', resolvedToken);
        setUser(adminUser);
        localStorage.setItem('userData', JSON.stringify(adminUser));

      } else {
        // --- Normal user login ---
        response = await apiLoginUser(credentials);
        const { token, auth: basicAuthData } = response.data.data;

        setToken(token);
        localStorage.setItem('authToken', token);

        const userId = basicAuthData?._id;
        if (!userId || basicAuthData.userType === 'school') {
          setUser(basicAuthData);
          localStorage.setItem('userData', JSON.stringify(basicAuthData));
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
        } catch (_) {}

        const fullUserData = {
          ...basicAuthData,
          ...(profileResponse.data?.data || profileResponse.data),
          ...(preferences ? { preferences } : {})
        };

        setUser(fullUserData);
        localStorage.setItem('userData', JSON.stringify(fullUserData));
      }

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
