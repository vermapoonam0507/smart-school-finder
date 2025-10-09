import apiClient from './axios';

// Posts user filters and returns matched schools (public route)
export const predictSchools = async (filters) => {
	// Prefer env override; default to /schools/predict
	const rawPath = (import.meta?.env?.VITE_PREDICT_PATH || '/schools/predict').trim();
	const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
	const { data } = await apiClient.post(normalizedPath, filters);
	return data;
};


