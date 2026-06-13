window.MN_DTF = window.MN_DTF || {};

(function () {
    const DESIGN_TTL_MS = 2 * 60 * 60 * 1000;

    function readJsonStorage(key) {
        try {
            const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function isFreshDesign(payload) {
        if (!payload) return false;
        const savedAt = Number(payload.saved_at || payload.created_at_ms || payload.ts || 0);
        if (!savedAt) return true;
        return Date.now() - savedAt < DESIGN_TTL_MS;
    }

    function normalizeProductType(value, fallback) {
        const raw = `${value || ''} ${fallback || ''}`.toLowerCase();
        if (raw.includes('hood')) return 'hoodie';
        if (raw.includes('tee') || raw.includes('t-shirt') || raw.includes('tshirt') || raw.includes('shirt')) return 'tee';
        return 'tee';
    }

    function getUrlParam(names) {
        const params = new URLSearchParams(window.location.search);
        for (const name of names) {
            const value = params.get(name);
            if (value) return value;
        }
        return '';
    }

    function getStoredDesign() {
        const candidates = [
            readJsonStorage('mn_pending_design'),
            readJsonStorage('mn_first_design'),
            readJsonStorage('mn_uploaded_design')
        ];
        return candidates.find(isFreshDesign) || null;
    }

    function getDesignContext(root) {
        const stored = getStoredDesign() || {};
        const defaultTypeEl = (root || document).querySelector('[data-mn-default-product-type]');
        const defaultType = defaultTypeEl ? defaultTypeEl.getAttribute('data-mn-default-product-type') : '';
        const designUuid = getUrlParam(['_design_uuid', 'design_uuid', 'design_id', 'uuid']) ||
            stored.design_uuid || stored.uuid || stored.design_id || '';
        const imageUrl = getUrlParam(['_design_file_url', 'design_file_url', 'image_url', 'preview_url']) ||
            stored.design_file_url || stored.image_url || stored.imageUrl || stored.asset_url || '';
        const title = getUrlParam(['_design_title', 'design_title', 'title']) ||
            stored.design_title || stored.title || '';
        const productType = normalizeProductType(
            getUrlParam(['_product_type', 'product_type']) || stored.product_type,
            defaultType
        );

        return {
            designUuid,
            imageUrl,
            title,
            productType
        };
    }

    function setHiddenInput(input, value, shouldDisableWhenBlank) {
        if (!input) return;
        input.value = value || '';
        if (shouldDisableWhenBlank) {
            input.disabled = !value;
        }
    }

    function applyDTFDesignProperties(root) {
        const scope = root || document;
        const ctx = getDesignContext(scope);
        const hasDesign = Boolean(ctx.designUuid);

        scope.querySelectorAll('[data-mn-dtf-prop="design_uuid"]').forEach(input => {
            setHiddenInput(input, ctx.designUuid, true);
        });
        scope.querySelectorAll('[data-mn-dtf-prop="product_type"]').forEach(input => {
            setHiddenInput(input, ctx.productType, false);
            input.disabled = !hasDesign;
        });
        scope.querySelectorAll('[data-mn-dtf-prop="design_file_url"]').forEach(input => {
            setHiddenInput(input, ctx.imageUrl, true);
        });
        scope.querySelectorAll('[data-mn-dtf-prop="design_preview_url"]').forEach(input => {
            setHiddenInput(input, ctx.imageUrl, true);
        });
        scope.querySelectorAll('[data-mn-dtf-prop="design_title"]').forEach(input => {
            setHiddenInput(input, ctx.title, true);
        });
    }

    window.mnGetDTFLineItemProperties = function (root) {
        const ctx = getDesignContext(root || document);
        if (!ctx.designUuid) return {};
        return {
            '_design_uuid': ctx.designUuid,
            '_product_type': ctx.productType,
            '_design_file_url': ctx.imageUrl,
            '_design_preview_url': ctx.imageUrl,
            '_design_title': ctx.title || 'My Design'
        };
    };

    window.mnApplyDTFDesignProperties = applyDTFDesignProperties;

    document.addEventListener('DOMContentLoaded', function () {
        applyDTFDesignProperties(document);
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node && node.nodeType === 1) {
                        applyDTFDesignProperties(node);
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();

const runWishlist = () => {
    const productPageWishlistBtn = document.querySelector(`[data-for="product-wishlist"]`);
    const productCardWishlistBtns = document.querySelectorAll(`[data-for="product-card-wishlist"]`);

    // Initialize wishlist from localStorage or empty array
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // Function to update the wishlist button state
    const updateWishlistState = (productHandle, button) => {
        const buttonType = button.getAttribute("data-for");

        // Update for the product page wishlist button
        if (buttonType === "product-wishlist") {
            if (wishlist.includes(productHandle)) {
                button.textContent = 'Remove from Wishlist';
            } else {
                button.textContent = 'Add to Wishlist';
            }
        }

        // Update for product card wishlist buttons
        else if (buttonType === "product-card-wishlist") {
            const icon = button.querySelector(`[data-for="wishlist-icon"]`);
            if (wishlist.includes(productHandle)) {
                icon.classList.add("bi-suit-heart-fill");
                icon.classList.remove("bi-suit-heart");
            } else {
                icon.classList.remove("bi-suit-heart-fill");
                icon.classList.add("bi-suit-heart");
            }
        }
    }

    // Function to add or remove product from wishlist
    const toggleWishlistItem = (button) => {
        const productHandle = button.getAttribute('data-product-handle');

        // Add or remove product ID from the wishlist
        const productIndex = wishlist.indexOf(productHandle);
        if (productIndex === -1) {
            wishlist.push(productHandle);
        } else {
            wishlist.splice(productIndex, 1);
        }

        // Update localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        // Update button state
        updateWishlistState(productHandle, button);
    }

    // Event listener for product page wishlist button
    if (productPageWishlistBtn) {
        const productHandle = productPageWishlistBtn.getAttribute('data-product-handle');
        updateWishlistState(productHandle, productPageWishlistBtn); // Set initial state on page load

        productPageWishlistBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleWishlistItem(productPageWishlistBtn);
        });
    }

    // Event listeners for product card wishlist buttons
    productCardWishlistBtns.forEach((button) => {
        const productHandle = button.getAttribute('data-product-handle');
        updateWishlistState(productHandle, button); // Set initial state on page load

        button.addEventListener("click", (e) => {
            e.stopPropagation()
            e.preventDefault();
            toggleWishlistItem(button);
        });
    });
}

// Async function to add a product to the cart
async function addToCart(variantId, quantity = 1, button) {
    const formData = {
        items: [{
            id: variantId,
            quantity: quantity
        }]
    };

    try {
        button.textContent = 'Adding to cart...';
        button.disabled = true; // Optionally disable the button
        const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response data:', errorData); // Log detailed error information
            throw new Error(`Failed to add item to cart. Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
        }

        button.textContent = 'Added to cart';
        setTimeout(() => {
            button.textContent = 'Add to Bag'; // Restore original text after 2 seconds
            button.disabled = false; // Re-enable the button
        }, 2000); // Change the time as needed

        const data = await response.json();
        // Optionally update the cart UI here
    } catch (error) {
        console.error('Error adding item to cart:', error);
        // Display a user-friendly error message if needed
    }
}


// Function to update the cart on Shopify
async function updateCart(key, qty) {
    let updates = {};
    updates[key] = qty; // Set the quantity for the specific item key

    try {
        const response = await fetch(window.Shopify.routes.root + 'cart/update.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ updates })
        });

        const data = await response.json();
        console.log("update :", data);

        // Re-render the cart section after updating the cart
        reRenderCartSection();
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}



// Async function to remove a cart item
async function removeFromCart(lineItemId) {
    try {
        const response = await fetch('/cart/change.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                id: lineItemId,
                quantity: 0
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to remove item from cart.');
        }

        const data = await response.json();
        console.log("remove :", data);
        reRenderCartSection();

    } catch (error) {
        console.error('Error removing item from cart:', error);
    }
}

// Async function to retrieve cart data
async function getCartData() {
    try {
        const response = await fetch('/cart.js', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to retrieve cart data.');
        }

        const data = await response.json();
        // Process and update the cart UI if needed
    } catch (error) {
        console.error('Error retrieving cart data:', error);
    }
}

// Function to add event listeners to cart quantity buttons
function addCartEvents() {
    fetchRecommendations();
    const qtySelectors = document.querySelectorAll(".cart-quantity-selector button");
    const cartItemRemoveBtns = document.querySelectorAll(`[data-for="remove-cart-item"]`);
    cartItemRemoveBtns.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            let itemId = button.getAttribute(`data-cart-item-id`);
            removeFromCart(itemId);
        })
    })
    qtySelectors.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            let quantityValue = btn.parentElement.querySelector("input");
            let itemKey = quantityValue.getAttribute("data-key");
            let quantity = parseInt(quantityValue.value);

            if (btn.classList.contains("qty-add")) {
                quantity += 1;
            } else if (btn.classList.contains("qty-remove") && quantity > 1) {
                quantity -= 1;
            }
            quantityValue.value = quantity;
            updateCart(itemKey, quantity);

        });
    });
}

// Function to re-render the cart section
async function reRenderCartSection() {
    const cartContainer = document.querySelector(`[data-for="cart-container"]`);
    const cartSectionID = cartContainer?.getAttribute('data-section-id');

    if (!cartSectionID) {
        console.error("Cart section ID not found");
        return;
    }

    try {
        const response = await fetch(`/?section_id=${cartSectionID}`);
        const html = await response.text();

        if (cartContainer) {
            // Create a new DOM parser
            const parser = new DOMParser();
            // Parse the HTML string into a document
            const doc = parser.parseFromString(html, 'text/html');
            // Extract the new cart details section from the parsed document
            const newCartDetails = doc.querySelector(`[data-for="cart-container"]`);

            if (newCartDetails) {
                // Replace the existing cart section with the updated HTML
                cartContainer.innerHTML = newCartDetails.innerHTML;

                // Re-attach events after re-rendering
                addCartEvents();

            } else {
                console.error('New cart details not found in the response.');
            }
        }
    } catch (error) {
        console.error('Error re-rendering cart section:', error);
    }
}


//  code for recommendations 
const fetchRecommendations = async () => {
    const recommendationsContainer = document.querySelector(`[data-for="recommendation-container"]`);
    const recommendationSectionId = recommendationsContainer?.getAttribute("data-section-id");
    const lastCartItemId = document.querySelector(`[data-cart-product-id]`)?.getAttribute("data-cart-product-id");
    const defaultProductId = document.querySelector('[data-default-product]')?.getAttribute("data-default-product");
    // Determine which product reference to use

    const recommendedProductReference = lastCartItemId || defaultProductId;
    if (!recommendedProductReference || !recommendationSectionId) {
        console.warn('No product reference or recommendation section ID found.');
        return;
    }

    try {
        // Corrected the URL by adding section_id key before recommendationSectionId
        const response = await fetch(`${window.Shopify.routes.root}recommendations/products?product_id=${recommendedProductReference}&section_id=${recommendationSectionId}&intent=related`);
        const html = await response.text();
        // Create a new DOM parser
        const parser = new DOMParser();
        // Parse the HTML string into a document
        const doc = parser.parseFromString(html, 'text/html');
        console.log("res", doc);
        // Extract the new cart details section from the parsed document
        const recommendations = doc.querySelector(`[data-for="recommendation-container"]`);

        // Populate recommendations if available
        if (recommendations && recommendations.innerHTML.trim().length) {
            recommendationsContainer.innerHTML = recommendations.innerHTML;
            runWishlist();
        }
    } catch (error) {
        console.warn('Error fetching product recommendations:', error);
    }
};















document.addEventListener("DOMContentLoaded", function () {
    // code for navbar 
    const menuSlide = document.querySelector(`[data-for="menu-slide"]`);
    const navOverlay = document.querySelector(`[data-for="nav-overlay"]`);
    const navOpenBtn = document.querySelector(`[data-for="nav-open-btn"]`);
    const navCloseBtn = document.querySelector(`[data-for="nav-close-btn"]`);
    const searchSlide = document.querySelector(`[data-for="search-slide"]`);
    const searchOpenBtn = document.querySelector(`[data-for="search-open-btn"]`);
    const searchCloseBtn = document.querySelector(`[data-for="search-close-btn"]`);

    const openSlide = (slide) => {
        document.body.classList.add("overflow-hidden");
        slide.classList.add('active');
        navOverlay.classList.add('active');
    }
    const closeSlide = (slide) => {
        document.body.classList.remove("overflow-hidden");
        slide.classList.remove('active');
        navOverlay.classList.remove('active');
    }
    navOpenBtn.addEventListener('click', () => openSlide(menuSlide));
    navCloseBtn.addEventListener('click', () => closeSlide(menuSlide));
    searchOpenBtn.addEventListener('click', () => {
        openSlide(searchSlide);
        document.querySelector(`[name="q"]`).focus();
    });
    searchCloseBtn.addEventListener('click', () => closeSlide(searchSlide));
    navOverlay.addEventListener('click', () => {
        closeSlide(menuSlide);
        closeSlide(searchSlide);
    });


    try {
        runWishlist();
        const addToCartBtns = document.querySelectorAll('button[data-button-type="add-to-cart"]');
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const variantId = btn.getAttribute('data-id');
                if (variantId) {
                    addToCart(variantId, 1, btn);
                }
            });
        });

    } catch (error) {
        console.log("Error in cart.js", error);
    }

    // Initialize the events on page load
    addCartEvents();
    const searchForm = document.querySelector(`[data-for="search-form"]`);
    const sectionId = searchForm.getAttribute("data-section-id");
    const predictiveSearchContainer = document.querySelector(`[data-for="predictive-search-container"]`);
    const predictiveSearchInput = searchForm.querySelector('[name="q"]');
    let timeoutId; // for debouncing
    searchForm.addEventListener("input", async (e) => {
        const searchValue = predictiveSearchInput.value.trim(); // Trim to remove extra spaces
        // Prevent unnecessary requests for empty input
        if (searchValue.length === 0) {
            predictiveSearchContainer.innerHTML = ''; // Clear results
            return;
        }

        // Debounce the input to avoid sending requests too quickly
        clearTimeout(timeoutId); // Clear previous timeout
        timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(`/search/suggest?q=${searchValue}&section_id=${sectionId}`);
                if (!response.ok) {
                    console.error("Error fetching search results:", response.status);
                    throw new Error(response.status);
                }
                const text = await response.text();
                const parsedHTML = new DOMParser().parseFromString(text, 'text/html');
                const resultsMarkup = parsedHTML.querySelector(`[data-for="predictive-search-container"]`);

                if (resultsMarkup) {
                    predictiveSearchContainer.innerHTML = resultsMarkup.innerHTML;
                }
            } catch (error) {
                console.error('Error fetching predictive search results:', error);
            }
        }, 300);
    });


    // end 
});

