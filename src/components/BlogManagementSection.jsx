import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// import getAllBlogs from your API service

function BlogManagementSection() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    loadBlogs();
  }, []);

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
    <div>
      <input
        type="text"
        placeholder="Search blogs..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredBlogs.map((blog, idx) => (
          <li key={blog._id || idx}>{blog.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default BlogManagementSection;
