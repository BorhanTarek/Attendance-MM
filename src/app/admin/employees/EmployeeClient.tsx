"use client";

import { useState } from "react";
import { Plus, Users, X, Trash2, Edit2, Smartphone } from "lucide-react";
import { createEmployee, updateEmployee, deleteEmployee, resetDevice } from "./actions";

export default function EmployeeClient({ employees, locations }: { employees: any[], locations: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openCreate() {
    setEditingEmployee(null);
    setIsOpen(true);
  }

  function openEdit(emp: any) {
    setEditingEmployee(emp);
    setIsOpen(true);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(id);
    }
  }

  async function handleResetDevice(id: string) {
    if (confirm("Are you sure you want to reset the registered device for this employee? They will need to register their biometric again on their new device.")) {
      await resetDevice(id);
      alert("Device reset successfully.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
      } else {
        await createEmployee(formData);
      }
      setIsOpen(false);
    } catch (error) {
      alert("Failed to save employee. Email might already exist.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500 mt-1">Manage all user accounts, roles, and branch assignments.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned Branch</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                      <Users className="w-4 h-4" />
                    </div>
                    {emp.name}
                  </td>
                  <td className="px-6 py-4">{emp.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {emp.assignedLocation ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {emp.assignedLocation.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        All Branches
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {emp.registeredDeviceId && (
                      <button onClick={() => handleResetDevice(emp.id)} className="text-amber-600 hover:text-amber-800 font-medium inline-flex items-center gap-1" title="Reset registered device">
                        <Smartphone className="w-3 h-3" /> Reset Device
                      </button>
                    )}
                    <button onClick={() => openEdit(emp)} className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" name="name" defaultValue={editingEmployee?.name || ""} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input required type="email" name="email" defaultValue={editingEmployee?.email || ""} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" name="password" required={!editingEmployee} placeholder={editingEmployee ? "Leave blank to keep current password" : ""} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select name="role" defaultValue={editingEmployee?.role || "EMPLOYEE"} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Branch</label>
                <select name="locationId" defaultValue={editingEmployee?.assignedLocationId || "ALL"} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
                  <option value="ALL">Any Location (Admins should use this)</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
