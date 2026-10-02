/* ============================================================
   ДЖОНСОН v3 — защищённая версия, ошибки не валят игру.
   ============================================================ */
(function () {
'use strict';

const G = window.GAME;
if (!G) { console.warn('[Johnson] GAME не готов'); return; }

try {

/* ---------- UI: кнопки Да / Пока нет ---------- */
(function injectUI() {
  if (document.getElementById('johnsonPrompt')) return;
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
  w.innerHTML = '<button class="jBtn yes" id="johnsonYes">Да</button><button class="jBtn no" id="johnsonNo">Пока нет</button>';
  document.body.appendChild(w);
})();

const promptEl = document.getElementById('johnsonPrompt');
const yesBtn   = document.getElementById('johnsonYes');
const noBtn    = document.getElementById('johnsonNo');

/* ---------- Модель Джонсона ---------- */
function buildJohnson() {
  const j = new THREE.Group();
  j.rotation.order = 'YXZ';

  const skin    = new THREE.MeshStandardMaterial({ color: 0xd9a67a, roughness: 0.85 });
  const skinDk  = new THREE.MeshStandardMaterial({ color: 0xc48f63, roughness: 0.85 });
  const shirt   = new THREE.MeshStandardMaterial({ color: 0xc0281e, roughness: 0.78 });
  const shirtDk = new THREE.MeshStandardMaterial({ color: 0x8c1a13, roughness: 0.78 });
  const jeans   = new THREE.MeshStandardMaterial({ color: 0x2c4a78, roughness: 0.85 });
  const boot    = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.9 });
  const bagMat  = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.55 });
  const strap   = new THREE.MeshStandardMaterial({ color: 0x2a2b30, roughness: 0.7 });
  const hair    = new THREE.MeshStandardMaterial({ color: 0x2e1d12, roughness: 0.95 });
  const white   = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.5 });
  const iris    = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.6 });

  // Ноги
  const legG = new THREE.BoxGeometry(0.24, 0.92, 0.26);
  const lL = new THREE.Mesh(legG, jeans); lL.position.set(-0.16, 0.46, 0);
  const lR = new THREE.Mesh(legG, jeans); lR.position.set( 0.16, 0.46, 0);
  j.add(lL, lR);

  // Обувь
  const bootG = new THREE.BoxGeometry(0.28, 0.16, 0.42);
  const bL = new THREE.Mesh(bootG, boot); bL.position.set(-0.16, 0.08, 0.06);
  const bR = new THREE.Mesh(bootG, boot); bR.position.set( 0.16, 0.08, 0.06);
  j.add(bL, bR);

  // Торс
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.82, 0.34), shirt);
  torso.position.set(0, 1.28, 0);
  j.add(torso);

  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.02), shirtDk);
  placket.position.set(0, 1.28, 0.18);
  j.add(placket);

  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.38), shirtDk);
  collar.position.set(0, 1.68, 0.02);
  j.add(collar);

  // Руки (группа с pivot в плече)
  function makeArm(side) {
    const a = new THREE.Group();
    a.position.set(side * 0.44, 1.62, 0);
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.52, 0.22), shirt);
    sleeve.position.y = -0.26;
    const fore = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.48, 0.19), skin);
    fore.position.y = -0.76;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.18), skin);
    hand.position.y = -1.06;
    a.add(sleeve, fore, hand);
    return a;
  }
  const armL = makeArm(-1);
  const armR = makeArm( 1);
  j.add(armL, armR);

  // Шея и голова
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.12, 10), skin);
  neck.position.set(0, 1.76, 0);
  j.add(neck);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.34), skin);
  head.position.set(0, 2.00, 0);
  j.add(head);

  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.14, 0.37), hair);
  hairTop.position.set(0, 2.19, 0);
  j.add(hairTop);

  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.24, 0.30), hair);
  beard.position.set(0, 1.80, 0.02);
  j.add(beard);

  const beardTaper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.20), hair);
  beardTaper.position.set(0, 1.68, 0.03);
  j.add(beardTaper);

  const must = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.08), hair);
  must.position.set(0, 1.90, 0.18);
  j.add(must);

  const eyeLW = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), white);
  eyeLW.position.set(-0.08, 2.04, 0.17);
  const eyeRW = eyeLW.clone(); eyeRW.position.x = 0.08;
  j.add(eyeLW, eyeRW);

  const irisL = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), iris);
  irisL.position.set(-0.08, 2.04, 0.205);
  const irisR = irisL.clone(); irisR.position.x = 0.08;
  j.add(irisL, irisR);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.10), skinDk);
  nose.position.set(0, 1.98, 0.19);
  j.add(nose);

  // Чёрная сумка в правой руке
  const bag = new THREE.Group();
  bag.position.set(0, -1.22, 0.10);
  const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.34, 0.16), bagMat);
  const bagFlap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.18), strap);
  bagFlap.position.y = 0.16;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 6, 14, Math.PI), strap);
  handle.rotation.x = -Math.PI / 2;
  handle.position.y = 0.22;
  bag.add(bagBody, bagFlap, handle);
  armR.add(bag);

  j.userData.armL = armL;
  j.userData.armR = armR;
  j.userData.bag  = bag;
  return j;
}

const JOHNSON_LOCAL = new THREE.Vector3(30, 1.9, 72);
const johnson = buildJohnson();
johnson.position.copy(JOHNSON_LOCAL);
G.islandGroup.add(johnson);

const _wp = new THREE.Vector3();
G.islandGroup.localToWorld(_wp.copy(JOHNSON_LOCAL));
G.johnsonMarker = { x: _wp.x, z: _wp.z };

