"use client";
// Origem: SplashScreen do sistema + Iron Man loading screen + Banco XP particles

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CinematicIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const shown = sessionStorage.getItem("landing-intro-shown");
    if (shown === "true") { setVisible(false); return; }
    const t = setTimeout(() => { setVisible(false); sessionStorage.setItem("landing-intro-shown", "true"); }, 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#08080A] flex items-center justify-center overflow-hidden"
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}
        >
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(184,255,46,0.08) 0%, transparent 70%)" }}
            animate={{ scale: [0.8, 1.2, 0.9], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
          />

          {/* Particles — Banco XP */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-accent/30"
              style={{
                width: 2 + Math.random() * 3,
                height: 2 + Math.random() * 3,
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{ opacity: [0, 0.7, 0], y: [0, -60, -120], x: [0, 15, -5] }}
              transition={{ duration: 3 + Math.random() * 2, delay: i * 0.2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
            />
          ))}

          {/* Symbol + Wordmark */}
          <motion.div
            className="flex flex-col items-center gap-6 relative z-10"
            initial={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22,1,0.36,1] }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
            >
              <svg viewBox="0 0 200 200" className="w-32 h-32 md:w-40 md:h-40 drop-shadow-[0_0_40px_rgba(184,255,46,0.2)]">
                <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(184,255,46,0.08)" strokeWidth="2" />
                <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(184,255,46,0.25)" strokeWidth="1" />
                <motion.line x1="32" y1="100" x2="168" y2="100" stroke="#B8FF2E" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ strokeDasharray: 136, strokeDashoffset: 0 }} />
                <motion.line x1="46.5" y1="150" x2="153.5" y2="50" stroke="#B8FF2E" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.6 }} style={{ strokeDasharray: 150, strokeDashoffset: 0 }} />
                <motion.line x1="46.5" y1="50" x2="153.5" y2="150" stroke="#B8FF2E" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.9 }} style={{ strokeDasharray: 150, strokeDashoffset: 0 }} />
                <motion.circle cx="100" cy="100" r="6" fill="#B8FF2E"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 1.4 }} />
              </svg>
            </motion.div>

            <motion.div className="text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-white">
                Unitri<span className="text-[#B8FF2E]">x</span> Hub
              </h1>
              <p className="text-[11px] tracking-[0.3em] text-[#555] mt-2 uppercase font-semibold">Plataforma Premium</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
