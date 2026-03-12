'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  ShoppingBag,
  TrendingUp,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  ExternalLink,
  MapPin,
  Calendar,
  Globe,
} from 'lucide-react';
import Image from 'next/image';
import {
  Creator,
  DesignListing,
  StyleInfluenceRank,
} from '@/lib/types';
import {
  mockCreators,
  mockDesignListings,
  RANK_LABELS,
  COMMISSION_TIERS,
  formatCurrency,
} from '@/lib/data';

interface CreatorProfileProps {
  creatorId: string;
}

export default function CreatorProfile({ creatorId }: CreatorProfileProps) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [listings, setListings] = useState<DesignListing[]>([]);

  useEffect(() => {
    const creatorData = mockCreators.find(c => c.id === creatorId || c.username === creatorId);
    if (creatorData) {
      setCreator(creatorData);
      setListings(mockDesignListings.filter(l => l.creator_id === creatorData.id));
    }
  }, [creatorId]);

  if (!creator) {
    return (
      <div className="min-h-screen bg-mn-dark flex items-center justify-center">
        <div className="animate-pulse text-mn-teal">Loading profile...</div>
      </div>
    );
  }

  const rankInfo = RANK_LABELS[creator.style_influence_rank];
  const tierConfig = COMMISSION_TIERS[creator.commission_tier];

  // Social platform icons
  const socialIcons: Record<string, React.ElementType> = {
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin,
  };

  return (
    <div className="min-h-screen bg-mn-dark text-white font-montserrat">
      {/* Hero Header */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-96 bg-gradient-to-b from-mn-teal/20 via-transparent to-mn-dark" />

        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-8">
          {/* Back Link */}
          <a
            href="/featured-creators"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-mn-teal transition-colors mb-8"
          >
            <ExternalLink className="w-4 h-4 rotate-180" />
            Back to Featured Creators
          </a>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-40 h-40 rounded-full border-4 border-mn-teal overflow-hidden shadow-2xl shadow-mn-teal/30">
                <img
                  src={creator.avatar_url}
                  alt={creator.username}
                  className="w-full h-full object-cover"
                />
              </div>
              {creator.is_mega_influencer && (
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-black" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                  <h1 className="text-4xl md:text-5xl font-bold">
                    @{creator.username}
                  </h1>
                  {creator.is_mega_influencer && (
                    <span className="px-4 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-sm font-bold rounded-full">
                      FEATURED CREATOR
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  {/* Rank Badge */}
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-mn-card border border-mn-border rounded-full">
                    <span className="text-xl">{rankInfo.emoji}</span>
                    <span className="font-semibold">{rankInfo.title}</span>
                  </span>

                  {/* Commission Badge */}
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-mn-teal/20 border border-mn-teal/40 rounded-full text-mn-teal font-semibold">
                    {tierConfig.rate}% Commission
                  </span>
                </div>

                <p className="text-gray-400 mb-6 max-w-xl">
                  {rankInfo.description}. Creating fashion that speaks volumes.
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{formatCurrency(creator.lifetime_earnings)}</p>
                    <p className="text-sm text-gray-500">Lifetime Earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{creator.total_items_sold}</p>
                    <p className="text-sm text-gray-500">Items Sold</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{listings.length}</p>
                    <p className="text-sm text-gray-500">Designs</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-3"
            >
              {Object.entries(creator.social_links).map(([platform, account]) => {
                const Icon = socialIcons[platform];
                if (!Icon || !account) return null;
                return (
                  <a
                    key={platform}
                    href={`https://${platform}.com/${account.handle?.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 bg-mn-card border border-mn-border rounded-xl hover:border-mn-teal transition-colors"
                  >
                    <Icon className={`w-5 h-5 ${
                      platform === 'instagram' ? 'text-pink-500' :
                      platform === 'youtube' ? 'text-red-500' :
                      platform === 'twitter' ? 'text-blue-400' :
                      'text-blue-600'
                    }`} />
                    <span className="text-sm">{account.handle}</span>
                    {account.verified && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </a>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-mn-teal" />
            Designs by @{creator.username}
          </h2>
          <p className="text-gray-400 mt-2">
            Exclusive drops from this creator
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="group relative"
            >
              {/* Card - Fashion Magazine Style */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900">
                {/* Editorial Image */}
                <img
                  src={listing.flux_editorial_image_url}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                {/* Premium Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-xs font-semibold rounded-full text-white border border-white/10">
                    {creator.commission_rate}% Commission
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-xl font-bold text-mn-teal">
                        {formatCurrency(listing.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Earnings</p>
                      <p className="text-sm font-semibold text-green-400">
                        +{formatCurrency(listing.estimated_earnings_per_sale)}
                      </p>
                    </div>
                  </div>

                  {/* Sales Count */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {listing.total_sales} sales
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      listing.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-mn-teal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500">No designs available yet</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-mn-teal" />
                <span className="text-2xl font-bold">{formatCurrency(creator.lifetime_earnings)}</span>
              </div>
              <p className="text-sm text-gray-500">Lifetime Earnings</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-mn-purple" />
                <span className="text-2xl font-bold">{creator.total_items_sold}</span>
              </div>
              <p className="text-sm text-gray-500">Items Sold</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-mn-gold" />
                <span className="text-2xl font-bold">{rankInfo.title}</span>
              </div>
              <p className="text-sm text-gray-500">Style Rank</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-2xl font-bold">
                  {new Date(creator.created_at).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-500">Member Since</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}