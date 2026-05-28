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

  const handleReveal = () => {
    if (canReveal) {
      setStage("reveal");
    }
  };

  return (
    <div
      onClick={handleReveal}
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
            className="w-full max-w-2xl p-8 font-mono text-sm md:text-base text-white/80"
          >
            <div className="space-y-2">
              <div className="flex gap-2 text-pink-soft/60">
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
                  className="pt-8 flex flex-col items-start gap-6"
                >
                  <p className="text-white/40 italic">
                    {">"} One encrypted package found for you.
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStage("reveal");
                    }}
                    className="flex items-center gap-3 px-6 py-3 border border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 text-pink-300 transition-all duration-300"
                  >
                    <span className="font-mono tracking-widest uppercase text-xs">
                      Decrypt Message
                    </span>
                  </button>

                  <p className="text-[10px] text-white/20 animate-pulse">
                    (or just click anywhere)
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-screen flex items-center justify-center overflow-hidden"
          >
            <TextHeart />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="z-20 text-center"
            >
              <h2 className="text-pink-500 font-mono text-xl tracking-[0.3em] uppercase mb-2">
                Decrypted
              </h2>

              <div className="w-12 h-px bg-pink-500/30 mx-auto mb-8" />

              <button
                onClick={() => setStage("console")}
                className="text-white/30 hover:text-white/70 transition text-[10px] uppercase tracking-widest"
              >
                Re-encrypt
              </button>
            </motion.div>

            <div className="absolute top-8 left-8 text-[10px] font-mono text-white/10">
              <div>status: active</div>
              <div>type: emotion</div>
            </div>

            <div className="absolute bottom-8 right-8 text-[10px] font-mono text-white/10">
              heart_protocol // running
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}