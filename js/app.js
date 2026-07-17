(() => {
  const STORAGE_KEYS = {
    theme: 'tld_theme_v1',
    name: 'tld_name_v1',
    pomodoroMinutes: 'tld_pomodoro_minutes_v1',
    tasks: 'tld_tasks_v1',
    links: 'tld_links_v1',
  };

  const $ = (sel) => document.querySelector(sel);

  const els = {
    greetingName: $('#greetingName'),
    greetingTime: $('#greetingTime'),
    greetingDate: $('#greetingDate'),
    nameInput: $('#nameInput'),

    themeToggle: $('#themeToggle'),

    timerDisplay: $('#timerDisplay'),
    timerStatus: $('#timerStatus'),
    timerStart: $('#timerStart'),
    timerStop: $('#timerStop'),
    timerReset: $('#timerReset'),
    pomodoroMinutes: $('#pomodoroMinutes'),
    applyPomodoro: $('#applyPomodoro'),

    todoForm: $('#todoForm'),
    todoInput: $('#todoInput'),
    todoList: $('#todoList'),
    todoEmpty: $('#todoEmpty'),
    todoCount: $('#todoCount'),
    sortSelect: $('#sortSelect'),
    clearDone: $('#clearDone'),

    linksForm: $('#linksForm'),
    linkTitle: $('#linkTitle'),
    linkUrl: $('#linkUrl'),
    linksList: $('#linksList'),
    linksEmpty: $('#linksEmpty'),
    clearLinks: $('#clearLinks'),
  };

  let timer = {
    intervalId: null,
    running: false,
    remainingMs: 25 * 60 * 1000,
    totalMs: 25 * 60 * 1000,
  };

  function nowParts() {
    const d = new Date();
    return {
      d,
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: d.toLocaleDateString([], {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }),
      greeting: getGreeting(d.getHours()),
    };
  }

  function getGreeting(hour) {
    if (hour < 5) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 22) return 'Good evening';
    return 'Good night';
  }

  function formatMmSs(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadTheme() {
    const theme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
  }

  function loadName() {
    const name = localStorage.getItem(STORAGE_KEYS.name) || '';
    els.nameInput.value = name;
    const greeting = getGreeting(new Date().getHours());
    els.greetingName.textContent = name ? `${greeting}, ${name}` : `${greeting}`;
  }

  function saveName() {
    const name = els.nameInput.value.trim().slice(0, 40);
    localStorage.setItem(STORAGE_KEYS.name, name);
    loadName();
  }

  function updateClockUI() {
    const parts = nowParts();
    els.greetingTime.textContent = parts.time;
    els.greetingDate.textContent = parts.date;

    const storedName = (localStorage.getItem(STORAGE_KEYS.name) || '').trim();
    const greeting = parts.greeting;
    els.greetingName.textContent = storedName ? `${greeting}, ${storedName}` : greeting;
  }

  function clearTimerInterval() {
    if (timer.intervalId) {
      clearInterval(timer.intervalId);
      timer.intervalId = null;
    }
  }

  function setTimerStatus(text, variant) {
    els.timerStatus.textContent = text;
    els.timerStatus.style.borderColor = variant || '';
  }

  function applyPomodoroSetting(minutes, alsoReset = false) {
    const m = Math.min(120, Math.max(1, Number(minutes) || 25));
    timer.totalMs = m * 60 * 1000;
    if (alsoReset) timer.remainingMs = timer.totalMs;

    els.pomodoroMinutes.value = String(m);
    localStorage.setItem(STORAGE_KEYS.pomodoroMinutes, String(m));

    els.timerDisplay.textContent = formatMmSs(timer.remainingMs);
  }

  function startTimer() {
    if (timer.running) return;
    timer.running = true;
    setTimerStatus('Running', 'rgba(57, 217, 138, 0.7)');

    const startAt = Date.now();
    const startRemaining = timer.remainingMs;

    clearTimerInterval();
    timer.intervalId = setInterval(() => {
      const elapsed = Date.now() - startAt;
      timer.remainingMs = startRemaining - elapsed;
      if (timer.remainingMs <= 0) {
        timer.remainingMs = 0;
        els.timerDisplay.textContent = formatMmSs(timer.remainingMs);
        stopTimer(true);
        return;
      }
      els.timerDisplay.textContent = formatMmSs(timer.remainingMs);
    }, 250);
  }

  function stopTimer(completed = false) {
    timer.running = false;
    clearTimerInterval();

    if (completed) {
      setTimerStatus('Completed', 'rgba(77, 211, 255, 0.8)');
      // Keep remaining at 0; allow user to reset or adjust.
    } else {
      setTimerStatus('Stopped', 'rgba(255, 255, 255, 0.25)');
    }
  }

  function resetTimer() {
    stopTimer(false);
    timer.remainingMs = timer.totalMs;
    els.timerDisplay.textContent = formatMmSs(timer.remainingMs);
    setTimerStatus('Ready', '');
  }

  function getTasks() {
    const tasks = readJSON(STORAGE_KEYS.tasks, []);
    if (!Array.isArray(tasks)) return [];
    return tasks;
  }

  function saveTasks(tasks) {
    writeJSON(STORAGE_KEYS.tasks, tasks);
  }

  function uid() {
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'todo__item';
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo__checkbox';
    checkbox.checked = !!task.done;

    const titleWrap = document.createElement('div');
    titleWrap.className = 'todo__title';
    if (task.done) titleWrap.classList.add('todo__title--done');

    const titleText = document.createElement('div');
    titleText.textContent = task.title;

    titleWrap.appendChild(titleText);

    const actions = document.createElement('div');
    actions.className = 'todo__actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'iconBtn';
    editBtn.textContent = 'Edit';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'iconBtn iconBtn--danger';
    deleteBtn.textContent = 'Delete';

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    const row = document.createElement('div');
    row.style.display = 'contents';

    li.appendChild(checkbox);
    li.appendChild(titleWrap);
    li.appendChild(actions);

    checkbox.addEventListener('change', () => {
      const tasks = getTasks();
      const idx = tasks.findIndex((t) => t.id === task.id);
      if (idx === -1) return;
      tasks[idx].done = !!checkbox.checked;
      tasks[idx].updatedAt = Date.now();
      saveTasks(tasks);
      renderTasks();
    });

    editBtn.addEventListener('click', () => {
      const tasks = getTasks();
      const idx = tasks.findIndex((t) => t.id === task.id);
      if (idx === -1) return;

      const current = tasks[idx].title;
      titleWrap.innerHTML = '';

      const editRow = document.createElement('div');
      editRow.className = 'todo__edit';

      const input = document.createElement('input');
      input.type = 'text';
      input.value = current;
      input.maxLength = 120;

      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'btn';
      saveBtn.textContent = 'Save';

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn btn--secondary';
      cancelBtn.textContent = 'Cancel';

      editRow.appendChild(input);

      const btns = document.createElement('div');
      btns.style.display = 'flex';
      btns.style.gap = '8px';
      btns.style.alignItems = 'center';
      btns.appendChild(saveBtn);
      btns.appendChild(cancelBtn);

      editRow.appendChild(btns);

      titleWrap.appendChild(editRow);
      input.focus();

      saveBtn.addEventListener('click', () => {
        const nextTitle = input.value.trim().slice(0, 120);
        if (!nextTitle) {
          input.focus();
          return;
        }
        tasks[idx].title = nextTitle;
        tasks[idx].updatedAt = Date.now();
        saveTasks(tasks);
        renderTasks();
      });

      cancelBtn.addEventListener('click', () => renderTasks());

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveBtn.click();
        if (e.key === 'Escape') cancelBtn.click();
      });
    });

    deleteBtn.addEventListener('click', () => {
      const tasks = getTasks();
      const next = tasks.filter((t) => t.id !== task.id);
      saveTasks(next);
      renderTasks();
    });

    return li;
  }

  function sortTasks(tasks) {
    const mode = els.sortSelect.value;
    const copy = [...tasks];

    const by = (key, asc = true) =>
      copy.sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (asc ? 1 : -1);
      });

    if (mode === 'created_desc') {
      by('createdAt', false);
    } else if (mode === 'created_asc') {
      by('createdAt', true);
    } else if (mode === 'title_asc') {
      copy.sort((a, b) => a.title.localeCompare(b.title));
    } else if (mode === 'title_desc') {
      copy.sort((a, b) => b.title.localeCompare(a.title));
    } else if (mode === 'status_asc') {
      // undone first
      copy.sort((a, b) => Number(a.done) - Number(b.done));
    } else if (mode === 'status_desc') {
      // done first
      copy.sort((a, b) => Number(b.done) - Number(a.done));
      copy.reverse();
    }

    return copy;
  }

  function renderTasks() {
    const tasks = getTasks();
    const sorted = sortTasks(tasks);

    els.todoList.innerHTML = '';

    if (tasks.length === 0) {
      els.todoEmpty.style.display = 'block';
    } else {
      els.todoEmpty.style.display = 'none';
    }

    const count = tasks.length;
    els.todoCount.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;

    if (sorted.length === 0) return;

    const frag = document.createDocumentFragment();
    for (const t of sorted) {
      frag.appendChild(createTaskElement(t));
    }
    els.todoList.appendChild(frag);
  }

  function addTask(title) {
    const tasks = getTasks();
    const next = {
      id: uid(),
      title: title.trim().slice(0, 120),
      done: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    tasks.unshift(next);
    saveTasks(tasks);
  }

  function clearDoneTasks() {
    const tasks = getTasks();
    const next = tasks.filter((t) => !t.done);
    saveTasks(next);
    renderTasks();
  }

  function getLinks() {
    const links = readJSON(STORAGE_KEYS.links, []);
    return Array.isArray(links) ? links : [];
  }

  function saveLinks(links) {
    writeJSON(STORAGE_KEYS.links, links);
  }

  function normalizeUrl(url) {
    const u = url.trim();
    if (!u) return '';
    // If user forgot scheme, add https://
    if (!/^https?:\/\//i.test(u)) return `https://${u}`;
    return u;
  }

  function renderLinks() {
    const links = getLinks();
    els.linksList.innerHTML = '';

    if (links.length === 0) {
      els.linksEmpty.style.display = 'block';
      return;
    }
    els.linksEmpty.style.display = 'none';

    const frag = document.createDocumentFragment();
    for (const l of links) {
      const item = document.createElement('div');
      item.className = 'linkItem';

      const left = document.createElement('div');
      left.className = 'linkItem__left';

      const title = document.createElement('div');
      title.className = 'linkItem__title';
      title.textContent = l.title;

      const url = document.createElement('div');
      url.className = 'linkItem__url';
      url.textContent = l.url;

      left.appendChild(title);
      left.appendChild(url);

      const openBtn = document.createElement('a');
      openBtn.className = 'btn';
      openBtn.href = l.url;
      openBtn.target = '_blank';
      openBtn.rel = 'noreferrer';
      openBtn.textContent = 'Open';

      item.appendChild(left);
      item.appendChild(openBtn);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'iconBtn iconBtn--danger';
      del.textContent = 'Delete';

      const rightWrap = document.createElement('div');
      rightWrap.style.display = 'flex';
      rightWrap.style.gap = '8px';
      rightWrap.style.alignItems = 'center';
      rightWrap.appendChild(openBtn);
      rightWrap.style.marginLeft = '8px';
      rightWrap.appendChild(del);

      item.innerHTML = '';
      item.appendChild(left);
      item.appendChild(rightWrap);

      del.addEventListener('click', () => {
        const next = getLinks().filter((x) => x.id !== l.id);
        saveLinks(next);
        renderLinks();
      });

      frag.appendChild(item);
    }

    els.linksList.appendChild(frag);
  }

  function addLink(title, url) {
    const links = getLinks();
    const normalized = normalizeUrl(url);

    // Basic validation via URL constructor.
    try {
      new URL(normalized);
    } catch {
      return false;
    }

    links.unshift({
      id: uid(),
      title: title.trim().slice(0, 60),
      url: normalized,
      createdAt: Date.now(),
    });

    saveLinks(links);
    return true;
  }

  function clearAllLinks() {
    saveLinks([]);
    renderLinks();
  }

  function bindEvents() {
    els.themeToggle.addEventListener('click', toggleTheme);

    // save name with debounce
    let nameTimer = null;
    els.nameInput.addEventListener('input', () => {
      clearTimeout(nameTimer);
      nameTimer = setTimeout(saveName, 250);
    });

    els.timerStart.addEventListener('click', () => startTimer());
    els.timerStop.addEventListener('click', () => stopTimer(false));
    els.timerReset.addEventListener('click', () => resetTimer());

    els.applyPomodoro.addEventListener('click', () => {
      applyPomodoroSetting(els.pomodoroMinutes.value, true);
      // Keep status consistent.
      if (!timer.running) setTimerStatus('Ready', '');
    });

    els.todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = els.todoInput.value.trim();
      if (!title) return;
      addTask(title);
      els.todoInput.value = '';
      renderTasks();
    });

    els.sortSelect.addEventListener('change', () => renderTasks());
    els.clearDone.addEventListener('click', clearDoneTasks);

    els.linksForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = els.linkTitle.value.trim();
      const url = els.linkUrl.value.trim();
      if (!title || !url) return;

      const ok = addLink(title, url);
      if (!ok) {
        alert('Please enter a valid URL. Example: https://google.com');
        return;
      }

      els.linkTitle.value = '';
      els.linkUrl.value = '';
      renderLinks();
    });

    els.clearLinks.addEventListener('click', clearAllLinks);
  }

  function init() {
    loadTheme();

    const storedMinutes = Number(localStorage.getItem(STORAGE_KEYS.pomodoroMinutes)) || 25;
    applyPomodoroSetting(storedMinutes, true);
    resetTimer();

    loadName();
    updateClockUI();
    setInterval(updateClockUI, 1000 * 15);

    renderTasks();
    renderLinks();

    bindEvents();

    // Improve first paint
    els.timerDisplay.textContent = formatMmSs(timer.remainingMs);
    setTimerStatus('Ready', '');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

