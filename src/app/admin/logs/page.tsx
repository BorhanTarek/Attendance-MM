import { prisma } from "@/lib/prisma";
import LogsClient from "./LogsClient";

export default async function LogsPage() {
  const logs = await prisma.attendanceLog.findMany({
    orderBy: {
      checkInTime: "desc",
    },
    include: {
      user: true,
      location: true,
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Attendance Logs</h1>
        <p className="text-slate-500 mt-1">View and export employee check-in records.</p>
      </div>

      <LogsClient initialLogs={logs} />
    </div>
  );
}
