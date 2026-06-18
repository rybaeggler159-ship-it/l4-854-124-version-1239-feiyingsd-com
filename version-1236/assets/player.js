(function () {
    var hlsLoading = null;

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        if (hlsLoading) {
            hlsLoading.then(callback);
            return;
        }
        hlsLoading = new Promise(function (resolve) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            script.onload = resolve;
            script.onerror = resolve;
            document.head.appendChild(script);
        });
        hlsLoading.then(callback);
    }

    function attachSource(video, src) {
        if (video.dataset.ready === '1') {
            return;
        }
        video.dataset.ready = '1';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return;
        }
        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = src;
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var src = player.getAttribute('data-src');
        var poster = player.getAttribute('data-poster');

        if (!video || !src) {
            return;
        }

        if (poster) {
            video.setAttribute('poster', poster);
        }

        function startPlayback() {
            attachSource(video, src);
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        function togglePlayback() {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', togglePlayback);
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
            player.classList.remove('is-playing');
        });
    });
})();
