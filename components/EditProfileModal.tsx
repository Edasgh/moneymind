"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";

export default function EditProfileModal({
  show,
  setShow,
  user,
  onSave,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    country?: string | null | undefined;
  };
  onSave: (data: any) => Promise<void>;
}) {
  const [name, setName] = useState(user?.name || "");
  const [country, setCountry] = useState(user?.country || "India");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim() || !country.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    if(name===user.name || country===user.country){
        toast.info("No changes to save!");
        setTimeout(() => {
            setShow(false);
        }, 1000);
        return;
    }

    try {
      setLoading(true);
      await onSave({ name, country });
      toast.success("Profile updated ✨");
      setShow(false);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-3"
    >
      <div
        className="relative w-full max-w-md p-5 rounded-2xl 
        bg-linear-to-br from-[#020617] to-[#0f172a] 
        border border-white/10 shadow-2xl space-y-5"
      >
        <ToastContainer autoClose={1000} theme="colored" />

        {/* GLOW */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 blur-3xl"></div>

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-white">✏️ Edit Profile</p>

          <button
            type="button"
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          {/* NAME */}
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Full Name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 
              focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* EMAIL (readonly) */}
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Email</p>
            <input
              value={user?.email || ""}
              disabled
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* COUNTRY */}
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Country</p>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 
              text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={() => setShow(false)}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 py-2 rounded-lg 
            bg-linear-to-r from-blue-500 to-purple-500 
            hover:scale-[1.03] transition text-sm"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* FOOTER */}
        <p className="text-[10px] text-gray-500 text-center">
          Keep your profile updated for better personalized insights
        </p>
      </div>
    </motion.div>
  );
}
