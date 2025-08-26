// src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // AuthContext se hook import kiya

// Form validation ke rules (aapke code se)
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Ab humein onLogin prop ki zaroorat nahi hai
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext se login function nikala

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // State for API loading and errors
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // "Remember Me" ke liye saved credentials load karna
  useEffect(() => {
    const savedCreds = localStorage.getItem('school-finder-rememberMe');
    if (savedCreds) {
      const { email, password } = JSON.parse(savedCreds);
      setValue('email', email);
      setValue('password', password);
      setRememberMe(true);
    }
  }, [setValue]);

  // Form submit hone par yeh naya function chalega
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    
    try {
      // Step 1: Context se login function call karna
      await login(data);
      
      // Step 2: "Remember Me" functionality
      if (rememberMe) {
        localStorage.setItem('school-finder-rememberMe', JSON.stringify(data));
      } else {
        localStorage.removeItem('school-finder-rememberMe');
      }

      // Step 3: User ko dashboard par bhejna
      // NOTE: Context ab user data ke hisab se redirection handle kar sakta hai,
      // ya aap yahan se navigate kar sakte hain.
      navigate('/dashboard'); 

    } catch (error) {
      console.error("Login failed:", error);
      // Step 4: User ko error message dikhana
      const errorMessage = error.response?.data?.message || 'Invalid email or password. Please try again.';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">Please enter your details to login.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{serverError}</p>}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="you@example.com"
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register('password')}
                className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                <span className="ml-2 text-gray-700">Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
          </div>
          <div>
            <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:underline">
                  Sign Up
              </Link>
            </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
