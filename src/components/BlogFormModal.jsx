import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createBlog, updateBlog } from '../api/blogService';
import { toast } from 'react-toastify';

const blogSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  highlight: z.string().min(1, { message: 'Highlight is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  contributor: z.array(z.string()).min(1, { message: 'At least one contributor is required' }),
});

const BlogFormModal = ({ blog, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [newContributor, setNewContributor] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title || '',
      highlight: blog?.highlight || '',
      description: blog?.description || '',
      contributor: blog?.contributor || [],
    },
  });

  useEffect(() => {
    if (blog) {
      setContributors(blog.contributor || []);
      setValue('contributor', blog.contributor || []);
    }
  }, [blog, setValue]);

  const addContributor = () => {
    if (newContributor.trim() && !contributors.includes(newContributor.trim())) {
      const updatedContributors = [...contributors, newContributor.trim()];
      setContributors(updatedContributors);
      setValue('contributor', updatedContributors);
      setNewContributor('');
    }
  };

  const removeContributor = (index) => {
    const updatedContributors = contributors.filter((_, i) => i !== index);
    setContributors(updatedContributors);
    setValue('contributor', updatedContributors);
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      if (blog) {
        // Update existing blog
        const response = await updateBlog(blog._id, data);
        onSuccess(response.data?.data || response.data);
      } else {
        // Create new blog
        const response = await createBlog(data);
        onSuccess(response.data?.data || response.data);
      }
    } catch (error) {
      console.error('Failed to save blog:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save blog';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {blog ? 'Edit Blog' : 'Create New Blog'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter blog title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="highlight" className="block text-sm font-medium text-gray-700">
              Highlight *
            </label>
            <textarea
              id="highlight"
              rows={3}
              {...register('highlight')}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.highlight ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter blog highlight/summary"
            />
            {errors.highlight && (
              <p className="mt-1 text-sm text-red-600">{errors.highlight.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              rows={6}
              {...register('description')}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter blog description/content"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contributors *
            </label>
            
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newContributor}
                onChange={(e) => setNewContributor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContributor())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add contributor name"
              />
              <button
                type="button"
                onClick={addContributor}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {contributors.length > 0 && (
              <div className="space-y-2">
                {contributors.map((contributor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm text-gray-700">{contributor}</span>
                    <button
                      type="button"
                      onClick={() => removeContributor(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.contributor && (
              <p className="mt-1 text-sm text-red-600">{errors.contributor.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : blog ? 'Update Blog' : 'Create Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogFormModal;


