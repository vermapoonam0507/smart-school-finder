import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const ChatbotFab = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenOn = ['/login', '/signup', '/signup-school', '/forgot-password'];
  const isHidden = hiddenOn.includes(location.pathname) || location.pathname.startsWith('/school-portal') || location.pathname === '/chatbot';

  if (isHidden) return null;

  return (
    <button
      aria-label="Open Chatbot"
      onClick={() => navigate('/chatbot')}
      className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 flex items-center justify-center"
    >
      <MessageCircle size={24} />
    </button>
  );
};

export default ChatbotFab;


