(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('hidden');
                var open = toggle.querySelector('.menu-open');
                var close = toggle.querySelector('.menu-close');
                if (open && close) {
                    open.classList.toggle('hidden');
                    close.classList.toggle('hidden');
                }
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var current = 0;
            var timer = null;
            var show = function (index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            };
            var start = function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            };
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });
            show(0);
            start();
        }

        var searchParams = new URLSearchParams(window.location.search);
        var initialQuery = searchParams.get('q') || '';
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-filter-input]');
            var year = panel.querySelector('[data-filter-year]');
            var region = panel.querySelector('[data-filter-region]');
            var type = panel.querySelector('[data-filter-type]');
            var category = panel.querySelector('[data-filter-category]');
            var grid = document.querySelector('[data-card-grid]');
            var empty = document.querySelector('[data-empty-state]');
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-card]')) : [];
            if (input && initialQuery) {
                input.value = initialQuery;
            }
            var filter = function () {
                var q = input ? input.value.trim().toLowerCase() : '';
                var y = year ? year.value : '';
                var r = region ? region.value : '';
                var t = type ? type.value : '';
                var c = category ? category.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && card.getAttribute('data-year') !== y) {
                        ok = false;
                    }
                    if (r && card.getAttribute('data-region') !== r) {
                        ok = false;
                    }
                    if (t && card.getAttribute('data-type') !== t) {
                        ok = false;
                    }
                    if (c && text.indexOf(c.toLowerCase()) === -1) {
                        ok = false;
                    }
                    card.classList.toggle('filter-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('hidden', visible !== 0);
                }
            };
            [input, year, region, type, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', filter);
                    control.addEventListener('change', filter);
                }
            });
            filter();
        });
    });
})();
