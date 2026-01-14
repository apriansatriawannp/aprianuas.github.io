let scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x88ccee, 0.015);

let camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.setClearColor(0x87ceeb);
document.body.appendChild(renderer.domElement);

// Light
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
let sun = new THREE.DirectionalLight(0xfff5cc, 1);
sun.position.set(50,100,50);
scene.add(sun);

// Materials
const geo = new THREE.BoxGeometry(1,1,1);
const mats = {
  grass: new THREE.MeshLambertMaterial({color:0x55aa55}),
  stone: new THREE.MeshLambertMaterial({color:0x999999}),
  wood: new THREE.MeshLambertMaterial({color:0x8b5a2b})
};

// Terrain
const blocks = [];
for(let x=-30;x<30;x++){
  for(let z=-30;z<30;z++){
    let b = new THREE.Mesh(geo, mats.grass);
    b.position.set(x, 0, z);
    scene.add(b);
    blocks.push(b);
  }
}

// ===== TREES =====
function makeTree(x,z){
  let trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2,0.2,2),
    new THREE.MeshLambertMaterial({color:0x8b5a2b})
  );
  trunk.position.set(x,1,z);

  let leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshLambertMaterial({color:0x2e8b57})
  );
  leaves.position.set(x,2.5,z);

  scene.add(trunk, leaves);
}
for(let i=0;i<40;i++){
  makeTree((Math.random()-0.5)*50,(Math.random()-0.5)*50);
}

// ===== ANIMALS =====
const animals = [];

function makeRabbit(x,z){
  let body = new THREE.Mesh(
    new THREE.SphereGeometry(0.3),
    new THREE.MeshLambertMaterial({color:0xffffff})
  );
  body.position.set(x,0.3,z);
  scene.add(body);
  animals.push({mesh:body, dir:Math.random()*Math.PI*2});
}

function makeDeer(x,z){
  let body = new THREE.Mesh(
    new THREE.BoxGeometry(0.6,0.4,1),
    new THREE.MeshLambertMaterial({color:0x8b5a2b})
  );
  body.position.set(x,0.4,z);
  scene.add(body);
  animals.push({mesh:body, dir:Math.random()*Math.PI*2});
}

for(let i=0;i<10;i++) makeRabbit((Math.random()-0.5)*40,(Math.random()-0.5)*40);
for(let i=0;i<6;i++) makeDeer((Math.random()-0.5)*40,(Math.random()-0.5)*40);

// ===== PLAYER =====
camera.position.set(0,2,5);
let yaw=0,pitch=0,velY=0,canJump=false;

document.body.onclick = ()=>document.body.requestPointerLock();

document.addEventListener("mousemove", e=>{
  if(document.pointerLockElement){
    yaw -= e.movementX*0.002;
    pitch -= e.movementY*0.002;
    pitch = Math.max(-1.4,Math.min(1.4,pitch));
  }
});

// Input
let keys={};
onkeydown = e=>keys[e.key.toLowerCase()]=true;
onkeyup = e=>keys[e.key.toLowerCase()]=false;

// Movement
function move(){
  let speed = keys["shift"]?0.2:0.1;
  if(keys["w"]){camera.position.x -= Math.sin(yaw)*speed;camera.position.z -= Math.cos(yaw)*speed;}
  if(keys["s"]){camera.position.x += Math.sin(yaw)*speed;camera.position.z += Math.cos(yaw)*speed;}
  if(keys["a"]){camera.position.x -= Math.cos(yaw)*speed;camera.position.z += Math.sin(yaw)*speed;}
  if(keys["d"]){camera.position.x += Math.cos(yaw)*speed;camera.position.z -= Math.sin(yaw)*speed;}

  velY -= 0.01;
  camera.position.y += velY;
  if(camera.position.y<2){camera.position.y=2;velY=0;canJump=true;}
  if(keys[" "] && canJump){velY=0.2;canJump=false;}
}

// ===== HOTBAR =====
let selectedSlot = 0;
const slots = document.querySelectorAll(".slot");

function updateHotbar(){
  slots.forEach((s,i)=>s.classList.toggle("active", i===selectedSlot));
}
updateHotbar();

onkeydown = e=>{
  if(e.key >= "1" && e.key <= "5"){
    selectedSlot = parseInt(e.key)-1;
    updateHotbar();
  }
  keys[e.key.toLowerCase()] = true;
};

// ===== BUILD SYSTEM =====
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(0,0);

addEventListener("mousedown", e=>{
  raycaster.setFromCamera(mouse, camera);
  let hits = raycaster.intersectObjects(blocks);

  if(hits.length && selectedSlot===0 && e.button===0){
    let pos = hits[0].object.position.clone().add(hits[0].face.normal);
    let b = new THREE.Mesh(geo, mats.stone);
    b.position.copy(pos);
    scene.add(b);
    blocks.push(b);
  }
});

addEventListener("contextmenu", e=>e.preventDefault());

// ===== LOOP =====
function animate(){
  requestAnimationFrame(animate);

  move();
  camera.rotation.set(pitch,yaw,0);

  // animal random movement
  animals.forEach(a=>{
    a.mesh.position.x += Math.sin(a.dir)*0.01;
    a.mesh.position.z += Math.cos(a.dir)*0.01;
    if(Math.random()<0.01) a.dir = Math.random()*Math.PI*2;
  });

  renderer.render(scene,camera);
}
animate();
