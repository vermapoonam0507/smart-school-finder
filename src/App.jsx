import React, { useState } from 'react';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import SchoolsPage from './pages/SchoolsPage';
import SchoolDetailsPage from './pages/SchoolDetailsPage';
import LoginPage from './pages/LoginPage';
import ComparePage from './pages/ComparePage';
import RegistrationPage from './pages/RegistrationPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [comparisonList, setComparisonList] = useState([]);

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
        return <LoginPage onNavigate={setCurrentPage} />;
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
      {currentPage !== 'login' && 
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