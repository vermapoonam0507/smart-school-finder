import apiClient from './axios';

export const searchSchools = async (raw = {}) => {
  // Normalize accepted inputs to match backend expectations exactly
  // Backend expects: search, boards, cities, state, schoolMode, genderType, feeRange, page, limit
  const {
    search = '',
    // accept both singular and plural keys from callers
    board, boards = board || [],
    city, cities = city || [],
    state, states = state || [],
    page = 1,
    limit = 12,
    schoolMode = [],
    genderType = [],
    feeRange = [],
    // control retry behavior (frontend-only)
    progressive = false,
  } = raw;

  const params = {};
  const join = (arr) => Array.isArray(arr) ? arr.filter(Boolean).join(',') : (arr || '').toString();

  if (search) params.search = search;

  const boardsJoined = join(boards); if (boardsJoined) params.boards = boardsJoined;
  const citiesJoined = join(cities); if (citiesJoined) params.cities = citiesJoined;
  // backend expects singular "state"
  const statesJoined = join(states); if (statesJoined) params.state = statesJoined;
  const modesJoined = join(schoolMode); if (modesJoined) params.schoolMode = modesJoined;
  const genderJoined = join(genderType); if (genderJoined) params.genderType = genderJoined;
  const feeJoined = join(feeRange);
  if (feeJoined) {
    // Replace plus with space and decode any accidental encoding remnants
    params.feeRange = decodeURIComponent(feeJoined.replace(/\+/g, ' '));
  }

  params.page = page;
  params.limit = limit;

  // Exact backend path mounted at /api/admin
  const path = '/admin/search';
  try {
    const { data } = await apiClient.get(path, { params, headers: { 'X-Silent-Request': '0' } });
    return data;
  } catch (error) {
    // If no matches (404), progressively relax filters to find alternatives
    if (error.response?.status === 404) {
      if (!progressive) {
        return {
          status: 'success',
          message: 'No schools found for the given search.',
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        };
      }
      const relaxationSteps = [
        // Remove fee range first
        (p) => ({ ...p, feeRange: undefined }),
        // Then gender type
        (p) => ({ ...p, genderType: undefined }),
        // Then school mode
        (p) => ({ ...p, schoolMode: undefined }),
        // Then city
        (p) => ({ ...p, cities: undefined }),
        // Then state
        (p) => ({ ...p, state: undefined }),
      ];

      for (const relax of relaxationSteps) {
        const relaxed = relax(params);
        try {
          const { data } = await apiClient.get(path, { params: relaxed, headers: { 'X-Silent-Request': '1' } });
          return { ...data, relaxedFrom: params };
        } catch (e) {
          if (e.response?.status !== 404) throw e;
          // continue relaxing on 404
        }
      }

      // Nothing found even after relaxing
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
    throw error;
  }
};

export const getSchoolById = async (id) => {
  const encoded = encodeURIComponent(id);
  const { data } = await apiClient.get(`/admin/schools/${encoded}`);
  return data;
};