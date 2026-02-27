"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ShoppingBag,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  X,
  ChevronRight,
  Tent,
  Users,
  Lock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Creator,
  PayoutStatus,
  PAYOUT_THRESHOLDS,
  SocialPlatform,
  SocialConnectResponse,
} from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPayoutStatusMeta(status: PayoutStatus) {
  switch (status) {
    case "LOCKED":
      return {
        label: "Balance Locked",
        icon: <Lock className="w-4 h-4" />,
        color: "text-zinc-400",
        bg: "bg-zinc-800",
        border: "border-zinc-700",
      };
    case "STORE_CREDIT_ONLY":
      return {
        label: "Store Credit Redeemable",
        icon: <ShoppingBag className="w-4 h-4" />,
        color: "text-sky-400",
        bg: "bg-sky-950",
        border: "border-sky-800",
      };
    case "CASH_AVAILABLE":
      return {
        label: "Cash Withdrawal Available",
        icon: <CheckCircle className="w-4 h-4" />,
        color: "text-emerald-400",
        bg: "bg-emerald-950",
        border: "border-emerald-800",
      };
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Metric card used in the top stats row */
function MetricCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 min-w-[180px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</span>
        <span className="text-zinc-400">{icon}</span>
      </div>
      <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </motion.div>
  );
}

// ─── Threshold Progress Bar ──────────────────────────────────────────────────

function ThresholdProgressBar({ balance }: { balance: number }) {
  const max = PAYOUT_THRESHOLDS.CASH_WITHDRAWAL; // 5000
  const clampedBalance = Math.min(balance, max);
  const progressPct = (clampedBalance / max) * 100;
  const storeCreditPct = (PAYOUT_THRESHOLDS.STORE_CREDIT / max) * 100; // 50%

  const storeCreditUnlocked = balance >= PAYOUT_THRESHOLDS.STORE_CREDIT;
  const cashUnlocked = balance >= PAYOUT_THRESHOLDS.CASH_WITHDRAWAL;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Earnings Threshold
        </h3>
        <span className="text-xs text-zinc-500">
          {formatINR(balance)} of {formatINR(max)}
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-4 rounded-full bg-zinc-800 overflow-visible">
        {/* Filled portion */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/80 to-white"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Marker — ₹2,500 Store Credit */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: `${storeCreditPct}%` }}
        >
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-500 ${
              storeCreditUnlocked
                ? "bg-sky-400 border-sky-300"
                : "bg-zinc-900 border-zinc-600"
            }`}
          >
            {storeCreditUnlocked && <CheckCircle className="w-3 h-3 text-white" />}
          </div>
        </div>

        {/* Marker — ₹5,000 Cash */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10" style={{ left: "100%" }}>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-500 ${
              cashUnlocked
                ? "bg-emerald-400 border-emerald-300"
                : "bg-zinc-900 border-zinc-600"
            }`}
          >
            {cashUnlocked && <CheckCircle className="w-3 h-3 text-white" />}
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="relative flex justify-between text-xs mt-1">
        <span className="text-zinc-600">₹0</span>
        <span
          className={`absolute left-1/2 -translate-x-1/2 text-center ${
            storeCreditUnlocked ? "text-sky-400 font-semibold" : "text-zinc-500"
          }`}
        >
          ₹2,500
          <br />
          <span className="text-[10px] font-normal">Store Credit</span>
        </span>
        <span className={cashUnlocked ? "text-emerald-400 font-semibold" : "text-zinc-500"}>
          ₹5,000
          <br />
          <span className="text-[10px] font-normal">Cash Out</span>
        </span>
      </div>

      {/* Status Pill */}
      {(() => {
        const meta = getPayoutStatusMeta(
          cashUnlocked ? "CASH_AVAILABLE" : storeCreditUnlocked ? "STORE_CREDIT_ONLY" : "LOCKED"
        );
        return (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${meta.bg} ${meta.border} ${meta.color} w-fit text-sm font-medium`}>
            {meta.icon}
            {meta.label}
          </div>
        );
      })()}

      {/* Next milestone hint */}
      {!cashUnlocked && (
        <p className="text-xs text-zinc-500">
          {!storeCreditUnlocked
            ? `Earn ${formatINR(PAYOUT_THRESHOLDS.STORE_CREDIT - balance)} more to unlock Store Credit`
            : `Earn ${formatINR(PAYOUT_THRESHOLDS.CASH_WITHDRAWAL - balance)} more to unlock Cash Withdrawal`}
        </p>
      )}
    </div>
  );
}

// ─── Social Connect Modal ────────────────────────────────────────────────────

const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; icon: React.ReactNode; placeholder: string; threshold: string }
> = {
  instagram: {
    label: "Instagram",
    icon: <Instagram className="w-5 h-5" />,
    placeholder: "@yourhandle",
    threshold: "500k followers",
  },
  youtube: {
    label: "YouTube",
    icon: <Youtube className="w-5 h-5" />,
    placeholder: "youtube.com/c/yourchannel",
    threshold: "250k subscribers",
  },
  twitter: {
    label: "Twitter / X",
    icon: <Twitter className="w-5 h-5" />,
    placeholder: "@yourhandle",
    threshold: "150k followers",
  },
  linkedin: {
    label: "LinkedIn",
    icon: <Linkedin className="w-5 h-5" />,
    placeholder: "linkedin.com/in/yourprofile",
    threshold: "75k followers",
  },
};

function SocialConnectModal({
  onClose,
  onConnect,
  connectedPlatforms,
}: {
  onClose: () => void;
  onConnect: (platform: SocialPlatform, handle: string) => Promise<SocialConnectResponse>;
  connectedPlatforms: SocialPlatform[];
}) {
  const [selected, setSelected] = useState<SocialPlatform | null>(null);
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SocialConnectResponse | null>(null);

  async function handleConnect() {
    if (!selected || !handle.trim()) return;
    setLoading(true);
    try {
      const res = await onConnect(selected, handle.trim());
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl p-8 relative"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-white mb-1">Connect Your Socials</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Link your accounts to upgrade your commission tier.{" "}
            <span className="text-white font-semibold">500k+ IG followers</span> unlocks up to{" "}
            <span className="text-yellow-400 font-bold">50% commission</span>.
          </p>

          {/* Platform grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(Object.keys(PLATFORM_META) as SocialPlatform[]).map((p) => {
              const meta = PLATFORM_META[p];
              const isConnected = connectedPlatforms.includes(p);
              const isSelected = selected === p;
              return (
                <button
                  key={p}
                  onClick={() => { setSelected(p); setResult(null); }}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-white bg-white/10 text-white"
                      : isConnected
                      ? "border-emerald-700 bg-emerald-950/40 text-emerald-400"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {meta.icon}
                  <div>
                    <p className="text-sm font-semibold">{meta.label}</p>
                    <p className="text-[10px] text-zinc-500">{meta.threshold} → Mega tier</p>
                  </div>
                  {isConnected && <CheckCircle className="w-4 h-4 ml-auto text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Handle input */}
          {selected && !result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={PLATFORM_META[selected].placeholder}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm outline-none focus:border-white/40 transition-colors"
              />
              <button
                onClick={handleConnect}
                disabled={loading || !handle.trim()}
                className="w-full rounded-xl bg-white text-black font-bold py-3 text-sm hover:bg-zinc-200 transition-colors disabled:opacity-40"
              >
                {loading ? "Verifying…" : `Connect ${PLATFORM_META[selected].label}`}
              </button>
            </motion.div>
          )}

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 text-sm ${
                result.tier_upgraded
                  ? "border-yellow-700 bg-yellow-950/40 text-yellow-300"
                  : "border-sky-800 bg-sky-950/40 text-sky-300"
              }`}
            >
              {result.tier_upgraded ? (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-400" />
                  <p>
                    🎉 Tier upgraded to{" "}
                    <span className="font-bold text-yellow-400">{result.new_tier}</span>!
                    Your new commission rate is{" "}
                    <span className="font-bold">{result.new_rate}%</span>.
                  </p>
                </div>
              ) : (
                <p>{result.message}</p>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Campus Fest Pool Card ───────────────────────────────────────────────────

function FestPoolCard({ pool }: { pool: Creator["fest_pools"][0] }) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(pool.campaign_end).getTime() - Date.now()) / 86400000)
  );
  return (
    <div className="rounded-2xl border border-purple-800/50 bg-purple-950/20 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-300">
          <Tent className="w-4 h-4" />
          <span className="text-sm font-semibold">{pool.fest_name}</span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            pool.is_active ? "bg-purple-800/50 text-purple-200" : "bg-zinc-800 text-zinc-500"
          }`}
        >
          {pool.is_active ? `${daysLeft}d left` : "Ended"}
        </span>
      </div>
      <p className="text-xs text-zinc-500">{pool.institution}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">{formatINR(pool.pool_balance)}</p>
          <p className="text-xs text-zinc-500">Collective Fest Pool</p>
        </div>
        <div className="flex items-center gap-1 text-purple-400 text-xs">
          <Users className="w-3.5 h-3.5" />
          {pool.active_ambassadors} ambassadors
        </div>
      </div>
    </div>
  );
}

// ─── Earnings Chart ──────────────────────────────────────────────────────────

function EarningsChart({ data }: { data: Creator["earnings"]["earnings_by_month"] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
        Monthly Earnings
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 12, color: "#fff", fontSize: 12 }}
              formatter={(val: number) => [formatINR(val), "Earnings"]}
            />
            <Area type="monotone" dataKey="earnings" stroke="#ffffff" strokeWidth={2} fill="url(#earningsGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ────────────────────────────────────────────────

interface CreatorDashboardProps {
  creator: Creator;
  onConnectSocial: (platform: SocialPlatform, handle: string) => Promise<SocialConnectResponse>;
  onRedeemStoreCredit: () => void;
  onWithdrawCash: () => void;
}

export default function CreatorDashboard({
  creator,
  onConnectSocial,
  onRedeemStoreCredit,
  onWithdrawCash,
}: CreatorDashboardProps) {
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const { earnings, listings, is_campus_ambassador, fest_pools, commission_rate, commission_tier, social_accounts } = creator;

  const connectedPlatforms = social_accounts.map((s) => s.platform);
  const storeCreditUnlocked = earnings.current_balance >= PAYOUT_THRESHOLDS.STORE_CREDIT;
  const cashUnlocked = earnings.current_balance >= PAYOUT_THRESHOLDS.CASH_WITHDRAWAL;

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      {/* ── Header bar ── */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Creator Dashboard</h1>
          <p className="text-xs text-zinc-500">@{creator.username} · {commission_tier.replace("_", " ")} · {commission_rate}% commission</p>
        </div>
        <button
          onClick={() => setSocialModalOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Connect Socials
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* ── Mega-influencer commission badge ── */}
        {creator.is_mega_influencer && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-yellow-700/60 bg-gradient-to-r from-yellow-950/60 to-zinc-950 px-5 py-3"
          >
            <span className="text-xl">👑</span>
            <div>
              <p className="text-sm font-bold text-yellow-400">Mega-Influencer — {commission_rate}% Commission</p>
              <p className="text-xs text-zinc-400">Your social reach earns you a premium commission rate on every sale.</p>
            </div>
          </motion.div>
        )}

        {/* ── Metrics Row ── */}
        <div className="flex flex-wrap gap-4">
          <MetricCard
            label="Current Balance"
            value={formatINR(earnings.current_balance)}
            icon={<Wallet className="w-4 h-4" />}
            sub={earnings.payout_status === "LOCKED" ? "Locked — keep earning!" : "Ready to redeem"}
          />
          <MetricCard
            label="Lifetime Earnings"
            value={formatINR(earnings.lifetime_earnings)}
            icon={<TrendingUp className="w-4 h-4" />}
            sub={`${commission_rate}% on every sale`}
          />
          <MetricCard
            label="Active Listings"
            value={listings.filter((l) => l.is_active).length.toString()}
            icon={<ShoppingBag className="w-4 h-4" />}
            sub={`${creator.total_units_sold} units sold total`}
          />
        </div>

        {/* ── Threshold Progress Bar ── */}
        <ThresholdProgressBar balance={earnings.current_balance} />

        {/* ── Redemption Actions ── */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRedeemStoreCredit}
            disabled={!storeCreditUnlocked}
            className="flex items-center gap-2 rounded-xl border border-sky-700 bg-sky-950/40 px-5 py-3 text-sm font-semibold text-sky-300 hover:bg-sky-900/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            Redeem as Store Credit
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onWithdrawCash}
            disabled={!cashUnlocked}
            className="flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-950/40 px-5 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-900/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Wallet className="w-4 h-4" />
            Withdraw Cash
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Earnings Chart ── */}
        {earnings.earnings_by_month.length > 0 && (
          <EarningsChart data={earnings.earnings_by_month} />
        )}

        {/* ── Campus Fest Pool (ambassadors only) ── */}
        {is_campus_ambassador && fest_pools.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
              Campus Fest Pools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fest_pools.map((pool) => (
                <FestPoolCard key={pool.fest_name} pool={pool} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Social Connect Modal ── */}
      {socialModalOpen && (
        <SocialConnectModal
          onClose={() => setSocialModalOpen(false)}
          onConnect={onConnectSocial}
          connectedPlatforms={connectedPlatforms}
        />
      )}
    </div>
  );
}
