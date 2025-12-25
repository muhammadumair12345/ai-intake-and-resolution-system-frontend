import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const ticketSchema = z.object({
  guestEmail: z.string().email("Invalid email address"),
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  initialMessage: z.string().min(10, "Message must be at least 10 characters"),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
