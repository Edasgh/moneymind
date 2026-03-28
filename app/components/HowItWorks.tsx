"use client";
import { motion } from "framer-motion";
import { sectionColors } from "../analyze/page";
import { Brain, Lightbulb, Target, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";

function ScoreCardPreview({ score, result }: { score: number; result: any }) {
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
    <div className="flex gap-5 items-center justify-center p-0 w-full scale-[0.7]">
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

export default function HowItWorks() {
  const router = useRouter();
  const dummyResult = {
    personality:
      "You’re a comfort spender who uses food and shopping to cope with stress. You’re not reckless, but consistency is your problem.",

    insight:
      "You tend to spend more during emotional lows, especially on quick dopamine sources like Swiggy and Amazon. This creates small but frequent money leaks.",

    fix: "Set a weekly 'guilt-free' spending cap (₹1000 max).\n Replace impulse orders with a 10-minute delay rule.\n Track only your top 3 expenses instead of everything.",

    impact:
      "If this continues, you’ll struggle to build savings despite earning enough. Over time, this leads to financial stress and dependence on credit.",
  };
  const steps = [
    {
      title: "Tell MoneyMind your real money habits",
      desc: "Just chat naturally or add a few details about your spending, income, and struggles. No spreadsheets, no complexity — just your real life.",

      ui: (
        <div className="relative group w-140 mx-auto">
          {/* Card */}
          <div className="p-5 space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg">
            {/* Fake Inputs */}
            <div className="space-y-3 opacity-80">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400">
                Spent ₹3000 on Swiggy & shopping...
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400">
                I can't save money...
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400">
                Income ₹25000
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-300">
            <p className="text-sm text-gray-300 mb-3">
              Unlock your full financial analysis
            </p>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/analyze")}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              Analyze My Behavior 🚀
            </motion.button>
          </div>
        </div>
      ),
    },
    {
      title: "AI detects hidden behavior patterns",
      desc: "MoneyMind analyzes your inputs to uncover emotional spending triggers, money leaks, and habits you don’t even notice.",
      ui: (
        <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-md w-140">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            🧠 Analyzing your financial behavior...
          </motion.div>
        </div>
      ),
    },
    {
      title: "Get a clear score + actionable plan",
      desc: "Receive a financial behavior score, personality insights, and simple fixes you can actually follow in daily life.",
      ui: (
        <div className="scale-[0.7] origin-top h-100 w-140 relative group">
          <div className="p-3 space-y-0.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg">
            <ScoreCardPreview result={dummyResult} score={72} />

            <div className="space-y-2 text-sm text-gray-300">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className={`p-2 rounded-xl border ${sectionColors.insight.border} ${sectionColors.insight.bg}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb
                    className={`w-4 h-4 ${sectionColors.insight.title}`}
                  />
                  <p className={`text-xs ${sectionColors.insight.title}`}>
                    INSIGHT
                  </p>
                </div>

                <p className="text-gray-300 leading-relaxed line-clamp-2">
                  {dummyResult.insight}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className={`p-2 rounded-xl border ${sectionColors.fixes.border} ${sectionColors.fixes.bg}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className={`w-4 h-4 ${sectionColors.fixes.title}`} />
                  <p className={`text-xs ${sectionColors.fixes.title}`}>
                    ACTION PLAN
                  </p>
                </div>

                <ul className="list-disc ml-5 space-y-2 text-gray-300">
                  {dummyResult.fix
                    .split(/\.\s+/)
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .map((item, i) => (
                      <li className="line-clamp-2 list-disc" key={i}>
                        {item}
                      </li>
                    ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className={`p-2 rounded-lg border ${sectionColors.impact.border} ${sectionColors.impact.bg}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown
                    className={`w-4 h-4 ${sectionColors.impact.title}`}
                  />
                  <p className={`text-xs ${sectionColors.impact.title}`}>
                    IMPACT
                  </p>
                </div>

                <p className="text-gray-300 line-clamp-2">
                  {dummyResult.impact}
                </p>
              </motion.div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-300">
              <p className="text-lg text-gray-300 mb-3">
                Unlock your full financial analysis
              </p>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/analyze")}
                className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-xl font-medium shadow-lg shadow-blue-500/20"
              >
                Analyze My Behavior 🚀
              </motion.button>
            </div>
          </div>
        </div>
      ),
    },
  ];
  const chatSteps = [
    {
      title: "Start a natural conversation",
      desc: "Ask anything about your money — spending habits, savings problems, or financial confusion. Just type like you're talking to a friend.",
      ui: (
        <div className="relative group w-140 mx-auto">
          <div className="p-5 space-y-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-sm text-sm max-w-[70%]">
                I keep spending too much on food 😭
              </div>
            </div>

            {/* AI Reply */}
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-200 px-4 py-2 rounded-2xl rounded-bl-sm text-sm max-w-[70%]">
                That sounds like emotional spending. When do you usually order
                food?
              </div>
            </div>

            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-sm text-sm max-w-[70%]">
                Mostly at night when I'm stressed
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-300">
            <p className="text-sm text-gray-300 mb-3">
              Start chatting with MoneyMind
            </p>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/chat")}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              Open Chat 💬
            </motion.button>
          </div>
        </div>
      ),
    },

    {
      title: "AI understands your situation",
      desc: "MoneyMind remembers your conversation, detects patterns, and asks smart follow-ups to deeply understand your behavior.",
      ui: (
        <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-md w-140">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            🧠 Understanding your situation...
          </motion.div>
        </div>
      ),
    },

    {
      title: "Get instant guidance",
      desc: "Receive real-time advice, mindset shifts, and simple actions — all personalized to your habits and lifestyle.",
      ui: (
        <div className="relative group w-140 mx-auto">
          <div className="p-5 space-y-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg">
            {/* AI Advice */}
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-200 px-4 py-2 rounded-2xl rounded-bl-sm text-sm max-w-[70%]">
                Try a 10-minute delay before ordering. If you still want it
                after, go for it guilt-free.
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-200 px-4 py-2 rounded-2xl rounded-bl-sm text-sm max-w-[70%]">
                Also set a weekly ₹1000 “fun budget” so you don’t feel
                restricted.
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-300">
            <p className="text-sm text-gray-300 mb-3">
              Get personalized financial advice
            </p>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/chat")}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              Try Chat Now ⚡
            </motion.button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <section className="py-20 px-6 text-white">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-20"
        >
          How It Works
        </motion.h2>

        <div className="max-w-6xl mx-auto flex flex-col gap-24">
          {steps.map((step, index) => {
            const isReverse = index % 2 !== 0;

            return (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center gap-12 ${
                  isReverse ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* TEXT */}
                <motion.div
                  initial={{ opacity: 0, x: isReverse ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                </motion.div>

                {/* REAL UI PREVIEW */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex-1"
                >
                  <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4 shadow-xl hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                    {step.ui}

                    {/* Glow */}
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500/10 to-purple-500/10 blur-2xl opacity-30 pointer-events-none" />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="py-20 px-6 text-white">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-20"
        >
          How Chat Helps You
        </motion.h2>

        <div className="max-w-6xl mx-auto flex flex-col gap-24">
          {chatSteps.map((step, index) => {
            const isReverse = index % 2 !== 0;

            return (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center gap-12 ${
                  isReverse ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* TEXT */}
                <motion.div
                  initial={{ opacity: 0, x: isReverse ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                </motion.div>

                {/* REAL UI PREVIEW */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex-1"
                >
                  <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4 shadow-xl hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                    {step.ui}

                    {/* Glow */}
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500/10 to-purple-500/10 blur-2xl opacity-30 pointer-events-none" />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
