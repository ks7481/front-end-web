const ingredients = [
  { id: "bat", name: "Wool of bat", emoji: "🦇", color: "#5b3a8c", flavor: "mothballs" },
  { id: "newt", name: "Eye of newt", emoji: "👁️", color: "#7bd13a", flavor: "pond water" },
  { id: "spider", name: "Spider legs", emoji: "🕷️", color: "#2f2f3a", flavor: "cobwebs" },
  { id: "nails", name: "Coffin nails", emoji: "⚰️", color: "#8a8f98", flavor: "old pennies" },
  { id: "unicorn", name: "Unicorn blood", emoji: "🦄", color: "#e86cc8", flavor: "cotton candy" },
  { id: "dragon", name: "Dragon scale", emoji: "🐉", color: "#e8512a", flavor: "campfire smoke" },
  { id: "pumpkin", name: "Pumpkin guts", emoji: "🎃", color: "#f28c1a", flavor: "pumpkin pie" },
  { id: "moon", name: "Moonstone dust", emoji: "🌙", color: "#b9c6ff", flavor: "cold milk" },
  { id: "pepper", name: "Ghost pepper", emoji: "🌶️", color: "#d62828", flavor: "pure regret" }
];

const combos = [
  { needs: ["bat", "newt", "spider", "nails"], name: "Potion of Graveyard Shift", text: "You're wide awake at 3 a.m., and the dead are surprisingly good company." },
  { needs: ["unicorn", "dragon", "pumpkin", "moon"], name: "Elixir of the Great Pumpkin Parade", text: "A glittering, fire-breathing pumpkin parade follows you everywhere." },
  { needs: ["pepper", "dragon", "newt", "spider"], name: "Potion of Lava Lungs", text: "Your sneezes now count as volcanic eruptions. Keep tissues away from curtains." },
  { needs: ["unicorn", "moon", "bat", "newt"], name: "Potion of the Witching Hour", text: "It's always midnight around you, and everyone is a little spooky." },
  { needs: ["nails", "pumpkin", "spider", "moon"], name: "Potion of the Haunted Hayride", text: "A creaky wagon appears and offers you a ride. Say no. Or yes." },
  { needs: ["pepper", "unicorn", "spider", "nails"], name: "Potion of Total Chaos", text: "Nothing makes sense, everything sparkles, and something is definitely on fire." },
  { needs: ["bat", "newt", "spider"], name: "Potion of Invisibility", text: "You can't see it. Neither can you see your hands. Worth it." },
  { needs: ["unicorn", "dragon", "moon"], name: "Elixir of Eternal Twilight", text: "The sun never quite sets around you. Very dramatic lighting." },
  { needs: ["pumpkin", "pepper", "dragon"], name: "Potion of Jack-o'-Lantern Fury", text: "Your head glows orange and you breathe tiny flames. Do not sneeze." },
  { needs: ["nails", "spider", "moon"], name: "Potion of Shadow Walking", text: "Your shadow gets up and walks ahead of you. Try to keep up." },
  { needs: ["bat", "newt"], name: "Potion of Night Vision", text: "Every shadow turns bright as noon. Mind the bats." },
  { needs: ["unicorn", "dragon"], name: "Potion of Mythical Courage", text: "You feel brave enough to knock on any haunted door." },
  { needs: ["spider", "nails"], name: "Potion of Sticky Fingers", text: "Everything you touch sticks to you. Including the cat." },
  { needs: ["nails", "newt"], name: "Potion of Grave Whispers", text: "You can hear the graveyard gossiping. It's mostly about you." },
  { needs: ["unicorn", "bat"], name: "Potion of Moonlit Flight", text: "Your feet leave the ground. Your stomach stays behind." },
  { needs: ["pumpkin", "pepper"], name: "Potion of Pumpkin Spice Scream", text: "Warm, cozy, and absolutely on fire." },
  { needs: ["moon", "newt"], name: "Potion of Sleepwalking", text: "You wake up in the neighbor's yard wearing a cape." },
  { needs: ["moon", "unicorn"], name: "Potion of Sweet Dreams", text: "Tonight you dream in sparkles. Zero nightmares guaranteed." },
  { needs: ["moon", "bat"], name: "Potion of Echo Hearing", text: "You can hear a spider tiptoe across the attic. Rude." },
  { needs: ["pumpkin", "spider"], name: "Potion of Itchy Harvest", text: "Your skin tingles like you walked through a cornfield of cobwebs." },
  { needs: ["pumpkin", "unicorn"], name: "Potion of Sparkling Gourd", text: "Any pumpkin you touch turns glittery. Pie not included." },
  { needs: ["pepper", "newt"], name: "Potion of Hiccuping Fire", text: "Every hiccup shoots out a small, polite flame." },
  { needs: ["pepper", "unicorn"], name: "Potion of Rainbow Burps", text: "Spicy, sweet, and extremely colorful." },
  { needs: ["dragon", "nails"], name: "Potion of Iron Skin", text: "Nothing can hurt you. You also can't swim." },
  { needs: ["dragon", "bat"], name: "Potion of Dragon Wings", text: "You sprout leathery wings. Doorways become a real problem." },
  { needs: ["dragon", "spider"], name: "Potion of Eight-Legged Sprint", text: "You can run up walls. Please stay off the ceiling." },
  { needs: ["pumpkin", "nails"], name: "Potion of Scarecrow Strength", text: "You're stuffed with straw and strong as an ox. Crows fear you." },
  { needs: ["pumpkin", "moon"], name: "Potion of Harvest Moon Glow", text: "You shimmer softly like a lantern in a cornfield." }
];

