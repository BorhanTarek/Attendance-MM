"use client";

import { useState } from "react";
import { Plus, X, MapPin } from "lucide-react";
import { createLocation, updateLocation, deleteLocation } from "./actions";

export default function LocationClient({ locations }: { locations: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  function openCreate() {
    setEditingLocation(null);
    setIsOpen(true);
  }

  function openEdit(loc: any) {
    setEditingLocation(loc);
    setIsOpen(true);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this location?")) {
      await deleteLocation(id);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData);
      } else {
        await createLocation(formData);
      }
      setIsOpen(false);
    } catch (error) {
      alert("Failed to save location. Check the inputs.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Locations</h1>
          <p className="text-slate-500 mt-1">Manage company office locations and geofences.</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 break-words">{loc.name}</h3>
            <div className="mt-2 text-sm text-slate-500 space-y-1 flex-grow">
              <p>Lat: {loc.latitude}</p>
              <p>Lng: {loc.longitude}</p>
              <p>Radius: <span className="font-medium text-slate-700">{loc.radius}m</span></p>
            </div>
            <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100 shrink-0">
              <button onClick={() => openEdit(loc)} className="text-sm font-medium text-primary-600 hover:text-primary-700">Edit</button>
              <button onClick={() => handleDelete(loc.id)} className="text-sm font-medium text-red-600 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingLocation ? "Edit Branch" : "Add New Branch"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                <input required type="text" name="name" defaultValue={editingLocation?.name || ""} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="e.g. Headquarters" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                  <input required type="number" step="any" name="latitude" defaultValue={editingLocation?.latitude || ""} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="40.7128" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                  <input required type="number" step="any" name="longitude" defaultValue={editingLocation?.longitude || ""} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="-74.0060" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Geofence Radius (meters)</label>
                <input required type="number" name="radius" defaultValue={editingLocation?.radius || 100} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
