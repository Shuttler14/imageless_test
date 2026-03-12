class AnnouncementSlider {
    constructor(sliderElement) {
        this.slider = sliderElement;
        this.wrapper = this.slider.closest(".announcement-slider-wrapper");

        if (!this.wrapper) return;
        
        // Get settings from dataset and ensure correct data types
        this.autoplay = this.wrapper.dataset.autoplay === "true";
        this.autoplayDuration = Number(this.wrapper.dataset.autoplayDuration) || 3000;
        this.enableNavigation = this.wrapper.dataset.navigation === "true";
        this.enablePagination = this.wrapper.dataset.pagination === "true";
        this.enableLoop = this.wrapper.dataset.loop === "true";
        
        // Select elements only if they exist
        this.prevButton = this.wrapper.querySelector(".announcement-slider-prev") || null;
        this.nextButton = this.wrapper.querySelector(".announcement-slider-next") || null;
        this.pagination = this.wrapper.querySelector(".announcement-slider-pagination") || null;        
        this.initSwiper();
    }

    initSwiper() {
        if (!this.slider) return;

        this.swiper = new Swiper(this.slider, {
            loop: this.enableLoop,
            slidesPerView: 1,
            spaceBetween: 10,
            speed: 1000, // Faster transition speed
            autoplay: this.autoplay ? { delay: this.autoplayDuration, disableOnInteraction: false } : false,
            // breakpoints: {
            //     360: { slidesPerView: 1.4, spaceBetween: 16 },
            //     640: { slidesPerView: 2.4, spaceBetween: 18 },
            //     768: { slidesPerView: 3.4, spaceBetween: 20 },
            //     1024: { slidesPerView: 4, spaceBetween: 22 }
            // },
            mousewheel: {
                invert: false,
                forceToAxis: true,
              },
              keyboard: {
                enabled: true,
                onlyInViewport: true,
              },
            pagination: this.enablePagination && this.pagination ? {
                el: this.pagination,
                clickable: true,
            } : false,
            navigation: this.enableNavigation && this.prevButton && this.nextButton ? {
                nextEl: this.nextButton,
                prevEl: this.prevButton,
            } : false,
        });
    }
}

// Function to initialize all sliders dynamically
function initAllSliders() {
    document.querySelectorAll(".js-announcement-slider").forEach((slider) => {
        if (!slider.dataset.initialized) {
            new AnnouncementSlider(slider);
            slider.dataset.initialized = "true"; // Prevents duplicate initialization
        }
    });
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initAllSliders);

// Reinitialize when Shopify dynamically loads sections
document.addEventListener("shopify:section:load", initAllSliders);
