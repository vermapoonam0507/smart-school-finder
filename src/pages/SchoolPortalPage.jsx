import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { School, LogOut, FileText, Eye, Star, Check, X } from "lucide-react";
import {
  getSchoolById,
  getPendingSchools,
  checkSchoolProfileExists,
} from "../api/adminService";
import RegistrationPage from "./RegistrationPage";
import SchoolProfileView from "./SchoolProfileView";
import { fetchStudentApplications, updateApplicationStatus } from "../api/apiService";

const SchoolHeader = ({ schoolName, onLogout, applicationsCount, hasProfile }) => (
  <header className="bg-white shadow-md">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-gray-800">
        <School className="inline-block mr-2 text-blue-600" /> School Portal
      </div>
      <div className="flex items-center space-x-6">
        {hasProfile === false && (
          <Link
            to="/school-portal/register"
            className="text-gray-600 hover:text-blue-600 flex items-center"
          >
            <FileText size={18} className="mr-2" /> School Registration
          </Link>
        )}
        <Link
          to="/school-portal/profile-view"
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          <FileText size={18} className="mr-2" /> School Profile
        </Link>
        {/* Approval Status removed per request */}
        <Link
          to="/school-portal/shortlisted"
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          <Star size={18} className="mr-2" /> Shortlisted Applications
        </Link>
        <Link
          to="/school-portal/applications"
          className="text-gray-600 hover:text-blue-600 flex items-center relative"
        >
          <Eye size={18} className="mr-2" /> View Student Applications
          {typeof applicationsCount === 'number' && (
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-semibold rounded-full bg-blue-600 text-white">
              {applicationsCount}
            </span>
          )}
        </Link>
        <span className="text-gray-500">|</span>
        <button
          onClick={onLogout}
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          <LogOut size={16} className="mr-1" /> Logout
        </button>
      </div>
    </nav>
  </header>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  const label = (status || "unknown").toString();
  const cls = map[status] || "bg-gray-100 text-gray-800";
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>{label}</span>;
};

// Approval Status section removed per request


