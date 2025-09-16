import React from 'react';
import { MapPin, PlusCircle, CheckCircle, Heart } from 'lucide-react';

const SchoolCard = ({ school, onCardClick, onCompareToggle, isCompared, currentUser, onShortlistToggle, isShortlisted, onApply }) => {
  
  
  if (!school) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col relative">
      {currentUser && (currentUser.userType === 'parent' || currentUser.userType === 'student') && (
        <button onClick={onShortlistToggle} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 z-10">
          <Heart size={24} className={isShortlisted ? "fill-current text-red-500" : ""} />
        </button>
      )}
      
      <div onClick={onCardClick} className="p-6 cursor-pointer flex-grow">
       

        <h3 className="text-xl font-bold text-gray-900 mb-2">{school.name || 'School Name Not Available'}</h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin size={16} className="mr-2 text-blue-500" />
          {/* FIX: Changed school.basicInfo.city and .state to direct properties */}


          {/* <span>{school.city || 'N/A'}, {school.state || 'N/A'}</span> */}
          <span>{school.location}</span>


        </div>
        
        <div className="flex flex-wrap gap-2">
          
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{school.board || 'N/A'}</span>
          <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{school.genderType || 'N/A'}</span>
        </div>
      </div>
      
      <div className={`px-6 pt-4 pb-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3` }>
        <button 
          onClick={onCompareToggle}
          className={`${currentUser ? 'w-full' : 'w-full md:w-3/4'} flex items-center justify-center font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-300 ${
            isCompared 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isCompared ? <CheckCircle size={16} className="mr-2" /> : <PlusCircle size={16} className="mr-2" />}
          {isCompared ? 'Compared' : 'Compare'}
        </button>
        <button
          onClick={onApply}
          className="w-full flex items-center justify-center font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-300 bg-blue-600 text-white hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default SchoolCard;
