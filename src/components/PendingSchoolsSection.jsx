import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, MapPin, Phone, Mail, Calendar, User, XCircle, Building, BookOpen, Users, Award, Sun, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { getSchoolsByStatus, updateSchoolStatus } from '../api/adminService';
import { Link } from 'react-router-dom';

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
      
      // Debug: Log the complete response structure
      console.log('🔍 Full API Response:', response);
      console.log('🔍 Raw data:', raw);
      console.log('🔍 Normalized schools:', normalized);
      
      if (normalized.length > 0) {
        console.log('🔍 First school object:', normalized[0]);
        console.log('🔍 Available ID fields:', {
          _id: normalized[0]._id,
          schoolId: normalized[0].schoolId,
          id: normalized[0].id,
          allKeys: Object.keys(normalized[0])
        });
      }
      
      // Deduplicate schools by authId - keep only the most recent one per authId
      const deduplicatedSchools = [];
      const seenSchools = new Map(); // Track by authId or _id
      
      // Sort by createdAt (most recent first) to keep the latest entry
      const sortedSchools = [...normalized].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Most recent first
      });
      
      for (const school of sortedSchools) {
        // Use authId as primary identifier, fallback to email (for legacy schools), then _id
        const identifier = school.authId || (school.email ? `email:${school.email.toLowerCase()}` : school._id);
        
        if (!identifier) {
          // If no identifier at all, include it (shouldn't happen but safe)
          deduplicatedSchools.push(school);
          console.warn('⚠️ School without authId, email, or _id:', school.name);
          continue;
        }
        
        // If we haven't seen this identifier yet, add it
        if (!seenSchools.has(identifier)) {
          seenSchools.set(identifier, school);
          deduplicatedSchools.push(school);
        } else {
          console.log('🗑️ Removing duplicate school:', {
            name: school.name,
            _id: school._id,
            authId: school.authId,
            email: school.email,
            createdAt: school.createdAt,
            identifier: identifier,
            kept: seenSchools.get(identifier).name
          });
        }
      }
      
      console.log(`📊 Deduplication: ${normalized.length} schools → ${deduplicatedSchools.length} unique schools`);
      console.log(`📊 Unique identifiers found: ${seenSchools.size}`);
      
      setPendingSchools(deduplicatedSchools);
    } catch (error) {
      console.error('Failed to load pending schools:', error);
      toast.error('Failed to load pending schools');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSchool = async (schoolId) => {
    console.log('🔍 handleAcceptSchool called with schoolId:', schoolId);
    console.log('🔍 schoolId type:', typeof schoolId);
    console.log('🔍 schoolId value:', schoolId);
    
    if (!schoolId) {
      console.error('School ID is missing');
      toast.error('School ID is missing');
      return;
    }
    try {
      setAcceptingId(schoolId);
      await updateSchoolStatus(schoolId, 'accepted');

      // Refresh pending list from server to reflect accurate state
      await loadPendingSchools();
    } catch (error) {
      console.error('Failed to accept school:', error);
      toast.error('Failed to accept school');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectSchool = async (schoolId) => {
    console.log('🔍 handleRejectSchool called with schoolId:', schoolId);
    console.log('🔍 schoolId type:', typeof schoolId);
    console.log('🔍 schoolId value:', schoolId);
    
    if (!schoolId) {
      console.error('School ID is missing');
      toast.error('School ID is missing');
      return;
    }
    try {
      setRejectingId(schoolId);
      await updateSchoolStatus(schoolId, 'rejected');
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
        {pendingSchools.map((school, index) => {
          // Extract school ID from any possible field
          const schoolId = school._id || school.schoolId || school.id || school.userId || school.authId;
          console.log(`🔍 School ${index} ID extraction:`, {
            _id: school._id,
            schoolId: school.schoolId,
            id: school.id,
            userId: school.userId,
            authId: school.authId,
            extractedId: schoolId,
            allKeys: Object.keys(school)
          });
          
          return (
        <div key={schoolId || index} className="p-6 border-b border-gray-200 last:border-b-0">
          {/* School Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <h4 className="text-xl font-bold text-gray-900">{school.name}</h4>
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="h-4 w-4 mr-1" />
                  Pending Approval
                </span>
              </div>
            </div>
          </div>

          {/* Essential School Information Only */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Location */}
            {school.address && (
              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500 block">Location</span>
                  <span className="text-gray-900 font-medium">{school.address}</span>
                </div>
              </div>
            )}
            
            {/* Board */}
            {school.board && (
              <div className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <span className="text-gray-500 block">Board</span>
                  <span className="text-gray-900 font-medium">{school.board}</span>
                </div>
              </div>
            )}
            
            {/* Gender */}
            {school.genderType && (
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <span className="text-gray-500 block">Gender</span>
                  <span className="text-gray-900 font-medium">{school.genderType}</span>
                </div>
              </div>
            )}
            
            {/* Shifts */}
            {school.shifts && (
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <span className="text-gray-500 block">Shifts</span>
                  <span className="text-gray-900 font-medium">{school.shifts}</span>
                </div>
              </div>
            )}
            
            {/* School Type */}
            {school.schoolType && (
              <div className="flex items-center text-sm">
                <Building className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <span className="text-gray-500 block">Type</span>
                  <span className="text-gray-900 font-medium">{school.schoolType}</span>
                </div>
              </div>
            )}
          </div>

            {/* Admin Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleAcceptSchool(schoolId)}
                disabled={acceptingId === schoolId}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {acceptingId === schoolId ? (
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
                onClick={() => handleRejectSchool(schoolId)}
                disabled={rejectingId === schoolId}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {rejectingId === schoolId ? (
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
              onClick={() => {
                console.log('🔍 View Details clicked for schoolId:', schoolId);
                console.log('🔍 Full school object:', school);
                if (!schoolId) {
                  toast.error('School ID is missing - cannot view details');
                  return;
                }
                // Navigate to admin school details page
                window.open(`/admin/school/${schoolId}`, '_blank');
              }}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Complete Details
            </button>
            </div>
          </div>
          );
        })}
      </div>
      
    </div>
  );
};

export default PendingSchoolsSection;
