// src/pages/VerifyEmailPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { verifyEmail } from "../api/authService";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [verificationStatus, setVerificationStatus] = useState("verifying"); 

  useEffect(() => {
    if (!token) {
      setVerificationStatus("error");
      return;
    }

    const handleVerification = async () => {
      try {
        
        await verifyEmail(token);
        setVerificationStatus("success");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        console.error("Email verification failed:", error);
        setVerificationStatus("error");
      }
    };

    handleVerification();
  }, [token, navigate]);

  const renderContent = () => {
    switch (verificationStatus) {
      case "success":
        return (
          <>
            <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">
              Email Verified!
            </h1>
            <p className="text-gray-600 mt-2">
              Your account has been successfully verified. Redirecting you to
              the login page...
            </p>
          </>
        );
      case "error":
        return (
          <>
            <XCircle className="text-red-500 w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">
              Verification Failed
            </h1>
            <p className="text-gray-600 mt-2">
              The verification link is invalid or has expired. Please try
              signing up again.
            </p>
            <Link to="/signup" className="mt-4 text-blue-600 hover:underline">
              Go to Sign Up
            </Link>
          </>
        );
      default: 
        return (
          <>
            <Loader className="animate-spin text-blue-500 w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">
              Verifying Your Email...
            </h1>
            <p className="text-gray-600 mt-2">Please wait a moment.</p>
          </>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
