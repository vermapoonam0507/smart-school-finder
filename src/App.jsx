import React, { useState } from 'react';
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

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [comparisonList, setComparisonList] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [shortlist, setShortlist] = useState([]);

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
    if (userExists) {
      return false;
    }
    setUsers(prevUsers => [...prevUsers, newUser]);
    console.log("Registered Users:", [...users, newUser]);
    return true;
  };

  const handleLogin = (credentials) => {
    const user = users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    if (user) {
      setCurrentUser(user);
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
      case 'register':
        return <RegistrationPage onNavigate={setCurrentPage} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div>
      {currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'forgot-password' &&
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