"use client";
/**
 * PersistentNav.tsx — Global Persistent UI (floats above all onboarding steps)
 * ============================================================================
 * Three floating elements:
 *   Top Left:    Profile Ring (circular progress) → opens recalibration modal
 *   Top Right:   My Closet Chip (item count) → opens closet drawer
 *   Bottom Right: Gift Mode FAB → activates gift styling mode
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Shirt, Camera, Ghost, X, Save } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ClosetItem {
  id: string;
  label: string;
  imgUrl: string;
  category: "top" | "bottom" | "footwear" | "accessory";
}

export interface ProfilePrefs {
  height: number;       // cm
  fit: "slim" | "regular" | "oversized" | "relaxed";
  completionPct: number; // 0–100
}

interface PersistentNavProps {
  profile: ProfilePrefs;
  closetItems: ClosetItem[];
  onProfileSave: (prefs: ProfilePrefs) => void;
  onClosetAdd: (file: File) => void;
  onGiftMode: () => void;
}

// ── Circular Progress Ring ────────────────────────────────────────────────────

function ProfileRing({
  pct,
  onClick,
}: {
  pct: number;
  onClick: () => void;
}) {
  const r = 18;
  const circumference = 2 * Math.PI * r; // ≈ 113.1
  const offset = circumference - (pct / 100) * circumference;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="relative w-14 h-14 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shadow-xl"
      title={`Profile ${pct}% complete — click to recalibrate`}
    >
      {/* SVG ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <motion.circle
          cx="22" cy="22" r={r} fill="none"
          stroke="#39A596" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden border border-white/10 relative z-10">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Pct label */}
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#39A596] whitespace-nowrap">
        {pct}%
      </span>
    </motion.button>
  );
}

// ── Recalibration Modal ───────────────────────────────────────────────────────

function RecalibrationModal({
  profile,
  onSave,
  onClose,
}: {
  profile: ProfilePrefs;
  onSave: (p: ProfilePrefs) => void;
  onClose: () => void;
}) {
  const [height, setHeight] = useState(profile.height);
  const [fit, setFit] = useState<ProfilePrefs["fit"]>(profile.fit);
  const FIT_OPTIONS: ProfilePrefs["fit"][] = ["slim", "regular", "oversized", "relaxed"];

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[10001] flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-zinc-900 border border-white/10 rounded-2xl p-7 w-full max-w-sm relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/6 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
          <X size={14} />
        </button>
        <h3 className="text-lg font-black text-white mb-1">Recalibrate Your Fit</h3>
        <p className="text-xs text-zinc-500 mb-5">Update your height and fit for better AI recommendations.</p>

        {/* Height slider */}
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Height</label>
        <input
          type="range" min={150} max={200} value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          className="w-full accent-[#39A596] mb-1"
        />
        <p className="text-sm font-bold text-[#39A596] mb-5">{height} cm</p>

        {/* Fit chips */}
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Preferred Fit</label>
        <div className="flex flex-wrap gap-2 mb-6">
          {FIT_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFit(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all capitalize ${
                fit === f
                  ? "border-[#39A596] bg-[#39A596]/10 text-[#39A596]"
                  : "border-white/10 text-zinc-500 hover:border-white/25"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { onSave({ ...profile, height, fit }); onClose(); }}
          className="w-full py-3 bg-[#39A596] rounded-xl text-black font-black text-sm flex items-center justify-center gap-2"
        >
          <Save size={14} /> Save Preferences
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Closet Drawer ─────────────────────────────────────────────────────────────

function ClosetDrawer({
  items,
  onAdd,
  onClose,
}: {
  items: ClosetItem[];
  onAdd: (file: File) => void;
  onClose: () => void;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001] flex items-end justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-zinc-900 border border-white/10 rounded-t-2xl p-6 w-full max-w-lg relative max-h-[80vh] overflow-y-auto"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/6 flex items-center justify-center text-zinc-500">
          <X size={14} />
        </button>
        <h3 className="text-lg font-black text-white mb-1">My Digital Closet</h3>
        <p className="text-xs text-zinc-500 mb-4">{items.length} items digitized</p>

        {/* Items grid */}
        <div className="grid grid-cols-4 gap-2 mb-4 min-h-[80px]">
          {items.length === 0 ? (
            <p className="col-span-4 text-center text-xs text-zinc-600 py-5">No items yet. Snap a pic to start!</p>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10"
              >
                <img src={item.imgUrl} alt={item.label} className="w-full h-full object-cover" />
              </motion.div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#39A596] rounded-xl text-black font-bold text-sm"
          >
            <Camera size={14} /> Snap a Pic
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => alert("Ghost Mode: Browse styles anonymously. Coming soon!")}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-400 font-bold text-sm"
          >
            <Ghost size={14} /> Ghost Mode
          </motion.button>
        </div>
        <input
          ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) onAdd(e.target.files[0]); }}
        />
      </motion.div>
    </motion.div>
  );
}

// ── Main PersistentNav Component ──────────────────────────────────────────────

export default function PersistentNav({
  profile,
  closetItems,
  onProfileSave,
  onClosetAdd,
  onGiftMode,
}: PersistentNavProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showCloset, setShowCloset] = useState(false);

  return (
    <>
      {/* Fixed container — pointer-events: none so it doesn't block scroll */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        {/* Top Left: Profile Ring */}
        <div className="absolute top-5 left-5 pointer-events-auto">
          <ProfileRing pct={profile.completionPct} onClick={() => setShowProfile(true)} />
        </div>

        {/* Top Right: My Closet Chip */}
        <div className="absolute top-5 right-5 pointer-events-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCloset(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 border border-white/10 text-white text-xs font-bold shadow-xl hover:border-[#39A596]/50 transition-colors"
          >
            <Shirt size={13} className="text-[#39A596]" />
            <span className="bg-[#39A596] text-black text-[10px] font-black rounded-full px-1.5 py-0.5">
              {closetItems.length}
            </span>
            My Closet
          </motion.button>
        </div>

        {/* Bottom Right: Gift Mode FAB */}
        <div className="absolute bottom-7 right-5 pointer-events-auto group">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={onGiftMode}
            className="w-13 h-13 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-900/50 relative"
            style={{ width: 52, height: 52 }}
          >
            <Gift size={20} className="text-white" />
          </motion.button>
          {/* Tooltip */}
          <div className="absolute bottom-14 right-0 bg-zinc-900 border border-white/10 text-white text-[11px] font-medium px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            Styling for someone else? Try Gift Mode.
          </div>
        </div>
      </div>

      {/* Modals / Drawers */}
      <AnimatePresence>
        {showProfile && (
          <RecalibrationModal
            profile={profile}
            onSave={onProfileSave}
            onClose={() => setShowProfile(false)}
          />
        )}
        {showCloset && (
          <ClosetDrawer
            items={closetItems}
            onAdd={onClosetAdd}
            onClose={() => setShowCloset(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
