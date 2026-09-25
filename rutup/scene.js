// ============================================================
// scene.js — сцена, свет, экран, звук, текстуры, инфо-панель
// (разделы 1–8 монолита, без изменений)
// ============================================================

// 1. СЦЕНА
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);
scene.fog = new THREE.FogExp2(0x050510, 0.017);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(12, 6, 22);
camera.lookAt(0, 4, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.domElement.id = 'webglCanvas';
document.body.appendChild(renderer.domElement);

const cssRenderer = new THREE.CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.id = 'css3dLayer';
document.body.appendChild(cssRenderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 5;
controls.maxDistance = 50;

// 2. СВЕТ
scene.add(new THREE.AmbientLight(0x303045, 0.45));

const moonLight = new THREE.DirectionalLight(0x8899bb, 0.5);
moonLight.position.set(-15, 25, -10);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 2048;
moonLight.shadow.mapSize.height = 2048;
moonLight.shadow.camera.left   = -50;
moonLight.shadow.camera.right  =  50;
moonLight.shadow.camera.top    =  50;
moonLight.shadow.camera.bottom = -50;
scene.add(moonLight);

const screenGlow = new THREE.PointLight(0xffaa55, 1.2, 40, 2);
screenGlow.position.set(0, 6, 5);
scene.add(screenGlow);

const spotLight = new THREE.SpotLight(0xffdd88, 1.5);
spotLight.position.set(8, 12, 10);
spotLight.target.position.set(0, 0, 0);
spotLight.angle = Math.PI / 5;
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
scene.add(spotLight);
scene.add(spotLight.target);

// 3. ЗЕМЛЯ
const groundCanvas = document.createElement('canvas');
groundCanvas.width = 1024;
groundCanvas.height = 1024;
const gctx = groundCanvas.getContext('2d');

const groundGrad = gctx.createRadialGradient(512, 512, 60, 512, 512, 480);
groundGrad.addColorStop(0.00, '#1e1e28');
groundGrad.addColorStop(0.20, '#15151e');
groundGrad.addColorStop(0.40, '#0e0e18');
groundGrad.addColorStop(0.58, '#09090f');
groundGrad.addColorStop(0.72, '#050510');
groundGrad.addColorStop(0.85, '#050510');
groundGrad.addColorStop(1.00, '#050510');

gctx.fillStyle = groundGrad;
gctx.fillRect(0, 0, 1024, 1024);

gctx.fillStyle = 'rgba(255,255,255,0.010)';
for (let i = 0; i < 3500; i++) {
    gctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1, 1);
}

const groundTexture = new THREE.CanvasTexture(groundCanvas);
groundTexture.encoding = THREE.sRGBEncoding;
groundTexture.minFilter = THREE.LinearFilter;
groundTexture.magFilter = THREE.LinearFilter;
groundTexture.generateMipmaps = false;

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(140, 140),
    new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 1.0,
        metalness: 0.0,
        color: 0xffffff
    })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
for (let i = -3; i <= 3; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.01, 12), lineMaterial);
    line.position.set(i * 5, 0.02, 0);
    line.receiveShadow = true;
    scene.add(line);
}

// 4. ЭКРАН + КАРКАС
const screenWidth = 16;
const screenHeight = 9;

const screenBacking = new THREE.Mesh(
    new THREE.PlaneGeometry(screenWidth, screenHeight),
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.FrontSide })
);
screenBacking.position.set(0, 5.5, 0.95);
scene.add(screenBacking);

const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6, metalness: 0.8 });

const topBar = new THREE.Mesh(new THREE.BoxGeometry(screenWidth + 1, 0.4, 0.4), frameMaterial);
topBar.position.set(0, 5.5 + screenHeight / 2 + 0.2, 1.3);
topBar.castShadow = true; scene.add(topBar);

const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(screenWidth + 1, 0.4, 0.4), frameMaterial);
bottomBar.position.set(0, 5.5 - screenHeight / 2 - 0.2, 1.3);
bottomBar.castShadow = true; scene.add(bottomBar);

const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 8, 8), frameMaterial);
leftPost.position.set(-screenWidth / 2 - 0.7, 4, 1.3);
leftPost.castShadow = true; scene.add(leftPost);

const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 8, 8), frameMaterial);
rightPost.position.set(screenWidth / 2 + 0.7, 4, 1.3);
rightPost.castShadow = true; scene.add(rightPost);

// 5. ИНФО-CANVAS
const infoCanvas = document.createElement('canvas');
infoCanvas.width = 1280;
infoCanvas.height = 720;
const ictx = infoCanvas.getContext('2d');

const infoTexture = new THREE.CanvasTexture(infoCanvas);
infoTexture.minFilter = THREE.LinearFilter;
infoTexture.magFilter = THREE.LinearFilter;
infoTexture.encoding = THREE.sRGBEncoding;

