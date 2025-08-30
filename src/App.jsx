// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import SchoolsPage from './pages/SchoolsPage';
import SchoolDetailsPage from './pages/SchoolDetailsPage';
import LoginPage from './pages/LoginPage';
import ComparePage from './pages/ComparePage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SchoolPortalPage from './pages/SchoolPortalPage';
import StudentApplicationPage from './pages/StudentApplicationPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProtectedRoute from './components/ProtectedRoute';
import RegistrationPage from './pages/RegistrationPage';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './context/AuthContext';
import { getShortlist, addToShortlist, removeFromShortlist } from './api/userService';

function App() {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [shortlist, setShortlist] = useState([]);
  const [comparisonList, setComparisonList] = useState(() => {
    const saved = localStorage.getItem('comparisonList');
    return saved ? JSON.parse(saved) : [];
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
  }, [comparisonList]);

  useEffect(() => {
    const fetchShortlist = async () => {
      // ===> THE FIX: Only fetch shortlist for parent or student users <===
      if (currentUser && (currentUser.userType === 'parent' || currentUser.userType === 'student')) {
        try {
          const responseData = await getShortlist(currentUser._id);
          
          // This robust check prevents crashes if the API returns an object when empty
          if (Array.isArray(responseData)) {
            setShortlist(responseData);
          } else if (responseData && Array.isArray(responseData.data)) {
            setShortlist(responseData.data);
          } else {
            setShortlist([]);
          }
        } catch (error) {
          toast.error("Could not load your shortlisted schools.");
          setShortlist([]);
        }
      } else {
        setShortlist([]);
      }
    };
    fetchShortlist();
  }, [currentUser]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success("You have been logged out.");
  };

  const handleShortlistToggle = async (school) => {
    if (!currentUser) {
      toast.error("Please log in to shortlist schools.");
      localStorage.setItem('redirectPath', `/school/${school._id}`);
      navigate('/login');
      return;
    }

    const isShortlisted = shortlist.some((item) => item._id === school._id);

    if (isShortlisted) {
      try {
        await removeFromShortlist(currentUser._id, school._id);
        setShortlist((prev) => prev.filter((item) => item._id !== school._id));
        toast.success(`${school.name} removed from shortlist.`);
      } catch (error) {
        toast.error(`Failed to remove ${school.name}.`);
      }
    } else {
      setShortlist((prev) => [...prev, school]);
      try {
        await addToShortlist(currentUser._id, school._id);
        toast.success(`${school.name} added to shortlist!`);
      } catch (error) {
        setShortlist((prev) => prev.filter((item) => item._id !== school._id));
        toast.error(`Failed to shortlist ${school.name}.`);
      }
    }
  };

  const handleCompareToggle = (school) => {
    setComparisonList((prevList) => {
      const isInList = prevList.some((item) => item._id === school._id);
      return isInList ? prevList.filter((item) => item._id !== school._id) : [...prevList, school];
    });
  };

  return (
    <>
      <Header
        isMobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        compareCount={comparisonList.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signup-school" element={<SignUpPage isSchoolSignUp={true} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          
          <Route 
            path="/schools" 
            element={<SchoolsPage 
              onCompareToggle={handleCompareToggle} 
              comparisonList={comparisonList} 
              shortlist={shortlist} 
              onShortlistToggle={handleShortlistToggle} 
            />} 
          />
          <Route 
            path="/school/:id" 
            element={<SchoolDetailsPage 
              shortlist={shortlist} 
              onShortlistToggle={handleShortlistToggle} 
            />} 
          />
          <Route 
            path="/compare" 
            element={<ComparePage 
              comparisonList={comparisonList} 
              onCompareToggle={handleCompareToggle} 
            />} 
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route 
              path="/dashboard" 
              element={<DashboardPage 
                shortlist={shortlist} 
                onShortlistToggle={handleShortlistToggle}
                comparisonList={comparisonList}
                onCompareToggle={handleCompareToggle}
              />} 
            />
            <Route path="/school-registration" element={<RegistrationPage />} />
            <Route path="/school-portal/*" element={<SchoolPortalPage onLogout={handleLogout} />} />
            <Route path="/apply/:schoolId" element={<StudentApplicationPage />} />
          </Route>
        </Routes>
      </main>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}

export default App;