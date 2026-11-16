const subjectQ = v => (v ? `subject:"${v}"` : "");
const range = (field, a, b) => (a || b ? `${field}:[${a || "*"} TO ${b || "*"}]` : "");

const SHELVES = [
  {
    id: "subject",
    title: "By Subject",
    hint: "Sorted A to Z by title.",
    fields: [{ name: "subject", label: "Subject", ph: "mountains", wide: true }],
    build: v => subjectQ(v.subject),
    sort: (a, b) => a.title.localeCompare(b.title),
    needOne: ["subject"]
  },
  {
    id: "year",
    title: "By Year",
    hint: "Oldest on the left. The year is the first publication year.",
    fields: [
      { name: "from", label: "From year", ph: "1960", type: "number" },
      { name: "to", label: "To year", ph: "1990", type: "number" },
      { name: "subject", label: "Subject (optional)", ph: "", wide: true }
    ],
    build: v => [range("first_publish_year", v.from, v.to), subjectQ(v.subject)].filter(Boolean).join(" AND "),
    sort: (a, b) => (a.year ?? 9999) - (b.year ?? 9999),
    needOne: ["from", "to"]
  },
  {
    id: "length",
    title: "By Length",
    hint: "Thinnest on the left. Books with no page count have striped spines.",
    fields: [
      { name: "min", label: "Min pages", ph: "100", type: "number" },
      { name: "max", label: "Max pages", ph: "300", type: "number" },
      { name: "subject", label: "Subject (optional)", ph: "", wide: true }
    ],
    build: v => [range("number_of_pages_median", v.min, v.max), subjectQ(v.subject)].filter(Boolean).join(" AND "),
    sort: (a, b) => (a.pages ?? 1e9) - (b.pages ?? 1e9),
    needOne: ["min", "max"]
  }
];

const cache = new Map();
const FIELDS = "key,title,author_name,cover_i,first_publish_year,number_of_pages_median";

async function searchBooks(q, limit) {
  const url = "https://openlibrary.org/search.json?" + new URLSearchParams({ q, limit, fields: FIELDS, lang: "en" });
  if (cache.has(url)) return cache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Open Library answered with status " + res.status + ".");
  const data = await res.json();

  const books = (data.docs || []).map(d => ({
    key: d.key,
    title: d.title || "Untitled",
    authors: d.author_name || [],
    cover: d.cover_i || null,
    year: d.first_publish_year ?? null,
    pages: d.number_of_pages_median ?? null
  }));
  cache.set(url, books);
  return books;
}

const COVER_COLOURS = ["#6b1f24", "#1f4a37", "#1d3552", "#7a4b1e", "#4a2a3f", "#2f4a4a", "#5a3b1c", "#3d4a22"];

function hash(str) {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
function spineStyle(b) {
  const h = hash(b.title);
  const width = b.pages ? Math.min(64, 18 + b.pages / 20) : 26;
  const height = 150 + (h % 55);
  return `width:${width}px;height:${height}px;background-color:${COVER_COLOURS[h % COVER_COLOURS.length]}`;
}

const root = document.getElementById("shelves");
const popup = document.getElementById("popup");
let openAnchor = null;

function el(tag, attrs = {}, text) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text !== undefined) n.textContent = text;
  return n;
}

function setState(box, msg, isError) {
  box.replaceChildren(el("div", { class: "state" + (isError ? " error" : ""), role: isError ? "alert" : "status" }, msg));
}

function closePopup(returnFocus) {
  popup.hidden = true;
  if (openAnchor) {
    openAnchor.setAttribute("aria-pressed", "false");
    if (returnFocus && openAnchor.isConnected) openAnchor.focus();
  }
  openAnchor = null;
}

function positionPopup(anchor) {
  const r = anchor.getBoundingClientRect();
  const pw = popup.offsetWidth, ph = popup.offsetHeight, gap = 10;

  let left = r.right + gap;
  if (left + pw > window.innerWidth - 8) left = r.left - pw - gap;
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));

  let top = r.top;
  if (top + ph > window.innerHeight - 8) top = window.innerHeight - ph - 8;
  top = Math.max(8, top);

  popup.style.left = left + window.scrollX + "px";
  popup.style.top = top + window.scrollY + "px";
}

