/**
 * ═══════════════════════════════════════════════════════════
 * MY NARRATIVE - GAP ANALYZER & AFFILIATE INTEGRATION
 * Detects wardrobe gaps and fetches affiliate product recommendations
 * ═══════════════════════════════════════════════════════════
 */

const MNGapAnalyzer = (() => {
  
  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  
  const CONFIG = window.MNConfig || {
    API: {
      AFFILIATE_LINKS_API: 'https://YOUR_VERCEL_APP.vercel.app/api/generate_affiliate_links'
    },
    NETWORK: {
      API_TIMEOUT: 30000,
      RETRY_ATTEMPTS: 3
    },
    FEATURES: {
      ENABLE_OFFLINE_MODE: true
    }
  };

  // ═══════════════════════════════════════════════════════════
  // WARDROBE GAP DETECTION
  // ═══════════════════════════════════════════════════════════
  
  const analyzeWardrobeGaps = (wardrobeItems, userIdentity, targetContext) => {
    const gaps = [];
    
    // Count existing categories
    const categoryCounts = {};
    wardrobeItems.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    
    // Essential categories for different contexts
    const essentialCategories = {
      casual: ['T-Shirt', 'Jeans', 'Sneakers'],
      formal: ['Formal Trousers', 'Shirt', 'Formal Shoes'],
      traditional: ['Kurta', 'Pajamas', 'Mojaris'],
      festive: ['Saree', 'Sherwani', 'Jhumkas'],
      street: ['Graphic Tee', 'Sneakers', 'Cap']
    };
    
    // Determine target context
    let targetCategories = essentialCategories.casual; // default
    
    if (targetContext) {
      const contextLower = targetContext.toLowerCase();
      if (contextLower.includes('work') || contextLower.includes('office')) {
        targetCategories = essentialCategories.formal;
      } else if (contextLower.includes('wedding') || contextLower.includes('festive')) {
        targetCategories = essentialCategories.festive;
      } else if (contextLower.includes('traditional')) {
        targetCategories = essentialCategories.traditional;
      } else if (contextLower.includes('street') || contextLower.includes('casual')) {
        targetCategories = essentialCategories.street;
      }
    }
    
    // Find missing or low-count categories
    targetCategories.forEach(category => {
      const count = categoryCounts[category] || 0;
      if (count === 0) {
        gaps.push({
          category,
          priority: 'high',
          reason: `Essential ${category} missing from wardrobe`
        });
      } else if (count === 1) {
        gaps.push({
          category,
          priority: 'medium',
          reason: `Only one ${category} - consider adding variety`
        });
      }
    });
    
    return gaps;
  };

  // ═══════════════════════════════════════════════════════════
  // AFFILIATE PRODUCT FETCHING
  // ═══════════════════════════════════════════════════════════
  
  const fetchAffiliateProducts = async (gaps, userIdentity = null) => {
    if (!gaps || gaps.length === 0) {
      return [];
    }
    
    try {
      // Call backend API with retry logic
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONFIG.NETWORK.API_TIMEOUT);
      
      const response = await fetch(CONFIG.API.AFFILIATE_LINKS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gaps: gaps.map(g => ({
            category: g.category,
            priority: g.priority,
            reason: g.reason
          })),
          identity: userIdentity,
          preferences: {
            priceRange: userIdentity?.pricePreference || 'medium',
            style: userIdentity?.coreExpression || 'minimal'
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`Affiliate API Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.products || [];
      
    } catch (error) {
      console.error('Affiliate fetch error:', error);
      
      // Fallback to offline database if enabled
      if (CONFIG.FEATURES.ENABLE_OFFLINE_MODE) {
        return getOfflineAffiliateProducts(gaps);
      }
      
      return [];
    }
  };

  // ═══════════════════════════════════════════════════════════
  // OFFLINE AFFILIATE DATABASE (Fallback)
  // ═══════════════════════════════════════════════════════════
  
  const getOfflineAffiliateProducts = (gaps) => {
    const offlineDatabase = {
      'T-Shirt': [
        {
          title: 'Premium Cotton Crew Neck Tee',
          brand: 'Nike',
          price: '₹1,499',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80',
          affiliateLink: '#',
          rating: 4.5
        },
        {
          title: 'Oversized Graphic T-Shirt',
          brand: 'Puma',
          price: '₹1,299',
          image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=300&q=80',
          affiliateLink: '#',
          rating: 4.3
        }
      ],
      'Jeans': [
        {
          title: 'Slim Fit Dark Wash Jeans',
          brand: "Levi's",
          price: '₹3,499',
          image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=300&q=80',
          affiliateLink: '#',
          rating: 4.7
        }
      ],
      'Sneakers': [
        {
          title: 'Air Max Classic',
          brand: 'Nike',
          price: '₹8,995',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
          affiliateLink: '#',
          rating: 4.8
        }
      ],
      'Kurta': [
        {
          title: 'Silk Blend Kurta',
          brand: 'Manyavar',
          price: '₹2,999',
          image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=300&q=80',
          affiliateLink: '#',
          rating: 4.6
        }
      ],
      'Formal Trousers': [
        {
          title: 'Slim Fit Formal Pants',
          brand: 'Arrow',
          price: '₹2,499',
          image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=300&q=80',
          affiliateLink: '#',
          rating: 4.4
        }
      ]
    };
    
    const results = [];
    gaps.forEach(gap => {
      const products = offlineDatabase[gap.category] || [];
      results.push(...products.map(p => ({ ...p, gap: gap.category })));
    });
    
    return results;
  };

  // ═══════════════════════════════════════════════════════════
  // UI RENDERING
  // ═══════════════════════════════════════════════════════════
  
  const renderGapAnalysis = (containerId, wardrobeItems, userIdentity, targetContext) => {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }
    
    // Analyze gaps
    const gaps = analyzeWardrobeGaps(wardrobeItems, userIdentity, targetContext);
    
    if (gaps.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #51cf66;">
          <h3 style="font-size: 24px; margin-bottom: 10px;">✅ Complete Wardrobe</h3>
          <p style="color: #888;">You have all the essentials for ${targetContext || 'your style'}!</p>
        </div>
      `;
      return;
    }
    
    // Show loading state
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 40px; margin-bottom: 20px;">🔍</div>
        <p style="color: #888;">Finding perfect matches for your wardrobe gaps...</p>
      </div>
    `;
    
    // Fetch affiliate products
    fetchAffiliateProducts(gaps, userIdentity).then(products => {
      const html = `
        <div class="mn-gap-analysis">
          <h2 style="font-size: 24px; margin-bottom: 20px; color: #39A596;">
            🎯 Wardrobe Recommendations
          </h2>
          
          <div class="mn-gaps-summary" style="margin-bottom: 30px;">
            <p style="color: #888; font-size: 14px;">
              We found ${gaps.length} opportunity${gaps.length > 1 ? 's' : ''} to enhance your ${targetContext || 'wardrobe'}:
            </p>
            ${gaps.map(gap => `
              <div style="padding: 10px; margin: 10px 0; background: rgba(57, 165, 150, 0.1); border-left: 3px solid #39A596; border-radius: 4px;">
                <strong>${gap.category}</strong> - ${gap.reason}
              </div>
            `).join('')}
          </div>
          
          <div class="mn-products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
            ${products.map(product => `
              <div class="mn-product-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; transition: transform 0.3s;">
                <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 200px; object-fit: cover;" />
                <div style="padding: 15px;">
                  <div style="color: #39A596; font-size: 12px; margin-bottom: 5px;">${product.brand}</div>
                  <h4 style="font-size: 14px; margin-bottom: 10px; color: #fff;">${product.title}</h4>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 18px; font-weight: bold; color: #39A596;">${product.price}</span>
                    <span style="color: #ffd700; font-size: 12px;">⭐ ${product.rating}</span>
                  </div>
                  <a href="${product.affiliateLink}" target="_blank" style="display: block; margin-top: 15px; padding: 10px; background: #39A596; color: white; text-align: center; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold;">
                    View Product →
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      container.innerHTML = html;
    });
  };

  // ═══════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════
  
  return {
    analyzeGaps: analyzeWardrobeGaps,
    fetchProducts: fetchAffiliateProducts,
    render: renderGapAnalysis
  };
})();

// Make available globally
window.MNGapAnalyzer = MNGapAnalyzer;
