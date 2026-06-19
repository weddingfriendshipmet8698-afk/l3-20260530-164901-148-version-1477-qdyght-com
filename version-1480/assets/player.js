(function () {
    function showMessage(box, text) {
        if (!box) {
            return;
        }
        box.textContent = text;
        box.classList.add('is-visible');
        setTimeout(function () {
            box.classList.remove('is-visible');
        }, 3600);
    }

    function playVideo(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var message = shell.querySelector('[data-video-message]');
        var source = video ? video.getAttribute('data-video-src') : '';

        if (!video || !source) {
            showMessage(message, '播放暂不可用，请稍后再试');
            return;
        }

        function start() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(function () {
                    shell.classList.add('is-playing');
                }).catch(function () {
                    shell.classList.remove('is-playing');
                    showMessage(message, '点击视频区域继续播放');
                });
            } else {
                shell.classList.add('is-playing');
            }
        }

        if (video.getAttribute('data-ready') === '1') {
            start();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.setAttribute('data-ready', '1');
                start();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage(message, '播放暂不可用，请稍后再试');
                }
            });
            shell._hls = hls;
        } else {
            video.src = source;
            video.setAttribute('data-ready', '1');
            start();
        }

        if (button) {
            button.blur();
        }
    }

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var button = shell.querySelector('[data-play-button]');
        var video = shell.querySelector('video');

        if (button) {
            button.addEventListener('click', function () {
                playVideo(shell);
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo(shell);
                }
            });
        }
    });
})();
