'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  ShoppingBag,
  TrendingUp,
  Users,
  ArrowRight,
  Star,
  Sparkles,
  Award,
  Instagram,
  Youtube,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Creator,
  DesignListing,
} from '@/lib/types';
import {
  mockCreators,
  mockDesignListings,
  RANK_LABELS,
  formatCurrency,
} from '@/lib/data';

interface FeaturedCreator extends Creator {
  total_listings: number;
  featured_listings: DesignListing[];
  total_sales_value: number;
}

export default function FeaturedMarketplace() {
  const [creators, setCreators] = useState<FeaturedCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Filter mega influencers only
    const megaCreators = mockCreators.filter(c => c.is_mega_influencer);

    const enriched = megaCreators.map(creator => {
      const listings = mockDesignListings.filter(l => l.creator_id === creator.id);
      return {
        ...creator,
        total_listings: listings.length,
        featured_listings: listings.slice(0, 4),
        total_sales_value: listings.reduce((sum, l) => sum + (l.price * l.total_sales), 0),
      };
    });

    setCreators(enriched);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-mn-dark flex items-center justify-center">
        <div className="animate-pulse text-mn-gold">Loading featured creators...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mn-dark text-white font-montserrat">
      {/* Premium Header */}
      <div className="relative overflow-hidden">
        {/* Gold Chrome Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-mn-dark to-mn-dark" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(rgba(251, 191, 36, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(251, 191, 36, 0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-amber-400/30 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm tracking-wider">
                EXCLUSIVE MARKETPLACE
              </span>
            </span>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-4"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-4">
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                Featured Creators
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover designs from India&apos;s top fashion influencers.
              Premium quality, exclusive drops, and the best commission rates.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-12 mt-10"
          >
            {[
              { icon: Crown, value: creators.length, label: 'Top Creators' },
              { icon: ShoppingBag, value: creators.reduce((sum, c) => sum + c.total_listings, 0), label: 'Exclusive Designs' },
              { icon: Users, value: creators.reduce((sum, c) => sum + c.total_items_sold, 0), label: 'Items Sold' },
              { icon: TrendingUp, value: formatCurrency(creators.reduce((sum, c) => sum + c.total_sales_value, 0)), label: 'Total Sales Value' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-5 h-5 text-amber-400" />
                  <span className="text-2xl font-bold text-amber-400">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Featured Creators List */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {creators.map((creator, creatorIndex) => {
          const rankInfo = RANK_LABELS[creator.style_influence_rank];

          return (
            <motion.div
              key={creator.id}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * creatorIndex }}
              className="relative"
            >
              {/* Creator Card */}
              <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/40 to-gray-900/80 border border-amber-500/20 rounded-3xl overflow-hidden backdrop-blur-sm">
                {/* Creator Header */}
                <div className="relative p-8 border-b border-gray-800">
                  {/* Glow Effect */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

                  <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Creator Info */}
                    <div className="flex items-center gap-6">
                      {/* Avatar with Premium Border */}
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-amber-400 to-yellow-600">
                          <img
                            src={creator.avatar_url}
                            alt={creator.username}
                            className="w-full h-full rounded-full object-cover border-2 border-gray-900"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="w-5 h-5 text-black" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-3xl font-bold">@{creator.username}</h2>
                          <span className="px-3 py-1 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-amber-400/30 text-amber-400 text-sm font-semibold rounded-full">
                            {creator.commission_rate}% Commission
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="text-xl">{rankInfo.emoji}</span>
                            {rankInfo.title}
                          </span>
                          <span className="w-1 h-1 bg-gray-600 rounded-full" />
                          <span>{creator.total_items_sold} items sold</span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 mt-3">
                          {creator.social_links.instagram && (
                            <div className="flex items-center gap-1 text-pink-400 text-sm">
                              <Instagram className="w-4 h-4" />
                              {creator.social_links.instagram.followers > 1000000
                                ? `${(creator.social_links.instagram.followers / 1000000).toFixed(1)}M`
                                : `${Math.round(creator.social_links.instagram.followers / 1000)}K`}
                            </div>
                          )}
                          {creator.social_links.youtube && (
                            <div className="flex items-center gap-1 text-red-400 text-sm">
                              <Youtube className="w-4 h-4" />
                              {creator.social_links.youtube.followers > 1000000
                                ? `${(creator.social_links.youtube.followers / 1000000).toFixed(1)}M`
                                : `${Math.round(creator.social_links.youtube.followers / 1000)}K`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <Link
                      href={`/creator/${creator.username}`}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      View Collection
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Featured Designs Grid */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      Featured Drops
                    </h3>
                    <Link
                      href={`/creator/${creator.username}`}
                      className="text-amber-400 text-sm hover:underline flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {creator.featured_listings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + (index * 0.1) }}
                        className="group"
                      >
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900">
                          {/* Premium Image */}
                          <img
                            src={listing.flux_editorial_image_url}
                            alt={listing.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                          {/* Premium Tag */}
                          <div className="absolute top-3 right-3">
                            <span className="px-3 py-1 bg-amber-500/90 text-black text-xs font-bold rounded-full">
                              {creator.commission_rate}% COMM
                            </span>
                          </div>

                          {/* Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h4 className="font-bold text-white mb-1 line-clamp-1">
                              {listing.title}
                            </h4>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-amber-400">
                                {formatCurrency(listing.price)}
                              </p>
                              <p className="text-xs text-gray-400">
                                +{formatCurrency(listing.estimated_earnings_per_sale)}
                              </p>
                            </div>
                          </div>

                          {/* Hover Effect */}
                          <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-amber-500/20">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                Become a Creator
              </span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join the My Narrative creator program. Upload your AI-generated designs
              and earn commission on every sale. We handle all logistics.
            </p>
            <Link
              href="/creator-onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Award className="w-5 h-5" />
              Start Creating
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}