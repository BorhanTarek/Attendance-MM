"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createLocation } from "./actions";

export default function AddLocationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createLocation(formData);
      setIsOpen(false);
    } catch (error) {
      alert("Failed to add location. Check the inputs.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Location
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Add New Branch</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                <input required type="text" name="name" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="e.g. Headquarters" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                  <input required type="number" step="any" name="latitude" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="40.7128" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                  <input required type="number" step="any" name="longitude" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="-74.0060" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Geofence Radius (meters)</label>
                <input required type="number" name="radius" defaultValue="100" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
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
