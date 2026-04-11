"use client";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export default function ScoreCard({
  score ,
  result,
}: {
  score: number;
  result: any;
}) {
  const radius = 80;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score < 40) return "text-red-400";
    if (score < 70) return "text-yellow-400";
    return "text-green-400";
  };

  const getGlow = () => {
    if (score < 40) return "drop-shadow-[0_0_12px_rgba(248,113,113,0.6)]";
    if (score < 70) return "drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]";
    return "drop-shadow-[0_0_12px_rgba(74,222,128,0.6)]";
  };

  const getPersonalityEmoji = () => {
    if (score < 40) return "😬";
    if (score < 70) return "😅";
    return "😎";
  };

  return (
    <div className="flex flex-wrap gap-10 items-center justify-center p-6 w-full">
      {/* Progress Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-1 items-center justify-center"
      >
        <div className="relative">
          <svg height={radius * 2} width={radius * 2} className="-rotate-90">
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* Background */}
            <circle
              stroke="#1f2937"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />

            {/* Progress */}
            <motion.circle
              stroke="url(#gradient)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className={getGlow()}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-end gap-2">
              <span className={`text-5xl font-bold ${getColor()} ${getGlow()}`}>
                {score}
              </span>
              <span className="text-sm text-gray-500 tracking-wide">/ 100</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">Financial Score</span>
          </div>
        </div>
      </motion.div>

      {/* Personality Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 min-w-142.5 flex-2 hover:scale-[1.02] transition-transform duration-300"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-purple-500 flex items-center justify-center text-lg">
            {getPersonalityEmoji()}
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <p className="text-sm text-purple-400">PERSONALITY</p>
          </div>
        </div>

        <h2
          className={`text-3xl font-semibold whitespace-pre-line ${getColor()}`}
        >
          {(() => {
            if (!result?.personality) return "";
            // Replace newlines with space, trim extra spaces
            const cleaned = result.personality.replace(/\n/g, " ").trim();
            // Match first sentence ending with ., ! or ?
            const match = cleaned.match(/.*?[.!?](\s|$)/);
            return match ? match[0] : cleaned; // fallback: entire text if no punctuation
          })()}
        </h2>

        <p className="text-sm text-gray-400 mt-2 whitespace-pre-line">
          {result?.personality}
        </p>
      </motion.div>
    </div>
  );
}
