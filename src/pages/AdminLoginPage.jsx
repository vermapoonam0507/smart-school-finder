// src/pages/AdminLoginPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const adminLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
  });

  // Load saved "remember me" credentials
  useEffect(() => {
    const savedCreds = localStorage.getItem("admin-rememberMe");
    if (savedCreds) {
      const { email, password } = JSON.parse(savedCreds);
      setValue("email", email);
      setValue("password", password);
      setRememberMe(true);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      // Call the new AuthContext login with userType='admin'
      await login({ email: data.email, password: data.password }, 'admin');

      // Remember me
      if (rememberMe) {
        localStorage.setItem("admin-rememberMe", JSON.stringify(data));
      } else {
        localStorage.removeItem("admin-rememberMe");
      }

      // Clear any admin redirect path and always navigate to admin dashboard
      const redirectPath = localStorage.getItem("adminRedirectPath");
      if (redirectPath) {
        localStorage.removeItem("adminRedirectPath");
      }
      
      // Always navigate to admin dashboard to avoid accessing restricted areas
      navigate("/admin/dashboard");

    } catch (error) {
      console.error("Admin login failed:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid admin credentials. Please try again.";
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">
              {serverError}
            </p>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="admin@example.com"
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
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
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In as Admin"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need admin access?{" "}
              <Link to="/admin/signup" className="font-medium text-blue-600 hover:underline">
                Request Admin Account
              </Link>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <Link to="/login" className="text-gray-500 hover:text-gray-700">
                ← Back to User Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
