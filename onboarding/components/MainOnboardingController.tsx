"use client";
/**
 * MainOnboardingController.tsx
 * ============================
 * Top-level orchestrator for the 5-step "Main Character" onboarding flow.
 * Manages all shared state via React Context (no external lib required).
 * Delegates rendering to Step1_Hook → Step2_Aesthetic → Step3_Occasion
 *                               → Step4_CanvasUpload → Step5_ResultsAndUpsell
 * Persists PersistentNav above all steps.
 *
 * TECH STACK: Next.js, Tailwind CSS, Framer Motion
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import PersistentNav, { ClosetItem, ProfilePrefs } from "./PersistentNav";
import Step1_Hook from "./Step1_Hook";
import Step2_Aesthetic from "./Step2_Aesthetic";
import Step3_Occasion from "./Step3_Occasion";
import Step4_CanvasUpload from "./Step4_CanvasUpload";
import Step5_ResultsAndUpsell from "./Step5_ResultsAndUpsell";

// ── Onboarding Context ────────────────────────────────────────────────────────

export interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  selectedAesthetics: string[];   // Step 2: aesthetic ids
  selectedOccasions: string[];    // Step 3: occasion ids
  selfieBase64: string | null;    // Step 4: selfie data URL
  wardrobeBase64: string | null;  // Step 5A: wardrobe upload
  closetItems: ClosetItem[];      // Digital Closet
  profile: ProfilePrefs;
  isGiftMode: boolean;
  brandInput: string;
  passionInput: string;
  bankInput: string;
}

export interface OnboardingActions {
  goToStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleAesthetic: (id: string) => void;
  toggleOccasion: (id: string) => void;
  setSelfie: (base64: string) => void;
  setWardrobe: (base64: string) => void;
  addClosetItem: (item: ClosetItem) => void;
  saveProfile: (prefs: ProfilePrefs) => void;
  setGiftMode: (on: boolean) => void;
  setBrandInput: (v: string) => void;
  setPassionInput: (v: string) => void;
  setBankInput: (v: string) => void;
}

const defaultProfile: ProfilePrefs = {
  height: 172,
  fit: "regular",
  completionPct: 60,
};

const OnboardingContext = createContext<
  (OnboardingState & OnboardingActions) | null
>(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside MainOnboardingController");
  return ctx;
};

// ── Step transition variants (Framer Motion) ─────────────────────────────────

const stepVariants = {
  enter:  { opacity: 0, y: 28 },
  center: { opacity: 1, y: 0 },
  exit:   { opacity: 0, y: -20 },
};

// ── Controller ────────────────────────────────────────────────────────────────

export default function MainOnboardingController() {
  // ── Shared state ──────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [wardrobeBase64, setWardrobeBase64] = useState<string | null>(null);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [profile, setProfile] = useState<ProfilePrefs>(defaultProfile);
  const [isGiftMode, setIsGiftMode] = useState(false);
  const [brandInput, setBrandInput] = useState("");
  const [passionInput, setPassionInput] = useState("");
  const [bankInput, setBankInput] = useState("");

  // ── Actions ───────────────────────────────────────────────
  const goToStep = useCallback((step: 1 | 2 | 3 | 4 | 5) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(5, s + 1) as 1 | 2 | 3 | 4 | 5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4 | 5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleAesthetic = useCallback((id: string) => {
    setSelectedAesthetics((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleOccasion = useCallback((id: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const setSelfie = useCallback((base64: string) => setSelfieBase64(base64), []);
  const setWardrobe = useCallback((base64: string) => setWardrobeBase64(base64), []);

  const addClosetItem = useCallback((item: ClosetItem) => {
    setClosetItems((prev) => [...prev, item]);
    // Bump profile completion by 5% per item (max 100%)
    setProfile((p) => ({ ...p, completionPct: Math.min(100, p.completionPct + 5) }));
  }, []);

  const saveProfile = useCallback((prefs: ProfilePrefs) => {
    setProfile({ ...prefs, completionPct: Math.min(100, prefs.completionPct + 10) });
  }, []);

  const handleClosetAdd = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newItem: ClosetItem = {
        id: `item_${Date.now()}`,
        label: file.name.replace(/\.[^.]+$/, ""),
        imgUrl: e.target?.result as string,
        category: "top",
      };
      addClosetItem(newItem);
    };
    reader.readAsDataURL(file);
  }, [addClosetItem]);

  // ── Context value ─────────────────────────────────────────
  const contextValue: OnboardingState & OnboardingActions = {
    currentStep, selectedAesthetics, selectedOccasions,
    selfieBase64, wardrobeBase64, closetItems, profile,
    isGiftMode, brandInput, passionInput, bankInput,
    goToStep, nextStep, prevStep,
    toggleAesthetic, toggleOccasion,
    setSelfie, setWardrobe, addClosetItem,
    saveProfile, setGiftMode: setIsGiftMode,
    setBrandInput, setPassionInput, setBankInput,
  };

  // ── Step map ──────────────────────────────────────────────
  const STEP_COMPONENTS: Record<number, React.ReactNode> = {
    1: <Step1_Hook />,
    2: <Step2_Aesthetic />,
    3: <Step3_Occasion />,
    4: <Step4_CanvasUpload />,
    5: <Step5_ResultsAndUpsell />,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {/* Persistent floating UI — always above steps */}
      <PersistentNav
        profile={profile}
        closetItems={closetItems}
        onProfileSave={saveProfile}
        onClosetAdd={handleClosetAdd}
        onGiftMode={() => setIsGiftMode(true)}
      />

      {/* Gift Mode Banner */}
      <AnimatePresence>
        {isGiftMode && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[9998] bg-gradient-to-r from-purple-700 to-pink-600 py-2 px-4 flex items-center justify-between"
          >
            <p className="text-white text-xs font-bold">🎁 Gift Mode Active — styling for someone else</p>
            <button
              onClick={() => setIsGiftMode(false)}
              className="text-white/70 text-xs hover:text-white"
            >
              Exit
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step progress strip */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-[9990]">
        <motion.div
          className="h-full bg-gradient-to-r from-[#39A596] to-purple-500"
          animate={{ width: `${(currentStep / 5) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Main onboarding content */}
      <main className="min-h-screen bg-[#050505] font-sans">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {STEP_COMPONENTS[currentStep]}
          </motion.div>
        </AnimatePresence>
      </main>
    </OnboardingContext.Provider>
  );
}
