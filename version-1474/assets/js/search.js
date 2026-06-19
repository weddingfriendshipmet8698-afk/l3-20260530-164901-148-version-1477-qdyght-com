(function () {
  var input = document.querySelector('.js-search-input');
  var form = document.querySelector('.js-search-form');
  var resultBox = document.querySelector('.js-search-results');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (!input || !resultBox) {
    return;
  }

  input.value = query;

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.url) + '">',
      '    <div class="poster-frame">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.opacity=\'0\';">',
      '      <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine || movie.genre || '') + '</p>',
      '      <div class="movie-meta">',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '      </div>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function render(value) {
    var keyword = String(value || '').trim().toLowerCase();

    if (!keyword) {
      resultBox.innerHTML = '<div class="empty-state">请输入片名、地区、类型或标签进行搜索。</div>';
      return;
    }

    var results = (window.SITE_MOVIES || []).filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();
      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 120);

    if (!results.length) {
      resultBox.innerHTML = '<div class="empty-state">没有找到匹配影片，可以尝试更短的关键词。</div>';
      return;
    }

    resultBox.innerHTML = results.map(card).join('');
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var next = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.history.replaceState(null, '', next);
      render(value);
    });
  }

  input.addEventListener('input', function () {
    render(input.value);
  });

  render(query);
})();
