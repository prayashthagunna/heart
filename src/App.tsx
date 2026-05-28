import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import TextHeart from "./components/TextHeart";

const Typewriter = ({
  text,
  delay = 50,
  onComplete,
}: {
  text: string;
  delay?: number;
  onComplete?: () => void;
}) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      setDisplay(text.slice(0, i + 1));
      i++;

      if (i >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay, onComplete]);

  return <span className="font-mono">{display}</span>;
};

export default function App() {
  const [stage, setStage] = useState<"console" | "reveal">("console");
  const [consoleFinished, setConsoleFinished] = useState(false);

  const canReveal = stage === "console" && consoleFinished;

  return (
    <div
      onClick={() => canReveal && setStage("reveal")}
      className={`relative min-h-screen w-full flex items-center justify-center bg-[#050505] ${
        canReveal ? "cursor-pointer" : ""
      }`}
    >
      <div className="scanline" />

      <AnimatePresence mode="wait">
        {stage === "console" ? (
          <motion.div
            key="console"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-2xl p-8 font-mono text-sm text-white/80"
          >
            <div className="space-y-3">
              <div className="flex gap-2 text-pink-400/60">
                <span>[system]</span>
                <Typewriter
                  text="Initializing heart.PROTOCOL_v2.0..."
                  delay={30}
                  onComplete={() => setConsoleFinished(true)}
                />
              </div>

              <div className="flex gap-2 h-6">
                <span>[status]</span>
                {consoleFinished && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400"
                  >
                    READY
                  </motion.span>
                )}
              </div>

              {consoleFinished && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-8 flex flex-col gap-6"
                >
                  <p className="text-white/40 italic">
                    {"->"} One encrypted package found for you.
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStage("reveal");
                    }}
                    className="px-6 py-3 border border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 text-pink-300 transition"
                  >
                    Decrypt Message
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-screen overflow-hidden"
          >
            <TextHeart />

            {/* LEFT SIDE PANEL (DECRYPTED moved here) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/20 space-y-1"
            >
              <div className="text-pink-400/40">decrypted</div>
              <div className="text-white/10">heart signal active</div>
            </motion.div>

            {/* BOTTOM RIGHT SYSTEM CONTROL */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="absolute bottom-6 right-6 text-[10px] font-mono text-white/20 text-right space-y-1"
            >
              <button
                onClick={() => setStage("console")}
                className="text-white/30 hover:text-white/70 transition"
              >
                re-encrypt
              </button>
            </motion.div>

            {/* TOP LEFT STATUS */}
            <div className="absolute top-6 left-6 text-[10px] font-mono text-white/10">
              <div>heart_protocol // running</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}