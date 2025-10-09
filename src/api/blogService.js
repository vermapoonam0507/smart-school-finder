// src/api/blogService.js

import apiClient from './axios';

/**
 * Blog service for managing blog operations
 */

/**
 * Get all blogs
 */
export const getAllBlogs = async () => {
  const envPath = (import.meta?.env?.VITE_ADMIN_BLOGS_PATH || '').trim();
  const candidates = [
    envPath && envPath.startsWith('/') ? envPath : null,
    '/admin/blogs',
    '/admin/blog',
    '/blogs',
    '/blog',
    '/posts',
  ].filter(Boolean);

  let lastError;
  for (const path of candidates) {
    try {
      return await apiClient.get(path);
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      lastError = error;
    }
  }
  throw lastError;
};

/**
 * Get blog by ID
 * @param {string} blogId - Blog ID
 */
export const getBlogById = async (blogId) => {
  const envBase = (import.meta?.env?.VITE_ADMIN_BLOGS_PATH || '').trim().replace(/\/$/, '');
  const bases = [
    envBase && envBase.startsWith('/') ? envBase : null,
    '/admin/blogs',
    '/admin/blog',
    '/blogs',
    '/blog',
  ].filter(Boolean);

  let lastError;
  for (const base of bases) {
    try {
      return await apiClient.get(`${base}/${encodeURIComponent(blogId)}`);
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      lastError = error;
    }
  }
  throw lastError;
};

/**
 * Create a new blog
 * @param {object} blogData - Blog data (title, highlight, description, contributor)
 */
export const createBlog = async (blogData) => {
  return apiClient.post('/admin/blogs', blogData);
};
