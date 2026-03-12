'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  ShoppingBag,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Link2,
  X,
  Check,
  ChevronRight,
  Award,
  Users,
  GraduationCap,
  Banknote,
  CreditCard,
  Lock,
  Unlock,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Creator,
  PayoutCalculation,
  CampusFest,
  EarningsDataPoint,
  StyleInfluenceRank,
  CommissionTier,
} from '@/lib/types';
import {
  mockCreators,
  mockCampusFests,
  mockEarningsHistory,
  RANK_LABELS,
  COMMISSION_TIERS,
  formatCurrency,
  calculateProgressPercentage,
} from '@/lib/data';

interface CreatorDashboardProps {
  userId?: string;
}

// Mock current user (in production, this would come from auth context)
const CURRENT_USER_ID = 'creator_001';

export default function CreatorDashboard({ userId = CURRENT_USER_ID }: CreatorDashboardProps) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [payoutInfo, setPayoutInfo] = useState<PayoutCalculation | null>(null);
  const [campusFests, setCampusFests] = useState<CampusFest[]>([]);
  const [earningsHistory, setEarningsHistory] = useState<EarningsDataPoint[]>([]);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // Social link form state
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [handle, setHandle] = useState('');
  const [followers, setFollowers] = useState('');

  useEffect(() => {
    // Load mock data
    const user = mockCreators.find(c => c.id === userId);
    if (user) {
      setCreator(user);
      setCampusFests(user.is_campus_ambassador ? mockCampusFests : []);
      setEarningsHistory(mockEarningsHistory);

      // Calculate payout info
      const balance = user.balance;
      if (balance < 2500) {
        setPayoutInfo({
          status: 'LOCKED',
          current_balance: balance,
          store_credit_unlocked: false,
          cash_withdrawal_unlocked: false,
          amount_to_store_credit: 0,
          amount_to_cash: 0,
          next_threshold: 2500,
          next_threshold_type: 'store_credit',
        });
      } else if (balance < 5000) {
        setPayoutInfo({
          status: 'STORE_CREDIT_ONLY',
          current_balance: balance,
          store_credit_unlocked: true,
          cash_withdrawal_unlocked: false,
          amount_to_store_credit: balance,
          amount_to_cash: 0,
          next_threshold: 5000,
          next_threshold_type: 'cash',
        });
      } else {
        setPayoutInfo({
          status: 'CASH_AVAILABLE',
          current_balance: balance,
          store_credit_unlocked: true,
          cash_withdrawal_unlocked: true,
          amount_to_store_credit: 5000,
          amount_to_cash: balance - 5000,
          next_threshold: 0,
          next_threshold_type: null,
        });
      }
    }
  }, [userId]);

  const handleLinkSocial = async () => {
    if (!selectedPlatform || !handle || !followers) return;

    setIsLinking(true);

    // Mock API call - in production this would POST to /api/creators/link-social
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update local state (mock)
    if (creator) {
      const newFollowers = parseInt(followers);
      let newRate = 5;
      let newTier: CommissionTier = 'standard';

      if (selectedPlatform === 'instagram' && newFollowers >= 500000) {
        newRate = 50;
        newTier = 'mega_influencer';
      } else if (selectedPlatform === 'youtube' && newFollowers >= 250000) {
        newRate = 50;
        newTier = 'mega_influencer';
      } else if (newFollowers >= 100000) {
        newRate = 15;
        newTier = 'micro_influencer';
      }

      setCreator({
        ...creator,
        commission_rate: newRate,
        commission_tier: newTier,
        social_links: {
          ...creator.social_links,
          [selectedPlatform]: {
            handle,
            followers: newFollowers,
            verified: newFollowers >= 100000,
            linked_at: new Date().toISOString().split('T')[0],
          },
        },
      });
    }

    setIsLinking(false);
    setShowSocialModal(false);
    setSelectedPlatform('');
    setHandle('');
    setFollowers('');
  };

  const getRankInfo = (rank: StyleInfluenceRank) => {
    return RANK_LABELS[rank] || RANK_LABELS.rookie_designer;
  };

  const getTierBadge = () => {
    if (!creator) return null;

    const tierConfig = COMMISSION_TIERS[creator.commission_tier];
    const isMega = creator.is_mega_influencer;

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
          isMega
            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black'
            : 'bg-mn-teal/20 text-mn-teal border border-mn-teal'
        }`}
      >
        <Zap className="w-4 h-4" />
        {tierConfig.label} - {creator.commission_rate}% Commission
      </motion.div>
    );
  };

  if (!creator || !payoutInfo) {
    return (
      <div className="min-h-screen bg-mn-dark flex items-center justify-center">
        <div className="animate-pulse text-mn-teal">Loading dashboard...</div>
      </div>
    );
  }

  const rankInfo = getRankInfo(creator.style_influence_rank);
  const storeCreditProgress = calculateProgressPercentage(payoutInfo.current_balance, 2500);
  const cashProgress = calculateProgressPercentage(payoutInfo.current_balance, 5000);

  return (
    <div className="min-h-screen bg-mn-dark text-white font-montserrat">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-mn-dark via-mn-dark-secondary to-mn-dark">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-mn-teal/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-mn-purple/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img
                  src={creator.avatar_url}
                  alt={creator.username}
                  className="w-20 h-20 rounded-full border-4 border-mn-teal object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-mn-gold rounded-full flex items-center justify-center text-lg">
                  {rankInfo.emoji}
                </div>
              </motion.div>

              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  @{creator.username}
                  <span className="text-2xl">{rankInfo.emoji}</span>
                </h1>
                <p className="text-gray-400 text-sm">{rankInfo.description}</p>
                <div className="mt-2">{getTierBadge()}</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSocialModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-mn-purple to-mn-purple-light rounded-xl font-semibold text-white shadow-lg shadow-mn-purple/25"
            >
              <Link2 className="w-4 h-4" />
              Connect Socials
            </motion.button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {/* Current Balance */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-mn-card border border-mn-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-mn-teal/20 rounded-xl">
                  <Wallet className="w-6 h-6 text-mn-teal" />
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  payoutInfo.status === 'CASH_AVAILABLE'
                    ? 'bg-green-500/20 text-green-400'
                    : payoutInfo.status === 'STORE_CREDIT_ONLY'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {payoutInfo.status === 'CASH_AVAILABLE'
                    ? '✓ Unlocked'
                    : payoutInfo.status === 'STORE_CREDIT_ONLY'
                    ? 'Store Credit Only'
                    : '🔒 Locked'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(creator.balance)}</p>
            </motion.div>

            {/* Lifetime Earnings */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-mn-card border border-mn-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-mn-gold/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-mn-gold" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Lifetime Earnings</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(creator.lifetime_earnings)}</p>
            </motion.div>

            {/* Active Listings */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-mn-card border border-mn-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-mn-purple/20 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-mn-purple" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Active Listings</p>
              <p className="text-3xl font-bold text-white">{creator.active_listings}</p>
              <p className="text-xs text-gray-500 mt-1">{creator.total_items_sold} items sold total</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payout Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Payout Threshold Progress */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-mn-card border border-mn-border rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-mn-gold" />
                Earnings Redemption Journey
              </h3>

              {/* Progress Bar */}
              <div className="relative mb-8">
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cashProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-mn-teal via-mn-gold to-green-400 rounded-full"
                  />
                </div>

                {/* Threshold Markers */}
                <div className="absolute top-5 left-[50%] transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                      payoutInfo.store_credit_unlocked
                        ? 'bg-mn-gold border-mn-gold'
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  >
                    {payoutInfo.store_credit_unlocked ? (
                      <Check className="w-4 h-4 text-black" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </motion.div>
                  <p className="text-xs text-center mt-1 text-mn-gold font-bold">₹2,500</p>
                  <p className="text-[10px] text-center text-gray-500">Store Credit</p>
                </div>

                <div className="absolute top-5 right-0 -translate-y-1/2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                      payoutInfo.cash_withdrawal_unlocked
                        ? 'bg-green-400 border-green-400'
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  >
                    {payoutInfo.cash_withdrawal_unlocked ? (
                      <Check className="w-4 h-4 text-black" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </motion.div>
                  <p className="text-xs text-center mt-1 text-green-400 font-bold">₹5,000</p>
                  <p className="text-[10px] text-center text-gray-500">Cash</p>
                </div>
              </div>

              {/* Status Message */}
              <div className="bg-gray-900/50 rounded-xl p-4">
                {payoutInfo.status === 'LOCKED' && (
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">Balance Locked</p>
                      <p className="text-xs text-gray-400">
                        Earn {formatCurrency(2500 - payoutInfo.current_balance)} more to unlock store credit redemption
                      </p>
                    </div>
                  </div>
                )}
                {payoutInfo.status === 'STORE_CREDIT_ONLY' && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-mn-gold" />
                    <div>
                      <p className="text-sm font-semibold text-mn-gold">Store Credit Unlocked!</p>
                      <p className="text-xs text-gray-400">
                        Redeem as store credit now, or earn {formatCurrency(5000 - payoutInfo.current_balance)} more for cash withdrawal
                      </p>
                    </div>
                  </div>
                )}
                {payoutInfo.status === 'CASH_AVAILABLE' && (
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm font-semibold text-green-400">Cash Withdrawal Available!</p>
                      <p className="text-xs text-gray-400">
                        You can withdraw {formatCurrency(payoutInfo.amount_to_cash)} to bank OR use up to {formatCurrency(payoutInfo.amount_to_store_credit)} as store credit
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Earnings Chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-mn-card border border-mn-border rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-mn-teal" />
                Earnings Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsHistory}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#39A596" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#39A596" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#666"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(57,165,150,0.3)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Earnings']}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#39A596"
                      strokeWidth={2}
                      fill="url(#earningsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Social & Campus */}
          <div className="space-y-8">
            {/* Social Connections */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-mn-card border border-mn-border rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-mn-purple" />
                Connected Accounts
              </h3>

              <div className="space-y-3">
                {Object.entries(creator.social_links).map(([platform, account]) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                      {platform === 'youtube' && <Youtube className="w-5 h-5 text-red-500" />}
                      {platform === 'twitter' && <Twitter className="w-5 h-5 text-blue-400" />}
                      {platform === 'linkedin' && <Linkedin className="w-5 h-5 text-blue-600" />}
                      <div>
                        <p className="text-sm font-medium">{account?.handle}</p>
                        <p className="text-xs text-gray-400">
                          {account?.followers?.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    {account?.verified && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                ))}

                {Object.keys(creator.social_links).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No accounts connected</p>
                    <p className="text-xs mt-1">Link socials to upgrade your tier</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowSocialModal(true)}
                className="w-full mt-4 py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-mn-purple hover:text-mn-purple transition-colors text-sm font-medium"
              >
                + Add Social Account
              </button>
            </motion.div>

            {/* Campus Fests (if applicable) */}
            {creator.is_campus_ambassador && campusFests.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-mn-card border border-mn-border rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-mn-te Campus Fest Pal" />
                 ools
                </h3>

                <div className="space-y-4">
                  {campusFests.filter(f => f.is_active).map(fest => (
                    <div
                      key={fest.id}
                      className="p-4 bg-gradient-to-r from-mn-teal/10 to-transparent rounded-xl border border-mn-teal/20"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm">{fest.name}</h4>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        {fest.location} • {fest.date}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Collective Pool</p>
                          <p className="text-lg font-bold text-mn-teal">
                            {formatCurrency(fest.collective_pool)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Your Share</p>
                          <p className="text-lg font-bold text-white">
                            {formatCurrency(fest.creator_contribution)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Social Connect Modal */}
      <AnimatePresence>
        {showSocialModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSocialModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-mn-dark-secondary border border-mn-border rounded-2xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Connect Social Account</h2>
                <button
                  onClick={() => setShowSocialModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Platform Selection */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { id: 'instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/20' },
                  { id: 'youtube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/20' },
                  { id: 'twitter', icon: Twitter, color: 'text-blue-400', bg: 'bg-blue-400/20' },
                  { id: 'linkedin', icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-600/20' },
                ].map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      selectedPlatform === platform.id
                        ? `${platform.bg} border-2 border-mn-teal`
                        : 'bg-gray-900 border-2 border-transparent hover:border-gray-700'
                    }`}
                  >
                    <platform.icon className={`w-6 h-6 ${platform.color}`} />
                    <span className="text-xs text-gray-400 capitalize">{platform.id}</span>
                  </button>
                ))}
              </div>

              {/* Form Fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Handle / Username</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={e => setHandle(e.target.value)}
                    placeholder="@your_handle"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:border-mn-teal focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Follower Count</label>
                  <input
                    type="number"
                    value={followers}
                    onChange={e => setFollowers(e.target.value)}
                    placeholder="e.g., 500000"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:border-mn-teal focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Tier Upgrade Info */}
              <div className="bg-mn-purple/10 border border-mn-purple/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-mn-purple-light font-semibold mb-2">Unlock Higher Commissions!</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• 100k+ followers → 15% commission</li>
                  <li>• 500k+ Instagram OR 250k+ YouTube → 50% commission</li>
                </ul>
              </div>

              <button
                onClick={handleLinkSocial}
                disabled={!selectedPlatform || !handle || !followers || isLinking}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  !selectedPlatform || !handle || !followers
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-mn-purple to-mn-purple-light text-white hover:opacity-90'
                }`}
              >
                {isLinking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Connect & Upgrade
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}