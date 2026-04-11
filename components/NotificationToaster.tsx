"use client";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

interface Notification {
  _id: string;
  type:
    | "ANALYSIS_READY"
    | "STATEMENT_UPLOADED"
    | "STATEMENT_PROCESSED"
    | "GOAL_UPDATE";
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
  ANALYSIS_READY: "🎉",
  STATEMENT_UPLOADED: "📄",
  STATEMENT_PROCESSED: "⚙️",
  GOAL_UPDATE: "🎯",
};

export default function NotificationToaster() {
  const [queue, setQueue] = useState<Notification[]>([]);
  const isProcessing = useRef(false); // prevents multiple toasts

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

    toast(`${iconMap[current.type]} ${current.title ?? "Notification"} - ${current.message ?? ""}`, {
      autoClose: 2500,
      onClose: async () => {
        try {
          // ✅ mark as read
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

        isProcessing.current = false; // ✅ allow next toast
      },
    });
  }, [queue]);

  return null;
}
