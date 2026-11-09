const COMMISSIONS = [
  { kind: "jar", text: "A small jar with a tight lid. For tea. She always said the lid should click.",
    h: [70, 110], b: [70, 100], n: [30, 55], w: [6, 12],
    tell: { h: ["Too squat. The tea won't fit.", "Too tall for the shelf by the stove."],
            b: ["Too slight. A jar should feel fat in the hand.", "Too wide. It won't sit beside the others."],
            n: ["The mouth is so small the lid would never go in.", "The mouth is too wide for a lid that clicks."],
            w: ["Too thin. It would chip the first winter.", "Too heavy. A jar should be easy to lift."] } },
  { kind: "vase", text: "A vase with a narrow neck. It must never tip. One stem in it, nothing more.",
    h: [130, 190], b: [80, 120], n: [20, 40], w: [6, 12],
    tell: { h: ["Too short. A single stem would look lost.", "Too tall. It would tip in a draft."],
            b: ["Too narrow at the belly. It would tip.", "Too round. It would crowd the window."],
            n: ["The neck is pinched shut. No stem fits.", "The neck is too open. It would hold a bouquet, and that's not the point."],
            w: ["Too delicate. It wouldn't survive being moved.", "Too thick. A vase should sound like a bell when tapped."] } },
  { kind: "bowl", text: "A wide bowl. It should hold more than it looks like it can.",
    h: [60, 100], b: [110, 140], n: [85, 120], w: [5, 11],
    tell: { h: ["Too shallow. It would hold nothing.", "Too deep. That's a pot, not a bowl."],
            b: ["Not wide enough to be generous.", "Too wide. It wouldn't fit in two hands."],
            n: ["The opening is too closed. A bowl should be open.", "The opening is too wide. It's more of a plate."],
            w: ["Too thin. A bowl must be able to hold something heavy.", "Too thick. It's all clay and no room."] } },
  { kind: "pitcher", text: "A tall pitcher with a generous belly. For lemonade. I used to love the sound of the ice in it.",
    h: [130, 180], b: [95, 130], n: [50, 75], w: [6, 12],
    tell: { h: ["Too short. It wouldn't pour properly.", "Too tall. Nobody could lift it full."],
            b: ["Too narrow. A pitcher should be generous.", "Too wide. It wouldn't fit in the cupboard."],
            n: ["The mouth is too tight. The ice wouldn't fit.", "The mouth is too wide. It would slosh everywhere."],
            w: ["Too thin. It would crack at the first ice cube.", "Too heavy. Pouring would be a chore."] } },
  { kind: "cup", text: "A little cup that fits in one palm. Thick walls, please. I can't feel warm things anymore, so I want to remember what holding one was like.",
    h: [60, 85], b: [60, 85], n: [50, 75], w: [9, 13],
    tell: { h: ["Too shallow. It holds one sip.", "Too tall for one palm."],
            b: ["Too small. Fit for a toddler.", "Too wide for one hand."],
            n: ["The rim is too narrow to drink from.", "The rim is too wide. The tea would cool too fast."],
            w: ["Too thin. I wouldn't remember it was there.", "Too thick. There'd be no room for tea."] } },
  { kind: "candle holder", text: "A slim candle holder. For a candle I keep lit all night, though it never burns down.",
    h: [140, 175], b: [70, 95], n: [30, 50], w: [6, 12],
    tell: { h: ["Too short. The flame would scorch the shelf.", "Too tall. It would sway in the draft I make."],
            b: ["Too narrow. It would tip.", "Too wide. It would swallow the little flame."],
            n: ["The socket is too small for any candle.", "The socket is too wide. The candle would lean."],
            w: ["Too thin. The heat would crack it.", "Too thick. It would never warm through."] } }
];

const PER_NIGHT = 3;

const SLIP_FEET = [
  "No signature. A smudge of clay where the name should be.",
  "Dated for a night that has been long gone.",
  "The ink is still wet, and somehow never dries.",
  "No stamp, no postmark. The door was locked.",
  "Damp, though it didn't rain."
];
const HINTS = [
  "The shelf is colder where the new pot sits.",
  "The wheel turned a quarter-turn on its own.",
  "Your breath fogs, though the kiln is still warm.",
  "There's a thumbprint in the clay that isn't yours.",
  "Someone hums, very quietly, a little off-key.",
  "The stool beside you is warm, as if someone just stood up.",
  "Wet footprints cross the floor. They stop at the wheel.",
  "The lamp flickers when you say a pot's name out loud."
];

const SPARE_CLAY = 2;

const PARTS = ["h", "b", "n", "w"];

const $ = id => document.getElementById(id);
const sliders = { h: $("h"), b: $("b"), n: $("n"), w: $("w") };
const pot = $("pot"), warn = $("warn"), result = $("result"), shelf = $("shelf");
const form = $("kilnForm"), potName = $("potName");

let current, spare, finished, busy, tonight, hintQueue;

const CX = 100, BASE = 240;

