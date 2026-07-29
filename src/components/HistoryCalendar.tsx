"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function HistoryCalendar({ logs }: { logs: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Create a map for quick log lookup by day
  const logsByDay = new Map();
  logs.forEach(log => {
    const dateStr = format(new Date(log.checkInTime), 'yyyy-MM-dd');
    if (!logsByDay.has(dateStr)) {
      logsByDay.set(dateStr, []);
    }
    logsByDay.get(dateStr).push(log);
  });

  return (
    <div className="glass-panel p-8 rounded-3xl mt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Attendance History</h2>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <span className="font-semibold text-lg text-slate-700 min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-semibold text-slate-500">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayLogs = logsByDay.get(dateStr) || [];
          const mainLog = dayLogs.find((l: any) => l.status === "SUCCESS") || dayLogs[0];
          
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);

          let bgClass = "bg-slate-50 hover:bg-slate-100 text-slate-700";
          let dotClass = "";

          if (mainLog) {
            if (mainLog.status === "SUCCESS") {
              bgClass = "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200";
              dotClass = "bg-emerald-500";
            } else {
              bgClass = "bg-red-50 hover:bg-red-100 text-red-800 border-red-200";
              dotClass = "bg-red-500";
            }
          }

          if (!isCurrentMonth) {
            bgClass = "bg-slate-50/50 text-slate-300";
          }

          return (
            <div 
              key={day.toString()}
              onClick={() => mainLog && setSelectedLog(mainLog)}
              className={`relative h-20 rounded-xl border border-transparent p-2 transition-all ${
                mainLog ? "cursor-pointer active:scale-95 shadow-sm" : ""
              } ${bgClass} ${isDayToday && !mainLog ? 'ring-2 ring-primary-400 ring-offset-2' : ''}`}
            >
              <div className="font-medium text-sm">{format(day, 'd')}</div>
              {mainLog && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className={`w-2 h-2 rounded-full ${dotClass} mx-auto mb-1`}></div>
                  <div className="text-[10px] text-center font-medium truncate opacity-70">
                    {format(new Date(mainLog.checkInTime), 'h:mm a')}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedLog && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-6 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedLog.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedLog.status}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {format(new Date(selectedLog.checkInTime), 'EEEE, MMMM do, yyyy')}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span className="font-medium w-20">Check In:</span> 
                  {format(new Date(selectedLog.checkInTime), 'h:mm:ss a')}
                </div>
                {selectedLog.checkOutTime && (
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium w-20">Check Out:</span> 
                    {format(new Date(selectedLog.checkOutTime), 'h:mm:ss a')}
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="font-medium w-20">Location:</span> 
                  {selectedLog.location?.name || 'Unknown'} 
                  <span className="text-xs text-slate-400 ml-1">({selectedLog.distanceMeters.toFixed(1)}m away)</span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-lg">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
