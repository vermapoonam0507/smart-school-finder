import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const SignUpPage = ({ onNavigate, onSignUp, isSchoolSignUp = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: isSchoolSignUp ? 'school' : 'parent',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(prev => ({ ...prev, name: '', email: '', password: '', role: isSchoolSignUp ? 'school' : 'parent' }));
  }, [isSchoolSignUp]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'This field is required.';
    if (!formData.email) {
        newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email address is invalid.';
    }
    if (!formData.password) {
        newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      const signUpSuccess = onSignUp(formData);
      if (signUpSuccess) {
        alert("Sign Up successful! Please log in.");
        onNavigate('login');
      } else {
        setErrors({ email: 'An account with this email already exists.' });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
            {isSchoolSignUp && <p className="mt-2 text-sm text-gray-600">for your School</p>}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isSchoolSignUp && (
            <div>
              <label className="text-sm font-medium text-gray-700">I am a:</label>
              <div className="flex gap-4 mt-2">
                  <label className="flex items-center">
                      <input type="radio" name="role" value="parent" checked={formData.role === 'parent'} onChange={handleChange} className="h-4 w-4 text-blue-600"/>
                      <span className="ml-2">Parent / Student</span>
                  </label>
                  <label className="flex items-center">
                      <input type="radio" name="role" value="school" checked={formData.role === 'school'} onChange={handleChange} className="h-4 w-4 text-blue-600"/>
                      <span className="ml-2">School</span>
                  </label>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              {formData.role === 'parent' ? 'Full Name' : 'School Name'}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={formData.role === 'parent' ? 'Poonam Verma' : 'Delhi Public School'}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>
          <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Sign Up</button>
          <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <button type="button" onClick={() => onNavigate('login')} className="font-medium text-blue-600 hover:underline">
                  Sign In
              </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
