"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onCapture: (photoBase64: string) => void;
  onSkip: () => void;
}

export default function PhotoCaptureModal({ isOpen, onCapture, onSkip }: PhotoCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState("");

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas to a reasonable size for storage
    canvas.width = 320;
    canvas.height = 240;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoBase64 = canvas.toDataURL("image/jpeg", 0.6); // Compressed JPEG
    
    stopCamera();
    onCapture(photoBase64);
  }, [stopCamera, onCapture]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCountdown(3);
      setCameraReady(false);
      setError("");
      return;
    }

    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 320, height: 240 }
        });
        
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraReady(true);
      } catch (err) {
        if (mounted) {
          setError("Camera access denied. Skipping photo.");
          setTimeout(() => onSkip(), 2000);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [isOpen, stopCamera, onSkip]);

  // Countdown timer
  useEffect(() => {
    if (!cameraReady || !isOpen) return;
    
    if (countdown <= 0) {
      capturePhoto();
      return;
    }

    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cameraReady, countdown, isOpen, capturePhoto]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-slate-800">Photo Verification</h3>
            </div>
            <button onClick={() => { stopCamera(); onSkip(); }} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera */}
          <div className="relative bg-slate-900 aspect-[4/3]">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm px-6 text-center">
                {error}
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="w-full h-full object-cover mirror"
                  style={{ transform: "scaleX(-1)" }}
                />
                
                {/* Countdown overlay */}
                {cameraReady && countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      key={countdown}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                      <span className="text-4xl font-bold text-white">{countdown}</span>
                    </motion.div>
                  </div>
                )}

                {/* Corner brackets for framing */}
                <div className="absolute inset-8 pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/60 rounded-br-lg" />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-slate-50 text-center">
            <p className="text-xs text-slate-500">
              {cameraReady && countdown > 0
                ? "Hold still — capturing in a moment..."
                : cameraReady 
                  ? "Capturing..."
                  : "Starting camera..."}
            </p>
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
