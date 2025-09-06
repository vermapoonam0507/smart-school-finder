// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { loginUser as apiLogin } from '../api/authService';

const AuthContext = createContext(null);

//added by me.................>
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>{
    const savedUser = localStorage.getItem('userData');
  return savedUser ? JSON.parse(savedUser) : null;
  });


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
      console.log(response)
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData)); // User data ko bhi localStorage mein save kar lein ..added by me
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
    localStorage.removeItem('userData'); // User data ko bhi localStorage se hata dein ..added by me
    // Redirect logic can be handled in the component calling logout
  };



  const updateUserContext = useCallback((newUserData) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newUserData };
            // Also update localStorage so the full profile persists after a refresh
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []); // <--- The empty array means this function is created only ONCE.

  const value = useMemo(() =>({
    user,
    token,
    login,
    logout,
    updateUserContext, // Naye function ko yahan se bhejein
    isAuthenticated: !!token,
    loading
  }), [user, token]); // <--- This object is recreated only if user or token changes.


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