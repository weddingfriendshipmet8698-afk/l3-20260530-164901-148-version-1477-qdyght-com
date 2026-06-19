(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls]'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.play-overlay');
            var source = shell.getAttribute('data-hls');
            var attached = false;
            var hls = null;
            var attach = function () {
                if (!video || !source || attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return;
                }
                video.src = source;
            };
            var play = function () {
                attach();
                if (!video) {
                    return;
                }
                var attempt = video.play();
                shell.classList.add('is-playing');
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            };
            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener('play', function () {
                    shell.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    shell.classList.remove('is-playing');
                });
                video.addEventListener('ended', function () {
                    shell.classList.remove('is-playing');
                    if (hls && typeof hls.destroy === 'function') {
                        hls.destroy();
                        hls = null;
                        attached = false;
                    }
                });
            }
        });
    });
})();
