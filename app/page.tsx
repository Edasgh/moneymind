"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HowItWorks from "@/components/HowItWorks";
import DemoChat from "@/components/DemoChat";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import SignInModal from "@/components/SignInModal";
import { signOut, useSession } from "next-auth/react";
import DemoAnalysis from "@/components/DemoAnalysis";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loggedIn, setLoggedIn] = useState(session ? true : false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* 🔥 PREMIUM BACKGROUND */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-200 h-200 bg-blue-500/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-25 -right-25 w-125 h-125 bg-purple-500/20 blur-[120px] rounded-full" />
      </div>
      <SignInModal show={showLoginModal} setShow={setShowLoginModal} />
      {/* NAVBAR */}
      <nav
        className="flex flex-wrap gap-3 justify-between items-center px-4 py-3 md:px-3 md:py-6 max-w-6xl mx-auto fixed md:relative top-0 left-0 right-0 z-50
    bg-white/5 md:bg-inherit backdrop-blur-xl"
      >
        <Link
          href={"/"}
          className="text-xs md:text-xl font-bold cursor-pointer"
        >
          🧠 MoneyMind
        </Link>

        <div className="flex items-center gap-3">
          {/* 👉 PRIMARY ACTION */}
          <button
            onClick={() => {
              if (session) {
                router.push("/analyze");
              } else {
                setShowLoginModal(true);
              }
            }}
            className="group bg-blue-600 hover:bg-blue-500 px-5 py-2 text-sm md:text-base rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200 ease-out cursor-pointer"
          >
            Try now
            <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>

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

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mt-30 px-6"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-6xl font-bold leading-tight"
        >
          Your AI Financial
          <span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {" "}
            Decision Engine
          </span>
          <br />
          Not Just Another Tracker
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mt-6 max-w-2xl mx-auto"
        >
          Analyze spending. Predict future. Get decisions.
          <br />
          Know what you can afford — before you regret it.
        </motion.p>

        {/* 🔥 DEMO FIRST */}
        <DemoAnalysis />

        {/* 🚀 PRIMARY ACTIONS */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex justify-center gap-4 flex-wrap"
        >
          {/* SECONDARY */}
          <button
            onClick={() => {
              if (session) {
                router.push("/analyze");
              } else {
                setShowLoginModal(true);
              }
            }}
            className="relative group px-6 py-3 rounded-xl text-base md:text-lg font-medium bg-linear-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
          >
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-white/10 blur transition" />
            Get Started
          </button>

          {/* CHAT */}
          <button
            onClick={() =>
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl text-base md:text-lg"
          >
            👀 See How It Works
          </button>
        </motion.div>

        {/* TRUST + PROOF */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs text-gray-500 mt-4">
            Instant analysis • AI-powered decisions
          </p>

          <p className="text-xs text-gray-500 mt-2">
            ⚡ Predicts future expenses • Recommends smarter actions
          </p>
        </motion.div>

        {/* HOW BUTTON */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={() =>
            document
              .getElementById("how-it-works")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="mt-6 bg-gray-800 px-5 py-2 rounded-xl text-xs md:text-sm hover:bg-gray-700"
        >
          🎬 Watch Demo
        </motion.button>
      </motion.section>

      {/* SEPARATOR */}
      <div className="h-px max-w-4xl mx-auto mt-20 bg-linear-to-r from-transparent via-white/20 to-transparent" />

      {/* WHO IT'S FOR */}
      <p className="text-center text-gray-400 mt-12">
        Built for anyone trying to take control of their money—one step at a
        time.
      </p>

      {/* FEATURES */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mt-12 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-6"
      >
        {[
          {
            title: "🧠 AI Behavior Analysis",
            desc: "Detects spending patterns and turns them into simple, actionable insights.",
          },
          {
            title: "⚖️ Smart Financial Decisions",
            desc: "Instant answers to 'Can I afford this?' — clear, practical, and easy to follow.",
          },
          {
            title: "🔮 Future Predictions",
            desc: "See upcoming expenses ahead of time with easy-to-understand forecasts.",
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            variants={item}
            whileHover={{ scale: 1.04, y: -6 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </motion.div>
        ))}
      </motion.section>
      <section className="mt-20 text-center px-6">
        <h2 className="text-2xl font-semibold mb-4">
          🤖 AI That Understands Your Money
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto">
          Built for financial inclusion — whether you're just starting or
          improving habits, MoneyMind understands your behavior and gives
          simple, personalized guidance you can actually follow.
        </p>
      </section>
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="pt-20"
      >
        <h2 className="text-center text-2xl font-semibold mb-6">
          💬 Talk to Your AI Money Guide
        </h2>
        <p className="text-center text-gray-400 mb-10">
          Smart answers for your money, instantly.
        </p>
      </motion.section>

      <div className="flex justify-center items-center">
        <DemoChat />
      </div>

      {/* HOW IT WORKS */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* CTA */}
      <section className="mt-28 text-center pb-20 px-6">
        <h2 className="text-3xl font-bold mt-6 mb-4">
          Start Building Better Money Habits Today
        </h2>

        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          You don’t need to be a finance expert. Start small, understand your
          spending, and improve step by step.
        </p>

        {/* GENTLE NUDGE */}
        <p className="text-xs md:text-sm text-yellow-400 mb-6">
          Even small changes today can make a big difference over time
        </p>

        {/* CTA */}
        <motion.button
          onClick={() => {
            if (session) {
              router.push("/analyze");
            } else {
              setShowLoginModal(true);
            }
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          className="relative px-8 py-4 rounded-xl text-base md:text-lg font-semibold 
    bg-linear-to-r from-blue-500 to-purple-600 
    shadow-xl shadow-blue-500/30 
    hover:shadow-purple-500/30 
    transition-all duration-300"
        >
          🚀 Start My Money Journey
        </motion.button>
      </section>
      <Footer
        loggedIn={loggedIn}
        show={showLoginModal}
        setShow={setShowLoginModal}
      />
    </div>
  );
}
