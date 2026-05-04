import { baseApi } from './api';
import type {
  ApiResponse,
  PartyEnquiry,
  CreatePartyEnquiryDto,
  UpdatePartyEnquiryDto,
  EnquiryStatus,
} from '@/types';

export const partyEnquiriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getPartyEnquiries: builder.query<
      PartyEnquiry[],
      { mobile?: string; status?: EnquiryStatus }
    >({
      query: (filters = {}) => ({
        url: '/party-enquiries',
        params: filters,
      }),
      transformResponse: (res: ApiResponse<PartyEnquiry[]>) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PartyEnquiry' as const, id })),
              { type: 'PartyEnquiry', id: 'LIST' },
            ]
          : [{ type: 'PartyEnquiry', id: 'LIST' }],
    }),

    getPartyEnquiryById: builder.query<PartyEnquiry, string>({
      query: (id) => `/party-enquiries/${id}`,
      transformResponse: (res: ApiResponse<PartyEnquiry>) => res.data,
      providesTags: (_result, _err, id) => [{ type: 'PartyEnquiry', id }],
    }),

    createPartyEnquiry: builder.mutation<PartyEnquiry, CreatePartyEnquiryDto>({
      query: (body) => ({
        url: '/party-enquiries',
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiResponse<PartyEnquiry>) => res.data,
      invalidatesTags: [{ type: 'PartyEnquiry', id: 'LIST' }],
    }),

    updatePartyEnquiry: builder.mutation<PartyEnquiry, { id: string; data: UpdatePartyEnquiryDto }>({
      query: ({ id, data }) => ({
        url: `/party-enquiries/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (res: ApiResponse<PartyEnquiry>) => res.data,
      invalidatesTags: (_result, _err, { id }) => [{ type: 'PartyEnquiry', id }],
    }),

    deletePartyEnquiry: builder.mutation<void, string>({
      query: (id) => ({
        url: `/party-enquiries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PartyEnquiry', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPartyEnquiriesQuery,
  useGetPartyEnquiryByIdQuery,
  useCreatePartyEnquiryMutation,
  useUpdatePartyEnquiryMutation,
  useDeletePartyEnquiryMutation,
} = partyEnquiriesApi;
