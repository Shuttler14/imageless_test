"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Star,
  Share2,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import {
  Creator,
  DesignListing,
  RANK_LADDER,
  StyleInfluenceRank,
  SocialPlatform,
} from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

function getStyleRank(lifetimeEarnings: number): {
  rank: StyleInfluenceRank;
  emoji: string;
  color: string;
  nextRank?: { rank: StyleInfluenceRank; minEarnings: number };
} {
  let current = RANK_LADDER[0];
  for (const tier of RANK_LADDER) {
    if (lifetimeEarnings >= tier.min) current = tier;
  }
  const currentIdx = RANK_LADDER.indexOf(current);
  const next = RANK_LADDER[currentIdx + 1];
  return {
    rank: current.rank,
    emoji: current.emoji,
    color: current.color,
    nextRank: next ? { rank: next.rank, minEarnings: next.min } : undefined,
  };
}

const SOCIAL_ICONS: Record<SocialPlatform, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── Rank Badge ──────────────────────────────────────────────────────────────

function RankBadge({ rank, emoji, color }: { rank: StyleInfluenceRank; emoji: string; color: string }) {
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm"
    >
      <span className="text-base">{emoji}</span>
      <span className={`text-sm font-bold tracking-wide ${color}`}>{rank}</span>
    </motion.div>
  );
}

// ─── Design Card (Fashion-magazine editorial style) ───────────────────────────

function DesignCard({
  listing,
  index,
}: {
  listing: DesignListing;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  // Alternate taller cards in a masonry-style rhythm
  const isTall = index % 3 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 cursor-pointer group ${
        isTall ? "row-span-2" : "row-span-1"
      }`}
    >
      {/* 
        CRITICAL VISUAL RULE:
        We always use flux_editorial_image_url — the FLUX-generated Virtual Try-On
        editorial image. This is NOT a flat product shot; it is a photorealistic
        model/creator wearing the design in an editorial context.
      */}
      <div className={`relative w-full overflow-hidden ${isTall ? "aspect-[3/5]" : "aspect-[3/4]"}`}>
        <motion.img
          src={listing.flux_editorial_image_url}
          alt={listing.title}
          className="w-full h-full object-cover object-top"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Units sold badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1 text-[10px] text-white font-semibold">
          <ShoppingBag className="w-3 h-3" />
          {formatCompact(listing.units_sold)} sold
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
          <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">{listing.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300">
              ₹{listing.base_price.toLocaleString("en-IN")}
            </span>
            {listing.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] text-zinc-500 border border-zinc-700 rounded-full px-2 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Profile Header ──────────────────────────────────────────────────────────

function ProfileHeader({ creator }: { creator: Creator }) {
  const rankData = getStyleRank(creator.earnings.lifetime_earnings);

  return (
    <div className="relative">
      {/* Hero gradient backdrop */}
      <div className="h-48 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-b border-white/10" />

      {/* Avatar */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="-mt-16 flex flex-col sm:flex-row sm:items-end gap-5 pb-6 border-b border-white/10">
          <div className="relative w-28 h-28 rounded-2xl border-2 border-white/20 overflow-hidden bg-zinc-800 shrink-0 shadow-2xl">
            <img
              src={creator.avatar_url}
              alt={creator.display_name}
              className="w-full h-full object-cover"
            />
            {creator.is_mega_influencer && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-900/80 to-transparent py-1.5 text-center text-[9px] text-yellow-300 font-bold tracking-widest uppercase">
                Mega Creator
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 pt-4 sm:pt-0">
            {/* Name + rank */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-black text-white tracking-tight">
                {creator.display_name}
              </h1>
              {creator.is_verified && (
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              )}
            </div>
            <p className="text-sm text-zinc-500">@{creator.username}</p>

            <RankBadge
              rank={rankData.rank}
              emoji={rankData.emoji}
              color={rankData.color}
            />

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 pt-1 text-sm">
              <div>
                <span className="font-bold text-white">{formatCompact(creator.total_units_sold)}</span>
                <span className="text-zinc-500 ml-1">pieces sold</span>
              </div>
              <div>
                <span className="font-bold text-white">{creator.listings.filter((l) => l.is_active).length}</span>
                <span className="text-zinc-500 ml-1">active drops</span>
              </div>
              {creator.social_accounts.map((s) => (
                <div key={s.platform} className="flex items-center gap-1.5 text-zinc-400">
                  {SOCIAL_ICONS[s.platform]}
                  <span className="text-white font-semibold">{formatCompact(s.follower_count)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Share button */}
          <button className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors self-start sm:self-auto">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="py-4 text-sm text-zinc-400 max-w-xl leading-relaxed">{creator.bio}</p>
        )}

        {/* Next rank progress */}
        {rankData.nextRank && (
          <div className="pb-6 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600">
                Progress to{" "}
                <span className="text-zinc-300 font-semibold">{rankData.nextRank.rank}</span>
              </span>
              <span className="text-zinc-600">
                ₹{creator.earnings.lifetime_earnings.toLocaleString("en-IN")} /{" "}
                ₹{rankData.nextRank.minEarnings.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-white/60 to-white"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    100,
                    (creator.earnings.lifetime_earnings / rankData.nextRank.minEarnings) * 100
                  )}%`,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Masonry Grid ────────────────────────────────────────────────────────────

function MasonryGrid({ listings }: { listings: DesignListing[] }) {
  const active = listings.filter((l) => l.is_active);
  if (active.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-600 space-y-2">
        <ShoppingBag className="w-8 h-8" />
        <p className="text-sm">No active listings yet.</p>
      </div>
    );
  }

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
      {active.map((listing, i) => (
        <div key={listing.id} className="break-inside-avoid mb-3">
          <DesignCard listing={listing} index={i} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Public Profile Component ──────────────────────────────────────────

interface CreatorProfileProps {
  creator: Creator;
}

export default function CreatorProfile({ creator }: CreatorProfileProps) {
  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      <ProfileHeader creator={creator} />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Section heading */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Editorial Drops
          </h2>
          <span className="text-xs text-zinc-600">
            {creator.listings.filter((l) => l.is_active).length} designs
          </span>
        </div>

        {/* 
          MASONRY GRID — Each card uses flux_editorial_image_url.
          These are photorealistic FLUX VTO editorial images,
          NOT flat t-shirt product photos.
        */}
        <MasonryGrid listings={creator.listings} />
      </div>
    </div>
  );
}