const MAX_INGREDIENTS = 4;

const cauldronShapes = [
  { label: "Round pot",
  top: 7.0, bottom: 183.5,
  line: "M238.43,167.77c-1.46-3.87-2.3-8.91.44-12.42,15.89-20.35,21.97-45.99,16.18-71.26-2.87-12.54-7.67-24.16-14.41-35.07-3.09-5.01,2.72-7.66,6.4-14.67,8.64-16.43-13.61-29.06-29.42-29.5-39.14-1.08-97.36-.78-133.31,0-11.41.25-24.27,5.62-30.57,14.32-3.49,4.82-3.43,10.88-.28,15.79,3.13,4.88,8.11,8.86,6.36,12.34l-7.54,15.03c-4.63,9.23-7.27,18.93-8.69,29.24-3.17,22.98,3.12,45.78,17.58,63.73,2.18,2.7,2,5.45,1.04,8.51-3.38,10.87-7.61,21.05-11.87,31.46-2.8,6.84.06,14.25,5.98,17.97,6.31,3.96,14.15,4.64,20.93,1.7,4.4-1.91,7.16-6.05,7.33-10.82.32-8.9,1.39-17.38,3.34-26.06.43-1.9,2.25-2.87,4.25-2.12,36.95,13.87,79.21,13.91,116.26-.02.91-.34,1.83-.35,2.45.1.41.3.96,1,1.09,1.75l3.35,19.11c.87,4.95,2.21,9.61,4.48,13.98,3.62,6.95,11,10,18.48,7.31,8.86-3.18,13.63-12.82,10.8-22.15l-10.66-28.26Z",
  fill: "M236.03,154.53c.2-.31.4-.62.63-.91,15.45-19.79,21.15-44.91,15.65-68.9-2.81-12.25-7.41-23.45-14.06-34.22-3.07-4.98-.1-8.69,2.52-11.97,1.25-1.56,2.66-3.32,3.79-5.48,2.16-4.11,2.13-8.13-.1-11.94-3.63-6.21-14.96-13.12-26.92-13.45-38.4-1.06-96.06-.8-133.17,0-11.26.24-22.92,5.65-28.36,13.16-2.71,3.74-2.78,8.57-.19,12.62.83,1.29,1.83,2.55,2.8,3.78,2.7,3.4,5.76,7.26,3.71,11.34l-7.53,15.03c-4.18,8.34-6.94,17.62-8.42,28.37-3.08,22.3,2.96,44.17,16.99,61.58.28.34.52.69.74,1.04,2.67,3.2,6.67,7.73,11.6,11.15,4.92,3.41,11.64,5.77,16.03,7.22.48.07.96.19,1.44.37,36.32,13.63,77.98,13.63,114.29-.02.42-.16.84-.26,1.25-.33,4.1-1.41,10.26-3.87,15.59-7.57,4.91-3.41,9.02-7.71,11.72-10.87Z" },
  { label: "Curly feet",
  top: 7.7, bottom: 201.9,
  line: "M284.26,74.57c-2.3,7.51-6.37,13.41-11.37,19.32l-11.43,13.49c-1.52,1.8-2.42,4.09-2.49,6.64-.85,31.12-19.38,57.33-45.87,73.33-.55,3.67.09,7.52,1.84,10.85,1.28,2.44,4.06,4.1,6.63,3.14,1.23-.46,1.39-2.02,1-3.01-.37-.94-1.51-1.24-2.67-1.68-2.75-1.04-3.28-4.04-2.51-6.63.64-2.17,3.1-4.08,5.92-3.85,6.09.49,10.64,5.57,11.38,11.62.68,5.54-1.35,10.66-5.37,13.83-4.33,3.42-9.94,4.4-15.25,2.19-5.62-2.34-9.36-7.23-11.45-12.89l-2.49-6.74c-32.11,13.98-67.83,13.8-100.15.13-1.49,2.03-1.78,4.46-2.65,6.81-2.1,5.69-5.96,10.46-11.64,12.74-5.12,2.05-10.47,1.22-14.84-2.05-3.93-2.94-5.98-7.94-5.61-13.36.42-6.31,4.8-11.37,11.2-12.15,1.87-.23,3.51.34,4.7,1.47,1.27,1.21,1.94,2.95,1.77,4.99-.41,4.81-5.76,3.72-5.74,6.52,0,1.15.91,2.24,2.36,2.34,5.62.37,8.02-7.59,7.4-14.09-25.21-15.6-43.16-39.79-45.72-69.54-.29-3.34-.06-6.67-1.87-9.45-8.09-12.37-18.86-18.1-23.68-34.66-2.54-8.72-.15-17.3,5.95-23.8,6.97-7.44,17.52-8.41,25.75-2.12,3.46,2.65,5.64,6.3,7.63,10.76l3.7-5.04c1.23-1.68.78-3.85-1.08-4.82l-5.53-2.88c-6.84-3.56-4.91-10.3-5.96-17.73-.86-6.07,1.58-12.47,7.29-14.46,13.51-4.7,35.78-7.32,51.41-7.69,30.19-.71,58.71-1.83,89.61-.48,15.45.68,39.32,3.61,51.93,8.07,6.81,2.41,8.87,10.12,7.04,17.13l-.36,8.1c-.36,8.1-13.66,8.44-12.39,13.11.64,2.34,2.5,4.69,4.32,6.79,3.43-9.86,12.78-17.17,23.18-14.58,13.16,3.28,19.96,17.69,16.09,30.3ZM253.04,79.38c1.89-.81,3.49.48,5.33.58,4.48.26,8.48-2.47,8.95-6.77s-2.14-6.63-5.91-7.21c-2.47-.38-2.89-3.83-2.01-5.7.98-2.07,3.53-3,5.94-1.94,6.49,2.85,6.33,12.13,2.07,19.29-2.92,4.91-6.56,9.16-11.23,12.77l-3.14-11.03ZM46.58,78.75l-2.76,11.69c-7.05-5.71-13.75-14.11-14.27-22.41-.24-3.81,1.28-7.55,4.51-9.44,2.3-1.35,5-.52,6.25,1.24s.98,5.69-1.4,6.15c-3.06.59-5.48,1.61-6.11,4.98-.71,3.8,1.44,7.26,5.17,8.42,2.72.84,5.02.48,8.62-.63Z",
  fill: "M254.68,95.05l-.03.02-4.91-17.26.09-.04c-.38-1.72-.55-4.18-1.56-7.22-.63-1.9-1.46-4.53-2.24-6.37l-.02.06-3.11-3.6c-2.08-2.41-4.11-5.03-4.89-7.86-1.16-4.25,3-6.39,6.03-7.95,3.7-1.9,6.14-3.35,6.26-6.01l.37-8.39.07-.28c1.38-5.28.31-11.86-5.3-13.85-11.89-4.21-35.22-7.22-51.14-7.92-26.17-1.15-50.35-.52-75.94.14-4.47.12-8.96.23-13.48.34-14.95.35-37.15,2.86-50.58,7.53-4.65,1.62-6.1,7.09-5.48,11.48.28,1.98.36,3.85.43,5.65.23,5.46.5,8.17,4.07,10.03l5.53,2.88c1.58.82,2.71,2.24,3.09,3.91.39,1.69,0,3.5-1.07,4.97l-6.49,8.85-.05-.1c-.81,1.5-1.62,3.17-2.36,5.13-.72,1.91-1.34,3.85-1.78,5.57l.12-.04-4.86,20.61-.06-.05c-.43,2.07-1.01,4.64-1.42,6.57-.7,3.32-.57,7.23-.55,10.19.21,1.3.29,2.58.36,3.8.03.63.07,1.27.12,1.91,2.34,27.2,18.12,51.16,44.43,67.44l1.16.72v.11c1.25.76,2.51,1.49,4.19,2.36,1.87.97,3.59,1.84,5.28,2.63l.05-.07,2,.85c31.96,13.52,66.76,13.48,97.99-.12l2.66-1.16.03.09c1.11-.54,2.25-1.13,3.68-1.86,1.52-.79,3.38-1.87,5.14-2.93l.02-.13,1.1-.67c27.53-16.63,43.76-42.53,44.54-71.06.01-.43.05-.86.1-1.28,0-3.43,0-7.34-.5-10.71-.36-2.47-.75-4.65-1.15-6.91Z" },
  { label: "Round kettle",
  top: 9.4, bottom: 192.3,
  line: "M248.18,57.3c3.48-6.03,3.95-12.75,2.76-19.47-1.7-9.67-7.31-17.39-16.27-21.75.76-3.74-1.37-9.4-6.07-9.4l-158.07-.02c-4.86,0-6.93,5.56-6.36,9.43-3.9,2.45-7.4,4.42-10.1,7.88-7.03,9.01-8.95,23.17-3.22,33.29-13.36,20.79-14.16,51.92-7.42,75.01,5.3,18.15,16.64,33.54,32.17,43.68l-7.34,19.41c-.78,2.07-.82,4.49.19,6.29,2.76,4.92,14.1,4.82,17.14-.67l8.6-15.56c14.26,6,28.71,8.4,43.82,8.92l2.03,15.61c.34,2.64,1.89,4.79,4.45,5.77,5.78,2.21,13.79.59,14.54-5.33l2.03-16c15.13-.56,29.61-3.11,43.74-8.92l8.07,14.61c2.88,5.22,7.86,5.67,13.89,4.6,3.7-1.17,5.6-4.73,4.24-8.4l-7.5-20.3c16.26-10.75,27.62-26.53,32.62-45.45,6.05-22.87,5.26-52.84-7.93-73.22ZM236.13,33.42c-2.68-4.19-7.58-7.16-10.2-4.78-.54.49-.99,1.44-1.09,2.56-.15,6.84,6.75,15.21,12.91,18.76,1.92-6.03,1.11-11.63-1.62-16.53ZM73.98,30.79c-.19-2.08-2.05-3.45-4.09-2.9-8.14,2.18-12.01,13.88-8.38,22.08,6.02-4,13.12-12.3,12.48-19.18Z",
  fill: "M245.87,58.79l-.82-1.27-5.68-3.57-.03.09-2.95-1.7c-7.01-4.03-14.46-13.28-14.29-21.19v-.17c.15-1.77.88-3.36,1.99-4.37.08-.07.17-.14.26-.21l2.01-2.41c.75-.94,1.51-1.89,2.24-2.81.67-.84,1.49-1.71,2.25-2.57l.8-.96-.08-.04.42-2.08c.33-1.61-.2-3.76-1.22-5-.61-.74-1.32-1.11-2.17-1.11l-158.07-.02h0c-.92,0-1.64.34-2.27,1.07-1.06,1.22-1.63,3.41-1.37,5.21l.26,1.77h0c1.29,1.26,2.64,2.66,4,4.24,1.49,1.73,2.77,3.5,3.89,5.13.95.99,1.56,2.29,1.69,3.72.81,8.73-7.74,17.78-13.69,21.72l-2.71,1.8-.04-.08c-1.28.21-2.44.71-3.88,1.57-1.24.75-1.66,1.09-2.4,1.7l.05.09-.9,1.39c-13.46,20.94-13.26,51.63-7.1,72.75,5.09,17.44,16.11,32.41,31.04,42.15l1.85,1.21-.04.12c1.75,1.23,3.63,2.62,6.14,3.88,2.76,1.39,5.62,2.43,7.89,3.18l.05-.09,2.27.96c12.77,5.37,26.38,8.14,42.85,8.71l2.33.08.02.12c2.72.27,4.71.49,8.23.51,3.62.01,7.03-.14,9.94-.49v-.09s2.34-.09,2.34-.09c15.96-.59,29.96-3.44,42.8-8.71l2.26-.93.06.11c2.1-.78,3.5-1.15,6.11-2.46,3.03-1.52,5.81-3.14,8.01-4.67l-.04-.1,1.81-1.2c15.76-10.42,26.64-25.59,31.48-43.86,5.14-19.42,6.23-49.68-7.59-71.02Z" },
];

