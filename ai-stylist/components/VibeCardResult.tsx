"use client";

/**
 * MY NARRATIVE — VibeCardResult Component (Step 4)
 * =================================================
 * Renders the final output of the AI Stylist pipeline:
 *   1. Face-swapped editorial image (from FLUX + Face Swap API)
 *   2. "Why this works" tooltip — explains Monk Skin Tone (MST) color theory
 *   3. Outfit Breakdown — detects "gap items" and highlights them in RED
 *   4. Affiliate Upsell Box — Myntra deep-link with bank offer (STEP 4 "Switzerland" Upsell)
 *   5. Gamification CTA — teaser for Step 5 modal
 *
 * Props:
 *   result              — GenerationResult from the FastAPI pipeline
 *   selections          — UserSelections from Step 1 (occasion + vibe)
 *   onRetry             — Callback to restart the full flow
 *   onOpenGamification  — Callback to open the Step 5 Gamification Modal
 *
 * EXTERNAL DATA DEPENDENCIES:
 *   All product/affiliate data comes from the FastAPI /api/generate response.
 *   No real-time scraping. All links are pre-approved affiliate deep-links.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  ShoppingBag,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Types (re-imported from AIStylistFlow for self-containment) ──────────────

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

export interface GenerationResult {
  success: boolean;
  pipeline_duration_seconds?: number;
  biometrics: {
    monk_skin_tone: number;
    mst_label: string;
    body_type: string;
    gender_presentation: string;
    // legacy fields
    monk_skin_hex?: string;
    monk_skin_label?: string;
  };
  wardrobe: {
    items_detected: number;
    items: Array<{
      category: string;
      label?: string;
      slot?: string;
      color?: string;
      dominant_colors?: string[];
    }>;
  };
  editorial: {
    flux_prompt: string;
    flux_image_url: string;
    final_image_url: string;
    occasion: Record<string, unknown>;
    vibe: Record<string, unknown>;
  };
  color_theory: {
    mst_value: number;
    best_colors: string[];
    avoid_colors: string[];
    undertone_note: string;
    tooltip_text: string;
  };
  affiliate_upsells: AffiliateRec[];
  outfit_completion_pct: number;
  gamification: Record<string, unknown>;
  // legacy fallback fields
  final_image_base64?: string;
  flux_prompt_used?: string;
  generated_items?: string[];
  affiliate_recommendations?: AffiliateRec[];
}

export interface UserSelections {
  gender: "men" | "women";
  occasion: string;
  occasionLabel: string;
  vibe_id: string;
  vibe_label: string;
  flux_style_keywords: string;
}

// ─── MST Color Theory labels (mirrors backend MST_COLOR_THEORY dict) ──────────
// Used to render the "Why this works" tooltip without an extra API call.

const MST_WORKS_WITH: Record<number, string[]> = {
  1:  ["dusty rose", "ivory", "soft lavender"],
  2:  ["peach", "warm white", "light camel"],
  3:  ["terracotta", "sage green", "rust orange"],
  4:  ["olive", "burnt orange", "deep burgundy"],
  5:  ["mustard", "forest green", "rich plum"],
  6:  ["cobalt blue", "white", "bold red"],
  7:  ["electric blue", "deep purple", "bright coral"],
  8:  ["gold", "deep teal", "cream"],
  9:  ["bright white", "neon accents", "deep jewel tones"],
  10: ["stark white", "chrome silver", "bold neons"],
};

// ─── Helper: format INR price ─────────────────────────────────────────────────

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Sub-component: MST "Why This Works" Tooltip ─────────────────────────────

function MSTTooltip({
  biometrics,
  color_theory,
  vibe_label,
}: {
  biometrics: GenerationResult["biometrics"];
  color_theory?: GenerationResult["color_theory"];
  vibe_label: string;
}) {
  const [open, setOpen] = useState(false);
  const mst = biometrics.monk_skin_tone;
  // Prefer live color_theory from Vercel API, fall back to local MST_WORKS_WITH
  const colorsForTone: string[] = color_theory?.best_colors ?? MST_WORKS_WITH[mst] ?? ["neutrals", "classic tones", "earthy hues"];
  const skinLabel = biometrics.mst_label ?? biometrics.monk_skin_label ?? "Medium";
  const undertoneNote = color_theory?.undertone_note ?? "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* MST swatch */}
          <div
            className="w-8 h-8 rounded-full border-2 border-white/20 shrink-0 shadow-lg"
            style={{ backgroundColor: biometrics.monk_skin_hex ?? "#A07850" }}
            title={`Monk Skin Tone ${mst}: ${skinLabel}`}
          />
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              Why this look works for you
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              MST {mst} · {skinLabel} · {biometrics.body_type} build
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Info className="w-4 h-4 text-[#39A596]" />
          {open ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/8 pt-4">
              {/* Color theory explanation */}
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">
                  Your Colour Theory
                </p>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Your{" "}
                  <span className="font-bold text-white">{skinLabel}</span> skin
                  tone (Monk Scale {mst}/10) pairs beautifully with warm and complementary hues that
                  enhance your natural undertones.{undertoneNote ? ` ${undertoneNote}` : ""}
                </p>
              </div>

              {/* Colour swatches that work */}
              <div>
                <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-2.5 font-semibold">
                  Colours that elevate your look
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorsForTone.map((color) => (
                    <span
                      key={color}
                      className="text-[11px] border border-[#39A596]/30 bg-[#39A596]/10 text-[#39A596] rounded-full px-3 py-1 font-semibold capitalize"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vibe context */}
              <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  <span className="text-white font-bold">"{vibe_label}"</span> vibe + your skin
                  tone = this editorial was built for you. The lighting, colour palette, and garment
                  tones were all selected to complement MST {mst}.
                </p>
                {color_theory?.tooltip_text && (
                  <p className="text-xs text-[#39A596] mt-2 leading-relaxed">{color_theory.tooltip_text}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-component: Outfit Breakdown (wardrobe items user already owns) ───────

function OutfitBreakdown({
  wardrobeItems,
  generatedItems,
}: {
  wardrobeItems: GenerationResult["wardrobe"]["items"];
  generatedItems: string[];
}) {
  const categoryLabel: Record<string, string> = {
    top: "Top",
    bottom: "Bottom",
    footwear: "Footwear",
    accessory: "Accessory",
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
        Outfit Breakdown
      </p>

      {/* Items the user already owns — shown in green */}
      {wardrobeItems.map((item) => (
        <div
          key={item.category}
          className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3"
        >
          <CheckCircle2 className="w-4 h-4 text-[#39A596] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
              {categoryLabel[item.category] ?? item.category}
            </p>
            <p className="text-sm text-white font-semibold truncate">{item.label}</p>
          </div>
          {/* Dominant colour dots */}
          <div className="flex gap-1 shrink-0">
            {item.dominant_colors.slice(0, 3).map((hex) => (
              <div
                key={hex}
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Items FLUX generated (gap items) — shown in RED */}
      {generatedItems.map((category) => (
        <div
          key={category}
          className="flex items-center gap-3 rounded-xl border border-red-800/60 bg-red-950/30 px-4 py-3"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">
              {categoryLabel[category] ?? category} — Missing from your closet
            </p>
            <p className="text-sm text-red-300 font-semibold">
              AI generated this for your look
            </p>
          </div>
          <span className="text-[10px] border border-red-800/60 text-red-400 rounded-full px-2 py-0.5 font-bold shrink-0">
            GAP
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Sub-component: Affiliate Upsell Box (Step 4 "Switzerland" Upsell) ────────
/**
 * Renders the "Your look is X% complete. Buy [item] on Myntra." box.
 * Highlights gap items in RED and shows the bank offer string.
 *
 * ANTI-HALLUCINATION NOTE:
 *   All data (item_name, affiliate_url, bank_offer) is served from the
 *   backend's get_affiliate_recommendation() mock. No real-time scraping.
 */

function AffiliateUpsellBox({ rec }: { rec: AffiliateRec }) {
  const discount = Math.round(
    ((rec.price - rec.discounted_price) / rec.price) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-red-800/50 bg-gradient-to-br from-red-950/40 to-zinc-950 p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-red-400" />
            <p className="text-xs text-red-400 font-bold uppercase tracking-wider">
              Your look is {rec.completion_pct}% complete
            </p>
          </div>
          <p className="text-sm text-white font-black leading-tight">
            Complete your look with{" "}
            <span className="text-red-300">{rec.item_name}</span>
          </p>
        </div>
        {/* Discount badge */}
        <span className="shrink-0 text-[11px] font-black bg-red-500 text-white rounded-full px-2.5 py-1">
          {discount}% OFF
        </span>
      </div>

      {/* Product info row */}
      <div className="flex items-center gap-4">
        {/* Product image placeholder (Myntra images may not CORS-allow direct embedding) */}
        <div className="w-16 h-16 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rec.image_url}
            alt={rec.item_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Graceful fallback if Myntra CDN blocks the request
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <ShoppingBag className="w-6 h-6 text-zinc-600 absolute" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-500 font-semibold">{rec.brand}</p>
          <p className="text-sm text-white font-bold truncate">{rec.item_name}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-black text-white">
              {formatINR(rec.discounted_price)}
            </span>
            <span className="text-xs text-zinc-600 line-through">
              {formatINR(rec.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Why it works */}
      <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/8 pt-3">
        <span className="text-zinc-300 font-semibold">Why this works: </span>
        {rec.why_it_works}
      </p>

      {/* Bank offer pill */}
      <div className="flex items-center gap-2 rounded-xl border border-amber-800/40 bg-amber-950/30 px-3 py-2">
        <span className="text-sm">🏦</span>
        <p className="text-[11px] text-amber-300 leading-snug font-medium">
          {rec.bank_offer}
        </p>
      </div>

      {/* CTA Button — Myntra deep link */}
      <a
        href={rec.affiliate_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#FF3F6C] hover:bg-[#e0325a] text-white font-black text-sm transition-colors"
        // NOTE: #FF3F6C is Myntra's brand pink
      >
        <ShoppingBag className="w-4 h-4" />
        Buy on Myntra
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </a>
    </motion.div>
  );
}

// ─── Sub-component: Gamification Teaser (Step 5 preview) ─────────────────────

function GamificationTeaser({
  onOpenGamification,
}: {
  onOpenGamification: () => void;
}) {
  return (
    <motion.button
      onClick={onOpenGamification}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/4 hover:border-[#39A596]/40 hover:bg-[#39A596]/5 transition-all px-5 py-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#39A596]/15 border border-[#39A596]/20 flex items-center justify-center shrink-0">
          <Star className="w-5 h-5 text-[#39A596] fill-[#39A596]/30" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-white leading-tight">
            1/5 Mascot Cards Collected
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Checkout to unlock next card · Train AI for 5% credit
          </p>
        </div>
      </div>
      <ChevronDown className="w-4 h-4 text-zinc-600 rotate-[-90deg] shrink-0" />
    </motion.button>
  );
}

// ─── Main VibeCardResult Component ───────────────────────────────────────────

export default function VibeCardResult({
  result,
  selections,
  onRetry,
  onOpenGamification,
}: {
  result: GenerationResult;
  selections: UserSelections;
  onRetry: () => void;
  onOpenGamification: () => void;
}) {
  const { biometrics, wardrobe, color_theory } = result;

  // Normalise image: prefer URL from Vercel API, fall back to base64
  const finalImageUrl = result.editorial?.final_image_url || null;
  const finalImageBase64 = result.final_image_base64 || null;

  // Normalise affiliate recs: Vercel API uses affiliate_upsells, local mock uses affiliate_recommendations
  const allRecs: AffiliateRec[] = result.affiliate_upsells ?? result.affiliate_recommendations ?? [];
  const primaryRec = allRecs.find((r) => r.is_gap_item) ?? allRecs[0] ?? null;

  // Normalise wardrobe items — Vercel uses slot/color, local uses category/label
  const wardrobeItems = (wardrobe?.items ?? []).map((item) => ({
    category: item.category ?? item.slot ?? "item",
    label: item.label ?? `${item.color ?? ""} ${item.slot ?? "item"}`.trim(),
    dominant_colors: item.dominant_colors ?? [],
  }));

  // Normalise generated/gap items
  const generatedItems: string[] = result.generated_items ?? [];

  // MST skin label normalised
  const skinLabel = biometrics.mst_label ?? biometrics.monk_skin_label ?? "Medium";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto px-4 pb-10 space-y-5"
    >
      {/* ── Header ── */}
      <div className="text-center space-y-1 pt-2">
        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
          Step 5 of 6 · Your Editorial Look
        </p>
        <h2 className="text-2xl font-black text-white tracking-tight">
          {selections.vibe_label}
        </h2>
        <p className="text-sm text-zinc-500">
          {selections.occasionLabel} · {selections.gender === "men" ? "Men's" : "Women's"} look · crafted for your skin tone &amp; body type
        </p>
      </div>

      {/* ── Generated Image ── */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
        {finalImageUrl ? (
          // Vercel API returns a URL (Replicate CDN)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={finalImageUrl}
            alt={`AI-generated editorial look for ${selections.vibe_label}`}
            className="w-full object-cover"
            style={{ maxHeight: "520px" }}
          />
        ) : finalImageBase64 ? (
          // Local FastAPI returns base64
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/jpeg;base64,${finalImageBase64}`}
            alt={`AI-generated editorial look for ${selections.vibe_label}`}
            className="w-full object-cover"
            style={{ maxHeight: "520px" }}
          />
        ) : (
          <div className="w-full h-72 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-black">
            <div className="w-16 h-16 rounded-2xl bg-[#39A596]/20 flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
            <p className="text-sm text-zinc-500 font-semibold">Generating your look…</p>
          </div>
        )}

        {/* Vibe badge overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="text-[10px] border border-[#39A596]/40 bg-black/70 backdrop-blur-sm text-[#39A596] rounded-full px-3 py-1 font-bold uppercase tracking-wider">
            {selections.vibe_label}
          </span>
          <span className="text-[10px] border border-white/20 bg-black/70 backdrop-blur-sm text-zinc-300 rounded-full px-3 py-1 font-semibold">
            MST {biometrics.monk_skin_tone} · {skinLabel}
          </span>
        </div>
      </div>

      {/* ── MST "Why this works" Tooltip ── */}
      <MSTTooltip biometrics={biometrics} color_theory={color_theory} vibe_label={selections.vibe_label} />

      {/* ── Outfit Breakdown ── */}
      <OutfitBreakdown
        wardrobeItems={wardrobeItems}
        generatedItems={generatedItems}
      />

      {/* ── Affiliate Upsell Box (Step 4 "Switzerland" Upsell) ── */}
      {primaryRec && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            Complete Your Look {result.outfit_completion_pct ? `· ${result.outfit_completion_pct}% done` : ""}
          </p>
          <AffiliateUpsellBox rec={primaryRec} />
        </div>
      )}

      {/* Additional affiliate recs (if more than one gap item) */}
      {allRecs.slice(1).map((rec) => (
        <AffiliateUpsellBox key={rec.item_type} rec={rec} />
      ))}

      {/* ── Gamification Teaser → opens Step 5 modal ── */}
      <GamificationTeaser onOpenGamification={onOpenGamification} />

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 flex-1 justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-zinc-400 hover:border-white/25 hover:text-white py-3.5 font-semibold transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Another Look
        </button>
        <button
          onClick={onOpenGamification}
          className="flex items-center gap-2 flex-1 justify-center rounded-2xl bg-[#39A596] text-black font-black text-sm py-3.5 hover:bg-[#2d8a7d] transition-colors"
        >
          <Star className="w-4 h-4" />
          View Rewards
        </button>
      </div>

      {/* ── FLUX Prompt Debug (development only) ── */}
      {process.env.NODE_ENV === "development" && (
        <details className="rounded-xl border border-white/8 bg-white/3 p-4">
          <summary className="text-[11px] text-zinc-600 cursor-pointer font-semibold hover:text-zinc-400 transition-colors">
            🛠 Dev: FLUX Prompt Used
          </summary>
          <p className="text-[10px] text-zinc-700 mt-3 leading-relaxed font-mono whitespace-pre-wrap">
            {result.editorial?.flux_prompt ?? result.flux_prompt_used ?? "No prompt available"}
          </p>
        </details>
      )}
    </motion.div>
  );
}
