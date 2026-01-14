const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x88ccaa, 10, 150);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 500);
camera.position.set(0, 6, 10);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// MUSIC
const bgm = document.getElementById("bgm");
document.body.addEventListener("click",()=>bgm.play(),{once:true});

// LIGHT
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xfff2cc, 1);
sun.position.set(100,200,100);
scene.add(sun);

// MATERIALS
const grassMat = new THREE.MeshStandardMaterial({ color:0x55aa55 });
const woodMat = new THREE.MeshStandardMaterial({ color:0x8b5a2b });
const animalMat = new THREE.MeshStandardMaterial({ color:0xffffff });

// GROUND
const blocks = [];
for(let x=-50;x<50;x++){
  for(let z=-50;z<50;z++){
    let b = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), grassMat);
    b.position.set(x,0,z);
    scene.add(b);
    blocks.push(b);
  }
}

// TREES
function tree(x,z){
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.3,2), woodMat);
  trunk.position.set(x,1,z);
  scene.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1.2),
    new THREE.MeshStandardMaterial({color:0x2e8b57})
  );
  leaves.position.set(x,2.8,z);
  scene.add(leaves);
}

for(let i=0;i<80;i++){
  tree(Math.random()*100-50, Math.random()*100-50);
}

// ANIMALS
const animals=[];
function spawnAnimal(x,z){
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.5,1.2), animalMat);
  a.position.set(x,1,z);
  scene.add(a);
  animals.push({
    mesh:a,
    dir:Math.random()*Math.PI*2,
    timer:50+Math.random()*100
  });
}

for(let i=0;i<10;i++){
  spawnAnimal(Math.random()*80-40, Math.random()*80-40);
}

// PLAYER CONTROL
let yaw=0,pitch=0,velY=0;
const keys={};

document.body.onclick=()=>document.body.requestPointerLock();

onmousemove=e=>{
  if(document.pointerLockElement){
    yaw-=e.movementX*0.002;
    pitch-=e.movementY*0.002;
    pitch=Math.max(-1.4,Math.min(1.4,pitch));
  }
};

onkeydown=e=>keys[e.key.toLowerCase()]=true;
onkeyup=e=>keys[e.key.toLowerCase()]=false;

// HOTBAR SELECT
let selected=0;
document.querySelectorAll(".slot").forEach((s,i)=>{
  s.onclick=()=>{
    document.querySelectorAll(".slot").forEach(x=>x.classList.remove("active"));
    s.classList.add("active");
    selected=i;
  }
});

// LOOP
function animate(){
  requestAnimationFrame(animate);

  let speed = keys["shift"] ? 0.25 : 0.12;

  if(keys["w"]){
    camera.position.x -= Math.sin(yaw)*speed;
    camera.position.z -= Math.cos(yaw)*speed;
  }
  if(keys["s"]){
    camera.position.x += Math.sin(yaw)*speed;
    camera.position.z += Math.cos(yaw)*speed;
  }

  velY -= 0.01;
  camera.position.y += velY;
  if(camera.position.y<3){camera.position.y=3;velY=0;}
  if(keys[" "] && camera.position.y<=3.01) velY=0.25;

  animals.forEach(a=>{
    a.timer--;
    if(a.timer<=0){
      a.dir=Math.random()*Math.PI*2;
      a.timer=50+Math.random()*100;
    }
    a.mesh.position.x+=Math.sin(a.dir)*0.02;
    a.mesh.position.z+=Math.cos(a.dir)*0.02;
  });

  camera.rotation.set(pitch,yaw,0);
  renderer.render(scene,camera);
}
animate();
