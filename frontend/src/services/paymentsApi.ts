import { baseApi } from './api';
import type { ApiResponse, PrasadamBooking, PaymentsResponse, PaymentSummary, BookingStatus } from '@/types';

type PaymentsRaw = { success: boolean; data: PrasadamBooking[]; summary: PaymentSummary };

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<
      PaymentsResponse,
      { search?: string; location?: string; date?: string; status?: BookingStatus }
    >({
      query: (params = {}) => ({
        url: '/payments',
        params,
      }),
      transformResponse: (res: PaymentsRaw): PaymentsResponse => ({
        data: res.data,
        summary: res.summary,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Payment' as const, id })),
              { type: 'Payment', id: 'LIST' },
            ]
          : [{ type: 'Payment', id: 'LIST' }],
    }),
    approvePayment: builder.mutation<PrasadamBooking, string>({
      query: (id) => ({
        url: `/payments/${id}/approve`,
        method: 'PATCH',
      }),
      transformResponse: (res: ApiResponse<PrasadamBooking>) => res.data,
      invalidatesTags: (_result, _err, id) => [
        { type: 'Payment', id },
        { type: 'Payment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),
    declinePayment: builder.mutation<PrasadamBooking, string>({
      query: (id) => ({
        url: `/payments/${id}/decline`,
        method: 'PATCH',
      }),
      transformResponse: (res: ApiResponse<PrasadamBooking>) => res.data,
      invalidatesTags: (_result, _err, id) => [
        { type: 'Payment', id },
        { type: 'Payment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),
    flagMismatch: builder.mutation<PrasadamBooking, { id: string; note: string }>({
      query: ({ id, note }) => ({
        url: `/payments/${id}/mismatch`,
        method: 'PATCH',
        body: { note },
      }),
      transformResponse: (res: ApiResponse<PrasadamBooking>) => res.data,
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Payment', id },
        { type: 'Payment', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPaymentsQuery,
  useApprovePaymentMutation,
  useDeclinePaymentMutation,
  useFlagMismatchMutation,
} = paymentsApi;
