(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      slides[index].classList.remove("active");
      dots[index].classList.remove("active");
      index = next;
      slides[index].classList.add("active");
      dots[index].classList.add("active");
    }

    function start() {
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(dotIndex);
        start();
      });
    });

    start();
  }

  function cardMatchesFilter(card, filter) {
    if (!filter || filter === "all") {
      return true;
    }
    var type = (card.getAttribute("data-type") || "").toLowerCase();
    var text = (card.getAttribute("data-search") || "").toLowerCase();
    var value = filter.toLowerCase();
    return type.indexOf(value) !== -1 || text.indexOf(value) !== -1;
  }

  function applyFilter(targetId) {
    var target = document.getElementById(targetId);
    if (!target) {
      return;
    }
    var input = document.querySelector('[data-search-input][data-target="' + targetId + '"]');
    var activeButton = document.querySelector('[data-filter-target="' + targetId + '"] .filter-button.active');
    var query = input ? input.value.trim().toLowerCase() : "";
    var filter = activeButton ? activeButton.getAttribute("data-filter") : "all";
    var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute("data-search") || "").toLowerCase();
      var match = (!query || text.indexOf(query) !== -1) && cardMatchesFilter(card, filter);
      card.style.display = match ? "" : "none";
      if (match) {
        visible += 1;
      }
    });

    var empty = document.querySelector('[data-empty-for="' + targetId + '"]');
    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input][data-target]"));
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        applyFilter(input.getAttribute("data-target"));
      });
    });

    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-target]"));
    groups.forEach(function (group) {
      var targetId = group.getAttribute("data-filter-target");
      var buttons = Array.prototype.slice.call(group.querySelectorAll(".filter-button"));
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          applyFilter(targetId);
        });
      });
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      var searchInput = document.querySelector('[data-search-input][data-target="search-grid"]');
      if (searchInput) {
        searchInput.value = q;
        applyFilter("search-grid");
      }
    }
  }

  window.initMoviePlayer = function (videoId, overlayId, buttonId, sourceUrl) {
    onReady(function () {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      var playButton = document.getElementById(buttonId);
      if (!video || !overlay || !sourceUrl) {
        return;
      }
      var attached = false;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }

      function play() {
        attach();
        overlay.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", play);
      if (playButton) {
        playButton.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  };

  onReady(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
