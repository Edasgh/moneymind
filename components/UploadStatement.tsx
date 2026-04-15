"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function UploadStatement({
  showUploadModal,
  setShowUploadModal,
  setTransactions,
  setSummary,
}: {
  showUploadModal: boolean;
  setShowUploadModal: React.Dispatch<React.SetStateAction<boolean>>;
  setTransactions?: React.Dispatch<any>;
  setSummary?: React.Dispatch<any>;
}) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<
    "idle" | "uploading" | "queued" | "processing"
  >("idle");

  // =========================
  // 🔁 POLLING FUNCTION
  // =========================
  const pollStatus = async (statementId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/statements/${statementId}`);
        const data = await res.json();

        if (data.status === "processing") {
          setStep("processing");
        }

        if (data.status === "parsed") {
          clearInterval(interval);

          toast.success("Analysis complete 🚀");

          if (setTransactions && setSummary) {
            setTransactions(data.extractedTransactions);
            setSummary(data.summary);
          } else {
            router.push("/analyze");
          }

          setLoading(false);
          setShowUploadModal(false);
          setFile(null);
        }

        if (data.status === "failed") {
          setStep("queued"); // retry will happen automatically
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // every 3 sec
  };

  // =========================
  // 📤 UPLOAD HANDLER
  // =========================
  const handleUpload = async () => {
    if (!file || loading) return;

    setLoading(true);
    setStep("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);

    try {
      // ONLY upload (no AI here)
      const uploadRes = await fetch("/api/uploadFile", {
        method: "POST",
        body: formData,
      });

      if (uploadRes.status !== 200) throw new Error("Upload failed");

      const resData = await uploadRes.json();

      const statementId = resData.statementId;

      // queued for worker
      setStep("queued");

      try {
        const res = await fetch("/api/internal/trigger-workers");

        if (!res.ok) {
          throw new Error("Worker trigger failed");
        }

        // 🔥 Smooth UX → move to processing early
        setTimeout(() => {
          setStep("processing");
        }, 1200);
      } catch (err) {
        console.error("Worker trigger error:", err);

        // Don't block user — cron will still process
        toast.warn("Processing may be delayed...");
      }

      // start polling
      pollStatus(statementId);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
      setStep("idle");
    }
  };

  return (
    <>
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">
          <div className="bg-black border border-white/10 rounded-2xl p-5 w-full max-w-md">
            <ToastContainer
              position="top-right"
              autoClose={1300}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />

            <div className="flex justify-between mb-4">
              <h2 className="text-lg">Upload Statement</h2>
              <button onClick={() => setShowUploadModal(false)}>✕</button>
            </div>

            <div className="space-y-4">
              {/* FILE INPUT */}
              <input
                type="file"
                accept=".pdf,.csv"
                disabled={loading}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-300 file:bg-white/10 file:border-0 file:px-3 file:py-2 file:rounded-lg file:text-white"
              />

              {/* FILE PREVIEW */}
              {file && (
                <p className="text-xs text-gray-400">Selected: {file.name}</p>
              )}

              {/* BUTTON */}
              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg bg-purple-500/20 disabled:opacity-50"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                )}

                {step === "uploading" && "Uploading..."}
                {step === "queued" && "Queued..."}
                {step === "processing" && "Analyzing your finances..."}
                {step === "idle" && "Upload & Analyze"}
              </button>

              {/* STATUS TEXT */}
              {loading && (
                <p className="text-xs text-gray-400 text-center">
                  {step === "uploading" && "Uploading your file..."}
                  {step === "queued" && "Preparing Analysis..."}
                  {step === "processing" && "AI is analyzing your spending..."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
