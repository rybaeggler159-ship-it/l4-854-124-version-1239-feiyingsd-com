(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var button = one('[data-menu-toggle]');
    var panel = one('[data-menu-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var dots = all('.hero-dot', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var input = one('[data-filter-input]');
    var type = one('[data-filter-type]');
    var region = one('[data-filter-region]');
    var cards = all('[data-card]');
    if (!cards.length || (!input && !type && !region)) {
      return;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedType = type ? type.value : '';
      var selectedRegion = region ? region.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (selectedType && selectedType !== cardType) {
          matched = false;
        }
        if (selectedRegion && selectedRegion !== cardRegion) {
          matched = false;
        }
        card.classList.toggle('hidden', !matched);
      });
    }

    [input, type, region].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupSearchPage() {
    var host = one('[data-search-results]');
    if (!host || !Array.isArray(window.searchItems)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = one('[data-search-page-input]');
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase();
    var items = window.searchItems.filter(function (item) {
      if (!normalized) {
        return true;
      }
      return item.text.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 240);

    host.innerHTML = items.map(function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + item.link + '">',
        '    <span class="poster-frame">',
        '      <img src="' + item.image + '" alt="' + item.title + '" loading="lazy" onerror="this.classList.add(\'is-missing\')">',
        '      <b class="score">' + item.score + '</b>',
        '    </span>',
        '  </a>',
        '  <div class="card-body">',
        '    <h3><a href="' + item.link + '">' + item.title + '</a></h3>',
        '    <p class="meta">' + item.meta + '</p>',
        '    <p class="line">' + item.line + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function setupPlayer() {
    var box = one('[data-player]');
    if (!box) {
      return;
    }
    var video = one('video', box);
    var button = one('[data-play]', box);
    if (!video || !button) {
      return;
    }
    var active = false;
    var hlsInstance = null;

    function attach() {
      if (active) {
        return;
      }
      var url = video.getAttribute('data-video') || '';
      if (!url) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        video.src = url;
      }
      active = true;
    }

    function begin() {
      attach();
      video.setAttribute('controls', 'controls');
      box.classList.add('is-playing');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    button.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (!active) {
        begin();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  function setupImages() {
    all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayer();
    setupImages();
  });
}());
