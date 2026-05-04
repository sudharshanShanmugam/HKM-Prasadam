import { baseApi } from './api';
import type { ApiResponse, Festival } from '@/types';

export const festivalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getFestivals: builder.query<Festival[], void>({
      query: () => '/festivals',
      transformResponse: (res: ApiResponse<Festival[]>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Festival' as const, id: _id })),
              { type: 'Festival', id: 'LIST' },
            ]
          : [{ type: 'Festival', id: 'LIST' }],
    }),

    createFestival: builder.mutation<Festival, Omit<Festival, '_id' | 'createdAt' | 'updatedAt'>>({
      query: (body) => ({
        url: '/festivals',
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiResponse<Festival>) => res.data,
      invalidatesTags: [{ type: 'Festival', id: 'LIST' }],
    }),

    updateFestival: builder.mutation<Festival, { id: string; data: Partial<Festival> }>({
      query: ({ id, data }) => ({
        url: `/festivals/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res: ApiResponse<Festival>) => res.data,
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Festival', id }],
    }),

    deleteFestival: builder.mutation<void, string>({
      query: (id) => ({
        url: `/festivals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Festival', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetFestivalsQuery,
  useCreateFestivalMutation,
  useUpdateFestivalMutation,
  useDeleteFestivalMutation,
} = festivalsApi;
