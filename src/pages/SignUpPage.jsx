import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { registerUser } from "../api/authService";

const signUpSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.string(), 
});

const SignUpPage = ({ isSchoolSignUp = false }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: isSchoolSignUp ? "school" : "parent",
      name: "",
      email: "",
      password: "",
    },
  });

  const role = watch("role");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        userType: data.role,
        authProvider: "email",
      };

      await registerUser(payload);

      toast.success("Sign up successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Sign up failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An account with this email already exists.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Create an Account
          </h2>
          {isSchoolSignUp && (
            <p className="mt-2 text-sm text-gray-600">for your School</p>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!isSchoolSignUp && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                I am a:
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="parent"
                    {...register("role")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Parent</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="student"
                    {...register("role")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Student</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="school"
                    {...register("role")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">School</span>
                </label>
              </div>
            </div>
          )}

          <div>
            
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              {role === "school" ? "School Name" : "Full Name"}
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={
                role === "school" ? "Delhi Public School" : "Poonam Verma"
              }
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