function outline(h, b, n, w, inner) {
  const inset = inner ? w : 0;
  const top = BASE - h, mid = BASE - h * 0.4, base = BASE - inset;
  const br = Math.max(b / 2 - inset, 2);
  const nr = Math.max(Math.min(n, b) / 2 - inset, 2);
  const fr = Math.max(b * 0.3 - inset, 2);
  const c = (x, y) => `${CX + x},${y}`, m = (x, y) => `${CX - x},${y}`;
  return `M${m(nr, top)} C${m(nr, top + h * 0.2)} ${m(br, mid - h * 0.2)} ${m(br, mid)} `
    + `C${m(br, mid + h * 0.25)} ${m(fr, base - h * 0.1)} ${m(fr, base)} L${c(fr, base)} `
    + `C${c(fr, base - h * 0.1)} ${c(br, mid + h * 0.25)} ${c(br, mid)} `
    + `C${c(br, mid - h * 0.2)} ${c(nr, top + h * 0.2)} ${c(nr, top)} Z`;
}

function potMarkup(v) {
  const top = BASE - v.h;
  const nrOut = Math.min(v.n, v.b) / 2;
  const nrIn = Math.max(nrOut - v.w, 2);
  return `<path class="outer" d="${outline(v.h, v.b, v.n, v.w, false)}"/>`
    + `<path class="inner" d="${outline(v.h, v.b, v.n, v.w, true)}"/>`
    + `<ellipse class="rimOut" cx="${CX}" cy="${top}" rx="${nrOut}" ry="5"/>`
    + `<ellipse class="rimIn" cx="${CX}" cy="${top}" rx="${nrIn}" ry="3.5"/>`;
}

function values() {
  const v = {};
  PARTS.forEach(p => v[p] = Number(sliders[p].value));
  return v;
}

function physics(v) {
  if (v.h / v.b > 2.6) return "collapse";
  if (v.w < 4) return "slump";
  if (v.w > 13) return "crack";
  return null;
}

function reshape() {
  const v = values();
  PARTS.forEach(p => $(p + "Out").textContent = v[p]);
  pot.innerHTML = potMarkup(v);

  const risk = physics(v);
  const ratio = v.h / v.b;
  const wobbling = risk !== null || ratio > 2.3 || v.w < 5;
  pot.classList.toggle("wobble", wobbling);
  warn.textContent = !wobbling ? ""
    : ratio > 2.3 ? "The clay is leaning. It won't hold much taller or thinner."
    : v.w < 5 ? "The walls are almost see-through."
    : "";
}

PARTS.forEach(p => sliders[p].addEventListener("input", reshape));

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextHint() {
  if (!hintQueue.length) hintQueue = shuffle(HINTS);
  return hintQueue.pop();
}

function showSlip() {
  $("slipCount").textContent = `Commission ${current + 1} of ${tonight.length}`;
  $("slipText").textContent = tonight[current].text;
  $("slipFoot").textContent = SLIP_FEET[Math.floor(Math.random() * SLIP_FEET.length)];
}

function showClay() {
  const W = 176;
  let balls = "";
  for (let i = 0; i < SPARE_CLAY; i++) {
    const cx = (W * (i + 1)) / (SPARE_CLAY + 1);
    balls += `<ellipse class="${i < spare ? "cs-ball" : "cs-ball used"}" cx="${cx}" cy="20" rx="20" ry="16"/>`;
  }
  $("clayShelf").innerHTML = `<svg viewBox="0 0 176 70">`
    + `<polygon class="cs-top" points="16,32 160,32 172,40 4,40"/>${balls}`
    + `<rect class="cs-front" x="4" y="40" width="168" height="26"/>`
    + `<g class="cs-sticker"><rect x="46" y="46" width="84" height="15" rx="1.5"/><text x="88" y="57" text-anchor="middle">Spare Clay</text></g></svg>`;
}

function setControls(on) {
  PARTS.forEach(p => sliders[p].disabled = !on);
  potName.disabled = !on;
  $("fire").disabled = !on;
}

function reset() {
  current = 0; spare = SPARE_CLAY; finished = false; busy = false;
  tonight = shuffle(COMMISSIONS).slice(0, PER_NIGHT);
  hintQueue = shuffle(HINTS);
  shelf.innerHTML = "";
  tonight.forEach(() => shelf.appendChild(document.createElement("li")));
  $("ending").hidden = true;
  result.textContent = "";
  potName.value = "";
  sliders.h.value = 120; sliders.b.value = 90; sliders.n.value = 50; sliders.w.value = 8;
  setControls(true);
  showSlip();
  showClay();
  reshape();
}

