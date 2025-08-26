import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSchoolsByStatus, updateSchoolStatus } from '../api/adminService';
import { toast } from 'react-toastify';
import { Check, X, Clock, ThumbsUp, Trash2 } from 'lucide-react';
import SchoolCard from '../components/SchoolCard';

// This is the new component for the Admin View
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                setLoading(true);
                const response = await getSchoolsByStatus(activeTab);
                setSchools(response.data.data);
            } catch (error) {
                console.error(`Error fetching ${activeTab} schools:`, error);
                toast.error(`Could not load ${activeTab} schools.`);
                setSchools([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSchools();
    }, [activeTab]); // Refetch schools whenever the active tab changes

    const handleStatusUpdate = async (schoolId, newStatus) => {
        try {
            await updateSchoolStatus(schoolId, { status: newStatus });
            toast.success(`School has been ${newStatus}.`);
            // Remove the school from the current list to update the UI instantly
            setSchools(prevSchools => prevSchools.filter(school => school._id !== schoolId));
        } catch (error) {
            console.error("Error updating school status:", error);
            toast.error("Failed to update school status.");
        }
    };

    const TabButton = ({ status, label, icon }) => (
        <button
            onClick={() => setActiveTab(status)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === status
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Manage School Registrations</h2>
            <div className="flex space-x-4 border-b mb-6">
                <TabButton status="pending" label="Pending" icon={<Clock size={16} />} />
                <TabButton status="accepted" label="Accepted" icon={<ThumbsUp size={16} />} />
                <TabButton status="rejected" label="Rejected" icon={<Trash2 size={16} />} />
            </div>

            {loading ? (
                <p>Loading schools...</p>
            ) : schools.length === 0 ? (
                <p className="text-gray-500">No schools found with status: {activeTab}</p>
            ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600">School Name</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600">City</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600">State</th>
                                {activeTab === 'pending' && <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {schools.map(school => (
                                <tr key={school._id} className="border-t">
                                    <td className="p-4 font-medium text-gray-800">{school.name}</td>
                                    <td className="p-4 text-gray-600">{school.city}</td>
                                    <td className="p-4 text-gray-600">{school.state}</td>
                                    {activeTab === 'pending' && (
                                        <td className="p-4 flex space-x-2">
                                            <button onClick={() => handleStatusUpdate(school._id, 'accepted')} className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200" title="Accept">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => handleStatusUpdate(school._id, 'rejected')} className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200" title="Reject">
                                                <X size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// This is the existing component for the Parent/Student View
const ParentDashboard = ({ shortlist, comparisonList, onCompareToggle, onShortlistToggle, onSelectSchool }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const handleCardClick = (school) => {
        onSelectSchool(school);
        navigate(`/school/${school._id}`);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Shortlisted Schools</h2>
            {shortlist.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {shortlist.map(school => (
                        <SchoolCard
                            key={school._id}
                            school={school}
                            onCardClick={() => handleCardClick(school)}
                            onShortlistToggle={() => onShortlistToggle(school)}
                            isShortlisted={true}
                            currentUser={currentUser}
                            onCompareToggle={() => onCompareToggle(school)}
                            isCompared={comparisonList.some(item => item._id === school._id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600">You haven't shortlisted any schools yet.</p>
                    <button onClick={() => navigate('/schools')} className="mt-4 bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg">
                        Browse Schools
                    </button>
                </div>
            )}
        </div>
    );
};


// Main DashboardPage component that decides which view to show
const DashboardPage = ({ shortlist, onShortlistToggle, onSelectSchool, comparisonList, onCompareToggle }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    if (!currentUser) {
        // This case should be handled by ProtectedRoute, but as a fallback:
        return (
            <div className="container mx-auto px-6 py-20 text-center">
                <p>Please log in to view your dashboard.</p>
                <button onClick={() => navigate('/login')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">Login</button>
            </div>
        );
    }
    
    // NOTE: You might need to adjust the role name based on your backend.
    // I am assuming 'superadmin' for the main admin role.
    const isAdmin = currentUser.role === 'superadmin';

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {currentUser.name}!</h1>
                <p className="text-gray-600 mb-8">
                    {isAdmin ? "This is the Super Admin dashboard." : "This is your personal dashboard."}
                </p>

                {isAdmin ? (
                    <AdminDashboard />
                ) : (
                    <ParentDashboard 
                        shortlist={shortlist}
                        comparisonList={comparisonList}
                        onCompareToggle={onCompareToggle}
                        onShortlistToggle={onShortlistToggle}
                        onSelectSchool={onSelectSchool}
                    />
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
