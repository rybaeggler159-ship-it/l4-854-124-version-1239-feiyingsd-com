(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
        });
    });

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function setSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        setSlide(0);
        start();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var list = panel.parentElement.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        var input = panel.querySelector('[data-filter-input]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-category') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedType = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
                var matchedYear = !year || (card.getAttribute('data-year') || '') === year;
                card.classList.toggle('is-hidden', !(matchedQuery && matchedType && matchedYear));
            });
        }

        [input, typeSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });
    });
})();
