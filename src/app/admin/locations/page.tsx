import { prisma } from "@/lib/prisma";
import { MapPin } from "lucide-react";
import AddLocationButton from "./AddLocationButton";

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Locations</h1>
          <p className="text-slate-500 mt-1">Manage company office locations and geofences.</p>
        </div>
        <AddLocationButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{loc.name}</h3>
            <div className="mt-2 text-sm text-slate-500 space-y-1">
              <p>Lat: {loc.latitude}</p>
              <p>Lng: {loc.longitude}</p>
              <p>Radius: <span className="font-medium text-slate-700">{loc.radius}m</span></p>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Edit</button>
              <button className="text-sm font-medium text-red-600 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
