/* ============================================================
   ДЖОНСОН — мужик на малом причале.
   Борода, усы, синие джинсы, красная рубаха, чёрная сумка.
   Ждёт катер. Когда катер подплывает — реагирует.
   ============================================================ */
(function () {
'use strict';

const G = window.GAME;
if (!G) { console.error('GAME not ready'); return; }

/* ============================================================
   1. ГЕОМЕТРИЯ ДЖОНСОНА (все части тела из примитивов)
   ============================================================ */
function buildJohnson() {
  const johnson = new THREE.Group();
  johnson.rotation.order = 'YXZ';

  // --- материалы ---
  const skin     = new THREE.MeshStandardMaterial({ color: 0xd9a67a, roughness: 0.85 });
  const skinDark = new THREE.MeshStandardMaterial({ color: 0xc48f63, roughness: 0.85 });
  const shirt    = new THREE.MeshStandardMaterial({ color: 0xc0281e, roughness: 0.78 }); // красная рубаха
  const shirtDk  = new THREE.MeshStandardMaterial({ color: 0x8c1a13, roughness: 0.78 });
  const jeans    = new THREE.MeshStandardMaterial({ color: 0x2c4a78, roughness: 0.85 }); // синие джинсы
  const jeansDk  = new THREE.MeshStandardMaterial({ color: 0x1e3356, roughness: 0.85 });
  const bootMat  = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.9 });
  const bagMat   = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.55 });
  const bagStrap = new THREE.MeshStandardMaterial({ color: 0x2a2b30, roughness: 0.7 });
  const hairMat  = new THREE.MeshStandardMaterial({ color: 0x2e1d12, roughness: 0.95 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.5 });
  const eyeIris  = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.6 });

  // --- НОГИ (джинсы) ---
  const legGeo = new THREE.BoxGeometry(0.24, 0.92, 0.26);
  const legL = new THREE.Mesh(legGeo, jeans);
  legL.position.set(-0.16, 0.46, 0);
  const legR = legL.clone(); legR.position.x = 0.16;
  johnson.add(legL, legR);

  // колени-«швы» (тёмная полоска)
  const kneeGeo = new THREE.BoxGeometry(0.25, 0.05, 0.27);
  const kneeL = new THREE.Mesh(kneeGeo, jeansDk);
  kneeL.position.set(-0.16, 0.46, 0.005);
  const kneeR = kneeL.clone(); kneeR.position.x = 0.16;
  johnson.add(kneeL, kneeR);

  // --- ОБУВЬ ---
  const bootGeo = new THREE.BoxGeometry(0.28, 0.16, 0.42);
  const bootL = new THREE.Mesh(bootGeo, bootMat);
  bootL.position.set(-0.16, 0.08, 0.06);
  const bootR = bootL.clone(); bootR.position.x = 0.16;
  johnson.add(bootL, bootR);

  // --- ТОРС (красная рубаха) ---
  const torsoGeo = new THREE.BoxGeometry(0.62, 0.82, 0.34);
  const torso = new THREE.Mesh(torsoGeo, shirt);
  torso.position.set(0, 1.28, 0);
  johnson.add(torso);

  // пуговицы по центру (тёмная вертикальная полоса)
  const placketGeo = new THREE.BoxGeometry(0.06, 0.72, 0.02);
  const placket = new THREE.Mesh(placketGeo, shirtDk);
  placket.position.set(0, 1.28, 0.18);
  johnson.add(placket);

  // пуговицы
  const btnGeo = new THREE.SphereGeometry(0.022, 8, 6);
  const btnMat = new THREE.MeshStandardMaterial({ color: 0xf0e8c0, roughness: 0.5 });
  for (let i = -2; i <= 2; i++) {
    const b = new THREE.Mesh(btnGeo, btnMat);
    b.position.set(0, 1.28 + i * 0.14, 0.19);
    johnson.add(b);
  }

  // воротник
  const collarGeo = new THREE.BoxGeometry(0.36, 0.09, 0.38);
  const collar = new THREE.Mesh(collarGeo, shirtDk);
  collar.position.set(0, 1.68, 0.02);
  johnson.add(collar);

  // --- РУКИ (рубаха + кожа предплечий) ---
  // Верхняя часть — рубаха
  const sleeveGeo = new THREE.BoxGeometry(0.20, 0.52, 0.22);
  const sleeveL = new THREE.Mesh(sleeveGeo, shirt);
  sleeveL.position.set(-0.44, 1.32, 0);
  const sleeveR = sleeveL.clone(); sleeveR.position.x = 0.44;
  johnson.add(sleeveL, sleeveR);

  // Предплечья — кожа
  const foreGeo = new THREE.BoxGeometry(0.17, 0.48, 0.19);
  const foreL = new THREE.Mesh(foreGeo, skin);
  foreL.position.set(-0.44, 0.82, 0);
  const foreR = foreL.clone(); foreR.position.x = 0.44;
  johnson.add(foreL, foreR);

  // Кисти рук
  const handGeo = new THREE.BoxGeometry(0.16, 0.16, 0.18);
  const handL = new THREE.Mesh(handGeo, skin);
  handL.position.set(-0.44, 0.52, 0);
  const handR = handL.clone(); handR.position.x = 0.44;
  johnson.add(handL, handR);

  // --- ШЕЯ ---
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.12, 10), skin);
  neck.position.set(0, 1.76, 0);
  johnson.add(neck);

  // --- ГОЛОВА ---
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.34), skin);
  head.position.set(0, 2.00, 0);
  johnson.add(head);

  // Волосы (шапка из примитива)
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.14, 0.37), hairMat);
  hair.position.set(0, 2.19, 0);
  johnson.add(hair);

  // Боковые волосы
  const hairL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.34), hairMat);
  hairL.position.set(-0.185, 2.08, 0);
  const hairR = hairL.clone(); hairR.position.x = 0.185;
  johnson.add(hairL, hairR);

  // --- БОРОДА ---
  // Основная часть бороды (ниже подбородка, спускается вниз)
  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.24, 0.30), hairMat);
  beard.position.set(0, 1.80, 0.02);
  johnson.add(beard);

  // Борода-«клинышек» снизу
  const beardTaper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.20), hairMat);
  beardTaper.position.set(0, 1.68, 0.03);
  johnson.add(beardTaper);

  // Боковые бакенбарды
  const burnL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.18, 0.26), hairMat);
  burnL.position.set(-0.155, 1.90, 0.02);
  const burnR = burnL.clone(); burnR.position.x = 0.155;
  johnson.add(burnL, burnR);

  // --- УСЫ ---
  const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.08), hairMat);
  mustache.position.set(0, 1.90, 0.18);
  johnson.add(mustache);
  // Кончики усов чуть в стороны
  const mustTipL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.06), hairMat);
  mustTipL.position.set(-0.13, 1.89, 0.16);
  const mustTipR = mustTipL.clone(); mustTipR.position.x = 0.13;
  johnson.add(mustTipL, mustTipR);

  // --- ГЛАЗА ---
  const eyeL_white = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), eyeWhite);
  eyeL_white.position.set(-0.08, 2.04, 0.17);
  const eyeR_white = eyeL_white.clone(); eyeR_white.position.x = 0.08;
  johnson.add(eyeL_white, eyeR_white);

  const irisGeo = new THREE.SphereGeometry(0.024, 8, 6);
  const irisL = new THREE.Mesh(irisGeo, eyeIris);
  irisL.position.set(-0.08, 2.04, 0.205);
  const irisR = irisL.clone(); irisR.position.x = 0.08;
  johnson.add(irisL, irisR);

  // Брови
  const browGeo = new THREE.BoxGeometry(0.09, 0.025, 0.03);
  const browL = new THREE.Mesh(browGeo, hairMat);
  browL.position.set(-0.08, 2.11, 0.18);
  const browR = browL.clone(); browR.position.x = 0.08;
  johnson.add(browL, browR);

  // --- НОС ---
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.10), skinDark);
  nose.position.set(0, 1.98, 0.19);
  johnson.add(nose);

  // --- ЧЁРНАЯ СУМКА в правой руке ---
  // (Крепим к руке — чтобы двигалась вместе с ней.)
  const bagGroup = new THREE.Group();
  bagGroup.position.set(0.44, 0.36, 0.10);

  const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.34, 0.16), bagMat);
  bagGroup.add(bagBody);

  // Крышка сумки (верхняя часть)
  const bagFlap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.18), bagStrap);
  bagFlap.position.y = 0.16;
  bagGroup.add(bagFlap);

  // Ручка сумки (дуга)
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.018, 6, 14, Math.PI),
    bagStrap
  );
  handle.rotation.x = -Math.PI / 2;
  handle.position.y = 0.22;
  bagGroup.add(handle);

  // Застёжка
  const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.02), bagStrap);
  clasp.position.set(0, 0.05, 0.085);
  bagGroup.add(clasp);

  johnson.add(bagGroup);

  // --- ПЛЕЧИ-«подушки» рубахи ---
  const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.30), shirt);
  shoulderL.position.set(-0.34, 1.62, 0);
  const shoulderR = shoulderL.clone(); shoulderR.position.x = 0.34;
  johnson.add(shoulderL, shoulderR);

  return johnson;
}

