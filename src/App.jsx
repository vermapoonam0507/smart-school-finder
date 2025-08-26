import React, { useState, useEffect } from 'react'; // <-- Yeh line ab theek hai
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import SchoolsPage from './pages/SchoolsPage';
import SchoolDetailsPage from './pages/SchoolDetailsPage';
import LoginPage from './pages/LoginPage';
import ComparePage from './pages/ComparePage';
import RegistrationPage from './pages/RegistrationPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SchoolPortalPage from './pages/SchoolPortalPage';
import StudentApplicationPage from './pages/StudentApplicationPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import VerifyEmailPage from './pages/VerifyEmailPage';

// Import the ProtectedRoute component
import ProtectedRoute from './components/ProtectedRoute';

// Import the useAuth hook
import { useAuth } from './context/AuthContext';

function App() {
  // Get user and logout function from the context
  const { user: currentUser, logout: handleLogout } = useAuth();
  
  // All other state remains the same
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shortlist, setShortlist] = useState([]);
  const [comparisonList, setComparisonList] = useState(() => JSON.parse(localStorage.getItem('school-finder-comparisonList')) || []);
  const [schoolRegistrations, setSchoolRegistrations] = useState(() => JSON.parse(localStorage.getItem('school-finder-registrations')) || {});
  const [studentApplications, setStudentApplications] = useState(() => JSON.parse(localStorage.getItem('school-finder-student-apps')) || []);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const userShortlist = JSON.parse(localStorage.getItem(`shortlist_${currentUser.email}`)) || [];
      setShortlist(userShortlist);
    } else {
      setShortlist([]);
    }
  }, [currentUser]);

  // const handleCompareToggle = (school) => {
  //   setComparisonList((prevList) => {
  //     const isInList = prevList.some((item) => item.id === school.id);
  //     return isInList ? prevList.filter((item) => item.id !== school.id) : [...prevList, school];
  //   });
  // };

  // Naya aur Sahi Code
const handleCompareToggle = (school) => {
  setComparisonList((prevList) => {
    // FIX: Ab hum '_id' se check kar rahe hain
    const isInList = prevList.some((item) => item._id === school._id);
    if (isInList) {
      // FIX: Ab hum '_id' se filter kar rahe hain
      return prevList.filter((item) => item._id !== school._id);
    } else {
      return [...prevList, school];
    }
  });
};

  // const handleShortlistToggle = (school) => {
  //   if (!currentUser || currentUser.role !== 'parent') {
  //     alert("Please log in as a Parent/Student to shortlist schools.");
  //     navigate('/login');
  //     return;
  //   }
  //   setShortlist((prevList) => {
  //     const isInList = prevList.some((item) => item.id === school.id);
  //     return isInList ? prevList.filter((item) => item.id !== school.id) : [...prevList, school];
  //   });
  // };

  // App.jsx ke andar is function ko update karein

const handleShortlistToggle = (school) => {
  if (!currentUser || currentUser.role !== 'parent') {
    // Ab hum alert ki jagah toast notification istemal karenge
    toast.error("Please log in as a Parent/Student to shortlist schools.");
    navigate('/login');
    return;
  }
  setShortlist((prevList) => {
    // FIX: 'id' ko '_id' se badal diya
    const isInList = prevList.some((item) => item._id === school._id);
    if (isInList) {
      // FIX: 'id' ko '_id' se badal diya
      return prevList.filter((item) => item._id !== school._id);
    } else {
      return [...prevList, school];
    }
  });
};
  
  const handleSchoolRegistration = (formData) => {
    if (!currentUser || currentUser.role !== 'school') return false;
    setSchoolRegistrations(prev => ({ ...prev, [currentUser.email]: { ...formData, status: 'Pending' } }));
    alert("School registration submitted successfully!");
    return true;
  };

  const handleStudentApplication = (formData, schoolId, schoolEmail) => {
    if (!currentUser || currentUser.role !== 'parent') return false;
    const newApplication = {
        id: Date.now(),
        ...formData,
        schoolId: schoolId,
        schoolEmail: schoolEmail,
        applicantEmail: currentUser.email,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
    };
    setStudentApplications(prev => [...prev, newApplication]);
    alert("Application submitted successfully!");
    navigate('/dashboard');
    return true;
  };

  return (
    <>
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        compareCount={comparisonList.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signup-school" element={<SignUpPage isSchoolSignUp={true} />} />
          <Route path="/signup-parent" element={<SignUpPage isParentSignUp={true} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/schools" element={<SchoolsPage onSelectSchool={setSelectedSchool} onCompareToggle={handleCompareToggle} comparisonList={comparisonList} currentUser={currentUser} shortlist={shortlist} onShortlistToggle={handleShortlistToggle} />} />
          <Route path="/school/:id" element={<SchoolDetailsPage school={selectedSchool} currentUser={currentUser} shortlist={shortlist} onShortlistToggle={handleShortlistToggle} />} />
          <Route path="/compare" element={<ComparePage comparisonList={comparisonList} onCompareToggle={handleCompareToggle} />} />

          {/* --- Protected Routes --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage currentUser={currentUser} shortlist={shortlist} onShortlistToggle={handleShortlistToggle} onSelectSchool={setSelectedSchool} comparisonList={comparisonList} onCompareToggle={handleCompareToggle} />} />
            <Route path="/school-portal/*" element={<SchoolPortalPage currentUser={currentUser} onLogout={handleLogout} registrationData={schoolRegistrations[currentUser?.email]} onRegister={handleSchoolRegistration} />} />
            <Route path="/apply/:schoolId" element={<StudentApplicationPage onApply={handleStudentApplication} currentUser={currentUser} />} />
          </Route>
        </Routes>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
