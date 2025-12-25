import { baseApi } from "./baseApi";
import type { Message, ApiResponse } from "@/types";

interface CreateMessageRequest {
  content: string;
  senderType: "GUEST" | "MANAGER" | "ADMIN" | "SYSTEM";
  senderName?: string;
}

export const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMessage: builder.mutation<
      ApiResponse<Message>,
      { ticketId: string; data: CreateMessageRequest }
    >({
      query: ({ ticketId, data }) => ({
        url: `/messages/${ticketId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "Messages", id: ticketId },
        { type: "Tickets", id: ticketId },
      ],
    }),
    createMessageByToken: builder.mutation<
      ApiResponse<Message>,
      { token: string; data: CreateMessageRequest }
    >({
      query: ({ token, data }) => ({
        url: `/messages/token/${token}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { token }) => [
        { type: "Messages", id: token },
      ],
    }),
    getMessages: builder.query<ApiResponse<Message[]>, string>({
      query: (ticketId) => `/messages/${ticketId}`,
      providesTags: (result, error, ticketId) => [
        { type: "Messages", id: ticketId },
      ],
    }),
    getMessagesByToken: builder.query<ApiResponse<Message[]>, string>({
      query: (token) => `/messages/token/${token}`,
      providesTags: (result, error, token) => [{ type: "Messages", id: token }],
    }),
  }),
});

export const {
  useCreateMessageMutation,
  useCreateMessageByTokenMutation,
  useGetMessagesQuery,
  useGetMessagesByTokenQuery,
} = messageApi;