// 6. ВИДЕО + ЗВУК
const videoElement = document.getElementById('streamVideo');
videoElement.playsInline = true;
videoElement.loop = true;
videoElement.volume = 0.7;

const soundBtn    = document.getElementById('soundBtn');
const volumeWrap  = document.getElementById('volumeWrap');
const volumeSlider= document.getElementById('volumeSlider');
const volumeVal   = document.getElementById('volumeVal');
const manageBtn   = document.getElementById('manageBtn');
const videoControls = document.getElementById('videoControls');

let soundEnabled = false;
let userInteracted = false;

function updateSoundBtn() {
    if (soundEnabled) {
        soundBtn.textContent = '🔊';
        soundBtn.classList.remove('off');
        soundBtn.classList.add('on');
        soundBtn.title = 'Выключить звук';
    } else {
        soundBtn.textContent = '🔇';
        soundBtn.classList.remove('on');
        soundBtn.classList.add('off');
        soundBtn.title = 'Включить звук';
    }
}

function enableSound() {
    soundEnabled = true;
    videoElement.muted = false;
    videoElement.volume = parseFloat(volumeSlider.value);
    videoElement.play().catch(() => {});
    updateSoundBtn();
}

function disableSound() {
    soundEnabled = false;
    videoElement.muted = true;
    updateSoundBtn();
}

soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userInteracted = true;
    if (soundEnabled) {
        disableSound();
        volumeWrap.classList.remove('show');
    } else {
        enableSound();
        volumeWrap.classList.add('show');
    }
});

volumeSlider.addEventListener('input', () => {
    const v = parseFloat(volumeSlider.value);
    videoElement.volume = v;
    volumeVal.textContent = Math.round(v * 100) + '%';
    if (v > 0 && !soundEnabled) enableSound();
    if (v === 0) videoElement.muted = true;
    else if (soundEnabled) videoElement.muted = false;
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
        if (soundEnabled) disableSound();
        else enableSound();
    }
});

updateSoundBtn();

// 7. ТЕКСТУРЫ
const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBAFormat;
videoTexture.generateMipmaps = false;
videoTexture.encoding = THREE.sRGBEncoding;

const screenMaterial = new THREE.MeshBasicMaterial({
    map: infoTexture,
    side: THREE.FrontSide,
    toneMapped: false
});

const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(screenWidth, screenHeight), screenMaterial);
screenMesh.position.set(0, 5.5, 1.05);
scene.add(screenMesh);

// 8. СОСТОЯНИЕ UI
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
    ictx.font = 'bold 36px Arial';
    ictx.fillStyle = soundEnabled ? '#4dff9a' : '#ff5b5b';
    ictx.fillText(soundEnabled ? '🔊' : '🔇', 70, 145);
    ictx.fillStyle = '#aab6c8';
    ictx.font = '20px Arial';
    ictx.fillText(soundEnabled ? 'ЗВУК ВКЛ' : 'ЗВУК ВЫКЛ', 120, 152);

    ictx.fillStyle = '#aab6c8';
    ictx.font = '26px Arial';
    ictx.fillText('ТЕКУЩИЙ КАНАЛ:', 70, 195);

    ictx.fillStyle = '#ffffff';
    ictx.font = 'bold 42px Arial';
    ictx.fillText(uiState.currentName, 70, 235);

    const badgeColor = statusColor(uiState.currentStatus);
    ictx.fillStyle = badgeColor + '40';
    ictx.fillRect(W - 400, 215, 330, 60);
    ictx.strokeStyle = badgeColor;
    ictx.lineWidth = 4;
    ictx.strokeRect(W - 400, 215, 330, 60);
    ictx.fillStyle = badgeColor;
    ictx.font = 'bold 34px Arial';
    ictx.textAlign = 'center';
    ictx.fillText(statusLabel(uiState.currentStatus), W - 235, 230);

    if (uiState.currentStatus === 'loading') {
        const cx = W - 440;
        const cy = 245;
        ictx.strokeStyle = badgeColor;
        ictx.lineWidth = 6;
        ictx.beginPath();
        ictx.arc(cx, cy, 22, uiState.spinner, uiState.spinner + Math.PI * 1.4);
        ictx.stroke();
    }

    ictx.textAlign = 'left';
    ictx.fillStyle = '#d7e2f0';
    ictx.font = '28px Arial';
    ictx.fillText(uiState.statusLine, 70, 305);

    ictx.strokeStyle = 'rgba(120,200,255,0.25)';
    ictx.beginPath();
    ictx.moveTo(60, 355);
    ictx.lineTo(W - 60, 355);
    ictx.stroke();

    ictx.fillStyle = '#7ec8ff';
    ictx.font = 'bold 24px Arial';
    ictx.fillText('СПИСОК КАНАЛОВ:', 70, 375);

    const cols = 2;
    const colW = (W - 140) / cols;
    const rowH = 38;
    const startY = 408;

    uiState.sources.forEach((s, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 70 + col * colW;
        const y = startY + row * rowH;

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