const armR = johnson.userData.armR;
const armL = johnson.userData.armL;
const bag  = johnson.userData.bag;

/* ---------- Состояния ---------- */
let state = 'waiting';
let stateTime = 0;
let cooldown = 0;
let bagDelivered = false;
const triggerDist = 18;

let flyingBag = null;
let flyStart = null;
let flyTime = 0;
const FLY_DUR = 1.25;

/* ---------- UI ---------- */
function showPrompt() { promptEl.classList.add('show'); }
function hidePrompt() { promptEl.classList.remove('show'); }

yesBtn.addEventListener('click', () => {
  if (state !== 'asking') return;
  hidePrompt();
  try { startThrow(); } catch(e) { console.error(e); }
});
noBtn.addEventListener('click', () => {
  if (state !== 'asking') return;
  hidePrompt();
  showDialog('Ладно, подожду.', 2.5);
  cooldown = 6;
  state = 'waiting';
  stateTime = 0;
});

/* ---------- Бросок ---------- */
function startThrow() {
  bag.visible = false;
  flyingBag = bag.clone(true);
  flyingBag.visible = true;
  flyingBag.rotation.set(0, 0, 0);

  flyStart = new THREE.Vector3();
  bag.getWorldPosition(flyStart);
  flyingBag.position.copy(flyStart);

  G.scene.add(flyingBag);
  flyTime = 0;
  state = 'throwing';
  stateTime = 0;

  showDialog('Держи!', 1.4);
}

const _target = new THREE.Vector3();
const _mid = new THREE.Vector3();

function updateFly(dt) {
  if (!flyingBag || !flyStart) return;
  flyTime += dt;
  const t = Math.min(flyTime / FLY_DUR, 1);

  _target.set(0, 1.0, 1.0);
  G.boat.localToWorld(_target);

  _mid.copy(flyStart).lerp(_target, t);
  const arc = Math.sin(Math.PI * t) * 3.5;

  flyingBag.position.set(_mid.x, _mid.y + arc, _mid.z);
  flyingBag.rotation.x += dt * 6.5;
  flyingBag.rotation.z += dt * 4.2;

  if (t >= 1) {
    G.scene.remove(flyingBag);
    G.boat.add(flyingBag);
    flyingBag.position.set(0, 0.80, 1.0);
    flyingBag.rotation.set(Math.PI / 2, 0, 0);

    flyingBag = null;
    flyStart = null;
    bagDelivered = true;
    state = 'done';
    stateTime = 0;

    setTimeout(() => showDialog('Сумка твоя. Удачи, капитан!', 4), 600);
  }
}

/* ---------- Тик ---------- */
const _localBoat = new THREE.Vector3();

window.johnsonTick = function (dt, time, boatPos, heading, speed, islandGroup) {
  try {
    stateTime += dt;
    if (cooldown > 0) cooldown -= dt;

    islandGroup.worldToLocal(_localBoat.set(boatPos.x, boatPos.y, boatPos.z));
    const dx = _localBoat.x - JOHNSON_LOCAL.x;
    const dz = _localBoat.z - JOHNSON_LOCAL.z;
    const dist = Math.hypot(dx, dz);
    const near = dist < triggerDist;
    const yaw = Math.atan2(dx, dz);

    if (state === 'waiting') {
      johnson.position.y = JOHNSON_LOCAL.y + Math.sin(time * 1.6) * 0.015;
      johnson.rotation.z = Math.sin(time * 0.9) * 0.012;
      armR.rotation.x *= Math.pow(0.1, dt);
      armL.rotation.x *= Math.pow(0.1, dt);

      if (near && !bagDelivered && cooldown <= 0) {
        state = 'asking';
        stateTime = 0;
        showDialog('Ну что, готов?', 4.5);
        showPrompt();
      }
    } else if (state === 'asking') {
      johnson.rotation.y = smoothTurn(johnson.rotation.y, yaw, dt * 4);
      if (dist > triggerDist + 6) {
        hidePrompt();
        state = 'waiting';
        stateTime = 0;
      }
    } else if (state === 'throwing') {
      johnson.rotation.y = smoothTurn(johnson.rotation.y, yaw, dt * 5);
      const t = Math.min(stateTime / 0.45, 1);
      armR.rotation.x = -1.8 * t * t;
      armR.rotation.z = -0.4 * t;
      updateFly(dt);
    } else if (state === 'done') {
      armR.rotation.x *= Math.pow(0.1, dt);
      armR.rotation.z *= Math.pow(0.1, dt);
      if (dist < 40) {
        johnson.rotation.y = smoothTurn(johnson.rotation.y, yaw, dt * 1.5);
      }
    }
  } catch (e) {
    // Не валим игру
    console.error('[Johnson tick]', e);
  }
};

/* ---------- Диалог ---------- */
const dEl = document.getElementById('dialog');
const dTx = document.getElementById('dialogText');
let dTimer = null;
function showDialog(text, dur) {
  if (!dEl || !dTx) return;
  dTx.textContent = text;
  dEl.classList.add('show');
  if (dTimer) clearTimeout(dTimer);
  dTimer = setTimeout(() => dEl.classList.remove('show'), (dur || 3) * 1000);
}

/* ---------- Хелперы ---------- */
function shortestAngle(a, b) {
  let d = b - a;
  while (d >  Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
function smoothTurn(cur, tgt, f) {
  return cur + shortestAngle(cur, tgt) * Math.min(1, f);
}

window.Johnson = { get state(){ return state; }, showDialog };

} catch (e) {
  console.error('[Johnson init]', e);
}

})();