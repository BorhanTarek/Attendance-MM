"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Loader2, CheckCircle2, ShieldAlert, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { verifyBiometric } from "@/lib/biometric";

export default function BiometricSetup() {
  const router = useRouter();
  const [step, setStep] = useState<"prompt" | "verifying" | "success" | "failed">("prompt");
  const [dismissed, setDismissed] = useState(false);

  const handleSetup = async () => {
    setStep("verifying");
    
    const verified = await verifyBiometric();
    
    if (verified) {
      // Mark as registered on the server and bind device
      try {
        const deviceId = crypto.randomUUID();
        localStorage.setItem("geoattend_device_id", deviceId);
        
        await fetch("/api/biometric/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        });
        
        setStep("success");
        setTimeout(() => router.refresh(), 2000);
      } catch {
        setStep("failed");
      }
    } else {
      setStep("failed");
    }
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full"
        >
          {/* Header bar */}
          <div className="h-2 bg-primary-600" />

          <div className="p-8 flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              {step === "prompt" && (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-6">
                    <Fingerprint className="w-10 h-10 text-primary-600" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Set Up Biometric
                  </h2>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    For your security, please register your biometric (fingerprint or face ID) to verify your identity during check-in and check-out.
                  </p>

                  <button
                    onClick={handleSetup}
                    className="w-full py-4 rounded-2xl font-semibold text-lg text-white bg-primary-600 hover:bg-primary-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Fingerprint className="w-5 h-5" />
                    Register Biometric
                  </button>

                  <button
                    onClick={() => setDismissed(true)}
                    className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Skip for now
                  </button>
                </motion.div>
              )}

              {step === "verifying" && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Verifying...
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Please use your fingerprint or face ID when prompted.
                  </p>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Biometric Registered!
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Your identity is now verified. Redirecting...
                  </p>
                </motion.div>
              )}

              {step === "failed" && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                    <ShieldAlert className="w-10 h-10 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Setup Failed
                  </h2>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    Biometric verification was not completed. This could be because your device doesn't support it, or the attempt was cancelled. You can try again or skip for now.
                  </p>

                  <button
                    onClick={() => setStep("prompt")}
                    className="w-full py-4 rounded-2xl font-semibold text-lg text-white bg-primary-600 hover:bg-primary-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Try Again
                  </button>

                  <button
                    onClick={() => setDismissed(true)}
                    className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Skip for now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
