"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MapPin, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (res?.error) {
        setError("Invalid username or password");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-300/30 blur-3xl" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
            <MapPin className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            GeoAttend
          </h1>
          <p className="text-slate-500 mt-2 text-center">
            Sign in to check in to your location
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-blue-500 hover:from-primary-700 hover:to-blue-600 text-white font-medium py-3 rounded-xl shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Default Admin: System Admin / admin123</p>
          <p>Default Employee: John Doe / employee123</p>
        </div>
      </motion.div>
    </div>
  );
}
