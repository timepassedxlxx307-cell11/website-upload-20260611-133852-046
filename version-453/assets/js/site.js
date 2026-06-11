(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var opened = mobileMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  document.addEventListener('error', function (event) {
    var target = event.target;
    if (target && target.tagName === 'IMG') {
      target.classList.add('is-missing');
    }
  }, true);

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var heroSearch = document.querySelector('[data-hero-search]');
  if (heroSearch) {
    heroSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = heroSearch.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      window.location.href = './library.html' + (query ? '?q=' + encodeURIComponent(query) : '');
    });
  }

  var normalize = function (value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  };

  var applyFilters = function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var yearFilter = scope.querySelector('[data-year-filter]');
    var typeFilter = scope.querySelector('[data-type-filter]');
    var regionFilter = scope.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var emptyState = scope.parentElement ? scope.parentElement.querySelector('[data-empty-state]') : null;
    var query = normalize(input ? input.value : '');
    var year = yearFilter ? yearFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var region = regionFilter ? regionFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var keywords = normalize(card.getAttribute('data-keywords') + ' ' + card.getAttribute('data-title'));
      var cardYear = card.getAttribute('data-year') || '';
      var cardType = card.getAttribute('data-type') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var yearMatch = !year || (year === '2000以前' ? Number(cardYear) < 2000 : cardYear === year);
      var typeMatch = !type || cardType === type;
      var regionMatch = !region || cardRegion.indexOf(region) !== -1;
      var queryMatch = !query || keywords.indexOf(query) !== -1;
      var show = yearMatch && typeMatch && regionMatch && queryMatch;

      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };

  document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var controls = Array.prototype.slice.call(scope.querySelectorAll('select'));
    var reset = scope.querySelector('[data-reset-filter]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (input && query) {
      input.value = query;
    }

    if (input) {
      input.addEventListener('input', function () {
        applyFilters(scope);
      });
    }

    controls.forEach(function (control) {
      control.addEventListener('change', function () {
        applyFilters(scope);
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        controls.forEach(function (control) {
          control.value = '';
        });
        applyFilters(scope);
      });
    }

    applyFilters(scope);
  });
})();
