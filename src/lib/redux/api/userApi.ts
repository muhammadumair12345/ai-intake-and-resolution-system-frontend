import { baseApi } from "./baseApi";
import type { User, ApiResponse, PaginationParams } from "@/types";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<User[]>, PaginationParams | void>({
      query: (params) => ({
        url: "/users",
        params: params || undefined,
      }),
      providesTags: ["Users"],
    }),
    getManagers: builder.query<ApiResponse<User[]>, void>({
      query: () => "/users/managers",
      providesTags: ["Users"],
    }),
    createUser: builder.mutation<
      ApiResponse<User>,
      Partial<User> & { password?: string }
    >({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetUsersQuery, useGetManagersQuery, useCreateUserMutation } =
  userApi;
