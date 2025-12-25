"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { cn } from "@/lib/utils";
import { FolderTree, Inbox, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { name: "Triage Queue", href: "/admin/triage", icon: Inbox },
  { name: "All Tickets", href: "/admin/tickets", icon: Ticket },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Users", href: "/admin/users", icon: Users },
];

const managerLinks = [
  { name: "My Tickets", href: "/manager/tickets", icon: Inbox },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);

  const links = user?.role === "ADMIN" ? adminLinks : managerLinks;

  return (
    <aside className="w-64 border-r bg-muted/40 h-full hidden md:flex md:flex-col shrink-0 overflow-y-auto">
      <div className="flex flex-col h-full gap-2 p-4">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Ticket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">SupportFlow</span>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
