"use client";
/**
 * Step5_ResultsAndUpsell.tsx — The Magic Closet & Aggregator
 * ===========================================================
 * State machine: A (Initial Generation) → B (Scanning) → C (Dopamine) → D (Red Gap Upsell)
 *
 * ANTI-HALLUCINATION GUARDRAILS:
 *   - setTimeout simulates AI generation/scanning (no real ML)
 *   - Affiliate data is hardcoded mock JSON (no Myntra/Amazon scraping)
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ExternalLink, Upload, Zap } from "lucide-react";
import { useOnboarding } from "./MainOnboardingController";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step5State = "A" | "B" | "C" | "D";

// ── Mock Wardrobe Items (simulated CV extraction) ─────────────────────────────

const MOCK_WARDROBE = [
  { label: "Denim Jeans",      img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=150&h=200&fit=crop" },
  { label: "White Tee",        img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=200&fit=crop" },
  { label: "Oversized Jacket", img: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=150&h=200&fit=crop" },
  { label: "Sneakers",         img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=200&fit=crop" },
];

// ── Mock Affiliate Catalogue (hardcoded — no scraping) ────────────────────────

const AFFILIATE_RECS: Record<string, {
  item: string; brand: string; platform: string;
  price: number; original_price: number; discount_pct: number;
  img: string; url: string; bank_offer: string;
}> = {
  default: {
    item: "White Chunky Sneakers", brand: "Nike", platform: "Myntra",
    price: 8999, original_price: 12999, discount_pct: 31,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop",
    url: "https://www.myntra.com/nike-chunky-sneakers?aff=mynarrative",
    bank_offer: "No card offer. Flat ₹200 off on Myntra Pay.",
  },
  HDFC: {
    item: "White Chunky Sneakers", brand: "Nike", platform: "Myntra",
    price: 8499, original_price: 12999, discount_pct: 35,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop",
    url: "https://www.myntra.com/nike-chunky-sneakers?aff=mynarrative&bank=hdfc",
    bank_offer: "🏦 Save ₹500 extra with HDFC Credit Card. Code: HDFC500",
  },
  SBI: {
    item: "White Chunky Sneakers", brand: "Adidas", platform: "Amazon",
    price: 7999, original_price: 11999, discount_pct: 33,
    img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=250&fit=crop",
    url: "https://www.amazon.in/adidas-chunky-sneakers?tag=mynarrative-21",
    bank_offer: "🏦 10% cashback with SBI SimplyCLICK card. Max ₹1500.",
  },
  ICICI: {
    item: "White Platform Sneakers", brand: "Puma", platform: "Myntra",
    price: 6999, original_price: 9999, discount_pct: 30,
    img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=250&fit=crop",
    url: "https://www.myntra.com/puma-platform?aff=mynarrative&bank=icici",
    bank_offer: "🏦 5% cashback with ICICI Amazon Pay card.",
  },
};

const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");

// ── Mini Closet Row ───────────────────────────────────────────────────────────

function MiniClosetRow({ items, visibleCount }: { items: typeof MOCK_WARDROBE; visibleCount: number }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 mb-5">
      {items.slice(0, visibleCount).map((item, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: i * 0.15 }}
          className="flex-shrink-0 w-[72px]"
        >
          <img src={item.img} alt={item.label}
            className="w-[72px] h-24 object-cover rounded-xl border border-white/10 block"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=150&h=200&fit=crop"; }}
          />
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider text-center mt-1">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Scanning Overlay ──────────────────────────────────────────────────────────

function ScanOverlay() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden bg-[#39A596]/4">
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#39A596] to-transparent shadow-[0_0_12px_#39A596]"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      {/* Corner markers */}
      {[
        "top-2 left-2 border-t-2 border-l-2",
        "top-2 right-2 border-t-2 border-r-2",
        "bottom-2 left-2 border-b-2 border-l-2",
        "bottom-2 right-2 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-5 h-5 border-[#39A596] ${cls}`} />
      ))}
    </div>
  );
}

// ── Affiliate Card ────────────────────────────────────────────────────────────

function AffiliateCard({ bank }: { bank: string }) {
  const rec = AFFILIATE_RECS[bank] || AFFILIATE_RECS.default;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-red-800/40 overflow-hidden bg-gradient-to-br from-red-950/30 to-zinc-950"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-red-950/40 border-b border-red-800/20">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Gap Item Found — {rec.platform} Pick</span>
      </div>
      <div className="flex gap-3 p-4">
        <img src={rec.img} alt={rec.item}
          className="w-16 h-20 object-cover rounded-xl border border-white/10 flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=250&fit=crop"; }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-zinc-500 font-semibold mb-0.5">{rec.brand}</p>
          <p className="text-sm font-bold text-white mb-2 leading-tight">{rec.item}</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-black text-white">{formatINR(rec.price)}</span>
            <span className="text-xs text-zinc-600 line-through">{formatINR(rec.original_price)}</span>
            <span className="text-[10px] font-black text-green-400">{rec.discount_pct}% OFF</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-300 bg-blue-950/40 border border-blue-800/30 rounded-full px-2.5 py-1">
            {rec.bank_offer}
          </span>
        </div>
      </div>
      <a href={rec.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 mx-4 mb-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-sm rounded-xl hover:opacity-85 transition-opacity"
      >
        <ShoppingBag size={14} /> Shop on {rec.platform} <ExternalLink size={12} />
      </a>
    </motion.div>
  );
}

