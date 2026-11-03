const MAX_FILES = 6;
const TIME_LIMIT = 180;
const MAX_STRIKES = 2;

const reveal =
  "Lila Voss placed fourth and could not stand it. While the fair watched a calf and a Ferris wheel, " +
  "she slipped into the judging tent, grabbed the winning pie with jammy fingers, " +
  "and left boot prints out the back flap.";

const endings = {
  win: { title: "Case closed!" },
  strikes: { title: "The case goes cold", lead: "Two wrong accusations, and the sheriff has stopped listening." },
  time: { title: "The fair has closed", lead: "Time is up. The gates are locked and the pie is gone for good." }
};

const suspects = [
  { name: "Marge Pell", role: "Prize baker",
    details: {
      "At 3:15 p.m.": "Says she was scrubbing pans behind the baking tent. The other bakers were all on stage.",
      Hands: "Sticky with jam",
      Shoes: "Kitchen clogs",
      Contest: "Entered, took second place"
    },
    quote: "Mark my words, the thief is someone who lost this year. A winner has no reason to take a pie." },

  { name: "Otis Crane", role: "Head judge",
    details: {
      "At 3:15 p.m.": "Alone in the tasting tent, finishing his notes after an afternoon of jam tarts.",
      Hands: "Clean",
      Shoes: "Loafers",
      Contest: "Judge, did not enter"
    },
    quote: "I stepped out for air and saw boot prints tracked out the back flap. Heavy ones. The restroom block beside the tent was locked up for cleaning, so I walked clear around to the pump." },

  { name: "Wren Alvarez", role: "Ferris wheel operator",
    details: {
      "At 3:15 p.m.": "Running the Ferris wheel. Forty riders watched her the whole time.",
      Hands: "Clean",
      Shoes: "Work boots",
      Contest: "Did not enter"
    },
    quote: "From the top I saw someone hurry off with a pie box. Angry steps. That was a sore loser from this year's contest, no question." },

  { name: "Bo Tanaka", role: "Jam vendor",
    details: {
      "At 3:15 p.m.": "Behind his jam stall. Business was slow and nobody noticed him.",
      Hands: "Sticky with jam",
      Shoes: "Work boots",
      Contest: "Entered his jam, placed third"
    },
    quote: "Who steals a pie they can't even eat? Somebody spiteful. Somebody who didn't win this year." },

  { name: "Lila Voss", role: "Rival baker", isCulprit: true,
    details: {
      "At 3:15 p.m.": "\"The restroom,\" she says. No one saw her go or come back.",
      Hands: "Sticky with jam",
      Shoes: "Work boots",
      Contest: "Entered, placed fourth"
    },
    quote: "Is a person not allowed ten minutes of peace? Besides, my pie was better than hers and everybody knows it." },

  { name: "Gus Hollis", role: "Farmer",
    details: {
      "At 3:15 p.m.": "In the barn holding a calf for the vet. The vet confirms it.",
      Hands: "Caked in mud",
      Shoes: "Work boots",
      Contest: "Did not enter"
    },
    quote: "I padlocked the restroom block at three for the plumber. And I know a boot print when I see one: fresh ones behind the judging tent, heading for the parking field." },

  { name: "Nell Park", role: "Fair photographer",
    details: {
      "At 3:15 p.m.": "Says she was shooting the midway. Her camera clock was off all day, so the timestamps prove nothing.",
      Hands: "Sticky with jam",
      Shoes: "Work boots",
      Contest: "Did not enter"
    },
    quote: "I shot the back of the tent right afterwards. Boot prints, fresh, leading away. Funny thing, the restroom sign said \"Closed for cleaning\" until well past 3:30. Also, that was a jam doughnut. Don't judge me." },

  { name: "Tobias Reed", role: "Volunteer",
    details: {
      "At 3:15 p.m.": "Says he was \"wandering the grounds.\" Nobody remembers seeing him.",
      Hands: "Sticky with jam",
      Shoes: "Work boots",
      Contest: "Entered, placed last"
    },
    quote: "Last place. Again. Do you know how many cherries I pitted? Don't answer that." }
];
const culprit = suspects.find((s) => s.isCulprit);


const $ = (id) => document.getElementById(id);
const timer = $("timer"), filesLeft = $("files-left"), strikes = $("strikes"),
  accuseBtn = $("accuse-btn"), message = $("message"), table = $("table"),
  introDialog = $("intro-dialog"), confirmDialog = $("confirm-dialog"), endDialog = $("end-dialog");

