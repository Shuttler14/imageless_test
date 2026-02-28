"use client";
/**
 * Step3_Occasion.tsx — Occasion Protocol
 * ========================================
 * Sleek selectable UI chips with Framer Motion tap animations.
 * Multi-select. Advances to Step 4.
 */
import { motion } from "framer-motion";
import { useOnboarding } from "./MainOnboardingController";

const OCCASIONS = [
  { id: "college",  label: "College Fest / Campus",     emoji: "🎓" },
  { id: "office",   label: "Office / Corporate",        emoji: "💼" },
  { id: "pooja",    label: "Pooja / Ethnic Event",      emoji: "🪔" },
  { id: "sangeet",  label: "Sangeet / Family Function", emoji: "💃" },
  { id: "date",     label: "Date Night",                emoji: "🌙" },
  { id: "airport",  label: "Airport Look",              emoji: "✈️" },
  { id: "gym",      label: "Gym / Activewear",          emoji: "🏋️" },
  { id: "casual",   label: "Just Casual Daily Wear",    emoji: "☕" },
];

export default function Step3_Occasion() {
  const { selectedOccasions, toggleOccasion, nextStep, prevStep } = useOnboarding();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 max-w-xl mx-auto">
      <motion.div className="text-center mb-8 w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] font-bold text-[#39A596] uppercase tracking-[0.15em] mb-3">03 / 05</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2">
          Where are we taking this look?
        </h2>
        <p className="text-sm text-zinc-500">Select all that apply to your lifestyle.</p>
      </motion.div>

      <div className="flex flex-wrap gap-3 justify-center mb-10 w-full">
        {OCCASIONS.map((occ, i) => {
          const selected = selectedOccasions.includes(occ.id);
          return (
            <motion.button
              key={occ.id}
              onClick={() => toggleOccasion(occ.id)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.055 }}
              whileTap={{ scale: 0.93 }}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border text-sm font-semibold transition-all ${
                selected
                  ? "border-[#39A596] bg-[#39A596]/10 text-[#39A596]"
                  : "border-white/10 bg-white/3 text-zinc-400 hover:border-white/25 hover:text-white"
              }`}
            >
              <span>{occ.emoji}</span>
              <span>{occ.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 w-full">
        <button onClick={prevStep} className="px-5 py-3 rounded-2xl border border-white/10 text-zinc-500 text-sm font-semibold hover:border-white/25 hover:text-white transition-all">
          ← Back
        </button>
        <motion.button
          onClick={nextStep}
          disabled={selectedOccasions.length === 0}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#39A596] to-[#2d8a7d] text-black font-black text-sm shadow-[0_8px_24px_rgba(57,165,150,0.3)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next: The Canvas →
        </motion.button>
      </div>
    </div>
  );
}
