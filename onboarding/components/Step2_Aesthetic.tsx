"use client";
/**
 * Step2_Aesthetic.tsx — Aesthetic Selection
 * ==========================================
 * Masonry-style grid of 8 fashion images.
 * CRITICAL DIVERSITY RULE: 4 Men + 4 Women, explicitly mapped.
 * Multi-select with Framer Motion checkmark animation.
 */
import { motion } from "framer-motion";
import { useOnboarding } from "./MainOnboardingController";

// ── 50/50 Aesthetic Data ──────────────────────────────────────────────────────
// 4 Men (indices 0-3) + 4 Women (indices 4-7)
// All 8 distinct styles as specified in the brief.

const AESTHETICS = [
  // ── MEN (4) ──────────────────────────────────────────────
  {
    id: "old_money_m", style: "Old Money", name: "The Heritage Edit", gender: "M" as const,
    img: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=533&fit=crop&crop=top",
    accent: "#a8916e",
  },
  {
    id: "street_m", style: "Street Style", name: "Urban Architect", gender: "M" as const,
    img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=533&fit=crop&crop=top",
    accent: "#f59e0b",
  },
  {
    id: "indo_western_m", style: "Indo-Western Fusion", name: "Desi Modernist", gender: "M" as const,
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=533&fit=crop&crop=top",
    accent: "#ef4444",
  },
  {
    id: "corporate_m", style: "Corporate Core", name: "Power Suit Era", gender: "M" as const,
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=533&fit=crop&crop=top",
    accent: "#6366f1",
  },
  // ── WOMEN (4) ─────────────────────────────────────────────
  {
    id: "minimalist_f", style: "Minimalist", name: "The Edit", gender: "F" as const,
    img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=533&fit=crop&crop=top",
    accent: "#e4e4e4",
  },
  {
    id: "y2k_f", style: "Y2K Chrome", name: "Millennial Glitch", gender: "F" as const,
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=533&fit=crop&crop=top",
    accent: "#c0c0c0",
  },
  {
    id: "cyberpunk_f", style: "Cyberpunk", name: "Neon Manifesto", gender: "F" as const,
    img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=533&fit=crop&crop=top",
    accent: "#00ff87",
  },
  {
    id: "casual_f", style: "Casual Essentials", name: "The Daily Uniform", gender: "F" as const,
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=533&fit=crop&crop=top",
    accent: "#fb923c",
  },
];

export default function Step2_Aesthetic() {
  const { selectedAesthetics, toggleAesthetic, nextStep, prevStep } = useOnboarding();
  const n = selectedAesthetics.length;

  return (
    <div className="min-h-screen flex flex-col px-4 py-24 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[11px] font-bold text-[#39A596] uppercase tracking-[0.15em] mb-3">02 / 05</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2">
          What kind of energy are we projecting?
        </h2>
        <p className="text-sm text-zinc-500">Choose your favorites — pick as many as feel right.</p>
      </motion.div>

      {/* 2×4 Grid (responsive: 2 cols mobile, 4 cols tablet+) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {AESTHETICS.map((a, i) => {
          const selected = selectedAesthetics.includes(a.id);
          return (
            <motion.button
              key={a.id}
              onClick={() => toggleAesthetic(a.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`relative rounded-2xl overflow-hidden aspect-[3/4] border-2 transition-all ${
                selected ? "border-[#39A596]" : "border-transparent"
              }`}
              aria-label={`${a.style} — ${a.name}`}
              aria-pressed={selected}
            >
              {/* Image */}
              <img
                src={a.img} alt={a.name}
                className="w-full h-full object-cover block"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=533&fit=crop"; }}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Gender badge */}
              <div className={`absolute top-2 left-2 text-[9px] font-bold rounded-full px-2 py-0.5 ${
                a.gender === "M"
                  ? "bg-blue-400/20 border border-blue-400/40 text-blue-300"
                  : "bg-pink-400/20 border border-pink-400/40 text-pink-300"
              }`}>
                {a.gender === "M" ? "♂ Men" : "♀ Women"}
              </div>

              {/* Selected checkmark */}
              <AnimateCheckmark visible={selected} />

              {/* Labels */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p className="text-[9px] font-black uppercase tracking-wider mb-0.5" style={{ color: a.accent }}>
                  {a.style}
                </p>
                <p className="text-[11px] font-bold text-white leading-tight">{a.name}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={prevStep}
          className="px-5 py-3 rounded-2xl border border-white/10 text-zinc-500 text-sm font-semibold hover:border-white/25 hover:text-white transition-all"
        >
          ← Back
        </button>
        <span className="text-xs text-zinc-600">
          {n === 0 ? "Select at least one" : `${n} selected`}
        </span>
        <motion.button
          onClick={nextStep}
          disabled={n === 0}
          whileHover={n > 0 ? { y: -2 } : {}}
          whileTap={n > 0 ? { scale: 0.97 } : {}}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#39A596] to-[#2d8a7d] text-black font-black text-sm shadow-[0_8px_24px_rgba(57,165,150,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next: Set the Occasion →
        </motion.button>
      </div>
    </div>
  );
}

// ── Animated checkmark sub-component ─────────────────────────────────────────
function AnimateCheckmark({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={visible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#39A596] flex items-center justify-center text-black text-xs font-black"
    >
      ✓
    </motion.div>
  );
}
