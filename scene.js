// ============================================================
// scene.js — 3D-сцена
// Экспортирует window.PARKING_SCENE
// ============================================================

(function () {
    'use strict';

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

    scene.add(new THREE.AmbientLight(0x303045, 0.45));

    const moonLight = new THREE.DirectionalLight(0x8899bb, 0.5);
    moonLight.position.set(-15, 25, -10);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.left = -50;
    moonLight.shadow.camera.right = 50;
    moonLight.shadow.camera.top = 50;
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

    // Земля
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
    for (let i = 0; i < 3500; i++) gctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1, 1);

    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.encoding = THREE.sRGBEncoding;
    groundTexture.minFilter = THREE.LinearFilter;
    groundTexture.magFilter = THREE.LinearFilter;
    groundTexture.generateMipmaps = false;

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(140, 140),
        new THREE.MeshStandardMaterial({ map: groundTexture, roughness: 1.0, metalness: 0.0, color: 0xffffff })
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

    const screenMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.FrontSide,
        toneMapped: false
    });

    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(screenWidth, screenHeight), screenMaterial);
    screenMesh.position.set(0, 5.5, 1.05);
    scene.add(screenMesh);

    // Машины
    function createCar(color, x, z, rotationY) {
        rotationY = rotationY || 0;
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

    // Фонари
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

    // Звёзды
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

    // Луна
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(3, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xeeddcc })
    );
    moon.position.set(-60, 50, -80);
    scene.add(moon);

    // Деревья/кусты
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.95 });
    const leafMatDeciduous = new THREE.MeshStandardMaterial({ color: 0x1e4a1e, roughness: 0.95 });
    const leafMatFir = new THREE.MeshStandardMaterial({ color: 0x153515, roughness: 0.95 });

    function createTree(x, z, scale) {
        scale = scale || 1;
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

    function createFir(x, z, scale) {
        scale = scale || 1;
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

    function createBush(x, z, scale) {
        scale = scale || 1;
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

    function resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h);
        cssRenderer.setSize(w, h);
    }

    window.PARKING_SCENE = {
        scene, camera, renderer, cssRenderer, controls,
        screenWidth, screenHeight, screenMesh, screenMaterial, screenGlow,
        resize
    };
})();