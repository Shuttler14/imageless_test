"""
MY NARRATIVE — Pipeline Core Functions
========================================
External API wrapper functions + orchestration logic.
Imported by stylist_pipeline.py (the FastAPI router).

ANTI-HALLUCINATION GUARDRAIL:
  - NO PyTorch / TensorFlow code is written here.
  - NO imaginary unified library for FLUX + face-swap.
  - Each external capability is a clean async wrapper around a real HTTP API.
  - FLUX generates the base editorial image FIRST.
  - Face Swap is applied SEQUENTIALLY AFTER FLUX completes.
  - Mock functions are clearly marked with MOCK: prefix in comments.
"""

import asyncio
import base64
import logging
import uuid
from typing import Optional

import httpx

logger = logging.getLogger("mn.pipeline")


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1 — EXTERNAL API WRAPPERS (Step 2: Data Ingestion)
# ═══════════════════════════════════════════════════════════════════════════════

async def extract_biometrics(image_base64: str, api_key: str) -> dict:
    """
    Wrapper: Calls the Vision + Monk Skin Tone API to extract:
      - Face bounding box (for face-swap cropping)
      - Monk Skin Tone (MST) scale value 1–10
      - Estimated body type

    EXTERNAL API REQUIRED:
      Endpoint: POST https://monk-skin-tone.googleapis.com/v1/detect
      Headers:  Authorization: Bearer {MONK_SKIN_API_KEY}
      Body:     { "image": { "content": "<base64>" } }

    In production, replace the MOCK block below with the real httpx call.

    Args:
        image_base64: Base64-encoded user photo (JPEG/PNG).
        api_key:      MONK_SKIN_API_KEY from environment.

    Returns:
        dict matching the Biometrics pydantic model schema.
    """
    # ── MOCK: Simulates API response for development ──────────────────────────
    # Replace this entire block with real API call in production.
    logger.info("extract_biometrics: calling Vision/MST API (MOCK)")

    # Real call would look like:
    # async with httpx.AsyncClient(timeout=30) as client:
    #     resp = await client.post(
    #         "https://monk-skin-tone.googleapis.com/v1/detect",
    #         headers={"Authorization": f"Bearer {api_key}"},
    #         json={"image": {"content": image_base64}},
    #     )
    #     resp.raise_for_status()
    #     data = resp.json()
    #     return parse_mst_response(data)

    # MOCK RESPONSE — realistic structure matching expected schema
    return {
        "face_bbox": [0.28, 0.04, 0.44, 0.38],   # [x, y, w, h] normalised
        "monk_skin_tone": 6,                        # MST scale 1-10
        "monk_skin_hex": "#A07850",
        "monk_skin_label": "Warm Tan",
        "body_type": "Athletic",
        "face_crop_base64": image_base64[:500],    # truncated for mock; real = cropped face
    }
    # ── END MOCK ──────────────────────────────────────────────────────────────


async def segment_wardrobe(image_base64: str, api_key: str) -> dict:
    """
    Wrapper: Calls a DeepFashion2-style Vision API to detect and crop
    garments in the user's uploaded photo.

    Detects: top, bottom, footwear, accessories
    Returns cropped images + dominant colour palettes per item.

    EXTERNAL API REQUIRED:
      Option A (Replicate): POST https://api.replicate.com/v1/predictions
                            Model: "viktorfa/deepfashion2" or equivalent
      Option B (Custom):    Your own CV microservice wrapping DeepFashion2
      Headers: Authorization: Token {VISION_API_KEY}

    Args:
        image_base64: Base64-encoded user photo.
        api_key:      VISION_API_KEY from environment.

    Returns:
        dict with "items" list, each matching WardrobeItem schema.
    """
    logger.info("segment_wardrobe: calling DeepFashion2 Vision API (MOCK)")

    # Real call would look like:
    # async with httpx.AsyncClient(timeout=60) as client:
    #     resp = await client.post(
    #         "https://api.replicate.com/v1/predictions",
    #         headers={
    #             "Authorization": f"Token {api_key}",
    #             "Content-Type": "application/json",
    #         },
    #         json={
    #             "version": "deepfashion2-model-version-hash",
    #             "input": {"image": f"data:image/jpeg;base64,{image_base64}"},
    #         },
    #     )
    #     resp.raise_for_status()
    #     prediction = resp.json()
    #     # Poll until complete (Replicate is async)
    #     return await poll_replicate_prediction(client, prediction["id"], api_key)

    # MOCK RESPONSE
    return {
        "items": [
            {
                "category": "top",
                "label": "White oversized graphic tee",
                "crop_base64": image_base64[:300],
                "dominant_colors": ["#FFFFFF", "#E8E8E8", "#333333"],
                "confidence": 0.94,
            },
            {
                "category": "bottom",
                "label": "Black slim-fit jeans",
                "crop_base64": image_base64[:300],
                "dominant_colors": ["#1A1A1A", "#2D2D2D"],
                "confidence": 0.91,
            },
            {
                "category": "footwear",
                "label": "Beige canvas sneakers",
                "crop_base64": image_base64[:300],
                "dominant_colors": ["#D4C5A9", "#B8A898"],
                "confidence": 0.87,
            },
        ]
    }
    # ── END MOCK ──────────────────────────────────────────────────────────────


