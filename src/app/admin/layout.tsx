import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="pl-[240px] transition-all duration-200">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
