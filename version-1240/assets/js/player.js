document.addEventListener("DOMContentLoaded", function () {
  var videos = Array.prototype.slice.call(document.querySelectorAll("[data-video-player]"));

  videos.forEach(function (video) {
    var button = document.querySelector('[data-play-button="' + video.id + '"]');
    var source = video.getAttribute("data-stream");
    var loaded = false;
    var hlsInstance = null;

    function attachSource() {
      if (loaded || !source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        loaded = true;
        return;
      }

      video.src = source;
      loaded = true;
    }

    function startPlayback() {
      attachSource();
      if (button) {
        button.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
