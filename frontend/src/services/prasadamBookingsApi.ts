import { baseApi } from './api';
import type {
  ApiResponse,
  PrasadamBooking,
  CreatePrasadamBookingDto,
  BookingStatus,
} from '@/types';

export const prasadamBookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getPrasadamBookings: builder.query<
      PrasadamBooking[],
      { mobile?: string; date?: string; status?: BookingStatus }
    >({
      query: (filters = {}) => ({
        url: '/prasadam-bookings',
        params: filters,
      }),
      transformResponse: (res: ApiResponse<PrasadamBooking[]>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PrasadamBooking' as const, id })),
              { type: 'PrasadamBooking', id: 'LIST' },
            ]
          : [{ type: 'PrasadamBooking', id: 'LIST' }],
    }),

    getPrasadamBookingById: builder.query<PrasadamBooking, string>({
      query: (id) => `/prasadam-bookings/${id}`,
      transformResponse: (res: ApiResponse<PrasadamBooking>) => res.data,
      providesTags: (_result, _err, id) => [{ type: 'PrasadamBooking', id }],
    }),

    createPrasadamBooking: builder.mutation<PrasadamBooking, CreatePrasadamBookingDto>({
      query: (body) => ({
        url: '/prasadam-bookings',
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiResponse<PrasadamBooking>) => res.data,
      invalidatesTags: [{ type: 'PrasadamBooking', id: 'LIST' }],
    }),

    updateBookingStatus: builder.mutation<PrasadamBooking, { id: string; status: BookingStatus }>({
      query: ({ id, status }) => ({
        url: `/prasadam-bookings/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (res: ApiResponse<PrasadamBooking>) => res.data,
      invalidatesTags: (_result, _err, { id }) => [{ type: 'PrasadamBooking', id }],
    }),

    deletePrasadamBooking: builder.mutation<void, string>({
      query: (id) => ({
        url: `/prasadam-bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PrasadamBooking', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPrasadamBookingsQuery,
  useGetPrasadamBookingByIdQuery,
  useCreatePrasadamBookingMutation,
  useUpdateBookingStatusMutation,
  useDeletePrasadamBookingMutation,
} = prasadamBookingsApi;
