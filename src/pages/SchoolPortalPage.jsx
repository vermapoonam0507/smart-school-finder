import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { School, LogOut, FileText, Eye, Check, X } from "lucide-react";
import RegistrationPage from "./RegistrationPage";
import { fetchStudentApplications } from "../api/apiService";

const SchoolHeader = ({ schoolName, onLogout }) => (
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
          <FileText size={18} className="mr-2" /> My School Profile
        </Link>
        <Link
          to="/school-portal/applications"
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          <Eye size={18} className="mr-2" /> View Student Applications
        </Link>
        <span className="text-gray-500">|</span>
        <span className="text-gray-700">Welcome, {schoolName}!</span>
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

const SchoolPortalPage = ({ currentUser, onLogout, onRegister }) => {
  const navigate = useNavigate();

  if (!currentUser || currentUser.userType !== "school") {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p>Access Denied. Please log in as a school.</p>
      </div>
    );
  }

  return (
    <div>
      <SchoolHeader schoolName={currentUser?.name} onLogout={onLogout} />
      <Routes>
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
          index
          element={<ViewStudentApplications schoolEmail={currentUser?.email} />}
        />
      </Routes>
    </div>
  );
};

export default SchoolPortalPage;
