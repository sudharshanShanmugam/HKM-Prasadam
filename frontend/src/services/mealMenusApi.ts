import { baseApi } from './api';
import type { ApiResponse, MealMenu, MealMenuMap, MenuMap } from '@/types';

export const mealMenusApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** Returns { 'YYYY-MM-DD': MealMenuMap } */
    getMealMenus: builder.query<MenuMap, void>({
      query: () => '/meal-menus',
      transformResponse: (res: ApiResponse<MenuMap>) => res.data,
      providesTags: [{ type: 'MealMenu', id: 'MAP' }],
    }),

    getMealMenuByDate: builder.query<MealMenu, string>({
      query: (date) => `/meal-menus/${date}`,
      transformResponse: (res: ApiResponse<MealMenu>) => res.data,
      providesTags: (_result, _err, date) => [{ type: 'MealMenu', id: date }],
    }),

    saveMealMenu: builder.mutation<MealMenu, { date: string; meals: MealMenuMap }>({
      query: ({ date, meals }) => ({
        url: `/meal-menus/${date}`,
        method: 'PUT',
        body: { meals },
      }),
      transformResponse: (res: ApiResponse<MealMenu>) => res.data,
      invalidatesTags: (_result, _err, { date }) => [
        { type: 'MealMenu', id: date },
        { type: 'MealMenu', id: 'MAP' },
      ],
    }),

    deleteMealMenu: builder.mutation<void, string>({
      query: (date) => ({
        url: `/meal-menus/${date}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, date) => [
        { type: 'MealMenu', id: date },
        { type: 'MealMenu', id: 'MAP' },
      ],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetMealMenusQuery,
  useGetMealMenuByDateQuery,
  useSaveMealMenuMutation,
  useDeleteMealMenuMutation,
} = mealMenusApi;
