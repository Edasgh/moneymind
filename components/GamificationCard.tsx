"use client";

import { Gamification } from "@/hooks/useFinance";
import { motion } from "framer-motion";

export default function GamificationCard({ game }: {game:Gamification}) {
  if (!game) return null;

  // 🎯 LEVEL LOGIC
  const level = game.level || 1;
  const xp = game.xp || 0;

  const currentLevelXP = xp % 100; // XP within current level
  const nextLevelXP = 100;

  const progress = Math.min(
    100,
    Math.round((currentLevelXP / nextLevelXP) * 100),
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-5 rounded-2xl border border-white/10 bg-linear-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-medium text-white">🎮 Your Progress</p>

          <span className="text-xs px-2 py-1 bg-white/10 rounded-lg text-gray-300">
            Lv {level}
          </span>
        </div>

        {/* XP BAR */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>XP</span>
            <span>
              {currentLevelXP} / {nextLevelXP}
            </span>
          </div>

          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
              className="h-2 bg-linear-to-r from-blue-500 to-purple-500 rounded-full"
            />
          </div>
        </div>

        {/* STREAK */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">🔥 Streak</p>
          <p className="text-sm font-semibold text-orange-400">
            {game.streaks?.underBudgetDays} days
          </p>
        </div>

        {/* ACHIEVEMENTS */}
        <div>
          <p className="text-xs text-gray-400 mb-2">🏆 Achievements</p>

          {game.achievements?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {game.achievements.map((a: any, i: number) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/20"
                >
                  {a.title}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-500">
              No achievements yet — keep going 🚀
            </p>
          )}
        </div>

        {/* FOOTER TIP */}
        <div className="mt-4 text-xs text-gray-400 border-t border-white/10 pt-3">
          Earn XP by saving more, staying under budget & consistent habits.
        </div>
      </motion.div>
    </>
  );
}
