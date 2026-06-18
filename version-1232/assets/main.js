(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var menu = qs('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('open');
      button.textContent = menu.classList.contains('open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function movieCardHTML(item) {
    return [
      '<a class="movie-card" href="details/' + encodeURIComponent(item.id) + '.html">',
      '  <div class="movie-cover">',
      '    <img src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(item.title) + '" loading="lazy">',
      '    <div class="cover-shade"><span class="play-icon">▶</span></div>',
      '    <span class="category-chip">' + escapeHTML(item.category) + '</span>',
      '    <span class="rating-chip">★ ' + escapeHTML(item.rating) + '</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <h3>' + escapeHTML(item.title) + '</h3>',
      '    <p>' + escapeHTML(item.one_line) + '</p>',
      '    <div class="meta-line">',
      '      <span>' + escapeHTML(item.region) + '</span>',
      '      <span>' + escapeHTML(item.type) + '</span>',
      '      <span>' + escapeHTML(item.year) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function setupSearchPage() {
    var app = qs('[data-search-app]');

    if (!app || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var input = qs('[data-search-input]', app);
    var category = qs('[data-search-category]', app);
    var region = qs('[data-search-region]', app);
    var year = qs('[data-search-year]', app);
    var sort = qs('[data-search-sort]', app);
    var results = qs('[data-search-results]', app);
    var count = qs('[data-search-count]', app);
    var params = new URLSearchParams(window.location.search);

    if (input) {
      input.value = params.get('q') || '';
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function render() {
      var q = normalize(input && input.value);
      var cat = category && category.value;
      var reg = region && region.value;
      var yr = year && year.value;
      var sorted = window.MOVIE_SEARCH_INDEX.slice();

      sorted = sorted.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.one_line,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.category
        ].join(' '));

        return (!q || haystack.indexOf(q) !== -1)
          && (!cat || item.category === cat)
          && (!reg || item.region_group === reg)
          && (!yr || String(item.year).indexOf(yr) !== -1);
      });

      if (sort && sort.value === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.year_number || 0) - Number(a.year_number || 0);
        });
      } else if (sort && sort.value === 'rating') {
        sorted.sort(function (a, b) {
          return Number(b.rating || 0) - Number(a.rating || 0);
        });
      } else {
        sorted.sort(function (a, b) {
          return Number(b.heat || 0) - Number(a.heat || 0);
        });
      }

      if (count) {
        count.textContent = '找到 ' + sorted.length + ' 部相关影片';
      }

      if (!results) {
        return;
      }

      if (!sorted.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配的影片，请换一个关键词或筛选条件。</div>';
        return;
      }

      results.innerHTML = sorted.slice(0, 120).map(movieCardHTML).join('\n');
    }

    [input, category, region, year, sort].forEach(function (control) {
      if (!control) {
        return;
      }

      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupSearchPage();
  });
})();
