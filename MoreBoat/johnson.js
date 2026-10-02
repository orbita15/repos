/* ============================================================
   ДЖОНСОН v2 — стоит на причале, спрашивает "Готов?",
   при ответе "Да" — кидает чёрную сумку на катер.
   ============================================================ */
(function () {
'use strict';

const G = window.GAME;
if (!G) { console.error('GAME not ready'); return; }

/* ============================================================
   0. UI — кнопки Да / Пока нет
   ============================================================ */
(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    #johnsonPrompt {
      position: fixed; left: 50%; bottom: 32vh;
      transform: translateX(-50%);
      display: flex; gap: 14px; z-index: 13;
      opacity: 0; pointer-events: none;
      transition: opacity .3s ease;
    }
    #johnsonPrompt.show { opacity: 1; pointer-events: auto; }
    .jBtn {
      padding: 14px 34px; border-radius: 26px;
      font-family: system-ui, sans-serif; font-size: 17px; font-weight: 700;
      letter-spacing: .6px; cursor: pointer; border: 2px solid rgba(255,255,255,.35);
      -webkit-tap-highlight-color: transparent;
      transition: transform .15s ease;
      box-shadow: 0 8px 22px rgba(0,0,0,.45);
      color: #fff;
    }
    .jBtn:active { transform: scale(.94); }
    .jBtn.yes { background: linear-gradient(135deg, #2ecc71, #1e8449); }
    .jBtn.no  { background: linear-gradient(135deg, #e74c3c, #a93226); }
  `;
  document.head.appendChild(s);

  const w = document.createElement('div');
  w.id = 'johnsonPrompt';
  w.innerHTML = `
    <button class="jBtn yes" id="johnsonYes">Да</button>
    <button class="jBtn no"  id="johnsonNo">Пока нет</button>
  `;
  document.body.appendChild(w);
})();

const promptEl = document.getElementById('johnsonPrompt');
const yesBtn   = document.getElementById('johnsonYes');
const noBtn    = document.getElementById('johnsonNo');

/* ============================================================
   1. ДЖОНСОН — модель
   ============================================================ */
function buildJohnson() {
  const johnson = new THREE.Group();
  johnson.rotation.order = 'YXZ';

  const skin     = new THREE.MeshStandardMaterial({ color: 0xd9a67a, roughness: 0.85 });
  const skinDark = new THREE.MeshStandardMaterial({ color: 0xc48f63, roughness: 0.85 });
  const shirt    = new THREE.MeshStandardMaterial({ color: 0xc0281e, roughness: 0.78 });
  const shirtDk  = new THREE.MeshStandardMaterial({ color: 0x8c1a13, roughness: 0.78 });
  const jeans    = new THREE.MeshStandardMaterial({ color: 0x2c4a78, roughness: 0.85 });
  const jeansDk  = new THREE.MeshStandardMaterial({ color: 0x1e3356, roughness: 0.85 });
  const bootMat  = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.9 });
  const bagMat   = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.55 });
  const bagStrap = new THREE.MeshStandardMaterial({ color: 0x2a2b30, roughness: 0.7 });
  const hairMat  = new THREE.MeshStandardMaterial({ color: 0x2e1d12, roughness: 0.95 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.5 });
  const eyeIris  = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.6 });

  // --- НОГИ ---
  const legGeo = new THREE.BoxGeometry(0.24, 0.92, 0.26);
  const legL = new THREE.Mesh(legGeo, jeans); legL.position.set(-0.16, 0.46, 0);
  const legR = legL.clone(); legR.position.x = 0.16;
  johnson.add(legL, legR);

  const kneeGeo = new THREE.BoxGeometry(0.25, 0.05, 0.27);
  const kL = new THREE.Mesh(kneeGeo, jeansDk); kL.position.set(-0.16, 0.46, 0.005);
  const kR = kL.clone(); kR.position.x = 0.16;
  johnson.add(kL, kR);

  // --- ОБУВЬ ---
  const bootGeo = new THREE.BoxGeometry(0.28, 0.16, 0.42);
  const bL = new THREE.Mesh(bootGeo, bootMat); bL.position.set(-0.16, 0.08, 0.06);
  const bR = bL.clone(); bR.position.x = 0.16;
  johnson.add(bL, bR);

  // --- ТОРС ---
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.82, 0.34), shirt);
  torso.position.set(0, 1.28, 0);
  johnson.add(torso);

  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.02), shirtDk);
  placket.position.set(0, 1.28, 0.18);
  johnson.add(placket);

  const btnGeo = new THREE.SphereGeometry(0.022, 8, 6);
  const btnMat = new THREE.MeshStandardMaterial({ color: 0xf0e8c0, roughness: 0.5 });
  for (let i = -2; i <= 2; i++) {
    const b = new THREE.Mesh(btnGeo, btnMat);
    b.position.set(0, 1.28 + i * 0.14, 0.19);
    johnson.add(b);
  }

  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.38), shirtDk);
  collar.position.set(0, 1.68, 0.02);
  johnson.add(collar);

  // --- РУКИ (как группы с pivot в плече) ---
  function makeArm(side) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.44, 1.62, 0);  // плечо
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.52, 0.22), shirt);
    sleeve.position.y = -0.26;
    arm.add(sleeve);
    const fore = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.48, 0.19), skin);
    fore.position.y = -0.76;
    arm.add(fore);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.18), skin);
    hand.position.y = -1.06;
    arm.add(hand);
    return arm;
  }

  const armL = makeArm(-1);
  const armR = makeArm(1);
  johnson.add(armL, armR);

  // --- ШЕЯ / ГОЛОВА ---
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.12, 10), skin);
  neck.position.set(0, 1.76, 0);
  johnson.add(neck);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.34), skin);
  head.position.set(0, 2.00, 0);
  johnson.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.14, 0.37), hairMat);
  hair.position.set(0, 2.19, 0);
  johnson.add(hair);

  const hairL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.34), hairMat);
  hairL.position.set(-0.185, 2.08, 0);
  const hairR = hairL.clone(); hairR.position.x = 0.185;
  johnson.add(hairL, hairR);

  // Борода
  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.24, 0.30), hairMat);
  beard.position.set(0, 1.80, 0.02);
  johnson.add(beard);

  const beardTaper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.20), hairMat);
  beardTaper.position.set(0, 1.68, 0.03);
  johnson.add(beardTaper);

  const burnL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.18, 0.26), hairMat);
  burnL.position.set(-0.155, 1.90, 0.02);
  const burnR = burnL.clone(); burnR.position.x = 0.155;
  johnson.add(burnL, burnR);

  // Усы
  const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.08), hairMat);
  mustache.position.set(0, 1.90, 0.18);
  johnson.add(mustache);
  const mustTipL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.06), hairMat);
  mustTipL.position.set(-0.13, 1.89, 0.16);
  const mustTipR = mustTipL.clone(); mustTipR.position.x = 0.13;
  johnson.add(mustTipL, mustTipR);

  // Глаза
  const eyeLW = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), eyeWhite);
  eyeLW.position.set(-0.08, 2.04, 0.17);
  const eyeRW = eyeLW.clone(); eyeRW.position.x = 0.08;
  johnson.add(eyeLW, eyeRW);

  const irisL = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), eyeIris);
  irisL.position.set(-0.08, 2.04, 0.205);
  const irisR = irisL.clone(); irisR.position.x = 0.08;
  johnson.add(irisL, irisR);

  const browL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.03), hairMat);
  browL.position.set(-0.08, 2.11, 0.18);
  const browR = browL.clone(); browR.position.x = 0.08;
  johnson.add(browL, browR);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.10), skinDark);
  nose.position.set(0, 1.98, 0.19);
  johnson.add(nose);

  // --- ЧЁРНАЯ СУМКА в правой руке ---
  const bagGroup = new THREE.Group();
  bagGroup.position.set(0, -1.22, 0.10);

  const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.34, 0.16), bagMat);
  bagGroup.add(bagBody);

  const bagFlap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.18), bagStrap);
  bagFlap.position.y = 0.16;
  bagGroup.add(bagFlap);

  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.018, 6, 14, Math.PI),
    bagStrap
  );
  handle.rotation.x = -Math.PI / 2;
  handle.position.y = 0.22;
  bagGroup.add(handle);

  const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.02), bagStrap);
  clasp.position.set(0, 0.05, 0.085);
  bagGroup.add(clasp);

  armR.add(bagGroup);

  // Плечи
  const shL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.30), shirt);
  shL.position.set(-0.34, 1.62, 0);
  const shR = shL.clone(); shR.position.x = 0.34;
  johnson.add(shL, shR);

  // Сохраним ссылки
  johnson.userData.armR = armR;
  johnson.userData.armL = armL;
  johnson.userData.bagGroup = bagGroup;

  return johnson;
}

/* ============================================================
   2. РАЗМЕЩЕНИЕ
   ============================================================ */
const JOHNSON_LOCAL = new THREE.Vector3(30, 1.9, 72);
const JOHNSON_FACING_INIT = 0;

const johnson = buildJohnson();
johnson.position.copy(JOHNSON_LOCAL);
johnson.rotation.y = JOHNSON_FACING_INIT;
G.islandGroup.add(johnson);

window.johnson = johnson;

const johnsonWorld = new THREE.Vector3();
G.islandGroup.localToWorld(johnsonWorld.copy(JOHNSON_LOCAL));
window.GAME.johnsonMarker = { x: johnsonWorld.x, z: johnsonWorld.z };

const armR = johnson.userData.armR;
const bagGroup = johnson.userData.bagGroup;

/* ============================================================
   3. СОСТОЯНИЯ
   ============================================================ */
const State = {
  WAITING:  'waiting',
  ASKING:   'asking',
  THROWING: 'throwing',
  DONE:     'done'
};

let state = State.WAITING;
let stateTime = 0;
let triggerDistance = 18;
let cooldown = 0;
let bagDelivered = false;

// полёт сумки
let flyingBag = null;
let flyStart = null;
let flyTime = 0;
const FLY_DURATION = 1.25;

const _v3a = new THREE.Vector3();
const _v3b = new THREE.Vector3();

/* ============================================================
   4. UI — показать / спрятать кнопки
   ============================================================ */
function showPrompt() { promptEl.classList.add('show'); }
function hidePrompt() { promptEl.classList.remove('show'); }

yesBtn.addEventListener('click', function () {
  if (state !== State.ASKING) return;
  hidePrompt();
  startThrow();
});

noBtn.addEventListener('click', function () {
  if (state !== State.ASKING) return;
  hidePrompt();
  showDialog('Ладно, подожду.', 2.5);
  cooldown = 6;
  state = State.WAITING;
  stateTime = 0;
});

/* ============================================================
   5. БРОСОК СУМКИ
   ============================================================ */
function startThrow() {
  // Скрываем сумку из руки
  bagGroup.visible = false;

  // Клонируем в сцену
  flyingBag = bagGroup.clone(true);
  flyingBag.visible = true;
  flyingBag.rotation.set(0, 0, 0);

  // Стартовая позиция — мировая позиция руки Джонсона
  flyStart = new THREE.Vector3();
  bagGroup.getWorldPosition(flyStart);

  flyingBag.position.copy(flyStart);
  G.scene.add(flyingBag);

  flyTime = 0;
  state = State.THROWING;
  stateTime = 0;

  showDialog('Держи!', 1.4);
}

function updateFly(dt) {
  if (!flyingBag || !flyStart) return;

  flyTime += dt;
  const t = Math.min(flyTime / FLY_DURATION, 1);

  // Целевая точка — над палубой катера (в мировых координатах)
  // Локальная точка на катере: (0, 1.0, 1.0) — носовая палуба
  _v3b.set(0, 1.0, 1.0);
  G.boat.localToWorld(_v3b);

  // Интерполяция позиции
  _v3a.copy(flyStart).lerp(_v3b, t);

  // Дуга полёта — парабола
  const arc = Math.sin(Math.PI * t) * 3.5;

  flyingBag.position.set(_v3a.x, _v3a.y + arc, _v3a.z);

  // Вращение в полёте
  flyingBag.rotation.x += dt * 6.5;
  flyingBag.rotation.z += dt * 4.2;

  // Приземление
  if (t >= 1) {
    G.scene.remove(flyingBag);
    G.boat.add(flyingBag);

    // Локальная позиция сумки на палубе
    flyingBag.position.set(0, 0.80, 1.0);
    flyingBag.rotation.set(Math.PI / 2, 0, 0);

    flyingBag = null;
    flyStart = null;

    bagDelivered = true;
    state = State.DONE;
    stateTime = 0;

    setTimeout(function () { showDialog('Сумка твоя. Удачи, капитан!', 4); }, 600);
  }
}

/* ============================================================
   6. ТИК
   ============================================================ */
window.johnsonTick = function (dt, time, boatPos, heading, speed, islandGroup) {
  stateTime += dt;
  if (cooldown > 0) cooldown -= dt;

  const localBoat = islandGroup.worldToLocal(new THREE.Vector3(boatPos.x, boatPos.y, boatPos.z));
  const dx = localBoat.x - JOHNSON_LOCAL.x;
  const dz = localBoat.z - JOHNSON_LOCAL.z;
  const dist = Math.hypot(dx, dz);
  const near = dist < triggerDistance;
  const desiredYaw = Math.atan2(dx, dz);

  switch (state) {

    case State.WAITING: {
      const bob = Math.sin(time * 1.6) * 0.015;
      johnson.position.y = JOHNSON_LOCAL.y + bob;
      johnson.rotation.z = Math.sin(time * 0.9) * 0.012;
      // руки расслаблены
      armR.rotation.x *= Math.pow(0.1, dt);
      armL.rotation.x *= Math.pow(0.1, dt);

      if (near && !bagDelivered && cooldown <= 0) {
        state = State.ASKING;
        stateTime = 0;
        showDialog('Ну что, готов?', 4.5);
        showPrompt();
      }
      break;
    }

    case State.ASKING: {
      // поворот к катеру
      johnson.rotation.y = smoothTurn(johnson.rotation.y, desiredYaw, dt * 4);

      // если катер уплыл — отмена
      if (dist > triggerDistance + 6) {
        hidePrompt();
        state = State.WAITING;
        stateTime = 0;
      }
      break;
    }

    case State.THROWING: {
      // поворот к катеру
      johnson.rotation.y = smoothTurn(johnson.rotation.y, desiredYaw, dt * 5);

      // анимация замаха правой рукой
      const t = Math.min(stateTime / 0.45, 1);
      // Замах: поднимаем руку за 0.45 сек
      armR.rotation.x = -1.8 * t * t;   // поднимаем вверх
      armR.rotation.z = -0.4 * t;

      // Обновляем полёт
      updateFly(dt);
      break;
    }

    case State.DONE: {
      // рука опускается обратно
      armR.rotation.x *= Math.pow(0.1, dt);
      armR.rotation.z *= Math.pow(0.1, dt);

      // смотрит на катер
      if (dist < 40) {
        johnson.rotation.y = smoothTurn(johnson.rotation.y, desiredYaw, dt * 1.5);
      } else {
        // катер уплыл далеко — разворот к морю
        johnson.rotation.y = smoothTurn(johnson.rotation.y, JOHNSON_FACING_INIT, dt * 1.2);
      }
      break;
    }
  }
};

/* ============================================================
   7. ДИАЛОГ
   ============================================================ */
const dialogEl = document.getElementById('dialog');
const dialogText = document.getElementById('dialogText');
let dialogTimer = null;

function showDialog(text, duration) {
  if (!dialogEl || !dialogText) return;
  dialogText.textContent = text;
  dialogEl.classList.add('show');
  if (dialogTimer) clearTimeout(dialogTimer);
  dialogTimer = setTimeout(function () {
    dialogEl.classList.remove('show');
  }, (duration || 3) * 1000);
}

/* ============================================================
   ХЕЛПЕРЫ
   ============================================================ */
function shortestAngle(from, to) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
function smoothTurn(cur, tgt, f) {
  return cur + shortestAngle(cur, tgt) * Math.min(1, f);
}

window.Johnson = {
  get state() { return state; },
  get position() { return johnson.position.clone(); },
  showDialog,
  reset: function () {
    bagDelivered = false;
    bagGroup.visible = true;
    state = State.WAITING;
    hidePrompt();
  }
};

})();