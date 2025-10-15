import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicSchoolsByStatus } from '../api/schoolService';

const CompareSelectPage = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getPublicSchoolsByStatus('accepted');
        const raw = res?.data;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        setSchools(list);
      } catch (_) {
        setSchools([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addToCompare = (school) => {
    try {
      const saved = JSON.parse(localStorage.getItem('comparisonList') || '[]');
      const id = school._id || school.schoolId;
      const exists = saved.some((s) => (s.schoolId || s._id) === id);
      const normalized = { ...school, schoolId: id };
      const next = exists ? saved : [...saved, normalized];
      localStorage.setItem('comparisonList', JSON.stringify(next));
      // dispatch an event so Header can update the compare count immediately
      window.dispatchEvent(new CustomEvent('comparisonListUpdated', { detail: next }));
      navigate('/compare');
    } catch (_) {
      try {
        const saved = JSON.parse(localStorage.getItem('comparisonList') || '[]');
        window.dispatchEvent(new CustomEvent('comparisonListUpdated', { detail: saved }));
      } catch (_) {}
      navigate('/compare');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-6 py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Compare school</h1>
      <p className="text-gray-600 mb-6">Select a school to compare with your current selection.</p>
      <div className="bg-white rounded-lg shadow divide-y">
        {schools.map((s) => (
          <div key={s._id || s.schoolId} className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{s.name || s.schoolName}</div>
              <div className="text-sm text-gray-600 truncate">{[s.city, s.state, s.board, s.feeRange].filter(Boolean).join(' • ')}</div>
            </div>
            <button
              onClick={() => addToCompare(s)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Compare
            </button>
          </div>
        ))}
        {(!schools || schools.length === 0) && (
          <div className="p-8 text-center text-gray-500">No schools to show.</div>
        )}
      </div>
    </div>
  );
};

export default CompareSelectPage;


