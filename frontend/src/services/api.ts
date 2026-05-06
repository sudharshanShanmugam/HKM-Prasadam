import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/**
 * RTK Query base API.
 * All service files inject their endpoints into this single instance
 * so the app shares one cache and one request dedup layer.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  refetchOnMountOrArgChange: true,
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('hkm_admin_token');
        if (token) headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'PrasadamBooking',
    'PartyEnquiry',
    'InternalOrder',
    'SlotDate',
    'MealMenu',
    'Festival',
    'Dashboard',
    'Registration',
    'Payment',
    'Settings',
    'SlotManagement',
  ],
  endpoints: () => ({}),
});
