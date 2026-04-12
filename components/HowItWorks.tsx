"use client";
import { motion } from "framer-motion";
import { sectionColors } from "@/lib/sectionColors"; 
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
    <div className="flex flex-col md:flex-row gap-5 items-center justify-center -mt-23.75 -mb-20.75 md:-mt-10 md:-mb-8 p-0 w-full scale-[0.5] md:scale-[0.7]">
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
        className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 min-w-130 md:min-w-142.5 flex-2 hover:scale-[1.02] transition-transform duration-300"
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
          className={`text-2xl md:text-3xl font-semibold whitespace-pre-line ${getColor()}`}
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

        <p className="text-sm text-gray-400 mt-2 whitespace-pre-line hidden md:block">
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
     title: "Input your financial data",
     desc: "Upload your bank statement or use demo data. MoneyMind instantly processes your transactions and prepares them for analysis.",

     ui: (
       <div className="flex flex-col items-center justify-center h-32 text-gray-400 animate-pulse">
         📂 Uploading & processing transactions...
       </div>
     ),
   },

   {
     title: "AI analyzes your behavior",
     desc: "Detects spending patterns, emotional triggers, and hidden money leaks automatically using intelligent analysis.",

     ui: (
       <div className="flex flex-col items-center justify-center h-32 text-gray-400 animate-pulse">
         🧠 Analyzing patterns & behavior...
       </div>
     ),
   },

   {
     title: "Get insights + financial score",
     desc: "Understand your financial personality, weak points, and get actionable steps to improve your habits.",

     ui: (
       <div className="scale-[0.7] origin-top h-88 w-70 md:w-140 relative group">
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

   {
     title: "Ask AI for smart decisions",
     desc: "Ask questions like ‘Can I afford a car?’ and get clear YES/NO answers with reasoning and suggestions.",

     ui: (
       <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
         <div className="text-right mb-3">
           <div className="inline-block bg-blue-600 px-4 py-2 rounded-xl text-sm">
             Can I afford a ₹8L car?
           </div>
         </div>

         <div className="bg-gray-800 p-4 rounded-xl text-sm text-gray-300">
           ❌ Not recommended right now.
           <br />
           Your savings are low and expenses are high.
           <br />
           💡 Reduce spending by ₹5k/month.
         </div>
       </div>
     ),
   },

   {
     title: "Predict your future",
     desc: "MoneyMind forecasts your upcoming expenses based on your habits so you can plan ahead.",

     ui: (
       <div className="p-5 m-8 rounded-2xl bg-white/5 border border-white/10 text-center text-gray-300">
         🔮 Predicted next month expense: ₹42,000
       </div>
     ),
   },

   {
     title: "Autonomous monitoring & alerts",
     desc: "The system tracks your progress and automatically notifies you when you improve or overspend.",

     ui: (
       <div
         className="relative max-w-md mx-auto p-4 m-7 rounded-xl bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 backdrop-blur-xl shadow-lg shadow-green-500/10 flex items-start gap-3"
       >
         {/* ICON */}
         <div className="mt-1">
           <div
             className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/20 text-green-400"
           >
             🎉
           </div>
         </div>

         {/* CONTENT */}
         <div className="flex-1 text-left">
           <p className="text-sm font-semibold text-green-300">Goal Achieved</p>
           <p className="text-sm text-gray-300 mt-1">
             You can now afford your goal. Great financial discipline!
           </p>
         </div>

         {/* CLOSE BUTTON */}
         <button className="text-gray-400 hover:text-white transition">
           ✕
         </button>
       </div>
     ),
   },
 ];
 const chatSteps = [
   {
     title: "Ask anything about your money",
     desc: "Chat naturally with AI about spending, savings, or big financial decisions.",

     ui: (
       <div className="p-6 m-7 space-y-3 rounded-2xl bg-white/5 border border-white/10">
         <div className="text-right">
           <div className="bg-blue-600 px-4 py-2 rounded-xl text-sm inline-block">
             Can I afford a trip to Goa?
           </div>
         </div>
       </div>
     ),
   },

   {
     title: "AI understands your full context",
     desc: "It uses your past spending, habits, and financial data to generate accurate responses.",

     ui: (
       <div className="p-14 flex justify-center text-gray-400 animate-pulse">
         🧠 Understanding your finances...
       </div>
     ),
   },

   {
     title: "Get clear decisions + advice",
     desc: "Receive direct answers, reasoning, and actionable steps — not generic tips.",

     ui: (
       <div className="p-6 m-7 space-y-3 rounded-2xl bg-white/5 border border-white/10">
         <div className="bg-gray-800 px-4 py-2 rounded-xl text-sm text-left">
           ✅ Yes, you can afford it.
           <br />
           💡 Keep your monthly expenses under ₹30k.
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
          className="text-3xl md:text-4xl font-bold text-center mb-20 tracking-tight"
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
          className="text-3xl md:4xl font-bold text-center mb-20 tracking-tight"
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
