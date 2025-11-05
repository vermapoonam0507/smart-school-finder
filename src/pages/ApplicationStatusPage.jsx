import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFormsByStudent, generateStudentPdf } from '../api/userService';
import { getSchoolById } from '../api/adminService';

const ApplicationStatusPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [displayForms, setDisplayForms] = useState([]);
  const [error, setError] = useState('');
  const [schoolNameById, setSchoolNameById] = useState({});
  const [cachedAppliedSchools, setCachedAppliedSchools] = useState([]);

  const handleViewPdf = async () => {
    try {
      // make sure a fresh PDF exists
      await generateStudentPdf(currentUser._id);
    } catch (_) {}
    // Use relative path so dev proxy/axios base routes to the correct backend
    window.open(`/api/users/pdf/view/${currentUser._id}`, '_blank');
  };

  useEffect(() => {
    const run = async () => {
      if (!currentUser?._id) return;
      try {
        setIsLoading(true);
        // Use student profile ID if available, otherwise auth ID
        const studentId = currentUser.studentId || currentUser._id;
        console.log('🔍 Fetching applications for student ID:', studentId, 'from user:', currentUser);
        const res = await getFormsByStudent(studentId);
        const data = res?.data || [];
        console.log('📊 Applications data received:', data);
        setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Error fetching applications:', err);
        setError(err?.message || 'Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [currentUser]);

  // Resolve school names for any ids returned in forms
  useEffect(() => {
    // Load any locally cached school info saved during apply flow
    try {
      const userId = currentUser?._id;
      if (typeof localStorage !== 'undefined' && userId) {
        const cached = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(`schoolInfo:${userId}:`)) {
            const raw = localStorage.getItem(k);
            try {
              const parsed = JSON.parse(raw || '{}');
              if (parsed && (parsed.schoolId || parsed.schoolName)) {
                cached.push(parsed);
              }
            } catch (_) {}
          }
        }
        setCachedAppliedSchools(cached);
      }
    } catch (_) {}

    const fetchNames = async () => {
      const ids = forms
        .map(f => {
          const ref = f.schoolId || f.school;
          return typeof ref === 'object' ? (ref?._id || ref?.id) : ref;
        })
        .filter(Boolean);
      const unique = Array.from(new Set(ids)).filter(id => !schoolNameById[id]);
      if (!unique.length) return;
      try {
        const results = await Promise.allSettled(unique.map(id => getSchoolById(id)));
        const map = {};
        results.forEach((res, i) => {
          const id = unique[i];
          if (res.status === 'fulfilled') {
            const schoolData = res.value?.data?.data || res.value?.data;
            map[id] = schoolData?.name || schoolData?.schoolName || `School ID: ${id.slice(-8)}...`;
          } else {
            console.warn(`Failed to fetch school name for ID: ${id}`, res.reason);
            map[id] = `School ID: ${id.slice(-8)}...`;
          }
        });
        setSchoolNameById(prev => ({ ...prev, ...map }));
      } catch (error) {
        console.error('Error fetching school names:', error);
        // Set fallback names for all IDs
        const map = {};
        unique.forEach(id => {
          map[id] = `School ID: ${id.slice(-8)}...`;
        });
        setSchoolNameById(prev => ({ ...prev, ...map }));
      }
    };
    if (forms?.length) fetchNames();
  }, [forms, schoolNameById, currentUser]);

  // Merge API forms with locally cached applications to ensure all applied schools appear
  useEffect(() => {
    try {
      const userId = currentUser?._id;
      const cached = [];
      if (typeof localStorage !== 'undefined' && userId) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(`schoolInfo:${userId}:`)) {
            const raw = localStorage.getItem(k);
            try {
              const parsed = JSON.parse(raw || '{}');
              if (parsed && (parsed.schoolId || parsed.schoolName)) {
                cached.push(parsed);
              }
            } catch (_) {}
          }
        }
      }

      const synthesizedFromCache = cached.map((c) => ({
        _synthetic: true,
        schoolName: c.schoolName,
        schoolId: c.schoolId,
        status: 'Submitted',
        createdAt: c.createdAt || null,
      }));

      // Dedupe by strong id or schoolId+createdAt+schoolName
      const map = new Map();
      [...forms, ...synthesizedFromCache].forEach((item, idx) => {
        const strong = item?._id || item?.id;
        const sId = typeof item?.schoolId === 'object' ? (item?.schoolId?._id || item?.schoolId?.id) : item?.schoolId;
        const sName = item?.schoolName || item?.school?.name || '';
        const when = item?.createdAt || item?.updatedAt || '';
        const key = strong || `${sId || 'noid'}-${when || 'notime'}-${sName || 'noname'}-${idx}`;
        map.set(String(key), item);
      });
      setDisplayForms(Array.from(map.values()));
    } catch (e) {
      setDisplayForms(forms);
    }
  }, [forms, currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate('/login')} className="px-4 py-2 rounded bg-blue-600 text-white">Sign in</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Applied Forms</h1>
          <p className="text-gray-600 text-sm mt-1">All schools you have applied to and their current status.</p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">Loading...</div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-4">{error}</div>
        ) : displayForms.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">No applications yet.</div>
        ) : (
          <div className="space-y-4">
            {displayForms.map((f) => {
              const submitted = f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '-';

              // Comprehensive debug logging to see full application structure
              console.log('Full application data:', f);
              console.log('Application keys:', Object.keys(f));
              console.log('Application values:', Object.values(f));

              const schoolRef = f.schoolId || f.school;
              const idStr = typeof schoolRef === 'object' ? (schoolRef?._id || schoolRef?.id) : schoolRef;

              // Enhanced school name resolution - includes local cache fallbacks when ids are missing
              let schoolName = 'Loading...';

              if (f.schoolName) {
                schoolName = f.schoolName;
              } else if (idStr && typeof localStorage !== 'undefined' && localStorage.getItem(`schoolName:${idStr}`)) {
                schoolName = localStorage.getItem(`schoolName:${idStr}`);
              } else if (typeof schoolRef === 'object' && (schoolRef?.name || schoolRef?.schoolName)) {
                schoolName = schoolRef.name || schoolRef.schoolName;
              } else if (idStr && schoolNameById[idStr] && schoolNameById[idStr] !== 'School') {
                schoolName = schoolNameById[idStr];
              } else if (f.school && typeof f.school === 'object' && f.school.name) {
                schoolName = f.school.name;
              } else if (idStr && schoolNameById[idStr]) {
                schoolName = schoolNameById[idStr];
              } else {
                // No IDs present → try last applied and cached mappings
                let fallbackName = null;
                try {
                  if (typeof localStorage !== 'undefined') {
                    const lastId = localStorage.getItem('lastAppliedSchoolId');
                    if (lastId) {
                      const n = localStorage.getItem(`schoolName:${lastId}`);
                      if (n) fallbackName = n;
                    }
                    if (!fallbackName && cachedAppliedSchools?.length) {
                      fallbackName = cachedAppliedSchools[0]?.schoolName || null;
                    }
                  }
                } catch (_) {}
                schoolName = fallbackName || 'Unknown School';
              }

              // Debug logging for school name resolution
              console.log('School name resolution for application:', f._id, {
                fSchoolName: f.schoolName,
                schoolRef: schoolRef,
                idStr: idStr,
                schoolNameById: schoolNameById[idStr],
                localStorageName: typeof localStorage !== 'undefined' ? localStorage.getItem(`schoolName:${idStr}`) : undefined,
                fSchool: f.school,
                finalSchoolName: schoolName
              });
              const rawStatus = (f.status || f.applicationStatus || f.formStatus || f.decision || 'pending');
              const status = String(rawStatus).toLowerCase().includes('submit') ? 'submitted' : (String(rawStatus).toLowerCase());

              return (
                <div key={f._id || f.id} className="bg-white rounded-xl shadow border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{schoolName}</div>
                      <div className="text-xs text-gray-500 mt-1">Status: <span className={status.includes('accept') ? 'text-green-700' : status.includes('reject') ? 'text-red-600' : 'text-amber-600'}>{status}</span></div>
                      <div className="text-xs text-gray-400 mt-1">Submitted: {submitted}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <button onClick={handleViewPdf} className="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50">View PDF</button>
                      <button onClick={() => navigate('/my-applications')} className="px-2 py-1 text-sm rounded bg-gray-900 text-white hover:bg-gray-800">Open</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatusPage;


