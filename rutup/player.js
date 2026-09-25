// ============================================================
// player.js — каналы, меню, iframe, HLS, анимация
// (разделы 9–16 монолита, без изменений)
// ============================================================

// 9. КАНАЛЫ
const playHint = document.getElementById('playHint');
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const channelMenu = document.getElementById('channelMenu');
const channelList = document.getElementById('channelList');
const menuOverlay = document.getElementById('menuOverlay');

// (sources объявлен в sources.js — он загружается до этого файла)

const IFRAME_COUNT = 6;
const RUS_COUNT = 8;

function buildChannelMenu() {
    channelList.innerHTML = '';

    const h0 = document.createElement('div');
    h0.className = 'channelGroup';
    h0.textContent = '🎬 Rutube';
    channelList.appendChild(h0);

    sources.forEach((src, i) => {
        if (i === IFRAME_COUNT) {
            const h1 = document.createElement('div');
            h1.className = 'channelGroup';
            h1.textContent = '🇷🇺 Российские';
            channelList.appendChild(h1);
        }
        if (i === IFRAME_COUNT + RUS_COUNT) {
            const h2 = document.createElement('div');
            h2.className = 'channelGroup';
            h2.textContent = '🌍 Международные';
            channelList.appendChild(h2);
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
        type.textContent = src.type.toUpperCase();

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

uiState.sources = sources.map(s => ({ name: s.name, status: 'waiting' }));

// 10. CSS3D — IFRAME НА ЭКРАНЕ
let currentIframe     = null;
let currentIframeObj  = null;
let iframeInteractive = false;
let iframeReady       = false;

const IFRAME_W = 1280;
const IFRAME_H = 720;

function createIframeObject(url) {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width  = IFRAME_W + 'px';
    iframe.style.height = IFRAME_H + 'px';
    iframe.style.border = 'none';
    iframe.style.background = '#000';
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
    iframeInteractive = false;
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
    iframeInteractive = false;
    iframeReady = false;
    screenMesh.visible = true;
    videoControls.classList.remove('show');
}

manageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!currentIframe) return;

    iframeInteractive = !iframeInteractive;
    if (iframeInteractive) {
        currentIframe.style.pointerEvents = 'auto';
        manageBtn.classList.add('active');
        manageBtn.textContent = '✕ ВЫЙТИ ИЗ УПРАВЛЕНИЯ';
        controls.enabled = false;
        videoControls.classList.add('show');
        pushLog('🎮 Управление iframe включено (камера заблокирована)');
    } else {
        currentIframe.style.pointerEvents = 'none';
        manageBtn.classList.remove('active');
        manageBtn.textContent = '🎮 УПРАВЛЯТЬ ВИДЕО';
        controls.enabled = true;
        videoControls.classList.remove('show');
        pushLog('🎥 Управление iframe выключено (камера активна)');
    }
});

// 10.1. СОБЫТИЯ ОТ RUTUBE
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

    if (type === 'player:ready' || type === 'player:play' ||
        type === 'player:pause' || type === 'player:stop') {
        console.log('[Rutube]', type, event.data);
    }

    if (type === 'player:ready') {
        iframeReady = true;
        pushLog('✅ Rutube готов к командам');
    }
});

// 10.2. КНОПКИ УПРАВЛЕНИЯ
function sendRutube(command, data) {
    if (!currentIframe || !currentIframe.contentWindow) return false;
    const msg = data
        ? JSON.stringify({ type: command, data: data })
        : JSON.stringify({ type: command });
    try {
        currentIframe.contentWindow.postMessage(msg, '*');
        return true;
    } catch (e) {
        console.warn('postMessage error:', e);
        return false;
    }
}

document.getElementById('vcPlay').addEventListener('click', () => {
    if (uiState.mode === 'video') {
        videoElement.play().catch(() => {});
        pushLog('▶️ HLS Play');
    } else {
        sendRutube('player:play');
        pushLog('▶️ Rutube Play');
    }
});

document.getElementById('vcPause').addEventListener('click', () => {
    if (uiState.mode === 'video') {
        videoElement.pause();
        pushLog('⏸️ HLS Pause');
    } else {
        sendRutube('player:pause');
        pushLog('⏸️ Rutube Pause');
    }
});