let state;
let timerId;
let pending;
const cardParts = new Map();

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function newState() {
  return {
    started: false,
    over: false,
    filesLeft: MAX_FILES,
    strikes: 0,
    timeLeft: TIME_LIMIT,
    endTime: 0,
    opened: new Set(),
    stamps: new Map(),
    wrong: new Set(),
    accuseMode: false
  };
}

function createCard(suspect) {
  // Back (face down)
  const symbol = el("span", "symbol", suspect.name.split(" ").map((word) => word[0]).join(""));
  symbol.setAttribute("aria-hidden", "true");
  const plate = el("span", "back-plate");
  plate.append(symbol, el("span", "back-name", suspect.name), el("span", "back-role", suspect.role));

  const back = el("button", "face face-back");
  back.type = "button";
  back.setAttribute("aria-label", `Open file: ${suspect.name}, ${suspect.role}`);
  back.append(plate, el("span", "back-cta", "Open file"));
  back.addEventListener("click", () => openCard(suspect));

  const head = el("header", "dossier-head");
  head.append(el("h3", null, suspect.name), el("p", "dossier-role", suspect.role));

  const facts = el("dl", "facts");
  Object.entries(suspect.details).forEach(([label, value]) => {
    const row = el("div", "fact");
    row.append(el("dt", null, label), el("dd", null, value));
    facts.appendChild(row);
  });

  const statement = el("blockquote", "statement", `\u201C${suspect.quote}\u201D`);

  const stampRow = el("div", "stamp-row");
  const stampButtons = {};
  ["cleared", "suspect"].forEach((key) => {
    const button = el("button", `stamp-btn stamp-${key}`, key);
    button.type = "button";
    button.addEventListener("click", () => toggleStamp(suspect, key));
    stampButtons[key] = button;
    stampRow.appendChild(button);
  });

  const front = el("div", "face face-front");
  front.append(head, facts, statement, stampRow);

  const inner = el("div", "card-inner");
  inner.append(back, front);

  const mark = el("div", "stamp-mark");
  mark.setAttribute("aria-hidden", "true");

  const accuse = el("button", "accuse-overlay");
  accuse.type = "button";
  accuse.hidden = true;
  accuse.setAttribute("aria-label", `Accuse ${suspect.name}`);
  accuse.addEventListener("click", () => askToAccuse(suspect));

  const card = el("article", "card");
  card.append(inner, mark, accuse);
  return { card, back, front, mark, accuse, stampButtons };
}

function buildTable() {
  table.replaceChildren();
  cardParts.clear();
  shuffled(suspects).forEach((suspect) => {
    const parts = createCard(suspect);
    cardParts.set(suspect, parts);
    table.appendChild(parts.card);
  });
}

function updateCard(suspect) {
  const p = cardParts.get(suspect);
  const isGuilty = state.over && suspect.isCulprit;
  const isOpen = state.opened.has(suspect) || isGuilty;
  const isWrong = state.wrong.has(suspect);
  const locked = !isOpen && state.filesLeft <= 0;
  const stamp = isGuilty ? "guilty" : isWrong ? "wrong" : state.stamps.get(suspect) || "";

  p.card.classList.toggle("is-open", isOpen);
  p.card.classList.toggle("is-cleared", stamp === "cleared");
  p.card.classList.toggle("is-wrong", isWrong);
  p.card.classList.toggle("is-culprit", isGuilty);
  p.card.classList.toggle("is-locked", locked);
  p.card.dataset.stamp = stamp;
  p.mark.textContent = stamp;

  p.front.inert = !isOpen;
  p.back.inert = isOpen;
  p.back.disabled = !state.started || state.over || isWrong || locked;

  Object.entries(p.stampButtons).forEach(([key, button]) => {
    button.setAttribute("aria-pressed", String(state.stamps.get(suspect) === key));
    button.disabled = state.over || isWrong;
  });

  p.accuse.hidden = !state.accuseMode || isWrong;
}

function updateStatus() {
  timer.textContent = formatTime(state.timeLeft);
  timer.classList.toggle("is-low", state.started && !state.over && state.timeLeft <= 30);
  filesLeft.textContent = state.filesLeft;

  strikes.replaceChildren(...Array.from({ length: MAX_STRIKES }, (_, i) =>
    el("span", i < state.strikes ? "pip filled" : "pip")));
  strikes.setAttribute("aria-label", `${state.strikes} of ${MAX_STRIKES} strikes`);

  accuseBtn.disabled = !state.started || state.over;
  accuseBtn.textContent = state.accuseMode ? "Cancel accusation" : "Accuse";
}

