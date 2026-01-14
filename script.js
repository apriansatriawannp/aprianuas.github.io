// === BASIC SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 20, 150);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 3, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// === LIGHT ===
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xfff2cc, 1);
sun.position.set(50, 100, 50);
scene.add(sun);

// === MATERIALS ===
const grassMat = new THREE.MeshStandardMaterial({ color: 0x55aa55 });
const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
const animalMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

const blocks = [];
const animals = [];

// === GROUND ===
for (let x = -30; x < 30; x++) {
  for (let z = -30; z < 30; z++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), grassMat);
    b.position.set(x, 0, z);
    scene.add(b);
    blocks.push(b);
  }
}

// === TREES ===
function tree(x, z) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2), woodMat);
  trunk.position.set(x, 1, z);
  scene.add(trunk);

  const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.2), leafMat);
  leaves.position.set(x, 2.8, z);
  scene.add(leaves);
}

for (let i = 0; i < 40; i++) {
  tree(Math.random() * 60 - 30, Math.random() * 60 - 30);
}

// === ANIMALS ===
function spawn(x, z) {
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.2), animalMat);
  a.position.set(x, 1, z);
  scene.add(a);
  animals.push({
    mesh: a,
    dir: Math.random() * Math.PI * 2,
    timer: 50 + Math.random() * 100
  });
}

for (let i = 0; i < 8; i++) {
  spawn(Math.random() * 50 - 25, Math.random() * 50 - 25);
}

// === CONTROLS ===
let yaw = 0, pitch = 0, velY = 0;
const keys = {};

document.body.onclick = () => document.body.requestPointerLock();

onmousemove = e => {
  if (document.pointerLockElement) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-1.4, Math.min(1.4, pitch));
  }
};

onkeydown = e => keys[e.key.toLowerCase()] = true;
onkeyup = e => keys[e.key.toLowerCase()] = false;

// === BUILD SYSTEM ===
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
const geo = new THREE.BoxGeometry(1, 1, 1);

addEventListener("mousedown", e => {
  raycaster.setFromCamera(center, camera);
  const hits = raycaster.intersectObjects(blocks);
  if (!hits.length) return;

  const hit = hits[0];

  if (e.button === 0) {
    const pos = hit.object.position.clone().add(hit.face.normal);
    const b = new THREE.Mesh(geo, stoneMat);
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

// === GAME LOOP ===
let time = 0;
function animate() {
  requestAnimationFrame(animate);

  // Day/Night
  time += 0.002;
  sun.intensity = 0.6 + Math.sin(time) * 0.4;

  // Movement
  let speed = keys["shift"] ? 0.2 : 0.1;

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
  if (camera.position.y < 3) {
    camera.position.y = 3;
    velY = 0;
  }
  if (keys[" "] && camera.position.y <= 3.01) velY = 0.2;

  // Animals
  animals.forEach(a => {
    a.timer--;
    if (a.timer <= 0) {
      a.dir = Math.random() * Math.PI * 2;
      a.timer = 50 + Math.random() * 100;
    }
    a.mesh.position.x += Math.sin(a.dir) * 0.01;
    a.mesh.position.z += Math.cos(a.dir) * 0.01;
  });

  camera.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
}

animate();
