import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HistoryCalendar from "@/components/HistoryCalendar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

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
      <header className="bg-white border-b border-slate-200 px-6 pb-4 pt-10 sm:pt-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Attendance History</h2>
              <p className="text-xs text-slate-500">
                View all your past check-ins and check-outs
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 relative">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary-100/50 blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 mt-6">
          <HistoryCalendar logs={allLogs} />
        </div>
      </main>
    </div>
  );
}
