"use client";

import Link from "next/link";
import { motion} from "framer-motion";
import { useState } from "react";
import SignInModal from "@/components/SignInModal";

export default function NotFound() {
  const [show,setShow]=useState(false);
  return (
    <>
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 bg-blue-500/10 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          {/* 404 */}
          <h1 className="text-6xl md:text-8xl font-bold bg-linear-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            404
          </h1>

          {/* Title */}
          <p className="mt-4 text-xl md:text-2xl font-semibold">
            User Not Found
          </p>

          {/* Description */}
          <p className="mt-2 text-gray-400 text-sm md:text-base">
            The page or user you're looking for doesn’t exist or may have been
            removed.
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
            >
              Go Home
            </Link>

            <button onClick={()=>setShow(true)} className="px-5 py-2 rounded-xl bg-linear-to-r from-blue-500 to-purple-500 hover:scale-105 transition">
              Sign In
            </button>
          </div>

          {/* Subtle hint */}
          <p className="mt-6 text-xs text-gray-500">Error Code: MM-404</p>
        </motion.div>
      </div>
      <SignInModal show={show} setShow={setShow}/>
    </>
  );
}
