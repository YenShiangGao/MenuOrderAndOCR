"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  UtensilsCrossed,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/server/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "首頁", icon: LayoutDashboard },
  { href: "/admin/menu/categories", label: "菜單分類", icon: FolderTree },
  { href: "/admin/menu/items", label: "菜品", icon: UtensilsCrossed },
];

const roleLabel: Record<string, string> = {
  OWNER: "老闆",
  MANAGER: "店長",
  STAFF: "員工",
};

export function AdminSidebar({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      <div className="border-b p-6">
        <h2 className="font-bold">餐廳後台</h2>
        <p className="mt-2 text-xs text-muted-foreground">{email}</p>
        <p className="text-xs text-muted-foreground">
          {roleLabel[role] ?? role}
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="border-t p-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <LogOut className="size-4" />
          登出
        </button>
      </form>
    </aside>
  );
}
