import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientSidebar } from "@/components/layout/client-sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  // Admin users must use /admin, not /cliente
  if (session.user.role === "ADMIN") redirect("/admin");

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <ClientSidebar />
        <main className="pl-[240px] transition-all duration-200">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
