(function () {
  var menuButton = document.querySelector('.js-menu-toggle');
  var mobilePanel = document.querySelector('.js-mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('.js-hero-carousel');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('.js-page-filter');
  var typeSelect = document.querySelector('.js-type-filter');
  var yearSelect = document.querySelector('.js-year-filter');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filterable-grid .movie-card'));

  function applyPageFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var typeValue = typeSelect ? typeSelect.value : '';
    var yearValue = yearSelect ? yearSelect.value : '';

    filterCards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
      var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
      card.classList.toggle('hidden-card', !(matchKeyword && matchType && matchYear));
    });
  }

  if (filterCards.length) {
    if (filterInput) {
      filterInput.addEventListener('input', applyPageFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyPageFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyPageFilter);
    }
  }
})();
