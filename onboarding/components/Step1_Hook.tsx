"use client";
/**
 * Step1_Hook.tsx — The Hook
 * =========================
 * Premium Framer Motion fade-in with animated gradient text.
 * Single CTA advances to Step 2.
 */
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useOnboarding } from "./MainOnboardingController";

export default function Step1_Hook() {
  const { nextStep } = useOnboarding();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background orbs */}
      {[
        { color: "#39A596", size: 400, x: -100, y: -100, dur: 8 },
        { color: "#7c3aed", size: 300, x: "70%", y: "60%", dur: 10 },
        { color: "#ec4899", size: 220, x: "40%", y: "30%", dur: 6 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size, height: orb.size,
            background: orb.color,
            left: orb.x, top: orb.y,
            filter: "blur(90px)", opacity: 0.22,
          }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-xl"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Badge */}
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block text-[10px] font-black tracking-[0.22em] text-[#39A596] border border-[#39A596]/30 rounded-full px-4 py-1.5 mb-8 uppercase"
        >
          ✦ My Narrative
        </motion.span>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.07] tracking-[-0.03em] mb-5"
        >
          Don't just get dressed.{" "}
          <span
            className="bg-gradient-to-br from-[#39A596] via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Let's curate your story.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-base text-zinc-400 leading-relaxed mb-10"
        >
          Step into your main character energy today.
        </motion.p>

        {/* CTA */}
        <motion.button
          onClick={nextStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(57,165,150,0.45)" }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#39A596] to-[#2d8a7d] text-black font-black text-base rounded-2xl shadow-[0_8px_32px_rgba(57,165,150,0.3)] transition-shadow"
        >
          Curate My Look
          <ArrowRight size={18} />
        </motion.button>

        {/* Scroll hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-10 text-xs text-white/15"
        >
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            Scroll to explore ↓
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  );
}
