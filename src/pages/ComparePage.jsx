import React from 'react';
import { XCircle } from 'lucide-react';

const ComparePage = ({ comparisonList, onCompareToggle, onNavigate }) => {

  // Agar koi school select nahi hai

  if (comparisonList.length === 0) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Compare Schools</h1>
        <p className="text-gray-600 mb-8">Select the School for Comparison if you want.</p>
        <button 
          onClick={() => onNavigate('schools')}
          className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Explore Schools
        </button>
      </div>
    );
  }

 
  const features = [
    { key: 'board', label: 'Board' },
    { key: 'genderType', label: 'Gender Type' },
    { key: 'schoolMode', label: 'School Mode' },
    { key: 'feeRange', label: 'Fee Range (INR)' },
    { key: 'upto', label: 'Classes Upto' },
    { key: 'transportAvailable', label: 'Transport' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">School Comparison</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left font-semibold text-gray-700 w-1/5">Feature</th>
              {comparisonList.map(school => (
                <th key={school.id} className="p-4 text-left font-semibold text-gray-700 border-l">
                  <div className="flex justify-between items-center">
                    <span>{school.basicInfo.name}</span>
                    <button onClick={() => onCompareToggle(school)} className="text-red-500 hover:text-red-700">
                      <XCircle size={20} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          
          <tbody>
            {features.map(feature => (
              <tr key={feature.key} className="border-t">
                <td className="p-4 font-medium text-gray-600">{feature.label}</td>
                {comparisonList.map(school => (
                  <td key={school.id} className="p-4 border-l text-gray-800">
                    {school.basicInfo[feature.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
