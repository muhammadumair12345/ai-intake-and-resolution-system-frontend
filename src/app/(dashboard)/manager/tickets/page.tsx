"use client";

import { useState, useEffect } from "react";
import { useGetTicketsQuery } from "@/lib/redux/api/ticketApi";
import { DataTable } from "@/components/shared/DataTable";
import { ticketColumns } from "@/components/tickets/TicketColumns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Inbox, Search, FilterX } from "lucide-react";
import { Ticket, PaginationParams } from "@/types";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PaginationState, SortingState } from "@tanstack/react-table";

export default function ManagerTicketsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read params from URL
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";
  const status = searchParams.get("status") || "all";
  const priority = searchParams.get("priority") || "all";
  const search = searchParams.get("search") || "";

  // Local state for search input to allow debouncing
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateUrl({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const queryParams: PaginationParams = {
    page,
    limit,
    sort,
    order: order as "asc" | "desc",
    search: search || undefined,
    status: status === "all" ? undefined : (status as Ticket["status"]),
    priority: priority === "all" ? undefined : (priority as Ticket["priority"]),
  };

  const {
    data: ticketsRes,
    isLoading,
    isError,
  } = useGetTicketsQuery(queryParams);

  const tickets = ticketsRes?.data || [];
  const meta = ticketsRes?.pagination;

  // Helper to update URL params
  const updateUrl = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // DataTable handlers
  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize: limit,
  };

  const sorting: SortingState = [
    {
      id: sort,
      desc: order === "desc",
    },
  ];

  const handlePaginationChange = (updater: any) => {
    const nextState =
      typeof updater === "function" ? updater(pagination) : updater;
    updateUrl({
      page: nextState.pageIndex + 1,
      limit: nextState.pageSize,
    });
  };

  const handleSortingChange = (updater: any) => {
    const nextState =
      typeof updater === "function" ? updater(sorting) : updater;
    if (nextState.length > 0) {
      updateUrl({
        sort: nextState[0].id,
        order: nextState[0].desc ? "desc" : "asc",
      });
    } else {
      updateUrl({ sort: undefined, order: undefined });
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tickets"
        description="Manage and resolve your assigned support requests."
        icon={Inbox}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" />
              <CardTitle>Assigned Queue</CardTitle>
            </div>

            <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ID, Email, Subject..."
                  className="pl-9 h-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <Select
                value={status}
                onValueChange={(val) => updateUrl({ status: val, page: 1 })}
              >
                <SelectTrigger className="w-full md:w-[140px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={priority}
                onValueChange={(val) => updateUrl({ priority: val, page: 1 })}
              >
                <SelectTrigger className="w-full md:w-[140px] h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>

              {(search || status !== "all" || priority !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 px-2"
                >
                  <FilterX className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Showing {meta?.total || 0} tickets currently assigned to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={ticketColumns}
            data={tickets}
            isLoading={isLoading}
            isError={isError}
            pageCount={meta?.totalPages}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            sorting={sorting}
            onSortingChange={handleSortingChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
