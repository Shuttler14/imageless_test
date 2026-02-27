"""
MY NARRATIVE — AI Stylist Pipeline
====================================
FastAPI backend orchestrating the 5-step Zero-Friction styling flow.

Architecture:
  Step 1 → Occasion + Vibe stored in session/state (frontend only, no backend needed)
  Step 2 → Image upload triggers PARALLEL biometrics + wardrobe segmentation
  Step 3 → SEQUENTIAL: FLUX generation → Face Swap application
  Step 4 → Affiliate upsell recommendations (mock)
  Step 5 → Gamification state (mascot quest + style graph)

EXTERNAL API KEYS REQUIRED (set in .env):
  FLUX_API_KEY         — https://api.bfl.ml  (Black Forest Labs FLUX API)
  FACE_SWAP_API_KEY    — e.g. https://rapidapi.com/faceswap (any RapidAPI face-swap endpoint)
  VISION_API_KEY       — e.g. Google Cloud Vision / Replicate DeepFashion2
  MONK_SKIN_API_KEY    — Google Monk Skin Tone API or custom endpoint
  DATABASE_URL         — PostgreSQL + pgvector connection string

Run with:
  uvicorn stylist_pipeline:app --reload --port 8000
"""

import os
import asyncio
import base64
import logging
import uuid
from typing import Optional

import httpx
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mn.stylist")

# ── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="My Narrative AI Stylist Pipeline",
    description="Zero-Friction Hybrid Virtual Try-On Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: lock down to your Shopify/Next.js domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Environment Config ────────────────────────────────────────────────────────
FLUX_API_KEY = os.getenv("FLUX_API_KEY", "REPLACE_WITH_BFL_API_KEY")
FACE_SWAP_API_KEY = os.getenv("FACE_SWAP_API_KEY", "REPLACE_WITH_FACE_SWAP_KEY")
VISION_API_KEY = os.getenv("VISION_API_KEY", "REPLACE_WITH_VISION_API_KEY")
MONK_SKIN_API_KEY = os.getenv("MONK_SKIN_API_KEY", "REPLACE_WITH_MONK_SKIN_KEY")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/mynarrative")

FLUX_API_BASE = "https://api.bfl.ml/v1"
FACE_SWAP_API_BASE = "https://faceswap.p.rapidapi.com/v1/image"  # Example endpoint
VISION_API_BASE = "https://vision.googleapis.com/v1"
MONK_SKIN_API_BASE = "https://monk-skin-tone.googleapis.com/v1"  # Hypothetical


# ── Pydantic Models ───────────────────────────────────────────────────────────

class Occasion(str):
    DATE_NIGHT = "Date Night"
    OFFICE = "Office"
    SANGEET = "Sangeet"
    AIRPORT = "Airport Look"


class VibeCard(BaseModel):
    vibe_id: str
    label: str
    description: str
    flux_style_keywords: str  # injected into FLUX prompt


class UserSelections(BaseModel):
    """Carries the Step 1 state from frontend to backend."""
    occasion: str = Field(..., example="Date Night")
    vibe_id: str = Field(..., example="sarcastic_rizzler")
    vibe_label: str = Field(..., example="The Sarcastic Rizzler")
    flux_style_keywords: str = Field(..., example="confident, dark academia, layered")


class Biometrics(BaseModel):
    """Output of extract_biometrics() wrapper."""
    face_bbox: list[float]       # [x, y, w, h] normalised 0–1
    monk_skin_tone: int          # 1–10 (MST scale)
    monk_skin_hex: str           # e.g. "#8D5524"
    monk_skin_label: str         # e.g. "Medium Brown"
    body_type: str               # e.g. "Athletic", "Slim", "Curvy"
    face_crop_base64: str        # cropped face image for face-swap step


class WardrobeItem(BaseModel):
    """A single garment extracted by segment_wardrobe()."""
    category: str                # "top" | "bottom" | "footwear" | "accessory"
    label: str                   # e.g. "Black slim-fit jeans"
    crop_base64: str             # cropped garment image
    dominant_colors: list[str]   # hex codes, e.g. ["#1a1a1a", "#4a4a4a"]
    confidence: float            # 0.0 – 1.0


class WardrobeSegmentation(BaseModel):
    items: list[WardrobeItem]


