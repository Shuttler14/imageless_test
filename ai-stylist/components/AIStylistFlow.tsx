"use client";

/**
 * MY NARRATIVE — AI Stylist Flow (Main Orchestrator)
 * ====================================================
 * Manages the 5-step Zero-Friction styling experience:
 *   Step 1A → Occasion selector (visual tiles, no text input)
 *   Step 1B → Vibe Card swiper (Tinder-style)
 *   Step 2  → Photo upload (drag-and-drop data ingestion)
 *   Step 3  → Dopamine loading screen + result reveal
 *   Step 4  → VibeCardResult with affiliate upsell (rendered as child)
 *   Step 5  → Gamification modals (Mascot Quest + Style Graph)
 *
 * API Base: process.env.NEXT_PUBLIC_STYLIST_API_URL
 *   (points to your FastAPI instance, e.g. https://api.mynarrative.in)
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Upload, ChevronRight, ChevronLeft, X, RefreshCw, Star } from "lucide-react";
import VibeCardResult from "./VibeCardResult";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Occasion {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export interface VibeCard {
  vibe_id: string;
  label: string;
  description: string;
  flux_style_keywords: string;
}

export interface UserSelections {
  occasion: string;
  occasionLabel: string;
  vibe_id: string;
  vibe_label: string;
  flux_style_keywords: string;
}

export interface GenerationResult {
  session_id: string;
  final_image_base64: string;
  flux_prompt_used: string;
  biometrics: {
    monk_skin_tone: number;
    monk_skin_hex: string;
    monk_skin_label: string;
    body_type: string;
  };
  wardrobe: {
    items: Array<{ category: string; label: string; dominant_colors: string[] }>;
  };
  generated_items: string[];
  affiliate_recommendations: AffiliateRec[];
}

export interface AffiliateRec {
  item_type: string;
  item_name: string;
  brand: string;
  price: number;
  discounted_price: number;
  affiliate_url: string;
  image_url: string;
  bank_offer: string;
  why_it_works: string;
  completion_pct: number;
  is_gap_item: boolean;
}

type FlowStep = "occasion" | "vibe" | "upload" | "loading" | "result" | "gamification";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_STYLIST_API_URL ?? "https://api.mynarrative.in";

const OCCASIONS: Occasion[] = [
  { id: "date_night",  label: "Date Night",   emoji: "🌙", description: "Romantic, elevated, unforgettable." },
  { id: "office",      label: "Office",        emoji: "💼", description: "Power dressing. Own the room." },
  { id: "sangeet",     label: "Sangeet",       emoji: "💃", description: "Festive, vibrant, celebration-ready." },
  { id: "airport",     label: "Airport Look",  emoji: "✈️", description: "Effortless transit. Runway in the terminal." },
];

const DEFAULT_VIBES: VibeCard[] = [
  { vibe_id: "surviving_on_caffeine", label: "Surviving on Caffeine",  description: "That 3am grind energy. Oversized, cozy, unbothered.", flux_style_keywords: "oversized hoodie, relaxed fit, muted tones, moody lighting" },
  { vibe_id: "sarcastic_rizzler",     label: "The Sarcastic Rizzler",  description: "Main character syndrome. Bold fits, zero apologies.",   flux_style_keywords: "bold streetwear, statement pieces, confident, high contrast" },
  { vibe_id: "quiet_luxury",          label: "Quiet Luxury",           description: "Let the fabric speak. Minimal, elevated, intentional.", flux_style_keywords: "minimalist luxury, neutral palette, tailored silhouette" },
  { vibe_id: "cottagecore_chaos",     label: "Cottagecore Chaos",      description: "Pinterest board escaped into real life. Soft but feral.", flux_style_keywords: "floral prints, earthy tones, golden hour, romantic styling" },
];

const LOADING_STAGES = [
  { text: "Analysing Skin Tone…",     duration: 2200 },
  { text: "Mapping Your Wardrobe…",   duration: 2000 },
  { text: "Building FLUX Prompt…",    duration: 1800 },
  { text: "Generating Editorial Look…", duration: 3500 },
  { text: "Applying Your Identity…",  duration: 2500 },
  { text: "Adding Final Touches…",    duration: 1500 },
];

// ─── Step 1A: Occasion Selector ───────────────────────────────────────────────

function OccasionSelector({
  selected,
  onSelect,
  onNext,
}: {
  selected: string | null;
  onSelect: (o: Occasion) => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      key="occasion"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto px-4"
    >
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Step 1 of 5</p>
        <h2 className="text-2xl font-black text-white tracking-tight">Where are we heading?</h2>
        <p className="text-sm text-zinc-500">Pick your occasion. We'll build your look around it.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {OCCASIONS.map((occ) => (
          <motion.button
            key={occ.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(occ)}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-6 text-center transition-all duration-200 ${
              selected === occ.id
                ? "border-[#39A596] bg-[#39A596]/10 shadow-[0_0_20px_rgba(57,165,150,0.2)]"
                : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8"
            }`}
          >
            <span className="text-3xl">{occ.emoji}</span>
            <span className="text-sm font-bold text-white">{occ.label}</span>
            <span className="text-[11px] text-zinc-500 leading-snug">{occ.description}</span>
            {selected === occ.id && (
              <motion.div
                layoutId="occasion-check"
                className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#39A596] flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <span className="text-[10px] text-black font-bold">✓</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#39A596] text-black font-bold py-4 text-sm hover:bg-[#2d8a7d] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Set the Scene <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Step 1B: Vibe Card Swiper (Tinder-style) ─────────────────────────────────

function VibeSwiper({
  vibes,
  onSelect,
  onBack,
}: {
  vibes: VibeCard[];
  onSelect: (v: VibeCard) => void;
  onBack: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);

  const current = vibes[currentIdx];

  function handleSwipe(direction: "left" | "right") {
    if (direction === "right") {
      setSelected(current.vibe_id);
      onSelect(current);
    } else {
      const next = (currentIdx + 1) % vibes.length;
      setCurrentIdx(next);
    }
  }

  return (
    <motion.div
      key="vibe"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto px-4"
    >
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Step 2 of 5</p>
        <h2 className="text-2xl font-black text-white tracking-tight">Pick your vibe</h2>
        <p className="text-sm text-zinc-500">Swipe right to choose. Left to skip.</p>
      </div>

      {/* Card Stack */}
      <div className="relative w-full h-72 flex items-center justify-center">
        {/* Background card (next) */}
        {vibes[(currentIdx + 1) % vibes.length] && (
          <div className="absolute inset-0 rounded-3xl border border-white/8 bg-white/4 scale-95 translate-y-3" />
        )}

        {/* Current card — draggable */}
        <motion.div
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
          onDragEnd={(_, info) => {
            if (info.offset.x > 100) handleSwipe("right");
            else if (info.offset.x < -100) handleSwipe("left");
          }}
          className="absolute inset-0 rounded-3xl border border-white/15 bg-gradient-to-br from-zinc-900 to-black p-7 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
        >
          {/* LIKE / NOPE overlays */}
          <motion.div style={{ opacity: likeOpacity }} className="absolute top-5 left-5 rotate-[-20deg] border-2 border-[#39A596] rounded-xl px-3 py-1 text-[#39A596] font-black text-lg uppercase tracking-wider">
            VIBE ✓
          </motion.div>
          <motion.div style={{ opacity: nopeOpacity }} className="absolute top-5 right-5 rotate-[20deg] border-2 border-red-500 rounded-xl px-3 py-1 text-red-500 font-black text-lg uppercase tracking-wider">
            SKIP ✗
          </motion.div>

          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3 font-semibold">
              {currentIdx + 1} / {vibes.length}
            </p>
            <h3 className="text-xl font-black text-white mb-3 leading-tight">{current.label}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{current.description}</p>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {current.flux_style_keywords.split(", ").slice(0, 4).map((kw) => (
              <span key={kw} className="text-[10px] border border-white/10 text-zinc-500 rounded-full px-2.5 py-0.5">
                #{kw.replace(/ /g, "_")}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Manual swipe buttons */}
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => handleSwipe("left")}
          className="flex-1 py-3 rounded-2xl border border-white/10 bg-white/5 text-sm text-zinc-400 hover:border-white/25 hover:text-white transition-all font-semibold"
        >
          Skip →
        </button>
        <button
          onClick={() => handleSwipe("right")}
          className="flex-1 py-3 rounded-2xl bg-[#39A596] text-black text-sm font-bold hover:bg-[#2d8a7d] transition-colors"
        >
          This is me ✓
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 2: Photo Upload ─────────────────────────────────────────────────────

function PhotoUpload({
  onUpload,
  onBack,
}: {
  onUpload: (base64: string) => void;
  onBack: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Resize + compress before sending to backend (mirrors existing VTO widget logic)
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_W = 1024;
        const scale = MAX_W / img.width;
        canvas.width = MAX_W;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        setPreview(compressed);
        // Strip data URI prefix — backend expects raw base64
        onUpload(compressed.replace(/^data:image\/\w+;base64,/, ""));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, [onUpload]);

  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4"
    >
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Step 3 of 5</p>
        <h2 className="text-2xl font-black text-white tracking-tight">Your Magic Image</h2>
        <p className="text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
          Upload a recent photo of yourself in a full outfit. We'll extract your fit and generate your editorial look.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) processFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative w-full rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
          isDragging
            ? "border-[#39A596] bg-[#39A596]/10 shadow-[0_0_30px_rgba(57,165,150,0.2)]"
            : "border-white/15 bg-white/4 hover:border-[#39A596]/60 hover:bg-[#39A596]/5"
        }`}
        style={{ minHeight: preview ? "auto" : "220px" }}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full rounded-3xl object-cover max-h-80" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-3xl">
              <p className="text-white text-sm font-semibold">Click to change photo</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#39A596]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Drop your photo here</p>
              <p className="text-xs text-zinc-600 mt-1">or click to browse · JPG, PNG · max 10MB</p>
            </div>
            <p className="text-[11px] text-zinc-700 mt-2 max-w-xs leading-relaxed">
              Best results: good lighting, full-body or half-body standing pose, clear background
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
      />

      {/* Privacy note */}
      <p className="text-[11px] text-zinc-700 text-center max-w-xs leading-relaxed">
        🔒 Your photo is processed securely and never stored publicly. It powers your personal Style Graph.
      </p>

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Vibe
      </button>
    </motion.div>
  );
}

// ─── Step 3: Dopamine Loading Screen ──────────────────────────────────────────

function LoadingScreen() {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i < LOADING_STAGES.length - 1) {
        const timer = setTimeout(() => {
          i++;
          setStageIdx(i);
          tick();
        }, LOADING_STAGES[i].duration);
        return () => clearTimeout(timer);
      }
    };
    tick();
  }, []);

  const totalDuration = LOADING_STAGES.reduce((s, l) => s + l.duration, 0);
  const elapsedDuration = LOADING_STAGES.slice(0, stageIdx + 1).reduce((s, l) => s + l.duration, 0);
  const progressPct = Math.min(95, (elapsedDuration / totalDuration) * 100);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto px-4 py-12"
    >
      {/* Animated pulsing orb */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-[#39A596]/30"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#39A596] to-[#2d7a6e] flex items-center justify-center"
        >
          <span className="text-2xl">✨</span>
        </motion.div>
      </div>

      {/* Stage text */}
      <div className="text-center space-y-2 min-h-[60px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-lg font-bold text-white tracking-tight"
          >
            {LOADING_STAGES[stageIdx].text}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-zinc-600">My Narrative AI is weaving your look…</p>
      </div>

      {/* Progress bar */}
      <div className="w-full space-y-2">
        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#39A596] to-[#2d8a7d]"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-700">
          <span>{LOADING_STAGES[stageIdx].text.replace("…", "")}</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
      </div>

      {/* Stage dots */}
      <div className="flex gap-2">
        {LOADING_STAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i === stageIdx ? 1.3 : 1, opacity: i <= stageIdx ? 1 : 0.25 }}
            className="w-1.5 h-1.5 rounded-full bg-[#39A596]"
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Step 5: Gamification Modal ────────────────────────────────────────────────

function GamificationModal({
  onClose,
  onUploadOOTD,
}: {
  onClose: () => void;
  onUploadOOTD: (file: File) => void;
}) {
  const mascotCards = 1;     // In production: fetch from user profile API
  const totalMascot = 5;
  const ootdUploads = 1;     // In production: fetch from user profile API
  const ootdNeeded = 3;

  const ootdRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-7 space-y-6 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-black text-white">Your Style Journey</h2>
          <p className="text-xs text-zinc-500 mt-1">Unlock rewards as you build your Style DNA.</p>
        </div>

        {/* Component 1: Mascot Quest */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🃏</span>
            <div>
              <p className="text-sm font-bold text-white">Mascot Quest</p>
              <p className="text-xs text-zinc-500">{mascotCards}/{totalMascot} Cards Collected</p>
            </div>
          </div>

          {/* Card progress dots */}
          <div className="flex gap-2">
            {Array.from({ length: totalMascot }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-7 rounded-lg border flex items-center justify-center text-xs font-bold transition-colors ${
                  i < mascotCards
                    ? "border-[#39A596] bg-[#39A596]/20 text-[#39A596]"
                    : "border-white/10 bg-white/4 text-zinc-700"
                }`}
              >
                {i < mascotCards ? <Star className="w-3 h-3 fill-[#39A596]" /> : "?"}
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Complete a checkout to unlock your next physical Mascot Card.
            Collect all 5 to unlock <span className="text-white font-semibold">Founder Tier status</span>.
          </p>

          <button className="w-full py-3 rounded-xl bg-[#39A596] text-black font-bold text-sm hover:bg-[#2d8a7d] transition-colors">
            Shop Now to Unlock Next Card →
          </button>
        </div>

        {/* Component 2: Style Graph Builder */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <p className="text-sm font-bold text-white">Train Your AI</p>
              <p className="text-xs text-zinc-500">{ootdUploads}/{ootdNeeded} OOTD Photos Uploaded</p>
            </div>
          </div>

          {/* OOTD progress bar */}
          <div className="space-y-1.5">
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${(ootdUploads / ootdNeeded) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>Upload {ootdNeeded - ootdUploads} more to unlock</span>
              <span className="text-purple-400 font-semibold">5% Store Credit</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Upload 3 Outfit of the Day photos to train your personal AI stylist and unlock{" "}
            <span className="text-purple-300 font-semibold">5% Store Credit</span> on your next order.
          </p>

          <button
            onClick={() => ootdRef.current?.click()}
            className="w-full py-3 rounded-xl border border-purple-800/60 bg-purple-950/30 text-purple-300 font-bold text-sm hover:bg-purple-900/40 transition-colors"
          >
            📸 Upload OOTD Photo
          </button>
          <input
            ref={ootdRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadOOTD(f); }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main AIStylistFlow Orchestrator ──────────────────────────────────────────

export default function AIStylistFlow() {
  const [step, setStep] = useState<FlowStep>("occasion");
  const [selections, setSelections] = useState<Partial<UserSelections>>({});
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGamification, setShowGamification] = useState(false);
  const [vibes, setVibes] = useState<VibeCard[]>(DEFAULT_VIBES);

  // Fetch live vibes from backend on mount (falls back to DEFAULT_VIBES)
  useEffect(() => {
    fetch(`${API_BASE}/api/vibes`)
      .then((r) => r.json())
      .then((data) => { if (data.vibes?.length) setVibes(data.vibes); })
      .catch(() => {}); // silent fallback
  }, []);

  // ── Step 1A handler ─────────────────────────────────────────────────────────
  function handleOccasionSelect(occ: Occasion) {
    setSelections((prev) => ({
      ...prev,
      occasion: occ.id,
      occasionLabel: occ.label,
    }));
  }

  // ── Step 1B handler ─────────────────────────────────────────────────────────
  function handleVibeSelect(vibe: VibeCard) {
    setSelections((prev) => ({
      ...prev,
      vibe_id: vibe.vibe_id,
      vibe_label: vibe.label,
      flux_style_keywords: vibe.flux_style_keywords,
    }));
    // Auto-advance to upload step after vibe is chosen
    setTimeout(() => setStep("upload"), 400);
  }

  // ── Step 2 handler ─────────────────────────────────────────────────────────
  function handleImageUpload(base64: string) {
    setImageBase64(base64);
    // Auto-advance to loading + trigger pipeline
    setStep("loading");
    runPipeline(base64);
  }

  // ── Step 3: Call backend pipeline ─────────────────────────────────────────
  async function runPipeline(base64: string) {
    setError(null);
    try {
      const payload = {
        selections: {
          occasion: selections.occasionLabel ?? "Casual",
          vibe_id: selections.vibe_id ?? "sarcastic_rizzler",
          vibe_label: selections.vibe_label ?? "The Sarcastic Rizzler",
          flux_style_keywords: selections.flux_style_keywords ?? "bold streetwear",
        },
        image_base64: base64,
      };

      const resp = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail ?? `Server error ${resp.status}`);
      }

      const data: GenerationResult & { success: boolean } = await resp.json();

      if (!data.success) throw new Error("Pipeline returned failure");

      setResult(data);
      setStep("result");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setStep("upload"); // Return to upload on error
    }
  }

  // ── Step 5: OOTD upload ────────────────────────────────────────────────────
  async function handleOOTDUpload(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("user_id", "guest_session"); // Replace with real Shopify customer ID

    try {
      await fetch(`${API_BASE}/api/style-graph/upload`, {
        method: "POST",
        body: formData,
      });
    } catch (e) {
      console.warn("OOTD upload failed silently:", e);
    }
  }

  // ── Reset flow ─────────────────────────────────────────────────────────────
  function resetFlow() {
    setStep("occasion");
    setSelections({});
    setImageBase64(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black tracking-tight text-white">MY NARRATIVE</span>
          <span className="text-[10px] border border-[#39A596]/40 text-[#39A596] rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider">AI Stylist</span>
        </div>
        <div className="flex items-center gap-3">
          {step !== "occasion" && (
            <button
              onClick={() => setShowGamification(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors border border-white/10 rounded-full px-3 py-1.5"
            >
              <Star className="w-3 h-3" /> 1/5 Cards
            </button>
          )}
          {step === "result" && (
            <button onClick={resetFlow} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Start Over
            </button>
          )}
        </div>
      </div>

      {/* ── Flow Step Progress Indicator ── */}
      {step !== "loading" && step !== "result" && (
        <div className="flex items-center gap-1 px-5 py-3">
          {(["occasion", "vibe", "upload"] as FlowStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`h-1 rounded-full transition-all duration-500 ${
                step === s ? "w-8 bg-[#39A596]" :
                ["occasion", "vibe", "upload"].indexOf(step) > i ? "w-4 bg-[#39A596]/50" : "w-4 bg-zinc-800"
              }`} />
            </div>
          ))}
        </div>
      )}

      {/* ── Error banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-2 flex items-center gap-3 rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            <X className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Step Renderer ── */}
      <div className="flex-1 flex items-center justify-center py-8">
        <AnimatePresence mode="wait">
          {step === "occasion" && (
            <OccasionSelector
              key="occasion"
              selected={selections.occasion ?? null}
              onSelect={handleOccasionSelect}
              onNext={() => { if (selections.occasion) setStep("vibe"); }}
            />
          )}

          {step === "vibe" && (
            <VibeSwiper
              key="vibe"
              vibes={vibes}
              onSelect={handleVibeSelect}
              onBack={() => setStep("occasion")}
            />
          )}

          {step === "upload" && (
            <PhotoUpload
              key="upload"
              onUpload={handleImageUpload}
              onBack={() => setStep("vibe")}
            />
          )}

          {step === "loading" && <LoadingScreen key="loading" />}

          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <VibeCardResult
                result={result}
                selections={selections as UserSelections}
                onRetry={resetFlow}
                onOpenGamification={() => setShowGamification(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Gamification Modal ── */}
      <AnimatePresence>
        {showGamification && (
          <GamificationModal
            onClose={() => setShowGamification(false)}
            onUploadOOTD={handleOOTDUpload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
