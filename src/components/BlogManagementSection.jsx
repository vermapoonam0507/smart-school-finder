
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
// import getAllBlogs from wherever it is defined

function BlogManagementSection() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await getAllBlogs();
      const raw = response?.data;
      const blogsArray = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      setBlogs(blogsArray);
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

  return (
    <div>
      <input
        type="text"
        placeholder="Search blogs..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {filteredBlogs.map((blog, idx) => (
            <li key={blog._id || idx}>{blog.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BlogManagementSection;
