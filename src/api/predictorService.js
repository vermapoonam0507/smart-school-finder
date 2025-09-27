import apiClient from './axios';

// Posts user filters and returns matched schools
export const predictSchools = async (filters) => {
	const { data } = await apiClient.post('/admin/predict-schools', filters);
	return data;
};


