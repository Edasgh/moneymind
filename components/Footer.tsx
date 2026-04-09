"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SignInModal from "./SignInModal";
import { useSession } from "next-auth/react";

export default function Footer({
  loggedIn,
  show,
  setShow,
}: {
  loggedIn: boolean;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  return (
    <>
      <SignInModal show={show} setShow={setShow} />
      <footer className="relative mt-32 text-gray-400">
        {/* 🔥 BACKGROUND GLOW */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-175 h-75 bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        {/* MAIN */}
        <div
          className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10 
      border-t border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl"
        >
          {/* 🧠 BRAND */}
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">
              🧠 MoneyMind
            </h2>

            <p className="text-sm leading-relaxed">
              Fix your money habits, not just your knowledge.
            </p>

            <p className="text-xs mt-3 text-gray-500 leading-relaxed">
              Built for people who know what to do… but still don’t do it.
            </p>
          </div>

          {/* 🔗 LINKS */}
          <div>
            <h3 className="text-white text-sm font-medium mb-4 tracking-wide">
              Explore
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => {
                    if (loggedIn) {
                      router.push("/analyze");
                    } else {
                      setShow(true);
                    }
                  }}
                  className="hover:text-white transition flex items-center gap-2"
                >
                  🧠 Analyze Habits →
                </button>
              </li>

              <li>
                <Link
                  href="/chat"
                  className="hover:text-white transition flex items-center gap-2"
                >
                  💬 Chat with AI →
                </Link>
              </li>

              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-white transition flex items-center gap-2"
                >
                  👀 How it works →
                </button>
              </li>
            </ul>
          </div>

          {/* ⚡ CTA */}
          <div>
            <h3 className="text-white text-sm font-medium mb-4 tracking-wide">
              Start improving today
            </h3>

            <p className="text-sm mb-5 leading-relaxed">
              Small habits today → big financial impact tomorrow.
            </p>

            {/* 🔥 PREMIUM BUTTON */}
            <button
              onClick={() => {
                if (loggedIn) {
                  router.push("/analyze");
                } else {
                  setShow(true);
                }
              }}
              className="relative inline-block px-6 py-3 rounded-xl text-sm font-medium 
           bg-linear-to-r from-blue-500 to-purple-500 
            shadow-lg text-white shadow-blue-500/20 hover:shadow-blue-500/40 
            transition-all duration-300 hover:scale-105"
            >
              🧠 Analyze Now
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Private • Instant insights
            </p>
          </div>
        </div>

        {/* 🔻 BOTTOM BAR */}
        <div className="mt-10 text-center text-xs text-gray-500 pb-6 px-4">
          <div className="h-pxbg-linear-to-r from-transparent via-white/20 to-transparent mb-4" />
          © {new Date().getFullYear()} MoneyMind. Built for smarter money
          habits.
          <br className="md:hidden" />
          <span className="ml-1">
            Made with ❤️ by{" "}
            <Link
              href="https://github.com/Edasgh"
              target="_blank"
              className="underline hover:text-white transition"
            >
              Eshita Das
            </Link>
          </span>
        </div>
      </footer>
    </>
  );
}
