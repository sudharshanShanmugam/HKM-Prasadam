import { baseApi } from './api';
import type {
  ApiResponse,
  InternalOrder,
  CreateInternalOrderDto,
  Department,
  MealType,
} from '@/types';

export const internalOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getInternalOrders: builder.query<
      InternalOrder[],
      { mobile?: string; dept?: Department; date?: string; accepted?: boolean; delivered?: boolean }
    >({
      query: (filters = {}) => ({
        url: '/internal-orders',
        params: filters,
      }),
      transformResponse: (res: ApiResponse<InternalOrder[]>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'InternalOrder' as const, id })),
              { type: 'InternalOrder', id: 'LIST' },
            ]
          : [{ type: 'InternalOrder', id: 'LIST' }],
    }),

    getInternalOrderById: builder.query<InternalOrder, string>({
      query: (id) => `/internal-orders/${id}`,
      transformResponse: (res: ApiResponse<InternalOrder>) => res.data,
      providesTags: (_result, _err, id) => [{ type: 'InternalOrder', id }],
    }),

    createInternalOrder: builder.mutation<InternalOrder, CreateInternalOrderDto>({
      query: (body) => ({
        url: '/internal-orders',
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiResponse<InternalOrder>) => res.data,
      invalidatesTags: [{ type: 'InternalOrder', id: 'LIST' }],
    }),

    toggleAccept: builder.mutation<InternalOrder, string>({
      query: (id) => ({
        url: `/internal-orders/${id}/accept`,
        method: 'PATCH',
      }),
      transformResponse: (res: ApiResponse<InternalOrder>) => res.data,
      invalidatesTags: (_result, _err, id) => [
        { type: 'InternalOrder', id },
        { type: 'InternalOrder', id: 'LIST' },
      ],
    }),

    toggleDeliver: builder.mutation<InternalOrder, string>({
      query: (id) => ({
        url: `/internal-orders/${id}/deliver`,
        method: 'PATCH',
      }),
      transformResponse: (res: ApiResponse<InternalOrder>) => res.data,
      invalidatesTags: (_result, _err, id) => [
        { type: 'InternalOrder', id },
        { type: 'InternalOrder', id: 'LIST' },
      ],
    }),

    deleteInternalOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/internal-orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'InternalOrder', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetInternalOrdersQuery,
  useGetInternalOrderByIdQuery,
  useCreateInternalOrderMutation,
  useToggleAcceptMutation,
  useToggleDeliverMutation,
  useDeleteInternalOrderMutation,
} = internalOrdersApi;