document.getElementById('vcStop').addEventListener('click', () => {
    if (uiState.mode === 'video') {
        videoElement.pause();
        videoElement.currentTime = 0;
        pushLog('⏹️ HLS Stop');
    } else {
        sendRutube('player:stop');
        pushLog('⏹️ Rutube Stop');
    }
});

document.getElementById('vcBack10').addEventListener('click', () => {
    if (uiState.mode === 'video') {
        videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
        pushLog('⏪ HLS -10 сек');
    } else {
        sendRutube('player:relativeSeek', { time: -10 });
        pushLog('⏪ Rutube -10 сек');
    }
});

document.getElementById('vcFwd10').addEventListener('click', () => {
    if (uiState.mode === 'video') {
        videoElement.currentTime = Math.min(videoElement.duration || 0, videoElement.currentTime + 10);
        pushLog('⏩ HLS +10 сек');
    } else {
        sendRutube('player:relativeSeek', { time: 10 });
        pushLog('⏩ Rutube +10 сек');
    }
});

document.getElementById('vcVolDown').addEventListener('click', () => {
    if (uiState.mode === 'video') {
        videoElement.volume = Math.max(0, videoElement.volume - 0.1);
        volumeSlider.value = videoElement.volume;
        volumeVal.textContent = Math.round(videoElement.volume * 100) + '%';
        pushLog('🔉 HLS Тише');
    } else {
        sendRutube('player:setVolume', { volume: 30 });
        pushLog('🔉 Rutube Тише');
    }
});

document.getElementById('vcVolUp').addEventListener('click', () => {
    if (uiState.mode === 'video') {
        videoElement.volume = Math.min(1, videoElement.volume + 0.1);
        volumeSlider.value = videoElement.volume;
        volumeVal.textContent = Math.round(videoElement.volume * 100) + '%';
        pushLog('🔊 HLS Громче');
    } else {
        sendRutube('player:setVolume', { volume: 80 });
        pushLog('🔊 Rutube Громче');
    }
});

document.getElementById('vcMute').addEventListener('click', () => {
    if (uiState.mode === 'video') {
        if (soundEnabled) disableSound(); else enableSound();
        pushLog('🔇 HLS Mute toggle');
    } else {
        sendRutube('player:mute');
        pushLog('🔇 Rutube Mute');
    }
});

document.getElementById('vcFullscreen').addEventListener('click', () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
});

document.getElementById('vcClose').addEventListener('click', () => {
    manageBtn.click();
});

// 11. ЛОГИКА ЗАГРУЗКИ КАНАЛОВ
let currentHls = null;
let currentIndex = 0;
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
    if (soundEnabled && userInteracted) {
        videoElement.muted = false;
    } else if (!userInteracted) {
        videoElement.muted = true;
    }

    const p = videoElement.play();
    if (p && p.catch) {
        p.catch(err => {
            console.warn('play() failed:', err.name);
            if (!videoElement.muted) {
                videoElement.muted = true;
                soundEnabled = false;
                updateSoundBtn();
                videoElement.play().catch(e2 => {
                    console.warn('play() muted also failed:', e2.name);
                    uiState.statusLine = 'Нажмите для запуска';
                    playHint.classList.remove('hidden');
                });
            } else {
                uiState.statusLine = 'Нажмите для запуска';
                playHint.classList.remove('hidden');
            }
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
            playHint.classList.add('hidden');
            pushLog(`▶ Rutube загружен: ${source.name}`);
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

    if (source.type === 'hls') {
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
    playHint.classList.add('hidden');
    uiState.currentStatus = 'playing';
    uiState.statusLine = `▶ ${sources[currentIndex].name}`;
    pushLog(`▶ Играет: ${sources[currentIndex].name}${videoElement.muted ? ' (без звука)' : ''}`);
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
    if (!userInteracted) {
        userInteracted = true;

        if (!soundEnabled) {
            enableSound();
            volumeWrap.classList.add('show');
            setTimeout(() => volumeWrap.classList.remove('show'), 8000);
        }

        if (videoElement.paused && videoElement.readyState >= 2) {
            tryPlay();
        }
    }
});

buildChannelMenu();
loadSource(0);

// 12. МАШИНЫ
function createCar(color, x, z, rotationY = 0) {
    const carGroup = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.6, 4.2),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.6 })
    );
    body.position.y = 0.5; body.castShadow = true; body.receiveShadow = true;
    carGroup.add(body);

    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.5, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.3 })
    );
    cabin.position.set(0, 1.0, -0.3); cabin.castShadow = true;
    carGroup.add(cabin);

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
    [[-0.9, 0.35, 1.4], [0.9, 0.35, 1.4], [-0.9, 0.35, -1.4], [0.9, 0.35, -1.4]].forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.castShadow = true;
        carGroup.add(wheel);
    });

    const headlightMat = new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 0.8 });
    const headlightGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const hl1 = new THREE.Mesh(headlightGeo, headlightMat);
    hl1.position.set(-0.6, 0.55, 2.1); carGroup.add(hl1);
    const hl2 = new THREE.Mesh(headlightGeo, headlightMat);
    hl2.position.set(0.6, 0.55, 2.1); carGroup.add(hl2);

    carGroup.position.set(x, 0, z);
    carGroup.rotation.y = rotationY;
    return carGroup;
}

