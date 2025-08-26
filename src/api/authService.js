// src/api/authService.js

import apiClient from './axios'; // Humne jo axios.js file banayi thi, usko import kar rahe hain

/**
 * Naye user ko register karne ke liye function.
 * @param {object} userData - User ka data (jaise: { name, email, password }).
 */
export const registerUser = (userData) => {
  return apiClient.post('/auth/register', userData);
};

/**
 * User ko login karne ke liye function.
 * @param {object} credentials - User ka email aur password (jaise: { email, password }).
 */
export const loginUser = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

/**
 * Email verify karne ke liye function.
 * @param {string} token - Verification token jo email se milega.
 */
export const verifyEmail = (token) => {
  return apiClient.get(`/auth/verify-email/${token}`);
};
