"use client";

import {
  useGetTicketByIdQuery,
  useUpdateTicketMutation,
} from "@/lib/redux/api/ticketApi";
import { useGetMessagesQuery } from "@/lib/redux/api/messageApi";
import { useGetManagersQuery } from "@/lib/redux/api/userApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { TicketThread } from "@/components/tickets/TicketThread";
import { ReplyForm } from "@/components/forms/ReplyForm";
import { getStatusColor, getPriorityColor, formatDate, cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  BrainCircuit,
  UserCog,
  Tag,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

export function TicketDetailView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const { data: ticketRes, isLoading: ticketLoading } =
    useGetTicketByIdQuery(id);
  const { data: messagesRes, isLoading: messagesLoading } = useGetMessagesQuery(
    id,
    {
      pollingInterval: 10000,
    }
  );
  const { data: managersRes } = useGetManagersQuery();
  const { data: categoriesRes } = useGetCategoriesQuery();

  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();

  if (ticketLoading || messagesLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const ticket = ticketRes?.data;
  const messages = messagesRes?.data || [];
  const managers = managersRes?.data || [];
  const categories = categoriesRes?.data || [];

  if (!ticket)
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center py-20">
        <CardTitle>Ticket Not Found</CardTitle>
        <Button variant="outline" asChild>
          <Link
            href={`/${user?.role === "ADMIN" ? "admin" : "manager"}/tickets`}
          >
            Back to Queue
          </Link>
        </Button>
      </div>
    );

  const handleUpdate = async (field: string, value: string) => {
    try {
      await updateTicket({
        id: ticket.id,
        data: { [field]: value },
      }).unwrap();
      toast.success(
        `${field.charAt(0).toUpperCase() + field.slice(1)} updated`
      );
    } catch (error) {
      toast.error("Failed to update ticket");
    }
  };

  const markResolved = () => handleUpdate("status", "RESOLVED");

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight truncate max-w-[300px] md:max-w-md">
            {ticket.subject}
          </h1>
          <p className="text-xs text-muted-foreground">
            Ticket #{ticket.id.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left Column: Conversation */}
        <div className="lg:col-span-2 flex flex-col h-[600px] md:h-full overflow-hidden">
          <Card className="flex flex-col flex-1 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 py-3">
              <div>
                <CardTitle className="text-sm font-bold">
                  Conversation
                </CardTitle>
                <CardDescription className="text-xs">
                  With {ticket.guestName}
                </CardDescription>
              </div>
              {ticket.status !== "RESOLVED" && (
                <Button
                  onClick={markResolved}
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-600 hover:bg-green-50 h-8"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Resolve
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
              <TicketThread messages={messages} currentUserId={user?.id} />
            </CardContent>
            <div className="p-4 md:p-6 border-t bg-background">
              <ReplyForm
                ticketId={ticket.id}
                senderType={user?.role === "ADMIN" ? "ADMIN" : "MANAGER"}
                senderName={user?.name}
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Metadata & AI Insights */}
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* AI Insights */}
          <Card className="border-primary bg-primary/10 shadow-sm overflow-hidden">
            <div className="h-1 bg-primary w-full" />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
                <BrainCircuit className="w-4 h-4" />
                AI Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                  Predicted Intent
                </p>
                <p className="text-sm font-semibold">
                  {ticket.aiIntent || "Analyzing..."}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                  Confidence Score
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-primary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${(ticket.aiConfidence || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {((ticket.aiConfidence || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Assignment */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest">
                Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <UserCog className="w-3 h-3" /> Assigned To
                </label>
                <Select
                  disabled={user?.role !== "ADMIN"}
                  defaultValue={ticket.assignedToId || "unassigned"}
                  onValueChange={(val) => handleUpdate("assignedToId", val)}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Category
                </label>
                <Select
                  defaultValue={ticket.categoryId || "none"}
                  onValueChange={(val) => handleUpdate("categoryId", val)}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Status
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "w-full justify-center h-7",
                      getStatusColor(ticket.status)
                    )}
                  >
                    {ticket.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Priority
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "w-full justify-center h-7",
                      getPriorityColor(ticket.priority)
                    )}
                  >
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest">
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                  Name
                </p>
                <p className="font-semibold">{ticket.guestName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                  Email
                </p>
                <p className="font-medium truncate text-xs">
                  {ticket.guestEmail}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                  Created At
                </p>
                <p className="font-medium text-xs text-muted-foreground">
                  {formatDate(ticket.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