const carColors = [0xaa2222, 0x2244aa, 0x22aa44, 0xcccccc, 0x8844aa, 0xcc6622];
const carPositions = [
    { x: -8, z: 8, ry: 0.1 }, { x: -3, z: 9, ry: -0.05 },
    { x: 3, z: 8.5, ry: 0.05 }, { x: 8, z: 9, ry: -0.1 },
    { x: -9, z: 14, ry: 0.2 }, { x: 9, z: 13, ry: -0.15 }
];

carPositions.forEach((pos, i) => {
    scene.add(createCar(carColors[i % carColors.length], pos.x, pos.z, pos.ry));
});

// 13. ФОНАРИ / ЗВЁЗДЫ / ЛУНА
function createStreetLamp(x, z) {
    const lampGroup = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5, metalness: 0.8 });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 8, 8), poleMat);
    pole.position.y = 4; pole.castShadow = true; lampGroup.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.5), poleMat);
    arm.position.set(0, 7.8, 0.7); lampGroup.add(arm);

    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffeedd, emissive: 0xffcc88, emissiveIntensity: 1.5 })
    );
    bulb.position.set(0, 7.8, 1.4); lampGroup.add(bulb);

    const lampLight = new THREE.PointLight(0xffcc88, 0.8, 20, 2);
    lampLight.position.set(0, 7.8, 1.4); lampGroup.add(lampLight);

    lampGroup.position.set(x, 0, z);
    return lampGroup;
}

scene.add(createStreetLamp(-14, 5));
scene.add(createStreetLamp(14, 5));
scene.add(createStreetLamp(-14, 18));
scene.add(createStreetLamp(14, 18));

const starGeometry = new THREE.BufferGeometry();
const starCount = 1500;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 400;
    starPositions[i + 1] = Math.random() * 100 + 20;
    starPositions[i + 2] = (Math.random() - 0.5) * 400;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8
})));

const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xeeddcc })
);
moon.position.set(-60, 50, -80);
scene.add(moon);

// 14. ДЕРЕВЬЯ И КУСТЫ
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.95 });
const leafMatDeciduous = new THREE.MeshStandardMaterial({ color: 0x1e4a1e, roughness: 0.95 });
const leafMatFir = new THREE.MeshStandardMaterial({ color: 0x153515, roughness: 0.95 });

function createTree(x, z, scale = 1) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3, 6), trunkMat);
    trunk.position.y = 1.5; trunk.castShadow = true; trunk.receiveShadow = true; group.add(trunk);

    const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 6), leafMatDeciduous);
    leaf1.position.y = 3.8; leaf1.castShadow = true; group.add(leaf1);
    const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 6), leafMatDeciduous);
    leaf2.position.set(0.7, 4.6, 0.3); leaf2.castShadow = true; group.add(leaf2);
    const leaf3 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), leafMatDeciduous);
    leaf3.position.set(-0.6, 4.9, -0.4); leaf3.castShadow = true; group.add(leaf3);

    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    group.rotation.y = Math.random() * Math.PI * 2;
    return group;
}