/* ============================================================
   2. РАЗМЕЩЕНИЕ ДЖОНСОНА
   Локальные координаты внутри islandGroup.
   Малый причал: позиция (30, 1.6, 60), длина 36 по Z (z: 42..78).
   Ставим Джонсона на дальний конец — там, где останавливается катер.
   ============================================================ */
const JOHNSON_LOCAL = new THREE.Vector3(30, 1.9, 72); // на палубе причала
const JOHNSON_FACING_INIT = 0;                         // смотрит в +Z (к воде)

const johnson = buildJohnson();
johnson.position.copy(JOHNSON_LOCAL);
johnson.rotation.y = JOHNSON_FACING_INIT;
G.islandGroup.add(johnson);

// Сохраним ссылки для дальнейшего использования
window.johnson = johnson;

// Маркер для миникарты — пересчитываем в мировые координаты
const johnsonWorld = new THREE.Vector3();
G.islandGroup.localToWorld(johnsonWorld.copy(JOHNSON_LOCAL));
window.GAME.johnsonMarker = { x: johnsonWorld.x, z: johnsonWorld.z };

/* ============================================================
   3. СОСТОЯНИЯ ДЖОНСОНА
   ============================================================ */
const State = {
  WAITING:  'waiting',    // стоит, смотрит в море, лёгкое покачивание
  NOTICED:  'noticed',    // катер рядом: повернулся к катеру, поднял сумку
  WAVING:   'waving',     // машет рукой 3 секунды
  DONE:     'done'        // продолжает стоять и смотреть на катер
};