function judge(v, c) {
  const risk = physics(v);
  if (risk === "collapse") return { ok: false, kind: "collapse", text: "It was too tall and thin. It folded over on the wheel." };
  if (risk === "slump") return { ok: false, kind: "slump", text: "The walls were too thin. It slumped in the kiln." };
  if (risk === "crack") return { ok: false, kind: "crack", text: "The walls were too thick. Trapped moisture split it open." };
  for (const p of PARTS) {
    if (v[p] < c[p][0]) return { ok: false, kind: "returned", text: "The pot survived, but a note comes back with it: “" + c.tell[p][0] + "”" };
    if (v[p] > c[p][1]) return { ok: false, kind: "returned", text: "The pot survived, but a note comes back with it: “" + c.tell[p][1] + "”" };
  }
  return { ok: true, kind: "good", text: "" };
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!unlocked || finished || busy) return;

  const name = potName.value.trim();
  if (!name) {
    result.textContent = "The kiln won't take a pot that hasn't been named. Give it a name first.";
    potName.focus();
    return;
  }

  const v = values();
  const verdict = judge(v, tonight[current]);
  busy = true;
  setControls(false);

  pot.classList.remove("wobble");
  if (verdict.kind === "collapse" || verdict.kind === "slump" || verdict.kind === "crack") {
    void pot.getBBox();
    pot.classList.add(verdict.kind);
  }
  setTimeout(() => afterFiring(verdict, v, name), 1200);
});

function afterFiring(verdict, v, name) {
  pot.classList.remove("collapse", "slump", "crack");
  busy = false;

  if (verdict.ok) {
    addToShelf(v, name);
    current++;
    potName.value = "";
    if (current >= tonight.length) return win();
    result.textContent = `“${name}” goes on the shelf. A new slip is already under the door. ${nextHint()}`;
    setControls(true);
    showSlip();
    reshape();
    return;
  }

  if (spare === 0) return lose(verdict.text);
  spare--;
  result.textContent = `${verdict.text} Same slip, new clay. ${nextHint()}`;
  setControls(true);
  showClay();
  reshape();
}

function addToShelf(v, name) {
  const li = shelf.children[current];
  li.innerHTML = `<svg viewBox="0 0 200 260">${potMarkup(v)}</svg>`;
  const label = document.createElement("span");
  label.textContent = name;
  li.appendChild(label);
}

function endWith(text) {
  finished = true;
  setControls(false);
  $("endingText").textContent = text;
  $("ending").hidden = false;
}

function win() {
  const names = [...shelf.querySelectorAll("span")].map(sp => sp.textContent);
  const fav = names[Math.floor(Math.random() * names.length)];
  const kinds = tonight.map(c => c.kind);
  const list = `a ${kinds.slice(0, -1).join(", a ")} and a ${kinds[kinds.length - 1]}`;
  result.textContent = "";
  endWith(`The shelf is full: ${list}. The slips weren't from a customer. They were from a ghost. Odie ran this studio a long time ago and never got to finish her last set. A final slip slides under the door, signed with a thumbprint in clay: “Thank you for finishing what I couldn't. I liked ‘${fav}’ best. The key and the studio is yours now, care for them well.”`);
}

function lose(lastText) {
  result.textContent = `${lastText} You're out of clay.`;
  endWith("No slip arrives the next night, or the one after. The wheel stops. Somewhere in the studio, something cold sets down a half-finished pot and doesn't pick it up again.");
}

$("again").addEventListener("click", reset);

const doorSvg = $("doorSvg"), keyEl = $("key"), doorMsg = $("doorMsg");
const KEY_HOME = { x: 38, y: 335 }, KEYHOLE = { x: 202, y: 216 }, KEY_TIP = 46, SNAP = 28;
let keyPos = { x: KEY_HOME.x, y: KEY_HOME.y }, grab = null, unlocked = false;

function placeKey(x, y) {
  keyPos = { x, y };
  keyEl.setAttribute("transform", `translate(${x} ${y})`);
}
function svgPoint(e) {
  const pt = doorSvg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(doorSvg.getScreenCTM().inverse());
}
function nearLock() {
  return Math.hypot(keyPos.x + KEY_TIP - KEYHOLE.x, keyPos.y - KEYHOLE.y) < SNAP;
}

function unlock() {
  if (unlocked) return;
  unlocked = true;
  placeKey(KEYHOLE.x - KEY_TIP, KEYHOLE.y);
  doorMsg.textContent = "Click. The door swings open.";
  doorSvg.classList.add("open");
  setTimeout(function () {
    $("doorway").hidden = true;
    $("game").hidden = false;
  }, 1500);
}

keyEl.addEventListener("mousedown", e => e.preventDefault());
keyEl.addEventListener("pointerdown", function (e) {
  if (unlocked) return;
  const p = svgPoint(e);
  grab = { dx: p.x - keyPos.x, dy: p.y - keyPos.y };
  keyEl.setPointerCapture(e.pointerId);
  keyEl.classList.add("held");
  doorMsg.textContent = "";
});
keyEl.addEventListener("pointermove", function (e) {
  if (!grab) return;
  const p = svgPoint(e);
  placeKey(p.x - grab.dx, p.y - grab.dy);
});
function dropKey() {
  if (!grab) return;
  grab = null;
  keyEl.classList.remove("held");
  if (nearLock()) { unlock(); return; }
  placeKey(KEY_HOME.x, KEY_HOME.y);
}
keyEl.addEventListener("pointerup", dropKey);
keyEl.addEventListener("pointercancel", dropKey);
keyEl.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); unlock(); }
});

reset();