class GenerationResult(BaseModel):
    """Final output from the FLUX → Face Swap pipeline."""
    session_id: str
    flux_image_base64: str        # Raw FLUX output (before face swap)
    final_image_base64: str       # After face swap applied
    flux_prompt_used: str
    biometrics: Biometrics
    wardrobe: WardrobeSegmentation
    generated_items: list[str]    # Items FLUX added that user doesn't own
    affiliate_recommendations: list[dict]


class StylistRequest(BaseModel):
    """Full request payload for /api/generate endpoint."""
    session_id: Optional[str] = None
    selections: UserSelections
    image_base64: str             # User's uploaded photo as base64


class AffiliateRecommendation(BaseModel):
    item_type: str
    style_vibe: str


# ── Vibe Card Registry ────────────────────────────────────────────────────────
# These are the 4 Narrative Vibe Cards shown in Step 1B.
# flux_style_keywords feed directly into the FLUX prompt builder.

VIBE_CARDS: dict[str, VibeCard] = {
    "surviving_on_caffeine": VibeCard(
        vibe_id="surviving_on_caffeine",
        label="Surviving on Caffeine",
        description="That 3am grind energy. Oversized, cozy, unbothered.",
        flux_style_keywords="oversized hoodie, relaxed fit, muted tones, coffee shop editorial, moody lighting",
    ),
    "sarcastic_rizzler": VibeCard(
        vibe_id="sarcastic_rizzler",
        label="The Sarcastic Rizzler",
        description="Main character syndrome. Bold fits, zero apologies.",
        flux_style_keywords="bold streetwear, statement pieces, confident pose, urban editorial, high contrast",
    ),
    "quiet_luxury": VibeCard(
        vibe_id="quiet_luxury",
        label="Quiet Luxury",
        description="Let the fabric speak. Minimal, elevated, intentional.",
        flux_style_keywords="minimalist luxury, neutral palette, tailored silhouette, soft studio lighting, clean editorial",
    ),
    "cottagecore_chaos": VibeCard(
        vibe_id="cottagecore_chaos",
        label="Cottagecore Chaos",
        description="Pinterest board escaped into real life. Soft but feral.",
        flux_style_keywords="floral prints, layered textures, earthy tones, golden hour outdoor editorial, romantic styling",
    ),
}

# Monk Skin Tone → color theory palette mapping
# Used in VibeCardResult "Why this works" tooltip
MST_COLOR_THEORY: dict[int, dict] = {
    1:  {"hex": "#F6EDE4", "label": "Porcelain",     "works_with": ["dusty rose", "ivory", "soft lavender"]},
    2:  {"hex": "#F3E7DB", "label": "Ivory",          "works_with": ["peach", "warm white", "light camel"]},
    3:  {"hex": "#F7EAD0", "label": "Sand",           "works_with": ["terracotta", "sage green", "rust orange"]},
    4:  {"hex": "#EAD9BB", "label": "Light Beige",   "works_with": ["olive", "burnt orange", "deep burgundy"]},
    5:  {"hex": "#D7BD96", "label": "Golden Beige",  "works_with": ["mustard", "forest green", "rich plum"]},
    6:  {"hex": "#A07850", "label": "Warm Tan",       "works_with": ["cobalt blue", "white", "bold red"]},
    7:  {"hex": "#825C43", "label": "Caramel",        "works_with": ["electric blue", "deep purple", "bright coral"]},
    8:  {"hex": "#604134", "label": "Chestnut",       "works_with": ["gold", "deep teal", "cream"]},
    9:  {"hex": "#3A312A", "label": "Espresso",       "works_with": ["bright white", "neon accents", "deep jewel tones"]},
    10: {"hex": "#292420", "label": "Ebony",          "works_with": ["stark white", "chrome silver", "bold neons"]},
}


# ═══════════════════════════════════════════════════════════════════════════════
# FASTAPI ROUTE HANDLERS
# ═══════════════════════════════════════════════════════════════════════════════

from pipeline_core import run_stylist_pipeline, get_affiliate_recommendation