// ── Main Step5 Component ──────────────────────────────────────────────────────

export default function Step5_ResultsAndUpsell() {
  const {
    selectedAesthetics, wardrobeBase64, setWardrobe,
    addClosetItem, setBrandInput, setPassionInput, setBankInput,
    brandInput, passionInput, bankInput,
  } = useOnboarding();

  const [uiState, setUiState] = useState<Step5State>("A");
  const [visibleItems, setVisibleItems] = useState(0);
  const [showAffiliate, setShowAffiliate] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const moreFileRef = useRef<HTMLInputElement>(null);

  // Simulate FLUX generation (anti-hallucination: no real ML)
  useEffect(() => {
    const t = setTimeout(() => setUiState("A"), 2200);
    return () => clearTimeout(t);
  }, []);

  // When scanning starts, pop in items with stagger
  useEffect(() => {
    if (uiState !== "B") return;
    MOCK_WARDROBE.forEach((item, i) => {
      setTimeout(() => {
        setVisibleItems((v) => v + 1);
        addClosetItem({ id: `scan_${i}`, label: item.label, imgUrl: item.img, category: "top" });
      }, (i + 1) * 900);
    });
    // After scanning → dopamine
    const t = setTimeout(() => setUiState("C"), MOCK_WARDROBE.length * 900 + 1200);
    return () => clearTimeout(t);
  }, [uiState]);

  const handleWardrobeUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { setWardrobe(e.target?.result as string); setUiState("B"); };
    reader.readAsDataURL(file);
  };

  // ── Generated image selection (based on gender of selected aesthetics) ──
  const hasMale = selectedAesthetics.some((id) => id.endsWith("_m"));
  const hasFemale = selectedAesthetics.some((id) => id.endsWith("_f"));
  const generatedImg = hasMale && !hasFemale
    ? "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=480&h=640&fit=crop&crop=top"
    : hasFemale && !hasMale
    ? "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=480&h=640&fit=crop&crop=top"
    : "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=480&h=640&fit=crop&crop=top";

  const assembledImg = wardrobeBase64 || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=480&h=640&fit=crop";

  // ── Title per state ──────────────────────────────────────
  const TITLES: Record<Step5State | "loading", string> = {
    loading: "Generating your main character look…",
    A: "Your main character look, generated. ✦",
    B: "Scanning your wardrobe…",
    C: "Your closet is alive. 🔥",
    D: "Almost perfect. One gap to fill. 👟",
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-24 max-w-lg mx-auto">
      {/* Header */}
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] font-bold text-[#39A596] uppercase tracking-[0.15em] mb-3">05 / 05</p>
        <AnimatePresence mode="wait">
          <motion.h2
            key={uiState}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight"
          >
            {TITLES[uiState] ?? TITLES.loading}
          </motion.h2>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── STATE A: Initial Generation ── */}
        {uiState === "A" && (
          <motion.div key="A" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-5">
              <img src={generatedImg} alt="AI Generated Look" className="w-full max-h-[480px] object-cover block" />
              <span className="absolute top-3 left-3 bg-black/70 border border-white/15 text-[#39A596] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                ✦ AI Generated
              </span>
            </div>
            <div className="bg-gradient-to-br from-[#39A596]/8 to-purple-900/5 border border-[#39A596]/20 rounded-2xl p-5 mb-4 text-center">
              <p className="text-base font-bold text-white mb-2">Want to style this with clothes you already own?</p>
              <p className="text-sm text-zinc-500 leading-relaxed">Upload a wardrobe pic and we'll extract your existing items and remix them into the look.</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3.5 border border-white/12 bg-white/4 rounded-2xl text-white font-bold text-sm hover:border-[#39A596]/50 hover:text-[#39A596] transition-all"
            >
              <Upload size={15} /> Upload Wardrobe Pic
            </motion.button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleWardrobeUpload(e.target.files[0]); }} />
          </motion.div>
        )}

        {/* ── STATE B: Scanning Animation ── */}
        {uiState === "B" && (
          <motion.div key="B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 mb-5">
              <img src={wardrobeBase64 || assembledImg} alt="Wardrobe" className="w-full max-h-[400px] object-cover block" />
              <ScanOverlay />
              <span className="absolute top-3 left-3 bg-black/70 border border-white/15 text-[#39A596] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                🔍 Extracting Items…
              </span>
            </div>
            <p className="text-sm font-bold text-[#39A596] mb-3">Digitizing into your closet…</p>
            <MiniClosetRow items={MOCK_WARDROBE} visibleCount={visibleItems} />
          </motion.div>
        )}

        {/* ── STATE C: Dopamine Hook ── */}
        {uiState === "C" && (
          <motion.div key="C" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <MiniClosetRow items={MOCK_WARDROBE} visibleCount={MOCK_WARDROBE.length} />
            <div className="bg-gradient-to-br from-[#39A596]/8 to-purple-900/5 border border-[#39A596]/20 rounded-2xl p-5 mb-4">
              <p className="text-3xl mb-3">😍</p>
              <p className="text-base font-bold text-white mb-1">Damn, those jeans are a vibe.</p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Our AI just unlocked <strong className="text-[#39A596]">4 new ways</strong> to style them.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed mt-2">
                Upload 3 more items to unlock your{" "}
                <strong className="text-white">'Deep Style Archetype'</strong> &{" "}
                <strong className="text-amber-400">5% Store Credit</strong>.
              </p>
            </div>
            <button
              onClick={() => moreFileRef.current?.click()}
              className="w-full py-3 border border-white/12 bg-white/4 rounded-2xl text-white font-bold text-sm mb-3 hover:border-[#39A596]/50 transition-all"
            >
              📸 Upload More Items
            </button>
            <input ref={moreFileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const reader = new FileReader();
                  reader.onload = (ev) => addClosetItem({ id: `extra_${Date.now()}`, label: "New Item", imgUrl: ev.target?.result as string, category: "top" });
                  reader.readAsDataURL(e.target.files[0]);
                }
              }} />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setUiState("D")}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#39A596] to-[#2d8a7d] text-black font-black text-sm rounded-2xl shadow-[0_8px_32px_rgba(57,165,150,0.3)]"
            >
              See My Complete Look →
            </motion.button>
          </motion.div>
        )}

        {/* ── STATE D: Red Gap + Upsell ── */}
        {uiState === "D" && (
          <motion.div key="D" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Assembled Look with RED Gap */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10">
              <img src={assembledImg} alt="Assembled Look" className="w-full max-h-[480px] object-cover block" />
              {/* RED gap hotspot on shoes area */}
              <motion.div
                className="absolute border-2 border-red-500 rounded-lg bg-red-500/15 cursor-pointer"
                style={{ bottom: "8%", left: "15%", right: "15%", height: "13%" }}
                animate={{ boxShadow: ["0 0 0 0 rgba(239,68,68,0.4)", "0 0 0 10px rgba(239,68,68,0)", "0 0 0 0 rgba(239,68,68,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded whitespace-nowrap">
                  ⚠ Missing: Shoes
                </span>
              </motion.div>
              <span className="absolute top-3 left-3 bg-black/70 border border-white/15 text-[#39A596] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                My Narrative Anchor Top ✦
              </span>
            </div>

            {/* 3 Input Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Any specific brands you love?</label>
                <input
                  type="text" value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  placeholder="e.g. Nike, Zara, H&M, Puma…"
                  className="w-full px-4 py-3 bg-white/4 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#39A596] transition-colors placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Current passions?</label>
                <select
                  value={passionInput}
                  onChange={(e) => setPassionInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/4 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#39A596] transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="bg-zinc-900">— Pick your vibe —</option>
                  <option value="gym" className="bg-zinc-900">🏋️ Gym &amp; Fitness</option>
                  <option value="caffeine" className="bg-zinc-900">☕ Caffeine &amp; Cafes</option>
                  <option value="cars" className="bg-zinc-900">🚗 Cars &amp; Motorsport</option>
                  <option value="tech" className="bg-zinc-900">💻 Tech &amp; Startups</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Bank Cards you own? (for hidden discounts)</label>
                <select
                  value={bankInput}
                  onChange={(e) => setBankInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/4 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#39A596] transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="bg-zinc-900">— Select your bank —</option>
                  <option value="HDFC" className="bg-zinc-900">🏦 HDFC Bank</option>
                  <option value="SBI" className="bg-zinc-900">🏦 SBI</option>
                  <option value="ICICI" className="bg-zinc-900">🏦 ICICI Bank</option>
                </select>
              </div>
            </div>

            {/* Show Final Results CTA */}
            {!showAffiliate && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAffiliate(true)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#39A596] to-[#2d8a7d] text-black font-black text-sm rounded-2xl shadow-[0_8px_32px_rgba(57,165,150,0.3)]"
              >
                <Zap size={15} /> Show Final Results 🎯
              </motion.button>
            )}

            {/* Affiliate Result Card */}
            <AnimatePresence>
              {showAffiliate && (
                <>
                  <AffiliateCard bank={bankInput || "default"} />
                  <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#39A596]/8 to-purple-900/5 border border-[#39A596]/20 rounded-2xl p-5 text-center"
                  >
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="text-base font-bold text-white mb-1">Your Main Character Look is complete.</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      Save this look to your Digital Closet and share it with the community.
                      {brandInput && <><br />Brands noted: <strong className="text-[#39A596]">{brandInput}</strong></>}
                    </p>
                  </motion.div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.location.href = "/pages/ai-studio"}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#39A596] to-[#2d8a7d] text-black font-black text-sm rounded-2xl"
                  >
                    Save to My Narrative →
                  </motion.button>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
