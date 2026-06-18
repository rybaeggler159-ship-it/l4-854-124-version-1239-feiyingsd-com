(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('.menu-toggle');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function setupSearchForms() {
    qsa('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('.site-search-input', form);
        if (!input) {
          return;
        }
        event.preventDefault();
        var query = input.value.trim();
        var url = './search.html';
        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function getSearchParam() {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      return '';
    }
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setupFilters() {
    var input = qs('.movie-filter');
    var grids = qsa('[data-filter-grid]');
    if (!input || !grids.length) {
      return;
    }
    var initial = getSearchParam();
    if (initial && input.classList.contains('global-search-input')) {
      input.value = initial;
    }
    var apply = function () {
      var keyword = normalizeText(input.value);
      var totalVisible = 0;
      grids.forEach(function (grid) {
        qsa('[data-movie-card]', grid).forEach(function (card) {
          var haystack = normalizeText([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre')
          ].join(' '));
          var visible = !keyword || haystack.indexOf(keyword) !== -1;
          card.style.display = visible ? '' : 'none';
          if (visible) {
            totalVisible += 1;
          }
        });
      });
      qsa('[data-no-result]').forEach(function (node) {
        node.classList.toggle('is-visible', totalVisible === 0);
      });
    };
    input.addEventListener('input', apply);
    apply();
  }

  function setupHero() {
    var slides = qsa('[data-hero-slide]');
    if (!slides.length) {
      return;
    }
    var dots = qsa('[data-hero-dot]');
    var prev = qs('[data-hero-prev]');
    var next = qs('[data-hero-next]');
    var current = 0;
    var timer;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    var restart = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    restart();
  }

  function setupPlayers() {
    qsa('.player-shell').forEach(function (shell) {
      var video = qs('video', shell);
      var cover = qs('.player-cover', shell);
      var stream = shell.getAttribute('data-stream');
      var attached = false;
      var hlsInstance = null;
      if (!video || !stream) {
        return;
      }
      var attachStream = function () {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          shell.hlsInstance = hlsInstance;
          return;
        }
        video.src = stream;
      };
      var start = function () {
        attachStream();
        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      };
      if (cover) {
        cover.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (!attached || video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupFilters();
    setupHero();
    setupPlayers();
  });
})();