@app.get("/api/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "mn-ai-stylist-pipeline"}


@app.get("/api/vibes")
async def get_vibe_cards():
    """
    Returns the 4 Narrative Vibe Cards for Step 1B frontend rendering.
    No auth required — public endpoint.
    """
    return {"vibes": [v.model_dump() for v in VIBE_CARDS.values()]}


@app.get("/api/mst-palette/{mst_value}")
async def get_mst_palette(mst_value: int):
    """
    Returns the Monk Skin Tone colour theory palette for a given MST value (1–10).
    Used by VibeCardResult to render the 'Why this works' tooltip.
    """
    if mst_value not in MST_COLOR_THEORY:
        raise HTTPException(400, f"MST value must be 1–10, got {mst_value}")
    return MST_COLOR_THEORY[mst_value]


@app.post("/api/generate")
async def generate_editorial_look(
    request: StylistRequest,
    background_tasks: BackgroundTasks,
):
    """
    MAIN PIPELINE ENDPOINT — Steps 2 + 3 + 4.

    Accepts: occasion, vibe selection, and base64 user photo.
    Returns: final face-swapped editorial image + affiliate upsell data.

    Flow:
      1. Validate request
      2. Run parallel biometrics + wardrobe segmentation
      3. Build FLUX prompt
      4. FLUX generates base image
      5. Face Swap applies user identity
      6. Return result with affiliate recommendations

    AUTHENTICATION NOTE:
      Add a Shopify Customer JWT or session token header in production.
      Use FastAPI's Depends() for auth middleware.
    """
    session_id = request.session_id or str(uuid.uuid4())

    if not request.image_base64:
        raise HTTPException(400, "image_base64 is required")
    if not request.selections:
        raise HTTPException(400, "selections (occasion + vibe) are required")

    try:
        result = await run_stylist_pipeline(
            session_id=session_id,
            selections=request.selections.model_dump(),
            image_base64=request.image_base64,
            flux_api_key=FLUX_API_KEY,
            face_swap_api_key=FACE_SWAP_API_KEY,
            vision_api_key=VISION_API_KEY,
            monk_skin_api_key=MONK_SKIN_API_KEY,
            database_url=DATABASE_URL,
        )
        return {"success": True, "session_id": session_id, **result}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{session_id}] Pipeline error: {e}", exc_info=True)
        raise HTTPException(500, f"Pipeline failed: {str(e)}")


@app.post("/api/affiliate")
async def affiliate_recommendation(req: AffiliateRecommendation):
    """
    Step 4: Returns a mock affiliate product recommendation.
    Used by VibeCardResult to render the 'Gap Item' upsell box.

    ANTI-HALLUCINATION GUARDRAIL:
      Returns hardcoded curated data. NOT a real-time Myntra scraper.
    """
    result = get_affiliate_recommendation(req.item_type, req.style_vibe)
    return {"success": True, "recommendation": result}


@app.get("/api/occasions")
async def get_occasions():
    """Returns the Step 1A occasion options for frontend rendering."""
    return {
        "occasions": [
            {"id": "date_night",  "label": "Date Night",   "emoji": "🌙", "description": "Romantic, elevated, unforgettable."},
            {"id": "office",      "label": "Office",        "emoji": "💼", "description": "Power dressing. Own the room."},
            {"id": "sangeet",     "label": "Sangeet",       "emoji": "💃", "description": "Festive, vibrant, celebration-ready."},
            {"id": "airport",     "label": "Airport Look",  "emoji": "✈️", "description": "Effortless transit. Runway in the terminal."},
        ]
    }


@app.post("/api/style-graph/upload")
async def upload_ootd_for_style_graph(
    user_id: str = Form(...),
    image: UploadFile = File(...),
):
    """
    Step 5: Gamification — Accepts OOTD photo uploads to train the Style Graph.
    Each upload progresses the user toward '5% Store Credit' unlock.

    In production:
      - Run segment_wardrobe() on the uploaded image
      - Save to ghost_closet via save_to_ghost_closet()
      - Update user's upload_count in the users table
      - Return updated progress toward the 3-upload milestone

    AUTHENTICATION NOTE:
      Requires Shopify Customer ID passed as form field.
      Add JWT auth middleware in production.
    """
    contents = await image.read()
    image_b64 = base64.b64encode(contents).decode()

    # MOCK: In production, run segment_wardrobe() + save_to_ghost_closet() here
    mock_upload_count = 1  # Replace with DB query: SELECT upload_count FROM users WHERE id = user_id
    mock_uploads_needed = max(0, 3 - mock_upload_count)
    store_credit_unlocked = mock_upload_count >= 3

    return {
        "success": True,
        "user_id": user_id,
        "upload_count": mock_upload_count,
        "uploads_needed_for_credit": mock_uploads_needed,
        "store_credit_unlocked": store_credit_unlocked,
        "message": (
            "5% Store Credit unlocked! 🎉" if store_credit_unlocked
            else f"Upload {mock_uploads_needed} more OOTD photo(s) to unlock 5% Store Credit."
        ),
    }
