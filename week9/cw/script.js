const form    = document.getElementById("plant-form");
const input   = document.getElementById("word");
const message = document.getElementById("message");
const plantsEl = document.getElementById("plants");
const topEl   = document.getElementById("top");
const tip     = document.getElementById("tip");

let garden = []; // { key, el }

const NS = "http://www.w3.org/2000/svg";

function make(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(node);
  return node;
}

function lettersOf(raw) {
  return raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z]/g, "").slice(0, 20);
}

function leafPath(shape, s) {
  if (shape === "spiky") {
    return `M0 0 L${s * 0.5} ${-s * 0.2} L${s * 1.25} 0 L${s * 0.5} ${s * 0.2} Z`;
  }
  const w = shape === "round" ? 0.6 : 0.3;
  return `M0 0 C${s * 0.2} ${-s * w}, ${s * 0.9} ${-s * w}, ${s} 0 ` +
         `C${s * 0.9} ${s * w}, ${s * 0.2} ${s * w}, 0 0 Z`;
}

function buildPlant(word, scale) {
  const n = word.length;
  const first = word.charCodeAt(0) - 97;
  const last  = word.charCodeAt(n - 1) - 97;
  const hue   = Math.round(first * 360 / 26);
  const vowelShare = (word.match(/[aeiou]/g) || []).length / n;
  const shape = vowelShare >= 0.45 ? "round" : vowelShare >= 0.25 ? "oval" : "spiky";
  const crown = last < 9 ? "bud" : last < 18 ? "flower" : "spikes";
  const sum   = [...word].reduce((a, c) => a + c.charCodeAt(0), 0);

  const height = Math.min(250, 60 + n * 16);
  const lean   = (sum % 61) - 30;
  const P0 = [60, 290], P1 = [60 + lean, 290 - height], C = [60 - lean * 0.6, 290 - height * 0.55];

  const leafColor = `hsl(${hue} 62% 58%)`;
  const dark      = `hsl(${hue} 45% 32%)`;
  const light     = `hsl(${hue} 80% 78%)`;

  const svg = make("svg", { viewBox: "0 0 120 300", role: "img",
    "aria-label": `A ${word} plant with ${shape} leaves and a ${crown} on top` });
  const g = make("g", { transform: `translate(60 290) scale(${scale}) translate(-60 -290)` }, svg);

  make("ellipse", { cx: 60, cy: 292, rx: 17, ry: 7, fill: "#3b2a22" }, g);
  make("path", { d: `M${P0} Q${C} ${P1}`, fill: "none", stroke: "transparent", "stroke-width": 14 }, g);
  make("path", { d: `M${P0} Q${C} ${P1}`, fill: "none", stroke: dark, "stroke-width": 4, "stroke-linecap": "round" }, g);

  const point = t => [0, 1].map(i => (1 - t) ** 2 * P0[i] + 2 * (1 - t) * t * C[i] + t ** 2 * P1[i]);
  const angle = t => {
    const dx = 2 * (1 - t) * (C[0] - P0[0]) + 2 * t * (P1[0] - C[0]);
    const dy = 2 * (1 - t) * (C[1] - P0[1]) + 2 * t * (P1[1] - C[1]);
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };

  const leaves = Math.min(n, 14);
  for (let i = 0; i < leaves; i++) {
    const t = 0.2 + 0.75 * (i / Math.max(leaves - 1, 1));
    const [x, y] = point(t);
    const side = i % 2 ? 1 : -1;
    make("path", {
      d: leafPath(shape, 20 - 9 * t), fill: leafColor, stroke: dark, "stroke-width": 1,
      transform: `translate(${x} ${y}) rotate(${angle(t) + side * 50})`
    }, g);
  }

  const top = make("g", { transform: `translate(${P1[0]} ${P1[1]})` }, g);
  if (crown === "bud") {
    make("circle", { r: 7, fill: light, stroke: dark, "stroke-width": 1.5 }, top);
  } else if (crown === "flower") {
    for (let k = 0; k < 6; k++) {
      make("ellipse", { cy: -9, rx: 4.5, ry: 8, fill: light, stroke: dark, "stroke-width": 1,
        transform: `rotate(${k * 60})` }, top);
    }
    make("circle", { r: 4.5, fill: dark }, top);
  } else {
    for (const a of [-28, 0, 28]) {
      make("path", { d: "M-4 0 L0 -20 L4 0 Z", fill: leafColor, stroke: dark, "stroke-width": 1,
        transform: `rotate(${a})` }, top);
    }
  }

  const traits = `${n} letter${n === 1 ? "" : "s"} · ${shape} leaves · ${crown}`;
  return { svg, traits };
}

