"use client";
/**
 * Step4_CanvasUpload.tsx — The Canvas
 * =====================================
 * Camera-activation / drag-drop selfie upload.
 * Shows preview with retake button. Advances to Step 5.
 */
import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw } from "lucide-react";
import { useOnboarding } from "./MainOnboardingController";

export default function Step4_CanvasUpload() {
  const { setSelfie, selfieBase64, nextStep, prevStep } = useOnboarding();
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setSelfie(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 max-w-lg mx-auto">
      <motion.div className="text-center mb-8 w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] font-bold text-[#39A596] uppercase tracking-[0.15em] mb-3">04 / 05</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2">
          Let's see the canvas.
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Upload a quick selfie to ensure the fit and colors perfectly match your unique skin tone and proportions.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selfieBase64 ? (
          /* Upload Zone */
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            className={`w-full border-2 border-dashed rounded-3xl p-16 flex flex-col items-center gap-4 cursor-pointer transition-all mb-8 ${
              isDragging
                ? "border-[#39A596] bg-[#39A596]/5"
                : "border-white/12 bg-white/1 hover:border-[#39A596]/50 hover:bg-[#39A596]/3"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#39A596]/10 border border-[#39A596]/20 flex items-center justify-center">
              <Camera size={28} className="text-[#39A596]" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-white mb-1">Tap to activate camera or drop selfie</p>
              <p className="text-xs text-zinc-500">JPG, PNG, WebP · Max 10MB · Full body works best</p>
            </div>
            <input
              ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
          </motion.div>
        ) : (
          /* Preview */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8"
          >
            <img src={selfieBase64} alt="Your selfie" className="w-full max-h-[420px] object-cover block" />
            <button
              onClick={() => setSelfie("")}
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
            >
              <RefreshCw size={11} /> Retake
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 w-full">
        <button onClick={prevStep} className="px-5 py-3 rounded-2xl border border-white/10 text-zinc-500 text-sm font-semibold hover:border-white/25 hover:text-white transition-all">
          ← Back
        </button>
        <motion.button
          onClick={nextStep}
          disabled={!selfieBase64}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#39A596] to-[#2d8a7d] text-black font-black text-sm shadow-[0_8px_24px_rgba(57,165,150,0.3)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Generate My Look →
        </motion.button>
      </div>
    </div>
  );
}