let addedIngredients = [];
let isBottled = false;
let shapeIndex = 0;
let discovered = [];

const svg = document.querySelector("#cauldronSvg");
const bubbleLayer = document.querySelector("#bubbleLayer");
const message = document.querySelector("#message");
const addedList = document.querySelector("#added");
const tally = document.querySelector("#tally");
const ingredientBox = document.querySelector("#ingredients");
const shapeBox = document.querySelector("#shapes");
const bottleBtn = document.querySelector("#bottleBtn");
const resetBtn = document.querySelector("#resetBtn");
const resultBox = document.querySelector("#result");
const bottleIcon = document.querySelector("#bottle");
const potionName = document.querySelector("#potionName");
const potionText = document.querySelector("#potionText");
let liquid = null;

const getIngredient = id => ingredients.find(i => i.id === id);

function averageColor(ids) {
  let r = 0, g = 0, b = 0;
  for (const id of ids) {
    const hex = getIngredient(id).color;
    r += parseInt(hex.slice(1, 3), 16);
    g += parseInt(hex.slice(3, 5), 16);
    b += parseInt(hex.slice(5, 7), 16);
  }
  const n = ids.length;
  return `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`;
}

function findCombo() {
  return combos.find(c => c.needs.every(id => addedIngredients.includes(id)));
}

