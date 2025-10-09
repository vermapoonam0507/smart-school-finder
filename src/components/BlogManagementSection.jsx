import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Heart, Calendar, User, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllBlogs, deleteBlog } from '../api/blogService';
import BlogFormModal from './BlogFormModal';

const BlogManagementSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await getAllBlogs();
      const payload = response?.data?.data ?? response?.data ?? [];
      setBlogs(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Failed to load blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      setDeletingId(blogId);
      await deleteBlog(blogId);
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
      toast.success('Blog deleted successfully!');
    } catch (error) {
      console.error('Failed to delete blog:', error);
      toast.error('Failed to delete blog');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  const handleAddBlog = () => {
    setEditingBlog(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBlog(null);
  };

  const handleFormSuccess = (newBlog) => {
    if (editingBlog) {
      // Update existing blog in the list
      setBlogs(prev => prev.map(blog => 
        blog._id === editingBlog._id ? newBlog : blog
      ));
      toast.success('Blog updated successfully!');
    } else {
      // Add new blog to the list
      setBlogs(prev => [newBlog, ...prev]);
      toast.success('Blog created successfully!');
    }
    setShowForm(false);
    setEditingBlog(null);
  };

  const safeString = (val) => (typeof val === 'string' ? val : '').toLowerCase();
  const safeContributors = (val) => Array.isArray(val) ? val : (typeof val === 'string' ? [val] : []);

  const filteredBlogs = Array.isArray(blogs) ? blogs.filter((blog) => {
    const title = safeString(blog?.title);
    const highlight = safeString(blog?.highlight);
    const contributors = safeContributors(blog?.contributor).map(safeString);
    const q = searchTerm.toLowerCase();
    return title.includes(q) || highlight.includes(q) || contributors.some((c) => c.includes(q));
  }) : [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading blogs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Blog Management</h3>
          <button
            onClick={handleAddBlog}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Blog
          </button>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'No blogs found matching your search.' : 'No blogs available.'}
            </p>
          </div>
        ) : (
          filteredBlogs.map((blog) => (
            <div key={blog._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{blog.title}</h4>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {blog.likes} likes
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{blog.highlight}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{Array.isArray(blog.contributor) ? blog.contributor.join(', ') : blog.contributor}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => window.open(`/blog/${blog._id}`, '_blank')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </button>
                  
                  <button
                    onClick={() => handleEditBlog(blog)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteBlog(blog._id)}
                    disabled={deletingId === blog._id}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === blog._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <BlogFormModal
          blog={editingBlog}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default BlogManagementSection;


