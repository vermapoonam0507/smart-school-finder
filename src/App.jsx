import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import SchoolsPage from "./pages/SchoolsPage";
import SchoolDetailsPage from "./pages/SchoolDetailsPage";
import LoginPage from "./pages/LoginPage";
import ComparePage from "./pages/ComparePage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import SchoolPortalPage from "./pages/SchoolPortalPage";
import StudentApplicationPage from "./pages/StudentApplicationPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RegistrationPage from "./pages/RegistrationPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./context/AuthContext";
import {
  getShortlist,
  addToShortlist,
  removeFromShortlist,
} from "./api/userService";
import UserDashboard from "./components/UserDashboard";


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

      // Skip shortlist/profile fetch for school users
      if (currentUser.userType === 'school') {
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
    const isShortlisted = shortlist.some(item => (item.schoolId || item._id) === schoolId);

    if (isShortlisted) {
      try {
        await removeFromShortlist(
          currentUser.authId || currentUser._id,
          school.schoolId || school._id
        );

        setShortlist((prev) =>
          prev.filter(
            (item) =>
              (item.schoolId || item._id) !== (school.schoolId || school._id)
          )
        );

        toast.success(`${school.name} removed from shortlist.`);
      } catch (error) {
        toast.error(`Failed to remove ${school.name}.`);
      }
    } else {
      try {
        await addToShortlist(currentUser.authId || currentUser._id, school.schoolId || school._id); // We re-fetch the shortlist after adding to ensure our data is fresh from the server

        const responseData = await getShortlist(currentUser.authId || currentUser._id);

        if (responseData && Array.isArray(responseData.data)) {
          setShortlist(responseData.data);
        }

        toast.success(`${school.name} added to shortlist!`);
      } catch (error) {
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
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main>
        <Routes>
         {/* Public Routes */}
         <Route path="/" element={<LandingPage />} />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/signup" element={<SignUpPage />} />
          <Route path="/create-profile" element={<CreateProfilePage shortlist={shortlist}/>} />
          <Route
            path="/signup-school"
            element={<SignUpPage isSchoolSignUp={true} />}
          />
          <Route path="/user-dashboard" element={<UserDashboard  shortlist={shortlist}/>} />
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
              element={<SchoolPortalPage onLogout={handleLogout} />}
            />
            <Route
              path="/apply/:schoolId"
              element={<StudentApplicationPage />}
            />
          </Route>
        </Routes>
      </main>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" /> 
    </>
  );
}

export default App;
