import React, { useState } from 'react';
import { getSchoolsByStatus } from '../api/adminService';
import { Bug, RefreshCw } from 'lucide-react';

/**
 * Debug component to help identify duplicate schools
 * Add this to AdminDashboardPage temporarily to diagnose the issue
 */
const SchoolDebugger = () => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeSchools = async () => {
    setLoading(true);
    try {
      const response = await getSchoolsByStatus('pending');
      const schools = response?.data?.data || response?.data || [];
      
      // Group by authId
      const byAuthId = {};
      const byId = {};
      const duplicates = [];
      
      schools.forEach(school => {
        // Track by authId
        if (school.authId) {
          if (!byAuthId[school.authId]) {
            byAuthId[school.authId] = [];
          }
          byAuthId[school.authId].push(school);
        }
        
        // Track by _id
        if (school._id) {
          if (byId[school._id]) {
            duplicates.push({ type: '_id', value: school._id, school });
          }
          byId[school._id] = school;
        }
      });
      
      // Find authIds with multiple schools
      const authIdDuplicates = Object.entries(byAuthId)
        .filter(([authId, schools]) => schools.length > 1)
        .map(([authId, schools]) => ({
          authId,
          count: schools.length,
          schools: schools.map(s => ({
            _id: s._id,
            name: s.name,
            email: s.email,
            createdAt: s.createdAt,
            status: s.status
          }))
        }));
      
      setDebugData({
        total: schools.length,
        uniqueAuthIds: Object.keys(byAuthId).length,
        uniqueIds: Object.keys(byId).length,
        schoolsWithoutAuthId: schools.filter(s => !s.authId).length,
        authIdDuplicates,
        idDuplicates: duplicates,
        sampleSchools: schools.slice(0, 3).map(s => ({
          _id: s._id,
          name: s.name,
          authId: s.authId,
          email: s.email,
          createdAt: s.createdAt,
          status: s.status
        }))
      });
    } catch (error) {
      console.error('Debug analysis failed:', error);
      setDebugData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bug className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-yellow-900">
            School Duplicate Debugger
          </h3>
        </div>
        <button
          onClick={analyzeSchools}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Analyze Schools'}
        </button>
      </div>

      {debugData && (
        <div className="mt-4 space-y-4">
          {debugData.error ? (
            <div className="text-red-600">Error: {debugData.error}</div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Total Schools</div>
                  <div className="text-2xl font-bold">{debugData.total}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Unique AuthIDs</div>
                  <div className="text-2xl font-bold">{debugData.uniqueAuthIds}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Unique IDs</div>
                  <div className="text-2xl font-bold">{debugData.uniqueIds}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-500">Without AuthID</div>
                  <div className="text-2xl font-bold">{debugData.schoolsWithoutAuthId}</div>
                </div>
              </div>

              {/* Duplicates by AuthID */}
              {debugData.authIdDuplicates.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h4 className="font-semibold text-red-900 mb-2">
                    ⚠️ Found {debugData.authIdDuplicates.length} AuthIDs with Multiple Schools
                  </h4>
                  {debugData.authIdDuplicates.map((dup, idx) => (
                    <div key={idx} className="mb-3 p-3 bg-white rounded border">
                      <div className="font-mono text-sm text-gray-600 mb-2">
                        AuthID: {dup.authId}
                      </div>
                      <div className="text-sm font-semibold mb-1">
                        {dup.count} schools found:
                      </div>
                      <ul className="space-y-1">
                        {dup.schools.map((school, sidx) => (
                          <li key={sidx} className="text-sm pl-4 border-l-2 border-gray-300">
                            <div><strong>{school.name}</strong></div>
                            <div className="text-gray-600">ID: {school._id}</div>
                            <div className="text-gray-600">Email: {school.email}</div>
                            <div className="text-gray-600">
                              Created: {new Date(school.createdAt).toLocaleString()}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Sample Schools */}
              <div className="bg-white border rounded p-4">
                <h4 className="font-semibold mb-2">Sample Schools (first 3)</h4>
                <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">
                  {JSON.stringify(debugData.sampleSchools, null, 2)}
                </pre>
              </div>

              {/* Recommendation */}
              {debugData.total > debugData.uniqueAuthIds && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Recommendation</h4>
                  <p className="text-sm text-blue-800">
                    You have {debugData.total} total schools but only {debugData.uniqueAuthIds} unique authIDs.
                    This means there are duplicate school entries. The deduplication logic should be removing
                    these duplicates from the display.
                  </p>
                  <p className="text-sm text-blue-800 mt-2">
                    Check the browser console for logs showing which duplicates are being removed.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SchoolDebugger;
