"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";
import { Brain } from "lucide-react";

export default function ScoreMeter({
  score,
  personality,
}: {
  score: number;
  personality?: string;
}) {
  const progress = useMotionValue(0);
  const animatedNumber = useMotionValue(0);

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

  const displayNumber = useTransform(animatedNumber, (v) => Math.round(v));

  // 🔥 track previous score (important)
  const prevScore = useRef(0);

  // fire confetti
  const fireConfetti = () => {
    const duration = 1200;
    const end = Date.now() + duration;

    const colors = ["#22c55e", "#3b82f6", "#a855f7"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
        colors,
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const glowColor = score > 75 ? "#22c55e" : score > 50 ? "#facc15" : "#ef4444";

  useEffect(() => {
    // 🎯 animate ring + number
    animate(progress, score, {
      duration: 1.2,
      ease: "easeOut",
    });

    animate(animatedNumber, score, {
      duration: 1.2,
      ease: "easeOut",
    });
    // 🎉 CONFETTI TRIGGER (only when crossing 80)
    if (prevScore.current <= 80 && score > 80) {
      fireConfetti();
    }

    prevScore.current = score;
  }, [score]);

  const color = getColor();

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
    <div className="flex flex-wrap lg:mt-36 gap-5 items-center justify-center p-0 w-full relative">
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
        className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 flex-2 scale-[0.8] hover:scale-[0.9] transition-transform duration-300"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-purple-500 flex items-center justify-center text-lg">
            {getPersonalityEmoji()}
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-purple-400">PERSONALITY</p>
          </div>
        </div>

        <h2
          className={`text-2xl font-semibold whitespace-pre-line ${getColor()}`}
        >
          {(() => {
            if (!personality) return "";
            // Replace newlines with space, trim extra spaces
            const cleaned = personality.replace(/\n/g, " ").trim();
            // Match first sentence ending with ., ! or ?
            const match = cleaned.match(/.*?[.!?](\s|$)/);
            return match ? match[0] : cleaned; // fallback: entire text if no punctuation
          })()}
        </h2>

        {/* ⭐ STATUS LABEL */}
        <p
          className={`text-base mt-1 font-medium ${
            score > 75
              ? "text-green-400"
              :score > 50
                ? "text-yellow-400"
                : "text-red-400"
          }`}
        >
          {score > 75
            ? "Good"
            : score > 50
              ? "Average"
              : "Needs Improvement"}
        </p>
      </motion.div>
    </div>
  );
}
