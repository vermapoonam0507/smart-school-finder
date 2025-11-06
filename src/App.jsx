import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import SchoolsPage from "./pages/SchoolsPage";
import SchoolDetailsPage from "./pages/SchoolDetailsPage";
import LoginPage from "./pages/LoginPage";
import ComparePage from "./pages/ComparePage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ShortlistPage from "./pages/ShortlistPage";
import SchoolPortalPage from "./pages/SchoolPortalPage";
import StudentApplicationPage from "./pages/StudentApplicationPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RegistrationPage from "./pages/RegistrationPage";
import AdvancedSearchPage from "./pages/AdvancedSearchPage";
import PredictorPage from "./pages/PredictorPage";
import ChatbotPage from "./pages/ChatbotPage";
import SearchPage from "./pages/SearchPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminSignupPage from "./pages/AdminSignupPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminSchoolDetailsPage from "./pages/AdminSchoolDetailsPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import BlogPage from "./pages/BlogPage";
import ApplicationStatusPage from "./pages/ApplicationStatusPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import ApplicationSummaryPage from "./pages/ApplicationSummaryPage";
import ApplicationConfirmationPage from "./pages/ApplicationConfirmationPage";
import CompareSelectPage from "./pages/CompareSelectPage";
import ApplicationFlowPage from "./pages/ApplicationFlowPage";
import StudentApplicationTrackingPage from "./pages/StudentApplicationTrackingPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./context/AuthContext";
import {
  getShortlist,
  addToShortlist,
  removeFromShortlist,
} from "./api/userService";
import UserDashboard from "./components/UserDashboard";
import ChatbotFab from "./components/ChatbotFab";
import InterviewNotificationModal from "./components/InterviewNotificationModal";
import { useInterviewNotifications } from "./hooks/useInterviewNotifications";


