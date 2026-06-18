
(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupImages() {
    selectAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-hidden');
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
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

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupSearch() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }
    var keyword = page.querySelector('[data-filter-keyword]');
    var region = page.querySelector('[data-filter-region]');
    var type = page.querySelector('[data-filter-type]');
    var year = page.querySelector('[data-filter-year]');
    var category = page.querySelector('[data-filter-category]');
    var cards = selectAll('[data-filter-results] .movie-card', page);
    var query = new URLSearchParams(window.location.search).get('q') || '';
    if (keyword && query) {
      keyword.value = query;
    }

    function valueOf(field) {
      return field ? field.value.trim().toLowerCase() : '';
    }

    function apply() {
      var key = valueOf(keyword);
      var selectedRegion = valueOf(region);
      var selectedType = valueOf(type);
      var selectedYear = valueOf(year);
      var selectedCategory = valueOf(category);
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var ok = true;
        if (key && text.indexOf(key) === -1) {
          ok = false;
        }
        if (selectedRegion && (card.getAttribute('data-region') || '').toLowerCase() !== selectedRegion) {
          ok = false;
        }
        if (selectedType && (card.getAttribute('data-type') || '').toLowerCase() !== selectedType) {
          ok = false;
        }
        if (selectedYear && (card.getAttribute('data-year') || '').toLowerCase() !== selectedYear) {
          ok = false;
        }
        if (selectedCategory && (card.getAttribute('data-category') || '').toLowerCase() !== selectedCategory) {
          ok = false;
        }
        card.classList.toggle('hidden-by-filter', !ok);
      });
    }

    [keyword, region, type, year, category].forEach(function (field) {
      if (!field) {
        return;
      }
      field.addEventListener('input', apply);
      field.addEventListener('change', apply);
    });
    apply();
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;

      function start() {
        if (!video || !stream) {
          return;
        }
        player.classList.add('is-playing');
        if (video.getAttribute('src') === stream) {
          video.play().catch(function () {});
          return;
        }
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          return;
        }
        video.src = stream;
        video.play().catch(function () {});
      }

      if (button) {
        button.addEventListener('click', start);
      }
      player.addEventListener('dblclick', start);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupImages();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
