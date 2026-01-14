let scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x9fd4ff, 10, 120);

let camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 500);
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setClearColor(0x9fd4ff);
document.body.appendChild(renderer.domElement);

// ===== LIGHTING CINEMATIC =====
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
let sun = new THREE.DirectionalLight(0xfff3d6, 1.2);
sun.position.set(100, 200, 100);
scene.add(sun);

// ===== MATERIALS =====
const geo = new THREE.BoxGeometry(1, 1, 1);
const mats = {
  grass: new THREE.MeshStandardMaterial({ color: 0x4caf50 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x888888 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
};

// ===== TERRAIN PROCEDURAL =====
const blocks = [];
const size = 60;

for (let x = -size; x < size; x++) {
  for (let z = -size; z < size; z++) {
    let h = Math.floor(Math.sin(x * 0.1) * 2 + Math.cos(z * 0.1) * 2);
    for (let y = 0; y <= h; y++) {
      let b = new THREE.Mesh(geo, mats.grass);
      b.position.set(x, y, z);
      scene.add(b);
      blocks.push(b);
    }
  }
}

// ===== TREES =====
function tree(x, z, y) {
  let trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 2),
    mats.wood
  );
  trunk.position.set(x, y + 1, z);

  let crown = new THREE.Mesh(
    new THREE.SphereGeometry(1.2),
    new THREE.MeshStandardMaterial({ color: 0x2e7d32 })
  );
  crown.position.set(x, y + 2.8, z);

  scene.add(trunk, crown);
}

for (let i = 0; i < 80; i++) {
  tree((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, 2);
}

// ===== ANIMALS WITH BETTER AI =====
const animals = [];

function spawnAnimal(color, x, z) {
  let mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.5, 1.2),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(x, 3, z);
  scene.add(mesh);
  animals.push({
    mesh,
    dir: Math.random() * Math.PI * 2,
    timer: Math.random() * 100
  });
}

for (let i = 0; i < 10; i++) spawnAnimal(0xffffff, Math.random() * 60 - 30, Math.random() * 60 - 30);
for (let i = 0; i < 6; i++) spawnAnimal(0x8b5a2b, Math.random() * 60 - 30, Math.random() * 60 - 30);

// ===== PLAYER =====
camera.position.set(0, 6, 10);
let yaw = 0, pitch = 0, velY = 0, canJump = false;
let keys = {};

document.body.onclick = () => document.body.requestPointerLock();

document.onmousemove = e => {
  if (document.pointerLockElement) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-1.5, Math.min(1.5, pitch));
  }
};

onkeydown = e => keys[e.key.toLowerCase()] = true;
onkeyup = e => keys[e.key.toLowerCase()] = false;

// ===== BUILD SYSTEM =====
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(0, 0);

addEventListener("mousedown", e => {
  raycaster.setFromCamera(mouse, camera);
  let hits = raycaster.intersectObjects(blocks);
  if (!hits.length) return;

  let hit = hits[0];
  let pos = hit.object.position.clone().add(hit.face.normal);

  if (e.button === 0) {
    let b = new THREE.Mesh(geo, mats.stone);
    b.position.copy(pos);
    scene.add(b);
    blocks.push(b);
  }
  if (e.button === 2) {
    scene.remove(hit.object);
    blocks.splice(blocks.indexOf(hit.object), 1);
  }
});

addEventListener("contextmenu", e => e.preventDefault());

// ===== LOOP =====
function animate() {
  requestAnimationFrame(animate);

  let speed = keys["shift"] ? 0.25 : 0.12;

  if (keys["w"]) {
    camera.position.x -= Math.sin(yaw) * speed;
    camera.position.z -= Math.cos(yaw) * speed;
  }
  if (keys["s"]) {
    camera.position.x += Math.sin(yaw) * speed;
    camera.position.z += Math.cos(yaw) * speed;
  }

  velY -= 0.01;
  camera.position.y += velY;
  if (camera.position.y < 5) {
    camera.position.y = 5;
    velY = 0;
    canJump = true;
  }
  if (keys[" "] && canJump) {
    velY = 0.25;
    canJump = false;
  }

  // Smarter animal motion
  animals.forEach(a => {
    a.timer--;
    if (a.timer <= 0) {
      a.dir = Math.random() * Math.PI * 2;
      a.timer = 50 + Math.random() * 100;
    }
    a.mesh.position.x += Math.sin(a.dir) * 0.015;
    a.mesh.position.z += Math.cos(a.dir) * 0.015;
  });

  camera.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
}

animate();