function refresh() {
  suspects.forEach(updateCard);
  updateStatus();
}

function startGame() {
  state.started = true;
  state.endTime = Date.now() + TIME_LIMIT * 1000;
  timerId = setInterval(tick, 250);
  message.textContent = `The clock is running. Click a face-down file to open it. You can open ${MAX_FILES}.`;
  refresh();
}

function tick() {
  const left = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
  if (left !== state.timeLeft) {
    state.timeLeft = left;
    updateStatus();
  }
  if (left === 0) endGame("time");
}

function openCard(suspect) {
  if (state.over || state.opened.has(suspect) || state.filesLeft <= 0) return;
  state.opened.add(suspect);
  state.filesLeft--;
  message.textContent = `File opened: ${suspect.name}. ` + (state.filesLeft
    ? `${plural(state.filesLeft, "file")} left.`
    : "That was your last file. Time to decide.");
  refresh();
}

function toggleStamp(suspect, key) {
  if (state.stamps.get(suspect) === key) {
    state.stamps.delete(suspect);
  } else {
    state.stamps.set(suspect, key);
  }
  refresh();
}

function toggleAccuseMode() {
  state.accuseMode = !state.accuseMode;
  message.textContent = state.accuseMode
    ? "Click the card of the person you want to accuse."
    : "Accusation cancelled. Keep investigating.";
  refresh();
}

function askToAccuse(suspect) {
  pending = suspect;
  $("confirm-title").textContent = `Accuse ${suspect.name}?`;
  $("confirm-text").textContent =
    `Once you say it, you can't take it back. A wrong accusation is a strike (strikes so far: ${state.strikes} of ${MAX_STRIKES}).`;
  confirmDialog.showModal();
}

function resolveAccusation(suspect) {
  state.accuseMode = false;
  if (suspect.isCulprit) return endGame("win");

  state.strikes++;
  state.wrong.add(suspect);
  if (state.strikes >= MAX_STRIKES) return endGame("strikes");

  message.textContent = `${suspect.name} is not the culprit. Strike ${state.strikes} of ${MAX_STRIKES}. ` +
    `${plural(MAX_STRIKES - state.strikes, "accusation")} left.`;
  refresh();
}

function endGame(result) {
  state.over = true;
  state.accuseMode = false;
  clearInterval(timerId);
  confirmDialog.close();
  refresh();

  const ending = endings[result];
  const opening = result === "win"
    ? `It was ${culprit.name}.`
    : `${ending.lead} The culprit was ${culprit.name}.`;

  endDialog.dataset.result = result;
  $("end-title").textContent = ending.title;
  $("end-text").textContent = `${opening} ${reveal}`;
  $("end-stats").replaceChildren(...[
    `Strikes used: ${state.strikes} of ${MAX_STRIKES}`,
    `Files opened: ${MAX_FILES - state.filesLeft} of ${MAX_FILES}`,
    `Time left: ${formatTime(state.timeLeft)}`
  ].map((line) => el("li", null, line)));

  message.textContent = result === "win" ? "Case closed." : "The culprit has been revealed on the table.";
  endDialog.showModal();
}

function resetGame() {
  clearInterval(timerId);
  confirmDialog.close();
  endDialog.close();

  state = newState();
  buildTable();
  message.textContent = "Read the rules, then begin the investigation.";
  refresh();
  introDialog.showModal();
}


$("begin-btn").addEventListener("click", () => {
  introDialog.close();
  startGame();
});
introDialog.addEventListener("cancel", (event) => event.preventDefault());   // no skipping the rules with Esc

accuseBtn.addEventListener("click", toggleAccuseMode);

$("restart-btn").addEventListener("click", () => {
  const inProgress = state.started && !state.over;
  if (!inProgress || window.confirm("Restart? Your progress on this case will be lost.")) resetGame();
});

$("confirm-yes").addEventListener("click", () => {
  confirmDialog.close();
  resolveAccusation(pending);
});
$("confirm-no").addEventListener("click", () => confirmDialog.close());

$("end-again").addEventListener("click", resetGame);
$("end-look").addEventListener("click", () => endDialog.close());

resetGame();