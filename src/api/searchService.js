import apiClient from './axios';

export const searchSchools = async (raw = {}) => {
  const {
    search = '',
    boards = raw.board || [],
    cities = raw.city || [],
    state = raw.state || '',
    schoolMode = [],
    genderType = [],
    feeRange = [],
    page = 1,
    limit = 12,
    progressive = true, // relax filters automatically if nothing found
  } = raw;

  const join = (arr) => Array.isArray(arr) ? arr.filter(Boolean).join(',') : arr || '';

  const buildParams = (overrides = {}) => {
    const params = {};
    if (search) params.search = search;
    if (boards.length) params.boards = join(boards);
    if (cities.length) params.cities = join(cities);
    if (state) params.state = state;
    if (schoolMode.length) params.schoolMode = join(schoolMode);
    if (genderType.length) params.genderType = join(genderType);
    if (feeRange.length) {
      // Ensure proper format: 25000-50000,50000-75000
      params.feeRange = decodeURIComponent(join(feeRange).replace(/\s*\+\s*/g, '-'));
    }
    params.page = page;
    params.limit = limit;
    return { ...params, ...overrides };
  };

  const path = '/admin/search';

  try {
    const { data } = await apiClient.get(path, { params: buildParams() });
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      if (!progressive) {
        return { status: 'success', message: 'No schools found', data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
      }

      // Progressive relaxation steps
      const relaxSteps = [
        (p) => ({ ...p, feeRange: undefined }),
        (p) => ({ ...p, genderType: undefined }),
        (p) => ({ ...p, schoolMode: undefined }),
        (p) => ({ ...p, cities: undefined }),
        (p) => ({ ...p, state: undefined }),
      ];

      for (const relax of relaxSteps) {
        try {
          const relaxedParams = relax(buildParams());
          const { data } = await apiClient.get(path, { params: relaxedParams });
          return { ...data, relaxedFrom: buildParams() };
        } catch (e) {
          if (e.response?.status !== 404) throw e;
        }
      }

      return { status: 'success', message: 'No schools found after relaxing filters.', data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
    throw error;
  }
};

export const getSchoolById = async (id) => {
  const encoded = encodeURIComponent(id);
  const { data } = await apiClient.get(`/admin/schools/${encoded}`);
  return data;
};