function App() {
  const { user: currentUser, logout } = useAuth();
  const { interviewNotification, dismissNotification } = useInterviewNotifications();

  const navigate = useNavigate();

  const location = useLocation();

  const [shortlist, setShortlist] = useState([]);

  const [comparisonList, setComparisonList] = useState(() => {
    const saved = localStorage.getItem("comparisonList");

    return saved ? JSON.parse(saved) : [];
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("comparisonList", JSON.stringify(comparisonList));
  }, [comparisonList]);

  // Keep comparison count in sync when other pages update localStorage
  useEffect(() => {
    const onComparisonListUpdated = (e) => {
      try {
        if (e?.detail && Array.isArray(e.detail)) {
          setComparisonList(e.detail);
        } else {
          const saved = localStorage.getItem("comparisonList");
          setComparisonList(saved ? JSON.parse(saved) : []);
        }
      } catch (_) {}
    };
    window.addEventListener('comparisonListUpdated', onComparisonListUpdated);
    return () => window.removeEventListener('comparisonListUpdated', onComparisonListUpdated);
  }, []);

  // Clear comparison list when user logs out
  useEffect(() => {
    if (!currentUser) {
      setComparisonList([]);
    }
  }, [currentUser]);


useEffect(() => {
    const fetchShortlistAndProfile = async () => {
      // Agar user login nahi hai, to kuch mat karo
      if (!currentUser) {
        setShortlist([]);
        return;
      }

      // Skip shortlist/profile fetch for school and admin users
      if (currentUser.userType === 'school' || currentUser.userType === 'admin') {
        setShortlist([]);
        return;
      }

      try {
        // Yeh API call naye user ke liye fail hogi
        const authIdForApis = currentUser.authId || currentUser._id;
        const responseData = await getShortlist(authIdForApis);
        console.log("Fetched shortlist data:", responseData);
        const shortlistData = responseData.data || [];
        console.log("Setting shortlist to:", shortlistData);
        setShortlist(shortlistData);
      } catch (error) {
        // Yahan hum error ko handle karenge
        const errorMessage = error.response?.data?.message;

        // Check karo ki kya error "Student not found" hai
        if (errorMessage === "Student not found" || errorMessage === "Student Not Found") {
          console.log("Student profile not found. User needs to create profile first.");
          setShortlist([]); // Set empty shortlist instead of redirecting
          // Don't redirect automatically - let user decide when to create profile
        } else {
          // Agar koi aur error hai, to use console mein dikhao
          console.error("Could not load shortlisted schools:", error.response?.data || error.message);
          setShortlist([]);
        }
      }
    };

    fetchShortlistAndProfile();
  }, [currentUser, navigate]); // navigate ko dependency array mein add karna zaroori hai


  const handleLogout = () => {
    logout();

    navigate("/");

    toast.success("You have been logged out.");
  };

  const handleShortlistToggle = async (school) => {
    if (!currentUser) {
      toast.info("Please log in to shortlist schools.");
      return;
    }
    const schoolId = school.schoolId || school._id;
    const isShortlisted = shortlist.some(
      (item) => (item.schoolId || item._id) === schoolId
    );

    if (isShortlisted) {
      // Optimistic remove
      const prevShortlist = shortlist;
      setShortlist((prev) =>
        prev.filter((item) => (item.schoolId || item._id) !== schoolId)
      );
      try {
        await removeFromShortlist(
          currentUser.authId || currentUser._id,
          schoolId
        );
        toast.success(`${school.name} removed from shortlist.`);
      } catch (error) {
        // Revert on failure
        setShortlist(prevShortlist);
        toast.error(`Failed to remove ${school.name}.`);
      }
    } else {
      // Optimistic add
      const prevShortlist = shortlist;
      setShortlist((prev) => [...prev, school]);
      try {
        await addToShortlist(
          currentUser.authId || currentUser._id,
          schoolId
        );
        // Optionally refresh in background to sync with server shape
        try {
          const responseData = await getShortlist(currentUser.authId || currentUser._id);
          if (responseData && Array.isArray(responseData.data)) {
            setShortlist(responseData.data);
          }
        } catch (_) {}
        toast.success(`${school.name} added to shortlist!`);
      } catch (error) {
        // Revert on failure
        setShortlist(prevShortlist);
        toast.error(`Failed to shortlist ${school.name}.`);
      }
    }
  };

  const handleCompareToggle = (school) => {
    setComparisonList((prevList) => {
      const isInList = prevList.some(
        (item) =>
          (item.schoolId || item._id) === (school.schoolId || school._id)
      );

      return isInList
        ? prevList.filter(
            (item) =>
              (item.schoolId || item._id) !== (school.schoolId || school._id)
          )
        : [...prevList, school];
    });
  };

  // Calculate valid shortlist count (filter out invalid entries)
  const validShortlistCount = Array.isArray(shortlist) 
    ? shortlist.filter(school => school && (school._id || school.schoolId)).length 
    : 0;

  return (
    <>
      <Header
        isMobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        compareCount={comparisonList.length}
        shortlistCount={validShortlistCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main>
        <Routes>
         {/* Public Routes */}
         <Route path="/" element={<HomePage />} />
         <Route path="/landing" element={<LandingPage />} />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/signup" element={<SignUpPage />} />
         <Route path="/admin/login" element={<AdminLoginPage />} />
         <Route path="/admin/signup" element={<AdminSignupPage />} />
          <Route path="/create-profile" element={<CreateProfilePage shortlist={shortlist}/>} />
          <Route
            path="/signup-school"
            element={<SignUpPage isSchoolSignUp={true} />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route
            path="/schools"
            element={
              <SchoolsPage
                onCompareToggle={handleCompareToggle}
                comparisonList={comparisonList}
                shortlist={shortlist}
                onShortlistToggle={handleShortlistToggle}
              />
            }
          />
          <Route path="/search" element={<AdvancedSearchPage />} />
          <Route path="/search-schools" element={<SearchPage />} />
          <Route path="/predictor" element={<PredictorPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailsPage />} />
          <Route path="/application-status" element={<ApplicationStatusPage />} />
          <Route path="/application-summary" element={<ApplicationSummaryPage />} />
          <Route path="/application-confirmation" element={<ApplicationConfirmationPage />} />
          <Route path="/compare/select" element={<CompareSelectPage />} />
          <Route
            path="/school/:id"
            element={
              <SchoolDetailsPage
                shortlist={shortlist}
                onShortlistToggle={handleShortlistToggle}
              />
            }
          />
          <Route
            path="/compare"
            element={
              <ComparePage
                comparisonList={comparisonList}
                onCompareToggle={handleCompareToggle}
              />
            }
          />
          <Route
            path="/shortlist"
            element={
              <ShortlistPage
                shortlist={shortlist}
                onShortlistToggle={handleShortlistToggle}
                comparisonList={comparisonList}
                onCompareToggle={handleCompareToggle}
              />
            }
          />
     {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  shortlist={shortlist}
                  onShortlistToggle={handleShortlistToggle}
                  comparisonList={comparisonList}
                  onCompareToggle={handleCompareToggle}
                />
              }
            />
            <Route path="/school-registration" element={<RegistrationPage />} />
            <Route
              path="/school-portal/*"
            element={<SchoolPortalPage currentUser={currentUser} onLogout={handleLogout} />}
            />
            <Route
              path="/apply/:schoolId"
              element={<ApplicationFlowPage />}
            />
            <Route
              path="/student-application/:schoolId"
              element={<StudentApplicationPage />}
            />
            <Route
              path="/my-applications"
              element={
                currentUser?.userType === 'student' || currentUser?.userType === 'parent' ? (
                  <StudentApplicationTrackingPage />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
          </Route>
          {/* Admin routes guarded separately so they aren't blocked by user onboarding */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/school/:id"
            element={
              <AdminProtectedRoute>
                <AdminSchoolDetailsPage />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </main>
      <ChatbotFab />
      
      {/* Interview Notification Modal */}
      {interviewNotification && (
        <InterviewNotificationModal
          isOpen={!!interviewNotification}
          onClose={dismissNotification}
          interviewData={interviewNotification.interviewData}
          schoolName={interviewNotification.schoolName}
          notificationType={interviewNotification.notificationType}
        />
      )}
      
      <ToastContainer position="top-right" autoClose={3000} theme="colored" /> 
    </>
  );
}

export default App;
