import { baseApi } from './api';

interface LoginDto { email: string; password: string }
interface LoginResponse { token: string; email: string; name: string; role: string }

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginDto>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (res: { success: boolean; data: LoginResponse }) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;
