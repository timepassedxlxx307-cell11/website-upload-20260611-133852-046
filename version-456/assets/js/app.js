(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");

        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });

                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }

                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot") || 0));
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            restart();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-card-search]")).forEach(function (input) {
            input.addEventListener("input", function () {
                var value = input.value.trim().toLowerCase();
                var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));

                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    card.classList.toggle("is-hidden", value && text.indexOf(value) === -1);
                });
            });
        });

        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".play-toggle");
            var streamUrl = player.getAttribute("data-stream");
            var started = false;
            var hlsInstance = null;

            function start() {
                if (!video || !streamUrl) {
                    return;
                }

                if (!started) {
                    started = true;

                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = streamUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: false
                        });
                        hlsInstance.loadSource(streamUrl);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = streamUrl;
                    }
                }

                player.classList.add("is-playing");
                var playResult = video.play();

                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    start();
                });
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (!started) {
                        start();
                    }
                });

                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
