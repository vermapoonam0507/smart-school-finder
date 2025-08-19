import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { School, Menu, X, LogOut } from 'lucide-react';

const Header = ({ isMobileMenuOpen, setMobileMenuOpen, compareCount, currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authPages = ['/login', '/signup', '/signup-school', '/forgot-password'];
  
  if (authPages.includes(location.pathname) || location.pathname.startsWith('/school-portal')) {
    return null;
  }

  const handleRegisterClick = () => {
    if (currentUser && currentUser.role === 'school') {
      navigate('/school-portal');
    } else {
      navigate('/signup-school');
    }
  };

  return (
  <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-gray-800">
        <School className="inline-block mr-2 text-blue-600" />
        SchoolFinder
      </Link>
      <div className="hidden md:flex items-center space-x-8">
        {(!currentUser || currentUser.role !== 'school') && (
            <>
                <Link to="/schools" className="text-gray-600 hover:text-blue-600">Browse Schools</Link>
                <Link to="/compare" className="text-gray-600 hover:text-blue-600 relative">
                  Compare
                  {compareCount > 0 && <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{compareCount}</span>}
                </Link>
            </>
        )}
        {currentUser && currentUser.role === 'parent' && (
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
        )}
      </div>
      <div className="hidden md:flex items-center space-x-4">
        {currentUser ? (
            <>
                <span className="text-gray-700">Welcome, {currentUser.name.split(' ')[0]}!</span>
                <button onClick={onLogout} className="text-gray-600 hover:text-blue-600 flex items-center">
                    <LogOut size={16} className="mr-1" /> Logout
                </button>
            </>
        ) : (
            <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">Sign In</Link>
                <button onClick={handleRegisterClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Register Your School</button>
            </>
        )}
      </div>
      <div className="md:hidden">
        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
    {isMobileMenuOpen && (
      <div className="md:hidden bg-white shadow-lg absolute top-full left-0 w-full">
        <Link to="/schools" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Browse Schools</Link>
        <Link to="/compare" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Compare {compareCount > 0 && `(${compareCount})`}</Link>
        {currentUser && currentUser.role === 'parent' && (
            <Link to="/dashboard" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
        )}
        <div className="px-6 py-4 border-t">
          {currentUser ? (
            <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="w-full text-center text-gray-600 hover:text-blue-600 flex items-center justify-center">
                <LogOut size={16} className="mr-1" /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="block w-full text-center text-gray-600 hover:text-blue-600 mb-2 py-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <button onClick={() => { handleRegisterClick(); setMobileMenuOpen(false); }} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Register Your School</button>
            </>
          )}
        </div>
      </div>
    )}
  </header>
  );
};

export default Header;