(function () {
  "use strict";

  var KEY = "one-little-step-v1";
  var RING_C = 2 * Math.PI * 52;

  var CATEGORIES = [
    { id: "home", label: "Home" },
    { id: "work", label: "Work" },
    { id: "errands", label: "Errands" },
    { id: "people", label: "People" },
    { id: "learning", label: "Learning" },
    { id: "health", label: "Health" },
    { id: "admin", label: "Admin" },
    { id: "personal", label: "Personal" }
  ];

  var PRIORITIES = ["whenever", "soon", "matters"];
  var MOODS = ["calm", "okay", "tired", "restless", "heavy"];
  var ENERGIES = ["low", "some", "more"];
  var DURATIONS = [300, 600, 900, 1500];
  var VIEWS = ["home", "tasks", "dump", "stuck", "focus", "garden", "wins"];

  var TEMPLATES = [
    { id: "message", label: "Send a message", steps: ["Open the message", "Write one honest sentence", "Read it once", "Send it, or save it for later"] },
    { id: "tidy", label: "Tidy a small area", steps: ["Choose one surface", "Put away five things", "Set aside what is clearly finished", "Stop while it still feels okay"] },
    { id: "write", label: "Start writing", steps: ["Open a page", "Write a title or subject", "Write one messy sentence", "Add another sentence only if you want"] },
    { id: "errand", label: "Do an errand", steps: ["Name the errand in one line", "Gather what you need", "Put it by the door or in a bag", "Choose a gentle time to go"] },
    { id: "paper", label: "Handle paperwork", steps: ["Find the paper or page", "Read only the first part", "Fill in one field", "Save it somewhere you can see"] },
    { id: "study", label: "Study a little", steps: ["Open the material", "Read one short section", "Write one note in your own words", "Close it kindly"] },
    { id: "home", label: "Care for home", steps: ["Pick one corner", "Do the easiest visible thing", "Pause and notice the room", "Decide if one more thing feels okay"] },
    { id: "reach", label: "Reach out", steps: ["Find the thread or number", "Jot what you want to say", "Send the first line or start the call", "You can stop after that"] }
  ];

  var STUCK_ACTIONS = [
    { title: "Drink a glass of water, slowly.", detail: "A body that is a little cared for is easier to begin from." },
    { title: "Open the thing you are avoiding and read only the first sentence.", detail: "You are not agreeing to finish it." },
    { title: "Put one object back where it belongs.", detail: "One object is a complete action." },
    { title: "Write the first word of the message you have been postponing.", detail: "A word is a beginning. You can stop there." },
    { title: "Stand and stretch your shoulders for twenty seconds.", detail: "Restlessness sometimes needs a little movement." },
    { title: "Set a five-minute timer and touch only the easiest part.", detail: "When it ends, you are allowed to stop." },
    { title: "Clear a space the size of a book.", detail: "A small clear space can make the next step visible." },
    { title: "Say the very next physical action out loud. Only that.", detail: "Not the whole project. The next movement of your hands." },
    { title: "Look out of a window and name three things you see.", detail: "Coming back to the room can soften the noise in your head." },
    { title: "Take three slow breaths, then choose a task or a pause.", detail: "Pausing is a valid step." },
    { title: "If an errand is waiting, put on your shoes and nothing else.", detail: "Getting ready is already movement." },
    { title: "Move one worry from your head into the Brain Dump.", detail: "It does not have to become a task today." },
    { title: "Turn on a lamp or open a curtain.", detail: "A small change in the room can change how a task feels." },
    { title: "Unclench your jaw and drop your shoulders.", detail: "You do not have to brace for a step that is allowed to be small." },
    { title: "Write tomorrow’s first step on a scrap of paper, then stop.", detail: "Future-you only needs one line." }
  ];

  var SUPPORT = {
    none: [
      "You do not have to do it all. One small start is a complete success.",
      "The day can be lighter than the list in your head.",
      "Begin anywhere. A corner, a sentence, a breath.",
      "Nothing here will scold you for going slowly."
    ],
    calm: [
      "Calm is a good place to begin. One clear thing is enough.",
      "You can use this steadiness for a single small step.",
      "There is no extra credit for rushing a quiet day."
    ],
    okay: [
      "Okay is a perfectly good place to start.",
      "You do not need to feel inspired. A tiny step still counts.",
      "Keep the day kind and specific. One thing, then a pause."
    ],
    tired: [
      "Tired is information, not a flaw.",
      "Choose the smallest version of care. Stopping is allowed.",
      "Low energy still counts when the step is honest and tiny."
    ],
    restless: [
      "Restlessness likes a small container. One short action can hold it.",
      "You can move a little, then decide if you want a task.",
      "A five-minute start is enough. The urge to do everything can wait."
    ],
    heavy: [
      "When things feel heavy, make the step almost weightless.",
      "You can set most of the list down. One light thing is plenty.",
      "A single small action, or a real rest, is a full response today."
    ]
  };

  var ENERGY_LINE = {
    low: "Suggestions below are kept very small.",
    some: "Suggestions below are clear and modest.",
    more: "You noted a bit more energy. The suggestions are still one at a time."
  };

  var FOCUS_NOTES = [
    "You are already in it. That is the step.",
    "One thing, for a little while.",
    "If your mind wanders, come back without scolding.",
    "You can pause whenever you need.",
    "Small time still counts.",
    "Stay with what is in front of you.",
    "Rest is allowed the moment you want it."
  ];

  var PLANTS = [
    { id: "sprout", name: "Little sprout" },
    { id: "herb", name: "Kitchen herb" },
    { id: "tulip", name: "Cup flower" },
    { id: "fern", name: "Soft fern" },
    { id: "daisy", name: "Meadow daisy" },
    { id: "spire", name: "Sage spire" },
    { id: "bush", name: "Round bush" },
    { id: "tree", name: "Young tree" }
  ];

  var STAGE_NAMES = ["Seed", "Shoot", "Leaves", "Growing", "In bloom"];
  var KIND_LABELS = {
    task: "Whole task",
    step: "Small step",
    stuck: "Tiny action",
    focus: "Focus time",
    rest: "Rest"
  };

  var state = loadState();
  var currentView = "home";
  var editor = null;
  var confirmAction = null;
  var confirmYes = false;
  var syncing = false;
  var timerHandle = null;
  var toastTimer = null;
  var paintedStages = null;
  var gardenSignature = "";
  var expanded = Object.create(null);
  var highlightId = "";

  function defaultState() {
    return {
      profile: { name: "", chime: false },
      checkin: { date: "", mood: "", energy: "" },
      tasks: [],
      dumps: [],
      dumpDraft: "",
      wins: [],
      garden: { points: 0, awarded: { tasks: [], steps: [], sessions: [] } },
      restDay: "",
      stuck: { index: 0, seed: Math.floor(Math.random() * 100000) + 1, mode: "suggest", lastTitle: "" },
      focus: {
        taskId: "",
        duration: 600,
        remaining: 600,
        running: false,
        endsAt: null,
        sessionId: null,
        phase: "idle"
      },
      taskFilter: "open",
      taskQuery: "",
      taskCategory: "all"
    };
  }

  function str(value) {
    return typeof value === "string" ? value : "";
  }

  function num(value) {
    return typeof value === "number" && isFinite(value) ? value : 0;
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(16).slice(2);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function todayISO(date) {
    var d = date || new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function formatFullDate(date) {
    return new Intl.DateTimeFormat("en", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date || new Date());
  }

  function formatWhen(ts) {
    var d = new Date(ts);
    var key = todayISO(d);
    var today = todayISO();
    var yesterday = todayISO(new Date(Date.now() - 86400000));
    var time = d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
    if (key === today) return "Today · " + time;
    if (key === yesterday) return "Yesterday · " + time;
    return d.toLocaleDateString("en", { month: "short", day: "numeric" }) + " · " + time;
  }

  function dayLabel(ts) {
    var key = todayISO(new Date(ts));
    if (key === todayISO()) return "Today";
    if (key === todayISO(new Date(Date.now() - 86400000))) return "Yesterday";
    return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date(ts));
  }

  function daySeed() {
    return todayISO().split("-").reduce(function (sum, part) {
      return sum + Number(part);
    }, 0);
  }

  function pick(list, extra) {
    if (!list.length) return "";
    return list[(daySeed() + (extra || 0)) % list.length];
  }

  function categoryLabel(id) {
    var found = CATEGORIES.filter(function (c) { return c.id === id; })[0];
    return found ? found.label : "Personal";
  }

  function priorityLabel(id) {
    if (id === "soon") return "Soon";
    if (id === "matters") return "Matters";
    return "Whenever";
  }

  function formatDeadline(iso) {
    if (!iso) return "";
    var parts = iso.split("-").map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var diff = Math.round((date - today) / 86400000);
    var pretty = date.toLocaleDateString("en", { month: "short", day: "numeric" });
    if (diff === 0) return "Today, if you can";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return "Noted for " + pretty + " — still no rush";
    return pretty;
  }

  function greeting() {
    var hour = new Date().getHours();
    var hello = "Hello";
    if (hour >= 5 && hour < 12) hello = "Good morning";
    else if (hour >= 12 && hour < 17) hello = "Good afternoon";
    else if (hour >= 17 && hour < 22) hello = "Good evening";
    var name = state.profile.name.trim();
    return name ? hello + ", " + name : hello;
  }

  function activeCheckin() {
    if (state.checkin.date === todayISO()) {
      return { mood: state.checkin.mood, energy: state.checkin.energy, previous: null };
    }
    return { mood: "", energy: "", previous: state.checkin.mood ? state.checkin : null };
  }

  function normalizeTask(task) {
    if (!task || typeof task !== "object") return null;
    var title = str(task.title).trim().slice(0, 140);
    if (!title) return null;
    var subtasks = Array.isArray(task.subtasks) ? task.subtasks.map(function (step) {
      if (!step || typeof step !== "object") return null;
      var stepTitle = str(step.title).trim().slice(0, 160);
      if (!stepTitle) return null;
      return { id: str(step.id) || uid(), title: stepTitle, done: Boolean(step.done) };
    }).filter(Boolean) : [];
    return {
      id: str(task.id) || uid(),
      title: title,
      notes: str(task.notes).slice(0, 2000),
      category: CATEGORIES.some(function (c) { return c.id === task.category; }) ? task.category : "personal",
      priority: PRIORITIES.indexOf(task.priority) >= 0 ? task.priority : "whenever",
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(task.deadline || "") ? task.deadline : "",
      subtasks: subtasks,
      done: Boolean(task.done),
      createdAt: num(task.createdAt) || Date.now(),
      completedAt: task.completedAt ? num(task.completedAt) : null
    };
  }

  function loadState() {
    var base = defaultState();
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return base;
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return base;
      base.profile.name = str(data.profile && data.profile.name).slice(0, 40);
      base.profile.chime = Boolean(data.profile && data.profile.chime);
      if (data.checkin && typeof data.checkin === "object") {
        base.checkin.date = /^\d{4}-\d{2}-\d{2}$/.test(data.checkin.date || "") ? data.checkin.date : "";
        base.checkin.mood = MOODS.indexOf(data.checkin.mood) >= 0 ? data.checkin.mood : "";
        base.checkin.energy = ENERGIES.indexOf(data.checkin.energy) >= 0 ? data.checkin.energy : "";
      }
      base.tasks = Array.isArray(data.tasks) ? data.tasks.map(normalizeTask).filter(Boolean) : [];
      base.dumps = Array.isArray(data.dumps) ? data.dumps.map(function (entry) {
        if (!entry || typeof entry !== "object") return null;
        var text = str(entry.text).trim().slice(0, 5000);
        if (!text) return null;
        return {
          id: str(entry.id) || uid(),
          text: text,
          createdAt: num(entry.createdAt) || Date.now(),
          taskId: str(entry.taskId) || ""
        };
      }).filter(Boolean) : [];
      base.dumpDraft = str(data.dumpDraft).slice(0, 5000);
      base.wins = Array.isArray(data.wins) ? data.wins.filter(function (win) {
        return win && typeof win.text === "string";
      }).slice(0, 250).map(function (win) {
        return {
          id: str(win.id) || uid(),
          kind: KIND_LABELS[win.kind] ? win.kind : "step",
          text: str(win.text).slice(0, 180),
          detail: str(win.detail).slice(0, 220),
          at: num(win.at) || Date.now(),
          refId: str(win.refId)
        };
      }) : [];
      var awarded = data.garden && data.garden.awarded ? data.garden.awarded : {};
      base.garden.points = Math.max(0, num(data.garden && data.garden.points));
      base.garden.awarded.tasks = Array.isArray(awarded.tasks) ? awarded.tasks.map(str) : [];
      base.garden.awarded.steps = Array.isArray(awarded.steps) ? awarded.steps.map(str) : [];
      base.garden.awarded.sessions = Array.isArray(awarded.sessions) ? awarded.sessions.map(str) : [];
      base.restDay = /^\d{4}-\d{2}-\d{2}$/.test(data.restDay || "") ? data.restDay : "";
      if (data.stuck && typeof data.stuck === "object") {
        base.stuck.index = Math.max(0, num(data.stuck.index));
        base.stuck.seed = num(data.stuck.seed) || base.stuck.seed;
        base.stuck.mode = data.stuck.mode === "ack" || data.stuck.mode === "enough" ? "suggest" : "suggest";
        base.stuck.lastTitle = str(data.stuck.lastTitle).slice(0, 180);
      }
      if (data.focus && typeof data.focus === "object") {
        var duration = DURATIONS.indexOf(num(data.focus.duration)) >= 0 ? num(data.focus.duration) : 600;
        var remaining = num(data.focus.remaining);
        if (remaining <= 0 || remaining > duration) remaining = duration;
        var phase = ["idle", "running", "paused", "done"].indexOf(data.focus.phase) >= 0 ? data.focus.phase : "idle";
        base.focus = {
          taskId: str(data.focus.taskId),
          duration: duration,
          remaining: remaining,
          running: Boolean(data.focus.running),
          endsAt: num(data.focus.endsAt) || null,
          sessionId: str(data.focus.sessionId) || null,
          phase: phase
        };
      }
      if (["open", "all", "done"].indexOf(data.taskFilter) >= 0) base.taskFilter = data.taskFilter;
      base.taskQuery = str(data.taskQuery).slice(0, 80);
      base.taskCategory = data.taskCategory === "all" || CATEGORIES.some(function (c) { return c.id === data.taskCategory; })
        ? (data.taskCategory || "all")
        : "all";
    } catch (err) {
      return defaultState();
    }
    return base;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      announce("This browser could not store more data. Recent changes may not remain after a reload.");
    }
  }

  function announce(message) {
    var live = document.getElementById("live");
    if (!live) return;
    live.textContent = "";
    window.setTimeout(function () {
      live.textContent = message;
    }, 30);
  }

  function toast(message) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.classList.remove("show");
    }, 3400);
  }

  function addWin(win) {
    state.wins.unshift({
      id: uid(),
      kind: win.kind,
      text: win.text,
      detail: win.detail || "",
      at: Date.now(),
      refId: win.refId || ""
    });
    if (state.wins.length > 250) state.wins.length = 250;
  }

  function removeWin(kind, refId) {
    var index = state.wins.findIndex(function (win) {
      return win.kind === kind && win.refId === refId;
    });
    if (index >= 0) state.wins.splice(index, 1);
  }

  function awardStep(step, task) {
    if (state.garden.awarded.steps.indexOf(step.id) !== -1) return false;
    state.garden.awarded.steps.push(step.id);
    state.garden.points += 1;
    addWin({
      kind: "step",
      refId: step.id,
      text: step.title,
      detail: "A small step from “" + task.title + "”"
    });
    toast("Kept. Your garden grew a little.");
    return true;
  }

  function awardTask(task) {
    addWin({
      kind: "task",
      refId: task.id,
      text: task.title,
      detail: "A whole task, done in your own time"
    });
    if (state.garden.awarded.tasks.indexOf(task.id) !== -1) return;
    state.garden.awarded.tasks.push(task.id);
    state.garden.points += 2;
    toast("The whole task is complete. Your garden grew.");
  }

  function findTask(id) {
    return state.tasks.filter(function (task) { return task.id === id; })[0] || null;
  }

  function nextUndoneStep(task) {
    return (task.subtasks || []).filter(function (step) { return !step.done; })[0] || null;
  }

  function rank(task, energy) {
    var weight = { whenever: 0, soon: 1, matters: 2 };
    var priority = weight[task.priority] != null ? weight[task.priority] : 1;
    var undone = (task.subtasks || []).filter(function (step) { return !step.done; }).length;
    var hasTiny = undone > 0 ? 0 : 1;
    var score = 0;
    if (energy === "low") score = priority * 10 + hasTiny * 5 + Math.min(task.subtasks.length, 6);
    else if (energy === "more") score = (2 - priority) * 10 + (undone === 0 ? 3 : 0);
    else score = (priority === 1 ? 0 : priority === 0 ? 1 : 2) * 10 + hasTiny;
    if (energy !== "low" && task.deadline === todayISO()) score -= 2;
    return score;
  }

  function suggestedTasks() {
    var checkin = activeCheckin();
    var energy = checkin.energy || "some";
    return state.tasks.filter(function (task) { return !task.done; }).slice().sort(function (a, b) {
      return rank(a, energy) - rank(b, energy) || a.createdAt - b.createdAt;
    }).slice(0, 3);
  }

  function reasonFor(energy) {
    if (energy === "low") return "Small enough for a low-energy day.";
    if (energy === "more") return "A fuller step, still only one.";
    if (energy === "some") return "A clear place to begin.";
    return "A gentle place to begin.";
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function stuckPool() {
    var rand = mulberry32(state.stuck.seed || 1);
    var pool = STUCK_ACTIONS.map(function (item) {
      return { title: item.title, detail: item.detail, taskId: "", stepId: "" };
    });
    for (var i = pool.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rand() * (i + 1));
      var swap = pool[i];
      pool[i] = pool[j];
      pool[j] = swap;
    }
    var open = state.tasks.filter(function (task) { return !task.done; }).slice().sort(function (a, b) {
      return rank(a, "low") - rank(b, "low");
    });
    open.some(function (task) {
      var step = nextUndoneStep(task);
      if (!step) return false;
      pool.unshift({
        title: step.title,
        detail: "Only this, from “" + task.title + "”. Stopping after it is complete.",
        taskId: task.id,
        stepId: step.id
      });
      return true;
    });
    return pool;
  }

  function currentSuggestion() {
    var pool = stuckPool();
    var index = state.stuck.index % pool.length;
    if (index < 0) index += pool.length;
    return pool[index];
  }

  function visibleTasks() {
    var query = state.taskQuery.trim().toLowerCase();
    return state.tasks.filter(function (task) {
      if (state.taskFilter === "open" && task.done) return false;
      if (state.taskFilter === "done" && !task.done) return false;
      if (state.taskCategory !== "all" && task.category !== state.taskCategory) return false;
      if (!query) return true;
      var hay = [task.title, task.notes].concat(task.subtasks.map(function (step) { return step.title; })).join(" ").toLowerCase();
      return hay.indexOf(query) !== -1;
    }).sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      var weight = { matters: 0, soon: 1, whenever: 2 };
      var byPriority = (weight[a.priority] || 2) - (weight[b.priority] || 2);
      if (byPriority) return byPriority;
      if (a.deadline && b.deadline && a.deadline !== b.deadline) return a.deadline < b.deadline ? -1 : 1;
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      return b.createdAt - a.createdAt;
    });
  }

  function focusTask() {
    return findTask(state.focus.taskId);
  }

  function formatTime(seconds) {
    var total = seconds <= 0 ? 0 : Math.ceil(seconds);
    var mins = Math.floor(total / 60);
    var secs = total % 60;
    return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  }

  function viewFromHash() {
    var name = (location.hash || "").replace("#", "");
    return VIEWS.indexOf(name) >= 0 ? name : "";
  }

  function showView(name, focusHeading) {
    if (VIEWS.indexOf(name) < 0) name = "home";
    currentView = name;
    document.querySelectorAll("[data-view-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-view-panel") !== name;
    });
    document.querySelectorAll('[data-action="nav"]').forEach(function (button) {
      if (button.getAttribute("data-view") === name) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    var current = document.querySelector('[data-action="nav"][data-view="' + name + '"]');
    if (current && current.scrollIntoView) current.scrollIntoView({ inline: "nearest", block: "nearest" });
    if (focusHeading) {
      var heading = document.querySelector('[data-view-panel="' + name + '"] h2');
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }
    }
  }

  function go(name, focusHeading) {
    if (location.hash !== "#" + name) location.hash = name;
    showView(name, focusHeading);
  }

  function seedSvg() {
    return '<ellipse cx="60" cy="164" rx="38" ry="10" fill="#E4D2B8"/>' +
      '<ellipse cx="60" cy="160" rx="28" ry="7" fill="#D7C3A2"/>' +
      '<ellipse cx="60" cy="156" rx="6" ry="3.6" fill="#7A5A3C"/>' +
      '<ellipse cx="58" cy="155" rx="2" ry="1.1" fill="#E6D0B0" opacity="0.7"/>';
  }

  function soil() {
    return '<ellipse cx="60" cy="164" rx="38" ry="10" fill="#E4D2B8"/>' +
      '<ellipse cx="60" cy="160" rx="26" ry="6.5" fill="#CDB892"/>';
  }

  function leaf(x, y, rotate, scale, fill) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + rotate + ") scale(" + scale + ')">' +
      '<path d="M0 0 C 16 -18 40 -14 46 0 C 34 12 14 12 0 0 Z" fill="' + fill + '"/>' +
      '<path d="M4 0 H34" stroke="#35463A" stroke-width="0.7" opacity="0.28"/>' +
      "</g>";
  }

  function plantInner(kind, stage) {
    if (stage <= 0) return seedSvg();
    var base = soil();
    if (kind === "sprout") {
      var top = stage === 1 ? 126 : stage === 2 ? 104 : stage === 3 ? 84 : 68;
      base += '<path d="M60 158 C62 ' + (top + 30) + " 58 " + (top + 12) + " 60 " + top + '" stroke="#35463A" stroke-width="2.2" fill="none"/>';
      if (stage >= 2) base += leaf(60, top + 18, -30, 0.55, "#849B79") + leaf(60, top + 18, 150, 0.55, "#DDE5D7");
      if (stage >= 3) base += leaf(60, top + 8, -10, 0.72, "#6E8664");
      if (stage >= 4) base += '<circle cx="60" cy="' + (top - 6) + '" r="7" fill="#F0D4CA" stroke="#35463A" stroke-width="1.2"/>';
      return base;
    }
    if (kind === "herb") {
      var pairs = stage + 1;
      base += '<path d="M60 158 V' + (150 - pairs * 16) + '" stroke="#35463A" stroke-width="2" fill="none"/>';
      for (var p = 0; p < pairs; p += 1) {
        var y = 148 - p * 16;
        base += leaf(60, y, -40, 0.48 + stage * 0.04, p % 2 ? "#9AAF90" : "#849B79");
        base += leaf(60, y, 140, 0.48 + stage * 0.04, "#6E8664");
      }
      if (stage >= 4) base += '<path d="M60 ' + (150 - pairs * 16) + ' v-16" stroke="#849B79" stroke-width="3" stroke-linecap="round"/>';
      return base;
    }
    if (kind === "tulip") {
      var stem = stage === 1 ? 118 : stage === 2 ? 96 : 74;
      base += '<path d="M62 158 C70 130 48 110 60 ' + stem + '" stroke="#35463A" stroke-width="2.3" fill="none"/>';
      if (stage >= 2) base += leaf(58, 132, 20, 0.7, "#849B79") + leaf(64, 138, 200, 0.62, "#6E8664");
      if (stage === 3) base += '<ellipse cx="60" cy="' + (stem - 8) + '" rx="7" ry="12" fill="#E8C4B8"/>';
      if (stage >= 4) {
        base += '<path d="M60 ' + (stem + 8) + " C48 " + (stem - 8) + " 46 " + (stem - 28) + " 60 " + (stem - 24) + " C74 " + (stem - 28) + " 72 " + (stem - 8) + " 60 " + (stem + 8) + ' Z" fill="#F0D4CA" stroke="#35463A" stroke-width="1.1"/>';
      }
      return base;
    }
    if (kind === "fern") {
      var fronds = stage + 1;
      for (var f = 0; f < fronds; f += 1) {
        var dir = f % 2 === 0 ? -1 : 1;
        var y2 = 150 - f * 14;
        base += '<path d="M60 158 C ' + (60 + dir * 10) + " " + (y2 + 20) + " " + (60 + dir * 28) + " " + y2 + " " + (60 + dir * 34) + " " + (y2 - 8) + '" stroke="#6E8664" stroke-width="2" fill="none"/>';
        base += leaf(60 + dir * 24, y2 - 2, dir > 0 ? 30 : -30, 0.42 + stage * 0.05, "#849B79");
      }
      return base;
    }
    if (kind === "daisy") {
      base += '<path d="M60 158 V' + (stage >= 3 ? 88 : 116) + '" stroke="#35463A" stroke-width="2" fill="none"/>';
      base += leaf(60, 136, -24, 0.6, "#849B79") + leaf(60, 140, 160, 0.55, "#9AAF90");
      var cy = stage >= 3 ? 78 : 108;
      if (stage >= 3) {
        for (var petal = 0; petal < (stage === 4 ? 8 : 5); petal += 1) {
          var angle = (petal / (stage === 4 ? 8 : 5)) * Math.PI * 2;
          var px = 60 + Math.cos(angle) * 14;
          var py = cy + Math.sin(angle) * 12;
          base += '<ellipse cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" rx="6" ry="10" fill="#FFFCF8" stroke="#EBDDC5" transform="rotate(' + (angle * 180 / Math.PI).toFixed(1) + " " + px.toFixed(1) + " " + py.toFixed(1) + ')"/>';
        }
        base += '<circle cx="60" cy="' + cy + '" r="6" fill="#EBDDC5" stroke="#35463A" stroke-width="1"/>';
      }
      return base;
    }
    if (kind === "spire") {
      var spikes = stage;
      base += '<path d="M52 158 C50 120 56 100 58 86" stroke="#6E8664" stroke-width="2" fill="none"/>';
      base += '<path d="M68 158 C74 124 66 102 64 88" stroke="#35463A" stroke-width="2" fill="none"/>';
      for (var s = 0; s < spikes; s += 1) {
        base += '<ellipse cx="' + (56 + (s % 2) * 10) + '" cy="' + (120 - s * 12) + '" rx="4" ry="9" fill="' + (s % 2 ? "#849B79" : "#9AAF90") + '"/>';
      }
      if (stage >= 4) base += '<ellipse cx="60" cy="70" rx="5" ry="12" fill="#F0D4CA"/>';
      return base;
    }
    if (kind === "bush") {
      var blobs = 2 + stage;
      for (var b = 0; b < blobs; b += 1) {
        var bx = 42 + (b % 3) * 16;
        var by = 132 - Math.floor(b / 3) * 18;
        base += '<circle cx="' + bx + '" cy="' + by + '" r="' + (12 + stage) + '" fill="' + (b % 2 ? "#849B79" : "#6E8664") + '"/>';
      }
      if (stage >= 4) {
        base += '<circle cx="50" cy="118" r="3" fill="#F0D4CA"/>';
        base += '<circle cx="70" cy="108" r="3" fill="#EBDDC5"/>';
        base += '<circle cx="62" cy="128" r="3" fill="#F0D4CA"/>';
      }
      return base;
    }
    var canopy = 18 + stage * 6;
    base += '<path d="M58 158 V' + (120 - stage * 6) + '" stroke="#6A5340" stroke-width="4" stroke-linecap="round"/>';
    base += '<circle cx="60" cy="' + (104 - stage * 8) + '" r="' + canopy + '" fill="#849B79"/>';
    base += '<circle cx="' + (42 - stage) + '" cy="' + (112 - stage * 6) + '" r="' + (canopy - 6) + '" fill="#6E8664"/>';
    base += '<circle cx="' + (78 + stage) + '" cy="' + (114 - stage * 5) + '" r="' + (canopy - 8) + '" fill="#9AAF90"/>';
    if (stage >= 4) {
      base += '<circle cx="52" cy="86" r="3.5" fill="#F0D4CA"/>';
      base += '<circle cx="74" cy="96" r="3.5" fill="#FFFCF8"/>';
      base += '<circle cx="64" cy="74" r="3.5" fill="#EBDDC5"/>';
    }
    return base;
  }

  function plantSvg(kind, stage) {
    return '<svg viewBox="0 0 120 180" aria-hidden="true" focusable="false">' + plantInner(kind, stage) + "</svg>";
  }

  function stageFor(index, points) {
    var start = index * 4;
    if (points <= start) return 0;
    return Math.min(4, points - start);
  }

  function butterfly(index) {
    var colors = ["#F0D4CA", "#EBDDC5", "#DDE5D7"];
    var color = colors[index % colors.length];
    return '<svg viewBox="0 0 40 30" aria-hidden="true"><ellipse cx="12" cy="16" rx="10" ry="7" fill="' + color + '"/><ellipse cx="28" cy="16" rx="10" ry="7" fill="' + color + '"/><rect x="19" y="8" width="2" height="16" rx="1" fill="#35463A"/></svg>';
  }

  function emptyBlock(title, copy, actions) {
    return '<article class="card empty"><svg viewBox="0 0 72 72" aria-hidden="true"><ellipse cx="36" cy="58" rx="22" ry="6" fill="#EBDDC5"/><ellipse cx="36" cy="54" rx="5" ry="3" fill="#7A5A3C"/><path d="M36 52 V34" stroke="#849B79" stroke-width="2"/><path d="M36 40 C28 36 26 28 30 26 C31 34 36 38 36 40Z" fill="#DDE5D7"/></svg><h3>' +
      escapeHtml(title) + "</h3><p class=\"lede\">" + escapeHtml(copy) + "</p>" + (actions || "") + "</article>";
  }

  function renderNav() {
    showView(currentView, false);
  }

  function renderHome() {
    var checkin = activeCheckin();
    document.getElementById("greeting").textContent = greeting();
    document.getElementById("today-date").textContent = formatFullDate();
    var moodKey = SUPPORT[checkin.mood] ? checkin.mood : "none";
    document.getElementById("support-message").textContent = pick(SUPPORT[moodKey]);
    document.getElementById("energy-line").textContent = checkin.energy ? ENERGY_LINE[checkin.energy] : "";
    var nameInput = document.getElementById("display-name");
    if (document.activeElement !== nameInput) nameInput.value = state.profile.name;
    var restBtn = document.getElementById("rest-btn");
    var resting = state.restDay === todayISO();
    restBtn.textContent = resting ? "Rest is noted today" : "I'm resting today";
    restBtn.setAttribute("aria-pressed", resting ? "true" : "false");
    document.getElementById("rest-note").textContent = resting
      ? "Rest is already part of today. It still counts."
      : "Rest is a valid step. It can be the whole plan.";
    var note = document.getElementById("checkin-note");
    if (checkin.previous && checkin.previous.date !== todayISO()) {
      note.textContent = "A new day. Yesterday’s note can stay where it was.";
    } else {
      note.textContent = "";
    }
    syncCheckin();
    var intro = document.getElementById("suggest-intro");
    var openCount = state.tasks.filter(function (task) { return !task.done; }).length;
    if (!checkin.energy) {
      intro.textContent = openCount
        ? "These are balanced starting points. Set your energy if you want them smaller or a little fuller."
        : "Nothing is waiting. That can be a relief.";
    } else if (checkin.energy === "low") {
      intro.textContent = "Low energy gets the tiniest versions. The rest of the list can stay quiet.";
    } else if (checkin.energy === "more") {
      intro.textContent = "There is room for a slightly fuller step. One is still enough.";
    } else {
      intro.textContent = "One clear thing at a time. Leave the others for later.";
    }
    var list = document.getElementById("suggestion-list");
    var picks = suggestedTasks();
    if (!picks.length) {
      list.innerHTML = emptyBlock(
        "A clear space",
        "Add one small task, visit Feeling Stuck, or let the day be quiet.",
        '<div class="task-actions"><button type="button" class="btn btn-primary" data-action="add-task">Add a small task</button><button type="button" class="btn btn-secondary" data-action="nav" data-view="stuck">Feeling Stuck</button></div>'
      );
      return;
    }
    var energy = checkin.energy;
    list.innerHTML = picks.map(function (task) {
      var step = nextUndoneStep(task);
      var title = step && energy !== "more" ? step.title : task.title;
      var eyebrow = step && energy !== "more" ? "From “" + task.title + "”" : categoryLabel(task.category);
      var actions = '<button type="button" class="btn btn-primary btn-tiny" data-action="focus-task" data-task-id="' + escapeHtml(task.id) + '">Start in Focus Room</button>';
      if (step) {
        actions += '<button type="button" class="btn btn-secondary btn-tiny" data-action="complete-step" data-task-id="' + escapeHtml(task.id) + '" data-step-id="' + escapeHtml(step.id) + '">I did this small step</button>';
      } else {
        actions += '<button type="button" class="btn btn-secondary btn-tiny" data-action="edit-task" data-task-id="' + escapeHtml(task.id) + '" data-break="true">Break into small steps</button>';
      }
      return '<article class="card suggest-card"><p class="eyebrow">' + escapeHtml(eyebrow) + "</p><h3>" + escapeHtml(title) + '</h3><p class="lede">' + escapeHtml(reasonFor(energy)) + '</p><div class="task-actions">' + actions + "</div></article>";
    }).join("") + (openCount > picks.length
      ? '<p class="fine">There ' + (openCount - picks.length === 1 ? "is 1 more task" : "are " + (openCount - picks.length) + " more tasks") + " on your list. They can wait.</p>"
      : "");
  }

  function syncCheckin() {
    var checkin = activeCheckin();
    syncing = true;
    document.querySelectorAll('input[name="mood"]').forEach(function (input) {
      input.checked = input.value === checkin.mood;
    });
    document.querySelectorAll('input[name="energy"]').forEach(function (input) {
      input.checked = input.value === checkin.energy;
    });
    syncing = false;
  }

  function renderTasks() {
    document.querySelectorAll('[data-action="task-filter"]').forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-filter") === state.taskFilter ? "true" : "false");
    });
    var search = document.getElementById("task-search");
    if (document.activeElement !== search) search.value = state.taskQuery;
    var category = document.getElementById("task-category-filter");
    if (document.activeElement !== category) category.value = state.taskCategory;
    var tasks = visibleTasks();
    var openCount = state.tasks.filter(function (task) { return !task.done; }).length;
    document.getElementById("task-count").textContent = openCount
      ? openCount + (openCount === 1 ? " task is waiting. It can wait." : " tasks are waiting. They can wait.")
      : "Nothing is open. Completed things stay in the Completed view.";
    var list = document.getElementById("task-list");
    if (!state.tasks.length) {
      list.innerHTML = emptyBlock(
        "Your list is quiet",
        "Add one task in words you will recognise later. You can break it into tiny steps.",
        '<div class="task-actions"><button type="button" class="btn btn-primary" data-action="add-task">Add a task</button></div>'
      );
      return;
    }
    if (!tasks.length) {
      list.innerHTML = emptyBlock("Nothing in this view", "The rest of your list is still safe.", "");
      return;
    }
    list.innerHTML = tasks.map(function (task) {
      var doneSteps = task.subtasks.filter(function (step) { return step.done; }).length;
      var total = task.subtasks.length;
      var meta = [categoryLabel(task.category), priorityLabel(task.priority)];
      if (task.deadline) meta.push(formatDeadline(task.deadline));
      var meter = total
        ? '<div class="step-meter" aria-hidden="true"><span style="width:' + Math.round((doneSteps / total) * 100) + '%"></span></div><p class="fine">' + doneSteps + " of " + total + " little steps</p>"
        : '<p class="fine">No little steps yet.</p>';
      var next = nextUndoneStep(task);
      var nextHtml = "";
      if (next && !task.done) {
        nextHtml = '<div class="next-step"><p class="fine">Next small step</p><label class="step-line"><input type="checkbox" data-action="toggle-step" data-task-id="' + escapeHtml(task.id) + '" data-step-id="' + escapeHtml(next.id) + '" aria-label="Mark step done: ' + escapeHtml(next.title) + '"><span>' + escapeHtml(next.title) + "</span></label></div>";
      } else if (total && doneSteps === total && !task.done) {
        nextHtml = '<p class="fine">All the little steps are done. You can mark the whole task complete if that feels true.</p>';
      }
      var stepsHtml = "";
      if (total && expanded[task.id]) {
        stepsHtml = '<ul class="step-list">' + task.subtasks.map(function (step) {
          return '<li><label class="step-line"><input type="checkbox" data-action="toggle-step" data-task-id="' + escapeHtml(task.id) + '" data-step-id="' + escapeHtml(step.id) + '"' + (step.done ? " checked" : "") + ' aria-label="Mark step done: ' + escapeHtml(step.title) + '"><span>' + escapeHtml(step.title) + "</span></label></li>";
        }).join("") + "</ul>";
      }
      var showSteps = total
        ? '<button type="button" class="btn btn-ghost btn-tiny" data-action="toggle-steps" data-task-id="' + escapeHtml(task.id) + '" aria-expanded="' + (expanded[task.id] ? "true" : "false") + '">' + (expanded[task.id] ? "Hide steps" : "Show all steps") + "</button>"
        : "";
      return '<article class="card task-card' + (highlightId === task.id ? " is-highlight" : "") + '"><div class="task-top"><label class="task-check"><input type="checkbox" data-action="toggle-task" data-task-id="' + escapeHtml(task.id) + '"' + (task.done ? " checked" : "") + ' aria-label="Mark whole task complete: ' + escapeHtml(task.title) + '"></label><div><h3 class="task-title' + (task.done ? " is-done" : "") + '">' + escapeHtml(task.title) + '</h3><p class="meta">' + escapeHtml(meta.join(" · ")) + "</p></div></div>" +
        (task.notes ? '<p class="notes-preview user-text">' + escapeHtml(task.notes) + "</p>" : "") +
        meter + nextHtml + stepsHtml +
        '<div class="task-actions">' +
        (task.done ? "" : '<button type="button" class="btn btn-secondary btn-tiny" data-action="focus-task" data-task-id="' + escapeHtml(task.id) + '">Focus</button>') +
        '<button type="button" class="btn btn-ghost btn-tiny" data-action="edit-task" data-task-id="' + escapeHtml(task.id) + '">Edit</button>' +
        '<button type="button" class="btn btn-ghost btn-tiny" data-action="edit-task" data-task-id="' + escapeHtml(task.id) + '" data-break="true">Break down</button>' +
        showSteps +
        '<button type="button" class="btn btn-quiet btn-tiny" data-action="remove-task" data-task-id="' + escapeHtml(task.id) + '">Remove</button>' +
        "</div></article>";
    }).join("");
  }

  function renderDumps() {
    var input = document.getElementById("dump-input");
    if (document.activeElement !== input) input.value = state.dumpDraft;
    var list = document.getElementById("dump-list");
    if (!state.dumps.length) {
      list.innerHTML = emptyBlock("Nothing is stored yet", "When you keep a note, it waits here. You can turn it into a task later, or let it go.", "");
      return;
    }
    list.innerHTML = state.dumps.map(function (entry) {
      var linked = entry.taskId && findTask(entry.taskId);
      var actions = linked
        ? '<button type="button" class="btn btn-secondary btn-tiny" data-action="show-task" data-task-id="' + escapeHtml(entry.taskId) + '">See it in My Tasks</button>'
        : '<button type="button" class="btn btn-secondary btn-tiny" data-action="dump-to-task" data-dump-id="' + escapeHtml(entry.id) + '">Make this a task</button>';
      actions += '<button type="button" class="btn btn-quiet btn-tiny" data-action="remove-dump" data-dump-id="' + escapeHtml(entry.id) + '">Let it go</button>';
      return '<article class="card dump-card"><header><p class="fine">' + escapeHtml(formatWhen(entry.createdAt)) + "</p>" +
        (linked ? '<span class="badge">Also a task</span>' : "") +
        '</header><p class="user-text">' + escapeHtml(entry.text) + '</p><div class="task-actions">' + actions + "</div></article>";
    }).join("");
  }

  function renderStuck() {
    var root = document.getElementById("stuck-root");
    if (state.stuck.mode === "enough") {
      root.innerHTML = '<article class="card stuck-card"><p class="stuck-kicker">Enough for now</p><h3 class="stuck-title">You can stop here.</h3><p class="lede">Stopping is a complete choice. The garden keeps whatever already grew.</p><div class="task-actions"><button type="button" class="btn btn-primary" data-action="stuck-more">Another little step</button><button type="button" class="btn btn-secondary" data-action="nav" data-view="home">Back home</button></div></article>';
      return;
    }
    if (state.stuck.mode === "ack") {
      root.innerHTML = '<article class="card stuck-card"><p class="stuck-kicker">Kept</p><h3 class="stuck-title">That was a real step.</h3><p class="lede">' + escapeHtml(state.stuck.lastTitle || "You did something small.") + "</p><div class=\"task-actions\"><button type=\"button\" class=\"btn btn-primary\" data-action=\"stuck-more\">Another little step</button><button type=\"button\" class=\"btn btn-secondary\" data-action=\"stuck-enough\">That’s enough for now</button></div></article>";
      return;
    }
    var suggestion = currentSuggestion();
    root.innerHTML = '<article class="card stuck-card"><p class="stuck-kicker">One small action</p><h3 class="stuck-title">' + escapeHtml(suggestion.title) + '</h3><p class="lede">' + escapeHtml(suggestion.detail) + '</p><div class="task-actions"><button type="button" class="btn btn-primary" data-action="stuck-done">I’ll try this</button><button type="button" class="btn btn-secondary" data-action="stuck-next">A different step</button></div></article>';
  }

  function renderFocusContext() {
    var select = document.getElementById("focus-task");
    var current = state.focus.taskId || "";
    var options = ['<option value="">A little time, no specific task</option>'];
    state.tasks.filter(function (task) { return !task.done; }).forEach(function (task) {
      options.push('<option value="' + escapeHtml(task.id) + '">' + escapeHtml(task.title) + "</option>");
    });
    if (current && !state.tasks.some(function (task) { return task.id === current && !task.done; })) {
      var doneTask = findTask(current);
      if (doneTask) options.push('<option value="' + escapeHtml(doneTask.id) + '">' + escapeHtml(doneTask.title) + " (complete)</option>");
      else current = "";
    }
    var previous = select.value;
    select.innerHTML = options.join("");
    select.value = state.tasks.some(function (task) { return task.id === current; }) || current === "" ? current : "";
    if (document.activeElement === select && previous) select.value = previous;
    var task = focusTask();
    document.getElementById("focus-title").textContent = task ? task.title : "A little pocket of time";
    var step = task ? nextUndoneStep(task) : null;
    document.getElementById("focus-sub").textContent = task
      ? (step ? "Next small step: " + step.title : "Stay with this one thing. You do not have to finish every piece.")
      : "No task selected. The time still counts.";
    var actions = document.getElementById("focus-task-actions");
    if (!task) {
      actions.innerHTML = '<button type="button" class="btn btn-secondary" data-action="add-task">Add a task</button>';
      return;
    }
    var html = "";
    if (step && !task.done) {
      html += '<button type="button" class="btn btn-secondary" data-action="complete-step" data-task-id="' + escapeHtml(task.id) + '" data-step-id="' + escapeHtml(step.id) + '">Mark the next small step complete</button>';
    }
    html += '<button type="button" class="btn btn-ghost" data-action="toggle-task-button" data-task-id="' + escapeHtml(task.id) + '">' +
      (task.done ? "Return this task to my list" : "Mark the whole task complete") + "</button>";
    actions.innerHTML = html;
  }

  function updateTimerDom() {
    var readout = document.getElementById("timer-readout");
    var ring = document.getElementById("timer-ring");
    var status = document.getElementById("timer-status");
    if (!readout || !ring || !status) return;
    readout.textContent = formatTime(state.focus.remaining);
    var ratio = state.focus.duration ? Math.max(0, Math.min(1, state.focus.remaining / state.focus.duration)) : 0;
    ring.style.strokeDasharray = String(RING_C);
    ring.style.strokeDashoffset = String(RING_C * (1 - ratio));
    var message = "Choose a length that feels kind today.";
    if (state.focus.phase === "running") {
      var elapsed = state.focus.duration - state.focus.remaining;
      message = FOCUS_NOTES[Math.floor(elapsed / 15) % FOCUS_NOTES.length];
    } else if (state.focus.phase === "paused") {
      message = "Paused. Nothing is lost.";
    } else if (state.focus.phase === "done") {
      message = "Time is up. You can stop here, and it still counts.";
    }
    status.textContent = message;
    document.getElementById("timer-start").disabled = state.focus.running;
    document.getElementById("timer-pause").disabled = !state.focus.running;
    document.querySelectorAll("[data-minutes]").forEach(function (button) {
      var active = Number(button.getAttribute("data-minutes")) * 60 === state.focus.duration;
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.disabled = state.focus.running;
    });
    var chime = document.getElementById("chime-toggle");
    if (document.activeElement !== chime) chime.checked = state.profile.chime;
    if (state.focus.running) document.title = formatTime(state.focus.remaining) + " · One Little Step";
    else document.title = "One Little Step";
  }

  function renderGarden() {
    var points = state.garden.points;
    var stages = PLANTS.map(function (_, index) { return stageFor(index, points); });
    var signature = points + "|" + stages.join(",");
    if (signature !== gardenSignature) {
      gardenSignature = signature;
      document.getElementById("garden-bed").innerHTML = PLANTS.map(function (plant, index) {
        var stage = stages[index];
        var grew = paintedStages && stage > paintedStages[index];
        return '<li><div class="plant-fig' + (grew ? " just-grew" : "") + '">' + plantSvg(plant.id, stage) +
          '</div><p class="plant-caption"><span class="plant-name">' + escapeHtml(plant.name) + '</span><span class="plant-stage">' + STAGE_NAMES[stage] + "</span></p></li>";
      }).join("");
      paintedStages = stages;
      var extras = Math.max(0, points - PLANTS.length * 4);
      var shown = Math.min(12, extras);
      document.getElementById("garden-extras").innerHTML = Array.from({ length: shown }, function (_, index) {
        var left = 8 + (index * 37) % 82;
        var top = 10 + (index * 19) % 36;
        return '<span class="butterfly-wrap" style="left:' + left + '%;top:' + top + '%">' + butterfly(index) + "</span>";
      }).join("");
    }
    var bloomed = stages.filter(function (stage) { return stage === 4; }).length;
    var growing = stages.filter(function (stage) { return stage > 0 && stage < 4; }).length;
    var seeds = stages.filter(function (stage) { return stage === 0; }).length;
    var summary = points === 0
      ? "The seeds are here. They can wait as long as you need. Nothing wilts."
      : bloomed + " in bloom, " + growing + " growing, " + seeds + " waiting as seeds. " + points + (points === 1 ? " moment of care is held here." : " moments of care are held here.");
    if (points > PLANTS.length * 4) {
      summary += " The garden is fully in bloom, and it keeps every new moment.";
    }
    document.getElementById("garden-summary").textContent = summary;
  }

  function renderWins() {
    var list = document.getElementById("wins-list");
    if (!state.wins.length) {
      list.innerHTML = emptyBlock(
        "Wins will gather here",
        "Complete something small, finish a focus session, or note that you rested. There is no streak to protect.",
        ""
      );
      return;
    }
    var groups = [];
    state.wins.forEach(function (win) {
      var key = todayISO(new Date(win.at));
      var group = groups.filter(function (item) { return item.key === key; })[0];
      if (!group) {
        group = { key: key, label: dayLabel(win.at), items: [] };
        groups.push(group);
      }
      group.items.push(win);
    });
    list.innerHTML = groups.map(function (group) {
      return '<h3 class="day-label">' + escapeHtml(group.label) + "</h3>" + group.items.map(function (win) {
        return '<article class="card win-card"><p class="win-kind">' + escapeHtml(KIND_LABELS[win.kind] || "Kept") + '</p><h3>' + escapeHtml(win.text) + "</h3>" +
          (win.detail ? '<p class="lede">' + escapeHtml(win.detail) + "</p>" : "") +
          '<p class="fine">' + escapeHtml(formatWhen(win.at)) + "</p></article>";
      }).join("");
    }).join("");
  }

  function render() {
    try {
      renderHome();
      renderTasks();
      renderDumps();
      renderStuck();
      renderFocusContext();
      updateTimerDom();
      renderGarden();
      renderWins();
    } catch (err) {
      console.error(err);
      announce("Something on the page needed a refresh. Your saved data is still on this device.");
    }
  }

  function setCheckin(partial) {
    var today = todayISO();
    if (state.checkin.date !== today) {
      state.checkin = { date: today, mood: "", energy: "" };
    }
    if (partial.mood) state.checkin.mood = partial.mood;
    if (partial.energy) state.checkin.energy = partial.energy;
    state.checkin.date = today;
    save();
    renderHome();
  }

  function noteRest() {
    if (state.restDay === todayISO()) {
      toast("Rest is already part of today. It still counts.");
      return;
    }
    state.restDay = todayISO();
    state.garden.points += 1;
    addWin({
      kind: "rest",
      refId: state.restDay,
      text: "You let yourself rest",
      detail: "Rest is a valid part of the day"
    });
    save();
    render();
    toast("Rest counts. Your garden grew a little.");
  }

  function setTaskDone(task, done) {
    if (task.done === done) return;
    task.done = done;
    task.completedAt = done ? Date.now() : null;
    if (done) {
      removeWin("task", task.id);
      awardTask(task);
      announce(task.title + " is complete");
    } else {
      removeWin("task", task.id);
      announce(task.title + " is back on your list. The garden keeps its growth.");
    }
  }

  function setStepDone(task, step, done) {
    if (step.done === done) return;
    step.done = done;
    if (done) awardStep(step, task);
    else {
      removeWin("step", step.id);
      announce("Step moved back. The garden keeps its growth.");
    }
  }

  function blankTask(prefill) {
    prefill = prefill || {};
    return {
      id: uid(),
      title: prefill.title || "",
      notes: prefill.notes || "",
      category: prefill.category || "personal",
      priority: "whenever",
      deadline: "",
      subtasks: [],
      done: false,
      createdAt: Date.now(),
      completedAt: null,
      isNew: true,
      fromDumpId: prefill.fromDumpId || ""
    };
  }

  function fillEditor() {
    document.getElementById("editor-heading").textContent = editor.isNew ? "Add a task" : "Edit task";
    document.getElementById("task-title").value = editor.title;
    document.getElementById("task-notes").value = editor.notes;
    document.getElementById("task-category").value = editor.category;
    document.getElementById("task-deadline").value = editor.deadline || "";
    document.querySelectorAll('input[name="priority"]').forEach(function (input) {
      input.checked = input.value === editor.priority;
    });
    setTaskError("");
    renderEditorSteps();
  }

  function renderEditorSteps() {
    var list = document.getElementById("editor-steps");
    if (!editor.subtasks.length) {
      list.innerHTML = '<li><p class="fine">No steps yet. Add your own, or use a gentle pattern.</p></li>';
      return;
    }
    list.innerHTML = editor.subtasks.map(function (step) {
      return '<li><input type="checkbox" data-editor-done="' + escapeHtml(step.id) + '"' + (step.done ? " checked" : "") + ' aria-label="Step done"><input type="text" maxlength="160" data-editor-step="' + escapeHtml(step.id) + '" value="' + escapeHtml(step.title) + '" aria-label="Step"><button type="button" class="btn btn-ghost btn-tiny" data-action="remove-subtask" data-step-id="' + escapeHtml(step.id) + '">Remove</button></li>';
    }).join("");
  }

  function openEditor(task, options) {
    options = options || {};
    editor = task ? JSON.parse(JSON.stringify(task)) : blankTask(options.prefill);
    if (task) editor.isNew = false;
    fillEditor();
    document.getElementById("templates").hidden = !options.breakOpen;
    var dialog = document.getElementById("task-dialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    window.setTimeout(function () {
      document.getElementById("task-title").focus();
    }, 20);
  }

  function closeEditor() {
    var dialog = document.getElementById("task-dialog");
    if (dialog.open && typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    editor = null;
  }

  function setTaskError(message) {
    var el = document.getElementById("task-error");
    el.textContent = message || "";
    el.hidden = !message;
  }

  function readEditor() {
    editor.title = document.getElementById("task-title").value.trim();
    editor.notes = document.getElementById("task-notes").value.trim();
    editor.category = document.getElementById("task-category").value;
    editor.deadline = document.getElementById("task-deadline").value;
    var priority = document.querySelector('input[name="priority"]:checked');
    editor.priority = priority ? priority.value : "whenever";
    editor.subtasks = editor.subtasks.map(function (step) {
      var field = document.querySelector('[data-editor-step="' + step.id + '"]');
      var box = document.querySelector('[data-editor-done="' + step.id + '"]');
      return {
        id: step.id,
        title: field ? field.value.trim() : step.title,
        done: box ? box.checked : step.done
      };
    }).filter(function (step) { return step.title; });
  }

  function saveTask() {
    if (!editor) return;
    readEditor();
    if (!editor.title) {
      setTaskError("Add a few words so future-you knows what this is.");
      document.getElementById("task-title").focus();
      return;
    }
    var stored = {
      id: editor.id,
      title: editor.title.slice(0, 140),
      notes: editor.notes.slice(0, 2000),
      category: editor.category,
      priority: editor.priority,
      deadline: editor.deadline,
      subtasks: editor.subtasks,
      done: Boolean(editor.done),
      createdAt: editor.createdAt || Date.now(),
      completedAt: editor.completedAt || null
    };
    var index = state.tasks.findIndex(function (task) { return task.id === stored.id; });
    if (index >= 0) state.tasks[index] = stored;
    else state.tasks.unshift(stored);
    if (editor.fromDumpId) {
      var dump = state.dumps.filter(function (entry) { return entry.id === editor.fromDumpId; })[0];
      if (dump) dump.taskId = stored.id;
    }
    editor.subtasks.forEach(function (step) {
      if (step.done) awardStep(step, stored);
    });
    if (stored.done) awardTask(stored);
    save();
    closeEditor();
    render();
    announce("Task saved");
  }

  function askConfirm(message, acceptLabel, onYes) {
    confirmAction = onYes;
    confirmYes = false;
    document.getElementById("confirm-text").textContent = message;
    document.getElementById("confirm-ok").textContent = acceptLabel || "Remove";
    var dialog = document.getElementById("confirm-dialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function titleFromDump(text) {
    var line = text.split(/\n/).map(function (part) { return part.trim(); }).filter(Boolean)[0] || "Note from brain dump";
    return line.slice(0, 140);
  }

  function acceptStuck() {
    if (state.stuck.mode !== "suggest") return;
    var suggestion = currentSuggestion();
    state.stuck.lastTitle = suggestion.title;
    if (suggestion.stepId) {
      var task = findTask(suggestion.taskId);
      var step = task && task.subtasks.filter(function (item) { return item.id === suggestion.stepId; })[0];
      if (task && step && !step.done) {
        step.done = true;
        awardStep(step, task);
      }
    } else {
      state.garden.points += 1;
      addWin({
        kind: "stuck",
        refId: uid(),
        text: suggestion.title,
        detail: suggestion.detail
      });
      toast("That small action counts. Your garden grew a little.");
    }
    state.stuck.index += 1;
    state.stuck.mode = "ack";
    save();
    render();
  }

  function ensureTimer() {
    if (timerHandle) return;
    timerHandle = window.setInterval(timerTick, 200);
  }

  function stopTimerLoop() {
    window.clearInterval(timerHandle);
    timerHandle = null;
  }

  function timerTick() {
    if (!state.focus.running || !state.focus.endsAt) return;
    state.focus.remaining = Math.max(0, (state.focus.endsAt - Date.now()) / 1000);
    if (state.focus.remaining <= 0) finishFocusSession(false);
    else updateTimerDom();
  }

  function startTimer() {
    if (state.focus.running) return;
    if (state.focus.phase === "done" || state.focus.remaining <= 0) {
      state.focus.remaining = state.focus.duration;
    }
    state.focus.running = true;
    state.focus.phase = "running";
    state.focus.endsAt = Date.now() + state.focus.remaining * 1000;
    if (!state.focus.sessionId) state.focus.sessionId = uid();
    save();
    ensureTimer();
    updateTimerDom();
    announce("Timer started");
  }

  function pauseTimer() {
    if (!state.focus.running) return;
    state.focus.remaining = Math.max(0, (state.focus.endsAt - Date.now()) / 1000);
    state.focus.running = false;
    state.focus.endsAt = null;
    state.focus.phase = "paused";
    save();
    stopTimerLoop();
    updateTimerDom();
    announce("Timer paused");
  }

  function resetTimer() {
    state.focus.running = false;
    state.focus.endsAt = null;
    state.focus.remaining = state.focus.duration;
    state.focus.sessionId = null;
    state.focus.phase = "idle";
    save();
    stopTimerLoop();
    updateTimerDom();
    announce("Timer reset");
  }

  function setDuration(minutes) {
    if (state.focus.running) return;
    state.focus.duration = minutes * 60;
    state.focus.remaining = state.focus.duration;
    state.focus.sessionId = null;
    state.focus.phase = "idle";
    state.focus.endsAt = null;
    save();
    updateTimerDom();
  }

  function chime() {
    if (!state.profile.chime) return;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      var ctx = new Ctx();
      [523.25, 659.25].forEach(function (freq, index) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        var start = ctx.currentTime + index * 0.18;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.03, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.75);
      });
    } catch (err) {
      /* Sound is optional. */
    }
  }

  function finishFocusSession(away) {
    var sessionId = state.focus.sessionId;
    var task = focusTask();
    var minutes = Math.round(state.focus.duration / 60);
    state.focus.running = false;
    state.focus.endsAt = null;
    state.focus.remaining = 0;
    state.focus.sessionId = null;
    state.focus.phase = "done";
    stopTimerLoop();
    var awarded = false;
    if (sessionId && state.garden.awarded.sessions.indexOf(sessionId) === -1) {
      state.garden.awarded.sessions.push(sessionId);
      state.garden.points += 1;
      addWin({
        kind: "focus",
        refId: sessionId,
        text: minutes + " quiet minutes",
        detail: task ? "With “" + task.title + "”" : "With no specific task"
      });
      awarded = true;
    }
    save();
    render();
    if (awarded) {
      toast(away
        ? "A focus session finished while this page was closed. It still counts."
        : "Time is up. You can stop here, and it still counts.");
      if (!away) chime();
    }
  }

  function settleTimer() {
    if (state.focus.running) {
      if (state.focus.endsAt && state.focus.endsAt <= Date.now()) finishFocusSession(true);
      else if (state.focus.endsAt) {
        state.focus.remaining = (state.focus.endsAt - Date.now()) / 1000;
        state.focus.phase = "running";
        ensureTimer();
      } else {
        state.focus.running = false;
        state.focus.phase = "paused";
      }
    }
  }

  function fillStaticChoices() {
    var options = CATEGORIES.map(function (category) {
      return '<option value="' + category.id + '">' + category.label + "</option>";
    }).join("");
    document.getElementById("task-category").innerHTML = options;
    document.getElementById("task-category-filter").innerHTML = '<option value="all">All categories</option>' + options;
    document.getElementById("template-buttons").innerHTML = TEMPLATES.map(function (template) {
      return '<button type="button" class="pill-btn" data-action="apply-template" data-template="' + template.id + '">' + template.label + "</button>";
    }).join("");
  }

  function onClick(event) {
    var button = event.target.closest("[data-action]");
    if (!button) return;
    var action = button.getAttribute("data-action");
    if (action === "nav") {
      go(button.getAttribute("data-view"), true);
      return;
    }
    if (action === "add-task") {
      openEditor(null);
      return;
    }
    if (action === "edit-task") {
      var existing = findTask(button.getAttribute("data-task-id"));
      if (existing) openEditor(existing, { breakOpen: button.getAttribute("data-break") === "true" });
      return;
    }
    if (action === "remove-task") {
      var removeId = button.getAttribute("data-task-id");
      askConfirm("Remove this task? Anything your garden already grew will stay.", "Remove", function () {
        state.tasks = state.tasks.filter(function (task) { return task.id !== removeId; });
        if (state.focus.taskId === removeId) state.focus.taskId = "";
        save();
        render();
        announce("Task removed. Garden growth stays.");
      });
      return;
    }
    if (action === "focus-task") {
      state.focus.taskId = button.getAttribute("data-task-id") || "";
      save();
      go("focus", true);
      renderFocusContext();
      return;
    }
    if (action === "toggle-steps") {
      var id = button.getAttribute("data-task-id");
      expanded[id] = !expanded[id];
      renderTasks();
      return;
    }
    if (action === "complete-step") {
      var taskForStep = findTask(button.getAttribute("data-task-id"));
      var step = taskForStep && taskForStep.subtasks.filter(function (item) {
        return item.id === button.getAttribute("data-step-id");
      })[0];
      if (taskForStep && step) {
        setStepDone(taskForStep, step, true);
        save();
        render();
      }
      return;
    }
    if (action === "toggle-task-button") {
      var whole = findTask(button.getAttribute("data-task-id"));
      if (whole) {
        setTaskDone(whole, !whole.done);
        save();
        render();
      }
      return;
    }
    if (action === "rest-today") {
      noteRest();
      return;
    }
    if (action === "task-filter") {
      state.taskFilter = button.getAttribute("data-filter");
      save();
      renderTasks();
      return;
    }
    if (action === "close-dialog") {
      closeEditor();
      return;
    }
    if (action === "clear-deadline") {
      document.getElementById("task-deadline").value = "";
      return;
    }
    if (action === "toggle-templates") {
      var panel = document.getElementById("templates");
      panel.hidden = !panel.hidden;
      return;
    }
    if (action === "add-subtask") {
      if (!editor) return;
      readEditor();
      var stepId = uid();
      editor.subtasks.push({ id: stepId, title: "", done: false });
      renderEditorSteps();
      var field = document.querySelector('[data-editor-step="' + stepId + '"]');
      if (field) field.focus();
      return;
    }
    if (action === "remove-subtask") {
      if (!editor) return;
      readEditor();
      var dropId = button.getAttribute("data-step-id");
      editor.subtasks = editor.subtasks.filter(function (step) { return step.id !== dropId; });
      renderEditorSteps();
      return;
    }
    if (action === "apply-template") {
      if (!editor) return;
      readEditor();
      var template = TEMPLATES.filter(function (item) { return item.id === button.getAttribute("data-template"); })[0];
      if (!template) return;
      template.steps.forEach(function (title) {
        editor.subtasks.push({ id: uid(), title: title, done: false });
      });
      renderEditorSteps();
      announce(template.steps.length + " small steps added. You can edit or remove any of them.");
      return;
    }
    if (action === "dump-to-task") {
      var dump = state.dumps.filter(function (entry) { return entry.id === button.getAttribute("data-dump-id"); })[0];
      if (!dump) return;
      openEditor(null, {
        prefill: {
          title: titleFromDump(dump.text),
          notes: dump.text,
          fromDumpId: dump.id,
          category: "personal"
        }
      });
      return;
    }
    if (action === "remove-dump") {
      var dumpId = button.getAttribute("data-dump-id");
      var entry = state.dumps.filter(function (item) { return item.id === dumpId; })[0];
      var copy = entry && entry.taskId && findTask(entry.taskId)
        ? "Let this writing go? A task made from it will stay."
        : "Let this writing go? This cannot be undone.";
      askConfirm(copy, "Let it go", function () {
        state.dumps = state.dumps.filter(function (item) { return item.id !== dumpId; });
        save();
        renderDumps();
        announce("Writing released");
      });
      return;
    }
    if (action === "show-task") {
      highlightId = button.getAttribute("data-task-id");
      state.taskFilter = "all";
      state.taskCategory = "all";
      state.taskQuery = "";
      save();
      go("tasks", true);
      renderTasks();
      window.setTimeout(function () {
        highlightId = "";
        renderTasks();
      }, 2400);
      return;
    }
    if (action === "stuck-done") {
      acceptStuck();
      return;
    }
    if (action === "stuck-next") {
      state.stuck.index += 1;
      state.stuck.mode = "suggest";
      save();
      renderStuck();
      announce("Here is a different small step");
      return;
    }
    if (action === "stuck-enough") {
      state.stuck.mode = "enough";
      save();
      renderStuck();
      return;
    }
    if (action === "stuck-more") {
      state.stuck.mode = "suggest";
      save();
      renderStuck();
      return;
    }
    if (action === "timer-start") startTimer();
    if (action === "timer-pause") pauseTimer();
    if (action === "timer-reset") resetTimer();
    if (action === "timer-duration") setDuration(Number(button.getAttribute("data-minutes")));
  }

  function onChange(event) {
    if (syncing) return;
    var target = event.target;
    if (target.name === "mood") {
      setCheckin({ mood: target.value });
      announce("Mood noted");
      return;
    }
    if (target.name === "energy") {
      setCheckin({ energy: target.value });
      var label = target.value === "low" ? "low energy" : target.value === "more" ? "more energy" : "some energy";
      announce("Suggestions updated for " + label);
      return;
    }
    if (target.id === "task-category-filter") {
      state.taskCategory = target.value;
      save();
      renderTasks();
      return;
    }
    if (target.id === "focus-task") {
      state.focus.taskId = target.value;
      save();
      renderFocusContext();
      return;
    }
    if (target.id === "chime-toggle") {
      state.profile.chime = target.checked;
      save();
      return;
    }
    if (target.getAttribute("data-action") === "toggle-task") {
      var task = findTask(target.getAttribute("data-task-id"));
      if (task) {
        setTaskDone(task, target.checked);
        save();
        render();
      }
      return;
    }
    if (target.getAttribute("data-action") === "toggle-step") {
      var parent = findTask(target.getAttribute("data-task-id"));
      var step = parent && parent.subtasks.filter(function (item) {
        return item.id === target.getAttribute("data-step-id");
      })[0];
      if (parent && step) {
        setStepDone(parent, step, target.checked);
        save();
        render();
      }
    }
  }

  function onInput(event) {
    var target = event.target;
    if (target.id === "display-name") {
      state.profile.name = target.value.slice(0, 40);
      save();
      document.getElementById("greeting").textContent = greeting();
      return;
    }
    if (target.id === "task-search") {
      state.taskQuery = target.value.slice(0, 80);
      save();
      renderTasks();
      return;
    }
    if (target.id === "dump-input") {
      state.dumpDraft = target.value.slice(0, 5000);
      save();
      var error = document.getElementById("dump-error");
      error.hidden = true;
      error.textContent = "";
      return;
    }
    if (target.getAttribute("data-editor-step") && editor) {
      var step = editor.subtasks.filter(function (item) {
        return item.id === target.getAttribute("data-editor-step");
      })[0];
      if (step) step.title = target.value;
    }
  }

  function onKeyDown(event) {
    if (event.target.getAttribute && event.target.getAttribute("data-editor-step") && event.key === "Enter") {
      event.preventDefault();
      var add = document.querySelector('[data-action="add-subtask"]');
      if (add) add.click();
    }
    if (event.target.id === "dump-input" && event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      document.getElementById("dump-form").requestSubmit();
    }
  }

  function init() {
    fillStaticChoices();
    document.body.addEventListener("click", onClick);
    document.body.addEventListener("change", onChange);
    document.body.addEventListener("input", onInput);
    document.body.addEventListener("keydown", onKeyDown);
    document.getElementById("dump-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var text = document.getElementById("dump-input").value.trim();
      var error = document.getElementById("dump-error");
      if (!text) {
        error.textContent = "Write anything at all — a word is enough — or leave this space quiet.";
        error.hidden = false;
        document.getElementById("dump-input").focus();
        return;
      }
      state.dumps.unshift({ id: uid(), text: text, createdAt: Date.now(), taskId: "" });
      state.dumpDraft = "";
      document.getElementById("dump-input").value = "";
      error.hidden = true;
      save();
      renderDumps();
      announce("Kept in your brain dump");
    });
    document.getElementById("task-form").addEventListener("submit", function (event) {
      event.preventDefault();
      saveTask();
    });
    document.getElementById("task-dialog").addEventListener("click", function (event) {
      if (event.target.id === "task-dialog") closeEditor();
    });
    document.getElementById("confirm-keep").addEventListener("click", function () {
      confirmYes = false;
      document.getElementById("confirm-dialog").close();
    });
    document.getElementById("confirm-ok").addEventListener("click", function () {
      confirmYes = true;
      document.getElementById("confirm-dialog").close();
    });
    document.getElementById("confirm-dialog").addEventListener("close", function () {
      var action = confirmAction;
      confirmAction = null;
      if (confirmYes && action) action();
      confirmYes = false;
    });
    window.addEventListener("hashchange", function () {
      showView(viewFromHash() || "home", false);
    });
    document.addEventListener("visibilitychange", function () {
      if (state.focus.running) timerTick();
    });
    if (!viewFromHash()) history.replaceState(null, "", "#home");
    currentView = viewFromHash() || "home";
    showView(currentView, false);
    settleTimer();
    render();
    window.setInterval(function () {
      var dateEl = document.getElementById("today-date");
      if (dateEl && !dateEl.hidden && currentView === "home") dateEl.textContent = formatFullDate();
      var greet = document.getElementById("greeting");
      if (greet && currentView === "home") greet.textContent = greeting();
      if (state.checkin.date && state.checkin.date !== todayISO() && currentView === "home") {
        renderHome();
      }
    }, 60000);
  }

  init();
})();
