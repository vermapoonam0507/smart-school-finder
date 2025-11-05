import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ to = "/", className = "", size = "default", showText = true }) => {
  const sizes = {
    small: {
      circle: "w-9 h-9",
      text: "text-xl",
      letterSize: "text-2xl",
      gap: "gap-0.5"
    },
    default: {
      circle: "w-12 h-12",
      text: "text-3xl",
      letterSize: "text-3xl",
      gap: "gap-1"
    },
    large: {
      circle: "w-16 h-16",
      text: "text-4xl",
      letterSize: "text-4xl",
      gap: "gap-1"
    }
  };

  const currentSize = sizes[size] || sizes.default;

  const LogoContent = () => (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      {/* Yellow circular background with black "S" */}
      <div className={`${currentSize.circle} rounded-full bg-yellow-400 flex items-center justify-center relative`}>
        <span className={`${currentSize.letterSize} font-black text-black leading-none tracking-tight`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>S</span>
      </div>
      
      {/* Rest of the text in black */}
      {showText && (
        <span className={`${currentSize.text} font-extrabold text-black leading-none tracking-tight lowercase`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          ynzy
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="hover:opacity-90 transition-opacity">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo;
