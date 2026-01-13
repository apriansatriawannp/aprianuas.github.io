const map = document.getElementById("map");
let selectedItem = "castle";

const items = {
    castle: "🏰",
    wall: "🧱",
    tree: "🌳",
    tower: "🗼"
};

function setItem(item) {
    selectedItem = item;
}

// Buat grid
for (let i = 0; i < 260; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    cell.addEventListener("click", () => {
        cell.textContent = items[selectedItem];
    });

    map.appendChild(cell);
}
