(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
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
      }, 5000);
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

  function initHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var movies = window.SITE_MOVIES || [];
    forms.forEach(function (form) {
      var input = form.querySelector("[data-site-search]");
      var suggest = form.querySelector("[data-search-suggest]");
      if (!input || !suggest) {
        return;
      }

      function closeSuggest() {
        suggest.classList.remove("is-open");
        suggest.innerHTML = "";
      }

      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          closeSuggest();
          return;
        }
        var result = movies
          .filter(function (movie) {
            return String(movie.search || "").toLowerCase().indexOf(query) !== -1;
          })
          .slice(0, 8);
        if (!result.length) {
          suggest.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
          suggest.classList.add("is-open");
          return;
        }
        suggest.innerHTML = result
          .map(function (movie) {
            return '<a href="' + escapeHtml(movie.url) + '"><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.year + " · " + movie.type + " · " + movie.region) + '</span></a>';
          })
          .join("");
        suggest.classList.add("is-open");
      });

      form.addEventListener("submit", function (event) {
        var query = input.value.trim();
        if (query) {
          event.preventDefault();
          window.location.href = "search.html?q=" + encodeURIComponent(query);
        }
      });

      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          closeSuggest();
        }
      });
    });
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var section = scope.parentElement;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
      var input = scope.querySelector("[data-local-search]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
      var empty = scope.querySelector("[data-empty-state]");
      var active = "all";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var search = String(card.getAttribute("data-search") || "").toLowerCase();
          var type = String(card.getAttribute("data-type") || "");
          var year = String(card.getAttribute("data-year") || "");
          var region = String(card.getAttribute("data-region") || "");
          var chipMatch = active === "all" || type.indexOf(active) !== -1 || year.indexOf(active) !== -1 || region.indexOf(active) !== -1 || search.indexOf(active.toLowerCase()) !== -1;
          var queryMatch = !query || search.indexOf(query) !== -1;
          var matched = chipMatch && queryMatch;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          active = chip.getAttribute("data-filter") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });

      if (input) {
        input.addEventListener("input", apply);
        if (document.querySelector("[data-search-page]")) {
          var params = new URLSearchParams(window.location.search);
          var query = params.get("q") || "";
          if (query) {
            input.value = query;
          }
        }
      }

      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var stream = player.getAttribute("data-stream");
      var started = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function bindStream() {
        if (video.src) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }
        video.src = stream;
      }

      function start() {
        bindStream();
        started = true;
        video.controls = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initHeaderSearch();
    initFilters();
    initPlayers();
  });
})();
