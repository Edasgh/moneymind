"use client";

import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { DOMAttributes, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import NotFound from "../not-found";
import UploadStatement from "@/components/UploadStatement";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [income, setIncome] = useState("0");

  // Dummy data (replace with DB later)
  const statements = [
    {
      fileName: "HDFC_Jan.pdf",
      status: "parsed",
      date: "2026-03-01",
    },
    {
      fileName: "ICICI_Feb.csv",
      status: "processing",
      date: "2026-03-10",
    },
  ];

  if (!session) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:p-6 relative">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-62.5 bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Your Profile</h1>
          <p className="text-sm text-gray-400">
            Manage your data & uploaded statements
          </p>
        </div>

        {/* USER INFO */}
        <GlassCard>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">
                {session?.user?.name || "User"}
              </p>
              <p className="text-sm text-gray-400">{session?.user?.email}</p>
            </div>

            <button onClick={() => signOut()} className="text-sm text-red-400">
              Logout
            </button>
          </div>
        </GlassCard>

        {/* FINANCIAL SUMMARY */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard>
            <p className="text-xs text-gray-400 mb-1">Monthly Income</p>
            <input
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="₹25000"
              className="w-full p-3 text-base md:text-sm rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </GlassCard>
          <Card title="Spent" value="₹20,000" red />
          <Card title="Saved" value="₹30,000" green />
        </div>

        {/* STATEMENTS */}
        <GlassCard>
          <div className="flex justify-between mb-4">
            <p className="text-sm text-gray-400">Uploaded Statements</p>

            <button
              onClick={() => setShowUploadModal(true)}
              className="text-xs bg-purple-500/20 px-3 py-1 rounded-lg"
            >
              Upload New
            </button>
          </div>

          {statements.length === 0 ? (
            <p className="text-sm text-gray-500">No statements uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {statements.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex w-full flex-row items-center justify-between gap-2 bg-white/5 p-3 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="text-sm">{s.fileName}</p>
                    <p className="text-xs text-gray-400">{s.date}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={s.status} />

                    <button className="text-xs text-blue-400">View</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* QUICK ACTIONS */}
        <GlassCard>
          <p className="text-sm text-gray-400 mb-3">Quick Actions</p>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <ActionButton onClick={() => router.push("/chat")} label="Ask AI" />
            <ActionButton
              onClick={() => router.push("/analyze")}
              label="View Insights"
            />
          </div>
        </GlassCard>
      </div>
      {/* Modal */}
      {/* Upload bank statement */}
      <UploadStatement
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
      />
    </div>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
      {children}
    </div>
  );
}

function Card({
  title,
  value,
  red,
  green,
}: {
  title: string;
  value: string;
  red?: boolean;
  green?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <p className="text-xs text-gray-400">{title}</p>
      <p
        className={`text-lg font-semibold ${
          red ? "text-red-400" : green ? "text-green-400" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    parsed: "bg-green-500/20 text-green-400",
    processing: "bg-yellow-500/20 text-yellow-400",
    failed: "bg-red-500/20 text-red-400",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[status]}`}>
      {status}
    </span>
  );
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl text-sm transition"
    >
      {label}
    </button>
  );
}