async def save_to_ghost_closet(
    user_id: str,
    wardrobe_items: list[dict],
    db_url: str,
) -> bool:
    """
    Saves extracted wardrobe items as vector embeddings in pgvector (PostgreSQL).
    This is the "Data Moat" — every upload builds the user's Digital Style Graph.

    DATABASE REQUIRED:
      Table: ghost_closet (
        id UUID PRIMARY KEY,
        user_id TEXT,
        category TEXT,
        label TEXT,
        dominant_colors JSONB,
        embedding vector(512),    -- pgvector column
        created_at TIMESTAMPTZ DEFAULT now()
      )

    In production, replace with asyncpg + pgvector INSERT.
    Use a CLIP-style model to generate the 512-dim embedding from the crop image.

    Args:
        user_id:        Shopify customer ID or session UUID.
        wardrobe_items: List of WardrobeItem dicts from segment_wardrobe().
        db_url:         PostgreSQL connection string.

    Returns:
        True if all items saved successfully.
    """
    logger.info(f"save_to_ghost_closet: saving {len(wardrobe_items)} items for user {user_id} (MOCK)")

    # Real implementation would use asyncpg:
    # import asyncpg
    # conn = await asyncpg.connect(db_url)
    # for item in wardrobe_items:
    #     embedding = await generate_clip_embedding(item["crop_base64"])
    #     await conn.execute(
    #         """INSERT INTO ghost_closet
    #            (id, user_id, category, label, dominant_colors, embedding)
    #            VALUES ($1, $2, $3, $4, $5, $6)""",
    #         str(uuid.uuid4()), user_id, item["category"],
    #         item["label"], item["dominant_colors"], embedding,
    #     )
    # await conn.close()

    # MOCK: just log and return success
    for item in wardrobe_items:
        logger.info(f"  → Saved [{item['category']}] '{item['label']}' to ghost closet")
    return True


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2 — FLUX PROMPT BUILDER (Step 3A)
# ═══════════════════════════════════════════════════════════════════════════════

