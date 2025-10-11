import apiClient from './axios';

export const searchSchools = async ({
  search = '',
  boards = [],
  cities = [],
  states = [],
  page = 1,
  limit = 12,
  schoolMode = [],
  genderType = [],
  feeRange = [],
} = {}) => {
  const params = {};
  const join = (arr) => Array.isArray(arr) ? arr.filter(Boolean).join(',') : '';

  if (search) params.search = search;
  const boardsJoined = join(boards); if (boardsJoined) params.boards = boardsJoined;
  const citiesJoined = join(cities); if (citiesJoined) params.cities = citiesJoined;
  const statesJoined = join(states); if (statesJoined) params.states = statesJoined;
  const modesJoined = join(schoolMode); if (modesJoined) params.schoolMode = modesJoined;
  const genderJoined = join(genderType); if (genderJoined) params.genderType = genderJoined;
  const feeJoined = join(feeRange); if (feeJoined) {
    // Ensure feeRange values are properly formatted (spaces, not plus signs)
    params.feeRange = feeJoined.replace(/\+/g, ' ');
  }

  params.page = page;
  params.limit = limit;

  try {
    // Remove /api prefix here because apiClient already includes it
    const path = '/admin/search';
    const { data } = await apiClient.get(path, { params });
    return data;
  } catch (error) {
    // Handle 404 as "no results found" instead of error
    if (error.response?.status === 404) {
      return {
        status: 'success',
        message: 'No schools found for the given search.',
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
    // Re-throw other errors
    throw error;
  }
};

export const getSchoolById = async (id) => {
  const encoded = encodeURIComponent(id);
  const { data } = await apiClient.get(`/admin/schools/${encoded}`);
  return data;
};
