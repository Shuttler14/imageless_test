"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Star,
  ShoppingBag,
  Flame,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { Creator, DesignListing, SocialPlatform, RANK_LADDER } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortOption = "trending" | "newest" | "top_selling";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function getStyleRankLabel(lifetimeEarnings: number): string {
  let current = RANK_LADDER[0];
  for (const tier of RANK_LADDER) {
    if (lifetimeEarnings >= tier.min) current = tier;
  }
  return `${current.emoji} ${current.rank}`;
}

const SOCIAL_ICONS: Record<SocialPlatform, React.ReactNode> = {
  instagram: <Instagram className="w-3.5 h-3.5" />,
  youtube: <Youtube className="w-3.5 h-3.5" />,
  twitter: <Twitter className="w-3.5 h-3.5" />,
  linkedin: <Linkedin className="w-3.5 h-3.5" />,
};

// ─── Gold shimmer keyframe injection ─────────────────────────────────────────
// (Injected once via a style tag; keeps the component self-contained)

const GoldShimmerStyle = () => (
  <style>{`
    @keyframes gold-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    .gold-shimmer {
      background: linear-gradient(
        90deg,
        #b8860b 0%,
        #ffd700 30%,
        #fffacd 50%,
        #ffd700 70%,
        #b8860b 100%
      );
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gold-shimmer 3s linear infinite;
    }
    .chrome-shimmer {
      background: linear-gradient(
        90deg,
        #9ca3af 0%,
        #f3f4f6 30%,
        #ffffff 50%,
        #f3f4f6 70%,
        #9ca3af 100%
      );
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gold-shimmer 4s linear infinite;
    }
  `}</style>
);

// ─── VIP Design Card ─────────────────────────────────────────────────────────

