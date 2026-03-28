"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HowItWorks from "./components/HowItWorks";
import DemoChat from "./components/DemoChat";
import DemoAnalysis from "./components/DemoAnalysis";
import Footer from "./components/Footer";

export default function Home() {
  const router = useRouter();

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
    <div className="min-h-screen bg-linear-to-br from-[#0f172a] via-[#020617] to-black text-white overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-0.5 py-3 md:p-6 max-w-6xl mx-auto">
        <Link
          href={"/"}
          className="text-xs md:text-xl font-bold cursor-pointer"
        >
          🧠 MoneyMind
        </Link>

        {/* 👉 PRIMARY ACTION */}
        <Link
          href={"/analyze"}
          className="bg-blue-600 px-5 py-2 text-sm md:text-lg rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition"
        >
          🧠 Start Analysing
        </Link>
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
          className="text-4xl md:text-6xl font-bold leading-tight"
        >
          Fix Your <span className="text-blue-500">Money Habits</span>
          <br />
          Not Just Your Knowledge
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mt-6 max-w-2xl mx-auto"
        >
          You don’t have a money problem — you have a habit problem.
          <br />
          And it’s quietly draining your bank account every month.
        </motion.p>

        {/* LIVE EXAMPLE */}
        <DemoAnalysis />

        {/* 👉 MAIN CTA SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-0 lg:mt-8 flex justify-center gap-4 flex-wrap"
        >
          {/* 🔥 PRIMARY CTA */}
          <Link
            href={"/analyze"}
            className="bg-blue-600 px-6 py-3 rounded-xl text-lg"
          >
            🧠 Analyze My Habits
          </Link>

          {/* 💬 SECONDARY CTA */}
          <Link
            href={"/chat"}
            className="bg-gray-800 px-6 py-3 rounded-xl text-lg"
          >
            💬 Get Instant Advice
          </Link>
        </motion.div>
        {/* Other CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {/* DEMO LINK */}
          <Link
            href={"/chat"}
            className="text-sm text-blue-400 underline mt-3 block"
          >
            Try a sample conversation →
          </Link>
          {/* TRUST */}
          <p className="text-xs text-gray-500 mt-4">
            No login required • No data stored • 100% private
          </p>

          {/* SOCIAL PROOF */}
          <p className="text-xs text-gray-500 mt-2">
            🔥 1,000+ habits analyzed this week
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
          className="mt-6 bg-gray-800 px-5 py-2 rounded-xl text-sm hover:bg-gray-700"
        >
          👀 See How It Works
        </motion.button>
      </motion.section>

      {/* SEPARATOR */}
      <div className="h-px bg-gray-800 max-w-4xl mx-auto mt-20" />

      {/* WHO IT'S FOR */}
      <p className="text-center text-gray-400 mt-12">
        Built for people who know what to do… but still don’t do it.
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
            title: "🧠 Why You Overspend",
            desc: "Identify emotional triggers behind Swiggy, Amazon & impulse buys.",
          },
          {
            title: "💬 Talk It Out",
            desc: "Confess your habits and get brutally honest AI feedback.",
          },
          {
            title: "⚡ Real Cost of Habits",
            desc: "See how small daily spends turn into ₹50,000+ yearly losses.",
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            variants={item}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-6 bg-gray-900 rounded-2xl border border-gray-800"
          >
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </motion.div>
        ))}
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="pt-20"
      >
        <h2 className="text-center text-2xl font-semibold mb-6">
          💬 Just talk it out
        </h2>
        <p className="text-center text-gray-400 mb-10">
          Not ready for analysis? Start with a simple conversation.
        </p>
      </motion.section>

      {/* LIVE CHAT EXAMPLE */}
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
          Start Improving Your Financial Habits Today
        </h2>

        <p className="text-gray-400 mb-6">
          Most people never fix their money habits.
          <br />
          Start before it compounds.
        </p>

        {/* URGENCY */}
        <p className="text-sm text-red-400 mb-6">
          Every month you delay = more money lost silently
        </p>

        {/* 🔥 FINAL CTA */}
        <motion.button
          onClick={() => router.push("/analyze")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 px-8 py-4 rounded-xl text-lg"
        >
          🧠 Fix My Money Habits
        </motion.button>
      </section>
      <Footer />
    </div>
  );
}
