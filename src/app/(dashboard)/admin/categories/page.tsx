"use client";

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
} from "@/lib/redux/api/categoryApi";
import { useGetManagersQuery } from "@/lib/redux/api/userApi";
import { DataTable } from "@/components/shared/DataTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FolderTree, Plus, Loader2, Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { Category, PaginationParams } from "@/types";
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
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/lib/hooks/useDebounce";

import { PageHeader } from "@/components/shared/PageHeader";

const categoryColumns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Category Name",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate max-w-[300px] block">
        {row.original.description || "-"}
      </span>
    ),
  },
  {
    accessorKey: "manager.name",
    header: "Assigned Manager",
    cell: ({ row }) => <span>{row.original.manager?.name || "None"}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
  },
];

export default function AdminCategoriesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL Params
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") || "asc";

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

  const {
    data: categoriesRes,
    isLoading,
    isError,
  } = useGetCategoriesQuery(queryParams);
  const { data: managersRes } = useGetManagersQuery();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();

  const categories = categoriesRes?.data || [];
  const meta = categoriesRes?.pagination;

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    managerId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Category name is required");

    try {
      await createCategory({
        name: formData.name,
        description: formData.description,
        managerId:
          formData.managerId === "none" ? undefined : formData.managerId,
      }).unwrap();
      toast.success("Category created successfully");
      setOpen(false);
      setFormData({ name: "", description: "", managerId: "" });
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      toast.error(apiError.data?.message || "Failed to create category");
    }
  };

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Categories"
        description="Manage service areas and default manager assignments."
        icon={FolderTree}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                  <DialogDescription>
                    Define a new support area and assign a default manager.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Technical Support"
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
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of this area"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="manager">Default Manager</Label>
                    <Select
                      value={formData.managerId}
                      onValueChange={(val) =>
                        setFormData((prev) => ({ ...prev, managerId: val }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          None (Triage required)
                        </SelectItem>
                        {managersRes?.data?.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
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
                    Create Category
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
              <FolderTree className="w-5 h-5 text-primary" />
              <CardTitle>Category List</CardTitle>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
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
            Showing {meta?.total || 0} categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={categoryColumns}
            data={categories}
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
