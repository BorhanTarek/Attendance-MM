import { prisma } from "@/lib/prisma";
import ScheduleClient from "./ScheduleClient";

export default async function SchedulesPage() {
  const [schedules, users] = await Promise.all([
    prisma.schedule.findMany({
      include: {
        user: true,
      },
      orderBy: {
        date: "desc",
      },
    }),
    prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Employee Schedules</h1>
        <p className="text-slate-500 mt-1">Manage individual shifts or bulk upload schedules via CSV.</p>
      </div>

      <ScheduleClient schedules={schedules} users={users} />
    </div>
  );
}
