(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        initMenu();
        initHero();
        initPlayers();
        initSearch();
        hideBrokenImages();
    });

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero-slider]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".player-cover");
            if (!video || !cover) {
                return;
            }
            var source = video.getAttribute("data-video") || "";
            var loaded = false;

            function loadVideo() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (source.indexOf(".m3u8") > -1 && window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function playVideo() {
                loadVideo();
                shell.classList.add("is-playing");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            }

            cover.addEventListener("click", playVideo);
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove("is-playing");
                }
            });
        });
    }

    function initSearch() {
        var input = document.querySelector("[data-search-input]");
        var year = document.querySelector("[data-year-filter]");
        var category = document.querySelector("[data-category-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var empty = document.querySelector("[data-no-results]");
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function apply() {
            var q = input.value.trim().toLowerCase();
            var y = year ? year.value : "";
            var c = category ? category.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var cardCategory = card.getAttribute("data-category") || "";
                var matchText = !q || text.indexOf(q) > -1;
                var matchYear = !y || cardYear === y;
                var matchCategory = !c || cardCategory === c;
                var show = matchText && matchYear && matchCategory;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        input.addEventListener("input", apply);
        if (year) {
            year.addEventListener("change", apply);
        }
        if (category) {
            category.addEventListener("change", apply);
        }
        apply();
    }

    function hideBrokenImages() {
        Array.prototype.slice.call(document.images).forEach(function (img) {
            img.addEventListener("error", function () {
                var frame = img.closest(".poster-frame");
                if (frame) {
                    frame.classList.add("image-failed");
                } else {
                    img.style.opacity = "0";
                }
            });
        });
    }
}());
