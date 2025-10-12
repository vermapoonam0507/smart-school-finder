// src/api/authService.js

import apiClient from './axios';

/**

 * @param {object} userData 
 */
export const registerUser = (userData) => {
  return apiClient.post('/auth/register', userData);
};

/**
 * This function is for User login.
 * @param {object} credentials - User's email and password (like: { email, password }).
 */
export const loginUser = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

/**
 * Function for verify email
 * @param {string} token 
 */
export const verifyEmail = (token) => {
  return apiClient.get(`/auth/verify-email/${token}`);
};

/**
 * Function to resend verification email
 * @param {string} email 
 */
export const resendVerificationEmail = (email) => {
  return apiClient.post('/auth/resend-verification', { email });
};