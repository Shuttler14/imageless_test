document.addEventListener('DOMContentLoaded', async () => {
    const wishlistContainer = document.querySelector('[data-for="wishlist-container"]');
    const wishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];

    // Function to fetch product data
    const fetchProductData = async (productId) => {
        try {
            const response = await fetch(`/products/${productId}.js`);
            if (!response.ok) throw new Error(`Product ${productId} not found.`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching product data:', error);
            return null;
        }
    };

    // Function to render individual product HTML
    const renderProduct = (product) => {
        const productPrice = (product.price / 100).toFixed(2).replace(/\.00$/, '');
        const compareAtPrice = (product.compare_at_price / 100).toFixed(2).replace(/\.00$/, '');
        const discountPercentage = product.compare_at_price > product.price
            ? (((product.compare_at_price - product.price) / product.compare_at_price) * 100).toFixed(2).replace(/\.00$/, '')
            : '';

        return `
            <a href="${product.url}" class="p-1 md:p-2 border flex flex-col gap-3 md:gap-4">
                <figure class="overflow-hidden relative aspect-square">
                    <button class="absolute w-[40px] h-[40px] bg-white left-2 top-2 text-black flex items-center justify-center text-xl" data-for="product-card-wishlist" data-product-handle="${product.handle}">
                        <i data-for="wishlist-icon" class="flex items-center justify-center bi"></i>
                    </button>
                    <img src="${product.featured_image}" width="500" height="" class="object-cover h-full w-full" alt="${product.title}">
                </figure>
                <div class="normal-font">
                    <p class="text-xs md:text-sm text-[#cdcdcd] uppercase">${product.vendor}</p>
                    <p class="text-lg md:text-xl line-clamp-1">${product.title}</p>

                    <ul class="flex gap-2 items-center">
                        <li class="text-lg">${productPrice}</li>
                        ${discountPercentage ? `
                            <li class="text-[#999999] line-through">${compareAtPrice}</li>
                            <li class="text-[#019973]">${discountPercentage}% off</li>
                        ` : ''}
                    </ul>
                </div>
            </a>
        `;
    };

    // Function to render all wishlist items
    const renderWishlistItems = async (items) => {
        if (items.length === 0) {
            wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        
        for (const productId of items) {
            const product = await fetchProductData(productId);
            if (product) {
                const productHTML = document.createElement('div');
                productHTML.innerHTML = renderProduct(product);
                fragment.appendChild(productHTML);
            }
        }

        wishlistContainer.appendChild(fragment);

        runWishlist();
    };


    // Event delegation for wishlist button clicks (optimized)
    wishlistContainer.addEventListener('click', (e) => {
        const button = e.target.closest('[data-for="product-card-wishlist"]');
        if (button) {
            const productId = button.getAttribute('data-product-id');
            console.log(`Wishlist button clicked for product ${productId}`);
            // Add logic to toggle/remove from wishlist
        }
    });

    // Call function to render wishlist items
    await renderWishlistItems(wishlistItems);
});
