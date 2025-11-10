// src/pages/LoginPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const savedCreds = localStorage.getItem("school-finder-rememberMe");
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
      await login(data);

      if (rememberMe) {
        localStorage.setItem("school-finder-rememberMe", JSON.stringify(data));
      } else {
        localStorage.removeItem("school-finder-rememberMe");
      }

      // Clear any redirect path that might lead to restricted areas
      const redirectPath = localStorage.getItem("redirectPath");
      if (redirectPath) {
        localStorage.removeItem("redirectPath");
      }
      
      // Always navigate to dashboard for regular users to avoid accessing restricted areas
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Login failed:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || 
          "Please verify your email before logging in.";
        
        setServerError(errorMessage);
        setShowResendButton(true);
        setUserEmail(data.email);
        
        // Show additional info for email verification
        toast.info("Please check your email inbox for verification link.");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          "Invalid email or password. Please try again.";
        setServerError(errorMessage);
        setShowResendButton(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = () => {
    // Since backend doesn't have resend verification endpoint,
    // provide helpful guidance instead
    const currentEmail = watch("email") || userEmail;
    
    if (!currentEmail) {
      toast.error("Please enter your email address first.");
      return;
    }
    
    toast.info("Resend verification feature is not available.");
    toast.info("Please check your email inbox (including spam folder) for the verification link.");
    toast.info("If you can't find it, try registering again with a different email address.");
    
    // Hide the button after showing guidance
    setTimeout(() => {
      setShowResendButton(false);
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your details to login.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">
              <p>{serverError}</p>
              {showResendButton && (
                <div className="mt-2 space-y-1">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-blue-600 hover:text-blue-800 underline text-xs block"
                  >
                    Need help with verification?
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="text-green-600 hover:text-green-800 underline text-xs block"
                  >
                    Try registering with a different email
                  </button>
                </div>
              )}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="you@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
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
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
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
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
          <p className="text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
