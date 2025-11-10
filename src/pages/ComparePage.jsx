import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const ComparePage = ({ comparisonList, onCompareToggle, shortlist, onShortlistToggle }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
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

  const features = [
    { key: 'board', label: 'Board' },
    { key: 'genderType', label: 'Gender Type' },
    { key: 'schoolMode', label: 'School Mode' },
    { key: 'feeRange', label: 'Fee Range (INR)' },
    { key: 'state', label: 'State' },
    { key: 'city', label: 'City' },
  ];

  const handleCompleteComparison = async () => {
    setIsProcessing(true);
    try {
      // Remove all compared schools from shortlist sequentially
      let removedCount = 0;
      for (const school of comparisonList) {
        // Check if the school is in shortlist before removing
        const isInShortlist = shortlist?.some(
          (item) => (item.schoolId || item._id) === (school.schoolId || school._id)
        );
        if (isInShortlist) {
          // Wait for each removal to complete before proceeding to the next
          await onShortlistToggle(school);
          removedCount++;
          // Add a small delay to ensure state updates properly
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Clear the comparison list
      comparisonList.forEach((school) => {
        onCompareToggle(school);
      });

      // Add a small delay before showing success and navigating for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (removedCount > 0) {
        toast.success(`Comparison completed! ${removedCount} school${removedCount > 1 ? 's' : ''} removed from shortlist.`);
      } else {
        toast.success('Comparison completed!');
      }
      
      // Delay navigation slightly so user can see the success message
      setTimeout(() => {
        navigate('/schools');
      }, 1500);
    } catch (error) {
      toast.error('Error completing comparison. Please try again.');
      console.error('Error in handleCompleteComparison:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">School Comparison</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left font-semibold text-gray-700 w-1/5">Feature</th>
              {comparisonList.map(school => (

                <th key={school.schoolId} className="p-4 text-left font-semibold text-gray-700 border-l">
                  <div className="flex justify-between items-center">
                   
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
                  
                  <td key={school.schoolId} className="p-4 border-l text-gray-800">
                    
                    {school[feature.key] || 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Complete Comparison Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleCompleteComparison}
          disabled={isProcessing}
          className={`font-semibold px-8 py-3 rounded-lg shadow-lg flex items-center justify-center mx-auto gap-2 ${
            isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Complete Comparison
            </>
          )}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          {isProcessing 
            ? 'Removing schools from shortlist...' 
            : 'This will remove compared schools from your shortlist'}
        </p>
      </div>
    </div>
  );
};

export default ComparePage;
