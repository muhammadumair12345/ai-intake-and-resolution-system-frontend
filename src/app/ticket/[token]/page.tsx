"use client";

import { useGetTicketByTokenQuery } from "@/lib/redux/api/ticketApi";
import { useGetMessagesByTokenQuery } from "@/lib/redux/api/messageApi";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { TicketThread } from "@/components/tickets/TicketThread";
import { ReplyForm } from "@/components/forms/ReplyForm";
import { getStatusColor, getPriorityColor, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function GuestTicketViewPage() {
  const { token } = useParams<{ token: string }>();

  const { data: ticketRes, isLoading: ticketLoading } =
    useGetTicketByTokenQuery(token);
  const { data: messagesRes, isLoading: messagesLoading } =
    useGetMessagesByTokenQuery(token, {
      pollingInterval: 10000, // Refresh every 10s for new replies
    });

  if (ticketLoading || messagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const ticket = ticketRes?.data;
  const messages = messagesRes?.data || [];

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Ticket Not Found</h1>
        <p className="text-muted-foreground">
          This ticket link might be invalid or expired.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Ticket Header */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>ID: {ticket.id}</span>
                  <span>•</span>
                  <span>Created {formatDate(ticket.createdAt)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className={getStatusColor(ticket.status)}
                >
                  {ticket.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={getPriorityColor(ticket.priority)}
                >
                  {ticket.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Requester</p>
                <p className="font-medium">
                  {ticket.guestName} ({ticket.guestEmail})
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">
                  {ticket.category?.name || "Unassigned"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversation */}
        <Card className="flex flex-col min-h-[500px]">
          <CardHeader>
            <CardTitle className="text-xl">Conversation Thread</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            <TicketThread messages={messages} guestMode={true} />
          </CardContent>
          <Separator />
          <div className="p-6 bg-background">
            <ReplyForm
              ticketId={ticket.id}
              senderType="GUEST"
              senderName={ticket.guestName}
            />
          </div>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            Please keep this URL private. It is your unique link to access this
            ticket.
          </p>
        </div>
      </div>
    </div>
  );
}
