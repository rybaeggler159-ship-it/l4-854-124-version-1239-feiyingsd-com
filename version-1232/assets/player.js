import { H as Hls } from './hls-dru42stk.js';

function showMessage(frame, message) {
  var box = frame.querySelector('[data-player-message]');

  if (!box) {
    return;
  }

  box.textContent = message;
  box.classList.add('show');
}

function setupPlayer(frame) {
  var video = frame.querySelector('video');
  var overlay = frame.querySelector('[data-player-play]');
  var source = frame.getAttribute('data-video-url');
  var poster = frame.querySelector('.player-poster');
  var hlsInstance = null;
  var loaded = false;

  if (!video || !overlay || !source) {
    return;
  }

  function loadAndPlay() {
    overlay.classList.add('hidden');

    if (poster) {
      poster.classList.add('hidden');
    }

    if (!loaded) {
      loaded = true;
      video.controls = true;

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            showMessage(frame, '播放器初始化失败，请刷新页面后重试。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        showMessage(frame, '当前浏览器不支持 HLS 播放，请更换现代浏览器。');
        return;
      }
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('hidden');

        if (poster) {
          poster.classList.remove('hidden');
        }

        showMessage(frame, '浏览器阻止了自动播放，请再次点击播放按钮。');
      });
    }
  }

  overlay.addEventListener('click', loadAndPlay);
  frame.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      loadAndPlay();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll('[data-hls-player]').forEach(setupPlayer);
