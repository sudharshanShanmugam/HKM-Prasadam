import { baseApi } from './api';
import type { Registration, RegistrationsResponse } from '@/types';

type RegistrationsRaw = { success: boolean; data: Registration[]; meta: { count: number; totalCoupons: number } };

export const registrationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegistrations: builder.query<
      RegistrationsResponse,
      { search?: string; location?: string; date?: string; dateFrom?: string; dateTo?: string }
    >({
      query: (params = {}) => ({
        url: '/registrations',
        params,
      }),
      transformResponse: (res: RegistrationsRaw): RegistrationsResponse => ({
        data: res.data,
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Registration' as const, id })),
              { type: 'Registration', id: 'LIST' },
            ]
          : [{ type: 'Registration', id: 'LIST' }],
    }),
    deleteRegistration: builder.mutation<void, string>({
      query: (id) => ({
        url: `/registrations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Registration', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRegistrationsQuery,
  useDeleteRegistrationMutation,
} = registrationsApi;
