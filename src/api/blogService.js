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
 * @param {object} blogData - Blog data
 */
export const createBlog = (blogData) => {
  return apiClient.post('/admin/blogs', blogData);
};

/**
 * Update a blog
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
 * Like a blog
 * @param {string} blogId - Blog ID
 */
export const likeBlog = (blogId) => {
  return apiClient.post(`/admin/blogs/${blogId}/like`);
};

/**
 * Unlike a blog
 * @param {string} blogId - Blog ID
 */
export const unlikeBlog = (blogId) => {
  return apiClient.post(`/admin/blogs/${blogId}/unlike`);
};
