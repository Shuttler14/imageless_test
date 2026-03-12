# Design System Analysis Report
**Files Analyzed**: `settings_data.json`, `application.css.liquid`, `my-closet.liquid`

---

## 1. FONT FAMILIES

### In application.css.liquid
- **Lato** (imported from Google Fonts: weights 100, 300, 400, 700, 900)
- **Montserrat** (imported from Google Fonts: weights 100-900)
- **Cinzel Decorative** (serif font used for policies)

### In my-closet.liquid
- **Montserrat** (primary heading font in digital closet)
- **-apple-system, sans-serif** (fallback for system fonts)

### Usage Context
- Body/default text: `Lato`
- Headings/titles: `Montserrat`
- Policies section: `Cinzel Decorative`

### In settings_data.json
**No font families defined** - Settings file contains configuration data only (logos, social links, plugin settings)

---

## 2. COLORS

### In application.css.liquid
| Color | Usage |
|-------|-------|
| `#333` | Scrollbar track background |
| `#555` | Scrollbar thumb background |
| `#888` | Scrollbar thumb hover state |
| `#cdcdcd` | Subtle borders |
| `#fff` | White backgrounds |
| `rgba(0,0,0,0.8)` | Dark overlay (80% opacity) |
| `rgba(131, 129, 129, 0.5)` | Semi-transparent gray (50% opacity) |

### In my-closet.liquid
**Primary Brand Colors:**
- `#16a34a` - Green accent (active states, primary buttons)
- `#15803d` - Darker green variant
- `#22c55e` - Lighter green
- `#00ff88` - Bright neon green
- `#7c3aed` - Purple accent

**Neutral Colors:**
- `#1a1a1a` - Dark text
- `#fff` - White
- `#000` - Black
- `#444`, `#555`, `#666`, `#888` - Gray scale
- `#ccc` - Light gray borders
- `#e2e8f0` - Very light gray
- `#f0f0f0`, `#f8f8f8`, `#fafafa` - Off-white backgrounds

**Category Colors (Clothing Items):**
- `#1e3a8a` - Navy blue
- `#6b7280` - Gray
- `#d4b896` - Beige
- `#7c3f00` - Brown
- `#ef4444` - Red
- `#22c55e` - Green
- `#fbbf24` - Yellow
- `#f472b6` - Pink

**RGBA Colors (Transparency Effects):**
- `rgba(0,0,0,0.06)` - Very subtle black overlay
- `rgba(0,0,0,0.1)` - Light black overlay
- `rgba(0,0,0,0.45)` - Dark overlay
- `rgba(0,255,136,0.8)` - Green glow effect

**Utility Colors:**
- `#bbf7d0` - Light green background
- `#f0fdf4` - Very light green background
- `#e9d5ff` - Light purple background
- `#faf5ff` - Very light purple background

### In settings_data.json
**Colors defined in notification plugin settings:**
- `#ffffff` - White (side button)
- `#000000` - Black (text and buttons)
- `#4a4a4a` - Dark gray (subheading)
- `#1fb3a7` - Teal/cyan (success message)

---

## 3. BORDER-RADIUS VALUES

### In application.css.liquid
- **`10px`** - Used for scrollbar thumb styling

### In my-closet.liquid
- **`100px`** - Pill-shaped buttons (filter tabs, action buttons)
- **`14px`** - Card containers (closet item cards, add cards)

### Not found in settings_data.json
Settings file does not contain CSS styling definitions.

---

## 4. MY-CLOSET.LIQUID FULL STRUCTURE

### File Overview
- **Total Lines**: 643
- **Type**: Shopify Liquid Section
- **Purpose**: Digital wardrobe/closet management interface

### HTML Structure Hierarchy

```
<div class="mn-closet-page">
  ├── <div class="mn-closet-header">
  │   ├── <h1 class="mn-closet-title">
  │   ├── <p class="mn-closet-subtitle">
  │   └── <div class="mn-closet-stats">
  │       ├── Total Items count
  │       ├── Categories count
  │       └── Profile completion %
  │
  ├── <div class="mn-closet-filters" id="mnc-filters">
  │   ├── All (active by default)
  │   ├── Tops
  │   ├── Bottoms
  │   ├── Outerwear
  │   ├── Footwear
  │   ├── Accessories
  │   └── Ethnic
  │
  ├── <div class="mn-closet-grid" id="mnc-grid">
  │   ├── Dynamic item cards (populated by JS)
  │   └── Empty state message
  │
  └── <div class="mn-closet-add-section">
      ├── <h2> Add More Clothes
      ├── <div class="mn-closet-add-cards">
      │   ├── Card 1: Upload Photo (AI Detection)
      │   │   ├── Photo input
      │   │   ├── Scanning UI (hidden)
      │   │   │   ├── Preview image
      │   │   │   ├── Scan overlay animation
      │   │   │   ├── Status message
      │   │   │   └── Save/Retake buttons
      │   │   └── Choose Photo button
      │   │
      │   └── Card 2: Ghost Mode (Manual Entry)
      │       ├── Enter Ghost Mode button
      │       └── Ghost Mode Form (hidden)
      │           ├── Item Type select
      │           ├── Item Name/Label input
      │           ├── Brand input
      │           ├── Primary Color picker (11 colors)
      │           ├── Fit/Style chips (6 options)
      │           ├── Occasions multi-select (6 options)
      │           └── Add to Closet button
```