function drawCauldron() {
  const s = cauldronShapes[shapeIndex];
  svg.innerHTML = `
  <defs><clipPath id="fillClip"><path d="${s.fill}"/></clipPath></defs>
  <path d="${s.line}" fill="#2a2a2e" fill-rule="evenodd"/>
  <g clip-path="url(#fillClip)">
    <g id="liquid" fill="#444">
    <rect x="0" y="0" width="300" height="300"/>
    <rect x="0" y="0" width="300" height="3" fill="#fff" fill-opacity=".3"/>
    </g>
  </g>
  <path d="${s.line}" fill="none" stroke="#0d0d10" stroke-width="5.75" stroke-linejoin="round" stroke-linecap="round"/>`;
  liquid = svg.querySelector("#liquid");
  updateLiquid();
}

function updateLiquid() {
  const s = cauldronShapes[shapeIndex];
  const count = addedIngredients.length;
  const surfaceY = count === 0
  ? s.bottom + 40
  : s.bottom - (s.bottom - s.top) * (count / MAX_INGREDIENTS);
  liquid.style.transform = `translateY(${surfaceY}px)`;
  liquid.style.fill = count > 0 ? averageColor(addedIngredients) : "#444";
}

function spawnBubbles(color) {
  for (let i = 0; i < 8; i++) {
  const b = document.createElement("span");
  const size = 10 + Math.random() * 14;
  b.className = "bubble";
  b.style.width = b.style.height = size + "px";
  b.style.left = (150 + (Math.random() - 0.5) * 140 - size / 2) + "px";
  b.style.bottom = "215px";  // start near the top edge of the cauldron
  b.style.setProperty("--c", color);
  b.style.setProperty("--dx", (Math.random() * 50 - 25) + "px");
  b.style.setProperty("--delay", (Math.random() * 0.4) + "s");
  b.style.setProperty("--dur", (1.2 + Math.random() * 0.8) + "s");
  b.addEventListener("animationend", () => b.remove());
  bubbleLayer.appendChild(b);
  }
}

