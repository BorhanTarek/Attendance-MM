"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, CheckCircle2, XCircle, Clock, LogOut, Fingerprint, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { verifyBiometric } from "@/lib/biometric";
import PhotoCaptureModal from "./PhotoCaptureModal";

export default function AttendanceCard({ isActive, latestLog }: { isActive: boolean, latestLog: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'idle' | 'success' | 'error' | 'info', message: string}>({ type: 'idle', message: '' });
  
  // Local state for optimistic UI updates
  const [localIsActive, setLocalIsActive] = useState(isActive);
  const [localLog, setLocalLog] = useState(latestLog);

  // Photo capture state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    latitude: number;
    longitude: number;
    biometricVerified: boolean;
  } | null>(null);

  // Sync with server state if it changes externally
  useEffect(() => {
    setLocalIsActive(isActive);
    setLocalLog(latestLog);
  }, [isActive, latestLog]);

  const submitAttendance = async (
    latitude: number, 
    longitude: number, 
    biometricVerified: boolean, 
    photo?: string
  ) => {
    const endpoint = localIsActive ? '/api/attendance/check-out' : '/api/attendance/check-in';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, biometricVerified, photo })
      });
      const data = await res.json();

      if (res.ok) {
        setLocalIsActive(!localIsActive);
        setStatus({ type: 'success', message: data.message });
        
        if (!localIsActive) {
          setLocalLog({ checkInTime: new Date(), location: { name: 'Current Location' } });
        }

        setTimeout(() => { router.refresh(); }, 1500);
        setTimeout(() => { setStatus({ type: 'idle', message: '' }); }, 3000);
      } else {
        setStatus({ type: 'error', message: data.error });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    if (!navigator.geolocation) {
      setStatus({ type: 'error', message: 'Geolocation is not supported by your browser.' });
      setLoading(false);
      return;
    }

    // Step 1: Biometric verification
    setStatus({ type: 'info', message: 'Verifying identity...' });
    const biometricVerified = await verifyBiometric();
    
    if (!biometricVerified) {
      setStatus({ type: 'info', message: 'Biometric unavailable — proceeding without verification.' });
      await new Promise(r => setTimeout(r, 1000));
    }

    // Step 2: Get location
    setStatus({ type: 'info', message: 'Acquiring location...' });
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Step 3: Random photo check (~30% chance)
        const shouldTakePhoto = Math.random() < 0.3;
        
        if (shouldTakePhoto) {
          // Store pending data and show photo modal
          setPendingAction({ latitude, longitude, biometricVerified });
          setShowPhotoModal(true);
          setStatus({ type: 'info', message: 'Photo verification required...' });
        } else {
          // No photo needed — submit directly
          await submitAttendance(latitude, longitude, biometricVerified);
        }
      },
      (error) => {
        setStatus({ type: 'error', message: 'Location access denied or unavailable. Please enable GPS.' });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePhotoCapture = async (photoBase64: string) => {
    setShowPhotoModal(false);
    if (pendingAction) {
      await submitAttendance(
        pendingAction.latitude, 
        pendingAction.longitude, 
        pendingAction.biometricVerified, 
        photoBase64
      );
      setPendingAction(null);
    }
  };

  const handlePhotoSkip = async () => {
    setShowPhotoModal(false);
    if (pendingAction) {
      await submitAttendance(
        pendingAction.latitude, 
        pendingAction.longitude, 
        pendingAction.biometricVerified
      );
      setPendingAction(null);
    }
  };

  const formattedTime = localLog?.checkInTime 
    ? new Date(localLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : null;

  return (
    <>
      <div className="bg-white border border-slate-100 p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <AnimatePresence>
          {localIsActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 w-full h-2 bg-emerald-500" 
            />
          )}
        </AnimatePresence>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={localIsActive ? "checked-in" : "ready"}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${localIsActive ? 'bg-emerald-500 text-white' : 'bg-primary-600 text-white'}`}>
                {localIsActive ? <LogOut className="w-10 h-10 ml-2" /> : <MapPin className="w-10 h-10" />}
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {localIsActive ? 'You are checked in' : 'Ready to work?'}
              </h3>
              
              {localIsActive && localLog && (
                <p className="text-slate-500 flex items-center justify-center gap-1.5 mb-6">
                  <Clock className="w-4 h-4" />
                  Checked in at {formattedTime} &bull; {localLog.location?.name || "Current Location"}
                </p>
              )}

              {!localIsActive && localLog?.status === "OUT_OF_BOUNDS" && (
                 <p className="text-amber-600 text-sm mb-6 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                   Last attempt: Out of bounds
                 </p>
              )}

              <button
                onClick={handleAction}
                disabled={loading}
                className={`relative w-full py-4 rounded-2xl font-semibold text-lg text-white transition-all active:scale-[0.98] disabled:opacity-80 disabled:scale-100 overflow-hidden ${
                  localIsActive 
                    ? 'bg-slate-800 hover:bg-slate-700' 
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {localIsActive ? 'Checking out...' : 'Verifying...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Fingerprint className="w-5 h-5" />
                    {localIsActive ? 'Check Out' : 'Check In Now'}
                  </span>
                )}
              </button>

              <p className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <Fingerprint className="w-3 h-3" />
                Biometric verification &bull; GPS location required
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {status.type !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                className={`mt-6 p-4 rounded-xl flex items-start gap-3 text-left w-full overflow-hidden ${
                  status.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                    : status.type === 'error'
                      ? 'bg-red-50 border border-red-100 text-red-700'
                      : 'bg-blue-50 border border-blue-100 text-blue-700'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                ) : status.type === 'error' ? (
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                ) : (
                  <Loader2 className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 animate-spin" />
                )}
                <p className="text-sm font-medium leading-relaxed">{status.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Photo Capture Modal */}
      <PhotoCaptureModal
        isOpen={showPhotoModal}
        onCapture={handlePhotoCapture}
        onSkip={handlePhotoSkip}
      />
    </>
  );
}
