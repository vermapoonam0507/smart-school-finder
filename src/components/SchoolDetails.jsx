import React, { useState, useEffect } from 'react';
import { getSafetyAndSecurityById, getFeesAndScholarshipsById, getTechnologyAdoptionById } from '../api/adminService';

const SchoolDetails = ({ schoolId }) => {
  const [safetyData, setSafetyData] = useState(null);
  const [feesData, setFeesData] = useState(null);
  const [techData, setTechData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [safetyRes, feesRes, techRes] = await Promise.allSettled([
          getSafetyAndSecurityById(schoolId),
          getFeesAndScholarshipsById(schoolId),
          getTechnologyAdoptionById(schoolId)
        ]);

        if (safetyRes.status === 'fulfilled') {
          setSafetyData(safetyRes.value.data);
        }
        if (feesRes.status === 'fulfilled') {
          setFeesData(feesRes.value.data);
        }
        if (techRes.status === 'fulfilled') {
          setTechData(techRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching school details:', err);
        setError('Failed to load school details');
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) {
      fetchData();
    }
  }, [schoolId]);

  if (loading) {
    return <div>Loading school details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Safety & Security Section */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">🛡️ Safety & Security</h3>
        {safetyData ? (
          <div>
            <p>CCTV Coverage: {safetyData.cctvCoverage}%</p>
            <p>Medical Facility: {safetyData.medicalFacility?.doctorAvailability || 'Not specified'}</p>
            {/* Add more safety data display */}
          </div>
        ) : (
          <p className="text-gray-500">No safety & security information available.</p>
        )}
      </section>

      {/* Fees Section */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">💰 Fees & Affordability</h3>
        {feesData ? (
          <div>
            <p>Fee Transparency: {feesData.feesTransparency}</p>
            {feesData.classWiseFees?.length > 0 && (
              <div className="mt-2">
                <h4 className="font-medium">Class-wise Fees:</h4>
                {/* Add fees table/list */}
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No fees information available.</p>
        )}
      </section>

      {/* Technology Section */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">💻 Technology Adoption</h3>
        {techData ? (
          <div>
            <p>Smart Classrooms: {techData.smartClassroomsPercentage}%</p>
            {/* Add more tech data display */}
          </div>
        ) : (
          <p className="text-gray-500">No technology adoption information available.</p>
        )}
      </section>
    </div>
  );
};

export default SchoolDetails;