function updatePage() {
  const count = addedIngredients.length;
  updateLiquid();
  addedList.textContent = count
  ? "Added: " + addedIngredients.map(id => getIngredient(id).name).join(", ")
  : "Added: nothing yet";
  tally.textContent = `Special recipes discovered: ${discovered.length} of ${combos.length}`;
  ingredientBox.querySelectorAll("button").forEach(b => {
  b.disabled = isBottled || count >= MAX_INGREDIENTS;
  });
  bottleBtn.disabled = isBottled;
}

const rowSize = Math.floor(ingredients.length / 2);
const ingredientRows = [document.createElement("div"), document.createElement("div")];
ingredientRows.forEach(r => { r.className = "row"; ingredientBox.appendChild(r); });

ingredients.forEach((item, index) => {
  const btn = document.createElement("button");
  btn.textContent = item.emoji + " " + item.name;
  btn.addEventListener("click", () => {
  addedIngredients.push(item.id);
  message.textContent = `You drop in the ${item.name.toLowerCase()}. It bubbles ominously...`;
  spawnBubbles(item.color);
  updatePage();
  });
  ingredientRows[index < rowSize ? 0 : 1].appendChild(btn);
});

cauldronShapes.forEach((shape, index) => {
  const btn = document.createElement("button");
  btn.textContent = shape.label;
  if (index === shapeIndex) btn.classList.add("active");
  btn.addEventListener("click", () => {
  shapeIndex = index;
  shapeBox.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  drawCauldron();
  });
  shapeBox.appendChild(btn);
});

