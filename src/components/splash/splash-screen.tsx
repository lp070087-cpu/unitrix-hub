"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Unitrix triaxial logo symbol — SVG inline
function UnitrixSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="92" stroke="rgba(184,255,46,0.08)" strokeWidth="2" />
      <circle cx="100" cy="100" r="72" stroke="rgba(184,255,46,0.25)" strokeWidth="1" />
      <polygon
        points="100,18 148,46 148,102 100,130 52,102 52,46"
        stroke="rgba(184,255,46,0.08)"
        strokeWidth="1"
      />
      <line x1="32" y1="100" x2="168" y2="100" stroke="#B8FF2E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46.5" y1="150" x2="153.5" y2="50" stroke="#B8FF2E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46.5" y1="50" x2="153.5" y2="150" stroke="#B8FF2E" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill="#B8FF2E" />
      <circle cx="35" cy="100" r="3" fill="#B8FF2E" opacity="0.5" />
      <circle cx="165" cy="100" r="3" fill="#B8FF2E" opacity="0.5" />
      <circle cx="48" cy="148" r="3" fill="#B8FF2E" opacity="0.5" />
      <circle cx="152" cy="52" r="3" fill="#B8FF2E" opacity="0.5" />
      <circle cx="48" cy="52" r="3" fill="#B8FF2E" opacity="0.5" />
      <circle cx="152" cy="148" r="3" fill="#B8FF2E" opacity="0.5" />
    </svg>
  );
}

// Floating particles
function Particle({
  delay,
  x,
  y,
  size,
}: {
  delay: number;
  x: number;
  y: number;
  size: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-accent/20"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, x, y }}
      animate={{
        opacity: [0, 0.6, 0],
        y: [y, y - 80, y - 160],
        x: [x, x + 20, x - 10],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: [0.42, 0, 0.58, 1],
      }}
    />
  );
}

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const shown = sessionStorage.getItem("splash-shown");
    if (shown === "true") {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("splash-shown", "true");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background overflow-hidden"
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ambient glow */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(184,255,46,0.06) 0%, transparent 70%)",
            }}
            animate={{ scale: [0.8, 1.2, 0.9], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
          />

          {/* Particles */}
          <Particle delay={0} x={-120} y={80} size={4} />
          <Particle delay={0.5} x={100} y={-60} size={3} />
          <Particle delay={1} x={-60} y={-100} size={5} />
          <Particle delay={1.5} x={140} y={40} size={3} />
          <Particle delay={2} x={-150} y={-40} size={4} />
          <Particle delay={2.5} x={80} y={100} size={3} />

          {/* Logo container */}
          <motion.div
            className="flex flex-col items-center gap-8 relative z-10"
            initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Symbol */}
            <motion.div
              className="relative"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
            >
              <UnitrixSymbol className="w-40 h-40 md:w-48 md:h-48 drop-shadow-[0_0_50px_rgba(184,255,46,0.2)]" />
            </motion.div>

            {/* Wordmark */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                Unitri<span className="text-accent">x</span>
              </h1>
              <p className="text-xs md:text-sm tracking-[0.3em] text-foreground-dim mt-2 uppercase font-semibold">
                Hub
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
