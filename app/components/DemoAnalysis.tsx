"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { sectionColors } from "../analyze/page";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

function ScoreCardPreview({ score, result }: { score: number; result: any }) {
  const radius = 40; // 👈 smaller
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const [animatedScore, setAnimatedScore] = useState(0);

  // 🎯 Animate score (0 → actual)
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 2;
      if (start >= score) {
        start = score;
        clearInterval(interval);
      }
      setAnimatedScore(start);
    }, 20);

    return () => clearInterval(interval);
  }, [score]);

  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  const getColor = () => {
    if (score < 40) return "text-red-400";
    if (score < 70) return "text-yellow-400";
    return "text-green-400";
  };

  const getPersonalityEmoji = () => {
    if (score < 40) return "😬";
    if (score < 70) return "😅";
    return "😎";
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
      {/* 🔵 MINI RING */}
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          <circle
            stroke="#1f2937"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          <motion.circle
            stroke="#3b82f6"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transition={{ duration: 1 }}
          />
        </svg>

        {/* SCORE */}
        <span className={`absolute text-sm font-bold ${getColor()}`}>
          {animatedScore}
        </span>
      </div>

      {/* 🧠 TEXT SIDE */}
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Score</span>
          <span>{getPersonalityEmoji()}</span>
        </div>

        <p className={`text-sm font-semibold ${getColor()} whitespace-pre-wrap line-clamp-2`}>
          {result?.personality?.replace(/\n/g, " ").split(/[.!?]/)[0]}
        </p>
      </div>
    </div>
  );
}

export default function DemoAnalysis({


}) {
    const dummyResult = {
      personality:
        "You’re a comfort spender who uses food and shopping to cope with stress. You’re not reckless, but consistency is your problem.",

      insight:
        "You tend to spend more during emotional lows, especially on quick dopamine sources like Swiggy and Amazon. This creates small but frequent money leaks.",

      fix: "Set a weekly 'guilt-free' spending cap (₹1000 max).\n Replace impulse orders with a 10-minute delay rule.\n Track only your top 3 expenses instead of everything.",

      impact:
        "If this continues, you’ll struggle to build savings despite earning enough. Over time, this leads to financial stress and dependence on credit.",
    };
  const inputs = [
    "Spent ₹3000 on Swiggy & shopping...",
    "I can't save money...",
    "Income ₹25000",
  ];

  const [typedInputs, setTypedInputs] = useState(["", "", ""]);
  const [showOutput, setShowOutput] = useState(false);
  const router = useRouter()

  // ✨ TYPEWRITER INPUTS
  useEffect(() => {
    let currentIndex = 0;
    let charIndex = 0;

    const interval = setInterval(() => {
      setTypedInputs((prev) => {
        const updated = [...prev];
        updated[currentIndex] = inputs[currentIndex]?.slice(0, charIndex);
        return updated;
      });

      charIndex++;

      if (charIndex > inputs[currentIndex].length) {
        currentIndex++;
        charIndex = 0;

        if (currentIndex >= inputs.length) {
          clearInterval(interval);

          // ⏳ SHOW OUTPUT AFTER INPUTS DONE
          setTimeout(() => {
            setShowOutput(true);
          }, 800);
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 1 }}
      animate={{ opacity: 1, x: 0, scale: 0.9 }}
      transition={{ delay: 0.5 }}
      className="mt-12 lg:mt-0 lg:absolute lg:top-30 lg:right-6 w-full max-w-sm mx-auto lg:w-85 origin-top group"
    >
      <div className="p-4 space-y-3 rounded-2xl bg-gray-900 border border-gray-800 shadow-lg shadow-blue-500/10 relative">
        <p className="text-[10px] text-blue-400">Live Demo</p>
        {/* 🧾 INPUTS */}
        <div className="space-y-2">
          <p className="text-[10px] text-gray-500">Your Inputs</p>

          {typedInputs.map((text, i) => {
            if (text && text.trim().length > 0) {
              return (
                <div
                  key={i}
                  className="p-2 rounded-md bg-white/5 border border-white/10 text-xs text-gray-400 min-h-8 text-left"
                >
                  {text}
                  {text?.length !== inputs[i]?.length && (
                    <span className="animate-pulse">|</span>
                  )}
                </div>
              );
            }
          })}
        </div>

        {/* 🧠 ANALYZING */}
        {!showOutput && (
          <motion.div
            className="text-[10px] text-center text-gray-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            🧠 Analyzing...
          </motion.div>
        )}

        {/* 📊 OUTPUT */}
        {showOutput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2 text-xs text-gray-300"
          >
            <ScoreCardPreview result={dummyResult} score={72} />

            {/* INSIGHT */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-2 rounded-lg border flex flex-col justify-start items-start gap-0.5 ${sectionColors.insight.border} ${sectionColors.insight.bg}`}
            >
              <p className={`text-[10px] ${sectionColors.insight.title}`}>
                💡 INSIGHT
              </p>
              <p className="line-clamp-2">{dummyResult.insight}</p>
            </motion.div>

            {/* ACTION */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-2 rounded-lg border flex flex-col justify-start items-start gap-0.5 ${sectionColors.fixes.border} ${sectionColors.fixes.bg}`}
            >
              <p className={`text-[10px] ${sectionColors.fixes.title}`}>
                🎯 ACTION
              </p>
              <ul className="list-disc ml-4 space-y-1">
                {dummyResult.fix
                  .split(/\.\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((item: string, i: number) => (
                    <li key={i} className="line-clamp-1">
                      {item}
                    </li>
                  ))}
              </ul>
            </motion.div>

            {/* IMPACT */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-2 rounded-lg border flex flex-col justify-start items-start gap-0.5 ${sectionColors.impact.border} ${sectionColors.impact.bg}`}
            >
              <p className={`text-[10px] ${sectionColors.impact.title}`}>
                📉 IMPACT
              </p>
              <p className="line-clamp-2">{dummyResult.impact}</p>
            </motion.div>
          </motion.div>
        )}
        {/* Overlay */}
        <div className="absolute top-0 left-0 right-0 rounded-b-2xl flex flex-col items-end justify-end px-4 py-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-300">
          <ChevronRight
            onClick={() => router.push("/analyze")}
            className="text-white cursor-pointer"
          />
        </div>
      </div>
    </motion.div>
  );
}
