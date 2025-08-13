import React from 'react';
import { School, Menu, X } from 'lucide-react';

const Header = ({ onNavigate, isMobileMenuOpen, setMobileMenuOpen, compareCount }) => (
  <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-gray-800 cursor-pointer" onClick={() => onNavigate('landing')}>
        <School className="inline-block mr-2 text-blue-600" />
        SchoolFinder
      </div>
      <div className="hidden md:flex items-center space-x-8">
        <a href="#" className="text-gray-600 hover:text-blue-600" onClick={(e) => { e.preventDefault(); onNavigate('schools'); }}>Browse Schools</a>
        <a href="#" className="text-gray-600 hover:text-blue-600 relative" onClick={(e) => { e.preventDefault(); onNavigate('compare'); }}>
          Compare
          {compareCount > 0 && 
            <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {compareCount}
            </span>
          }
        </a>
      </div>
      <div className="hidden md:flex items-center space-x-4">
        <button className="text-gray-600 hover:text-blue-600" onClick={() => onNavigate('login')}>Sign In</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" onClick={() => onNavigate('register')}>Register Your School</button>
      </div>
      <div className="md:hidden">
        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
    {isMobileMenuOpen && (
      <div className="md:hidden bg-white shadow-lg">
        <a href="#" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); onNavigate('schools'); setMobileMenuOpen(false); }}>Browse Schools</a>
        <a href="#" className="block py-2 px-6 text-gray-600 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); onNavigate('compare'); setMobileMenuOpen(false); }}>
          Compare {compareCount > 0 && `(${compareCount})`}
        </a>
        <div className="px-6 py-4 border-t">
          <button className="w-full text-center text-gray-600 hover:text-blue-600 mb-2" onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}>Sign In</button>
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}>Register Your School</button>
        </div>
      </div>
    )}
  </header>
);

export default Header;
