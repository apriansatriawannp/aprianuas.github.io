let scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x88ccee, 10, 80);

let camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x88aa88));

// Ground
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x3b7d3b });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Trees
function createTree(x, z) {
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 2),
        new THREE.MeshLambertMaterial({ color: 0x8b5a2b })
    );
    trunk.position.set(x, 1, z);

    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(1.2),
        new THREE.MeshLambertMaterial({ color: 0x2e8b57 })
    );
    leaves.position.set(x, 3, z);

    scene.add(trunk);
    scene.add(leaves);
}

// Generate forest
for (let i = 0; i < 60; i++) {
    createTree(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    );
}

// Player
camera.position.set(0, 2, 5);

// Controls
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Mouse look
let yaw = 0, pitch = 0;
document.body.addEventListener("mousemove", e => {
    if (document.pointerLockElement === document.body) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-1.5, Math.min(1.5, pitch));
    }
});

document.body.onclick = () => document.body.requestPointerLock();

// Blocks
const blocks = [];
const blockGeo = new THREE.BoxGeometry(1,1,1);
const blockMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });

// Build block on click
window.addEventListener("mousedown", () => {
    const dir = new THREE.Vector3(
        Math.sin(yaw),
        0,
        Math.cos(yaw)
    );

    const pos = camera.position.clone().add(dir.multiplyScalar(3));
    const block = new THREE.Mesh(blockGeo, blockMat);
    block.position.set(
        Math.round(pos.x),
        0.5,
        Math.round(pos.z)
    );

    scene.add(block);
    blocks.push(block);
});

// Loop
function animate() {
    requestAnimationFrame(animate);

    // Move
    let speed = 0.1;
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

    camera.rotation.set(pitch, yaw, 0);
    renderer.render(scene, camera);
}

animate();
