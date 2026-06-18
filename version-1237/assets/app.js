(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initSearchForms() {
    selectAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCardFilters() {
    selectAll("[data-filter-scope]").forEach(function (scope) {
      var search = scope.querySelector("[data-card-search]");
      var type = scope.querySelector("[data-card-type]");
      var year = scope.querySelector("[data-card-year]");
      var cards = selectAll("[data-card]", scope);
      var empty = scope.querySelector("[data-empty-state]");

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" ").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matched = (!query || text.indexOf(query) !== -1) &&
            (!typeValue || cardType === typeValue) &&
            (!yearValue || cardYear === yearValue);
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [search, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    selectAll(".stream-player").forEach(function (video) {
      var shell = video.closest(".player-shell");
      var button = shell ? shell.querySelector(".player-start") : null;
      var error = shell ? shell.querySelector(".player-error") : null;
      var source = video.querySelector("source");
      var stream = source ? source.getAttribute("src") : "";
      var hls = null;

      function showError(message) {
        if (error) {
          error.textContent = message;
        }
      }

      if (stream && window.Hls && window.Hls.isSupported()) {
        if (source) {
          source.remove();
        }
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showError("播放连接不稳定，正在重新连接");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showError("播放正在恢复中");
            hls.recoverMediaError();
          } else {
            showError("播放遇到问题，请稍后重试");
            hls.destroy();
          }
        });
      } else if (stream && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      }

      function playVideo() {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            showError("请再次点击播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        if (shell) {
          shell.classList.add("is-playing");
        }
        showError("");
      });
      video.addEventListener("pause", function () {
        if (shell) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        if (shell) {
          shell.classList.remove("is-playing");
        }
      });
    });
  }

  function createResultCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");
    return "<article class="movie-card" data-card>" +
      "<a href="./" + escapeHTML(item.url) + "" class="movie-card-link">" +
      "<figure class="movie-poster">" +
      "<img src="" + escapeHTML(item.cover) + "" alt="" + escapeHTML(item.title) + " 海报" loading="lazy">" +
      "<span class="poster-play">播放</span>" +
      "</figure>" +
      "<div class="movie-card-body">" +
      "<h3>" + escapeHTML(item.title) + "</h3>" +
      "<p class="movie-line">" + escapeHTML(item.oneLine) + "</p>" +
      "<div class="movie-meta"><span>" + escapeHTML(item.region) + "</span><span>" + escapeHTML(item.year) + "</span><span>" + escapeHTML(item.type) + "</span></div>" +
      "<div class="movie-tags">" + tags + "</div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var empty = document.querySelector("[data-search-empty]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.SITE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function render(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        if (title) {
          title.textContent = "热门推荐";
        }
        if (empty) {
          empty.classList.remove("show");
        }
        return;
      }
      var matched = window.SITE_SEARCH_INDEX.filter(function (item) {
        var text = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.category,
          item.genre,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" ").toLowerCase();
        return text.indexOf(q) !== -1;
      }).slice(0, 120);
      if (title) {
        title.textContent = "搜索结果";
      }
      results.innerHTML = matched.map(createResultCard).join("");
      if (empty) {
        empty.classList.toggle("show", matched.length === 0);
      }
    }

    var form = document.querySelector("[data-search-page-form]");
    if (form && input) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input.value.trim();
        var nextUrl = "./search.html" + (value ? "?q=" + encodeURIComponent(value) : "");
        history.replaceState(null, "", nextUrl);
        render(value);
      });
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(initial);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initSearchForms();
    initHero();
    initCardFilters();
    initPlayers();
    initSearchPage();
  });
})();
