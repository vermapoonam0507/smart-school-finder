// src/api/blogService.js

import apiClient from './axios';

/**
 * Blog service for managing blog operations
 */

/**
 * Get all blogs
 */
export const getAllBlogs = () => {
  return apiClient.get('/admin/blogs');
};

/**
 * Get blog by ID
 * @param {string} blogId - Blog ID
 */
export const getBlogById = (blogId) => {
  return apiClient.get(`/admin/blogs/${blogId}`);
};

/**
 * Create a new blog
 * @param {object} blogData - Blog data (title, highlight, description, contributor)
 */
export const createBlog = (blogData) => {
  return apiClient.post('/admin/blogs', blogData);
};

/**
 * Update a blog (not implemented in backend yet)
 * @param {string} blogId - Blog ID
 * @param {object} blogData - Updated blog data
 */
export const updateBlog = (blogId, blogData) => {
  return apiClient.put(`/admin/blogs/${blogId}`, blogData);
};

/**
 * Delete a blog
 * @param {string} blogId - Blog ID
 */
export const deleteBlog = (blogId) => {
  return apiClient.delete(`/admin/blogs/${blogId}`);
};

/**
 * Like a blog (not implemented in backend yet - using local state for now)
 * @param {string} blogId - Blog ID
 */
export const likeBlog = (blogId) => {
  // For now, just return a promise that resolves immediately
  // In the future, this should call the backend API
  return Promise.resolve({ data: { success: true } });
};

/**
 * Unlike a blog (not implemented in backend yet - using local state for now)
 * @param {string} blogId - Blog ID
 */
export const unlikeBlog = (blogId) => {
  // For now, just return a promise that resolves immediately
  // In the future, this should call the backend API
  return Promise.resolve({ data: { success: true } });
};
