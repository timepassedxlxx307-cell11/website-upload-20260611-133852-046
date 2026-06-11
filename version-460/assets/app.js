(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startHeroTimer() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5800);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = Number(dot.getAttribute('data-hero-dot') || 0);
            showSlide(index);
            if (heroTimer) {
                window.clearInterval(heroTimer);
                startHeroTimer();
            }
        });
    });

    showSlide(0);
    startHeroTimer();

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function setupFilters() {
        var input = document.querySelector('.page-filter');
        var yearFilter = document.querySelector('.year-filter');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
        var empty = document.querySelector('.empty-state');

        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (input && query) {
            input.value = query;
        }

        function matchesYear(card, selectedYear) {
            if (!selectedYear) {
                return true;
            }
            var year = Number(card.getAttribute('data-year') || 0);
            if (selectedYear === 'older') {
                return year > 0 && year < 2020;
            }
            return String(year) === selectedYear;
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var selectedYear = yearFilter ? yearFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var matched = (!keyword || haystack.indexOf(keyword) !== -1) && matchesYear(card, selectedYear);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }
        applyFilter();
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (window.__hlsLibraryLoading) {
            return window.__hlsLibraryLoading;
        }
        window.__hlsLibraryLoading = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return window.__hlsLibraryLoading;
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

        shells.forEach(function (shell) {
            var video = shell.querySelector('video[data-hls]');
            var button = shell.querySelector('.play-overlay');
            if (!video) {
                return;
            }

            var source = video.getAttribute('data-hls');
            var started = false;
            var hlsInstance = null;

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            function start() {
                if (started) {
                    playVideo();
                    return;
                }
                started = true;
                if (button) {
                    button.classList.add('is-hidden');
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', playVideo, { once: true });
                    video.load();
                    return;
                }

                loadHlsLibrary().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(Hls.Events.MANIFEST_PARSED, playVideo);
                        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal && hlsInstance) {
                                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                                    hlsInstance.recoverMediaError();
                                } else {
                                    hlsInstance.destroy();
                                    video.src = source;
                                    playVideo();
                                }
                            }
                        });
                    } else {
                        video.src = source;
                        playVideo();
                    }
                }).catch(function () {
                    video.src = source;
                    playVideo();
                });
            }

            if (button) {
                button.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (!started) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (!started) {
                    video.pause();
                    start();
                }
            });
        });
    }

    setupFilters();
    setupPlayers();
})();
