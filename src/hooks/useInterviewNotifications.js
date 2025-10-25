import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkForInterviewNotifications } from '../services/interviewNotificationService';

/**
 * Hook to manage interview notifications for students
 */
export const useInterviewNotifications = () => {
  const { user: currentUser } = useAuth();
  const [interviewNotification, setInterviewNotification] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check for interview notifications
  const checkNotifications = useCallback(async () => {
    if (!currentUser || (currentUser.userType !== 'student' && currentUser.userType !== 'parent')) {
      return;
    }

    const studentId = currentUser.studentId || currentUser._id;
    if (!studentId) {
      console.warn('No student ID available for interview notifications');
      return;
    }

    // Validate studentId is a string and not undefined/null
    if (typeof studentId !== 'string' || studentId === 'undefined' || studentId === 'null') {
      console.warn('Invalid student ID for interview notifications:', studentId);
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't check if already checking
    if (isChecking) {
      return;
    }

    setIsChecking(true);
    try {
      const notification = await checkForInterviewNotifications(studentId);
      
      if (notification) {
        // Check if this is a new notification (not already shown)
        const notificationKey = `${notification.application._id}-${notification.application.updatedAt}`;
        const lastShownKey = localStorage.getItem('lastInterviewNotification');
        
        if (notificationKey !== lastShownKey) {
          setInterviewNotification(notification);
          // Store this notification as shown
          localStorage.setItem('lastInterviewNotification', notificationKey);
        }
      } else {
        setInterviewNotification(null);
      }
    } catch (error) {
      // Only log error if it's not an abort error
      if (error.name !== 'AbortError') {
        console.error('Error checking interview notifications:', error);
      }
      // Don't set notification to null on error, just log it
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  }, [currentUser, isChecking]);

  // Check notifications on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      checkNotifications();
    }
  }, [currentUser, checkNotifications]);

  // Set up periodic checking (every 60 seconds with debouncing)
  useEffect(() => {
    if (!currentUser || (currentUser.userType !== 'student' && currentUser.userType !== 'parent')) {
      return;
    }

    const interval = setInterval(() => {
      // Debounce the check - only run if not already checking
      if (!isChecking) {
        timeoutRef.current = setTimeout(() => {
          checkNotifications();
        }, 1000); // 1 second debounce
      }
    }, 60000); // Check every 60 seconds

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentUser, checkNotifications, isChecking]);

  // Dismiss notification
  const dismissNotification = useCallback(() => {
    setInterviewNotification(null);
  }, []);

  // Force check notifications
  const forceCheck = useCallback(() => {
    checkNotifications();
  }, [checkNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    interviewNotification,
    isChecking,
    lastChecked,
    dismissNotification,
    forceCheck
  };
};