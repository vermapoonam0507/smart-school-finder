import React, { useState, useEffect } from 'react';
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

function App() {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('school-finder-users')) || []);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('school-finder-currentUser')) || null);
  const [shortlist, setShortlist] = useState([]);
  const [comparisonList, setComparisonList] = useState(() => JSON.parse(localStorage.getItem('school-finder-comparisonList')) || []);
  const [schoolRegistrations, setSchoolRegistrations] = useState(() => JSON.parse(localStorage.getItem('school-finder-registrations')) || {});
  const [studentApplications, setStudentApplications] = useState(() => JSON.parse(localStorage.getItem('school-finder-student-apps')) || []);
  
  const navigate = useNavigate();

  useEffect(() => { localStorage.setItem('school-finder-users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('school-finder-currentUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { if (currentUser) { localStorage.setItem(`shortlist_${currentUser.email}`, JSON.stringify(shortlist)); } }, [shortlist]);
  useEffect(() => { localStorage.setItem('school-finder-comparisonList', JSON.stringify(comparisonList)); }, [comparisonList]);
  useEffect(() => { localStorage.setItem('school-finder-registrations', JSON.stringify(schoolRegistrations)); }, [schoolRegistrations]);
  useEffect(() => { localStorage.setItem('school-finder-student-apps', JSON.stringify(studentApplications)); }, [studentApplications]);

  useEffect(() => {
    if (currentUser) {
      const userShortlist = JSON.parse(localStorage.getItem(`shortlist_${currentUser.email}`)) || [];
      setShortlist(userShortlist);
    } else {
      setShortlist([]);
    }
  }, [currentUser]);

  const handleCompareToggle = (school) => {
    setComparisonList((prevList) => {
      const isInList = prevList.some((item) => item.id === school.id);
      return isInList ? prevList.filter((item) => item.id !== school.id) : [...prevList, school];
    });
  };

  const handleSignUp = (newUser) => {
    if (users.some(user => user.email === newUser.email)) return false;
    setUsers(prevUsers => [...prevUsers, newUser]);
    return true;
  };

  const handleLogin = (credentials) => {
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
    if (user) {
      setCurrentUser(user);
      navigate(user.role === 'school' ? '/school-portal' : '/schools');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const handleShortlistToggle = (school) => {
    if (!currentUser || currentUser.role !== 'parent') {
      alert("Please log in as a Parent/Student to shortlist schools.");
      navigate('/login');
      return;
    }
    setShortlist((prevList) => {
      const isInList = prevList.some((item) => item.id === school.id);
      return isInList ? prevList.filter((item) => item.id !== school.id) : [...prevList, school];
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/schools" element={<SchoolsPage onSelectSchool={setSelectedSchool} onCompareToggle={handleCompareToggle} comparisonList={comparisonList} currentUser={currentUser} shortlist={shortlist} onShortlistToggle={handleShortlistToggle} />} />
          <Route path="/school/:id" element={<SchoolDetailsPage school={selectedSchool} currentUser={currentUser} shortlist={shortlist} onShortlistToggle={handleShortlistToggle} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUpPage onSignUp={handleSignUp} />} />
          <Route path="/signup-school" element={<SignUpPage onSignUp={handleSignUp} isSchoolSignUp={true} />} />
          <Route path="/signup-parent" element={<SignUpPage onSignUp={handleSignUp} isParentSignUp={true} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage currentUser={currentUser} shortlist={shortlist} onShortlistToggle={handleShortlistToggle} onSelectSchool={setSelectedSchool} comparisonList={comparisonList} onCompareToggle={handleCompareToggle} />} />
          <Route path="/compare" element={<ComparePage comparisonList={comparisonList} onCompareToggle={handleCompareToggle} />} />
          <Route path="/school-portal/*" element={<SchoolPortalPage currentUser={currentUser} onLogout={handleLogout} registrationData={schoolRegistrations[currentUser?.email]} onRegister={handleSchoolRegistration} />} />
          <Route path="/apply/:schoolId" element={<StudentApplicationPage onApply={handleStudentApplication} currentUser={currentUser} />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
