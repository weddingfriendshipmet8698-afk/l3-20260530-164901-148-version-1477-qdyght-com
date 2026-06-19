(function() {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupMenu() {
        var button = qs("[data-menu-toggle]");
        var nav = qs("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function() {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = qs("[data-hero]");
        if (!root) {
            return;
        }
        var slides = qsa(".hero-slide", root);
        var dots = qsa(".hero-dot", root);
        if (!slides.length) {
            return;
        }
        var active = 0;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("active", i === active);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("active", i === active);
            });
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
            });
        });

        show(0);

        if (slides.length > 1) {
            window.setInterval(function() {
                show(active + 1);
            }, 5200);
        }
    }

    function setupIndexSearch() {
        qsa("[data-search-form]").forEach(function(form) {
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                var input = qs("input", form);
                var query = input ? input.value.trim() : "";
                var url = "search.html";
                if (query) {
                    url += "?q=" + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function setupFilters() {
        qsa("[data-filter-input]").forEach(function(input) {
            var scopeSelector = input.getAttribute("data-filter-scope");
            var scope = scopeSelector ? qs(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var cards = qsa(".movie-card", scope);

            function applyFilter(value) {
                var query = String(value || "").trim().toLowerCase();
                cards.forEach(function(card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    card.classList.toggle("hidden", query && text.indexOf(query) === -1);
                });
            }

            input.addEventListener("input", function() {
                applyFilter(input.value);
            });

            qsa("[data-chip]").forEach(function(chip) {
                chip.addEventListener("click", function() {
                    input.value = chip.getAttribute("data-chip") || "";
                    applyFilter(input.value);
                    input.focus();
                });
            });
        });
    }

    function setupPlayers() {
        qsa(".video-shell").forEach(function(shell) {
            var video = qs("video", shell);
            var button = qs("[data-play]", shell);
            if (!video) {
                return;
            }
            var source = video.getAttribute("data-src");

            function loadVideo() {
                if (!source || video.getAttribute("data-loaded") === "true") {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                video.setAttribute("data-loaded", "true");
            }

            function playVideo() {
                loadVideo();
                shell.classList.add("playing");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function() {
                        shell.classList.remove("playing");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    playVideo();
                });
            }

            shell.addEventListener("click", function(event) {
                if (event.target === video) {
                    return;
                }
                playVideo();
            });

            video.addEventListener("play", function() {
                shell.classList.add("playing");
            });

            video.addEventListener("pause", function() {
                if (!video.currentTime) {
                    shell.classList.remove("playing");
                }
            });
        });
    }

    function setupSearchPage() {
        var input = qs("[data-search-page]");
        var results = qs("[data-search-results]");
        if (!input || !results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        function card(movie) {
            return [
                '<article class="movie-card">',
                '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
                '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '">',
                '<span class="poster-badge">' + escapeHtml(movie.year || "高清") + '</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
                '</div>',
                '</article>'
            ].join("");
        }

        function render() {
            var query = input.value.trim().toLowerCase();
            var data = window.MOVIE_SEARCH_INDEX;
            var matched = data.filter(function(movie) {
                if (!query) {
                    return movie.hot;
                }
                var text = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(" ").toLowerCase();
                return text.indexOf(query) !== -1;
            }).slice(0, 80);

            if (!matched.length) {
                results.innerHTML = '<div class="empty-state">暂无匹配影片</div>';
                return;
            }

            results.innerHTML = '<div class="movie-grid">' + matched.map(card).join("") + '</div>';
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        input.value = q;
        input.addEventListener("input", render);
        render();
    }

    document.addEventListener("DOMContentLoaded", function() {
        setupMenu();
        setupHero();
        setupIndexSearch();
        setupFilters();
        setupPlayers();
        setupSearchPage();
    });
})();
