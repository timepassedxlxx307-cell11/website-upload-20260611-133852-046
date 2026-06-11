(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var currentIndex = 0;

        function showSlide(index) {
            currentIndex = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((currentIndex + 1) % slides.length);
            }, 5200);
        }
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
        var keywordInput = filterRoot.querySelector("[data-filter-keyword]");
        var typeSelect = filterRoot.querySelector("[data-filter-type]");
        var yearSelect = filterRoot.querySelector("[data-filter-year]");
        var regionSelect = filterRoot.querySelector("[data-filter-region]");
        var categorySelect = filterRoot.querySelector("[data-filter-category]");
        var items = Array.prototype.slice.call(filterRoot.querySelectorAll(".filter-item"));
        var emptyState = filterRoot.querySelector("[data-empty-state]");

        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q") || "";

        if (keywordInput && queryValue) {
            keywordInput.value = queryValue;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function matchesSelect(card, name, value) {
            if (!value) {
                return true;
            }
            return normalize(card.getAttribute("data-" + name)).indexOf(normalize(value)) !== -1;
        }

        function applyFilters() {
            var keyword = normalize(keywordInput ? keywordInput.value : "");
            var typeValue = typeSelect ? typeSelect.value : "";
            var yearValue = yearSelect ? yearSelect.value : "";
            var regionValue = regionSelect ? regionSelect.value : "";
            var categoryValue = categorySelect ? categorySelect.value : "";
            var visibleCount = 0;

            items.forEach(function (card) {
                var title = normalize(card.getAttribute("data-title"));
                var genre = normalize(card.getAttribute("data-genre"));
                var region = normalize(card.getAttribute("data-region"));
                var type = normalize(card.getAttribute("data-type"));
                var cardKeyword = title + " " + genre + " " + region + " " + type;
                var matched = true;

                if (keyword && cardKeyword.indexOf(keyword) === -1) {
                    matched = false;
                }

                matched = matched && matchesSelect(card, "type", typeValue);
                matched = matched && matchesSelect(card, "year", yearValue);
                matched = matched && matchesSelect(card, "region", regionValue);
                matched = matched && matchesSelect(card, "category", categoryValue);

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        [keywordInput, typeSelect, yearSelect, regionSelect, categorySelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilters);
                element.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
})();

function initMoviePlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);

    if (!video || !button || !streamUrl) {
        return;
    }

    var loaded = false;
    var hlsInstance = null;

    function attachStream() {
        if (loaded) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        loaded = true;
    }

    function startVideo() {
        attachStream();
        button.classList.add("is-hidden");
        var playRequest = video.play();

        if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", startVideo);
    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
