import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const ComparePage = ({ comparisonList, onCompareToggle }) => {
  if (!comparisonList || comparisonList.length === 0) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Compare Schools</h1>
        <p className="text-gray-600 mb-8">You haven't selected any schools to compare yet.</p>
        <Link 
          to="/schools"
          className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 shadow-lg"
        >
          Explore Schools
        </Link>
      </div>
    );
  }

  // These are the properties we will compare, using the flat structure from the API
  const features = [
    { key: 'board', label: 'Board' },
    { key: 'genderType', label: 'Gender Type' },
    { key: 'schoolMode', label: 'School Mode' },
    { key: 'feeRange', label: 'Fee Range (INR)' },
    { key: 'state', label: 'State' },
    { key: 'city', label: 'City' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">School Comparison</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left font-semibold text-gray-700 w-1/5">Feature</th>
              {comparisonList.map(school => (
                // FIX: Use school._id for the key
                <th key={school._id} className="p-4 text-left font-semibold text-gray-700 border-l">
                  <div className="flex justify-between items-center">
                    {/* FIX: Changed school.basicInfo.name to school.name */}
                    <span>{school.name}</span>
                    <button onClick={() => onCompareToggle(school)} className="text-red-500 hover:text-red-700">
                      <XCircle size={20} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map(feature => (
              <tr key={feature.key} className="border-t">
                <td className="p-4 font-medium text-gray-600">{feature.label}</td>
                {comparisonList.map(school => (
                  // FIX: Use school._id for the key
                  <td key={school._id} className="p-4 border-l text-gray-800">
                    {/* FIX: Changed school.basicInfo[feature.key] to school[feature.key] */}
                    {school[feature.key] || 'N/A'}
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
