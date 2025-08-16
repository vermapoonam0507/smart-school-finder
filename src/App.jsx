import React, { useState, useEffect } from 'react';
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

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('school-finder-users')) || []);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('school-finder-currentUser')) || null);
  const [shortlist, setShortlist] = useState([]);
  const [comparisonList, setComparisonList] = useState(() => JSON.parse(localStorage.getItem('school-finder-comparisonList')) || []);

  useEffect(() => {
    localStorage.setItem('school-finder-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('school-finder-currentUser', JSON.stringify(currentUser));
  }, [currentUser]);
  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`shortlist_${currentUser.email}`, JSON.stringify(shortlist));
    }
  }, [shortlist]);

  useEffect(() => {
    localStorage.setItem('school-finder-comparisonList', JSON.stringify(comparisonList));
  }, [comparisonList]);

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
      const isInList = prevList.find((item) => item.id === school.id);
      if (isInList) {
        return prevList.filter((item) => item.id !== school.id);
      } else {
        if (prevList.length < 4) {
          return [...prevList, school];
        } else {
          alert("Aap ek saath sirf 4 schools compare kar sakte hain.");
          return prevList;
        }
      }
    });
  };

  const handleSignUp = (newUser) => {
    const userExists = users.find(user => user.email === newUser.email);
    if (userExists) return false;
    setUsers(prevUsers => [...prevUsers, newUser]);
    return true;
  };

  const handleLogin = (credentials) => {
    const user = users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    if (user) {
      setCurrentUser(user);
      if (user.role === 'school') {
        setCurrentPage('school-portal');
      } else {
        setCurrentPage('schools');
      }
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  const handleShortlistToggle = (school) => {
    if (!currentUser || currentUser.role !== 'parent') {
      alert("Please log in as a Parent/Student to shortlist schools.");
      setCurrentPage('login');
      return;
    }
    setShortlist((prevList) => {
      const isInList = prevList.find((item) => item.id === school.id);
      if (isInList) {
        return prevList.filter((item) => item.id !== school.id);
      } else {
        return [...prevList, school];
      }
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'schools':
        return <SchoolsPage
                  onNavigate={setCurrentPage}
                  onSelectSchool={setSelectedSchool}
                  onCompareToggle={handleCompareToggle}
                  comparisonList={comparisonList}
                  currentUser={currentUser}
                  shortlist={shortlist}
                  onShortlistToggle={handleShortlistToggle}
               />;
      case 'school-details':
        return <SchoolDetailsPage
                  school={selectedSchool}
                  onNavigate={setCurrentPage}
                  currentUser={currentUser}
                  shortlist={shortlist}
                  onShortlistToggle={handleShortlistToggle}
                />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'signup':
        return <SignUpPage onNavigate={setCurrentPage} onSignUp={handleSignUp} />;
      case 'signup-school': // <-- Naya case
        return <SignUpPage onNavigate={setCurrentPage} onSignUp={handleSignUp} isSchoolSignUp={true} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage
                  currentUser={currentUser}
                  shortlist={shortlist}
                  onShortlistToggle={handleShortlistToggle}
                  onSelectSchool={setSelectedSchool}
                  onNavigate={setCurrentPage}
                  comparisonList={comparisonList}
                  onCompareToggle={handleCompareToggle}
                />;
      case 'compare':
        return <ComparePage
                  comparisonList={comparisonList}
                  onCompareToggle={handleCompareToggle}
                  onNavigate={setCurrentPage}
               />;
      case 'school-portal':
        return <SchoolPortalPage currentUser={currentUser} onLogout={handleLogout} />;
      case 'register':
        return <RegistrationPage onNavigate={setCurrentPage} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div>
      {currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'signup-school' && currentPage !== 'forgot-password' && currentPage !== 'school-portal' &&
        <Header
          onNavigate={setCurrentPage}
          isMobileMenuOpen={isMobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          compareCount={comparisonList.length}
          currentUser={currentUser}
          onLogout={handleLogout}
        />}
      <main>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
