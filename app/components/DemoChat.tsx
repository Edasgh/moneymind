"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DemoChat() {
  const fullText =
    "This sounds like impulse eating, not hunger. Try setting a ₹200 weekly cap first. What usually triggers it — stress or boredom? 🤔";

  const [typedText, setTypedText] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let interval: NodeJS.Timeout;

    // Step 1: show thinking
    const thinkingTimeout = setTimeout(() => {
      setThinking(true);
    }, 800);

    // Step 2: show AI + typing
    const responseTimeout = setTimeout(() => {
      setThinking(false);
      setShowAI(true);

      interval = setInterval(() => {
        setTypedText(fullText.slice(0, i));

        // 👇 dynamic speed (more human)
        const speed = i < 40 ? 20 : 35;

        i++;
        if (i > fullText.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, 25);
    }, 1800);

    return () => {
      clearTimeout(thinkingTimeout);
      clearTimeout(responseTimeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 0.6 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="mt-16 w-72 absolute top-20 right-10 bg-gray-900 p-5 rounded-2xl border border-gray-800 text-left shadow-lg shadow-blue-500/10"
    >
      {/* LABEL */}
      <p className="text-xs text-gray-500 mb-3">Live AI preview</p>

      {/* USER */}
      <div className="mb-4">
        <p className="text-gray-400 text-sm flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
            🧑
          </span>
          User:
        </p>
        <p>I spend too much on Swiggy</p>
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
    </motion.div>
  );
}
