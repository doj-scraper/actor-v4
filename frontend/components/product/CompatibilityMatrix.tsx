"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CompatibleModel {
  modelNumber: string;
  marketingName: string;
}

interface CompatibilityMatrixProps {
  models: CompatibleModel[];
}

export function CompatibilityMatrix({ models }: CompatibilityMatrixProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <h2 className="heading-display text-xl text-ct-text mb-6 pb-3 border-b border-white/10">
        Compatibility Matrix
      </h2>

      {/* Summary bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-ct-accent/10 border border-ct-accent/20 px-3 py-1.5 rounded-lg">
          <Layers className="w-3.5 h-3.5 text-ct-accent" />
          <span className="font-mono text-xs text-ct-accent">
            {models.length} device{models.length !== 1 ? "s" : ""} verified
          </span>
        </div>
        <span className="text-xs text-ct-text-secondary">
          Cross-compatible part
        </span>
      </div>

      {/* Accordion toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-ct-bg-secondary border border-white/10 hover:border-white/20 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-ct-text">
            {isOpen ? "Hide" : "Show"} all compatible devices
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <ChevronDown className="w-4 h-4 text-ct-accent" />
        </motion.div>
      </button>

      {/* Expandable device list */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl border border-white/8 overflow-hidden">
              {models.map((model, i) => (
                <motion.div
                  key={model.modelNumber}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className={`
                    flex items-center justify-between px-4 py-3 group
                    hover:bg-ct-bg-secondary/60 transition-colors duration-150
                    ${i !== models.length - 1 ? "border-b border-white/5" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="text-sm text-ct-text">{model.marketingName}</span>
                  </div>
                  <span className="font-mono text-xs text-ct-text-secondary bg-ct-bg px-2 py-0.5 rounded border border-white/5">
                    {model.modelNumber}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <p className="font-mono text-xs text-ct-text-secondary/40 uppercase tracking-widest mt-4">
        Compatibility verified by CellTech QC — contact support for edge cases
      </p>
    </div>
  );
}