### Embedded CSS Sections

| Section | Purpose |
|---------|---------|
| **DIGITAL CLOSET PAGE** | Main container styling |
| **Header** | Title, subtitle, stats layout |
| **Filter Tabs** | Category filter button styling |
| **Item Grid** | CSS Grid layout for closet items |
| **Add Section** | Add clothes cards container |
| **Scan UI** | Photo scanning animation and preview |
| **Ghost Mode Form** | Manual entry form styling |

### Key CSS Classes

**Layout Classes:**
- `.mn-closet-page` - Main container (max-width: 1100px)
- `.mn-closet-header` - Header section
- `.mn-closet-filters` - Filter buttons container (flex layout)
- `.mn-closet-grid` - Item grid (CSS Grid: auto-fill, minmax 180px)
- `.mn-closet-add-section` - Add clothes section
- `.mn-closet-add-cards` - Two-column card layout

**Component Classes:**
- `.mn-closet-filter-btn` - Filter buttons (pill-shaped, 100px border-radius)
- `.mn-closet-item-card` - Item cards (14px border-radius)
- `.mn-add-card-photo` - Photo upload card
- `.mn-add-card-ghost` - Ghost mode card
- `.mn-scan-ui` - Scanning interface
- `.mn-ghost-form` - Manual entry form
- `.mn-ghost-color` - Color picker buttons
- `.mn-ghost-chip` - Option chips (fit, occasions)

### JavaScript Functionality

**Main Functions:**
1. `loadCloset()` - Load items from localStorage
2. `renderGrid()` - Render closet items as grid
3. `initFilters()` - Initialize category filters
4. `initPhotoUpload()` - Handle photo upload and AI detection
5. `initGhostMode()` - Handle manual item entry
6. `saveCloset()` - Save to localStorage

**Event Listeners:**
- Photo upload input change
- Filter button clicks
- Color picker clicks
- Fit chips clicks
- Occasions multi-select clicks
- Save button click
- Real-time identity updates
- Storage events for sync

**Color Picker Options:**
- White, Black, Navy Blue, Grey, Beige, Brown, Red, Green, Yellow, Pink, Multicolor

**Fit Options:**
- Slim, Regular, Oversized, Relaxed, Cropped, Fitted

**Occasion Options:**
- Casual, Office, Date Night, Gym, Ethnic Event, Party

### Data Structure

Each closet item contains:
```javascript
{
  label: string,           // Item name
  category: string,        // Type (tops, bottoms, etc.)
  brand: string,          // Brand name
  color: string,          // Primary color
  fit: string,            // Fit type
  occasions: array,       // Applicable occasions
  source: string,         // 'photo_upload' or 'ghost_mode'
  added_at: ISO timestamp,
  img: string             // Image URL or placeholder
}
```

### Storage
- Uses browser `localStorage` with key `mn_identity`
- Syncs across tabs via storage events
- Custom event `mn-identity-updated` for real-time updates

### Responsive Behavior
- Max-width container (1100px)
- Flexible grid (auto-fill, 180px min)
- Mobile-friendly filter tabs (flex-wrap)
- Hidden/shown states for modals and forms

---

## 5. SETTINGS_DATA.JSON CONFIGURATION

### Structure
```json
{
  "current": { ... },      // Active theme configuration
  "presets": { ... }       // Preset configurations
}
```

### Current Settings Overview
- **Navigation**: Logo, mobile logo, menu links
- **Footer**: Blocks for newsletter, company info, menus, social
- **Social Links**: Instagram, LinkedIn, Twitter (Facebook empty)
- **Apps/Integrations**:
  - Judge.me Reviews
  - EcomSend Restock
  - SG Notify Me (Back in Stock notifications)

### Notify Me Plugin Colors
- Side button: `#ffffff` (white) text on default background
- Side button text: `#000000` (black)
- Heading: `#000000` (black)
- Subheading: `#4a4a4a` (dark gray)
- Button: `#000000` (black) with `#ffffff` (white) text
- Success message: `#1fb3a7` (teal)

### No Custom Font or Border-Radius Config
The settings file does not define global font families or border-radius values - these are handled in CSS files.

---

## Summary Table

| Component | Font Families | Colors | Border-Radius |
|-----------|---------------|--------|--------------|
| **application.css.liquid** | Lato, Montserrat, Cinzel Decorative | 7 hex/rgba colors | 10px |
| **my-closet.liquid** | Montserrat, system fonts | 30+ hex/rgba colors | 100px, 14px |
| **settings_data.json** | None | 5 hex colors (plugin only) | None |

---

*Report generated from workspace analysis of digital closet implementation files.*
