import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  School, 
  LogOut, 
  UserCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { getAdminStats } from "../api/adminService";
import PendingSchoolsSection from "../components/PendingSchoolsSection";
import PendingReviewsSection from "../components/PendingReviewsSection";
import DebugAPI from "../components/DebugAPI";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSchools: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.userType !== 'admin') {
      navigate('/admin/login');
      return;
    }

    // Load stats from API
    const loadStats = async () => {
      try {
        const response = await getAdminStats();
        console.log('📊 Admin Stats Response:', response.data);
        
        // Handle different response structures
        const data = response.data?.data || response.data;
        
        setStats({
          totalUsers: data.totalUsers || 0,
          totalSchools: data.totalSchools || 0,
          activeUsers: data.activeUsers || 0
        });
      } catch (error) {
        console.error('Failed to load admin stats:', error);
        toast.error('Failed to load dashboard data');
        // Set to 0 if API fails
        setStats({
          totalUsers: 0,
          totalSchools: 0,
          activeUsers: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <School className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Schools</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSchools}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          {/* Removed Pending Schools top card */}
        </div>

        {/* Debug API Section */}
        <div className="mb-8">
          <DebugAPI />
        </div>

        {/* Pending Schools Section */}
        <div className="mb-8">
          <PendingSchoolsSection />
        </div>

        {/* Pending Reviews Section */}
        <div className="mb-8">
          <PendingReviewsSection />
        </div>

        {/* Removed Blog Management and Quick Actions per requirements */}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
