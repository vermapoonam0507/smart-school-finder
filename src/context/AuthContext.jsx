// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser as apiLogin } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pehle se login user ki details fetch karne ka logic yahan daal sakte hain
    // Abhi ke liye, hum ise simple rakhte hain
    setLoading(false);
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      const { token, auth: userData } = response.data.data;
      setToken(token);
      setUser(userData);
      localStorage.setItem('authToken', token);
      return true;
    } catch (error) {
      console.error("Login failed in AuthContext:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    // Redirect logic can be handled in the component calling logout
  };

  // ====> YEH NAYA FUNCTION SABSE IMPORTANT HAI (The Final Fix) <====
  // Yeh function Dashboard se call hoga aur user ka data poori app mein update kar dega
  const updateUserContext = (newUserData) => {
    setUser(prevUser => ({
        ...prevUser,    // Purani details (jaise authId, role) ko rakhein
        ...newUserData  // Nayi details (jaise badla hua naam) daal dein
    }));
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUserContext, // Naye function ko yahan se bhejein
    isAuthenticated: !!token,
    loading
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading application...</div>;
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