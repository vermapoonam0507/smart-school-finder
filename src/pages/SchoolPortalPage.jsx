import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { School, LogOut, FileText, Eye, Check, X, Clock, Star } from "lucide-react";
import {
  getSchoolById,
  getPendingSchools,
  checkSchoolProfileExists,
} from "../api/adminService";
import RegistrationPage from "./RegistrationPage";
import SchoolProfileView from "./SchoolProfileView";
import { fetchStudentApplications } from "../api/apiService";

const SchoolHeader = ({ schoolName, onLogout, applicationsCount }) => (
  <header className="bg-white shadow-md">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-gray-800">
        <School className="inline-block mr-2 text-blue-600" /> School Portal
      </div>
      <div className="flex items-center space-x-6">
        <Link
          to="/school-portal/register"
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          <FileText size={18} className="mr-2" /> School Registration
        </Link>
        <Link
          to="/school-portal/profile-view"
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          <FileText size={18} className="mr-2" /> School Profile
        </Link>
        <Link
          to="/school-portal/status"
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          <Clock size={18} className="mr-2" /> Approval Status
        </Link>
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

const ApprovalStatus = ({ currentUser }) => {
  const [ownSchool, setOwnSchool] = useState(null);
  const [pendingSchools, setPendingSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (currentUser?._id) {
          let found = null;
          try {
            const byAuth = await checkSchoolProfileExists(currentUser._id);
            found = byAuth?.data?.data || byAuth?.data || null;
          } catch (_) {}
          if (!found && (currentUser?.schoolId || currentUser?._id)) {
            try {
              const byId = await getSchoolById(currentUser.schoolId || currentUser._id);
              found = byId?.data?.data || byId?.data || null;
            } catch (_) {}
          }
          setOwnSchool(found);
        }
        try {
          const pend = await getPendingSchools();
          setPendingSchools(pend.data?.data || []);
        } catch (_) {
          setPendingSchools([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?._id, currentUser?.schoolId]);

  if (loading) {
    return <div className="p-8 text-center">Loading status...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your School Approval</h2>
        {ownSchool ? (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-semibold text-gray-900">{ownSchool.name || currentUser?.name}</span>
              <StatusBadge status={ownSchool.status} />
            </div>
            <p className="text-gray-600">Email: {ownSchool.email || currentUser?.email}</p>
            {ownSchool.reason && ownSchool.status === 'rejected' && (
              <p className="text-red-600 mt-2">Reason: {ownSchool.reason}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-700">No school profile found yet. Please complete "My School Profile" to submit for approval.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Schools Awaiting Approval</h3>
        {pendingSchools.length === 0 ? (
          <p className="text-gray-600">No schools are currently pending approval.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">City</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Board</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingSchools.map((s) => (
                  <tr key={s._id} className="border-b last:border-b-0">
                    <td className="p-3 text-gray-800">{s.name}</td>
                    <td className="p-3 text-gray-700">{s.city}</td>
                    <td className="p-3 text-gray-700">{s.board}</td>
                    <td className="p-3"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


const ViewStudentApplications = ({ schoolEmail }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getApps = async () => {
      try {
        setLoading(true);
        const response = await fetchStudentApplications(schoolEmail);
        setApplications(response.data); 
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    getApps();
  }, [schoolEmail]);

  const handleStatusChange = (id, newStatus) => {
    setApplications((prevApps) =>
      prevApps.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
  };

  if (loading)
    return <div className="p-8 text-center">Loading applications...</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Student Applications
      </h2>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Student Name
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Class
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Date
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-t">
                <td className="p-4">{app.studentName}</td>
                <td className="p-4">{app.class}</td>
                <td className="p-4">{app.date}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      app.status === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : app.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="p-4 flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(app.id, "Accepted")}
                    className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleStatusChange(app.id, "Rejected")}
                    className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200"
                  >
                    <X size={16} />
                  </button>
                  <button className="text-sm text-blue-600 hover:underline">
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No student applications received yet.
          </p>
        )}
      </div>
    </div>
  );
};

const ViewShortlistedApplications = ({ schoolEmail }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getApps = async () => {
      try {
        setLoading(true);
        const response = await fetchStudentApplications(schoolEmail);
        const all = response.data || [];
        // Consider both 'Accepted' and 'Shortlisted' as shortlisted
        const shortlisted = all.filter(
          (a) => typeof a.status === 'string' && ["Accepted", "Shortlisted", "accepted", "shortlisted"].includes(a.status)
        );
        setApplications(shortlisted);
      } catch (error) {
        console.error("Error fetching shortlisted applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    getApps();
  }, [schoolEmail]);

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

  useEffect(() => {
    const loadCount = async () => {
      if (!currentUser?.email) return;
      try {
        const res = await fetchStudentApplications(currentUser.email);
        const apps = res?.data || [];
        setApplicationsCount(Array.isArray(apps) ? apps.length : 0);
      } catch (_) {
        setApplicationsCount(0);
      }
    };
    loadCount();
  }, [currentUser?.email]);

  if (!currentUser || currentUser.userType !== "school") {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p>Access Denied. Please log in as a school.</p>
      </div>
    );
  }

  return (
    <div>
      <SchoolHeader schoolName={currentUser?.name} onLogout={onLogout} applicationsCount={applicationsCount} />
      <Routes>
        <Route
          path="shortlisted"
          element={<ViewShortlistedApplications schoolEmail={currentUser?.email} />}
        />
        <Route
          path="status"
          element={<ApprovalStatus currentUser={currentUser} />}
        />
        <Route
          path="applications"
          element={<ViewStudentApplications schoolEmail={currentUser?.email} />}
        />
        <Route
          path="register"
          element={
            <RegistrationPage
              onRegister={onRegister}
              onRegisterSuccess={() => navigate("/school-portal/applications")}
            />
          }
        />
        <Route
          path="profile-view"
          element={<SchoolProfileView />}
        />
        
        <Route
          index
          element={<ViewStudentApplications schoolEmail={currentUser?.email} />}
        />
      </Routes>
    </div>
  );
};

export default SchoolPortalPage;
