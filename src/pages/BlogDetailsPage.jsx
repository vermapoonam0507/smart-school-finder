import React, { useState, useEffect } from 'react';
import { Heart, Calendar, User, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getBlogById } from '../api/blogService';
import { toast } from 'react-toastify';

const BlogDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadBlog();
  }, [id]);

  const loadBlog = async () => {
    try {
      setIsLoading(true);
      const response = await getBlogById(id);
      const blogData = response?.data?.data ?? response?.data;
      setBlog(blogData);
    } catch (error) {
      console.error('Failed to load blog:', error);
      toast.error('Failed to load blog details');
      navigate('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog details...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Blog not found</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/blog"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Blog
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Blog Detail</h1>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            {/* Blog Title */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {blog.title}
              </h1>
              
              {/* Metadata */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  <span>{blog.likes || 0}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Published {new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Blog Highlight */}
            <div className="mb-8">
              <p className="text-xl text-gray-600 leading-relaxed">
                {blog.highlight}
              </p>
            </div>

            {/* Expandable Description */}
            <div className="mb-8">
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-wrap text-lg leading-relaxed">
                  {blog.description}
                </p>
              </div>
            </div>

            {/* Contributors Section */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contributors</h3>
              <div className="flex flex-wrap gap-4">
                {(Array.isArray(blog.contributor) ? blog.contributor : [blog.contributor]).map((contributor, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm">
                        {contributor.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">{contributor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetailsPage;
