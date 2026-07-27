import { prisma } from "@/lib/prisma";
import { Users, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";

export default async function AdminDashboardPage() {
  const [employeeCount, locationCount, logsCount, outOfBoundsCount] = await Promise.all([
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.location.count(),
    prisma.attendanceLog.count({ where: { status: "SUCCESS" } }),
    prisma.attendanceLog.count({ where: { status: "OUT_OF_BOUNDS" } }),
  ]);

  const stats = [
    { name: "Total Employees", value: employeeCount, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Office Locations", value: locationCount, icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-100" },
    { name: "Successful Check-ins", value: logsCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
    { name: "Failed Attempts", value: outOfBoundsCount, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Quick stats and summary for GeoAttend.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      {/* You could add charts or recent activity lists here */}
    </div>
  );
}
