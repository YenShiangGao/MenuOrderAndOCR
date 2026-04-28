import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.email || !session.role) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar email={session.email} role={session.role} />
      <main className="flex-1 p-8">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
