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
  const [error, setError] = useState('');
  const [schoolNameById, setSchoolNameById] = useState({});

  const handleViewPdf = async () => {
    try {
      // make sure a fresh PDF exists
      await generateStudentPdf(currentUser._id);
    } catch (_) {}
    const base = import.meta.env.VITE_API_BASE_URL || 'https://backend-tc-sa-v2.onrender.com';
    const url = `${base}/api/users/pdf/view/${currentUser._id}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    const run = async () => {
      if (!currentUser?._id) return;
      try {
        setIsLoading(true);
        const res = await getFormsByStudent(currentUser._id);
        const data = res?.data || [];
        setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || 'Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [currentUser]);

  // Resolve school names for any ids returned in forms
  useEffect(() => {
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
          map[id] = res.status === 'fulfilled'
            ? (res.value?.data?.data?.name || res.value?.data?.name || 'School')
            : 'School';
        });
        setSchoolNameById(prev => ({ ...prev, ...map }));
      } catch (_) {}
    };
    if (forms?.length) fetchNames();
  }, [forms, schoolNameById]);

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
        ) : forms.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">No applications yet.</div>
        ) : (
          <div className="space-y-4">
            {forms.map((f) => {
              const submitted = f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '-';
              const schoolRef = f.schoolId || f.school;
              const idStr = typeof schoolRef === 'object' ? (schoolRef?._id || schoolRef?.id) : schoolRef;
              const schoolName = f.schoolName
                || (typeof schoolRef === 'object' ? (schoolRef?.name || schoolRef?.schoolName) : undefined)
                || (idStr ? (schoolNameById[idStr] || (typeof localStorage !== 'undefined' ? localStorage.getItem(`schoolName:${idStr}`) : undefined)) : undefined)
                || '-';
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
                      <button onClick={() => navigate(`/school/${idStr}`)} className="px-2 py-1 text-sm rounded bg-gray-900 text-white hover:bg-gray-800">Open</button>
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