function buildFungus(raw, scale) {
  const chars = [...raw];
  const len = chars.length;
  const hue = 280 + (chars.reduce((a, c) => a + c.codePointAt(0), 0) % 60);
  const rx = 24 + Math.min(len, 10) * 3;

  const svg = make("svg", { viewBox: "0 0 120 300", role: "img", "aria-label": "A fungus" });
  const g = make("g", { transform: `translate(60 290) scale(${scale}) translate(-60 -290)` }, svg);

  make("ellipse", { cx: 60, cy: 292, rx: 17, ry: 7, fill: "#3b2a22" }, g);
  make("rect", { x: 52, y: 245, width: 16, height: 45, rx: 6, fill: `hsl(${hue} 20% 86%)` }, g);
  make("path", { d: `M${60 - rx} 248 A${rx} 40 0 0 1 ${60 + rx} 248 Z`, fill: `hsl(${hue} 55% 46%)` }, g);
  for (let i = 0; i < Math.min(len, 8); i++) {
    make("circle", {
      cx: 60 + ((i % 4) - 1.5) * rx * 0.45,
      cy: 236 - Math.floor(i / 4) * 12 - (i % 2) * 3,
      r: 3 + (i % 3), fill: `hsl(${hue} 80% 88%)`
    }, g);
  }
  const traits = `fungus · ${len} character${len === 1 ? "" : "s"}`;
  return { svg, traits };
}

function addToGarden(key, label, built, count) {
  const fig = document.createElement("figure");
  fig.className = "plant";
  fig.tabIndex = 0;                       // keyboard users can reach the label too
  fig.dataset.word = count > 1 ? `${label} ×${count}` : label;
  fig.dataset.traits = built.traits;
  fig.appendChild(built.svg);
  plantsEl.appendChild(fig);
  garden.push({ key, el: fig });
}

function trimGarden() {
  const limit = topEl.getBoundingClientRect().bottom + 8;
  let composted = false;
  while (garden.length > 1) {
    const highest = Math.min(...garden.map(p => p.el.getBoundingClientRect().top));
    if (highest >= limit) break;
    garden.shift().el.remove();
    composted = true;
  }
  garden.forEach((p, i) => p.el.style.zIndex = 1000 - i);
  return composted;
}

function plant(raw) {
  const letters = lettersOf(raw);
  const isFungus = letters.length === 0;
  const key = isFungus ? "fungus:" + raw : letters;
  const count = garden.filter(p => p.key === key).length + 1;
  const scale = Math.max(0.45, 1 - 0.3 * (count - 1)); // repeats grow smaller

  const built = isFungus ? buildFungus(raw, scale) : buildPlant(letters, scale);
  const label = isFungus ? (raw || "nothing") : letters;
  addToGarden(key, label, built, count);

  let text;
  if (isFungus && raw === "") text = "You planted nothing. Something grew anyway.";
  else if (isFungus)          text = "The vault doesn't recognize that one. A fungus grew instead.";
  else if (count > 1)         text = `Another “${letters}”. It grew in the shade of the first.`;
  else if (letters !== raw.toLowerCase()) text = `“${letters}” took root. Everything that wasn't a letter stayed in the soil.`;
  else                        text = `“${letters}” took root.`;
  message.textContent = text;
  if (trimGarden()) message.textContent += " The vault is full, so the oldest plant was composted.";
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  plant(input.value.trim());
  input.value = "";
  input.focus();
});

document.getElementById("clear").addEventListener("click", function () {
  plantsEl.innerHTML = "";
  garden = [];
  tip.hidden = true;
  message.textContent = "The vault is empty.";
});

function showTip(fig) {
  tip.textContent = "";
  const name = document.createElement("strong");
  name.textContent = fig.dataset.word;
  const sub = document.createElement("span");
  sub.textContent = fig.dataset.traits;
  tip.append(name, sub);
  tip.hidden = false;
}

function moveTip(x, y) {
  const w = tip.offsetWidth;
  tip.style.left = Math.max(8, Math.min(x + 14, window.innerWidth - w - 8)) + "px";
  tip.style.top = Math.max(8, y - 44) + "px";
}

plantsEl.addEventListener("mouseover", function (e) {
  const fig = e.target.closest(".plant");
  if (!fig) return;
  showTip(fig);
  moveTip(e.clientX, e.clientY);
});
plantsEl.addEventListener("mousemove", function (e) {
  if (!tip.hidden) moveTip(e.clientX, e.clientY);
});
plantsEl.addEventListener("mouseout", function (e) {
  if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(".plant")) tip.hidden = true;
});
plantsEl.addEventListener("focusin", function (e) {
  const fig = e.target.closest(".plant");
  if (!fig) return;
  showTip(fig);
  const r = fig.getBoundingClientRect();
  moveTip(r.left + r.width / 2, r.top + r.height / 2);
});
plantsEl.addEventListener("focusout", function () { tip.hidden = true; });