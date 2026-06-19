document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initHeroSlider();
  initMovieFilters();
  initPlayer();
});

function initMobileMenu() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function initHeroSlider() {
  var slider = document.querySelector("[data-hero-slider]");

  if (!slider) {
    return;
  }

  var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
  var prev = slider.querySelector("[data-hero-prev]");
  var next = slider.querySelector("[data-hero-next]");
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      start();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  show(0);
  start();
}

function initMovieFilters() {
  var searchInput = document.querySelector("[data-movie-search]");
  var filterGroup = document.querySelector("[data-filter-group]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var countNode = document.querySelector("[data-result-count]");

  if (!cards.length) {
    return;
  }

  var currentFilter = "all";

  function cardText(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.getAttribute("data-type"),
      card.getAttribute("data-tags")
    ].join(" ").toLowerCase();
  }

  function applyFilters() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var visible = 0;

    cards.forEach(function (card) {
      var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
      var matchesFilter = currentFilter === "all" || card.getAttribute("data-category") === currentFilter;
      var shouldShow = matchesKeyword && matchesFilter;

      card.classList.toggle("is-hidden", !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (countNode) {
      countNode.textContent = "当前显示 " + visible + " 部影片";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (filterGroup) {
    filterGroup.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");

      if (!button) {
        return;
      }

      currentFilter = button.getAttribute("data-filter") || "all";
      Array.prototype.slice.call(filterGroup.querySelectorAll("[data-filter]")).forEach(function (chip) {
        chip.classList.toggle("is-active", chip === button);
      });
      applyFilters();
    });
  }

  applyFilters();
}

function initPlayer() {
  var video = document.querySelector("[data-player]");
  var trigger = document.querySelector("[data-player-trigger]");
  var status = document.querySelector("[data-player-status]");

  if (!video || !trigger) {
    return;
  }

  var hlsInstance = null;
  var loaded = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function playVideo() {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        setStatus("浏览器阻止了自动播放，请再次点击播放器控制按钮。");
      });
    }
  }

  function loadSource() {
    var source = video.getAttribute("data-src");

    if (!source) {
      setStatus("当前影片没有可用播放源。");
      return;
    }

    trigger.classList.add("is-hidden");

    if (loaded) {
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        loaded = true;
        setStatus("播放源加载完成，正在播放。");
        playVideo();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus("播放源加载遇到问题，请刷新页面后重试。");
        }
      });
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", function () {
        loaded = true;
        setStatus("播放源加载完成，正在播放。");
        playVideo();
      }, { once: true });
      return;
    }

    setStatus("当前浏览器不支持 HLS 播放，请使用 Chrome、Safari、Edge 或 Firefox 的新版浏览器。故障时可刷新页面重试。");
  }

  trigger.addEventListener("click", loadSource);
  video.addEventListener("play", function () {
    trigger.classList.add("is-hidden");
  });
}
