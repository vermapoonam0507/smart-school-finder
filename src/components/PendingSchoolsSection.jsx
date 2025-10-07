import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, MapPin, Phone, Mail, Calendar, User, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getSchoolsByStatus, updateSchoolStatus } from '../api/adminService';

const PendingSchoolsSection = () => {
  const [pendingSchools, setPendingSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    loadPendingSchools();
  }, []);

  const loadPendingSchools = async () => {
    try {
      setIsLoading(true);
      const response = await getSchoolsByStatus('pending');
      const raw = response?.data;
      const normalized = Array.isArray(raw?.data)
        ? raw.data
        : (Array.isArray(raw)
            ? raw
            : (Array.isArray(raw?.schools) ? raw.schools : []));
      setPendingSchools(normalized);
    } catch (error) {
      console.error('Failed to load pending schools:', error);
      toast.error('Failed to load pending schools');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSchool = async (schoolId) => {
    try {
      setAcceptingId(schoolId);
      await updateSchoolStatus(schoolId, { status: 'accepted' });

      // Refresh pending list from server to reflect accurate state
      await loadPendingSchools();
      toast.success('School accepted successfully!');
    } catch (error) {
      console.error('Failed to accept school:', error);
      toast.error('Failed to accept school');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectSchool = async (schoolId) => {
    try {
      setRejectingId(schoolId);
      await updateSchoolStatus(schoolId, { status: 'rejected' });
      await loadPendingSchools();
      toast.success('School rejected successfully!');
    } catch (error) {
      console.error('Failed to reject school:', error);
      toast.error('Failed to reject school');
    } finally {
      setRejectingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading pending schools...</span>
        </div>
      </div>
    );
  }

  if (pendingSchools.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Schools</h3>
          <p className="text-gray-500">All schools have been reviewed and processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            Pending Schools ({pendingSchools.length})
          </h3>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {pendingSchools.map((school) => (
          <div key={school._id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{school.name}</h4>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    {school.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{school.address}</span>
                      </div>
                    )}
                    {school.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{school.phone}</span>
                      </div>
                    )}
                    {school.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{school.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {school.principalName && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Principal: {school.principalName}</span>
                      </div>
                    )}
                    {school.establishedYear && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Est. {school.establishedYear}</span>
                      </div>
                    )}
                  </div>
                </div>

                {school.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{school.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {school.board && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {school.board}
                    </span>
                  )}
                  {school.schoolType && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {school.schoolType}
                    </span>
                  )}
                  {school.curriculum && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {school.curriculum}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="ml-6 flex flex-col space-y-2">
                <button
                  onClick={() => handleAcceptSchool(school._id)}
                  disabled={acceptingId === school._id}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {acceptingId === school._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept School
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleRejectSchool(school._id)}
                  disabled={rejectingId === school._id}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejectingId === school._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject School
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => window.open(`/school/${school._id}`, '_blank')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingSchoolsSection;
