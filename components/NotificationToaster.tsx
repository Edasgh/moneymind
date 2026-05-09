"use client";
import { useFinance } from "@/hooks/useFinance";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

interface Notification {
  _id: string;
  type:
    | "ANALYSIS_READY"
    | "STATEMENT_UPLOADED"
    | "STATEMENT_PROCESSED"
    | "GOAL_UPDATE"
    | "TRANSACTION_ADDED"
    | "LEVEL_UP"
    | "ACHIEVEMENT_UNLOCKED"
    | "STREAK_UPDATE"
    | "ANALYSIS_SKIPPED";
  read: boolean;
  userId: string;
  message?: string | null;
  title?: string | null;
  metadata?: {
    statementId?: string;
    financeId?: string;
  } | null;
}

const iconMap = {
  ANALYSIS_READY: "🧠✨", // AI finished → smart + completion
  STATEMENT_UPLOADED: "📤", // upload action
  STATEMENT_PROCESSED: "⚙️📊", // processing + data
  GOAL_UPDATE: "🎯", // goal focus
  TRANSACTION_ADDED: "💸", // money movement
  LEVEL_UP: "🆙🎉", // progression
  ACHIEVEMENT_UNLOCKED: "🏆", // reward
  STREAK_UPDATE: "🔥", // consistency
  ANALYSIS_SKIPPED: "⏭️", // skipped state
};

const typeStyles = {
  STATEMENT_UPLOADED: "bg-red-500/15 text-red-300 border border-red-500/30",
  ANALYSIS_READY:
    "bg-purple-500/15 text-purple-300 border border-purple-500/30",

  STATEMENT_PROCESSED: "bg-blue-500/15 text-blue-300 border border-blue-500/30",

  TRANSACTION_ADDED: "bg-red-500/15 text-red-300 border border-red-500/30",

  GOAL_UPDATE: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",

  LEVEL_UP: "bg-green-500/15 text-green-300 border border-green-500/30",

  ACHIEVEMENT_UNLOCKED:
    "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",

  STREAK_UPDATE: "bg-orange-500/15 text-orange-300 border border-orange-500/30",

  ANALYSIS_SKIPPED: "bg-gray-500/10 text-gray-400 border border-white/10",
};

export default function NotificationToaster() {
  const { refresh } = useFinance();
  const [queue, setQueue] = useState<Notification[]>([]);
  const isProcessing = useRef(false); // prevents multiple toasts
  const isRefreshing = useRef(false);

  // =========================
  // 📥 FETCH NOTIFICATIONS
  // =========================
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();

      if (data.notifications?.length > 0) {
        setQueue((prev) => {
          // avoid duplicates
          const existingIds = new Set(prev.map((n) => n._id));
          const newOnes = data.notifications.filter(
            (n: Notification) => !existingIds.has(n._id),
          );
          return [...prev, ...newOnes];
        });
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  // =========================
  // 🔄 SAFE REFRESH HANDLER
  // =========================
  const triggerRefresh = async (type: Notification["type"]) => {
    if (isRefreshing.current) return;

    // Only refresh when AI Analysis is Ready
    if (type !== "ANALYSIS_READY") {
      return;
    }

    try {
      isRefreshing.current = true;
      // small delay → smoother UX (toast first, then refresh)
      setTimeout(async () => {
        await refresh();
        isRefreshing.current = false;
      }, 800);
    } catch (err) {
      console.error("Refresh failed:", err);
      isRefreshing.current = false;
    }
  };

  // =========================
  // 🚀 INITIAL + FOCUS FETCH
  // =========================
  useEffect(() => {
    fetchNotifications();

    const handleFocus = () => fetchNotifications();
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // =========================
  // 🔔 TOAST QUEUE PROCESSOR
  // =========================
  useEffect(() => {
    if (queue.length === 0 || isProcessing.current) return;

    isProcessing.current = true;

    const current = queue[0];

    toast(
      `${iconMap[current.type]} ${current.title ?? "Notification"} - ${current.message ?? ""}`,
      {
        autoClose: 2500,
        className: `text-[10px] px-2 py-1 rounded-md ${
          typeStyles[current.type]
        }`,
        onOpen: () => {
          triggerRefresh(current.type);
        },
        onClose: async () => {
          try {
            // mark as read
            await fetch("/api/notifications/read", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ids: [current._id] }),
            });
          } catch (err) {
            console.error("Mark read failed:", err);
          }

          // remove from queue
          setQueue((prev) => prev.slice(1));

          isProcessing.current = false; // allow next toast
        },
      },
    );
  }, [queue]);

  return null;
}
