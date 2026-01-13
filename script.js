const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const tileSize = 50;
let cam = { x: 0, y: 0 };
let dragging = false;
let last = { x: 0, y: 0 };

let selected = "grass";

function selectTile(type) {
    selected = type;
}

const world = {};
const key = (x, y) => `${x},${y}`;

// Mouse controls
canvas.onmousedown = e => {
    if (e.button === 1 || e.button === 2) {
        dragging = true;
        last.x = e.clientX;
        last.y = e.clientY;
    }
};

canvas.onmouseup = () => dragging = false;

canvas.onmousemove = e => {
    if (dragging) {
        cam.x += e.clientX - last.x;
        cam.y += e.clientY - last.y;
        last.x = e.clientX;
        last.y = e.clientY;
    }
};

canvas.oncontextmenu = e => e.preventDefault();

// Build
canvas.onclick = e => {
    const x = Math.floor((e.clientX - cam.x) / tileSize);
    const y = Math.floor((e.clientY - cam.y) / tileSize);
    world[key(x, y)] = selected;
};

// Delete
canvas.addEventListener("contextmenu", e => {
    const x = Math.floor((e.clientX - cam.x) / tileSize);
    const y = Math.floor((e.clientY - cam.y) / tileSize);
    delete world[key(x, y)];
});

function drawTile(type, x, y) {
    const px = x * tileSize + cam.x;
    const py = y * tileSize + cam.y;

    if (type === "grass") {
        ctx.fillStyle = "#5fbf4a";
        ctx.fillRect(px, py, tileSize, tileSize);
    }

    if (type === "stone") {
        ctx.fillStyle = "#888";
        ctx.fillRect(px, py, tileSize, tileSize);
    }

    if (type === "wood") {
        ctx.fillStyle = "#a36a3a";
        ctx.fillRect(px, py, tileSize, tileSize);
    }

    if (type === "tree") {
        ctx.fillStyle = "#5fbf4a";
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = "#2e7d32";
        ctx.beginPath();
        ctx.arc(px + 25, py + 25, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    if (type === "castle") {
        ctx.fillStyle = "#aaa";
        ctx.fillRect(px + 10, py + 10, 30, 30);
        ctx.fillStyle = "#555";
        ctx.fillRect(px + 18, py + 18, 14, 14);
    }
}

function drawBackground() {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc((Date.now() / 50 + i * 200) % innerWidth, 80 + i * 30, 40, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGrid() {
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    for (let y = -50; y < 100; y++) {
        for (let x = -50; x < 100; x++) {
            ctx.strokeRect(x * tileSize + cam.x, y * tileSize + cam.y, tileSize, tileSize);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawGrid();

    for (let k in world) {
        const [x, y] = k.split(",").map(Number);
        drawTile(world[k], x, y);
    }

    requestAnimationFrame(draw);
}

draw();