def build_flux_prompt(
    selections: dict,
    biometrics: dict,
    wardrobe: dict,
) -> str:
    """
    Constructs a detailed FLUX image generation prompt from:
      - User's occasion + vibe selections (Step 1)
      - Biometrics: Monk Skin Tone + body type (Step 2)
      - Wardrobe: extracted garment descriptions (Step 2)

    The prompt is engineered for FLUX's strengths:
      - Photorealistic editorial fashion photography
      - Skin-tone accuracy via explicit MST descriptors
      - Style coherence via vibe keywords

    Args:
        selections: UserSelections dict (occasion, vibe, flux_style_keywords)
        biometrics: Biometrics dict (monk_skin_label, body_type)
        wardrobe:   WardrobeSegmentation dict (items list)

    Returns:
        Formatted FLUX prompt string.
    """
    occasion = selections.get("occasion", "Casual Day Out")
    vibe_label = selections.get("vibe_label", "Everyday Cool")
    style_keywords = selections.get("flux_style_keywords", "stylish, modern")
    skin_label = biometrics.get("monk_skin_label", "Medium")
    body_type = biometrics.get("body_type", "Average")

    # Build garment description from extracted items
    garment_parts = []
    for item in wardrobe.get("items", []):
        garment_parts.append(item["label"])
    garments_str = ", ".join(garment_parts) if garment_parts else "a stylish Indian streetwear outfit"

    prompt = (
        f"Photorealistic Indian fashion editorial photograph. "
        f"Subject: Indian person with {skin_label} skin tone, {body_type} build. "
        f"Outfit: {garments_str}. "
        f"Occasion: {occasion}. "
        f"Vibe: '{vibe_label}' — {style_keywords}. "
        f"Shot style: high-end fashion magazine editorial, professional lighting, "
        f"sharp focus, full-body or three-quarter frame, urban Indian backdrop. "
        f"Technical: 85mm lens, f/2.0, ISO 400, golden hour or studio strobe. "
        f"Skin tone must be accurately rendered as {skin_label} — do not lighten. "
        f"No text, no watermarks, no borders. Ultra-detailed, 4K resolution."
    )

    logger.info(f"build_flux_prompt: generated {len(prompt)} char prompt")
    return prompt


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3 — FLUX IMAGE GENERATION (Step 3B)
# ═══════════════════════════════════════════════════════════════════════════════

async def call_flux_api(prompt: str, api_key: str) -> str:
    """
    STEP 3B: Calls the FLUX API (Black Forest Labs) to generate the
    base editorial body/outfit image.

    This runs FIRST in the generation pipeline — before any face swap.
    FLUX generates the body, clothes, lighting, and scene.
    The user's face identity is applied in the NEXT step.

    EXTERNAL API REQUIRED:
      POST https://api.bfl.ml/v1/flux-pro-1.1
      Headers: X-Key: {FLUX_API_KEY}
      Body: { "prompt": "...", "width": 768, "height": 1024,
              "steps": 28, "guidance": 3.5, "output_format": "jpeg" }

    The BFL API is async — it returns a polling ID, not the image directly.
    This function handles the poll loop internally.

    Args:
        prompt:  The engineered FLUX prompt from build_flux_prompt().
        api_key: FLUX_API_KEY from environment.

    Returns:
        Base64-encoded JPEG of the FLUX-generated image.

    Raises:
        HTTPException: if FLUX API fails or times out.
    """
    logger.info("call_flux_api: submitting generation request to FLUX (MOCK)")

    # ── REAL IMPLEMENTATION ───────────────────────────────────────────────────
    # async with httpx.AsyncClient(timeout=120) as client:
    #     # Submit generation job
    #     resp = await client.post(
    #         f"{FLUX_API_BASE}/flux-pro-1.1",
    #         headers={"X-Key": api_key, "Content-Type": "application/json"},
    #         json={
    #             "prompt": prompt,
    #             "width": 768,
    #             "height": 1024,
    #             "steps": 28,
    #             "guidance": 3.5,
    #             "output_format": "jpeg",
    #             "safety_tolerance": 2,
    #         },
    #     )
    #     resp.raise_for_status()
    #     job = resp.json()
    #     job_id = job["id"]
    #
    #     # Poll until ready (BFL API is async)
    #     for attempt in range(60):  # max 60 * 2s = 2 min
    #         await asyncio.sleep(2)
    #         poll = await client.get(
    #             f"{FLUX_API_BASE}/get_result?id={job_id}",
    #             headers={"X-Key": api_key},
    #         )
    #         result = poll.json()
    #         if result["status"] == "Ready":
    #             # Download image and convert to base64
    #             img_resp = await client.get(result["result"]["sample"])
    #             return base64.b64encode(img_resp.content).decode()
    #         elif result["status"] in ("Error", "Request Moderated"):
    #             raise HTTPException(500, f"FLUX error: {result['status']}")
    #     raise HTTPException(504, "FLUX generation timed out")
    # ─────────────────────────────────────────────────────────────────────────

    # MOCK: return a tiny 1x1 transparent placeholder base64 JPEG
    # In production this is replaced by the real FLUX image bytes
    mock_b64 = (
        "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U"
        "HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN"
        "DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy"
        "MjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB"
        "AQAAQIDAQEBAQEAAAAAAAAAAAIDBAUB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQAC"
    )
    logger.info("call_flux_api: MOCK image returned (replace with real FLUX output)")
    return mock_b64


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 4 — FACE SWAP (Step 3C)
# Applied AFTER FLUX generation. Sequential, not parallel.
# ═══════════════════════════════════════════════════════════════════════════════