let johnsonState = State.WAITING;
let stateTime = 0;
let triggerDistance = 18;        // метров — на каком расстоянии реагирует
const NOTICE_HOLD = 3.0;         // сек — сколько машет
const DONE_HOLD = 6.0;           // сек — до сброса (если катер уплыл)

// ссылки на подвижные части для анимации
const rightArm = johnson.children.find(c => c.position.x === 0.44 && c.geometry && c.geometry.parameters && c.geometry.parameters.height === 0.52);
const bagGroup = johnson.children.find(c => c.position.x === 0.44 && c.position.y === 0.36);

/* ============================================================
   4. ТИК — вызывается каждый кадр из главного цикла
   ============================================================ */
window.johnsonTick = function (dt, time, boatPos, heading, speed, islandGroup) {
  stateTime += dt;

  // переводим позицию катера в локальные координаты острова
  const localBoat = islandGroup.worldToLocal(new THREE.Vector3(boatPos.x, boatPos.y, boatPos.z));

  // расстояние от Джонсона до катера в локальных координатах
  const dx = localBoat.x - JOHNSON_LOCAL.x;
  const dz = localBoat.z - JOHNSON_LOCAL.z;
  const dist = Math.hypot(dx, dz);
  const nearBoat = dist < triggerDistance;

  // направление Джонсона на катер (в локальных координатах острова)
  const desiredYaw = Math.atan2(dx, dz);

  switch (johnsonState) {

    /* ---------- ЖДЁТ ---------- */
    case State.WAITING: {
      // лёгкое покачивание
      const bob = Math.sin(time * 1.6) * 0.015;
      johnson.position.y = JOHNSON_LOCAL.y + bob;
      johnson.rotation.z = Math.sin(time * 0.9) * 0.012;

      // если катер подплыл — замечает
      if (nearBoat) {
        johnsonState = State.NOTICED;
        stateTime = 0;
      }
      break;
    }

    /* ---------- ЗАМЕТИЛ ---------- */
    case State.NOTICED: {
      // поворачивается к катеру
      const t = Math.min(stateTime / 0.5, 1);
      johnson.rotation.y = JOHNSON_FACING_INIT + (shortestAngle(JOHNSON_FACING_INIT, desiredYaw)) * t;

      // поднимает руку с сумкой чуть-чуть (готовится)
      if (bagGroup) bagGroup.position.y = 0.36 + t * 0.06;

      if (stateTime > 0.5) {
        johnsonState = State.WAVING;
        stateTime = 0;
        onBoatArrived();   // ← вот здесь вызывается наша «сцена»
      }
      break;
    }

    /* ---------- МАШЕТ ---------- */
    case State.WAVING: {
      // держит взгляд на катере
      johnson.rotation.y = smoothTurn(johnson.rotation.y, desiredYaw, dt * 4);

      // махи правой рукой (плечо — правая рука)
      const wave = Math.sin(stateTime * 12) * 0.55;
      if (rightArm) rightArm.rotation.x = -1.6 + wave * 0.35;
      if (bagGroup) bagGroup.position.y = 0.55;

      // лёгкий наклон вперёд к катеру
      johnson.rotation.x = Math.sin(stateTime * 12) * 0.03;

      if (stateTime > NOTICE_HOLD) {
        johnsonState = State.DONE;
        stateTime = 0;
        if (rightArm) rightArm.rotation.x = 0;
      }
      break;
    }

    /* ---------- ПОСЛЕ ПРИВЕТСТВИЯ ---------- */
    case State.DONE: {
      johnson.rotation.y = smoothTurn(johnson.rotation.y, desiredYaw, dt * 2);
      johnson.rotation.x *= Math.pow(0.1, dt);

      // если катер уплыл далеко — вернуться в ожидание
      if (dist > triggerDistance + 8) {
        johnsonState = State.WAITING;
        stateTime = 0;
        if (bagGroup) bagGroup.position.y = 0.36;
      } else if (stateTime > DONE_HOLD) {
        // продолжаем смотреть, но без махов
      }
      break;
    }
  }
};

