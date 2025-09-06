//FeatureCard.jsx
import React from 'react';

const FeatureCard = ({ icon, title, text }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
    <div className="flex justify-center items-center mb-4 text-blue-600">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{text}</p>
  </div>
);

export default FeatureCard;