"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ticket } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  getStatusColor,
  getPriorityColor,
  formatRelativeTime,
  cn,
} from "@/lib/utils";
import { ArrowUpRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground">
        #{row.original.id.slice(-6)}
      </span>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <div className="flex flex-col max-w-[300px]">
        <span className="font-semibold truncate">{row.original.subject}</span>
        <span className="text-xs text-muted-foreground truncate">
          {row.original.guestEmail}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className={getStatusColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={getPriorityColor(row.original.priority)}
      >
        {row.original.priority}
      </Badge>
    ),
  },
  {
    accessorKey: "aiConfidence",
    header: "AI Confidence",
    cell: ({ row }) => {
      const confidence = row.original.aiConfidence;
      if (confidence === undefined) return "-";
      return (
        <div className="flex items-center gap-2">
          <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                confidence > 0.8
                  ? "bg-green-500"
                  : confidence > 0.5
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium">
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-xs">
          {formatRelativeTime(row.original.createdAt)}
        </span>
        {row.original.escalatedAt && (
          <span className="text-[10px] text-red-500 flex items-center gap-0.5">
            <AlertCircle className="w-3 h-3" />
            Escalated
          </span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isAdmin =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin");
      return (
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/${isAdmin ? "admin" : "manager"}/tickets/${
              row.original.id
            }`}
          >
            <ArrowUpRight className="w-4 h-4 mr-1" />
            View
          </Link>
        </Button>
      );
    },
  },
];
