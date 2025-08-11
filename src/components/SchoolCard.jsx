import React from 'react';
import { MapPin, PlusCircle, CheckCircle } from 'lucide-react';

const SchoolCard = ({ school, onCardClick, onCompareToggle, isCompared }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col">

    {/* Card ke body par click karne se details page khulega */}
    
    <div onClick={onCardClick} className="p-6 cursor-pointer flex-grow">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{school.basicInfo.name}</h3>
      <div className="flex items-center text-gray-600 mb-4">
        <MapPin size={16} className="mr-2 text-blue-500" />
        <span>{school.basicInfo.city}, {school.basicInfo.state}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{school.basicInfo.board}</span>
        <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{school.basicInfo.genderType}</span>
      </div>
    </div>
    
   
    <div className="px-6 pt-4 pb-4 bg-gray-50 border-t border-gray-200">
      <button 
        onClick={onCompareToggle}
        className={`w-full flex items-center justify-center font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-300 ${
          isCompared 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {isCompared ? <CheckCircle size={16} className="mr-2" /> : <PlusCircle size={16} className="mr-2" />}
        {isCompared ? 'Added to Compare' : 'Add to Compare'}
      </button>
    </div>
  </div>
);

export default SchoolCard;