async def call_face_swap_api(
    flux_image_base64: str,
    face_crop_base64: str,
    api_key: str,
) -> str:
    """
    STEP 3C: Applies the user's extracted face onto the FLUX-generated
    editorial body image using a Face Swap API.

    SEQUENCE GUARANTEE:
      This function MUST only be called AFTER call_flux_api() completes.
      It takes the FLUX output as the "target" and the user's cropped
      face as the "source". The result is the final Hybrid VTO image.

    EXTERNAL API REQUIRED:
      Option A (RapidAPI): POST https://faceswap.p.rapidapi.com/v1/image
        Headers: X-RapidAPI-Key: {FACE_SWAP_API_KEY}
        Body: {
          "source_img": "<face_crop_base64>",
          "target_img": "<flux_image_base64>",
          "face_restore": true
        }
      Option B (Replicate): lucataco/faceswap model on Replicate

    Args:
        flux_image_base64: The FLUX-generated base image (target body).
        face_crop_base64:  The user's extracted face crop (source identity).
        api_key:           FACE_SWAP_API_KEY from environment.

    Returns:
        Base64-encoded final image with user's face on FLUX body.

    Raises:
        HTTPException: if face swap API fails.
    """
    logger.info("call_face_swap_api: applying face identity to FLUX image (MOCK)")

    # ── REAL IMPLEMENTATION ───────────────────────────────────────────────────
    # async with httpx.AsyncClient(timeout=60) as client:
    #     resp = await client.post(
    #         "https://faceswap.p.rapidapi.com/v1/image",
    #         headers={
    #             "X-RapidAPI-Key": api_key,
    #             "X-RapidAPI-Host": "faceswap.p.rapidapi.com",
    #             "Content-Type": "application/json",
    #         },
    #         json={
    #             "source_img": face_crop_base64,
    #             "target_img": flux_image_base64,
    #             "face_restore": True,       # GFPGAN post-processing for sharpness
    #             "face_restore_visibility": 1,
    #             "codeformer_fidelity": 0.7,
    #         },
    #     )
    #     resp.raise_for_status()
    #     data = resp.json()
    #     return data["result_b64"]           # or data["output_url"] depending on API
    # ─────────────────────────────────────────────────────────────────────────

    # MOCK: returns the FLUX image unchanged (face swap not applied in mock)
    logger.info("call_face_swap_api: MOCK — returning flux_image as final (no real swap)")
    return flux_image_base64


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 5 — AFFILIATE UPSELL (Step 4 Mock)
# ═══════════════════════════════════════════════════════════════════════════════

