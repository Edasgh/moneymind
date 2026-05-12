"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Trash2Icon } from "lucide-react";

export default function StatementsCard({
  finance,
  statements,
  income,
  selectedStatementId,
  setSelectedStatementId,
  setShowUpload,
  deleteStatementLocal
}: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(statements.length / ITEMS_PER_PAGE);

  const paginatedStatements = statements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset page when new statements come
  useEffect(() => {
    setCurrentPage(1);
  }, [statements.length]);

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-white"> 📄 Statements</p>

        <button
          onClick={() => {
            if (Number(income) <= 0) {
              toast.error("Enter your monthly income amount first");
            } else if (finance?.isDemo) {
              toast.error(
                "Bank statement uploads are disabled while using sample data.",
              );
            } else {
              setShowUpload(true);
            }
          }}
          className="text-xs bg-purple-500/20 hover:bg-purple-500/30 transition px-3 py-1 rounded"
        >
          Upload
        </button>
      </div>

      {/* EMPTY STATE */}
      {statements.length === 0 ? (
        <p className="text-xs text-gray-500">No statements uploaded</p>
      ) : (
        <>
          {/* COUNT */}
          <p className="text-[10px] text-gray-500 mb-2">
            {statements.length} statement
            {statements.length > 1 ? "s" : ""}
          </p>

          {/* LIST */}
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {paginatedStatements.map((s: any) => (
              <div
                key={s._id}
                className="flex w-full justify-between items-center gap-5"
              >
                <div
                  onClick={() => {
                    if (selectedStatementId === s._id) {
                      setSelectedStatementId(null);
                    } else {
                      setSelectedStatementId(s._id);
                    }
                  }}
                  className={`p-2 flex-10 rounded cursor-pointer text-xs flex items-center justify-between transition ${
                    selectedStatementId === s._id
                      ? "bg-blue-500/20"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {/* FILE NAME */}
                  <span className="truncate">📄 {s.fileName}</span>

                  {/* OPTIONAL STATUS DOT */}
                  {selectedStatementId === s._id && (
                    <span className="text-[10px] text-blue-400">Selected</span>
                  )}
                </div>
                <button
                  onClick={async () => {
                    const res = await fetch(`/api/statements/${s._id}`, {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    if (res.ok) {
                      toast.success("Statement deleted Successfully!");
                      deleteStatementLocal(s._id);
                    } else {
                      toast.error("Failed to delete Statement!");
                    }
                  }}
                  title="Delete"
                  className="flex-1 text-red-300 hover:text-red-600 cursor-pointer"
                >
                  <Trash2Icon />
                </button>
              </div>
            ))}
          </motion.div>

          {/* PAGINATION */}
          {statements.length > ITEMS_PER_PAGE && (
            <div className="flex justify-between items-center mt-3 text-xs">
              {/* PREV */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded bg-white/10 disabled:opacity-30 hover:bg-white/20 transition"
              >
                ← Prev
              </button>

              {/* PAGE INFO */}
              <span className="text-gray-400">
                Page {currentPage} / {totalPages}
              </span>

              {/* NEXT */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded bg-white/10 disabled:opacity-30 hover:bg-white/20 transition"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
