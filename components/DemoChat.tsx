"use client";
import { motion, useInView } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function DemoChat() {
  const router = useRouter();

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const [mode, setMode] = useState<"personal" | "general">("personal");
  const [typedText, setTypedText] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [done, setDone] = useState(false);

  // 🔥 Demo content per mode
  const DEMO = {
    personal: {
      user: "Help me with my spending habits",
      ai: "I noticed frequent small orders instead of planned spending. That usually signals habit-based behavior. Try this: 2 orders per week + ₹200 cap. Want me to track it for you?",
    },
    general: {
      user: "How can I start saving money?",
      ai: "Start small—try saving ₹100 whenever you receive money. Keep it in a separate account so you don’t spend it easily. Do you already have a bank account or UPI app?",
    },
  };

  const fullText = DEMO[mode].ai;

  // 🔁 Reset animation when mode changes
  useEffect(() => {
    if (!isInView) return;

    setTypedText("");
    setShowAI(false);
    setThinking(false);
    setDone(false);

    let i = 0;
    let interval: NodeJS.Timeout;

    const thinkingTimeout = setTimeout(() => {
      setThinking(true);
    }, 600);

    const responseTimeout = setTimeout(() => {
      setThinking(false);
      setShowAI(true);

      interval = setInterval(() => {
        setTypedText(fullText.slice(0, i));
        i++;

        if (i > fullText.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, 20);
    }, 1400);

    return () => {
      clearTimeout(thinkingTimeout);
      clearTimeout(responseTimeout);
      if (interval) clearInterval(interval);
    };
  }, [isInView, mode]);

  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setMode((prev) => (prev === "personal" ? "general" : "personal"));
    }, 6000); // switch every 6s

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="mt-5 w-85 md:w-140 bg-gray-900 p-5 rounded-2xl border border-gray-800 text-left shadow-lg shadow-blue-500/10 relative group"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs text-gray-500">Live AI preview</p>

        {/* 🔥 MODE TOGGLE */}
        <div className="flex bg-white/5 rounded-lg p-1 text-[10px]">
          <button
            onClick={() => setMode("personal")}
            className={`px-2 py-1 rounded ${
              mode === "personal"
                ? "bg-blue-500/20 text-blue-300"
                : "text-gray-400"
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setMode("general")}
            className={`px-2 py-1 rounded ${
              mode === "general"
                ? "bg-purple-500/20 text-purple-300"
                : "text-gray-400"
            }`}
          >
            General
          </button>
        </div>
      </div>

      {/* USER */}
      <div className="mb-4">
        <p className="text-gray-400 text-sm flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
            🧑
          </span>
          User:
        </p>
        <p>{DEMO[mode].user}</p>
      </div>

      {/* THINKING */}
      {thinking && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
            🤖
          </span>
          <motion.div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: i * 0.2,
                }}
              >
                ●
              </motion.span>
            ))}
          </motion.div>
        </div>
      )}

      {/* AI */}
      {showAI && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
              🤖
            </span>
            MoneyMind:
          </p>

          <p className="min-h-16 mt-1">
            {typedText}
            {!done && (
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="ml-1"
              >
                |
              </motion.span>
            )}
          </p>
        </motion.div>
      )}

      {/* CTA */}
      <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl flex flex-col items-end justify-end px-4 py-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-300">
        <ChevronRight
          onClick={() => router.push("/chat")}
          className="text-white cursor-pointer"
        />
      </div>
    </motion.div>
  );
}