bottleBtn.addEventListener("click", () => {
  if (addedIngredients.length < 2) {
    message.textContent = "Add at least 2 ingredients before bottling.";
    return;
  }
  const combo = findCombo();
  isBottled = true;
  resultBox.hidden = false;
  if (combo) {
    const isNew = !discovered.includes(combo.name);
    if (isNew) discovered.push(combo.name);
    bottleIcon.textContent = "✨🧪✨";
    potionName.textContent = combo.name;
    potionText.textContent = combo.text;
    message.textContent = isNew ? "Bottled! New recipe discovered!" : "Bottled! You've made this one before.";
  } else {
    const unique = [...new Set(addedIngredients)];
    const flavors = unique.map(id => getIngredient(id).flavor);
    bottleIcon.textContent = "🧪";
    if (unique.length === 1) {
      potionName.textContent = `Potion of Way Too Much ${getIngredient(unique[0]).name}`;
      potionText.textContent = `It tastes like ${flavors[0]}, and nothing else. Try mixing in something new.`;
    } else {
      potionName.textContent = "Wobbly Brew";
      potionText.textContent = `It tastes like ${flavors.join(" and ")}. Nobody knows what it does yet. Try a different mix.`;
    }
    message.textContent = "Bottled! No special recipe this time.";
  }
  spawnBubbles(averageColor(addedIngredients));
  updatePage();
});

resetBtn.addEventListener("click", () => {
  addedIngredients = [];
  isBottled = false;
  resultBox.hidden = true;
  message.textContent = "The cauldron is empty.";
  updatePage();
});

drawCauldron();
updatePage();