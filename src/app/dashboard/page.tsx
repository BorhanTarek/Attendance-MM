import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AttendanceCard from "@/components/AttendanceCard";
import HistoryCalendar from "@/components/HistoryCalendar";
import { LogOut, User as UserIcon } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
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

  // Fetch ALL logs for the user to display in the Calendar
  const allLogs = await prisma.attendanceLog.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      location: true,
    },
    orderBy: {
      checkInTime: "desc",
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <UserIcon className="text-primary-600 w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">{session.user.name}</h2>
            <p className="text-xs text-slate-500">Employee Dashboard</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <main className="flex-1 p-6 relative">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary-100/50 blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-8 mt-10">
          <div className="max-w-md mx-auto">
            <AttendanceCard isActive={isActive} latestLog={latestLog} />
          </div>
          
          <HistoryCalendar logs={allLogs} />
        </div>
      </main>
    </div>
  );
}
