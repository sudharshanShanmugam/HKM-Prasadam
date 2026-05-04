import { baseApi } from './api';
import type { ApiResponse, SlotDate, SlotMap } from '@/types';

export const slotDatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** Public: { 'YYYY-MM-DD': MealType[] } */
    getSlotMap: builder.query<SlotMap, void>({
      query: () => '/slot-dates',
      transformResponse: (res: ApiResponse<SlotMap>) => res.data,
      providesTags: [{ type: 'SlotDate', id: 'MAP' }],
    }),

    /** Admin: full SlotDate documents */
    getSlotDatesAdmin: builder.query<SlotDate[], void>({
      query: () => '/slot-dates/admin',
      transformResponse: (res: ApiResponse<SlotDate[]>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ date }) => ({ type: 'SlotDate' as const, id: date })),
              { type: 'SlotDate', id: 'LIST' },
            ]
          : [{ type: 'SlotDate', id: 'LIST' }],
    }),

    getSlotDateByDate: builder.query<SlotDate, string>({
      query: (date) => `/slot-dates/${date}`,
      transformResponse: (res: ApiResponse<SlotDate>) => res.data,
      providesTags: (_result, _err, date) => [{ type: 'SlotDate', id: date }],
    }),

    upsertSlotDate: builder.mutation<SlotDate, { date: string; data: Partial<SlotDate> }>({
      query: ({ date, data }) => ({
        url: `/slot-dates/${date}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res: ApiResponse<SlotDate>) => res.data,
      invalidatesTags: (_result, _err, { date }) => [
        { type: 'SlotDate', id: date },
        { type: 'SlotDate', id: 'MAP' },
        { type: 'SlotDate', id: 'LIST' },
      ],
    }),

    patchSlotDate: builder.mutation<SlotDate, { date: string; data: Partial<SlotDate> }>({
      query: ({ date, data }) => ({
        url: `/slot-dates/${date}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (res: ApiResponse<SlotDate>) => res.data,
      invalidatesTags: (_result, _err, { date }) => [
        { type: 'SlotDate', id: date },
        { type: 'SlotDate', id: 'MAP' },
      ],
    }),

    deleteSlotDate: builder.mutation<void, string>({
      query: (date) => ({
        url: `/slot-dates/${date}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, date) => [
        { type: 'SlotDate', id: date },
        { type: 'SlotDate', id: 'MAP' },
        { type: 'SlotDate', id: 'LIST' },
      ],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetSlotMapQuery,
  useGetSlotDatesAdminQuery,
  useGetSlotDateByDateQuery,
  useUpsertSlotDateMutation,
  usePatchSlotDateMutation,
  useDeleteSlotDateMutation,
} = slotDatesApi;