function createFir(x, z, scale = 1) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 2, 6), trunkMat);
    trunk.position.y = 1; trunk.castShadow = true; group.add(trunk);

    [{ r: 2.0, h: 2.5, y: 2.6 }, { r: 1.5, h: 2.0, y: 4.1 }, { r: 1.0, h: 1.6, y: 5.3 }].forEach(l => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(l.r, l.h, 8), leafMatFir);
        cone.position.y = l.y; cone.castShadow = true; group.add(cone);
    });

    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    group.rotation.y = Math.random() * Math.PI * 2;
    return group;
}

function createBush(x, z, scale = 1) {
    const group = new THREE.Group();
    [{ r: 0.9, x: 0, y: 0.8, z: 0 }, { r: 0.7, x: 0.7, y: 0.7, z: 0.2 },
     { r: 0.6, x: -0.5, y: 0.6, z: 0.5 }, { r: 0.5, x: 0.2, y: 0.9, z: -0.6 }].forEach(s => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(s.r, 6, 5), leafMatDeciduous);
        m.position.set(s.x, s.y, s.z); m.castShadow = true; m.receiveShadow = true; group.add(m);
    });
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    group.rotation.y = Math.random() * Math.PI * 2;
    return group;
}

const treePositions = [
    [-26, -18, 1.3, 'fir'], [-18, -23, 1.1, 'fir'],
    [-10, -26, 1.4, 'fir'], [-2,  -29, 1.2, 'broad'],
    [6,   -26, 1.3, 'fir'], [14,  -23, 1.0, 'broad'],
    [22,  -21, 1.2, 'fir'], [30,  -16, 1.1, 'broad'],
    [-30, -10, 1.2, 'broad'], [-33, -2, 1.4, 'fir'],
    [-35,  8,  1.1, 'broad'], [-32, 16, 1.3, 'fir'],
    [-30,  24, 1.0, 'broad'], [-28, 32, 1.2, 'fir'],
    [30,  -10, 1.3, 'broad'], [33, -2,  1.1, 'fir'],
    [35,   8,  1.4, 'broad'], [32, 16,  1.2, 'fir'],
    [30,   24, 1.1, 'broad'], [28, 32,  1.3, 'fir'],
    [-22, 36, 1.2, 'broad'], [-12, 38, 1.0, 'fir'],
    [0,   40, 1.3, 'broad'], [12,  38, 1.1, 'fir'],
    [22,  36, 1.2, 'broad']
];

treePositions.forEach(([x, z, s, type]) => {
    if (type === 'fir') scene.add(createFir(x, z, s));
    else scene.add(createTree(x, z, s));
});

const bushPositions = [
    [-22, -15, 1.0], [-15, -20, 0.9], [-7, -23, 1.1], [1, -26, 0.8],
    [10, -22, 1.0], [18, -19, 0.9], [26, -17, 1.1],
    [-27, -6, 1.0], [-28, 4, 0.9], [-27, 12, 1.1], [-26, 20, 1.0], [-25, 28, 0.9],
    [27, -6, 1.1], [28, 4, 1.0], [27, 12, 0.9], [26, 20, 1.1], [25, 28, 1.0],
    [-18, 34, 0.9], [-6, 36, 1.1], [6, 37, 1.0], [18, 34, 1.1]
];

bushPositions.forEach(([x, z, s]) => {
    scene.add(createBush(x, z, s));
});

// 15. АДАПТАЦИЯ
function resizeRenderer() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w === 0 || h === 0) return;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    cssRenderer.setSize(w, h);
}

window.addEventListener('resize', resizeRenderer);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeRenderer, 50);
    setTimeout(resizeRenderer, 150);
    setTimeout(resizeRenderer, 400);
});
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeRenderer);
    window.visualViewport.addEventListener('scroll', resizeRenderer);
}

let lastW = window.innerWidth;
let lastH = window.innerHeight;

// 16. АНИМАЦИЯ
let clockTime = 0;

function animate() {
    requestAnimationFrame(animate);
    clockTime += 0.016;

    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w !== lastW || h !== lastH) {
        lastW = w;
        lastH = h;
        resizeRenderer();
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

    screenGlow.intensity = 1.0 + Math.sin(Date.now() * 0.002) * 0.15;
    controls.update();

    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
}
animate();