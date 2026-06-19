(function() {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function() {
      siteNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var dotIndex = parseInt(dot.getAttribute('data-hero-dot'), 10);
        showSlide(dotIndex);
      });
    });

    window.setInterval(function() {
      showSlide(index + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var categoryFilters = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var keyword = normalize(searchInputs.map(function(input) {
      return input.value;
    }).join(' '));
    var category = normalize(categoryFilters.map(function(select) {
      return select.value;
    }).join(' '));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));

    cards.forEach(function(card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      var categoryMatch = !category || cardCategory === category;
      card.classList.toggle('is-filtered-out', !(keywordMatch && categoryMatch));
    });
  }

  searchInputs.forEach(function(input) {
    input.addEventListener('input', applyFilters);
  });

  categoryFilters.forEach(function(select) {
    select.addEventListener('change', applyFilters);
  });
}());
