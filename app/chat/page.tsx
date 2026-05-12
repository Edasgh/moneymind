"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-toastify";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import NotFound from "../not-found";

const generalQuestions = [
  {
    title: "🏦 Basics",
    items: [
      "What is a bank account and why do I need one?",
      "How does UPI work?",
      "Difference between debit card and credit card?",
    ],
  },
  {
    title: "📈 Growth",
    items: [
      "What is SIP and how do I start?",
      "How can I start saving with low income?",
      "How to build an emergency fund?",
    ],
  },
  {
    title: "🛡️ Safety",
    items: [
      "How to avoid fraud in digital payments?",
      "What is insurance and do I need it?",
      "What is a credit score?",
    ],
  },
];

export default function ChatPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mode, setMode] = useState<"personal" | "general">("general");
  const [messages, setMessages] = useState<{ type: string; text: string }[]>(
    [],
  );
  const [input, setInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const sendMessage = async () => {
    if (!input) return;

    try {
      const limitedHistory = messages?.slice(-6);

      const userMsg = { type: "user", text: input };
      const isBuyingTopic = /(buy|purchase|afford)/i.test(userMsg.text);
      const isDecisionIntent = /(can i|should i|is it ok to)/i.test(
        userMsg.text,
      );

      const isAffordQuery = isBuyingTopic && isDecisionIntent;
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: input,
          history: limitedHistory,
          mode: isAffordQuery ? "personal" : "general",
        }),
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
      console.log("Error while follow up : ", error);
      toast.error("Something went wrong! Please try again later");
    }

    setLoading(false);
  };

  async function copyResponse(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy");
    }
  }

  if (!session) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-black text-white px-1.5 py-3 md:p-6">
      <nav className="flex flex-wrap gap-3 justify-between items-center max-w-6xl mx-auto mb-6 md:mb-10">
        <Link
          href={"/"}
          className="text-xs md:text-xl font-bold cursor-pointer"
        >
          🧠 MoneyMind
        </Link>

        <div className="flex items-center gap-3">
          {/* 👉 PRIMARY ACTION */}
          <Link
            href={"/analyze"}
            className="group bg-blue-600 hover:bg-blue-500 px-5 py-2 text-sm md:text-base rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200 ease-out"
          >
            Try Now{" "}
            <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          {session && (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
              <span
                onClick={() => router.push("/profile")}
                className="text-xs text-gray-300 cursor-pointer"
              >
                {session?.user?.name && (
                  <>
                    {session?.user?.name.length > 10 ? (
                      <>{session?.user?.name.slice(0, 10)}..</>
                    ) : (
                      <>{session?.user?.name}</>
                    )}
                  </>
                )}
              </span>
              <div className="w-px h-3.25 bg-linear-to-r from-transparent via-white/20 to-transparent" />
              <button
                onClick={() => signOut()}
                className="text-xs text-red-400"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto mt-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">
          {mode === "personal" ? (
            <>
              Talk to Your <span className="text-blue-500">AI Money Coach</span>
            </>
          ) : (
            <>
              Learn <span className="text-purple-400">Finance Concepts</span>
            </>
          )}
        </h1>

        <p className="text-gray-400 mt-3 text-sm md:text-base">
          {mode === "personal"
            ? "Ask anything about your spending, saving, or habits — get real, practical advice instantly."
            : "Understand finance terms, investing, savings strategies, and money concepts in simple language."}
        </p>
      </div>

      <div className="max-w-3xl mx-auto mt-6 flex justify-center">
        <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
          <button
            onClick={() => {
              setMode("personal");
              setMessages([]);
            }}
            className={`px-4 py-2 text-xs md:text-sm rounded-lg transition ${
              mode === "personal"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🧠 My Finances
          </button>

          <button
            onClick={() => {
              setMode("general");
              setMessages([]);
            }}
            className={`px-4 py-2 text-xs md:text-sm rounded-lg transition ${
              mode === "general"
                ? "bg-purple-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📘 General Advice
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="space-y-4 max-w-3xl mx-auto mt-10">
        {messages.length === 0 && (
          <div className="text-center mt-16 text-gray-400">
            <p className="text-lg">
              {mode === "personal"
                ? "💬 Tell me your money habit..."
                : "📘 Ask any finance question..."}
            </p>

            {mode === "personal" && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {[
                  "Can I afford a car?",
                  "How can I save more?",
                  "What am I doing wrong?",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="bg-gray-800 px-4 py-2 rounded-xl text-sm hover:bg-gray-700 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {mode === "general" && (
              <>
                {generalQuestions.map((section, idx) => (
                  <div key={idx} className="text-left">
                    <p className="text-xs text-gray-500 mb-2">
                      {section.title}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {section.items.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(q)}
                          className="bg-gray-800 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-700"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
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
                    ? `text-white shadow-blue-500/20 rounded-br-sm ${mode === "general" ? "bg-linear-to-r from-blue-500 to-purple-500" : "bg-blue-600"}`
                    : "bg-linear-to-br from-gray-800 to-gray-900 text-gray-200 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>

              {msg.type === "user" && (
                <div
                  className={`w-8 h-8 rounded-full ${mode === "general" ? "bg-purple-500" : "bg-blue-600"} flex items-center justify-center text-xs`}
                >
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
            {msg.type === "bot" && messages[messages.length - 1] === msg && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleFollowUp}
                  className="text-xs bg-gray-800 px-2 py-1 rounded"
                >
                  Ask Follow-up
                </button>
                <button
                  onClick={async () => await copyResponse(msg.text)}
                  className="text-xs bg-gray-800 px-2 py-1 rounded"
                >
                  Copy
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
          value={input ?? ""}
          ref={inputRef}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none px-3 py-2 text-sm"
          placeholder={
            mode === "personal"
              ? "Ask about your spending, savings..."
              : "Ask any finance concept (SIP, EMI, etc)..."
          }
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className={`${mode === "general" ? "bg-purple-500 hover:bg-purple-600" : "bg-blue-600 hover:bg-blue-700"} transition px-5 py-2 rounded-xl text-sm font-medium`}
        >
          Send
        </button>
      </div>
    </div>
  );
}
