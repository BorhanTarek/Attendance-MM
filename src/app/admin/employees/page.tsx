import { prisma } from "@/lib/prisma";
import EmployeeClient from "./EmployeeClient";

export default async function EmployeesPage() {
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: { assignedLocation: true },
    orderBy: { createdAt: 'desc' }
  });

  const locations = await prisma.location.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <EmployeeClient employees={employees} locations={locations} />
    </div>
  );
}
