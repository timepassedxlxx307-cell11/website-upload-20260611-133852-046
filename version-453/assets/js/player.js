(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var url = video ? video.getAttribute('data-play') : '';
    var hlsInstance = null;

    var prepare = function () {
      if (!video || !url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = url;
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        }
      } else if (!video.src) {
        video.src = url;
      }
    };

    var start = function () {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }
  });
})();
