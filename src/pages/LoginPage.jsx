import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = ({ onNavigate, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // Jab page load ho, check karein ki kya koi saved credentials hain
  useEffect(() => {
    const savedCreds = JSON.parse(localStorage.getItem('school-finder-rememberMe'));
    if (savedCreds) {
      setFormData({ email: savedCreds.email, password: savedCreds.password });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    const loginSuccess = onLogin(formData);

    if (loginSuccess) {
      if (rememberMe) {
        // Agar "Remember Me" checked hai, toh credentials save karein
        localStorage.setItem('school-finder-rememberMe', JSON.stringify(formData));
      } else {
        // Agar nahi, toh purane saved credentials hata dein
        localStorage.removeItem('school-finder-rememberMe');
      }
      alert("Login successful! (Simulation)");
      onNavigate('schools');
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back School</h2>
            <p className="mt-2 text-sm text-gray-600">Please enter your details to login your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
          </div>
          <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Remember Me</span>
              </label>
              <button type="button" onClick={() => onNavigate('forgot-password')} className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </button>
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </div>
           <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <button type="button" onClick={() => onNavigate('signup')} className="font-medium text-blue-600 hover:underline">
                  Sign Up
              </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
