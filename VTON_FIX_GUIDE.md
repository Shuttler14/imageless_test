# Virtual Try-On Fix Guide

## Issue
Server Error (500): Invalid version or not permitted - The IDM-VTON model version hash was outdated.

## Solution Applied

### Changed in `mynarrative-ai/api/virtual_try_on.py`

**Before:**
```python
"cuuupid/idm-vton:c871bb9b046607e580c22118d58d01d4ce893999830f6e61e6d262172740922e"
```

**After:**
```python
"cuuupid/idm-vton"  # Uses latest version automatically
```

## Alternative Models (if primary doesn't work)

If `cuuupid/idm-vton` still gives errors, try these alternatives:

### Option 1: Viton-HD
```python
output = client.run(
    "yisol/viton-hd:8822b2a85ee74d0b8d0e33ec0a8b2d63e7d2bbb4e3c58c6c4d16b53f7f4e3c9a",
    input={
        "person_image": human_img,
        "cloth_image": garm_img,
        "cloth_type": category  # "upper" or "lower"
    }
)
```

### Option 2: OOTDiffusion (Most Accurate)
```python
output = client.run(
    "levihsu/ootdiffusion",
    input={
        "model_image": human_img,
        "cloth_image": garm_img,
        "category": category,  # "upper_body" or "lower_body"
        "scale": 2.0,
        "sample": 1
    }
)
```

### Option 3: TryOnDiffusion (Free, Faster)
```python
output = client.run(
    "fofr/tryon-diffusion",
    input={
        "image": human_img,
        "garment": garm_img,
        "category": category
    }
)
```

## How to Test

1. **Deploy the fix to Vercel:**
   ```bash
   cd mynarrative-ai
   vercel --prod
   ```

2. **Check Environment Variables:**
   Make sure `REPLICATE_API_TOKEN` is set in Vercel dashboard:
   - Go to your Vercel project
   - Settings → Environment Variables
   - Add `REPLICATE_API_TOKEN` = your_token_here

3. **Test the endpoint:**
   ```bash
   curl -X POST https://mynarrative-ai.vercel.app/api/virtual_try_on \
     -H "Content-Type: application/json" \
     -d '{
       "mode": "vton",
       "user_image": "https://example.com/user.jpg",
       "garment_image": "https://example.com/product.jpg",
       "category": "upper_body"
     }'
   ```

## Debugging Steps

If still not working:

1. **Check Replicate API Key:**
   - Login to https://replicate.com
   - Go to Account → API Tokens
   - Make sure token is active and has permissions

2. **Check Model Access:**
   - Visit https://replicate.com/cuuupid/idm-vton
   - Make sure you can see the model (it's public)
   - Check if there's a newer version

3. **View Logs:**
   ```bash
   vercel logs mynarrative-ai --prod
   ```

4. **Test with Postman/Insomnia:**
   - URL: `https://mynarrative-ai.vercel.app/api/virtual_try_on`
   - Method: POST
   - Body (JSON):
     ```json
     {
       "mode": "vton",
       "user_image": "data:image/jpeg;base64,...",
       "garment_image": "https://cdn.shopify.com/...",
       "category": "upper_body",
       "description": "black hoodie"
     }
     ```

## Expected Response

**Success:**
```json
{
  "success": true,
  "image": "https://replicate.delivery/pbxt/..."
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Cost Estimates

- **IDM-VTON**: ~$0.02-0.05 per generation (30 steps)
- **FLUX Schnell**: ~$0.003 per generation (4 steps)
- **OOTDiffusion**: ~$0.04-0.06 per generation

## Next Steps

1. Deploy the fix
2. Test on product page
3. If still failing, switch to alternative model
4. Monitor Vercel logs for errors
