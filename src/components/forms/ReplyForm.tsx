"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageSchema, type MessageInput } from "@/lib/validations/schemas";
import {
  useCreateMessageMutation,
  useCreateMessageByTokenMutation,
} from "@/lib/redux/api/messageApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Send } from "lucide-react";

interface ReplyFormProps {
  ticketId: string;
  token?: string;
  senderType: "GUEST" | "MANAGER" | "ADMIN" | "SYSTEM";
  senderName?: string;
  onSuccess?: () => void;
}

export function ReplyForm({
  ticketId,
  token,
  senderType,
  senderName,
  onSuccess,
}: ReplyFormProps) {
  const [createMessage, { isLoading }] = useCreateMessageMutation();
  const [createMessageByToken, { isLoading: isTokenLoading }] =
    useCreateMessageByTokenMutation();

  const form = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: MessageInput) => {
    try {
      const payload = {
        content: data.content,
        senderType,
        senderName,
      };

      const response = token
        ? await createMessageByToken({ token, data: payload }).unwrap()
        : await createMessage({ ticketId, data: payload }).unwrap();

      if (response.success) {
        form.reset();
        toast.success("Reply sent");
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send reply");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Type your reply here..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || isTokenLoading} size="lg">
            {isLoading || isTokenLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Reply
          </Button>
        </div>
      </form>
    </Form>
  );
}