function VIPDesignCard({
  listing,
  creator,
  index,
}: {
  listing: DesignListing;
  creator: Creator;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative rounded-3xl overflow-hidden border border-yellow-900/40 bg-zinc-950 cursor-pointer"
      style={{
        boxShadow: hovered
          ? "0 0 40px rgba(212, 175, 55, 0.18), 0 0 0 1px rgba(212,175,55,0.25)"
          : "0 0 0 1px rgba(255,255,255,0.04)",
        transition: "box-shadow 0.4s ease",
      }}
    >
      {/* 
        CRITICAL VISUAL RULE:
        Image source = flux_editorial_image_url (FLUX VTO editorial shot).
        This is a photorealistic model wearing the design — fashion magazine quality.
        NEVER use flat_tshirt_image here.
      */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        <motion.img
          src={listing.flux_editorial_image_url}
          alt={listing.title}
          className="w-full h-full object-cover object-top"
          animate={{ scale: hovered ? 1.07 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Gold crown badge — top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-yellow-900/60 rounded-full px-2.5 py-1">
          <Crown className="w-3 h-3 text-yellow-400" />
          <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">VIP</span>
        </div>

        {/* Units sold — top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
          <ShoppingBag className="w-3 h-3 text-zinc-300" />
          <span className="text-[10px] text-zinc-300 font-semibold">{formatCompact(listing.units_sold)}</span>
        </div>

        {/* Bottom card info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2.5">
          <div>
            <h3 className="text-sm font-black text-white leading-snug line-clamp-2 tracking-tight">
              {listing.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                className="w-5 h-5 rounded-full border border-yellow-900/60 object-cover"
              />
              <span className="text-xs text-zinc-400">@{creator.username}</span>
              {creator.is_verified && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white">
              ₹{listing.base_price.toLocaleString("en-IN")}
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 px-3 py-1.5 text-xs font-bold text-black hover:from-yellow-500 hover:to-yellow-400 transition-all"
            >
              <ShoppingBag className="w-3 h-3" />
              Buy Now
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Creator Spotlight Card ──────────────────────────────────────────────────

function CreatorSpotlightCard({ creator }: { creator: Creator }) {
  const totalFollowers = creator.social_accounts.reduce(
    (sum, s) => sum + s.follower_count,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 rounded-2xl border border-yellow-900/30 bg-zinc-950/80 hover:border-yellow-700/50 transition-colors cursor-pointer group"
    >
      <div className="relative shrink-0">
        <img
          src={creator.avatar_url}
          alt={creator.display_name}
          className="w-14 h-14 rounded-xl object-cover border border-yellow-900/50"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
          <Crown className="w-3 h-3 text-black" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-white text-sm truncate">{creator.display_name}</p>
          {creator.is_verified && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
        </div>
        <p className="text-xs text-zinc-500">@{creator.username}</p>
        <p className="text-xs text-yellow-600/80 mt-0.5">
          {getStyleRankLabel(creator.earnings.lifetime_earnings)}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-white">{formatCompact(totalFollowers)}</p>
        <p className="text-[10px] text-zinc-600">followers</p>
        <div className="flex items-center gap-1 mt-1 justify-end text-zinc-600">
          {creator.social_accounts.map((s) => (
            <span key={s.platform}>{SOCIAL_ICONS[s.platform]}</span>
          ))}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
    </motion.div>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function MarketplaceHero() {
  return (
    <div className="relative overflow-hidden py-20 px-6 text-center border-b border-white/5">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-yellow-900/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-zinc-800/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative space-y-4 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-900/60 bg-yellow-950/30 text-yellow-500 text-xs font-bold uppercase tracking-widest">
          <Crown className="w-3.5 h-3.5" />
          Featured Creators Only
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">
          <span className="chrome-shimmer">The VIP</span>
          <br />
          <span className="gold-shimmer">Editorial Drop</span>
        </h1>

        <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          Exclusive designs from My Narrative's top mega-influencers.
          Every piece is crafted via FLUX AI and worn by the creator themselves.
        </p>

        <div className="flex items-center justify-center gap-6 pt-2 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Trending drops</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-yellow-500" />
            <span>500k+ creators</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span>VTO editorial shots</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sort & Filter Bar ────────────────────────────────────────────────────────

function SortBar({
  sort,
  onSort,
}: {
  sort: SortOption;
  onSort: (s: SortOption) => void;
}) {
  const options: { value: SortOption; label: string }[] = [
    { value: "trending", label: "🔥 Trending" },
    { value: "newest", label: "✨ Newest" },
    { value: "top_selling", label: "📦 Top Selling" },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <SlidersHorizontal className="w-4 h-4 text-zinc-600 shrink-0" />
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSort(opt.value)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            sort === opt.value
              ? "border-yellow-700 bg-yellow-950/50 text-yellow-400"
              : "border-white/10 bg-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main FeaturedMarketplace Component ──────────────────────────────────────
// Route: /featured-creators
// Only displays listings from creators where is_mega_influencer === true.

interface FeaturedMarketplaceProps {
  /** Full list of creators — component filters to mega-influencers internally */
  creators: Creator[];
}

export default function FeaturedMarketplace({ creators }: FeaturedMarketplaceProps) {
  const [sort, setSort] = useState<SortOption>("trending");

  // GUARD: Only show mega-influencer creators
  const megaCreators = useMemo(
    () => creators.filter((c) => c.is_mega_influencer),
    [creators]
  );

  // Flatten all active listings with creator reference attached
  const allListings = useMemo(() => {
    const flat: Array<{ listing: DesignListing; creator: Creator }> = [];
    for (const creator of megaCreators) {
      for (const listing of creator.listings.filter((l) => l.is_active)) {
        flat.push({ listing, creator });
      }
    }
    return flat;
  }, [megaCreators]);

  // Sort
  const sortedListings = useMemo(() => {
    const copy = [...allListings];
    switch (sort) {
      case "top_selling":
        return copy.sort((a, b) => b.listing.units_sold - a.listing.units_sold);
      case "newest":
        return copy.sort(
          (a, b) =>
            new Date(b.listing.created_at).getTime() -
            new Date(a.listing.created_at).getTime()
        );
      case "trending":
      default:
        // Trending = weighted by units_sold × recency boost
        return copy.sort((a, b) => {
          const daysSinceA =
            (Date.now() - new Date(a.listing.created_at).getTime()) / 86400000;
          const daysSinceB =
            (Date.now() - new Date(b.listing.created_at).getTime()) / 86400000;
          const scoreA = a.listing.units_sold / (daysSinceA + 1);
          const scoreB = b.listing.units_sold / (daysSinceB + 1);
          return scoreB - scoreA;
        });
    }
  }, [allListings, sort]);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      <GoldShimmerStyle />

      {/* Hero */}
      <MarketplaceHero />

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Featured Creators Spotlight */}
        {megaCreators.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              Mega Creators
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {megaCreators.map((creator) => (
                <CreatorSpotlightCard key={creator.id} creator={creator} />
              ))}
            </div>
          </section>
        )}

        {/* Listings Grid */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              VIP Editorial Drops
              <span className="ml-2 text-yellow-700">({sortedListings.length})</span>
            </h2>
            <SortBar sort={sort} onSort={setSort} />
          </div>

          {sortedListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-700 space-y-2">
              <Crown className="w-10 h-10" />
              <p className="text-sm">No VIP drops yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedListings.map(({ listing, creator }, i) => (
                <VIPDesignCard
                  key={listing.id}
                  listing={listing}
                  creator={creator}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
