(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    var currentSlide = 0;

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

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = parseInt(dot.getAttribute('data-slide-to'), 10) || 0;
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var searchInput = document.getElementById('searchInput');
    var genreFilter = document.getElementById('genreFilter');
    var resetFilters = document.getElementById('resetFilters');
    var cards = selectAll('.movie-card');

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : '');
        var genre = normalize(genreFilter ? genreFilter.value : '');

        cards.forEach(function (card) {
            var source = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year')
            ].join(' '));
            var matchQuery = !query || source.indexOf(query) !== -1;
            var matchGenre = !genre || source.indexOf(genre) !== -1;
            card.classList.toggle('is-card-hidden', !(matchQuery && matchGenre));
        });
    }

    if (searchInput || genreFilter) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }
        applyFilters();
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    if (genreFilter) {
        genreFilter.addEventListener('change', applyFilters);
    }

    if (resetFilters) {
        resetFilters.addEventListener('click', function () {
            if (searchInput) {
                searchInput.value = '';
            }
            if (genreFilter) {
                genreFilter.value = '';
            }
            applyFilters();
        });
    }
}());
