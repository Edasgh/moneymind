"use client";

import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import NotFound from "../not-found";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:p-6 relative">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-62.5 bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="max-w-xl mx-auto mt-16 space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-center">Your Profile</h1>
          <p className="text-sm text-gray-400 text-center mt-1">
            Manage your account
          </p>
        </motion.div>

        {/* USER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-center space-y-3"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold">
            {session.user?.name?.[0] || "U"}
          </div>

          <p className="text-lg font-semibold">
            {session.user?.name || "User"}
          </p>

          <p className="text-sm text-gray-400">{session.user?.email}</p>

          {/* ACTIONS */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => toast.info("Edit profile coming soon")}
              className="px-4 py-2 text-sm rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/20 transition"
            >
              Edit
            </button>

            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/20 transition"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* NAVIGATION ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => router.push("/analyze")}
            className="p-4 rounded-xl bg-linear-to-r from-blue-500 to-purple-500 hover:scale-105 transition text-sm font-medium"
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => router.push("/chat")}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
          >
            🤖 Ask AI
          </button>
        </motion.div>
      </div>
    </div>
  );
}