const ViewStudentApplications = ({ schoolId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const getApps = async () => {
      try {
        setLoading(true);
        const response = await fetchStudentApplications(schoolId);
        setApplications(response.data); 
      } catch (error) {
        console.error("❌ Error fetching applications:", error);
        setError(error.message || "Failed to fetch applications");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (schoolId) {
      getApps();
    } else {
      console.warn("⚠️ No schoolId provided to ViewStudentApplications");
      setLoading(false);
    }
  }, [schoolId]);

  const handleStatusChange = async (idOrApp, newStatus) => {
    const isObj = typeof idOrApp === 'object' && idOrApp !== null;
    const targetId = isObj ? (idOrApp.studId || idOrApp.id || idOrApp._raw?.studId || idOrApp._raw?._id) : idOrApp;
    // Optimistic UI update
    setApplications((prevApps) => prevApps.map((app) => (app.id === targetId || app.studId === targetId) ? { ...app, status: newStatus } : app));
    if (!targetId) {
      console.warn('No valid application id to update');
      return;
    }
    try {
      await updateApplicationStatus(targetId, newStatus);
    } catch (e) {
      // Revert on failure by refetching
      try {
        const response = await fetchStudentApplications(schoolId);
        setApplications(response.data);
      } catch (_) {}
      console.error('Failed to update status', e);
    }
  };


  const handleOpenDetails = (app) => {
    const studId = app.studId || app._raw?.studId || app._raw?.studentId || app._raw?.student?._id || app.id;
    if (!studId) {
      console.warn("⚠️ No student ID found for application:", app);
      return;
    }
    console.log("🔗 Opening details for student:", studId);
    window.open(`/api/users/pdf/view/${studId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statusToLower = (s) => (s || '').toString().toLowerCase();

  const rows = applications;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Student Applications
      </h2>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Student Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Class</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Accepted</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Rejected</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Details</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              return applications.map((app) => {
                const statusLower = (app.status || '').toString().toLowerCase();
                const isAccepted = statusLower === 'accepted';
                const isRejected = statusLower === 'rejected';
                return (
              <tr key={app.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4 align-top">{app.studentName}</td>
                <td className="p-4 align-top">{app.class}</td>
                <td className="p-4 align-top">{app.date}</td>
                <td className="p-4 align-top">
                  <button onClick={() => handleOpenDetails(app)} className="text-sm text-blue-600 hover:underline">
                    View Details
                  </button>
                </td>
                <td className="p-4 align-top">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      isAccepted ? 'bg-green-100 text-green-800' : isRejected ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {isAccepted ? 'Accepted' : isRejected ? 'Rejected' : 'Pending'}
                  </span>
                </td>
                <td className="p-4 flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => handleStatusChange(app, "Accepted")}
                    className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleStatusChange(app, "Rejected")}
                    className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
                );
              });
            })()}
          </tbody>
        </table>
        {applications.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No student applications received yet.
          </p>
        )}
        {applications.length > 0 && (() => {
          const total = applications.length;
          const pending = applications.filter(a => (a.status || '').toString().toLowerCase() === 'pending').length;
          const accepted = applications.filter(a => (a.status || '').toString().toLowerCase() === 'accepted').length;
          const rejected = applications.filter(a => (a.status || '').toString().toLowerCase() === 'rejected').length;
          return (
            <div className="px-4 py-3 bg-white flex items-center justify-between text-sm text-gray-700">
              <span>Total Applications: <span className="font-semibold">{total}</span></span>
              <div className="flex items-center gap-6">
                <span>Pending: <span className="font-semibold">{pending}</span></span>
                <span>Accepted: <span className="font-semibold">{accepted}</span></span>
                <span>Rejected: <span className="font-semibold">{rejected}</span></span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
const ViewShortlistedApplications = ({ schoolId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getApps = async () => {
      try {
        setLoading(true);
        const response = await fetchStudentApplications(schoolId);
        const all = response.data || [];
        // Only show explicit 'Shortlisted'
        const shortlisted = all.filter((a) => {
          const st = (a.status || '').toString().toLowerCase();
          return st === 'shortlisted';
        });
        setApplications(shortlisted);
      } catch (error) {
        console.error("Error fetching shortlisted applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    getApps();
  }, [schoolId]);

  if (loading) return <div className="p-8 text-center">Loading shortlisted applications...</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Shortlisted Applications</h2>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Student Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Class</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b last:border-b-0">
                <td className="p-4 text-gray-800">{app.studentName}</td>
                <td className="p-4 text-gray-700">{app.class}</td>
                <td className="p-4 text-gray-700">{app.date}</td>
                <td className="p-4 text-gray-700">
                  <StatusBadge status={(app.status || '').toString().toLowerCase()} />
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">No shortlisted applications yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SchoolPortalPage = ({ currentUser, onLogout, onRegister }) => {
  const navigate = useNavigate();
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [hasProfile, setHasProfile] = useState(null);

  useEffect(() => {
    const loadCount = async () => {
      const idForQuery = currentUser?.schoolId || currentUser?._id;
      if (!idForQuery) return;
      try {
        const res = await fetchStudentApplications(idForQuery);
        const apps = res?.data || [];
        setApplicationsCount(Array.isArray(apps) ? apps.length : 0);
      } catch (_) {
        setApplicationsCount(0);
      }
    };
    loadCount();
  }, [currentUser?.schoolId, currentUser?._id]);

  useEffect(() => {
    // Assume registered for school users by default (hides link), refine after API check
    if (currentUser?.userType === 'school' || currentUser?.schoolId) {
      setHasProfile(true);
    } else {
      setHasProfile(null);
    }
  }, [currentUser?.userType, currentUser?.schoolId]);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        // For school users, never show registration; skip network checks
        if (currentUser?.userType === 'school') {
          setHasProfile(true);
          return;
        }
        if (!currentUser?._id) return setHasProfile(false);
        // If backend has already linked a schoolId to this user, treat as registered
        if (currentUser?.schoolId) {
          setHasProfile(true);
          return;
        }
        let found = null;
        try {
          const byAuth = await checkSchoolProfileExists(currentUser._id);
          // Consider common response shapes as success
          const payload = byAuth?.data;
          found = payload?.data || payload || null;
          if (!found && byAuth?.status === 200) {
            // If server returned 200 without nested data, still treat as exists
            found = { ok: true };
          }
        } catch (_) {}
        if (!found && (currentUser?.schoolId || currentUser?._id)) {
          try {
            const byId = await getSchoolById(currentUser.schoolId || currentUser._id);
            const payload = byId?.data;
            found = payload?.data || payload || null;
            if (!found && byId?.status === 200) {
              found = { ok: true };
            }
          } catch (_) {}
        }
        setHasProfile(!!found);
      } catch (_) {
        setHasProfile(false);
      }
    };
    checkProfile();
  }, [currentUser?._id, currentUser?.schoolId]);

  if (!currentUser || currentUser.userType !== "school") {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p>Access Denied. Please log in as a school.</p>
      </div>
    );
  }

  return (
    <div>
      <SchoolHeader schoolName={currentUser?.name} onLogout={onLogout} applicationsCount={applicationsCount} hasProfile={hasProfile} />
      <Routes>
        <Route
          path="shortlisted"
          element={<ViewShortlistedApplications schoolId={currentUser?.schoolId || currentUser?._id} />}
        />
        {/* Approval Status route removed */}
        <Route
          path="applications"
          element={<ViewStudentApplications schoolId={currentUser?.schoolId || currentUser?._id} />}
        />
        {!hasProfile && (
          <Route
            path="register"
            element={
              <RegistrationPage
                onRegister={onRegister}
                onRegisterSuccess={() => navigate("/school-portal/applications")}
              />
            }
          />
        )}
        {hasProfile && (
          <Route path="register" element={<Navigate to="/school-portal/applications" replace />} />
        )}
        <Route
          path="profile-view"
          element={<SchoolProfileView />}
        />
        
        <Route
          index
          element={<ViewStudentApplications schoolId={currentUser?.schoolId || currentUser?._id} />}
        />
      </Routes>
    </div>
  );
};

export default SchoolPortalPage;