def get_affiliate_recommendation(item_type: str, style_vibe: str) -> dict:
    """
    MOCK: Returns a hardcoded affiliate recommendation for a given item type
    and style vibe. In production this would query a curated product DB
    or a real-time Myntra / Nykaa API.

    ANTI-HALLUCINATION GUARDRAIL:
      This does NOT scrape Myntra in real time.
      It returns a static, curated recommendation with deep-link affiliate URL.

    Args:
        item_type:   e.g. "footwear", "top", "bottom", "accessory"
        style_vibe:  e.g. "sarcastic_rizzler", "quiet_luxury"

    Returns:
        dict with product info, affiliate link, and bank offer string.
    """
    # Curated mock catalogue — replace with DB lookup in production
    catalogue: dict[str, dict[str, dict]] = {
        "footwear": {
            "sarcastic_rizzler": {
                "item_name": "White Chunky Sneakers",
                "brand": "FILA",
                "price": 4999,
                "discounted_price": 3499,
                "affiliate_url": "https://www.myntra.com/fila-chunky-sneakers?aff=mynarrative",
                "image_url": "https://assets.myntra.com/fila-chunky-wht.jpg",
                "bank_offer": "Extra ₹500 off with HDFC Credit Card. Use code: HDFC500",
                "why_it_works": "Chunky white sneakers add contrast and ground the bold streetwear silhouette.",
            },
            "quiet_luxury": {
                "item_name": "Minimalist Leather Loafers",
                "brand": "Clarks",
                "price": 6999,
                "discounted_price": 5599,
                "affiliate_url": "https://www.myntra.com/clarks-loafers?aff=mynarrative",
                "image_url": "https://assets.myntra.com/clarks-loafer.jpg",
                "bank_offer": "10% cashback with ICICI Debit Card on orders above ₹4000.",
                "why_it_works": "Clean leather loafers complete the quiet luxury monochrome palette.",
            },
            "surviving_on_caffeine": {
                "item_name": "Cloud Comfort Slides",
                "brand": "Crocs",
                "price": 2999,
                "discounted_price": 1999,
                "affiliate_url": "https://www.myntra.com/crocs-slides?aff=mynarrative",
                "image_url": "https://assets.myntra.com/crocs-slides.jpg",
                "bank_offer": "Buy 2 get 20% off. No bank offer required.",
                "why_it_works": "Effortless slides match the 'unbothered' energy of this vibe perfectly.",
            },
            "cottagecore_chaos": {
                "item_name": "Brown Lace-Up Ankle Boots",
                "brand": "ALDO",
                "price": 5499,
                "discounted_price": 3999,
                "affiliate_url": "https://www.myntra.com/aldo-ankle-boots?aff=mynarrative",
                "image_url": "https://assets.myntra.com/aldo-boots.jpg",
                "bank_offer": "Flat ₹300 off with SBI Card. Code: SBI300",
                "why_it_works": "Earthy brown boots tie together the cottagecore layered texture story.",
            },
        },
        "accessory": {
            "sarcastic_rizzler": {
                "item_name": "Oversized Black Bucket Hat",
                "brand": "H&M",
                "price": 1299,
                "discounted_price": 899,
                "affiliate_url": "https://www.myntra.com/hm-bucket-hat?aff=mynarrative",
                "image_url": "https://assets.myntra.com/hm-bucket-blk.jpg",
                "bank_offer": "No current bank offer. Free shipping above ₹799.",
                "why_it_works": "A bucket hat adds the street-cred layer that screams main character.",
            },
            "quiet_luxury": {
                "item_name": "Gold Thin Chain Necklace",
                "brand": "Mia by Tanishq",
                "price": 8500,
                "discounted_price": 7650,
                "affiliate_url": "https://www.myntra.com/tanishq-mia-chain?aff=mynarrative",
                "image_url": "https://assets.myntra.com/tanishq-chain.jpg",
                "bank_offer": "₹750 off on orders above ₹7500 with Axis Bank.",
                "why_it_works": "A delicate gold chain is the only accessory quiet luxury needs.",
            },
        },
    }

    # Normalize inputs
    item_type = item_type.lower().strip()
    style_vibe = style_vibe.lower().replace(" ", "_").strip()

    # Lookup with fallback to sarcastic_rizzler defaults
    item_catalogue = catalogue.get(item_type, catalogue["footwear"])
    recommendation = item_catalogue.get(style_vibe, list(item_catalogue.values())[0])

    return {
        "item_type": item_type,
        "style_vibe": style_vibe,
        "is_gap_item": True,     # True = item wasn't in user's wardrobe; highlight in RED in UI
        "completion_pct": 90,    # "Your look is 90% complete"
        **recommendation,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 6 — MAIN ORCHESTRATION (Steps 2 + 3 combined)
# ═══════════════════════════════════════════════════════════════════════════════

async def run_stylist_pipeline(
    session_id: str,
    selections: dict,
    image_base64: str,
    flux_api_key: str,
    face_swap_api_key: str,
    vision_api_key: str,
    monk_skin_api_key: str,
    database_url: str,
) -> dict:
    """
    Master orchestration function for the full AI Stylist flow.

    STEP 2 — PARALLEL (asyncio.gather):
      • extract_biometrics()    → face bbox, MST, body type
      • segment_wardrobe()      → garment crops + labels

    STEP 3A — SEQUENTIAL (must wait for Step 2):
      • build_flux_prompt()     → construct FLUX prompt from Step 1 + 2 data

    STEP 3B — SEQUENTIAL (must wait for 3A):
      • call_flux_api()         → FLUX generates editorial image

    STEP 3C — SEQUENTIAL (must wait for 3B):
      • call_face_swap_api()    → Apply user's face onto FLUX image

    BACKGROUND (fire-and-forget):
      • save_to_ghost_closet()  → pgvector save (non-blocking)

    Args:
        session_id:      UUID for this session (used as user_id for ghost closet)
        selections:      UserSelections dict from Step 1
        image_base64:    User's uploaded photo
        *_api_key:       API keys from environment config
        database_url:    PostgreSQL connection string

    Returns:
        GenerationResult-compatible dict.
    """
    logger.info(f"[{session_id}] Starting stylist pipeline")

    # ── STEP 2: PARALLEL biometrics + wardrobe segmentation ──────────────────
    logger.info(f"[{session_id}] Step 2: Parallel extract_biometrics + segment_wardrobe")
    biometrics, wardrobe = await asyncio.gather(
        extract_biometrics(image_base64, monk_skin_api_key),
        segment_wardrobe(image_base64, vision_api_key),
    )
    logger.info(f"[{session_id}] Step 2 complete — MST={biometrics['monk_skin_tone']}, items={len(wardrobe['items'])}")

    # ── BACKGROUND: Save to Ghost Closet (non-blocking, fire-and-forget) ─────
    asyncio.create_task(
        save_to_ghost_closet(session_id, wardrobe["items"], database_url)
    )

    # ── STEP 3A: Build FLUX prompt ────────────────────────────────────────────
    logger.info(f"[{session_id}] Step 3A: Building FLUX prompt")
    flux_prompt = build_flux_prompt(selections, biometrics, wardrobe)

    # ── STEP 3B: FLUX generates base editorial image ──────────────────────────
    logger.info(f"[{session_id}] Step 3B: Calling FLUX API")
    flux_image_b64 = await call_flux_api(flux_prompt, flux_api_key)
    logger.info(f"[{session_id}] Step 3B complete — FLUX image received")

    # ── STEP 3C: Apply face swap AFTER FLUX completes ─────────────────────────
    logger.info(f"[{session_id}] Step 3C: Applying face swap to FLUX output")
    final_image_b64 = await call_face_swap_api(
        flux_image_base64=flux_image_b64,
        face_crop_base64=biometrics["face_crop_base64"],
        api_key=face_swap_api_key,
    )
    logger.info(f"[{session_id}] Step 3C complete — final image ready")

    # ── STEP 4: Identify gap items + fetch affiliate recommendations ──────────
    user_item_categories = [item["category"] for item in wardrobe["items"]]
    generated_items = []
    affiliate_recommendations = []

    # If FLUX added footwear that user doesn't own → flag as gap
    if "footwear" not in user_item_categories:
        generated_items.append("footwear")
        rec = get_affiliate_recommendation("footwear", selections.get("vibe_id", "sarcastic_rizzler"))
        affiliate_recommendations.append(rec)

    # If no accessory detected → suggest one
    if "accessory" not in user_item_categories:
        generated_items.append("accessory")
        rec = get_affiliate_recommendation("accessory", selections.get("vibe_id", "sarcastic_rizzler"))
        affiliate_recommendations.append(rec)

    return {
        "session_id": session_id,
        "flux_image_base64": flux_image_b64,
        "final_image_base64": final_image_b64,
        "flux_prompt_used": flux_prompt,
        "biometrics": biometrics,
        "wardrobe": wardrobe,
        "generated_items": generated_items,
        "affiliate_recommendations": affiliate_recommendations,
    }