function openPopup(b, scope, anchor) {
  if (openAnchor === anchor && !popup.hidden) { closePopup(true); return; }
  closePopup(false);
  openAnchor = anchor;
  anchor.setAttribute("aria-pressed", "true");

  popup.replaceChildren();

  const close = el("button", { class: "close", type: "button", "aria-label": "Close" }, "×");
  close.addEventListener("click", () => closePopup(true));
  popup.appendChild(close);

  const img = el("img", { alt: "", width: 84, height: 126 });
  if (b.cover) img.src = `https://covers.openlibrary.org/b/id/${b.cover}-M.jpg`;
  popup.appendChild(img);

  const info = el("div", { class: "info" });
  info.appendChild(el("h3", {}, b.title));
  info.appendChild(el("p", {}, b.authors.length ? "by " + b.authors.slice(0, 3).join(", ") : "Author unknown"));
  info.appendChild(el("p", {}, b.year ? "First published " + b.year : "Year unknown"));
  info.appendChild(el("p", {}, b.pages ? b.pages + " pages" : "Page count unknown"));
  popup.appendChild(info);

  const row = el("div", { class: "row" });
  row.appendChild(el("a", { href: "https://openlibrary.org" + b.key, target: "_blank", rel: "noopener" }, "Open Library"));

  const inYours = scope === "yours";
  const already = !inYours && yours.some(y => y.key === b.key);
  const action = el("button", { type: "button", class: inYours ? "ghost" : "" },
    inYours ? "Remove from Yours" : already ? "Already in Yours" : "Add to Yours");
  action.disabled = already;
  action.addEventListener("click", () => {
    if (inYours) {
      yours = yours.filter(y => y.key !== b.key);
      closePopup(false);
    } else {
      yours.push(b);
      action.textContent = "Added to Yours";
      action.disabled = true;
    }
    saveYours(yours);
    drawYours();
  });
  row.appendChild(action);
  popup.appendChild(row);

  popup.hidden = false;
  positionPopup(anchor);
  close.focus();
}

document.addEventListener("keydown", e => { if (e.key === "Escape" && !popup.hidden) closePopup(true); });
document.addEventListener("click", e => {
  if (!popup.hidden && !popup.contains(e.target) && !e.target.closest(".spine")) closePopup(false);
});
window.addEventListener("resize", () => { if (!popup.hidden) closePopup(false); });

function drawBooks(box, books, scope) {
  box.replaceChildren();
  books.forEach(b => {
    const btn = el("button", {
      class: "spine" + (b.pages ? "" : " nopages"),
      style: spineStyle(b),
      type: "button",
      "aria-pressed": "false",
      "aria-label": b.title + (b.authors[0] ? " by " + b.authors[0] : ""),
      title: b.title
    }, b.title);
    btn.addEventListener("click", () => openPopup(b, scope, btn));
    box.appendChild(btn);
  });
}

function makeShelfSection(id, title, hint) {
  const sec = el("section", { class: "shelf", "aria-labelledby": "h-" + id });
  sec.appendChild(el("h2", { id: "h-" + id }, title));
  sec.appendChild(el("p", { class: "hint" }, hint));
  return sec;
}

function buildShelf(cfg) {
  const sec = makeShelfSection(cfg.id, cfg.title, cfg.hint);

  const form = el("form");
  cfg.fields.forEach(f => {
    const label = el("label", {}, f.label);
    label.appendChild(el("input", { name: f.name, placeholder: f.ph, type: f.type || "text", class: f.wide ? "wide" : "" }));
    form.appendChild(label);
  });
  form.appendChild(el("button", { type: "submit" }, "Fill shelf"));
  sec.appendChild(form);

  const box = el("div", { class: "books" });
  setState(box, "Empty shelf. Enter a search above and choose Fill shelf.");
  sec.appendChild(box);
  root.appendChild(sec);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    closePopup(false);

    const v = Object.fromEntries(new FormData(form).entries());
    Object.keys(v).forEach(k => (v[k] = v[k].trim()));

    if (!cfg.needOne.some(k => v[k])) {
      setState(box, "Add a value first: " + cfg.needOne.join(" or ") + ".", true);
      return;
    }

    const limit = Number(document.getElementById("limit").value);
    setState(box, "Looking through the stacks…");
    try {
      const books = await searchBooks(cfg.build(v), limit);
      if (!books.length) {
        setState(box, "No books matched. Try a wider range or a different subject.");
        return;
      }
      books.sort(cfg.sort);
      drawBooks(box, books, cfg.id);
    } catch (err) {
      setState(box, "Couldn’t reach Open Library. Check your connection and try again. (" + err.message + ")", true);
    }
  });
}

const STORE_KEY = "reading-stack-yours";

function loadYours() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; }
}
function saveYours(list) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch { }
}

let yours = loadYours();
let yoursBox;

function buildYours() {
  const sec = makeShelfSection("yours", "Yours", "Books you add stay on this shelf in this browser.");

  const clear = el("button", { type: "button", class: "clear" }, "Clear Yours");
  clear.addEventListener("click", () => {
    yours = [];
    saveYours(yours);
    closePopup(false);
    drawYours();
  });
  sec.appendChild(clear);

  yoursBox = el("div", { class: "books" });
  sec.appendChild(yoursBox);
  root.appendChild(sec);
  drawYours();
}
function drawYours() {
  if (!yours.length) {
    setState(yoursBox, "Nothing here yet. Select a book on any shelf and choose Add to Yours.");
    return;
  }
  drawBooks(yoursBox, yours, "yours");
}

SHELVES.forEach(buildShelf);
buildYours();