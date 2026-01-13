let scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x88ccee, 0.015);

let camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Sky color
renderer.setClearColor(0x87ceeb);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
let sun = new THREE.DirectionalLight(0xfff5cc, 1);
sun.position.set(50,100,50);
scene.add(sun);

// Ground blocks
const blocks = [];
const size = 40;
const geo = new THREE.BoxGeometry(1,1,1);

const mats = {
  grass: new THREE.MeshLambertMaterial({color:0x55aa55}),
  dirt: new THREE.MeshLambertMaterial({color:0x8b5a2b}),
  stone: new THREE.MeshLambertMaterial({color:0x888888}),
  wood: new THREE.MeshLambertMaterial({color:0xaa7744})
};

// Generate terrain
for(let x=-size;x<size;x++){
  for(let z=-size;z<size;z++){
    const block = new THREE.Mesh(geo, mats.grass);
    block.position.set(x, 0, z);
    scene.add(block);
    blocks.push(block);
  }
}

// Player
let velocityY = 0;
let canJump = false;
let speed = 0.1;
let sprint = false;

camera.position.set(0,2,5);

// Pointer lock
document.body.onclick = () => document.body.requestPointerLock();

let yaw=0, pitch=0;
document.addEventListener("mousemove", e=>{
  if(document.pointerLockElement){
    yaw -= e.movementX*0.002;
    pitch -= e.movementY*0.002;
    pitch = Math.max(-1.5, Math.min(1.5, pitch));
  }
});

// Input
let keys = {};
onkeydown = e=>keys[e.key.toLowerCase()] = true;
onkeyup = e=>keys[e.key.toLowerCase()] = false;

// Zoom
addEventListener("wheel", e=>{
  camera.fov += e.deltaY * 0.02;
  camera.fov = Math.max(30, Math.min(100, camera.fov));
  camera.updateProjectionMatrix();
});

// Raycast
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(0,0);

addEventListener("mousedown", e=>{
  raycaster.setFromCamera(mouse, camera);
  let hits = raycaster.intersectObjects(blocks);

  if(hits.length){
    let hit = hits[0];

    if(e.button===0){
      // Build
      let pos = hit.object.position.clone().add(hit.face.normal);
      let newBlock = new THREE.Mesh(geo, mats.stone);
      newBlock.position.copy(pos);
      scene.add(newBlock);
      blocks.push(newBlock);
    }

    if(e.button===2){
      // Destroy
      scene.remove(hit.object);
      blocks.splice(blocks.indexOf(hit.object),1);
    }
  }
});

addEventListener("contextmenu", e=>e.preventDefault());

// Loop
function animate(){
  requestAnimationFrame(animate);

  let move = sprint ? 0.2 : 0.1;

  if(keys["shift"]) sprint=true; else sprint=false;

  if(keys["w"]){
    camera.position.x -= Math.sin(yaw)*move;
    camera.position.z -= Math.cos(yaw)*move;
  }
  if(keys["s"]){
    camera.position.x += Math.sin(yaw)*move;
    camera.position.z += Math.cos(yaw)*move;
  }
  if(keys["a"]){
    camera.position.x -= Math.cos(yaw)*move;
    camera.position.z += Math.sin(yaw)*move;
  }
  if(keys["d"]){
    camera.position.x += Math.cos(yaw)*move;
    camera.position.z -= Math.sin(yaw)*move;
  }

  // Gravity
  velocityY -= 0.01;
  camera.position.y += velocityY;
  if(camera.position.y < 2){
    camera.position.y = 2;
    velocityY = 0;
    canJump = true;
  }

  if(keys[" "] && canJump){
    velocityY = 0.2;
    canJump = false;
  }

  camera.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
}
animate();
