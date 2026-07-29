"use client";

import { useState } from "react";
import { Download, Search, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function LogsClient({ initialLogs }: { initialLogs: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [logs, setLogs] = useState(initialLogs);

  // Extract unique locations for the team/location filter dropdown
  const uniqueTeams = Array.from(new Set(initialLogs.map(log => log.location.name))).sort();

  const filteredLogs = logs.filter(log => {
    // 1. Search text (Employee name)
    const matchesSearch = log.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Team (Location)
    const matchesTeam = filterTeam ? log.location.name === filterTeam : true;
    
    // 3. Date
    let matchesDate = true;
    if (filterDate) {
      const logDate = format(new Date(log.checkInTime), "yyyy-MM-dd");
      matchesDate = logDate === filterDate;
    }
    
    return matchesSearch && matchesTeam && matchesDate;
  });

  const exportCSV = () => {
    const headers = ["Employee Name", "Location", "Check In Time", "Check Out Time", "Status", "Distance (m)", "Check In Lat", "Check In Lng", "Check Out Lat", "Check Out Lng"];
    
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => {
        const checkIn = format(new Date(log.checkInTime), "yyyy-MM-dd HH:mm:ss");
        const checkOut = log.checkOutTime ? format(new Date(log.checkOutTime), "yyyy-MM-dd HH:mm:ss") : "N/A";
        const distance = Math.round(log.distanceMeters);
        
        return [
          `"${log.user.name}"`,
          `"${log.location.name}"`,
          checkIn,
          checkOut,
          log.status,
          distance,
          log.checkInLat || "",
          log.checkInLng || "",
          log.checkOutLat || "",
          log.checkOutLng || ""
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          {/* Text Search */}
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search employee..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Team / Location Filter */}
          <select 
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-700 w-full sm:w-auto"
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
          >
            <option value="">All Teams/Branches</option>
            {uniqueTeams.map((team: any) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>

          {/* Date Filter */}
          <div className="relative w-full sm:w-auto">
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-slate-700"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-sm font-medium transition-colors w-full sm:w-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => {
                let duration = "-";
                if (log.checkOutTime) {
                  const diffMs = new Date(log.checkOutTime).getTime() - new Date(log.checkInTime).getTime();
                  const diffMins = Math.round(diffMs / 60000);
                  const hours = Math.floor(diffMins / 60);
                  const mins = diffMins % 60;
                  duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                }

                // Determine what to show in Device column
                let deviceDisplay = log.checkInDevice || "-";
                if (log.checkOutDevice && log.checkOutDevice !== log.checkInDevice) {
                  deviceDisplay = `In: ${log.checkInDevice} / Out: ${log.checkOutDevice}`;
                }

                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{log.user.name}</td>
                    <td className="px-4 py-3 truncate max-w-[120px]" title={log.location.name}>{log.location.name}</td>
                    <td className="px-4 py-3">
                      <div className="whitespace-nowrap">{format(new Date(log.checkInTime), "MMM d, HH:mm")}</div>
                      {log.checkInLat && (
                        <a href={`https://maps.google.com/?q=${log.checkInLat},${log.checkInLng}`} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline block mt-0.5">
                          Map ↗
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.checkOutTime ? (
                        <>
                          <div className="whitespace-nowrap">{format(new Date(log.checkOutTime), "MMM d, HH:mm")}</div>
                          {log.checkOutLat && (
                            <a href={`https://maps.google.com/?q=${log.checkOutLat},${log.checkOutLng}`} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline block mt-0.5">
                              Map ↗
                            </a>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[150px] truncate" title={deviceDisplay}>{deviceDisplay}</td>
                    <td className="px-4 py-3 font-medium text-slate-600">{duration}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status === 'OUT_OF_BOUNDS' ? 'OOB' : log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{Math.round(log.distanceMeters)}m</td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No attendance logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
