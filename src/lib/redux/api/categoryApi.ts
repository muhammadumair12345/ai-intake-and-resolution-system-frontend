import { baseApi } from "./baseApi";
import type { Category, ApiResponse, PaginationParams } from "@/types";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<
      ApiResponse<Category[]>,
      PaginationParams | void
    >({
      query: (params) => ({
        url: "/categories",
        params: params || undefined,
      }),
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation<ApiResponse<Category>, Partial<Category>>({
      query: (data) => ({
        url: "/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const { useGetCategoriesQuery, useCreateCategoryMutation } = categoryApi;
