import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { AuthHydrator } from "@/components/layout/auth-hydrator";
import { SWRProvider } from "@/lib/swr/provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRProvider>
      <AuthHydrator>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <Sidebar />
          <div className="md:ml-64 flex flex-col min-h-screen">
            <TopBar />
            <main className="flex-1 p-4 lg:p-8">{children}</main>
          </div>
        </div>
      </AuthHydrator>
    </SWRProvider>
  );
}
