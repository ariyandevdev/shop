import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/AdminSidebar";
import { NotificationsWidget } from "@/components/NotificationsWidget";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin(); // Protect entire admin section

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="flex items-center justify-end mb-4">
          <NotificationsWidget />
        </div>
        {children}
      </main>
    </div>
  );
}
