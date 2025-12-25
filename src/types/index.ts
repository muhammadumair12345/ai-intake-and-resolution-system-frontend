export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "GUEST";
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  uniqueToken: string;
  guestEmail: string;
  guestName: string;
  subject: string;
  initialMessage: string;
  categoryId?: string;
  assignedToId?: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  aiConfidence?: number;
  aiIntent?: string;
  escalatedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

export interface Message {
  id: string;
  ticketId: string;
  content: string;
  senderType: "GUEST" | "MANAGER" | "ADMIN" | "SYSTEM";
  senderId?: string;
  senderName: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    details?: unknown;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  status?: Ticket["status"];
  priority?: Ticket["priority"];
  categoryId?: string;
  assignedToId?: string;
}
