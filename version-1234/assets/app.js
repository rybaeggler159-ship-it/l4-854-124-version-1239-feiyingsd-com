(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeText(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function() {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initImages() {
        document.querySelectorAll("img").forEach(function(image) {
            image.addEventListener("error", function() {
                image.style.opacity = "0";
            }, { once: true });
        });
    }

    function renderCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function(tag) {
            return "<span>" + escapeText(tag) + "</span>";
        }).join("");
        return "" +
            "<a class=\"movie-card\" href=\"" + escapeText(item.url) + "\">" +
            "<div class=\"card-media\">" +
            "<img src=\"" + escapeText(item.cover) + "\" alt=\"" + escapeText(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"play-dot\">▶</span>" +
            "<span class=\"year-badge\">" + escapeText(item.year) + "</span>" +
            "</div>" +
            "<div class=\"card-body\">" +
            "<h3>" + escapeText(item.title) + "</h3>" +
            "<p>" + escapeText(item.description) + "</p>" +
            "<div class=\"card-meta\">" +
            "<span>" + escapeText(item.region) + "</span>" +
            "<span>" + escapeText(item.type) + "</span>" +
            "<span>★ " + escapeText(item.rating) + "</span>" +
            "</div>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</a>";
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = page.querySelector("[data-search-input]");
        var title = page.querySelector("[data-search-title]");
        var subtitle = page.querySelector("[data-search-subtitle]");
        var results = page.querySelector("[data-search-results]");
        if (input) {
            input.value = query;
        }
        if (!query) {
            initImages();
            return;
        }
        var lower = query.toLowerCase();
        var matched = window.SEARCH_DATA.filter(function(item) {
            return [item.title, item.description, item.region, item.type, item.year, item.category]
                .concat(item.tags || [])
                .join(" ")
                .toLowerCase()
                .indexOf(lower) !== -1;
        });
        if (title) {
            title.textContent = "搜索结果";
        }
        if (subtitle) {
            subtitle.textContent = matched.length ? "以下内容与“" + query + "”相关。" : "没有找到相关内容，可以换个关键词再试。";
        }
        if (results) {
            results.innerHTML = matched.length ? matched.map(renderCard).join("") : "<div class=\"empty-state\">暂无相关内容</div>";
        }
        initImages();
    }

    function initMoviePlayer(source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        if (!video || !source) {
            return;
        }
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = source;
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function() {
                    video.controls = true;
                });
            }
        }

        prepare();
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function() {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function() {
        initMenu();
        initHero();
        initImages();
        initSearchPage();
    });

    window.initMoviePlayer = initMoviePlayer;
})();
