(function () {
  var navButton = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (navButton && mobileMenu) {
    navButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', mobileMenu.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-search-form]'), function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  function applyFilters(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-filter-empty]');
    var query = input ? input.value.trim().toLowerCase() : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matches = true;

      if (query && haystack.indexOf(query) === -1) {
        matches = false;
      }
      if (type && cardType !== type) {
        matches = false;
      }
      if (year && cardYear !== year) {
        matches = false;
      }

      card.style.display = matches ? '' : 'none';
      if (matches) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-filter-scope]'), function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (input && query) {
      input.value = query;
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', function () {
          applyFilters(scope);
        });
        control.addEventListener('change', function () {
          applyFilters(scope);
        });
      }
    });

    applyFilters(scope);
  });

  function startVideo(box) {
    var video = box.querySelector('video');
    var status = box.parentElement ? box.parentElement.querySelector('[data-player-status]') : null;
    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    if (!stream) {
      if (status) {
        status.textContent = '播放暂时不可用，请稍后再试。';
      }
      return;
    }

    function playNow() {
      box.classList.add('is-playing');
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (status) {
            status.textContent = '点击视频画面即可继续播放。';
          }
        });
      }
    }

    if (!video.getAttribute('src') && !video.dataset.ready) {
      video.dataset.ready = '1';
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        playNow();
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playNow();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && status) {
            status.textContent = '播放未能加载，请稍后再试。';
          }
        });
      } else {
        video.src = stream;
        playNow();
      }
    } else {
      playNow();
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), function (box) {
    var button = box.querySelector('[data-play-button]');
    var layer = box.querySelector('.play-layer');
    if (button) {
      button.addEventListener('click', function () {
        startVideo(box);
      });
    }
    if (layer) {
      layer.addEventListener('click', function (event) {
        if (event.target !== button) {
          startVideo(box);
        }
      });
    }
    var video = box.querySelector('video');
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo(box);
        }
      });
    }
  });
})();
