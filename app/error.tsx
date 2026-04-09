"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-100 h-62.5 bg-red-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
        {/* Icon */}
        <div className="text-5xl mb-4">⚠️</div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-semibold">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          An unexpected error occurred. Don’t worry — your data is safe.
        </p>

        {/* Error message (dev only vibe) */}
        <p className="mt-3 text-xs text-red-400 break-all">{error.message}</p>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Go Home
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-500">Error Code: MM-500</p>
      </motion.div>
    </div>
  );
}
