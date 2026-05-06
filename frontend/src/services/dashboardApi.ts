import { baseApi } from './api';
import type { ApiResponse, DashboardStats, TodaySlotsData } from '@/types';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      transformResponse: (res: ApiResponse<DashboardStats>) => res.data,
      providesTags: [{ type: 'Dashboard', id: 'STATS' }],
    }),
    getTodaySlots: builder.query<TodaySlotsData, void>({
      query: () => '/dashboard/today-slots',
      transformResponse: (res: ApiResponse<TodaySlotsData>) => res.data,
      providesTags: [{ type: 'Dashboard', id: 'TODAY' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardStatsQuery,
  useGetTodaySlotsQuery,
} = dashboardApi;
