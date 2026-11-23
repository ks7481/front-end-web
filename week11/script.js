const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const W = 900, LANE = 190, TOP = 20, LEFT = 70, RIGHT = 20, AXIS = 40;
const YEAR = 2026;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STYLE = [
  { fill: "#f2b134", pattern: "hatchA" },
  { fill: "#2f7fa3", pattern: "hatchB" }
];

const MONTH_START = MONTHS.map((_, m) => Math.round((Date.UTC(YEAR, m, 1) - Date.UTC(YEAR, 0, 1)) / 864e5) + 1);

const state = {
  cities: [
    { name: "Singapore", lat: 1.29 },
    { name: "Harbin, Heilongjiang, China", lat: 45.75 }
  ],
  day: 80,
  playing: false,
  raf: null
};

const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function dayLength(lat, n) {
  const rad = Math.PI / 180;
  const decl = -23.44 * Math.cos((2 * Math.PI / 365) * (n + 10)) * rad;
  const phi = lat * rad;
  const cosH = (Math.sin(-0.833 * rad) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
  if (cosH >= 1) return 0;
  if (cosH <= -1) return 24;
  return (2 * Math.acos(cosH) / rad) / 15;
}

function series(lat) {
  return Array.from({ length: 365 }, (_, i) => dayLength(lat, i + 1));
}

function hm(h) {
  if (h <= 0) return "0 h (polar night)";
  if (h >= 24) return "24 h (midnight sun)";
  const mins = Math.round(h * 60);
  return `${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, "0")} min`;
}
function dateLabel(n) {
  return new Date(YEAR, 0, n).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function latLabel(lat) {
  return `${Math.abs(lat).toFixed(1)}° ${lat >= 0 ? "N" : "S"}`;
}
const shortName = (c) => c.name.split(",")[0];

const xOf = (n) => LEFT + ((n - 1) / 364) * (W - LEFT - RIGHT);

function sunSVG(i) {
  const rays = Array.from({ length: 12 }, (_, k) => {
    const a = (k * 30) * Math.PI / 180;
    return `<line x1="${Math.cos(a) * 17}" y1="${Math.sin(a) * 17}" x2="${Math.cos(a) * 26}" y2="${Math.sin(a) * 26}"/>`;
  }).join("");
  return `<g id="sun${i}" filter="url(#wobble)" stroke="#1d2b3a" stroke-width="3" stroke-linecap="round">
    <g>${rays}</g><circle r="13" fill="#ffd95e"/></g>`;
}

function draw() {
  const n = state.cities.length;
  const H = TOP + LANE * n + AXIS;
  const svg = $("svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  let out = `
    <defs>
      <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"/>
        <feDisplacementMap in="SourceGraphic" scale="4"/>
      </filter>
      <pattern id="hatchA" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="9" height="9" fill="${STYLE[0].fill}"/><line x1="0" y1="0" x2="0" y2="9" stroke="#1d2b3a" stroke-opacity=".35" stroke-width="1.6"/>
      </pattern>
      <pattern id="hatchB" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="${STYLE[1].fill}"/><circle cx="5" cy="5" r="1.5" fill="#fff" fill-opacity=".45"/>
      </pattern>
    </defs>`;

  const axisY = TOP + LANE * n + 18;
  MONTH_START.forEach((d, m) => {
    out += `<line x1="${xOf(d)}" y1="${TOP}" x2="${xOf(d)}" y2="${axisY - 14}" stroke="#46586b" stroke-opacity=".18"/>
            <text x="${xOf(d) + 4}" y="${axisY + 4}" font-size="15">${MONTHS[m]}</text>`;
  });

  state.cities.forEach((c, i) => {
    const data = c.data;
    const cy = TOP + LANE * i + LANE / 2;
    const half = LANE / 2 - 14;
    const pts = (sign) => data.map((h, k) => `${xOf(k + 1).toFixed(1)},${(cy + sign * (h / 24) * half).toFixed(1)}`);
    const path = `M${pts(-1).join(" L")} L${pts(1).reverse().join(" L")} Z`;
    const mid = (12 / 24) * half;
    const min = Math.min(...data), max = Math.max(...data);

    out += `
      <line x1="${LEFT}" x2="${W - RIGHT}" y1="${cy - mid}" y2="${cy - mid}" stroke="#46586b" stroke-dasharray="6 6" stroke-opacity=".6"/>
      <line x1="${LEFT}" x2="${W - RIGHT}" y1="${cy + mid}" y2="${cy + mid}" stroke="#46586b" stroke-dasharray="6 6" stroke-opacity=".6"/>
      <path d="${path}" fill="url(#${STYLE[i].pattern})" stroke="#1d2b3a" stroke-width="3" stroke-linejoin="round" filter="url(#wobble)"/>
      <text class="hand" x="${LEFT}" y="${cy - half - 2}" font-size="26">${esc(shortName(c))}</text>
      <text x="${LEFT + 6 + esc(shortName(c)).length * 12.5}" y="${cy - half - 4}" font-size="14" fill="#46586b">${latLabel(c.lat)} · ${min.toFixed(1)}–${max.toFixed(1)} h</text>`;
  });

  out += `<line id="guide" y1="${TOP}" y2="${axisY - 14}" stroke="#1d2b3a" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round"/>`;
  state.cities.forEach((_, i) => { out += sunSVG(i); });

  svg.innerHTML = out;
  placeSun();
}

function placeSun() {
  const n = Math.min(365, Math.round(state.day));
  const x = xOf(n);
  $("guide").setAttribute("x1", x);
  $("guide").setAttribute("x2", x);
  state.cities.forEach((c, i) => {
    const cy = TOP + LANE * i + LANE / 2;
    $(`sun${i}`).setAttribute("transform", `translate(${x} ${cy})`);
  });

  const parts = state.cities.map((c, i) =>
    `<span class="c${i}">${esc(shortName(c))}: ${hm(c.data[n - 1])}</span>`);
  $("readout").innerHTML = `${dateLabel(n)} — ${parts.join(" · ")}`;
  const plain = state.cities.map((c) => `${shortName(c)} ${hm(c.data[n - 1])}`).join(", ");
  $("day").setAttribute("aria-valuetext", `${dateLabel(n)}. ${plain}`);
  $("day").value = n;
}

function swing(c) {
  const min = Math.min(...c.data), max = Math.max(...c.data);
  return { min, max, range: max - min };
}

function summarize() {
  const cs = state.cities;
  const s = cs.map(swing);
  let text;
  if (cs.length === 1) {
    text = `${shortName(cs[0])} (${latLabel(cs[0].lat)}) goes from a shortest day of ${hm(s[0].min)} to a longest of ${hm(s[0].max)}, a swing of ${s[0].range.toFixed(1)} hours.`;
  } else {
    const [big, small] = s[0].range >= s[1].range ? [0, 1] : [1, 0];
    text = `${shortName(cs[big])}'s daylight swings by ${s[big].range.toFixed(1)} hours across the year; ${shortName(cs[small])}'s swings by ${s[small].range.toFixed(1)}.`;
    if (cs[0].lat * cs[1].lat < 0) text += " They sit in opposite hemispheres, so their seasons are out of step.";
  }
  $("takeaway").textContent = text;

  const head = cs.map((c) => `<th scope="col">${esc(shortName(c))}</th>`).join("");
  const rows = MONTHS.map((m, k) => {
    const d = MONTH_START[k];
    return `<tr><th scope="row">${m} 1</th>${cs.map((c, i) => `<td class="c${i}">${hm(c.data[d - 1])}</td>`).join("")}</tr>`;
  }).join("");
  $("tableBox").innerHTML = `<table><caption>Hours of daylight on the 1st of each month</caption>
    <thead><tr><th scope="col">Date</th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

function refresh() {
  state.cities.forEach((c) => { c.data = series(c.lat); });
  summarize();
  draw();
}

async function lookup(query) {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("The city search is unavailable right now.");
  const json = await res.json();
  return (json.results || []).map((r) => ({
    name: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    lat: r.latitude
  }));
}

function fillPicker(select, matches, slot) {
  select.innerHTML = matches.map((m, k) => `<option value="${k}">${esc(m.name)} (${latLabel(m.lat)})</option>`).join("");
  select.hidden = matches.length < 2;
  select.onchange = () => {
    state.cities[slot] = matches[select.value];
    refresh();
  };
}

$("cityForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $("status");
  status.textContent = "Looking up cities…";
  const names = [$("cityA").value.trim(), $("cityB").value.trim()].filter(Boolean);
  if (!names.length) { status.textContent = "Type at least one city name."; return; }

  try {
    const results = await Promise.all(names.map(lookup));
    const missing = names.filter((_, i) => !results[i].length);
    if (missing.length) {
      status.textContent = `No match for ${missing.join(" or ")}. Check the spelling or try a larger nearby city.`;
      return;
    }
    state.cities = results.map((r) => r[0]);
    fillPicker($("pickA"), results[0], 0);
    if (results[1]) fillPicker($("pickB"), results[1], 1); else $("pickB").hidden = true;
    status.textContent = "";
    refresh();
  } catch (err) {
    status.textContent = err.message || "Something went wrong. Check your connection and try again.";
  }
});


$("day").addEventListener("input", (e) => {
  stop();
  state.day = Number(e.target.value);
  placeSun();
});

let last;
function tick(t) {
  if (!state.playing) return;
  state.day = ((state.day + ((t - last) / 1000) * 45 - 1) % 365) + 1;
  last = t;
  placeSun();
  state.raf = requestAnimationFrame(tick);
}

function play() {
  state.playing = true;
  $("play").textContent = "Pause";
  $("play").setAttribute("aria-pressed", "true");
  last = performance.now();
  state.raf = requestAnimationFrame(tick);
}
function stop() {
  state.playing = false;
  cancelAnimationFrame(state.raf);
  state.day = Math.min(365, Math.round(state.day));
  $("play").textContent = "Play the year";
  $("play").setAttribute("aria-pressed", "false");
}
$("play").addEventListener("click", () => (state.playing ? stop() : play()));

$("tableToggle").addEventListener("click", () => {
  const box = $("tableBox");
  box.hidden = !box.hidden;
  $("tableToggle").setAttribute("aria-expanded", String(!box.hidden));
  $("tableToggle").textContent = box.hidden ? "View as table" : "Hide table";
});

refresh();
if (!reduceMotion) play();