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
  const feeJoined = join(feeRange); if (feeJoined) params.feeRange = feeJoined;

  params.page = page;
  params.limit = limit;

  // Remove /api prefix here because apiClient already includes it
  const path = '/schools/search';
  const { data } = await apiClient.get(path, { params });
  return data;
};

export const getSchoolById = async (id) => {
  const encoded = encodeURIComponent(id);
  const { data } = await apiClient.get(`/schools/${encoded}`);
  return data;
};
