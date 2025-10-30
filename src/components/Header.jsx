import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { School, Menu, X, LogOut, User, ChevronDown, Shield } from 'lucide-react';
import NotificationIcon from './NotificationIcon';

const Header = ({ isMobileMenuOpen, setMobileMenuOpen, compareCount, shortlistCount = 0, currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authPages = ['/login', '/signup', '/signup-school', '/forgot-password', '/admin/login', '/admin/signup'];
  if (authPages.includes(location.pathname) || location.pathname.startsWith('/school-portal') || location.pathname.startsWith('/admin/dashboard')) {
    return null;
  }

  const handleRegisterClick = () => {
    if (currentUser && currentUser.userType === 'school') {
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
        {(!currentUser || currentUser.userType !== 'school') && (
            <>
                <Link to="/schools" className="text-gray-600 hover:text-blue-600">Browse Schools</Link>
                {currentUser && (
                  <>
                    <Link to="/search-schools" className="text-gray-600 hover:text-blue-600">Search Schools</Link>
                    <Link to="/predictor" className="text-gray-600 hover:text-blue-600">Predict Schools</Link>
                  </>
                )}
                <Link to="/compare" className="text-gray-600 hover:text-blue-600 relative">
                  Compare
                  {compareCount > 0 && <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{compareCount}</span>}
                </Link>
                <Link to="/shortlist" className="text-gray-600 hover:text-blue-600 relative">
                  Shortlist
                  {shortlistCount > 0 && <span className="absolute -top-2 -right-6 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{shortlistCount}</span>}
                </Link>
                <Link to="/blog" className="text-gray-600 hover:text-blue-600">Blog</Link>
            </>
        )}

         {currentUser && (currentUser.userType === 'parent' || currentUser.userType === 'student') && (
            <Link to="/application-status" className="text-gray-600 hover:text-blue-600">Application Status</Link>
          )}

      </div>
      <div className="hidden md:flex items-center space-x-4">
        {currentUser ? (
            <>
                <NotificationIcon />
                <ProfileDropdown currentUser={currentUser} onLogout={onLogout} />
            </>
        ) : (
            <>
                <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
                  <User size={16} className="text-gray-500" />
                  <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">User/Parent Login</Link>
                </div>
                <div className="flex items-center gap-2">
                  <School size={16} className="text-blue-600" />
                  <Link to="/signup-school" className="text-blue-600 hover:text-blue-700 font-medium">School Login</Link>
                </div>
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
        {(!currentUser || currentUser.userType !== 'school') && (
          <>
            <Link to="/schools" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Browse Schools</Link>
            {currentUser && (
              <>
                <Link to="/search-schools" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Search Schools</Link>
                <Link to="/predictor" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Predict Schools</Link>
              </>
            )}
            <Link to="/compare" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Compare {compareCount > 0 && `(${compareCount})`}</Link>
            <Link to="/shortlist" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Shortlist {shortlistCount > 0 && `(${shortlistCount})`}</Link>
            <Link to="/blog" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
          </>
        )}

        {currentUser && (currentUser.userType === 'parent' || currentUser.userType === 'student') && (
          <Link to="/application-status" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>Application Status</Link>
        )}
                    

        <div className="px-6 py-4 border-t">
          {currentUser ? (
            <>
              {(currentUser.userType === 'student' || currentUser.userType === 'parent') && (
                <div className="mb-4">
                  <NotificationIcon />
                </div>
              )}
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="w-full text-center text-gray-600 hover:text-blue-600 flex items-center justify-center">
                  <LogOut size={16} className="mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center justify-center gap-2 w-full text-center text-gray-600 hover:text-blue-600 mb-3 py-2 border-b border-gray-200" onClick={() => setMobileMenuOpen(false)}>
                <User size={16} />
                <span className="font-medium">User/Parent Login</span>
              </Link>
              <Link to="/signup-school" className="flex items-center justify-center gap-2 w-full text-center text-blue-600 hover:text-blue-700 py-2" onClick={() => setMobileMenuOpen(false)}>
                <School size={16} />
                <span className="font-medium">School Login</span>
              </Link>
            </>
          )}
        </div>
      </div>
    )}
  </header>
  );
};

const ProfileDropdown = ({ currentUser, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const displayName = (currentUser?.name || currentUser?.email?.split('@')[0] || 'Account');
  const initials = (displayName?.[0] || 'U').toUpperCase();

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100">
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>
        <span className="text-gray-700 hidden sm:block max-w-[140px] truncate">{displayName}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          {(currentUser.userType === 'parent' || currentUser.userType === 'student') && (
            <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
          )}
          {currentUser.userType === 'school' && (
            <Link to="/school-portal" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">School Portal</Link>
          )}
          <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Home</Link>
          <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;