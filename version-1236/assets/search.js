(function () {
    var form = document.querySelector('[data-search-page-form]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var categorySelect = document.querySelector('[data-search-category]');
    var typeSelect = document.querySelector('[data-search-type]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (!form || !results || !window.SEARCH_INDEX) {
        return;
    }

    var input = form.querySelector('input[name="q"]');
    input.value = initialQuery;

    function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a href="' + escapeHtml(movie.url) + '" class="movie-card-image" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="movie-badge">' + escapeHtml(movie.category) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<a href="' + escapeHtml(movie.url) + '" class="movie-card-title">' + escapeHtml(movie.title) + '</a>',
            '<p class="movie-card-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
            '<div class="tag-list">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function applySearch() {
        var query = input.value.trim().toLowerCase();
        var category = categorySelect ? categorySelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var matched = window.SEARCH_INDEX.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                movie.oneLine,
                movie.tags.join(' ')
            ].join(' ').toLowerCase();
            var queryOk = !query || haystack.indexOf(query) !== -1;
            var categoryOk = !category || movie.category === category;
            var typeOk = !type || movie.type.indexOf(type) !== -1;
            return queryOk && categoryOk && typeOk;
        });

        var visible = matched.slice(0, 120);
        results.innerHTML = visible.map(card).join('');
        if (title) {
            title.textContent = query ? '搜索结果：' + input.value.trim() : '热门推荐';
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var nextUrl = './search.html';
        if (input.value.trim()) {
            nextUrl += '?q=' + encodeURIComponent(input.value.trim());
        }
        window.history.replaceState(null, '', nextUrl);
        applySearch();
    });

    [categorySelect, typeSelect].forEach(function (element) {
        if (element) {
            element.addEventListener('change', applySearch);
        }
    });

    input.addEventListener('input', applySearch);
    applySearch();
})();
