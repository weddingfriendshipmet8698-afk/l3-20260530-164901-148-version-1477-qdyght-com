(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle("is-active", itemIndex === activeIndex);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle("is-active", itemIndex === activeIndex);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    });
  });

  startHero();

  var filterInput = document.querySelector(".filter-input");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card, .searchable-grid .ranking-item"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
  var chipValue = "";

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var query = normalize(filterInput ? filterInput.value : "");
    var tag = normalize(chipValue);
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-text") + " " + card.getAttribute("data-title"));
      var matchedQuery = !query || text.indexOf(query) !== -1;
      var matchedTag = !tag || text.indexOf(tag) !== -1;
      card.classList.toggle("search-hidden", !(matchedQuery && matchedTag));
    });
  }

  if (filterInput) {
    if (filterInput.classList.contains("auto-query")) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery) {
        filterInput.value = initialQuery;
      }
    }
    filterInput.addEventListener("input", applyFilter);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (item) {
        item.classList.remove("is-active");
      });
      chip.classList.add("is-active");
      chipValue = chip.getAttribute("data-filter") || "";
      applyFilter();
    });
  });

  applyFilter();
}());
