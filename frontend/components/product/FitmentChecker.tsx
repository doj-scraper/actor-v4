"use client";

import { useState, useCallback } from "react";
import { Search, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CompatibleModel {
  modelNumber: string;
  marketingName: string;
}

interface FitmentCheckerProps {
  compatibleModels: CompatibleModel[];
}

type MatchState = "idle" | "match" | "no-match";

export function FitmentChecker({ compatibleModels }: FitmentCheckerProps) {
  const [query, setQuery] = useState("");
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [matchedModel, setMatchedModel] = useState<CompatibleModel | null>(null);

  const runCheck = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      if (!trimmed) {
        setMatchState("idle");
        setMatchedModel(null);
        return;
      }

      const normalized = trimmed.toLowerCase();
      const found = compatibleModels.find(
        (m) =>
          m.modelNumber.toLowerCase().includes(normalized) ||
          m.marketingName.toLowerCase().includes(normalized)
      );

      if (found) {
        setMatchState("match");
        setMatchedModel(found);
      } else {
        setMatchState("no-match");
        setMatchedModel(null);
      }
    },
    [compatibleModels]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    runCheck(val);
  };

  const handleClear = () => {
    setQuery("");
    setMatchState("idle");
    setMatchedModel(null);
  };

  const borderColor =
    matchState === "match"
      ? "border-green-500/40"
      : matchState === "no-match"
      ? "border-red-500/30"
      : "border-white/10";

  return (
    <div
      className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${borderColor}`}
      style={{ background: "rgba(17, 23, 37, 0.8)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4 border-b border-white/5">
        <ShieldAlert className="w-4 h-4 text-ct-accent flex-shrink-0" />
        <div>
          <div className="font-mono text-xs text-ct-text uppercase tracking-widest">
            Fitment Checker
          </div>
          <div className="text-xs text-ct-text-secondary mt-0.5">
            Verify compatibility before ordering
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="px-5 py-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ct-text-secondary pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="e.g. A3257 or iPhone 17 Pro Max..."
            className="w-full bg-ct-bg border border-white/10 rounded-lg pl-10 pr-9 py-3 font-mono text-sm text-ct-text placeholder:text-ct-text-secondary/40 focus:outline-none focus:border-ct-accent/50 focus:ring-1 focus:ring-ct-accent/20 transition-all duration-200"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ct-text-secondary hover:text-ct-text transition-colors"
                aria-label="Clear search"
              >
                <XCircle className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Result feedback */}
        <AnimatePresence mode="wait">
          {matchState === "match" && matchedModel && (
            <motion.div
              key="match"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/25"
              style={{ boxShadow: "0 0 20px rgba(34, 197, 94, 0.08)" }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-xs text-green-400/80 uppercase tracking-widest mb-0.5">
                    Confirmed Fit
                  </div>
                  <div className="font-mono text-sm text-green-300 font-semibold">
                    {matchedModel.marketingName}
                    {matchedModel.modelNumber !== matchedModel.marketingName && (
                      <span className="text-green-400/50 font-normal ml-2">
                        ({matchedModel.modelNumber})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-green-400/60 mt-1">
                    This part is verified compatible with your device.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {matchState === "no-match" && (
            <motion.div
              key="no-match"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="mt-3 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20"
            >
              <div className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-xs text-red-400 mb-1">No match found</div>
                  <div className="text-xs text-ct-text-secondary">
                    Check the compatibility matrix below or{" "}
                    <a
                      href="/support"
                      className="text-ct-accent hover:underline transition-colors"
                    >
                      contact our team
                    </a>{" "}
                    to confirm fitment.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Idle hint footer */}
      {matchState === "idle" && compatibleModels.length > 0 && (
        <div className="px-5 pb-4">
          <div className="font-mono text-xs text-ct-text-secondary/50">
            {compatibleModels.length} compatible device
            {compatibleModels.length !== 1 ? "s" : ""} — see matrix below
          </div>
        </div>
      )}
    </div>
  );
}
