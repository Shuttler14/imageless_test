
import React, { useEffect, useRef, useState } from 'react';

// --- Configuration & Data ---

const BRAND_GREEN = '#39A596';

const initialWardrobe = [
    // --- Existing Items ---
    {
        id: 'item-1',
        type: 'Top',
        category: 'Kurta',
        name: 'Emerald Silk Kurta',
        colorHex: BRAND_GREEN,
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=150&q=80',
        tags: ['Festive', 'Wedding']
    },
    {
        id: 'item-2',
        type: 'FullBody',
        category: 'Saree',
        name: 'Midnight Blue Saree',
        colorHex: '#1e3a8a',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80',
        tags: ['Traditional', 'Evening']
    },
    {
        id: 'item-3',
        type: 'Bottom',
        category: 'Jeans',
        name: 'Distressed Denim',
        colorHex: '#60a5fa',
        imageUrl: 'https://images.unsplash.com/photo-1542272617-08f0863200ed?auto=format&fit=crop&w=150&q=80',
        tags: ['Casual', 'Street']
    },
    {
        id: 'item-4',
        type: 'FullBody',
        category: 'Sherwani',
        name: 'Royal Ivory Sherwani',
        colorHex: '#fef3c7',
        imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=150&q=80',
        tags: ['Wedding', 'Groom']
    },
    {
        id: 'item-5',
        type: 'Footwear',
        category: 'Sneakers',
        name: 'Street Hype Kicks',
        colorHex: '#ef4444',
        imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=150&q=80',
        tags: ['Street', 'Active']
    },
    {
        id: 'item-6',
        type: 'Accessory',
        category: 'Jhumkas',
        name: 'Antique Gold Jhumkas',
        colorHex: '#d97706',
        imageUrl: 'https://images.unsplash.com/photo-1620760431288-6677f95561b3?auto=format&fit=crop&w=150&q=80',
        tags: ['Traditional', 'Jewelry']
    },
    {
        id: 'item-7',
        type: 'Accessory',
        category: 'Watch',
        name: 'Minimalist Watch',
        colorHex: '#4b5563',
        imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=150&q=80',
        tags: ['Formal', 'Accessory']
    },
    {
        id: 'item-8',
        type: 'Top',
        category: 'T-Shirt',
        name: 'Oversized Graphic Tee',
        colorHex: '#1f2937',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=150&q=80',
        tags: ['Street', 'Casual']
    },
    // --- Phase 3 Items ---
    {
        id: 'item-9',
        type: 'Bottom',
        category: 'Pajamas',
        name: 'White Cotton Pajamas',
        colorHex: '#ffffff',
        imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=150&q=80',
        tags: ['Traditional', 'Comfort']
    },
    {
        id: 'item-10',
        type: 'Footwear',
        category: 'Mojaris',
        name: 'Tan Leather Mojaris',
        colorHex: '#92400e',
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=150&q=80',
        tags: ['Traditional', 'Footwear']
    },
    {
        id: 'item-11',
        type: 'Bottom',
        category: 'Formal Trousers',
        name: 'Slim Fit Trousers',
        colorHex: '#374151',
        imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=150&q=80',
        tags: ['Formal', 'Work']
    },
    {
        id: 'item-12',
        type: 'Footwear',
        category: 'Heels',
        name: 'Stiletto Heels',
        colorHex: '#000000',
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=150&q=80', // Reusing placeholder
        tags: ['Formal', 'Party']
    }
];

// Compatibility Rules
const COMPATIBILITY_RULES = {
    'Kurta': {
        attract: ['Pajamas', 'Jeans', 'Mojaris', 'Watch'],
        repel: ['Formal Trousers', 'Sherwani', 'T-Shirt']
    },
    'Saree': {
        attract: ['Blouse', 'Heels', 'Jhumkas', 'Watch'],
        repel: ['Sneakers', 'Jeans', 'T-Shirt', 'Pajamas']
    }
};

/**
 * ZeroGravityCloset
 * Phase 4: The Strategic Wrapper (UI/UX)
 */
