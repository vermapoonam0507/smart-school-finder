import React from 'react';
import { MapPin, PlusCircle, CheckCircle, Heart } from 'lucide-react';

const SchoolCard = ({ school, onCardClick, onCompareToggle, isCompared, currentUser, onShortlistToggle, isShortlisted, onApply }) => {
  if (!school) {
    return null;
  }

  return (
    <div onClick={onCardClick} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCardClick()} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col relative">
      {currentUser && (currentUser.userType === 'parent' || currentUser.userType === 'student') && (
        <button onClick={onShortlistToggle} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 z-10">
          <Heart size={24} className={isShortlisted ? "fill-current text-red-500" : ""} />
        </button>
      )}
      
      <div className="p-6 cursor-pointer flex-grow">
       

        <h3 className="text-xl font-bold text-gray-900 mb-2">{school.name || 'School Name Not Available'}</h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin size={16} className="mr-2 text-blue-500" />
          {/* FIX: Changed school.basicInfo.city and .state to direct properties */}


          <span>{school.location || `${school.city || 'N/A'}${school.state ? ', ' + school.state : ''}`}</span>


        </div>
        
        <div className="flex flex-wrap gap-2">
          
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{school.board || 'N/A'}</span>
          <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{school.genderType || 'N/A'}</span>
        </div>
        

        {/* Technology Adoption Display */}
        {school.smartClassroomsPercentage && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span 
                className="text-xs text-gray-600 cursor-help" 
                title="Smart classrooms improve engagement through interactive learning"
              >
                📽️ Smart Classrooms
              </span>
              <span className="text-xs font-medium text-blue-600">
                {school.smartClassroomsPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${school.smartClassroomsPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {school.elearningPlatforms && school.elearningPlatforms.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span 
                className="text-xs text-gray-600 cursor-help"
                title="Digital learning platforms enhance student engagement and accessibility"
              >
                💻 E-learning
              </span>
              <span className="text-xs font-medium text-green-600">
                {Math.round(school.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / school.elearningPlatforms.length)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.round(school.elearningPlatforms.reduce((sum, p) => sum + (parseInt(p.usagePercentage) || 0), 0) / school.elearningPlatforms.length)}%` 
                }}
              ></div>
            </div>
            {/* Platform logos for parent view */}
            <div className="mt-1 flex flex-wrap gap-1">
              {school.elearningPlatforms.slice(0, 3).map((platform, index) => (
                <span key={index} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  {platform.platform}
                </span>
              ))}
              {school.elearningPlatforms.length > 3 && (
                <span className="text-xs text-gray-500">+{school.elearningPlatforms.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* International Exposure Display */}
        {(school.exchangePrograms && school.exchangePrograms.length > 0) || (school.globalTieups && school.globalTieups.length > 0) || school.studentsBenefitingPercentage ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span 
                className="text-xs text-gray-600 cursor-help"
                title="International exposure programs and global partnerships"
              >
                🌍 Global Programs
              </span>
              {school.studentsBenefitingPercentage && (
                <span className="text-xs font-medium text-purple-600">
                  {school.studentsBenefitingPercentage}% students
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {school.exchangePrograms && school.exchangePrograms.slice(0, 2).map((program, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                  {program.type}
                </span>
              ))}
              {school.globalTieups && school.globalTieups.slice(0, 2).map((tieup, index) => (
                <span key={index} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  {tieup.nature}
                </span>
              ))}
              {((school.exchangePrograms && school.exchangePrograms.length > 2) || (school.globalTieups && school.globalTieups.length > 2)) && (
                <span className="text-xs text-gray-500">
                  +{((school.exchangePrograms?.length || 0) + (school.globalTieups?.length || 0)) - 2} more
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
      
      <div className={`px-6 pt-4 pb-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3` }>
        <button 
          onClick={(e) => { e.stopPropagation(); onCompareToggle(); }}
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
          onClick={(e) => { e.stopPropagation(); onApply(); }}
          className="w-full flex items-center justify-center font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-300 bg-blue-600 text-white hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default SchoolCard;