/* ============================================================
   5. ⚙️⚙️⚙️ ГЛАВНАЯ ЧАСТЬ, КОТОРУЮ МЫ МЕНЯЕМ ⚙️⚙️⚙️
   Что происходит, когда катер подплыл к причалу?
   Сейчас: диалог Джонсона + лёгкое покачивание катера.
   Примеры того, что можно добавить:
      — посадить Джонсона в катер (двигать в boat)
      — показать длинный диалог (список реплик)
      — выдать квест, дать предмет
      — включить звук (смех, "Эй, на катере!")
   ============================================================ */
function onBoatArrived() {
  showDialog('Эй, на катере! Здорово, брат! 🚤', 3.5);

  // Через 3.5 секунды — вторая реплика
  setTimeout(() => {
    showDialog('Сумку-то привёз, как договаривались?', 4.0);
  }, 3600);

  // ← СЮДА МОЖНО ДОПИСАТЬ ЧТО УГОДНО:
  //   setTimeout(() => { посадитьВКатер(); }, 8000);
  //   setTimeout(() => { показатьВторойДиалог(); }, 12000);
  //   и т.д.
}

/* ============================================================
   6. ДИАЛОГ — всплывающий бабл
   ============================================================ */
const dialogEl = document.getElementById('dialog');
const dialogText = document.getElementById('dialogText');
let dialogTimer = null;

function showDialog(text, duration) {
  if (!dialogEl || !dialogText) return;
  dialogText.textContent = text;
  dialogEl.classList.add('show');
  if (dialogTimer) clearTimeout(dialogTimer);
  dialogTimer = setTimeout(() => {
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
function smoothTurn(current, target, factor) {
  return current + shortestAngle(current, target) * Math.min(1, factor);
}

// Экспортируем в глобал, чтобы можно было дергать из консоли
window.Johnson = {
  get state() { return johnsonState; },
  get position() { return johnson.position.clone(); },
  showDialog,
  onBoatArrived
};

})();