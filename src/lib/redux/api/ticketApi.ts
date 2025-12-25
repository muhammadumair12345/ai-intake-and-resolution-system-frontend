import { baseApi } from "./baseApi";
import type { Ticket, ApiResponse, PaginationParams } from "@/types";

interface CreateTicketRequest {
  guestEmail: string;
  guestName: string;
  subject: string;
  initialMessage: string;
}

interface CheckDuplicatesRequest {
  guestEmail: string;
  subject: string;
  message: string;
}

interface DuplicateCheckResponse {
  hasDuplicates: boolean;
  similarTickets: Array<{
    id: string;
    subject: string;
    similarity: number;
  }>;
}

interface UpdateTicketRequest {
  status?: Ticket["status"];
  priority?: Ticket["priority"];
  assignedToId?: string;
  categoryId?: string;
}

export const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTicket: builder.mutation<ApiResponse<Ticket>, CreateTicketRequest>({
      query: (data) => ({
        url: "/tickets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tickets"],
    }),
    checkDuplicates: builder.mutation<
      ApiResponse<DuplicateCheckResponse>,
      CheckDuplicatesRequest
    >({
      query: (data) => ({
        url: "/tickets/check-duplicates",
        method: "POST",
        body: data,
      }),
    }),
    getTickets: builder.query<
      ApiResponse<Ticket[]>,
      PaginationParams | undefined
    >({
      query: (params) => ({
        url: "/tickets",
        params,
      }),
      providesTags: ["Tickets"],
    }),
    getTriageQueue: builder.query<
      ApiResponse<Ticket[]>,
      PaginationParams | undefined
    >({
      query: (params) => ({
        url: "/tickets/triage",
        params,
      }),
      providesTags: ["Tickets"],
    }),
    getTicketById: builder.query<ApiResponse<Ticket>, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (result, error, id) => [{ type: "Tickets", id }],
    }),
    getTicketByToken: builder.query<ApiResponse<Ticket>, string>({
      query: (token) => `/tickets/token/${token}`,
      providesTags: (result, error, token) => [{ type: "Tickets", id: token }],
    }),
    updateTicket: builder.mutation<
      ApiResponse<Ticket>,
      { id: string; data: UpdateTicketRequest }
    >({
      query: ({ id, data }) => ({
        url: `/tickets/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Tickets", id },
        "Tickets",
      ],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useCheckDuplicatesMutation,
  useGetTicketsQuery,
  useGetTriageQueueQuery,
  useGetTicketByIdQuery,
  useGetTicketByTokenQuery,
  useUpdateTicketMutation,
} = ticketApi;
