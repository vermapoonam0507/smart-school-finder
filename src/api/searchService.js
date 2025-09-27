import apiClient from './axios';

export const searchSchools = async ({ search = '', boards = [], cities = [], state = [], page = 1, limit = 12 }) => {
	const params = {};
	if (search) params.search = search;
	if (boards.length) params.boards = boards.join(',');
	if (cities.length) params.cities = cities.join(',');
	if (state.length) params.state = state.join(',');
	params.page = page;
	params.limit = limit;
	const { data } = await apiClient.get('/admin/search', { params });
	return data;
};

export const getSchoolById = async (id) => {
	const { data } = await apiClient.get(`/admin/schools/${encodeURIComponent(id)}`);
	return data;
};


