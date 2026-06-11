(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
        nav.addEventListener("click", function (event) {
            if (event.target && event.target.tagName === "A") {
                nav.classList.remove("is-open");
            }
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-filter-input]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var year = panel.querySelector("[data-filter-year]");
        var category = panel.querySelector("[data-filter-category]");
        var status = panel.querySelector("[data-filter-status]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");

        if (input && q) {
            input.value = q;
        }

        function matches(card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));
            var query = input ? normalize(input.value) : "";
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";
            var yearValue = year ? year.value : "";
            var categoryValue = category ? category.value : "";
            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            if (regionValue && card.getAttribute("data-region") !== regionValue) {
                return false;
            }
            if (typeValue && card.getAttribute("data-type") !== typeValue) {
                return false;
            }
            if (yearValue && card.getAttribute("data-year") !== yearValue) {
                return false;
            }
            if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
                return false;
            }
            return true;
        }

        function apply() {
            var shown = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.classList.toggle("is-filter-hidden", !ok);
                if (ok) {
                    shown += 1;
                }
            });
            if (status) {
                status.textContent = "当前显示 " + shown + " 部作品";
            }
        }

        [input, region, type, year, category].forEach(function (node) {
            if (!node) {
                return;
            }
            node.addEventListener(node.tagName === "INPUT" ? "input" : "change", apply);
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var sourceTag = video ? video.querySelector("source") : null;
            var source = sourceTag ? sourceTag.src : "";
            var attached = false;
            var readyToPlay = false;
            var requestedPlay = false;
            if (!video || !source) {
                return;
            }

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("is-hidden");
                        }
                    });
                }
            }

            function attach() {
                if (attached) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    readyToPlay = true;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        readyToPlay = true;
                        if (requestedPlay) {
                            playVideo();
                        }
                    });
                    player.hlsInstance = hls;
                } else {
                    video.src = source;
                    readyToPlay = true;
                }
                attached = true;
            }

            function start() {
                requestedPlay = true;
                attach();
                video.controls = true;
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                if (readyToPlay) {
                    playVideo();
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!attached || video.paused) {
                    start();
                }
            });
            video.addEventListener("ended", function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
