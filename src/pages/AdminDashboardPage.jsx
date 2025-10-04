import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  School, 
  BarChart3, 
  Settings, 
  LogOut, 
  UserCheck, 
  UserX,
  AlertCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import PendingSchoolsSection from "../components/PendingSchoolsSection";
import BlogManagementSection from "../components/BlogManagementSection";
import DebugAPI from "../components/DebugAPI";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSchools: 0,
    activeUsers: 0,
    pendingSchools: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.userType !== 'admin') {
      navigate('/admin/login');
      return;
    }

    // Simulate loading stats (replace with actual API call)
    const loadStats = async () => {
      try {
        // const response = await getAdminStats();
        // setStats(response.data);
        
        // Mock data for now
        setStats({
          totalUsers: 1250,
          totalSchools: 85,
          activeUsers: 1100,
          pendingSchools: 12
        });
      } catch (error) {
        console.error('Failed to load admin stats:', error);
        toast.error('Failed to load dashboard data');
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Schools</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingSchools}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Debug API Section */}
        <div className="mb-8">
          <DebugAPI />
        </div>

        {/* Pending Schools Section */}
        <div className="mb-8">
          <PendingSchoolsSection />
        </div>

        {/* Blog Management Section */}
        <div className="mb-8">
          <BlogManagementSection />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">Manage Users</span>
                </button>
                <button
                  onClick={() => navigate('/admin/schools')}
                  className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <School className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Manage Schools</span>
                </button>
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">Analytics</span>
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Settings className="h-6 w-6 text-gray-600 mr-2" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">New school registration</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">User activity increased</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserX className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">User account deactivated</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