const ZeroGravityCloset = ({ identity, context, onClose }) => {
    const containerRef = useRef(null);
    const requestRef = useRef();
    const itemsRef = useRef({});

    const [dockedIds, setDockedIds] = useState(new Set());
    const [affinities, setAffinities] = useState({});
    const [toast, setToast] = useState(null); // { message, visible }

    const physicsState = useRef(
        initialWardrobe.map((item) => ({
            ...item,
            x: Math.random() * 500,
            y: Math.random() * 500,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: 45,
        }))
    );

    const mouseRef = useRef({ x: -1000, y: -1000 });

    const toggleDock = (id) => {
        setDockedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                const item = physicsState.current.find(p => p.id === id);
                if (item) {
                    item.vx = (Math.random() - 0.5) * 0.5;
                    item.vy = (Math.random() - 0.5) * 0.5;
                }
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // --- Magic Wand Logic with Backend Integration ---
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzeOutfit = async () => {
        if (dockedIds.size === 0) {
            showToast("Select items first to begin your narrative.");
            return;
        }

        setIsAnalyzing(true);
        const dockedItems = initialWardrobe.filter(item => dockedIds.has(item.id));

        // Get config from global or use defaults
        const config = window.MNConfig || {
            API: { FASHION_CONSULTANT_API: 'https://YOUR_VERCEL_APP.vercel.app/api/fashion_consultant' },
            NETWORK: { API_TIMEOUT: 30000 },
            FEATURES: { ENABLE_OFFLINE_MODE: true }
        };

        try {
            // Call backend API
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), config.NETWORK.API_TIMEOUT);

            const response = await fetch(config.API.FASHION_CONSULTANT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_input: "Analyze this outfit combination for style coherence and occasion suitability",
                    selected_products: dockedItems.map(item => ({
                        title: item.name,
                        type: item.category,
                        color: item.colorHex,
                        tags: item.tags
                    })),
                    context: {
                        mode: 'outfit_analysis',
                        identity: identity || { presence: 'Fashion Explorer' }
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();
            showToast(result.direction || result.message || "Great outfit combination!");

        } catch (error) {
            console.error('Outfit analysis error:', error);

            // Fallback to offline analysis if enabled
            if (config.FEATURES.ENABLE_OFFLINE_MODE) {
                const offlineMessage = generateOfflineAnalysis(dockedItems);
                showToast(offlineMessage);
            } else {
                showToast("Unable to analyze outfit. Please check your connection.");
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Offline fallback analysis
    const generateOfflineAnalysis = (items) => {
        const categories = items.map(i => i.category);
        const tags = [...new Set(items.flatMap(i => i.tags))];

        if (categories.includes('Kurta') && categories.includes('Pajamas')) {
            return "Perfect for a Sangeet night! Classic yet comfortable.";
        } else if (categories.includes('Kurta') && categories.includes('Jeans')) {
            return "Indo-Western fusion. Great for a casual Friday.";
        } else if (categories.includes('Sherwani')) {
            return "Regal choice. Ready for the Wedding day.";
        } else if (categories.includes('Saree') && categories.includes('Accessory')) {
            return "Elegant and timeless. The jewelry completes the look.";
        } else if (categories.includes('Kurta') && categories.includes('Sneakers')) {
            return "Bold street style. Breaking the rules.";
        } else if (tags.includes('Formal') && tags.length > 1) {
            return "Professional and polished. Perfect for important meetings.";
        } else if (tags.includes('Casual') || tags.includes('Street')) {
            return "Relaxed and confident. Great for everyday wear.";
        } else {
            return `${items.length} pieces curated. Your narrative is taking shape!`;
        }
    };

    const showToast = (msg) => {
        setToast({ message: msg, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    useEffect(() => {
        // Affinities Logic
        const newAffinities = {};
        const dockedItems = initialWardrobe.filter(item => dockedIds.has(item.id));

        initialWardrobe.forEach(item => {
            if (dockedIds.has(item.id)) {
                newAffinities[item.id] = 'neutral';
                return;
            }

            let score = 0;
            dockedItems.forEach(docked => {
                const rule = COMPATIBILITY_RULES[docked.category];
                if (rule) {
                    if (rule.attract.includes(item.category)) score += 1;
                    if (rule.repel.includes(item.category)) score -= 1;
                }
            });

            if (score > 0) newAffinities[item.id] = 'attract';
            else if (score < 0) newAffinities[item.id] = 'repel';
            else newAffinities[item.id] = 'neutral';
        });

        setAffinities(newAffinities);
    }, [dockedIds]);

    const dockedIdsRef = useRef(dockedIds);
    const affinitiesRef = useRef(affinities);

    useEffect(() => {
        dockedIdsRef.current = dockedIds;
    }, [dockedIds]);

    useEffect(() => {
        affinitiesRef.current = affinities;
    }, [affinities]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Unified handler for both mouse and touch events
        const handleMove = (clientX, clientY) => {
            const rect = container.getBoundingClientRect();
            mouseRef.current = {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        // Mouse event handlers
        const handleMouseMove = (e) => {
            handleMove(e.clientX, e.clientY);
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        // Touch event handlers
        const handleTouchMove = (e) => {
            e.preventDefault(); // Prevent scrolling while touching the closet
            const touch = e.touches[0];
            if (touch) {
                handleMove(touch.clientX, touch.clientY);
            }
        };

        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            if (touch) {
                handleMove(touch.clientX, touch.clientY);
            }
        };

        const handleTouchEnd = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        // Add event listeners for both mouse and touch
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);
        container.addEventListener('touchcancel', handleTouchEnd);

        // Animation loop
        let frameId;
        const animate = () => {
            updatePhysics(dockedIdsRef.current, affinitiesRef.current);
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            container.removeEventListener('touchcancel', handleTouchEnd);
            cancelAnimationFrame(frameId);
        };
    }, []);

    const updatePhysics = (currentDockedIds, currentAffinities) => {
        if (!containerRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        const items = physicsState.current;
        const MAX_VELOCITY = 1.5;
        const CENTER = { x: width / 2, y: height / 2 };

        items.forEach(item => {
            if (currentDockedIds.has(item.id)) return;

            // Mouse Repulsion
            const dx = item.x - mouseRef.current.x;
            const dy = item.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (1 - dist / 150) * 0.2;
                const angle = Math.atan2(dy, dx);
                item.vx += Math.cos(angle) * force;
                item.vy += Math.sin(angle) * force;
            }

            // Magnetic Attraction
            const affinity = currentAffinities[item.id];
            if (affinity === 'attract') {
                const ax = CENTER.x - item.x;
                const ay = CENTER.y - item.y;
                if (Math.sqrt(ax * ax + ay * ay) > 50) {
                    const pullStrength = 0.005;
                    item.vx += ax * pullStrength;
                    item.vy += ay * pullStrength;
                }
            } else if (affinity === 'repel') {
                const ax = item.x - CENTER.x;
                const ay = item.y - CENTER.y;
                const pushStrength = 0.002;
                item.vx += ax * pushStrength;
                item.vy += ay * pushStrength;
            }

            const speed = Math.sqrt(item.vx * item.vx + item.vy * item.vy);
            if (speed > MAX_VELOCITY) {
                item.vx = (item.vx / speed) * MAX_VELOCITY;
                item.vy = (item.vy / speed) * MAX_VELOCITY;
            }

            item.x += item.vx;
            item.y += item.vy;

            if (item.x < item.radius) { item.x = item.radius; item.vx *= -1; }
            else if (item.x > width - item.radius) { item.x = width - item.radius; item.vx *= -1; }
            if (item.y < item.radius) { item.y = item.radius; item.vy *= -1; }
            else if (item.y > height - item.radius) { item.y = height - item.radius; item.vy *= -1; }
        });

        // Collision
        for (let i = 0; i < items.length; i++) {
            if (currentDockedIds.has(items[i].id)) continue;
            for (let j = i + 1; j < items.length; j++) {
                if (currentDockedIds.has(items[j].id)) continue;
                const a = items[i];
                const b = items[j];
                const dx = b.x - a.x; const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = a.radius + b.radius;
                if (dist < minDist) {
                    const angle = Math.atan2(dy, dx);
                    const overlap = minDist - dist;
                    const f = 0.05;
                    const fx = Math.cos(angle) * overlap * f;
                    const fy = Math.sin(angle) * overlap * f;
                    a.vx -= fx; a.vy -= fy;
                    b.vx += fx; b.vy += fy;
                }
            }
        }

        items.forEach((item) => {
            const el = itemsRef.current[item.id];
            if (el && !currentDockedIds.has(item.id)) {
                el.style.transform = `translate3d(${item.x - item.radius}px, ${item.y - item.radius}px, 0)`;
            }
        });
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500&display=swap');
      .font-playfair { font-family: 'Playfair Display', serif; }
      .font-inter { font-family: 'Inter', sans-serif; }
    `}} />

            <div className="w-full h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-black flex flex-col overflow-hidden relative font-inter text-gray-100">

                {/* Toast Notification */}
                <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500/90 text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-500 flex items-center gap-3 ${toast?.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                    <span className="text-xl">✨</span>
                    <span className="font-playfair italic tracking-wide">{toast?.message}</span>
                </div>

                {/* Header */}
                <div className="absolute top-8 left-8 z-10 select-none pointer-events-none">
                    <h1 className="text-3xl font-playfair font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-500">
                        {identity ? `${identity.presence}'s Closet` : 'My Narrative'}
                    </h1>
                    <p className="text-[10px] text-gray-400 tracking-[0.3em] mt-2 uppercase border-l-2 border-emerald-500 pl-3">
                        Consultant // Beta 2.0
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 z-50 p-2 rounded-full bg-black/20 hover:bg-white/10 backdrop-blur-md text-white/50 hover:text-white transition-all"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Zero Gravity Zone */}
                <div ref={containerRef} className="flex-1 relative w-full overflow-hidden" style={{ touchAction: 'none' }}>
                    {physicsState.current.map((item) => {
                        const isDocked = dockedIds.has(item.id);
                        const affinity = affinities[item.id] || 'neutral';
                        if (isDocked) return null;

                        return (
                            <div
                                key={item.id}
                                ref={el => itemsRef.current[item.id] = el}
                                onClick={() => toggleDock(item.id)}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    toggleDock(item.id);
                                }}
                                className={`absolute cursor-pointer group rounded-full overflow-hidden border-2 shadow-2xl transition-all duration-700 active:scale-95`}
                                style={{
                                    width: item.radius * 2,
                                    height: item.radius * 2,
                                    borderColor: affinity === 'attract' ? '#39A596' : (affinity === 'repel' ? '#4b5563' : 'rgba(255,255,255,0.1)'),
                                    boxShadow: affinity === 'attract'
                                        ? `0 0 40px #39A59660`
                                        : (affinity === 'repel' ? 'none' : `0 0 20px ${item.colorHex}20`),
                                    opacity: affinity === 'repel' ? 0.3 : 1,
                                    top: 0, left: 0,
                                    willChange: 'transform, opacity',
                                    touchAction: 'manipulation'
                                }}
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className={`w-full h-full object-cover transition-all duration-700 ${affinity === 'repel' ? 'grayscale opacity-50' : 'opacity-90 group-hover:opacity-100 group-hover:scale-110'}`}
                                />

                                {/* Minimal Overlay */}
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${affinity === 'attract' ? 'opacity-100 bg-emerald-900/20' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <span className="font-playfair text-white text-xs italic tracking-wider">
                                        {affinity === 'attract' ? 'Match' : item.category}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Moodboard Dock */}
                <div className="h-72 bg-gradient-to-t from-black via-gray-900/95 to-transparent backdrop-blur-xl border-t border-white/5 p-8 z-20 flex flex-col relative transition-all duration-500">

                    {/* Dock Header */}
                    <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
                        <div>
                            <h2 className="text-xl font-playfair font-bold text-white tracking-wide">
                                {dockedIds.size > 0 ? 'Your Moodboard' : 'Curate Your Look'}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 font-inter">
                                {dockedIds.size} items selected
                            </p>
                        </div>

                        {/* Magic Wand Button */}
                        <button
                            onClick={analyzeOutfit}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-6 py-2 flex items-center gap-2 shadow-lg shadow-emerald-900/50 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={dockedIds.size === 0 || isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <span className="animate-spin">⚙️</span>
                                    <span className="text-xs font-bold tracking-widest uppercase">Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    <span className="text-xs font-bold tracking-widest uppercase">Analyze Fit</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Docked Items List */}
                    <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {dockedIds.size === 0 && (
                            <div className="w-full text-center py-8 opacity-40">
                                <div className="text-4xl mb-4 text-emerald-500/50">✦</div>
                                <p className="font-playfair italic text-lg text-gray-400">Drag floating elements here to weave your narrative.</p>
                            </div>
                        )}

                        {Array.from(dockedIds).map(id => {
                            const item = physicsState.current.find(i => i.id === id);
                            if (!item) return null;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => toggleDock(item.id)}
                                    className="flex-shrink-0 w-32 h-40 bg-gray-800/50 rounded-lg border border-white/10 relative group cursor-pointer hover:border-emerald-500/50 transition-all hover:-translate-y-2 duration-300 overflow-hidden shadow-xl"
                                >
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-28 object-cover opacity-80 group-hover:opacity-100" />
                                    <div className="p-3 bg-gray-900/80 backdrop-blur-sm absolute bottom-0 w-full">
                                        <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">{item.category}</div>
                                        <div className="text-[9px] text-gray-300 font-playfair italic truncate">{item.name}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ZeroGravityCloset;
