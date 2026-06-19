import { H as Hls } from './hls-dru42stk.js';

function attachPlayer(shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('.play-button');
  var overlay = shell.querySelector('.player-overlay');
  var source = video ? video.getAttribute('data-src') : '';
  var hlsInstance = null;

  if (!video || !button || !source) {
    return;
  }

  function prepare() {
    if (video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    video.dataset.ready = 'true';
  }

  function playVideo() {
    prepare();
    overlay.classList.add('is-hidden');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', playVideo);
  overlay.addEventListener('click', playVideo);

  video.addEventListener('pause', function () {
    if (!video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll('.player-shell').forEach(attachPlayer);
