"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-toastify";
import { ArrowRight } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{type:string,text:string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement|null>(null);

  const sendMessage = async () => {
    if (!input) return;

    try {
      const limitedHistory = messages?.slice(-6); // last 6 messages only

      const userMsg = { type: "user", text: input };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: input, history: limitedHistory }),
      });

      const data = await res.json();

      setMessages((prev) => [...prev, { type: "bot", text: data.reply }]);
    } catch (error) {
       console.log("Error while messaging : ", error);
       toast.error("Something went wrong! Please try again later");
    }

    setLoading(false);
  };

  const handleFollowUp = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/follow-up", {
        method: "POST",
        body: JSON.stringify({ history: messages.slice(-8) }),
      });

      const data = await res.json();

      const followUpMsg = { type: "bot", text: data.question };
      setMessages((prev) => [...prev, followUpMsg]);
      inputRef.current?.focus();
    } catch (error) {
      console.log("Error while follow up : ",error);
      toast.error("Something went wrong! Please try again later");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-black text-white px-1.5 py-3 md:p-6">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <Link
          href={"/"}
          className="text-xs md:text-xl font-bold cursor-pointer"
        >
          🧠 MoneyMind
        </Link>

        {/* 👉 PRIMARY ACTION */}
        <Link
          href={"/analyze"}
          className="group bg-blue-600 hover:bg-blue-500 px-5 py-2 text-sm md:text-base rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200 ease-out"
        >
          Try Now{" "}
          <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto mt-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">
          Talk to Your <span className="text-blue-500">AI Money Coach</span>
        </h1>

        <p className="text-gray-400 mt-3 text-sm md:text-base">
          Ask anything about your spending, saving, or habits — get real,
          practical advice instantly.
        </p>
      </div>

      {/* Chat */}
      <div className="space-y-4 max-w-3xl mx-auto mt-10">
        {messages.length === 0 && (
          <div className="text-center mt-16 text-gray-400">
            <p className="text-lg">💬 Tell me your money habit...</p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {[
                "I spend too much on Swiggy",
                "I can't save money",
                "I keep impulse buying",
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="bg-gray-800 px-4 py-2 rounded-xl text-sm hover:bg-gray-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`flex items-end gap-2 ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.type === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                  🤖
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm shadow ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white shadow-blue-500/20 rounded-br-sm"
                    : "bg-linear-to-br from-gray-800 to-gray-900 text-gray-200 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>

              {msg.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs">
                  🧑
                </div>
              )}
              <span className="text-[10px] text-gray-500 mt-1 block">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

           {/* If last message, ask ai to ask follow up questions  */}
            {msg.type === "bot" && messages[messages.length-1] === msg && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleFollowUp}
                  className="text-xs bg-gray-800 px-2 py-1 rounded"
                >
                  Ask Follow-up
                </button>
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <p className="text-gray-400 text-sm animate-pulse">
            MoneyMind is thinking...
          </p>
        )}
      </div>

      {/* Input */}
      <div className="max-w-3xl mx-auto mt-6 flex gap-3 bg-gray-900 p-2 rounded-2xl border border-gray-700">
        <input
          value={input}
          ref={inputRef}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none px-3 py-2 text-sm"
          placeholder="Tell me your money problem..."
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-xl text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
