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

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [comparisonList, setComparisonList] = useState([]);
  
  // To simulate a user database
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

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
      return false; // Sign up failed
    }
    setUsers(prevUsers => [...prevUsers, newUser]);
    console.log("Registered Users:", [...users, newUser]); // For debugging
    return true; // Sign up successful
  };

  const handleLogin = (credentials) => {
    const user = users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    if (user) {
      setCurrentUser(user);
      return true; // Login successful
    }
    return false; // Login failed
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
               />;
      case 'school-details':
        return <SchoolDetailsPage school={selectedSchool} onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'signup':
        return <SignUpPage onNavigate={setCurrentPage} onSignUp={handleSignUp} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={setCurrentPage} />;
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
      {/* Header ko auth pages par hide karein */}
      {currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'forgot-password' &&
        <Header 
          onNavigate={setCurrentPage} 
          isMobileMenuOpen={isMobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen}
          compareCount={comparisonList.length}
        />}
      <main>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
