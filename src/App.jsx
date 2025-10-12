import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
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
import BlogDetailsPage from "./pages/BlogDetailsPage";
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


function App() {
  const { user: currentUser, logout } = useAuth();

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
        setShortlist(responseData.data || []);
      } catch (error) {
        // Yahan hum error ko handle karenge
        const errorMessage = error.response?.data?.message;

        // Check karo ki kya error "Student not found" hai
        if (errorMessage === "Student not found") {
          console.log("Profile not found. Redirecting to /create-profile...");
          navigate("/create-profile"); // User ko profile page par bhej do
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

  return (
    <>
      <Header
        isMobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        compareCount={comparisonList.length}
        shortlistCount={shortlist.length}
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
              element={<StudentApplicationPage />}
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
      <ToastContainer position="top-right" autoClose={3000} theme="colored" /> 
    </>
  );
}

export default App;
