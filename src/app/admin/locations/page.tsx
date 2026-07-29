import { prisma } from "@/lib/prisma";
import LocationClient from "./LocationClient";

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <LocationClient locations={locations} />
    </div>
  );
}
