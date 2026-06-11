(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-search-area]').forEach(function (area) {
    var input = area.querySelector('[data-search-input]');
    var empty = area.querySelector('[data-search-empty]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var filter = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function matchCard(card, keyword) {
      var type = card.getAttribute('data-type') || '';
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        type
      ].join(' ');
      var byKeyword = !keyword || normalize(haystack).indexOf(keyword) !== -1;
      var byType = filter === 'all' || type === filter || normalize(haystack).indexOf(normalize(filter)) !== -1;
      return byKeyword && byType;
    }

    function apply() {
      var keyword = input ? normalize(input.value.trim()) : '';
      var visible = 0;
      cards.forEach(function (card) {
        var matched = matchCard(card, keyword);
        card.classList.toggle('hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    area.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        area.querySelectorAll('[data-filter-type]').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        filter = button.getAttribute('data-filter-type') || 'all';
        apply();
      });
    });
  });

  document.querySelectorAll('.player').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;

    function prepare() {
      if (!video || !stream || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    }

    function play() {
      prepare();
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button && video && stream) {
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
