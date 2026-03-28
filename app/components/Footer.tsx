"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-800 bg-[#020617] text-gray-400">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {/* 🧠 BRAND */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-3">
            🧠 MoneyMind
          </h2>
          <p className="text-sm">
            Fix your money habits, not just your knowledge.
          </p>
          <p className="text-xs mt-3 text-gray-500">
            Built for people who know what to do… but still don’t do it.
          </p>
        </div>

        {/* 🔗 LINKS */}
        <div>
          <h3 className="text-white text-sm font-medium mb-3">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/analyze" className="hover:text-white">
                🧠 Analyze Habits
              </Link>
            </li>
            <li>
              <Link href="/chat" className="hover:text-white">
                💬 Chat with AI
              </Link>
            </li>
            <li>
              <button
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="hover:text-white"
              >
                👀 How it works
              </button>
            </li>
          </ul>
        </div>

        {/* ⚡ TRUST / CTA */}
        <div>
          <h3 className="text-white text-sm font-medium mb-3">
            Start improving today
          </h3>

          <p className="text-sm mb-4">
            Small habits today → big financial impact tomorrow.
          </p>

          <Link
            href="/analyze"
            className="inline-block bg-blue-600 px-5 py-2 rounded-lg text-white text-sm hover:bg-blue-500 transition"
          >
            🧠 Analyze Now
          </Link>

          <p className="text-xs text-gray-500 mt-4">
            No login • No tracking • Private
          </p>
        </div>
      </div>

      {/* 🔻 BOTTOM BAR */}
      <div className="border-t border-gray-800 text-center text-xs py-4 text-gray-500 text-wrap">
        ©{new Date().getFullYear()}&nbsp;MoneyMind. Built for smarter money habits.
        |&nbsp;Made with ❤️ by {" "}
        <Link
          href="https://github.com/Edasgh"
          target="_blank"
          className="underline"
        >
          Eshita Das
        </Link>
      </div>
    </footer>
  );
}
