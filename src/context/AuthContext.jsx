// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { loginUser as apiLogin } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>{
    const savedUser = localStorage.getItem('userData');
  return savedUser ? JSON.parse(savedUser) : null;
  });


  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    setLoading(false);
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      const { token, auth: userData } = response.data.data;
      setToken(token);
      setUser(userData);
      console.log(response)
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData)); 

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
    localStorage.removeItem('userData'); 
  };



  const updateUserContext = useCallback((newUserData) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newUserData };
            

            localStorage.setItem('userData', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []); 

  const value = useMemo(() =>({
    user,
    token,
    login,
    logout,
    updateUserContext, 
    isAuthenticated: !!token,
    loading
  }), [user, token]); 

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