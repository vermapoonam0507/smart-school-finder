import React from 'react';

const LoginPage = ({ onNavigate }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-900">Sign In</h2>
      <form className="space-y-6">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-center justify-between">
            <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
        </div>
        <div>
          <button
            type="submit"
            onClick={(e) => {
                e.preventDefault();

                // Here you would normally call your real API to log in.
                // After successful login, you would navigate the user.

                console.log("Login button clicked!");

                


                onNavigate('schools'); // Navigate to schools page after login
            }}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </div>
         <p className="text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-blue-600 hover:underline">
                Sign Up
            </a>
        </p>
      </form>
    </div>
  </div>
);

export default LoginPage;
