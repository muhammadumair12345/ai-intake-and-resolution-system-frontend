"use client";

import {
  useGetUsersQuery,
  useCreateUserMutation,
} from "@/lib/redux/api/userApi";
import { DataTable } from "@/components/shared/DataTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, UserPlus, Loader2, Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { User, PaginationParams } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/lib/hooks/useDebounce";

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Full Name",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email Address",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "ADMIN" ? "default" : "secondary"}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
  },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Params
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  // Local State
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync Search
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateUrl({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const updateUrl = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const queryParams: PaginationParams = {
    page,
    limit,
    search: search || undefined,
    sort,
    order: order as "asc" | "desc",
  };

  const { data: usersRes, isLoading, isError } = useGetUsersQuery(queryParams);
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const users = usersRes?.data || [];
  const meta = usersRes?.pagination;

  // Pagination & Sorting Handlers
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

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "MANAGER" as "ADMIN" | "MANAGER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error("All fields are required");
    }

    try {
      await createUser(formData).unwrap();
      toast.success("User created successfully");
      setOpen(false);
      setFormData({ name: "", email: "", password: "", role: "MANAGER" });
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      toast.error(apiError.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Manage administrators and support managers."
        icon={Users}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Invite New Staff</DialogTitle>
                  <DialogDescription>
                    Create a new account for a manager or administrator.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          role: val as "ADMIN" | "MANAGER",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="ADMIN">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Create Account
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle>System Users</CardTitle>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9 h-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    router.push(pathname);
                  }}
                  className="h-9 px-2"
                >
                  <FilterX className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Showing {meta?.total || 0} staff members per page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={userColumns}
            data={users}
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
