import React, { useState, useEffect } from 'react';
import { Heart, Calendar, User, Search, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllBlogs } from '../api/blogService';
import { toast } from 'react-toastify';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBlogs, setExpandedBlogs] = useState(new Set());
  const navigate = useNavigate();


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

  const toggleExpanded = (blogId) => {
    setExpandedBlogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blogId)) {
        newSet.delete(blogId);
      } else {
        newSet.add(blogId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (blogId) => {
    navigate(`/blog/${blogId}`);
  };



  const list = Array.isArray(blogs) ? blogs : [];
  const filteredBlogs = list.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.highlight.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(blog.contributor) ? blog.contributor : [blog.contributor]).some(contributor => 
      contributor.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
            </div>
          </div>
          
          {/* Search */}
          <div className="mt-6">
            <div className="relative max-w-md">
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
      </div>

      {/* Blog List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No blogs found matching your search.' : 'No blogs available.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredBlogs.map((blog) => {
              const isExpanded = expandedBlogs.has(blog._id);
              const descriptionPreview = blog.description.length > 200 
                ? blog.description.substring(0, 200) + '...' 
                : blog.description;
              
              return (
                <article key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                          {blog.title}
                        </h2>
                        
                        <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                          {blog.highlight}
                        </p>
                        
                        <div className="prose max-w-none text-gray-700 mb-6">
                          <p className="whitespace-pre-wrap">
                            {isExpanded ? blog.description : descriptionPreview}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              <span>{Array.isArray(blog.contributor) ? blog.contributor.join(', ') : blog.contributor}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Expand/Collapse Button */}
                            {blog.description.length > 200 && (
                              <button
                                onClick={() => toggleExpanded(blog._id)}
                                className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Show Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Show More
                                  </>
                                )}
                              </button>
                            )}
                            
                            {/* View Details Button */}
                            <button
                              onClick={() => handleViewDetails(blog._id)}
                              className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              <ChevronRight className="h-4 w-4 mr-1" />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;

