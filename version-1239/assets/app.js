(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var searchInput = panel.querySelector("[data-filter-search]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var categorySelect = panel.querySelector("[data-filter-category]");
            var clearButton = panel.querySelector("[data-filter-clear]");
            var countNode = panel.querySelector("[data-result-count]");
            var grid = panel.nextElementSibling;
            while (grid && !grid.matches("[data-card-grid]")) {
                grid = grid.nextElementSibling;
            }
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

            function apply() {
                var keyword = text(searchInput && searchInput.value);
                var year = text(yearSelect && yearSelect.value);
                var type = text(typeSelect && typeSelect.value);
                var category = text(categorySelect && categorySelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = text([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.category,
                        card.dataset.tags
                    ].join(" "));
                    var ok = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (year && text(card.dataset.year) !== year) {
                        ok = false;
                    }
                    if (type && text(card.dataset.type).indexOf(type) === -1) {
                        ok = false;
                    }
                    if (category && text(card.dataset.category) !== category) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (countNode) {
                    countNode.textContent = "当前显示 " + visible + " 部";
                }
            }

            [searchInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (clearButton) {
                clearButton.addEventListener("click", function () {
                    if (searchInput) {
                        searchInput.value = "";
                    }
                    if (yearSelect) {
                        yearSelect.value = "";
                    }
                    if (typeSelect) {
                        typeSelect.value = "";
                    }
                    if (categorySelect) {
                        categorySelect.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function initPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        boxes.forEach(function (box) {
            var video = box.querySelector("video");
            var source = video ? video.querySelector("source") : null;
            var button = box.querySelector("[data-player-start]");
            var message = box.querySelector("[data-player-message]");
            var stream = source ? source.getAttribute("src") : "";
            var hlsInstance = null;

            function showMessage(value) {
                if (!message) {
                    return;
                }
                message.textContent = value;
                message.classList.add("active");
            }

            function playVideo() {
                if (!video || !stream) {
                    showMessage("暂时无法播放，请稍后再试");
                    return;
                }
                if (button) {
                    button.classList.add("is-hidden");
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (!video.getAttribute("src")) {
                        video.setAttribute("src", stream);
                    }
                    video.play().catch(function () {
                        showMessage("请再次点击播放");
                    });
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    if (!hlsInstance) {
                        hlsInstance = new window.Hls();
                        hlsInstance.loadSource(stream);
                        hlsInstance.attachMedia(video);
                    }
                    video.play().catch(function () {
                        showMessage("请再次点击播放");
                    });
                    return;
                }
                showMessage("暂时无法播放，请稍后再试");
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
    });
})();
