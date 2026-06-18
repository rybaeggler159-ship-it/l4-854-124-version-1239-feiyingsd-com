document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var links = document.querySelector("[data-nav-links]");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
  var yearFilter = document.querySelector("[data-year-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";

  function filterCards() {
    var text = filterInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(" ");
    var year = yearFilter ? yearFilter.value : "";

    cards.forEach(function (card) {
      var search = (card.getAttribute("data-search") || "").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var matchedText = !text || search.indexOf(text) !== -1;
      var matchedYear = !year || cardYear === year;
      card.classList.toggle("is-hidden", !(matchedText && matchedYear));
    });
  }

  if (query && filterInputs.length) {
    filterInputs.forEach(function (input) {
      input.value = query;
    });
  }

  filterInputs.forEach(function (input) {
    input.addEventListener("input", filterCards);
  });

  if (yearFilter) {
    yearFilter.addEventListener("change", filterCards);
  }

  if (filterInputs.length || yearFilter) {
    filterCards();
  }
});
