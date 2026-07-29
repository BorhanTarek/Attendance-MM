import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { ShieldCheck, MapPin, Users, ClipboardList, LayoutDashboard, CheckSquare, CalendarDays } from "lucide-react";
import Image from "next/image";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Locations", href: "/admin/locations", icon: MapPin },
    { name: "Users", href: "/admin/employees", icon: Users },
    { name: "Schedules", href: "/admin/schedules", icon: CalendarDays },
    { name: "Attendance Logs", href: "/admin/logs", icon: ClipboardList },
    { name: "Check In / Out", href: "/dashboard", icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 tracking-tight">GeoAttend</h1>
            <p className="text-xs text-slate-500 font-medium">Admin Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors font-medium text-sm group"
            >
              <item.icon className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-slate-700 truncate">{session.user.name}</p>
            <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
            <h1 className="font-bold text-slate-800">Admin Portal</h1>
          </div>
          <LogoutButton />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
