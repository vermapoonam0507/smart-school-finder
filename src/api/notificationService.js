import apiClient from './axios';

/**
 * Notification Service - Frontend API calls for notification-related operations
 * This service handles fetching notifications for users based on their application status changes
 */

/**
 * Get notifications for a student
 * @param {string} studId - Student ID
 * @returns {Promise<Object>} Notifications data
 */
export const getStudentNotifications = async (studId) => {
  try {
    // Get all forms for the student to check for status changes
    const response = await apiClient.get(`/api/form/student/${studId}`);
    const forms = response.data?.data || response.data || [];
    
    // Generate notifications based on form status changes
    const notifications = forms.map(form => {
      const status = form.status || 'Pending';
      const schoolName = form.schoolId?.name || form.schoolName || 'Unknown School';
      const createdAt = form.createdAt || form.updatedAt || new Date();
      
      let message = '';
      let type = 'info';
      
      switch (status.toLowerCase()) {
        case 'reviewed':
          message = `Your application to ${schoolName} has been reviewed`;
          type = 'info';
          break;
        case 'interview':
          message = `Interview scheduled for ${schoolName}`;
          type = 'warning';
          break;
        case 'accepted':
          message = `Congratulations! You've been accepted to ${schoolName}`;
          type = 'success';
          break;
        case 'rejected':
          message = `Application to ${schoolName} was not successful`;
          type = 'error';
          break;
        default:
          message = `Application to ${schoolName} is ${status}`;
          type = 'info';
      }
      
      return {
        id: form._id || form.id,
        message,
        type,
        schoolName,
        status,
        createdAt: new Date(createdAt),
        isRead: false, // For now, all notifications are unread
        formId: form._id,
        schoolId: form.schoolId?._id || form.schoolId
      };
    });
    
    // Sort by creation date (newest first)
    notifications.sort((a, b) => b.createdAt - a.createdAt);
    
    return { data: notifications };
  } catch (error) {
    console.error('Error fetching student notifications:', error.response?.data || error.message);
    return { data: [] };
  }
};

/**
 * Get unread notification count for a student
 * @param {string} studId - Student ID
 * @returns {Promise<number>} Unread count
 */
export const getUnreadNotificationCount = async (studId) => {
  try {
    const notifications = await getStudentNotifications(studId);
    const unreadCount = notifications.data.filter(notification => !notification.isRead).length;
    return unreadCount;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Success response
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    // For now, we'll just return success since we don't have a backend endpoint
    // In a real implementation, this would call the backend to mark as read
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a student
 * @param {string} studId - Student ID
 * @returns {Promise<Object>} Success response
 */
export const markAllNotificationsAsRead = async (studId) => {
  try {
    // For now, we'll just return success since we don't have a backend endpoint
    // In a real implementation, this would call the backend to mark all as read
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
