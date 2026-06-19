(function () {
  const menuButton = document.querySelector('.menu-button');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const opened = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    slideIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === slideIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === slideIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  const panels = Array.from(document.querySelectorAll('.filter-panel'));

  panels.forEach(function (panel) {
    const scope = panel.parentElement || document;
    const search = panel.querySelector('.movie-search');
    const cards = Array.from(scope.querySelectorAll('.movie-card, .ranking-row'));
    const empty = scope.querySelector('.empty-state');
    let activeYear = '';
    let activeType = '';

    function applyFilters() {
      const query = search ? search.value.trim().toLowerCase() : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const year = card.getAttribute('data-year') || '';
        const type = card.getAttribute('data-type') || '';
        const matchedQuery = !query || text.indexOf(query) !== -1;
        const matchedYear = !activeYear || year === activeYear;
        const matchedType = !activeType || type === activeType;
        const show = matchedQuery && matchedYear && matchedType;

        card.classList.toggle('is-hidden', !show);

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }

    panel.querySelectorAll('[data-filter-year]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year') || '';
        activeType = '';
        panel.querySelectorAll('.quick-filters button').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        applyFilters();
      });
    });

    panel.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-type') || '';
        activeYear = '';
        panel.querySelectorAll('.quick-filters button').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        applyFilters();
      });
    });

    panel.querySelectorAll('[data-filter-all]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = '';
        activeType = '';
        if (search) {
          search.value = '';
        }
        panel.querySelectorAll('.quick-filters button').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        applyFilters();
      });
    });
  });
})();

function initPlayer(streamUrl) {
  const video = document.getElementById('movieVideo');
  const overlay = document.getElementById('playOverlay');
  const frame = document.querySelector('.player-frame');

  if (!video || !overlay || !frame || !streamUrl) {
    return;
  }

  let hlsInstance = null;
  let ready = false;

  function prepare() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      ready = true;
      return;
    }

    video.src = streamUrl;
    ready = true;
  }

  function playMovie() {
    prepare();
    overlay.classList.add('is-hidden');
    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', playMovie);
  frame.addEventListener('click', function (event) {
    if (event.target === frame) {
      playMovie();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
