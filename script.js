let scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x88ccee, 0.02);

let camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.setClearColor(0x87ceeb);
document.body.appendChild(renderer.domElement);

// LIGHT
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
let sun = new THREE.DirectionalLight(0xfff5cc, 1);
sun.position.set(50, 100, 50);
scene.add(sun);

// MATERIALS
const geo = new THREE.BoxGeometry(1, 1, 1);
const mats = {
  grass: new THREE.MeshLambertMaterial({ color: 0x55aa55 }),
  stone: new THREE.MeshLambertMaterial({ color: 0x999999 }),
  wood: new THREE.MeshLambertMaterial({ color: 0x8b5a2b })
};

// WORLD
const blocks = [];
const worldSize = 40;

// Terrain dengan bukit
for (let x = -worldSize; x < worldSize; x++) {
  for (let z = -worldSize; z < worldSize; z++) {
    let height = Math.floor(Math.sin(x * 0.2) + Math.cos(z * 0.2));
    for (let y = 0; y <= height; y++) {
      let b = new THREE.Mesh(geo, mats.grass);
      b.position.set(x, y, z);
      scene.add(b);
      blocks.push(b);
    }
  }
}

// POHON
function makeTree(x, z, y) {
  let trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 2),
    mats.wood
  );
  trunk.position.set(x, y + 1, z);

  let leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshLambertMaterial({ color: 0x2e8b57 })
  );
  leaves.position.set(x, y + 2.5, z);

  scene.add(trunk, leaves);
}

// Generate trees random
for (let i = 0; i < 50; i++) {
  let x = (Math.random() - 0.5) * 60;
  let z = (Math.random() - 0.5) * 60;
  makeTree(x, z, 1);
}

// ANIMALS
const animals = [];

function makeAnimal(color, x, z) {
  let mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.4, 1),
    new THREE.MeshLambertMaterial({ color })
  );
  mesh.position.set(x, 1, z);
  scene.add(mesh);
  animals.push({ mesh, dir: Math.random() * Math.PI * 2 });
}

// Spawn animals
for (let i = 0; i < 8; i++) makeAnimal(0xffffff, Math.random() * 40 - 20, Math.random() * 40 - 20); // rabbit
for (let i = 0; i < 5; i++) makeAnimal(0x8b5a2b, Math.random() * 40 - 20, Math.random() * 40 - 20); // deer

// PLAYER
camera.position.set(0, 5, 10);
let yaw = 0, pitch = 0;
let velY = 0, canJump = false;

document.body.onclick = () => document.body.requestPointerLock();

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-1.4, Math.min(1.4, pitch));
  }
});

// INPUT
let keys = {};
onkeydown = e => keys[e.key.toLowerCase()] = true;
onkeyup = e => keys[e.key.toLowerCase()] = false;

// HOTBAR
let selectedSlot = 0;
const slots = document.querySelectorAll(".slot");

function updateHotbar() {
  slots.forEach((s, i) => s.classList.toggle("active", i === selectedSlot));
}
updateHotbar();

onkeydown = e => {
  if (e.key >= "1" && e.key <= "5") {
    selectedSlot = parseInt(e.key) - 1;
    updateHotbar();
  }
  keys[e.key.toLowerCase()] = true;
};

// BUILD SYSTEM
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(0, 0);

addEventListener("mousedown", e => {
  raycaster.setFromCamera(mouse, camera);
  let hits = raycaster.intersectObjects(blocks);

  if (!hits.length) return;

  let hit = hits[0];
  let pos = hit.object.position.clone().add(hit.face.normal);

  if (e.button === 0) {
    let mat = mats.stone;
    if (selectedSlot === 1) mat = mats.wood;
    if (selectedSlot === 2) mat = mats.grass;

    let b = new THREE.Mesh(geo, mat);
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

// MOVE
function move() {
  let speed = keys["shift"] ? 0.2 : 0.1;

  if (keys["w"]) {
    camera.position.x -= Math.sin(yaw) * speed;
    camera.position.z -= Math.cos(yaw) * speed;
  }
  if (keys["s"]) {
    camera.position.x += Math.sin(yaw) * speed;
    camera.position.z += Math.cos(yaw) * speed;
  }
  if (keys["a"]) {
    camera.position.x -= Math.cos(yaw) * speed;
    camera.position.z += Math.sin(yaw) * speed;
  }
  if (keys["d"]) {
    camera.position.x += Math.cos(yaw) * speed;
    camera.position.z -= Math.sin(yaw) * speed;
  }

  velY -= 0.01;
  camera.position.y += velY;
  if (camera.position.y < 3) {
    camera.position.y = 3;
    velY = 0;
    canJump = true;
  }

  if (keys[" "] && canJump) {
    velY = 0.25;
    canJump = false;
  }
}

// LOOP
function animate() {
  requestAnimationFrame(animate);

  move();
  camera.rotation.set(pitch, yaw, 0);

  // Animal movement
  animals.forEach(a => {
    a.mesh.position.x += Math.sin(a.dir) * 0.01;
    a.mesh.position.z += Math.cos(a.dir) * 0.01;
    if (Math.random() < 0.01) a.dir = Math.random() * Math.PI * 2;
  });

  renderer.render(scene, camera);
}

animate();
