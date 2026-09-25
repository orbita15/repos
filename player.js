// ============================================================
// player.js — логика уличного кинотеатра
// Зависит от: THREE, PARKING_SCENE (scene.js), Hls
// ============================================================
(function () {
    'use strict';

    const S = window.PARKING_SCENE;
    if (!S) {
        console.error('scene.js не загружен!');
        return;
    }

    const {
        scene, camera, renderer, cssRenderer, controls,
        screenWidth, screenHeight, screenMesh, screenMaterial, screenGlow,
        resize: resizeScene
    } = S;

    // --------------------------------------------------------
    // ХОТКЕИ
    // --------------------------------------------------------
    const videoElement = document.getElementById('streamVideo');
    videoElement.playsInline = true;
    videoElement.loop = true;
    videoElement.muted = true;   // ★ звук убран полностью

    const manageBtn     = document.getElementById('manageBtn');
    const videoControls = document.getElementById('videoControls');
    const playHint      = document.getElementById('playHint');

    // --------------------------------------------------------
    // ТЕКСТУРЫ ЭКРАНА
    // --------------------------------------------------------
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;
    videoTexture.generateMipmaps = false;
    videoTexture.encoding = THREE.sRGBEncoding;

    const infoCanvas = document.createElement('canvas');
    infoCanvas.width = 1280;
    infoCanvas.height = 720;
    const ictx = infoCanvas.getContext('2d');

    const infoTexture = new THREE.CanvasTexture(infoCanvas);
    infoTexture.minFilter = THREE.LinearFilter;
    infoTexture.magFilter = THREE.LinearFilter;
    infoTexture.encoding = THREE.sRGBEncoding;

    screenMaterial.map = infoTexture;
    screenMaterial.needsUpdate = true;

    // --------------------------------------------------------
    // СОСТОЯНИЕ UI
    // --------------------------------------------------------
    const uiState = {
        title: 'УЛИЧНЫЙ КИНОТЕАТР',
        statusLine: 'Запуск…',
        currentName: '—',
        currentStatus: 'waiting',
        sources: [],
        log: [],
        spinner: 0,
        mode: 'info'
    };

    function pushLog(text) {
        const time = new Date().toLocaleTimeString('ru-RU');
        uiState.log.unshift(`[${time}] ${text}`);
        if (uiState.log.length > 6) uiState.log.pop();
        console.log(text);
    }

    function statusColor(s) {
        switch (s) {
            case 'ready':   return '#4dff9a';
            case 'playing': return '#4dff9a';
            case 'loading': return '#ffd24d';
            case 'failed':  return '#ff5b5b';
            default:        return '#8fa0b5';
        }
    }
    function statusLabel(s) {
        switch (s) {
            case 'ready':   return 'ГОТОВ';
            case 'playing': return 'ИГРАЕТ';
            case 'loading': return 'ЗАГРУЗКА…';
            case 'failed':  return 'ОШИБКА';
            default:        return 'ОЖИДАНИЕ';
        }
    }

    // --------------------------------------------------------
    // ИНФО-ПАНЕЛЬ
    // --------------------------------------------------------
    function drawInfoPanel(t) {
        const W = infoCanvas.width;
        const H = infoCanvas.height;

        const grad = ictx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#0b1020');
        grad.addColorStop(1, '#050810');
        ictx.fillStyle = grad;
        ictx.fillRect(0, 0, W, H);

        ictx.fillStyle = 'rgba(255,255,255,0.025)';
        for (let y = 0; y < H; y += 4) ictx.fillRect(0, y, W, 2);

        ictx.strokeStyle = 'rgba(120,200,255,0.3)';
        ictx.lineWidth = 4;
        ictx.strokeRect(20, 20, W - 40, H - 40);

        ictx.fillStyle = '#7ec8ff';
        ictx.font = 'bold 48px Arial';
        ictx.textAlign = 'center';
        ictx.textBaseline = 'top';
        ictx.fillText('🎬  ' + uiState.title, W / 2, 50);

        ictx.strokeStyle = 'rgba(120,200,255,0.5)';
        ictx.lineWidth = 2;
        ictx.beginPath();
        ictx.moveTo(60, 125);
        ictx.lineTo(W - 60, 125);
        ictx.stroke();

        ictx.textAlign = 'left';
        ictx.fillStyle = '#aab6c8';
        ictx.font = '26px Arial';
        ictx.fillText('ТЕКУЩИЙ КАНАЛ:', 70, 155);

        ictx.fillStyle = '#ffffff';
        ictx.font = 'bold 42px Arial';
        ictx.fillText(uiState.currentName, 70, 195);

        const badgeColor = statusColor(uiState.currentStatus);
        ictx.fillStyle = badgeColor + '40';
        ictx.fillRect(W - 400, 175, 330, 60);
        ictx.strokeStyle = badgeColor;
        ictx.lineWidth = 4;
        ictx.strokeRect(W - 400, 175, 330, 60);
        ictx.fillStyle = badgeColor;
        ictx.font = 'bold 34px Arial';
        ictx.textAlign = 'center';
        ictx.fillText(statusLabel(uiState.currentStatus), W - 235, 190);

        if (uiState.currentStatus === 'loading') {
            const cx = W - 440;
            const cy = 205;
            ictx.strokeStyle = badgeColor;
            ictx.lineWidth = 6;
            ictx.beginPath();
            ictx.arc(cx, cy, 22, uiState.spinner, uiState.spinner + Math.PI * 1.4);
            ictx.stroke();
        }

        ictx.textAlign = 'left';
        ictx.fillStyle = '#d7e2f0';
        ictx.font = '28px Arial';
        ictx.fillText(uiState.statusLine, 70, 265);

        ictx.strokeStyle = 'rgba(120,200,255,0.25)';
        ictx.beginPath();
        ictx.moveTo(60, 315);
        ictx.lineTo(W - 60, 315);
        ictx.stroke();

        ictx.fillStyle = '#7ec8ff';
        ictx.font = 'bold 24px Arial';
        ictx.fillText('СПИСОК КАНАЛОВ:', 70, 335);

        const cols = 2;
        const colW = (W - 140) / cols;
        const rowH = 38;
        const startY = 368;

        uiState.sources.forEach((s, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = 70 + col * colW;
            const y = startY + row * rowH;
            if (y > H - 220) return;

            const isCurrent = i === currentIndex;
            const c = statusColor(s.status);

            if (isCurrent) {
                ictx.fillStyle = 'rgba(120,200,255,0.12)';
                ictx.fillRect(x - 10, y - 5, colW - 20, rowH - 6);
            }

            ictx.beginPath();
            ictx.fillStyle = c;
            ictx.arc(x + 10, y + 11, 6, 0, Math.PI * 2);
            ictx.fill();

            ictx.fillStyle = isCurrent ? '#ffffff' : '#aab6c8';
            ictx.font = (isCurrent ? 'bold ' : '') + '19px Arial';
            ictx.fillText(s.name, x + 28, y);

            ictx.fillStyle = c;
            ictx.font = '15px Arial';
            ictx.textAlign = 'right';
            ictx.fillText(statusLabel(s.status), x + colW - 30, y + 2);
            ictx.textAlign = 'left';
        });

        const logTop = H - 165;
        ictx.strokeStyle = 'rgba(120,200,255,0.25)';
        ictx.beginPath();
        ictx.moveTo(60, logTop - 15);
        ictx.lineTo(W - 60, logTop - 15);
        ictx.stroke();

        ictx.fillStyle = '#7ec8ff';
        ictx.font = 'bold 22px Arial';
        ictx.fillText('ЖУРНАЛ СОБЫТИЙ:', 70, logTop - 5);

        ictx.font = '17px monospace';
        uiState.log.forEach((line, i) => {
            ictx.fillStyle = i === 0 ? '#e6f3ff' : `rgba(200,220,240,${0.85 - i * 0.12})`;
            ictx.fillText(line, 70, logTop + 22 + i * 22);
        });

        const barX = ((t * 220) % (W + 300)) - 150;
        const barGrad = ictx.createLinearGradient(barX - 150, 0, barX + 150, 0);
        barGrad.addColorStop(0, 'rgba(120,200,255,0)');
        barGrad.addColorStop(0.5, 'rgba(120,200,255,0.12)');
        barGrad.addColorStop(1, 'rgba(120,200,255,0)');
        ictx.fillStyle = barGrad;
        ictx.fillRect(0, 0, W, H);

        ictx.fillStyle = 'rgba(200,220,240,0.7)';
        ictx.font = '20px monospace';
        ictx.textAlign = 'right';
        ictx.fillText(new Date().toLocaleTimeString('ru-RU'), W - 60, H - 55);
        ictx.textAlign = 'left';
    }

    // --------------------------------------------------------
    // ЗАГРУЗКА КАНАЛОВ
    // --------------------------------------------------------
    const playHintEl = playHint;
    const menuToggle = document.getElementById('menuToggle');
    const menuClose = document.getElementById('menuClose');
    const channelMenu = document.getElementById('channelMenu');
    const channelList = document.getElementById('channelList');
    const menuOverlay = document.getElementById('menuOverlay');

    let sources = [];
    let currentIndex = 0;

    async function loadSourcesFromFile() {
        try {
            const resp = await fetch('sources.json', { cache: 'no-store' });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const data = await resp.json();

            const flat = [];
            (data.groups || []).forEach(g => {
                (g.items || []).forEach(it => {
                    flat.push({ group: g.title, type: it.type, url: it.url, name: it.name });
                });
            });
            sources = flat;

            uiState.sources = sources.map(s => ({ name: s.name, status: 'waiting' }));
            buildChannelMenu();
            pushLog(`✅ Загружено каналов: ${sources.length}`);
            loadSource(0);
        } catch (e) {
            console.error('Не удалось загрузить sources.json:', e);
            pushLog('❌ sources.json не загружен: ' + e.message);
            uiState.statusLine = 'Ошибка загрузки sources.json';
            sources = [
                { type: 'iframe', url: 'https://rutube.ru/play/embed/20872670', name: 'Rutube (по умолчанию)' }
            ];
            uiState.sources = sources.map(s => ({ name: s.name, status: 'waiting' }));
            buildChannelMenu();
            loadSource(0);
        }
    }

    // --------------------------------------------------------
    // МЕНЮ
    // --------------------------------------------------------
    function buildChannelMenu() {
        channelList.innerHTML = '';
        let lastGroup = null;

        sources.forEach((src, i) => {
            const group = src.group || '';
            if (group && group !== lastGroup) {
                const h = document.createElement('div');
                h.className = 'channelGroup';
                h.textContent = group;
                channelList.appendChild(h);
                lastGroup = group;
            }

            const item = document.createElement('div');
            item.className = 'channelItem' + (i === currentIndex ? ' active' : '');
            item.dataset.index = i;

            const dot = document.createElement('span');
            dot.className = 'statusDot';

            const name = document.createElement('span');
            name.className = 'channelName';
            name.textContent = src.name;

            const type = document.createElement('span');
            type.className = 'channelType';
            type.textContent = (src.type || 'hls').toUpperCase();

            item.appendChild(dot);
            item.appendChild(name);
            item.appendChild(type);

            item.addEventListener('click', () => {
                if (i === currentIndex && isLoaded) {
                    closeMenu();
                    return;
                }
                loadSource(i);
                closeMenu();
            });

            channelList.appendChild(item);
        });
    }

    function updateMenuStatus() {
        const items = channelList.querySelectorAll('.channelItem');
        items.forEach(item => {
            const i = Number(item.dataset.index);
            item.classList.toggle('active', i === currentIndex);
            item.classList.remove('ok', 'fail', 'loading');
            const status = uiState.sources[i] ? uiState.sources[i].status : 'waiting';
            if (status === 'ready' || status === 'playing') item.classList.add('ok');
            else if (status === 'failed') item.classList.add('fail');
            else if (status === 'loading') item.classList.add('loading');
        });
    }

    function openMenu() {
        channelMenu.classList.add('open');
        menuOverlay.classList.add('show');
    }
    function closeMenu() {
        channelMenu.classList.remove('open');
        menuOverlay.classList.remove('show');
    }

    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // --------------------------------------------------------
    // IFRAME (CSS3D)
    // --------------------------------------------------------
    let currentIframe = null;
    let currentIframeObj = null;
    let iframeReady = false;

    const IFRAME_W = 1280;
    const IFRAME_H = 720;

    function createIframeObject(url) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width  = IFRAME_W + 'px';
        iframe.style.height = IFRAME_H + 'px';
        iframe.style.border = 'none';
        iframe.style.background = '#000';
        // ★ iframe НЕ перехватывает клики — камера работает свободно
        iframe.style.pointerEvents = 'none';
        iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('frameborder', '0');

        const obj = new THREE.CSS3DObject(iframe);
        obj.position.set(0, 5.5, 1.05);
        const scale = screenWidth / IFRAME_W;
        obj.scale.set(scale, scale, 1);

        return { obj, iframe };
    }

    function showIframe(url) {
        hideIframe();
        iframeReady = false;

        const { obj, iframe } = createIframeObject(url);
        currentIframeObj = obj;
        currentIframe = iframe;
        scene.add(obj);

        screenMesh.visible = false;
        uiState.mode = 'css3d';

        manageBtn.style.display = 'flex';
        manageBtn.classList.remove('active');
        manageBtn.textContent = '🎮 УПРАВЛЯТЬ ВИДЕО';
        videoControls.classList.remove('show');
    }

    function hideIframe() {
        if (currentIframeObj) {
            scene.remove(currentIframeObj);
            if (currentIframe && currentIframe.parentNode) {
                currentIframe.parentNode.removeChild(currentIframe);
            }
            currentIframeObj = null;
            currentIframe = null;
        }
        manageBtn.style.display = 'none';
        manageBtn.classList.remove('active');
        iframeReady = false;
        screenMesh.visible = true;
        videoControls.classList.remove('show');
    }

    // ★ Кнопка просто показывает/скрывает панель кнопок.
    //   OrbitControls НЕ блокируются, iframe НЕ становится кликабельным.
    manageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!currentIframe) return;

        const isOpen = videoControls.classList.contains('show');
        if (isOpen) {
            videoControls.classList.remove('show');
            manageBtn.classList.remove('active');
            manageBtn.textContent = '🎮 УПРАВЛЯТЬ ВИДЕО';
            pushLog('Панель управления скрыта');
        } else {
            videoControls.classList.add('show');
            manageBtn.classList.add('active');
            manageBtn.textContent = '✕ СКРЫТЬ УПРАВЛЕНИЕ';
            pushLog('Панель управления показана');
        }
    });

    // --------------------------------------------------------
    // СОБЫТИЯ ОТ RUTUBE
    // --------------------------------------------------------
    window.addEventListener('message', (event) => {
        let type = null;
        try {
            if (typeof event.data === 'string') {
                if (event.data.startsWith('{')) {
                    const parsed = JSON.parse(event.data);
                    type = parsed.type || parsed.event;
                } else {
                    type = event.data;
                }
            } else if (event.data && typeof event.data === 'object') {
                type = event.data.type || event.data.event;
            }
        } catch (e) {}
        if (!type) return;

        if (type === 'player:ready') {
            iframeReady = true;
            pushLog('✅ Rutube готов к командам');
        }
    });

    // --------------------------------------------------------
    // ОТПРАВКА КОМАНД В RUTUBE
    // --------------------------------------------------------
    function rutubePost(command, data) {
        if (!currentIframe || !currentIframe.contentWindow) return;
        const payload = data
            ? { type: command, data: data }
            : { type: command };
        try {
            currentIframe.contentWindow.postMessage(JSON.stringify(payload), '*');
        } catch (e) {
            console.warn('postMessage failed:', e);
        }
    }

    function rutubePostRaw(cmd) {
        if (!currentIframe || !currentIframe.contentWindow) return;
        try {
            currentIframe.contentWindow.postMessage(cmd, '*');
        } catch (e) {}
    }

    // --------------------------------------------------------
    // HLS
    // --------------------------------------------------------
    let currentHls = null;
    let sourceLoadTimeout = null;
    let isLoaded = false;
    let isPlayingVideo = false;
    let pendingHandlers = [];

    function detachPendingHandlers() {
        pendingHandlers.forEach(([ev, fn]) => videoElement.removeEventListener(ev, fn));
        pendingHandlers = [];
    }

    function clearVideoElement() {
        detachPendingHandlers();
        if (currentHls) {
            try { currentHls.destroy(); } catch (e) {}
            currentHls = null;
        }
        videoElement.pause();
        videoElement.removeAttribute('src');
        try { videoElement.load(); } catch (e) {}
    }

    function markSource(index, status) {
        if (uiState.sources[index]) {
            uiState.sources[index].status = status;
        }
        updateMenuStatus();
    }

    function showInfo() {
        uiState.mode = 'info';
        screenMaterial.map = infoTexture;
        screenMaterial.needsUpdate = true;
        screenMesh.visible = true;
    }
    function showVideo() {
        uiState.mode = 'video';
        screenMaterial.map = videoTexture;
        screenMaterial.needsUpdate = true;
        screenMesh.visible = true;
    }

    function tryPlay() {
        videoElement.muted = true;
        const p = videoElement.play();
        if (p && p.catch) {
            p.catch(err => {
                console.warn('play() failed:', err.name);
                uiState.statusLine = 'Нажмите для запуска';
                playHintEl.classList.remove('hidden');
            });
        }
    }

    function loadSource(index) {
        if (sourceLoadTimeout) {
            clearTimeout(sourceLoadTimeout);
            sourceLoadTimeout = null;
        }

        if (index >= sources.length) {
            uiState.currentName = '—';
            uiState.currentStatus = 'failed';
            uiState.statusLine = 'Все каналы недоступны';
            pushLog('❌ Все каналы исчерпаны');
            isLoaded = false;
            isPlayingVideo = false;
            clearVideoElement();
            hideIframe();
            showInfo();
            updateMenuStatus();
            return;
        }

        isLoaded = false;
        isPlayingVideo = false;
        currentIndex = index;
        clearVideoElement();
        hideIframe();

        const source = sources[index];
        pushLog(`[${index + 1}/${sources.length}] Загрузка: ${source.name}`);

        uiState.currentName = source.name;
        uiState.currentStatus = 'loading';
        uiState.statusLine = `Подключение к каналу #${index + 1} из ${sources.length}…`;
        markSource(index, 'loading');
        updateMenuStatus();

        if (source.type === 'iframe') {
            showInfo();
            setTimeout(() => {
                showIframe(source.url);
                uiState.currentStatus = 'playing';
                uiState.statusLine = `▶ ${source.name}`;
                markSource(index, 'ready');
                playHintEl.classList.add('hidden');
                pushLog(`▶ Iframe загружен: ${source.name}`);
            }, 300);
            return;
        }

        showInfo();

        const onReady = () => {
            if (isLoaded) return;
            isLoaded = true;

            if (sourceLoadTimeout) {
                clearTimeout(sourceLoadTimeout);
                sourceLoadTimeout = null;
            }
            detachPendingHandlers();

            pushLog(`✅ Данные получены: ${source.name}`);
            uiState.currentStatus = 'ready';
            uiState.statusLine = 'Канал готов, запускаю…';
            markSource(index, 'ready');
            tryPlay();
        };

        const onMeta = () => onReady();
        const onCanPlay = () => onReady();
        videoElement.addEventListener('loadedmetadata', onMeta);
        videoElement.addEventListener('canplay', onCanPlay);
        pendingHandlers.push(['loadedmetadata', onMeta], ['canplay', onCanPlay]);

        sourceLoadTimeout = setTimeout(() => {
            sourceLoadTimeout = null;
            if (!isLoaded) {
                pushLog(`⏱ Таймаут: ${source.name}`);
                markSource(index, 'failed');
                loadSource(index + 1);
            }
        }, 36000);

        if (source.type === 'mp4') {
            videoElement.src = source.url;
            videoElement.load();
        } else if (source.type === 'hls') {
            if (window.Hls && Hls.isSupported()) {
                const hls = new Hls({
                    maxBufferLength: 20,
                    maxMaxBufferLength: 40,
                    manifestLoadingTimeOut: 30000,
                    manifestLoadingMaxRetry: 2,
                    levelLoadingTimeOut:    30000,
                    levelLoadingMaxRetry:   2,
                    fragLoadingTimeOut:     60000,
                    fragLoadingMaxRetry:    3,
                    enableWorker: true,
                    lowLatencyMode: false
                });
                currentHls = hls;

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    pushLog('HLS: манифест разобран');
                    uiState.statusLine = 'Манифест разобран, буферизация…';
                });

                hls.on(Hls.Events.FRAG_LOADED, onReady);

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.warn(`HLS: ${data.type} / ${data.details} (fatal=${data.fatal})`);
                    if (data.fatal) {
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            pushLog('HLS: сетевая ошибка, переключаюсь');
                            markSource(index, 'failed');
                            loadSource(index + 1);
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            pushLog('HLS: ошибка медиа, пробую восстановить');
                            try { hls.recoverMediaError(); } catch (e) {
                                markSource(index, 'failed');
                                loadSource(index + 1);
                            }
                        } else {
                            pushLog('HLS: fatal ошибка');
                            markSource(index, 'failed');
                            loadSource(index + 1);
                        }
                    }
                });

                hls.loadSource(source.url);
                hls.attachMedia(videoElement);
            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                videoElement.src = source.url;
                videoElement.load();
            } else {
                pushLog('HLS не поддерживается');
                markSource(index, 'failed');
                loadSource(index + 1);
            }
        }
    }

    videoElement.addEventListener('playing', () => {
        isPlayingVideo = true;
        playHintEl.classList.add('hidden');
        uiState.currentStatus = 'playing';
        uiState.statusLine = `▶ ${sources[currentIndex].name}`;
        pushLog(`▶ Играет: ${sources[currentIndex].name}`);
        markSource(currentIndex, 'ready');
        showVideo();
    });

    videoElement.addEventListener('pause', () => {
        if (isPlayingVideo) {
            isPlayingVideo = false;
            showInfo();
        }
    });

    videoElement.addEventListener('waiting', () => {
        pushLog('Буферизация…');
    });

    videoElement.addEventListener('error', () => {
        if (!videoElement.currentSrc && !currentHls) return;
        const err = videoElement.error;
        pushLog(`Ошибка <video>: ${err ? err.code : '?'}`);
    });

    document.addEventListener('click', () => {
        if (videoElement.paused && videoElement.readyState >= 2) {
            tryPlay();
        }
    });

    // --------------------------------------------------------
    // КНОПКИ УПРАВЛЕНИЯ ВИДЕО
    // --------------------------------------------------------

    document.getElementById('vcPlay').addEventListener('click', () => {
        if (uiState.mode === 'video') {
            videoElement.play().catch(() => {});
            pushLog('▶️ HLS Play');
        } else {
            rutubePost('player:play');
            rutubePostRaw('play');
            pushLog('▶️ Rutube Play');
        }
    });

    document.getElementById('vcPause').addEventListener('click', () => {
        if (uiState.mode === 'video') {
            videoElement.pause();
            pushLog('⏸️ HLS Pause');
        } else {
            rutubePost('player:pause');
            rutubePostRaw('pause');
            pushLog('⏸️ Rutube Pause');
        }
    });

    document.getElementById('vcStop').addEventListener('click', () => {
        if (uiState.mode === 'video') {
            videoElement.pause();
            videoElement.currentTime = 0;
            pushLog('⏹️ HLS Stop');
        } else {
            rutubePost('player:stop');
            rutubePostRaw('stop');
            pushLog('⏹️ Rutube Stop');
        }
    });

    document.getElementById('vcBack10').addEventListener('click', () => {
        if (uiState.mode === 'video') {
            videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
            pushLog('⏪ HLS -10 сек');
        } else {
            rutubePost('player:relativeSeek', { time: -10 });
            rutubePost('player:seek', { time: -10 });
            pushLog('⏪ Rutube -10 сек');
        }
    });

    document.getElementById('vcFwd10').addEventListener('click', () => {
        if (uiState.mode === 'video') {
            videoElement.currentTime = Math.min(videoElement.duration || 0, videoElement.currentTime + 10);
            pushLog('⏩ HLS +10 сек');
        } else {
            rutubePost('player:relativeSeek', { time: 10 });
            rutubePost('player:seek', { time: 10 });
            pushLog('⏩ Rutube +10 сек');
        }
    });

    document.getElementById('vcFullscreen').addEventListener('click', () => {
        const target = document.body;
        if (!document.fullscreenElement) {
            if (target.requestFullscreen) target.requestFullscreen();
            else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
            else if (target.msRequestFullscreen) target.msRequestFullscreen();
            pushLog('⛶ Fullscreen ON');
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
            pushLog('⛶ Fullscreen OFF');
        }
    });

    document.addEventListener('fullscreenchange', () => setTimeout(resizeScene, 100));
    document.addEventListener('webkitfullscreenchange', () => setTimeout(resizeScene, 100));

    document.getElementById('vcClose').addEventListener('click', () => {
        videoControls.classList.remove('show');
        manageBtn.classList.remove('active');
        manageBtn.textContent = '🎮 УПРАВЛЯТЬ ВИДЕО';
        pushLog('Панель управления скрыта');
    });

    // --------------------------------------------------------
    // АДАПТАЦИЯ
    // --------------------------------------------------------
    window.addEventListener('resize', resizeScene);
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeScene, 50);
        setTimeout(resizeScene, 150);
        setTimeout(resizeScene, 400);
    });
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', resizeScene);
        window.visualViewport.addEventListener('scroll', resizeScene);
    }

    let lastW = window.innerWidth;
    let lastH = window.innerHeight;

    // --------------------------------------------------------
    // АНИМАЦИЯ
    // --------------------------------------------------------
    let clockTime = 0;

    function animate() {
        requestAnimationFrame(animate);
        clockTime += 0.016;

        const w = window.innerWidth;
        const h = window.innerHeight;
        if (w !== lastW || h !== lastH) {
            lastW = w;
            lastH = h;
            resizeScene();
        }

        if (uiState.mode === 'info') {
            uiState.spinner += 0.12;
            drawInfoPanel(clockTime);
            infoTexture.needsUpdate = true;
        }

        if (uiState.mode === 'video' && !videoElement.paused &&
            videoElement.readyState >= 2) {
            videoTexture.needsUpdate = true;
        }

        if (screenGlow) screenGlow.intensity = 1.0 + Math.sin(Date.now() * 0.002) * 0.15;
        controls.update();

        renderer.render(scene, camera);
        cssRenderer.render(scene, camera);
    }

    // --------------------------------------------------------
    // СТАРТ
    // --------------------------------------------------------
    loadSourcesFromFile();
    animate();
})();