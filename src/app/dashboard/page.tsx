import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AttendanceCard from "@/components/AttendanceCard";
import { LogOut, User as UserIcon, CalendarDays, ArrowRight } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Find today's latest log for the Check-In Card
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const latestLog = await prisma.attendanceLog.findFirst({
    where: {
      userId: session.user.id,
      checkInTime: {
        gte: startOfDay,
      },
    },
    orderBy: {
      checkInTime: "desc",
    },
    include: {
      location: true,
    }
  });

  const isActive = latestLog?.status === "SUCCESS" && !latestLog.checkOutTime;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 sticky top-0 z-10">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
            <UserIcon className="text-primary-600 w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-800 truncate">{session.user.name}</h2>
            <p className="text-xs text-slate-500 truncate">
              {session.user.role === "ADMIN" ? "Admin Dashboard" : "Employee Dashboard"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {session.user.role === "ADMIN" && (
            <a href="/admin" className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-1 sm:flex-none text-center">
              Admin Panel &rarr;
            </a>
          )}
          <div className="flex-1 sm:flex-none">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 relative flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary-100/50 blur-3xl" />
        </div>
        
        <div className="w-full max-w-md relative z-10 space-y-6">
          <AttendanceCard isActive={isActive} latestLog={latestLog} />

          <Link href="/dashboard/history" className="glass-panel p-5 rounded-2xl flex items-center justify-between group hover:bg-white/60 transition-colors border border-white/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Attendance History</h3>
                <p className="text-sm text-slate-500">View your past check-ins</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </main>
    </div>
  );
}
