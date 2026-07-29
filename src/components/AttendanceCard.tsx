"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AttendanceCard({ isActive, latestLog }: { isActive: boolean, latestLog: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'idle' | 'success' | 'error', message: string}>({ type: 'idle', message: '' });

  const handleAction = async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    if (!navigator.geolocation) {
      setStatus({ type: 'error', message: 'Geolocation is not supported by your browser.' });
      setLoading(false);
      return;
    }

    if (isActive) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const res = await fetch('/api/attendance/check-out', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ latitude, longitude })
            });
            const data = await res.json();
            
            if (res.ok) {
              setStatus({ type: 'success', message: data.message });
              setTimeout(() => { router.refresh(); }, 1500);
            } else {
              setStatus({ type: 'error', message: data.error });
            }
          } catch (err) {
            setStatus({ type: 'error', message: 'Something went wrong.' });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setStatus({ type: 'error', message: 'Location access denied or unavailable. Please enable GPS.' });
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // Check-in requires location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const res = await fetch('/api/attendance/check-in', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ latitude, longitude })
            });
            const data = await res.json();

            if (res.ok) {
              setStatus({ type: 'success', message: data.message });
              setTimeout(() => { router.refresh(); }, 1500);
            } else {
              setStatus({ type: 'error', message: data.error });
            }
          } catch (err) {
            setStatus({ type: 'error', message: 'Something went wrong.' });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setStatus({ type: 'error', message: 'Location access denied or unavailable. Please enable GPS.' });
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const formattedTime = latestLog?.checkInTime 
    ? new Date(latestLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : null;

  return (
    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-500" />
      )}
      
      <div className="flex flex-col items-center text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl transition-colors duration-500 ${isActive ? 'bg-gradient-to-tr from-emerald-500 to-green-400 shadow-emerald-500/30' : 'bg-gradient-to-tr from-primary-500 to-blue-400 shadow-primary-500/30'}`}>
          <MapPin className="text-white w-10 h-10" />
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          {isActive ? 'You are checked in' : 'Ready to work?'}
        </h3>
        
        {isActive && latestLog && (
          <p className="text-slate-500 flex items-center justify-center gap-1.5 mb-6">
            <Clock className="w-4 h-4" />
            Checked in at {formattedTime} &bull; {latestLog.location.name}
          </p>
        )}

        {!isActive && latestLog?.status === "OUT_OF_BOUNDS" && (
           <p className="text-amber-600 text-sm mb-6 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
             Last attempt: Out of bounds
           </p>
        )}

        <button
          onClick={handleAction}
          disabled={loading}
          className={`relative w-full py-4 rounded-2xl font-semibold text-lg text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-80 disabled:scale-100 overflow-hidden ${
            isActive 
              ? 'bg-slate-800 hover:bg-slate-700 shadow-slate-800/25' 
              : 'bg-gradient-to-r from-primary-600 to-blue-500 hover:from-primary-700 hover:to-blue-600 shadow-primary-500/30'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {isActive ? 'Checking out...' : 'Acquiring Location...'}
            </span>
          ) : (
            <span>{isActive ? 'Check Out' : 'Check In Now'}</span>
          )}
        </button>

        <AnimatePresence mode="wait">
          {status.type !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mt-6 p-4 rounded-xl flex items-start gap-3 text-left w-full ${
                status.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                  : 'bg-red-50 border border-red-100 text-red-700'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              )}
              <p className="text-sm font-medium leading-relaxed">{status.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
