import { baseApi } from './api';
import type { ApiResponse, SlotDate, SlotRateEditorData, MonthlySummaryData } from '@/types';

export const slotManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSlotManagementSlots: builder.query<SlotDate[], void>({
      query: () => '/slot-management',
      transformResponse: (res: ApiResponse<SlotDate[]>) => res.data,
      providesTags: [{ type: 'SlotManagement', id: 'LIST' }],
    }),
    getConfiguredSlots: builder.query<SlotDate[], void>({
      query: () => '/slot-management/configured',
      transformResponse: (res: ApiResponse<SlotDate[]>) => res.data,
      providesTags: [{ type: 'SlotManagement', id: 'CONFIGURED' }],
    }),
    getMonthlySummary: builder.query<MonthlySummaryData, string>({
      query: (month) => ({ url: '/slot-management/monthly-summary', params: { month } }),
      transformResponse: (res: ApiResponse<MonthlySummaryData>) => res.data,
      providesTags: (_result, _err, month) => [{ type: 'SlotManagement', id: `MONTH_${month}` }],
    }),
    getSlotRateEditor: builder.query<SlotRateEditorData, string>({
      query: (date) => `/slot-management/${date}`,
      transformResponse: (res: ApiResponse<SlotRateEditorData>) => res.data,
      providesTags: (_result, _err, date) => [{ type: 'SlotManagement', id: date }],
    }),
    upsertSlotManagement: builder.mutation<SlotDate, { date: string; data: Partial<SlotDate> }>({
      query: ({ date, data }) => ({
        url: `/slot-management/${date}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res: ApiResponse<SlotDate>) => res.data,
      invalidatesTags: (_result, _err, { date }) => [
        { type: 'SlotManagement', id: 'LIST' },
        { type: 'SlotManagement', id: date },
        { type: 'Dashboard', id: 'TODAY' },
      ],
    }),
    deleteSlotManagement: builder.mutation<void, string>({
      query: (date) => ({
        url: `/slot-management/${date}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, date) => [
        { type: 'SlotManagement', id: 'LIST' },
        { type: 'SlotManagement', id: date },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSlotManagementSlotsQuery,
  useGetConfiguredSlotsQuery,
  useGetMonthlySummaryQuery,
  useGetSlotRateEditorQuery,
  useUpsertSlotManagementMutation,
  useDeleteSlotManagementMutation,
} = slotManagementApi;
