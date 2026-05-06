import { baseApi } from './api';
import type { ApiResponse, Settings, MealMap } from '@/types';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<Settings, void>({
      query: () => '/settings',
      transformResponse: (res: ApiResponse<Settings>) => res.data,
      providesTags: [{ type: 'Settings', id: 'DEFAULT' }],
    }),
    patchMealRates: builder.mutation<Settings, MealMap>({
      query: (body) => ({
        url: '/settings/meal-rates',
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: ApiResponse<Settings>) => res.data,
      invalidatesTags: [{ type: 'Settings', id: 'DEFAULT' }],
    }),
    patchSlotLimits: builder.mutation<Settings, Settings['defaultSlotLimits']>({
      query: (body) => ({
        url: '/settings/slot-limits',
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: ApiResponse<Settings>) => res.data,
      invalidatesTags: [{ type: 'Settings', id: 'DEFAULT' }],
    }),
    patchBookingWindow: builder.mutation<Settings, {
      bookingWindowOpen?: boolean;
      bookingWindowClose?: boolean;
      bookingOpenDays?: number;
      bookingCloseDays?: number;
    }>({
      query: (body) => ({
        url: '/settings/booking-window',
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: ApiResponse<Settings>) => res.data,
      invalidatesTags: [{ type: 'Settings', id: 'DEFAULT' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSettingsQuery,
  usePatchMealRatesMutation,
  usePatchSlotLimitsMutation,
  usePatchBookingWindowMutation,
} = settingsApi;
