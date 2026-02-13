document.addEventListener("DOMContentLoaded", function () {


    try {

        // Collection page rendering
        const collectionContainer = document.querySelector(`[data-for="collection-container"]`);
        const collectionLoadMoreBtnContainer = document.querySelector(`[data-for="load-more-btn-container"]`);
        const collectionLoadMoreBtn = collectionLoadMoreBtnContainer?.querySelector(`[data-for="load-more-btn"]`);
        const sortSlide = document.querySelector(`[data-for="sort-slide"]`);
        const filterSlide = document.querySelector(`[data-for="filter-slide"]`);
        const sortBtn = document.querySelector(`[data-for="sort-slide-btn"]`);
        const filterBtn = document.querySelector(`[data-for="filter-slide-btn"]`);
        const collectionOverlay = document.querySelector(`[data-for="collection-overlay"]`);
        let nextUrl = collectionContainer?.getAttribute("data-next-url");
        const sortOptions = document.querySelectorAll('[data-for="sort-options"]');
        const filterForm = document.querySelector(`[data-for="filter-form"]`);
        const miniFilterForm = document.querySelector(`[data-for="mini-filter-form"]`);
        const filterFormInputs = filterForm?.querySelectorAll('input');
        const miniFilterFormInputs = miniFilterForm?.querySelectorAll('input');

        const openSlide = (slide) => {
            document.body.classList.add("overflow-hidden");
            slide?.classList.add('active');
            collectionOverlay?.classList.remove("hidden");
        }

        const closeSlide = (slide) => {
            document.body.classList.remove("overflow-hidden");
            slide?.classList.remove('active');
            collectionOverlay?.classList.add("hidden");
        }

        sortBtn?.addEventListener("click", () => openSlide(sortSlide));
        filterBtn?.addEventListener("click", () => openSlide(filterSlide));
        collectionOverlay?.addEventListener("click", () => {
            closeSlide(sortSlide);
            closeSlide(filterSlide);
        });

        // Function to get the currently selected sort option
        const getSelectedSortOption = () => {
            const selectedSort = document.querySelector('[data-for="sort-options"]:checked');
            return selectedSort ? selectedSort.value : null;
        }

        // Function to append the sort_by parameter to the nextUrl
        const appendSortToUrl = (url) => {
            const selectedSort = getSelectedSortOption(); // Get the current sort option
            const urlObj = new URL(url, window.location.origin); // Parse the nextUrl
            if (selectedSort) {
                urlObj.searchParams.set('sort_by', selectedSort); // Append the sort_by param
            }
            return urlObj.toString(); // Return the updated URL
        }

        // Load more button functionality with sort query
        collectionLoadMoreBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            collectionLoadMoreBtnContainer.setAttribute("data-btn-loading", "true");

            // Append the sort parameter to nextUrl
            const updatedNextUrl = appendSortToUrl(nextUrl);

            fetch(updatedNextUrl)
                .then(response => response.text())
                .then(nextPage => {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(nextPage, 'text/html');
                    let newCollectionContainer = doc.querySelector('[data-for="collection-container"]');

                    // Append new products to the existing ones
                    collectionContainer.innerHTML += newCollectionContainer.innerHTML;
                    runWishlist(); // Re-run wishlist functionality

                    collectionLoadMoreBtnContainer.setAttribute("data-btn-loading", "false");

                    // Update the next URL if available
                    let newUrl = newCollectionContainer.getAttribute('data-next-url');
                    nextUrl = newUrl;

                    if (!newUrl) {
                        collectionLoadMoreBtnContainer.classList.add("hidden");
                    }
                })
                .catch(error => {
                    console.error('Error fetching the next page:', error);
                });
        });

        // Event listener for sorting option change
        sortOptions.forEach((option) => {
            option.addEventListener('change', () => {
                const selectedSort = option.value;
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('sort_by', selectedSort); // Update URL with the selected sort option
                window.history.replaceState(null, '', currentUrl); // Update the browser's URL without reloading the page

                fetch(currentUrl.toString())
                    .then(response => response.text())
                    .then(sortedPageHTML => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(sortedPageHTML, 'text/html');
                        const newCollectionContainer = doc.querySelector('[data-for="collection-container"]');
                        collectionContainer.innerHTML = newCollectionContainer.innerHTML; // Replace the collection content
                        runWishlist(); // Re-run wishlist updates
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth' // Optional: adds smooth scrolling effect
                        });
                        closeSlide(sortSlide);
                        // Make sure the "Load More" button is visible and the nextUrl is updated
                        collectionLoadMoreBtnContainer.classList.remove("hidden");
                        nextUrl = newCollectionContainer.getAttribute("data-next-url");
                    })
                    .catch(error => {
                        console.error('Error fetching sorted products:', error);
                    });
            });
        });


        //  code for filter
        filterFormInputs?.forEach((input) => {

            input.addEventListener("change", () => {
                filterForm.submit();
                // const currentUrl = new URL(window.location.href);
                // const formData = new FormData(filterForm);

                // // Add filter parameters to the URL
                // formData.forEach((value, key) => {
                //     currentUrl.searchParams.set(key, value);
                // });
                // console.log(formData.toString());
                // // Update the browser URL without reloading the page
                // window.history.replaceState(null, '', currentUrl);
                // return currentUrl.toString(); // Return the updated URL
            })
        })
        miniFilterFormInputs?.forEach((input) => {
            input.addEventListener("change", () => {
                miniFilterForm.submit();
            })
        })





        // collections/all?filter.v.price.gte=&filter.v.price.lte=890000&filter.p.t.category=aa-1-4&filter.p.t.category=aa-1-13-8
        // /collections/all?filter.v.price.gte=&filter.v.price.lte=890000&filter.p.t.category=aa-1-13-8



    } catch (error) {
        console.log("Error in collection loading or in run wishlist ", error);
    }


    // end 
});