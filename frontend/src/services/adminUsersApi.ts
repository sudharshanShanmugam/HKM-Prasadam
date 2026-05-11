import { baseApi } from './api';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'kitchen_manager' | 'accounts_manager' | 'gita_counter' | 'prasadam_hall';
  createdAt: string;
}

export interface CreateAdminUserDto {
  name: string;
  email: string;
  password: string;
  role: AdminUser['role'];
}

export interface UpdateAdminUserDto {
  name?: string;
  role?: AdminUser['role'];
  password?: string;
}

export const adminUsersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminUser[], void>({
      query: () => '/admin-users',
      transformResponse: (res: { success: boolean; data: AdminUser[] }) => res.data,
      providesTags: ['AdminUsers'],
    }),
    createAdminUser: builder.mutation<AdminUser, CreateAdminUserDto>({
      query: (body) => ({ url: '/admin-users', method: 'POST', body }),
      transformResponse: (res: { success: boolean; data: AdminUser }) => res.data,
      invalidatesTags: ['AdminUsers'],
    }),
    updateAdminUser: builder.mutation<AdminUser, { id: string; data: UpdateAdminUserDto }>({
      query: ({ id, data }) => ({ url: `/admin-users/${id}`, method: 'PUT', body: data }),
      transformResponse: (res: { success: boolean; data: AdminUser }) => res.data,
      invalidatesTags: ['AdminUsers'],
    }),
    deleteAdminUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin-users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminUsers'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} = adminUsersApi;
