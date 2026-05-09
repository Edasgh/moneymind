"use client";

import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import NotFound from "../not-found";
import { toast } from "react-toastify";
import { useState } from "react";
import EditProfileModal from "@/components/EditProfileModal";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [showModal,setShowModal] = useState(false);
  const router = useRouter();

  if (!session) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6 relative overflow-hidden">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-75 sm:w-125 h-50 sm:h-75 bg-purple-500/10 blur-[100px]" />
      </div>

      {/* TODO : DEFINE EDIT PROFILE FUNCTION  */}
      {/* {showModal && (<EditProfileModal show={showModal} setShow={setShowModal} user={session.user} onSave={async()=>{}} />)} */}

      <div className="max-w-md sm:max-w-xl mx-auto mt-10 sm:mt-16 space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl sm:text-2xl font-semibold text-center">
            Your Profile
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 text-center mt-1">
            Manage your account
          </p>
        </motion.div>

        {/* USER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-center space-y-3"
        >
          {/* Avatar */}
          <div
            style={{ width: "50px", height: "50px" }}
            className="mx-auto rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-base sm:text-lg font-bold"
          >
            {session.user?.name?.[0] || "U"}
          </div>

          {/* Name */}
          <p className="text-base sm:text-lg font-semibold">
            {session.user?.name || "User"}
          </p>

          {/* Email */}
          <p className="text-xs sm:text-sm text-gray-400 break-all">
            {session.user?.email}
          </p>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
            <button
              onClick={()=>toast.info("Edit Profile Coming Soon!")}
              // onClick={()=>setShowModal(true)}
              className="w-full sm:w-auto px-4 py-2 text-sm rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/20 transition active:scale-95"
            >
              Edit Profile
            </button>

            <button
              onClick={() => signOut()}
              className="w-full sm:w-auto px-4 py-2 text-sm rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/20 transition active:scale-95"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* NAVIGATION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <button
            onClick={() => router.push("/analyze")}
            className="p-4 rounded-xl bg-linear-to-r from-blue-500 to-purple-500 hover:scale-[1.03] active:scale-95 transition text-sm font-medium"
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => router.push("/chat")}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.03] active:scale-95 transition text-sm font-medium"
          >
            🤖 Ask AI
          </button>
        </motion.div>
      </div>
    </div>
  );
}
