// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { loginUser as apiLogin } from '../api/authService';
import { toast } from 'react-toastify';
import { getUserProfile, getUserPreferences } from '../api/userService'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // --- HOOKS MUST COME FIRST ---
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('userData');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const updateUserContext = useCallback((newUserData) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newUserData };
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);

    // --- REGULAR FUNCTIONS COME AFTER HOOKS ---
    const login = async (credentials) => {
        try {
            const response = await apiLogin(credentials);
            const { token, auth: basicAuthData } = response.data.data;

            setToken(token);
            localStorage.setItem('authToken', token);

            const userId = basicAuthData?._id;
            if (!userId) {
                setUser(basicAuthData);
                localStorage.setItem('userData', JSON.stringify(basicAuthData));
                return;
            }

            // If this is a school user, there is no student profile to fetch
            if (basicAuthData.userType === 'school') {
                setUser(basicAuthData);
                localStorage.setItem('userData', JSON.stringify(basicAuthData));
                return;
            }

            try {
                const profileResponse = await getUserProfile(basicAuthData.authId || userId);
                const studentId = profileResponse.data?.data?._id || profileResponse.data?._id;
                let preferences = null;
                try {
                    if (studentId) {
                        const prefResponse = await getUserPreferences(studentId);
                        preferences = prefResponse?.data || prefResponse;
                    }
                } catch (_) {}
                const fullUserData = { ...basicAuthData, ...(profileResponse.data?.data || profileResponse.data), ...(preferences ? { preferences } : {}) };
                setUser(fullUserData);
                localStorage.setItem('userData', JSON.stringify(fullUserData));
            } catch (profileError) {
                const isProfileNotFound = (profileError.response && (profileError.response.status === 404 || profileError.response.status === 400));
                
                if (isProfileNotFound) {
                    toast.info("Please complete your profile to continue.");
                    setUser(basicAuthData);
                    localStorage.setItem('userData', JSON.stringify(basicAuthData));
                } else {
                    throw profileError;
                }
            }
        } catch (error) {
            console.error("Login failed:", error);
            toast.error("Login failed. Please check your credentials.");
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    };

    // --- FINAL MEMOIZED VALUE ---
    const value = useMemo(() => ({
        user,
        token,
        login,
        logout,
        updateUserContext,
        isAuthenticated: !!token,
        loading
    }), [user, token, loading, updateUserContext]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading application...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};