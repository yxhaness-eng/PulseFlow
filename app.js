/**
 * PulseFlow — Progressive Web App Engine
 * Architecture: Vanilla ES6+, State Management, Service Worker, Web Audio API, Canvas Engine
 * Standards: WCAG 2.1 AA Compliant, Screen Wake Lock API, Badging API, Web Install API
 */

(() => {
  'use strict';

  /* ==========================================================================
     1. SECURITY & RESILIENCE UTILITIES
     ========================================================================== */

  // HTML Entity Encoding to prevent Cross-Site Scripting (XSS)
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Deep merge utility with fallback defaults for backward-compatible state schema
  function deepMergeWithDefaults(defaultObj, sourceObj) {
    if (!sourceObj || typeof sourceObj !== 'object') return defaultObj;
    const result = Array.isArray(defaultObj) ? [...defaultObj] : Object.assign({}, defaultObj);

    for (const key of Object.keys(sourceObj)) {
      const srcVal = sourceObj[key];
      const defVal = defaultObj ? defaultObj[key] : undefined;

      if (srcVal !== null && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
        result[key] = deepMergeWithDefaults(defVal && typeof defVal === 'object' ? defVal : {}, srcVal);
      } else if (srcVal !== undefined) {
        result[key] = srcVal;
      }
    }
    return result;
  }

  /* ==========================================================================
     2. CONTENT REPOSITORY & INITIAL CATALOG
     ========================================================================== */

  const INITIAL_MEDIA_CATALOG = [
    // --- Фильмы ---
    {
      id: 'm1',
      title: 'Интерстеллар',
      origTitle: 'Interstellar (2014)',
      category: 'movies',
      rating: 8.7,
      genres: ['Фантастика', 'Драма', 'Приключения'],
      mood: ['Глубокий смысл'],
      desc: 'Исследователи отправляются сквозь червоточину в поисках нового дома для человечества. Фильм о гравитации, времени и человеческой связи.',
      icon: '🌌'
    },
    {
      id: 'm2',
      title: 'Начало',
      origTitle: 'Inception (2010)',
      category: 'movies',
      rating: 8.8,
      genres: ['Фантастика', 'Боевик', 'Триллер'],
      mood: ['Динамичный сюжет', 'Глубокий смысл'],
      desc: 'Профессиональный похититель секретов проникает в подсознание через сны, чтобы внедрить новую идею.',
      icon: '🌀'
    },
    {
      id: 'm3',
      title: 'Бегущий по лезвию 2049',
      origTitle: 'Blade Runner 2049 (2017)',
      category: 'movies',
      rating: 8.0,
      genres: ['Фантастика', 'Киберпанк', 'Детектив'],
      mood: ['Глубокий смысл'],
      desc: 'Офицер полиции раскрывает погребенную тайну, способную повергнуть общество в хаос.',
      icon: '🤖'
    },
    {
      id: 'm4',
      title: 'Джентльмены',
      origTitle: 'The Gentlemen (2020)',
      category: 'movies',
      rating: 8.5,
      genres: ['Комедия', 'Криминал', 'Боевик'],
      mood: ['Динамичный сюжет'],
      desc: 'Криминальная комедия Гая Ричи о лондонской империи, аристократах и дерзких схемах.',
      icon: '🎩'
    },
    {
      id: 'm5',
      title: 'Паразиты',
      origTitle: 'Gisaengchung (2019)',
      category: 'movies',
      rating: 8.5,
      genres: ['Триллер', 'Драма', 'Комедия'],
      mood: ['Глубокий смысл'],
      desc: 'Семья из бедного района устраивается на работу в богатый дом. Социальная драма Пон Чжун Хо.',
      icon: '🏠'
    },
    {
      id: 'm6',
      title: 'Остров проклятых',
      origTitle: 'Shutter Island (2010)',
      category: 'movies',
      rating: 8.5,
      genres: ['Детектив', 'Триллер'],
      mood: ['Глубокий смысл'],
      desc: 'Маршалы США расследуют исчезновение пациентки из закрытой клиники на отдаленном острове.',
      icon: '🏝️'
    },
    {
      id: 'm7',
      title: '1+1 (Неприкасаемые)',
      origTitle: 'Intouchables (2011)',
      category: 'movies',
      rating: 8.8,
      genres: ['Драма', 'Комедия', 'Биография'],
      mood: ['Уютное'],
      desc: 'История дружбы парализованного аристократа и парня с окраин, вернувшего ему интерес к жизни.',
      icon: '🤝'
    },
    {
      id: 'm8',
      title: 'Достать ножи',
      origTitle: 'Knives Out (2019)',
      category: 'movies',
      rating: 8.0,
      genres: ['Детектив', 'Комедия'],
      mood: ['Динамичный сюжет', 'Уютное'],
      desc: 'Частный сыщик расследует гибель известного автора в поместье эксцентричной семьи.',
      icon: '🔍'
    },
    // --- Сериалы ---
    {
      id: 's1',
      title: 'Разделение',
      origTitle: 'Severance (2022–)',
      category: 'series',
      rating: 8.7,
      genres: ['Фантастика', 'Триллер', 'Детектив'],
      mood: ['Глубокий смысл'],
      desc: 'Сотрудники корпорации соглашаются на операцию, разделяющую рабочие и личные воспоминания.',
      icon: '🏢'
    },
    {
      id: 's2',
      title: 'Черное зеркало',
      origTitle: 'Black Mirror (2011–)',
      category: 'series',
      rating: 8.8,
      genres: ['Фантастика', 'Триллер', 'Драма'],
      mood: ['Глубокий смысл'],
      desc: 'Антология о влиянии высоких технологий и алгоритмов на человеческую природу.',
      icon: '📱'
    },
    {
      id: 's3',
      title: 'Тед Лассо',
      origTitle: 'Ted Lasso (2020–2023)',
      category: 'series',
      rating: 8.8,
      genres: ['Комедия', 'Спорт', 'Драма'],
      mood: ['Уютное'],
      desc: 'Американский тренер по футболу возглавляет британский клуб Премьер-лиги с обезоруживающим оптимизмом.',
      icon: '⚽'
    },
    // --- Мультфильмы & Аниме ---
    {
      id: 'c1',
      title: 'Тайна Коко',
      origTitle: 'Coco (2017)',
      category: 'cartoons',
      rating: 8.4,
      genres: ['Мультфильм', 'Приключения', 'Семейный'],
      mood: ['Уютное', 'Глубокий смысл'],
      desc: 'Юный музыкант Мигель попадает в Мир Мертвых, чтобы разгадать семейную тайну.',
      icon: '🎸'
    },
    {
      id: 'c2',
      title: 'Человек-паук: Через вселенные',
      origTitle: 'Spider-Man: Into the Spider-Verse (2018)',
      category: 'cartoons',
      rating: 8.4,
      genres: ['Мультфильм', 'Фантастика', 'Боевик'],
      mood: ['Динамичный сюжет'],
      desc: 'Майлз Моралес открывает безграничные возможности параллельных миров.',
      icon: '🕷️'
    },
    {
      id: 'a1',
      title: 'Аркейн',
      origTitle: 'Arcane (2021–2024)',
      category: 'anime',
      rating: 9.0,
      genres: ['Аниме', 'Фантастика', 'Драма', 'Боевик'],
      mood: ['Динамичный сюжет', 'Глубокий смысл'],
      desc: 'Две сестры оказываются по разные стороны конфликта между утопическим Пилтовером и подземным Зауном.',
      icon: '⚡'
    },
    {
      id: 'a2',
      title: 'Атака титанов',
      origTitle: 'Shingeki no Kyojin (2013–2023)',
      category: 'anime',
      rating: 9.0,
      genres: ['Аниме', 'Боевик', 'Драма', 'Фэнтези'],
      mood: ['Динамичный сюжет'],
      desc: 'Остатки человечества ведут борьбу за выживание за гигантскими стенами против титанов.',
      icon: '⚔️'
    }
  ];

  const INITIAL_WORKOUT_TEMPLATES = [
    {
      id: 'tpl-1',
      title: 'Фулбоди: Базовый',
      desc: 'Комплексная силовая нагрузка на все основные мышечные группы',
      exercises: [
        { name: 'Приседания со штангой', sets: [{ weight: 60, reps: 10 }, { weight: 70, reps: 8 }, { weight: 70, reps: 8 }] },
        { name: 'Жим лёжа на скамье', sets: [{ weight: 60, reps: 10 }, { weight: 65, reps: 8 }, { weight: 65, reps: 8 }] },
        { name: 'Тяга штанги в наклоне', sets: [{ weight: 50, reps: 10 }, { weight: 55, reps: 10 }, { weight: 55, reps: 10 }] },
        { name: 'Армейский жим стоя', sets: [{ weight: 35, reps: 10 }, { weight: 40, reps: 8 }] }
      ]
    },
    {
      id: 'tpl-2',
      title: 'Верх тела: Жим и тяга',
      desc: 'Акцент на грудь, широчайшие спины, дельты и руки',
      exercises: [
        { name: 'Жим гантелей на наклонной скамье', sets: [{ weight: 22, reps: 10 }, { weight: 24, reps: 8 }, { weight: 24, reps: 8 }] },
        { name: 'Подтягивания широким хватом', sets: [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 7 }] },
        { name: 'Тяга горизонтального блока к поясу', sets: [{ weight: 50, reps: 12 }, { weight: 55, reps: 10 }] },
        { name: 'Махи гантелями через стороны', sets: [{ weight: 10, reps: 12 }, { weight: 10, reps: 12 }] }
      ]
    },
    {
      id: 'tpl-3',
      title: 'Низ тела & Кор',
      desc: 'Квадрицепсы, задняя поверхность бедра, икры и мышцы кора',
      exercises: [
        { name: 'Румынская тяга со штангой', sets: [{ weight: 60, reps: 10 }, { weight: 70, reps: 10 }, { weight: 75, reps: 8 }] },
        { name: 'Жим ногами в тренажере', sets: [{ weight: 120, reps: 12 }, { weight: 140, reps: 10 }] },
        { name: 'Планка на предплечьях', sets: [{ weight: 0, reps: 60 }, { weight: 0, reps: 60 }] }
      ]
    }
  ];

  /* ==========================================================================
     3. STATE & STORAGE MANAGEMENT
     ========================================================================== */

  const STORAGE_KEY = 'pulseflow_app_state_v1';

  function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function createDefaultState() {
    const today = getTodayString();
    return {
      theme: 'dark',
      activeTab: 'tab-home',
      profile: {
        height: 178,
        name: 'Пользователь'
      },
      water: {
        date: today,
        current: 1250,
        goal: 2500,
        reminderInterval: 90,
        reminderStart: '08:30',
        reminderEnd: '22:00',
        remindersEnabled: true,
        lastLogTimestamp: Date.now()
      },
      weight: {
        current: 74.8,
        target: 70.0,
        filterPeriod: '30d',
        history: [
          { date: '2026-10-15', weight: 77.2 },
          { date: '2026-10-22', weight: 76.5 },
          { date: '2026-10-29', weight: 75.9 },
          { date: '2026-11-05', weight: 75.3 },
          { date: '2026-11-10', weight: 75.0 },
          { date: today, weight: 74.8 }
        ]
      },
      measurements: [
        {
          date: today,
          chest: 104,
          waist: 82,
          hips: 98,
          biceps: 37.5,
          neck: 39
        }
      ],
      workouts: {
        templates: INITIAL_WORKOUT_TEMPLATES,
        activeWorkout: null,
        history: [
          {
            id: 'wh-1',
            date: '2026-11-12',
            title: 'Фулбоди: Базовый',
            durationMinutes: 48,
            totalVolumeKg: 3420,
            exercises: [
              { name: 'Приседания со штангой', bestSet: '70 кг × 8' },
              { name: 'Жим лёжа на скамье', bestSet: '65 кг × 8' },
              { name: 'Тяга штанги в наклоне', bestSet: '55 кг × 10' }
            ]
          }
        ]
      },
      diary: {
        selectedDate: today,
        habitsConfig: [
          { id: 'water', label: 'Водный баланс 2.5л' },
          { id: 'workout', label: 'Силовая сессия' },
          { id: 'reading', label: 'Чтение 20 минут' },
          { id: 'walk', label: '10 000 шагов' },
          { id: 'sleep', label: 'Режим сна 8ч' }
        ],
        pages: {
          [today]: {
            mood: '🔥',
            pattern: 'grid',
            accentColor: '#0284c7',
            fontFamily: 'font-sans',
            tags: ['фокус', 'тренировка'],
            habits: {
              water: true,
              workout: true,
              reading: false,
              walk: false,
              sleep: true
            },
            todos: [
              { id: 'td-1', text: 'Утренняя разминка и вода', done: true },
              { id: 'td-2', text: 'Силовая тренировка: базовый комплекс', done: true },
              { id: 'td-3', text: 'Чтение профильной литературы 20 мин', done: false }
            ],
            notes: 'Рабочий пульс ровный. На приседаниях самочувствие стабильное, в следующем цикле можно запланировать шаг прогрессии.'
          }
        }
      },
      media: {
        catalog: INITIAL_MEDIA_CATALOG,
        selectedCategory: 'all',
        activeFilterTags: [],
        watchlist: ['m1', 's1', 'a1'],
        watchedHistory: ['m4', 'm5'],
        userLikes: {
          genres: { 'Фантастика': 4, 'Киберпанк': 3, 'Детектив': 2 },
          moods: { 'Динамичный сюжет': 3, 'Глубокий смысл': 3 }
        }
      }
    };
  }

  // Загрузка состояния с защитой от повреждений и старых схем
  let state = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = deepMergeWithDefaults(createDefaultState(), parsed);
        const today = getTodayString();
        if (merged.water && merged.water.date !== today) {
          merged.water.date = today;
          merged.water.current = 0;
        }
        return merged;
      }
    } catch (e) {
      console.warn('Инициализация состояния по умолчанию:', e);
    }
    return createDefaultState();
  })();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updateAppBadge();
    } catch (e) {
      console.error('Ошибка записи состояния:', e);
    }
  }

  /* ==========================================================================
     4. HARDWARE CAPABILITIES: WAKE LOCK, BADGING, WEB INSTALL
     ========================================================================== */

  // Screen Wake Lock API — удержание экрана активным во время тренировки и таймера
  let screenWakeLock = null;

  async function requestWakeLock() {
    if ('wakeLock' in navigator && !screenWakeLock) {
      try {
        screenWakeLock = await navigator.wakeLock.request('screen');
        screenWakeLock.addEventListener('release', () => {
          screenWakeLock = null;
        });
      } catch (err) {
        // Фоновые вкладки или энергосбережение могут отклонить запрос
      }
    }
  }

  async function releaseWakeLock() {
    if (screenWakeLock) {
      try {
        await screenWakeLock.release();
      } catch (err) {}
      screenWakeLock = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.workouts.activeWorkout) {
      requestWakeLock();
    }
  });

  // Badging API — индикация оставшихся задач на иконке приложения
  function updateAppBadge() {
    if ('setAppBadge' in navigator) {
      try {
        const page = state.diary.pages[getTodayString()];
        const pendingTodos = page && page.todos ? page.todos.filter(t => !t.done).length : 0;
        if (pendingTodos > 0) {
          navigator.setAppBadge(pendingTodos).catch(() => {});
        } else {
          navigator.clearAppBadge().catch(() => {});
        }
      } catch (e) {}
    }
  }

  // PWA Web Install API / BeforeInstallPrompt
  let deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const installBtn = document.getElementById('btnInstallApp');
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const installBtn = document.getElementById('btnInstallApp');
    if (installBtn) installBtn.style.display = 'none';
    showToast('Приложение PulseFlow успешно установлено');
  });

  /* ==========================================================================
     5. WEB AUDIO SYNTHESIZER
     ========================================================================== */

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) {
        audioCtx = new AudioClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playWaterChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  function playRestTimerChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const tones = [523.25, 659.25, 783.99, 1046.5];

      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.6);
      });
    } catch (e) {}
  }

  function playTickSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 150, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  function playFanfareSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.75);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.8);
      });
    } catch (e) {}
  }

  /* ==========================================================================
     6. NOTIFICATIONS & LIVE TOASTS
     ========================================================================== */

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-6px)';
      toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      setTimeout(() => toast.remove(), 220);
    }, 2800);
  }

  // Отправка системного уведомления через ServiceWorkerRegistration (с защитой от сбоя Android Chrome)
  async function sendSystemNotification(title, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const notifOptions = Object.assign({
      icon: './icon-192.png',
      badge: './icon.svg'
    }, options);

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          return reg.showNotification(title, notifOptions);
        }
      } catch (err) {}
    }

    try {
      new Notification(title, notifOptions);
    } catch (err) {}
  }

  function requestNotificationPermission() {
    if (!('Notification' in window)) {
      showToast('Уведомления не поддерживаются в данном браузере');
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showToast('Напоминания активированы');
        sendSystemNotification('PulseFlow', {
          body: 'Интервальные напоминания о водном балансе включены'
        });
      } else {
        showToast('Доступ к уведомлениям не предоставлен');
      }
      updateNotificationUI();
    });
  }

  function updateNotificationUI() {
    const btn = document.getElementById('btnNotifyToggle');
    if (!btn) return;
    const isGranted = 'Notification' in window && Notification.permission === 'granted';
    btn.classList.toggle('active', isGranted);
    btn.setAttribute('aria-pressed', isGranted ? 'true' : 'false');
    btn.title = isGranted ? 'Напоминания активны' : 'Включить напоминания';
  }

  function triggerWaterReminder() {
    playWaterChime();
    showToast('Время восполнить водный баланс');

    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    sendSystemNotification('Водный баланс', {
      body: 'Пора сделать перерыв и выпить порцию воды'
    });

    state.water.lastLogTimestamp = Date.now();
    saveState();
  }

  /* ==========================================================================
     7. MODULE 1: WATER TRACKER & WEIGHT
     ========================================================================== */

  function renderWaterTracker() {
    const { current, goal } = state.water;
    const safeGoal = Math.max(1, goal);
    const percent = Math.min(Math.round((current / safeGoal) * 100), 100);

    const valEl = document.getElementById('waterCurrentVal');
    const goalEl = document.getElementById('waterGoalVal');
    const pctEl = document.getElementById('waterPercentVal');
    const circle = document.getElementById('waterCircleProgress');

    if (valEl) valEl.textContent = `${current} мл`;
    if (goalEl) goalEl.textContent = `из ${goal} мл`;
    if (pctEl) pctEl.textContent = `${percent}% выполнено`;

    if (circle) {
      const circumference = 2 * Math.PI * 90;
      const offset = circumference - (percent / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }

    const timerText = document.getElementById('waterReminderStatus');
    if (timerText) {
      if (!state.water.remindersEnabled) {
        timerText.textContent = 'Напоминания отключены';
      } else {
        const intervalMs = state.water.reminderInterval * 60 * 1000;
        const elapsed = Date.now() - (state.water.lastLogTimestamp || Date.now());
        const remainingMin = Math.max(0, Math.ceil((intervalMs - elapsed) / 60000));
        timerText.innerHTML = `Следующий приём через: <strong>${remainingMin} мин</strong>`;
      }
    }
  }

  function addWater(amount) {
    state.water.current = Math.max(0, state.water.current + amount);
    state.water.lastLogTimestamp = Date.now();
    saveState();
    renderWaterTracker();

    if (amount > 0) {
      playWaterChime();
      showToast(`${amount > 0 ? '+' : ''}${amount} мл воды учтено`);
      if (state.water.current >= state.water.goal && state.water.current - amount < state.water.goal) {
        showToast('Суточная норма воды выполнена');
        playFanfareSound();
      }
    }
  }

  function calculateWeightMetrics() {
    const current = Number(state.weight.current) || 75;
    const target = Number(state.weight.target) || 70;
    const heightM = (Number(state.profile.height) || 178) / 100;

    const bmi = (current / (heightM * heightM)).toFixed(1);
    let bmiCategory = 'Норма';
    let bmiBadgeClass = 'badge-success';

    if (bmi < 18.5) {
      bmiCategory = 'Дефицит веса';
      bmiBadgeClass = 'badge-primary';
    } else if (bmi >= 25 && bmi < 30) {
      bmiCategory = 'Избыток веса';
      bmiBadgeClass = 'badge-warning';
    } else if (bmi >= 30) {
      bmiCategory = 'Ожирение';
      bmiBadgeClass = 'badge-danger';
    }

    const diff = (current - target).toFixed(1);
    let diffText = '';
    if (diff > 0) {
      diffText = `Осталось снизить: ${diff} кг`;
    } else if (diff < 0) {
      diffText = `Осталось набрать: ${Math.abs(diff)} кг`;
    } else {
      diffText = 'Целевой вес достигнут';
    }

    return { bmi, bmiCategory, bmiBadgeClass, diffText };
  }

  function renderWeightSection() {
    const metrics = calculateWeightMetrics();

    const curEl = document.getElementById('statCurrentWeight');
    const tarEl = document.getElementById('statTargetWeight');
    const bmiValEl = document.getElementById('statBmiValue');
    const bmiBadgeEl = document.getElementById('statBmiBadge');
    const diffEl = document.getElementById('weightGoalDiffText');

    if (curEl) curEl.textContent = `${state.weight.current} кг`;
    if (tarEl) tarEl.textContent = `${state.weight.target} кг`;
    if (bmiValEl) bmiValEl.textContent = metrics.bmi;
    if (bmiBadgeEl) {
      bmiBadgeEl.className = `badge ${metrics.bmiBadgeClass}`;
      bmiBadgeEl.textContent = metrics.bmiCategory;
    }
    if (diffEl) diffEl.textContent = metrics.diffText;

    renderWeightChart();
    renderMeasurements();
  }

  // Отрисовка интерактивного графика веса на Canvas
  let chartRafId = null;

  function renderWeightChart() {
    if (chartRafId) cancelAnimationFrame(chartRafId);
    chartRafId = requestAnimationFrame(() => {
      const canvas = document.getElementById('weightChart');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) return;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      let data = [...state.weight.history].sort((a, b) => new Date(a.date) - new Date(b.date));
      const now = new Date();

      if (state.weight.filterPeriod === '7d') {
        const cut = new Date(now.getTime() - 7 * 86400000);
        data = data.filter(d => new Date(d.date) >= cut);
      } else if (state.weight.filterPeriod === '30d') {
        const cut = new Date(now.getTime() - 30 * 86400000);
        data = data.filter(d => new Date(d.date) >= cut);
      }

      if (data.length === 0) {
        data = [{ date: getTodayString(), weight: state.weight.current }];
      }

      const weights = data.map(d => Number(d.weight) || 70);
      const minW = Math.floor(Math.min(...weights) - 1.0);
      const maxW = Math.ceil(Math.max(...weights) + 1.0);

      // Обновление доступного aria-label для экранных дикторов
      canvas.setAttribute('aria-label', `Динамика веса: за период от ${minW} кг до ${maxW} кг, последнее значение ${weights[weights.length - 1]} кг`);

      const padding = { top: 16, right: 20, bottom: 24, left: 32 };
      const chartW = w - padding.left - padding.right;
      const chartH = h - padding.top - padding.bottom;

      ctx.clearRect(0, 0, w, h);

      // Сетка и деления
      const isLight = document.body.classList.contains('light-theme');
      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(240, 246, 252, 0.06)';
      ctx.fillStyle = isLight ? '#64748b' : '#8b949e';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'right';

      const gridLines = 4;
      for (let i = 0; i <= gridLines; i++) {
        const yVal = minW + ((maxW - minW) * (gridLines - i)) / gridLines;
        const y = padding.top + (chartH * i) / gridLines;

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        ctx.fillText(`${yVal.toFixed(0)}`, padding.left - 6, y + 3);
      }

      const points = data.map((d, i) => {
        const x = padding.left + (chartW * (data.length === 1 ? 0.5 : i / (data.length - 1)));
        const y = padding.top + chartH - ((Number(d.weight) - minW) / (maxW - minW)) * chartH;
        return { x, y, date: d.date, weight: d.weight };
      });

      canvas._chartPoints = points;

      // Полупрозрачный градиент под линией
      if (points.length > 1) {
        const grad = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
        grad.addColorStop(0, isLight ? 'rgba(2, 132, 199, 0.18)' : 'rgba(14, 165, 233, 0.22)');
        grad.addColorStop(1, 'rgba(14, 165, 233, 0.0)');

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
        ctx.lineTo(points[0].x, h - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Линия данных
      ctx.beginPath();
      ctx.strokeStyle = isLight ? '#0284c7' : '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Узловые точки
      points.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#ffffff' : '#0d0f12';
        ctx.fill();
        ctx.strokeStyle = isLight ? '#0284c7' : '#0ea5e9';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Подписи дат
      ctx.fillStyle = isLight ? '#64748b' : '#8b949e';
      ctx.textAlign = 'center';
      if (points.length > 0) {
        ctx.fillText(points[0].date.slice(5), points[0].x, h - 8);
        if (points.length > 1) {
          ctx.fillText(points[points.length - 1].date.slice(5), points[points.length - 1].x, h - 8);
        }
      }
    });
  }

  function setupChartInteractivity() {
    const canvas = document.getElementById('weightChart');
    const tooltip = document.getElementById('chartTooltip');
    if (!canvas || !tooltip) return;

    function handleMove(e) {
      if (!canvas._chartPoints || canvas._chartPoints.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      let closest = null;
      let minDistance = 25;

      canvas._chartPoints.forEach((pt) => {
        const dist = Math.hypot(pt.x - mouseX, pt.y - mouseY);
        if (dist < minDistance) {
          minDistance = dist;
          closest = pt;
        }
      });

      if (closest) {
        tooltip.style.left = `${closest.x}px`;
        tooltip.style.top = `${closest.y}px`;
        tooltip.innerHTML = `<strong>${escapeHtml(closest.weight)} кг</strong> (${escapeHtml(closest.date)})`;
        tooltip.style.opacity = '1';
      } else {
        tooltip.style.opacity = '0';
      }
    }

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
    canvas.addEventListener('touchmove', handleMove, { passive: true });
    canvas.addEventListener('touchend', () => { tooltip.style.opacity = '0'; });
  }

  function renderMeasurements() {
    const container = document.getElementById('measurementsContainer');
    if (!container) return;

    const latest = state.measurements[state.measurements.length - 1] || {};
    const items = [
      { key: 'chest', name: 'Грудь' },
      { key: 'waist', name: 'Талия' },
      { key: 'hips', name: 'Бёдра' },
      { key: 'biceps', name: 'Бицепс' },
      { key: 'neck', name: 'Шея' }
    ];

    container.innerHTML = items.map(it => `
      <div class="measure-chip">
        <span class="name">${escapeHtml(it.name)}</span>
        <span class="val">${latest[it.key] ? escapeHtml(latest[it.key]) + ' см' : '—'}</span>
      </div>
    `).join('');
  }

  /* ==========================================================================
     8. MODULE 2: WORKOUT LOG & REST TIMER
     ========================================================================== */

  let restTimerInterval = null;
  let restTimerSecondsLeft = 0;

  function startRestTimer(seconds = 90) {
    stopRestTimer();
    restTimerSecondsLeft = seconds;

    const box = document.getElementById('restTimerBox');
    if (box) box.style.display = 'block';

    requestWakeLock();
    updateRestTimerDisplay();

    restTimerInterval = setInterval(() => {
      restTimerSecondsLeft--;
      updateRestTimerDisplay();

      if (restTimerSecondsLeft <= 0) {
        stopRestTimer();
        playRestTimerChime();
        showToast('Отдых завершен: время начинать подход');
        sendSystemNotification('Таймер отдыха', {
          body: 'Интервал отдыха завершен'
        });
        if (!state.workouts.activeWorkout) {
          releaseWakeLock();
        }
      }
    }, 1000);
  }

  function stopRestTimer() {
    if (restTimerInterval) {
      clearInterval(restTimerInterval);
      restTimerInterval = null;
    }
    const box = document.getElementById('restTimerBox');
    if (box) box.style.display = 'none';
    if (!state.workouts.activeWorkout) {
      releaseWakeLock();
    }
  }

  function updateRestTimerDisplay() {
    const disp = document.getElementById('restTimerDisplay');
    if (!disp) return;
    const mins = Math.floor(restTimerSecondsLeft / 60);
    const secs = restTimerSecondsLeft % 60;
    disp.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function getExerciseLastRecord(exerciseName) {
    if (!state.workouts.history || state.workouts.history.length === 0) return null;
    for (let i = state.workouts.history.length - 1; i >= 0; i--) {
      const sess = state.workouts.history[i];
      if (sess.exercises) {
        const found = sess.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
        if (found && found.bestSet) return found.bestSet;
      }
    }
    return null;
  }

  function startWorkoutFromTemplate(templateId) {
    const tpl = state.workouts.templates.find(t => t.id === templateId);
    if (!tpl) return;

    state.workouts.activeWorkout = {
      id: 'active-' + Date.now(),
      title: tpl.title,
      startTime: Date.now(),
      exercises: JSON.parse(JSON.stringify(tpl.exercises)).map(ex => ({
        name: ex.name,
        sets: ex.sets.map(s => ({ weight: s.weight, reps: s.reps, completed: false }))
      }))
    };

    requestWakeLock();
    saveState();
    renderWorkoutsTab();
    showToast(`Сессия «${tpl.title}» начата`);
  }

  function renderWorkoutsTab() {
    const templatesContainer = document.getElementById('workoutTemplatesSlider');
    const activeSection = document.getElementById('activeWorkoutSection');
    const historySection = document.getElementById('workoutHistoryList');

    if (templatesContainer) {
      templatesContainer.innerHTML = state.workouts.templates.map(tpl => `
        <div class="template-card" data-template-id="${escapeHtml(tpl.id)}">
          <div>
            <div class="template-title">${escapeHtml(tpl.title)}</div>
            <div class="template-desc">${escapeHtml(tpl.desc)}</div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="window.PulseFlow.startWorkout('${escapeHtml(tpl.id)}')">Начать</button>
        </div>
      `).join('');
    }

    if (activeSection) {
      const active = state.workouts.activeWorkout;
      if (!active) {
        activeSection.innerHTML = `
          <div style="text-align:center; padding: 24px 10px; color: var(--text-muted);">
            <p style="font-weight:500;">Нет активной тренировочной сессии</p>
            <p style="font-size:0.8rem; margin-top:4px;">Выберите шаблон программы или начните свободную запись.</p>
            <button class="btn btn-secondary btn-sm" style="margin-top:12px;" onclick="window.PulseFlow.startEmptyWorkout()">+ Новая сессия</button>
          </div>
        `;
      } else {
        activeSection.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div>
              <h3 style="font-size:1.1rem; font-weight:600;">${escapeHtml(active.title)}</h3>
              <span class="badge badge-primary">Активная сессия</span>
            </div>
            <button class="btn btn-sm btn-primary" onclick="window.PulseFlow.finishWorkout()">Завершить</button>
          </div>

          <div id="activeExercisesList">
            ${active.exercises.map((ex, exIdx) => {
              const lastRec = getExerciseLastRecord(ex.name);
              return `
                <div class="exercise-block" data-ex-idx="${exIdx}">
                  <div class="exercise-header">
                    <span class="exercise-name">${escapeHtml(ex.name)}</span>
                    ${lastRec ? `<span class="exercise-prev-record">Прошлый результат: ${escapeHtml(lastRec)}</span>` : ''}
                  </div>

                  <table class="sets-table">
                    <thead>
                      <tr>
                        <th scope="col">Сет</th>
                        <th scope="col">Вес (кг)</th>
                        <th scope="col">Повторы</th>
                        <th scope="col">Готово</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${ex.sets.map((set, sIdx) => `
                        <tr>
                          <td style="font-weight:600; color:var(--text-secondary);">${sIdx + 1}</td>
                          <td>
                            <input type="number" class="set-input" value="${set.weight}" 
                              aria-label="Подход ${sIdx + 1}, вес в кг"
                              onchange="window.PulseFlow.updateSet(${exIdx}, ${sIdx}, 'weight', this.value)" step="0.5">
                          </td>
                          <td>
                            <input type="number" class="set-input" value="${set.reps}" 
                              aria-label="Подход ${sIdx + 1}, повторения"
                              onchange="window.PulseFlow.updateSet(${exIdx}, ${sIdx}, 'reps', this.value)">
                          </td>
                          <td>
                            <button class="set-check-btn ${set.completed ? 'completed' : ''}" 
                              role="checkbox" aria-checked="${set.completed}"
                              aria-label="Отметить подход ${sIdx + 1} завершенным"
                              onclick="window.PulseFlow.toggleSetComplete(${exIdx}, ${sIdx})">
                              ${set.completed ? '✓' : ''}
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>

                  <button class="btn btn-sm btn-secondary" onclick="window.PulseFlow.addSet(${exIdx})">+ Подход</button>
                </div>
              `;
            }).join('')}
          </div>

          <button class="btn btn-secondary btn-block" style="margin-top:10px;" onclick="window.PulseFlow.promptAddExercise()">+ Добавить движение</button>
        `;
      }
    }

    if (historySection) {
      if (state.workouts.history.length === 0) {
        historySection.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">Журнал пока пуст.</p>';
      } else {
        historySection.innerHTML = state.workouts.history.slice().reverse().map(h => `
          <div class="history-item">
            <div>
              <div style="font-weight:600; font-size:0.95rem;">${escapeHtml(h.title)}</div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                ${escapeHtml(h.date)} • ${escapeHtml(h.durationMinutes || 45)} мин • Тоннаж: <strong>${escapeHtml(h.totalVolumeKg || 0)} кг</strong>
              </div>
            </div>
            <span class="badge badge-success">Завершено</span>
          </div>
        `).join('');
      }
    }
  }

  function finishWorkout() {
    const active = state.workouts.activeWorkout;
    if (!active) return;

    let totalVolume = 0;
    const summaryExercises = [];

    active.exercises.forEach(ex => {
      let maxSetWeight = 0;
      let maxSetReps = 0;

      ex.sets.forEach(s => {
        if (s.completed) {
          totalVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          if (Number(s.weight) > maxSetWeight) {
            maxSetWeight = Number(s.weight);
            maxSetReps = Number(s.reps);
          }
        }
      });

      if (maxSetWeight > 0) {
        summaryExercises.push({
          name: ex.name,
          bestSet: `${maxSetWeight} кг × ${maxSetReps}`
        });
      }
    });

    const durationMin = Math.max(1, Math.round((Date.now() - active.startTime) / 60000));

    state.workouts.history.push({
      id: 'wh-' + Date.now(),
      date: getTodayString(),
      title: active.title,
      durationMinutes: durationMin,
      totalVolumeKg: totalVolume,
      exercises: summaryExercises
    });

    state.workouts.activeWorkout = null;
    releaseWakeLock();
    saveState();
    renderWorkoutsTab();
    showToast(`Сессия сохранена • Тоннаж: ${totalVolume} кг`);
  }

  /* ==========================================================================
     9. MODULE 3: DIARY & HABITS
     ========================================================================== */

  function getSelectedDatePage() {
    const date = state.diary.selectedDate || getTodayString();
    if (!state.diary.pages[date]) {
      state.diary.pages[date] = {
        mood: '😊',
        pattern: 'grid',
        accentColor: '#0284c7',
        fontFamily: 'font-sans',
        tags: ['фокус'],
        habits: {},
        todos: [],
        notes: ''
      };
    }
    return state.diary.pages[date];
  }

  function renderDiaryTab() {
    const page = getSelectedDatePage();
    const sheet = document.getElementById('diarySheet');
    const dateDisplay = document.getElementById('diaryDateDisplay');

    if (dateDisplay) {
      const d = new Date(state.diary.selectedDate + 'T00:00:00');
      const options = { weekday: 'short', day: 'numeric', month: 'long' };
      dateDisplay.textContent = d.toLocaleDateString('ru-RU', options);
    }

    if (sheet) {
      sheet.className = `diary-sheet page-pattern-${page.pattern || 'grid'} ${page.fontFamily || 'font-sans'}`;
      sheet.style.borderColor = page.accentColor || 'var(--border-color)';
    }

    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mood === page.mood);
      btn.setAttribute('aria-pressed', btn.dataset.mood === page.mood ? 'true' : 'false');
    });

    const habitsList = document.getElementById('diaryHabitsList');
    if (habitsList) {
      habitsList.innerHTML = state.diary.habitsConfig.map(h => {
        const isDone = !!page.habits[h.id];
        return `
          <button type="button" class="habit-chip ${isDone ? 'done' : ''}" 
            role="switch" aria-checked="${isDone}" aria-label="Привычка: ${escapeHtml(h.label)}"
            onclick="window.PulseFlow.toggleHabit('${escapeHtml(h.id)}')">
            <span>${isDone ? '✓' : '○'}</span>
            <span>${escapeHtml(h.label)}</span>
          </button>
        `;
      }).join('');
    }

    renderDiaryTodos();

    const notesArea = document.getElementById('diaryNotesTextarea');
    if (notesArea) {
      notesArea.value = page.notes || '';
      notesArea.style.fontFamily = 'inherit';
    }
  }

  function renderDiaryTodos() {
    const page = getSelectedDatePage();
    const list = document.getElementById('diaryTodoList');
    const bar = document.getElementById('todoProgressFill');
    const statsText = document.getElementById('todoStatsText');

    if (!list) return;

    const total = page.todos.length;
    const completed = page.todos.filter(t => t.done).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (bar) {
      bar.style.width = `${pct}%`;
      const pbar = bar.closest('.todo-progress-bar');
      if (pbar) pbar.setAttribute('aria-valuenow', pct);
    }
    if (statsText) statsText.textContent = `${completed} из ${total} выполнено (${pct}%)`;

    list.innerHTML = page.todos.map(t => `
      <div class="todo-item" role="listitem">
        <div class="todo-left">
          <button type="button" class="todo-checkbox ${t.done ? 'checked' : ''}" 
            role="checkbox" aria-checked="${t.done}"
            aria-label="Отметка выполнения: ${escapeHtml(t.text)}"
            onclick="window.PulseFlow.toggleTodo('${escapeHtml(t.id)}')">
            ${t.done ? '✓' : ''}
          </button>
          <span class="todo-text ${t.done ? 'checked' : ''}">${escapeHtml(t.text)}</span>
        </div>
        <button class="icon-btn" style="width:28px; height:28px;" 
          aria-label="Удалить задачу: ${escapeHtml(t.text)}"
          onclick="window.PulseFlow.deleteTodo('${escapeHtml(t.id)}')">✕</button>
      </div>
    `).join('');

    updateAppBadge();
  }

  /* ==========================================================================
     10. MODULE 4: MEDIA RANDOMIZER & CATALOG
     ========================================================================== */

  function computeMediaScore(item) {
    let score = 10;
    const activeFilters = state.media.activeFilterTags;

    if (activeFilters.length > 0) {
      const matchGenre = item.genres.some(g => activeFilters.includes(g));
      const matchMood = item.mood.some(m => activeFilters.includes(m));
      if (matchGenre) score += 20;
      if (matchMood) score += 15;
    }

    const userGenres = state.media.userLikes.genres || {};
    item.genres.forEach(g => {
      if (userGenres[g]) score += userGenres[g] * 4;
    });

    const userMoods = state.media.userLikes.moods || {};
    item.mood.forEach(m => {
      if (userMoods[m]) score += userMoods[m] * 3;
    });

    if (state.media.watchedHistory.includes(item.id)) {
      score *= 0.2;
    }

    return Math.max(1, score);
  }

  function pickWeightedRandomTitle() {
    let pool = [...state.media.catalog];

    if (state.media.selectedCategory !== 'all') {
      pool = pool.filter(i => i.category === state.media.selectedCategory);
    }

    if (pool.length === 0) return null;

    const scores = pool.map(item => computeMediaScore(item));
    const totalScore = scores.reduce((a, b) => a + b, 0);

    let random = Math.random() * totalScore;
    for (let i = 0; i < pool.length; i++) {
      if (random < scores[i]) {
        return pool[i];
      }
      random -= scores[i];
    }
    return pool[pool.length - 1];
  }

  let isRolling = false;

  function triggerMediaRandomizer() {
    if (isRolling) return;
    isRolling = true;

    const card = document.getElementById('randomizerMovieCard');
    const btn = document.getElementById('btnSpinRoulette');
    if (btn) btn.disabled = true;

    playTickSound();

    let rollCount = 0;
    const maxRolls = 14;
    const intervalTime = 70;

    if (card) {
      card.classList.add('spinning');
    }

    const interval = setInterval(() => {
      rollCount++;
      playTickSound();

      const tempPick = state.media.catalog[Math.floor(Math.random() * state.media.catalog.length)];
      renderMovieCard(tempPick, false);

      if (rollCount >= maxRolls) {
        clearInterval(interval);
        const finalWinner = pickWeightedRandomTitle();
        renderMovieCard(finalWinner, true);

        if (card) {
          card.classList.remove('spinning');
        }

        playFanfareSound();
        isRolling = false;
        if (btn) btn.disabled = false;
      }
    }, intervalTime);
  }

  function renderMovieCard(item, isFinal = true) {
    const card = document.getElementById('randomizerMovieCard');
    if (!card || !item) return;

    const inWatchlist = state.media.watchlist.includes(item.id);
    const inWatched = state.media.watchedHistory.includes(item.id);

    let reasonText = '';
    if (isFinal) {
      const matched = item.genres.filter(g => (state.media.userLikes.genres[g] || 0) > 0);
      if (matched.length > 0) {
        reasonText = `Рекомендация на основе выбранных жанров: ${matched.join(', ')}`;
      } else {
        reasonText = `Высокая оценка зрителей (${item.rating})`;
      }
    }

    card.innerHTML = `
      <div class="movie-header">
        <div>
          <div class="movie-title">${escapeHtml(item.title)}</div>
          <div class="movie-orig-title">${escapeHtml(item.origTitle)}</div>
        </div>
        <div class="movie-rating-badge">★ ${escapeHtml(item.rating)}</div>
      </div>

      <div class="movie-tags-row">
        ${item.genres.map(g => `<span class="badge badge-purple">${escapeHtml(g)}</span>`).join('')}
        ${item.mood.map(m => `<span class="badge badge-primary">${escapeHtml(m)}</span>`).join('')}
      </div>

      <div class="movie-desc">${escapeHtml(item.desc)}</div>

      ${reasonText ? `<div class="movie-why-recommended">${escapeHtml(reasonText)}</div>` : ''}

      <div class="movie-card-actions">
        <button class="btn btn-sm ${inWatchlist ? 'btn-success' : 'btn-secondary'}" 
          role="switch" aria-checked="${inWatchlist}"
          onclick="window.PulseFlow.toggleWatchlist('${escapeHtml(item.id)}')">
          ${inWatchlist ? '✓ В списке' : 'Буду смотреть'}
        </button>
        <button class="btn btn-sm ${inWatched ? 'btn-primary' : 'btn-secondary'}" 
          role="switch" aria-checked="${inWatched}"
          onclick="window.PulseFlow.toggleWatched('${escapeHtml(item.id)}')">
          ${inWatched ? '★ Просмотрено' : 'Отметить как просмотренное'}
        </button>
      </div>
    `;
  }

  function renderMediaTab() {
    document.querySelectorAll('.cat-btn').forEach(btn => {
      const isActive = btn.dataset.cat === state.media.selectedCategory;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const cloud = document.getElementById('tagsFilterCloud');
    if (cloud) {
      const allTags = [
        'Фантастика', 'Киберпанк', 'Комедия', 'Детектив', 'Триллер',
        'Драма', 'Аниме', 'Приключения', 'Динамичный сюжет', 'Глубокий смысл', 'Уютное'
      ];

      cloud.innerHTML = allTags.map(tag => {
        const isActive = state.media.activeFilterTags.includes(tag);
        return `
          <button type="button" class="filter-tag-chip ${isActive ? 'active' : ''}" 
            role="switch" aria-checked="${isActive}"
            onclick="window.PulseFlow.toggleFilterTag('${escapeHtml(tag)}')">
            ${escapeHtml(tag)}
          </button>
        `;
      }).join('');
    }

    const card = document.getElementById('randomizerMovieCard');
    if (card && (!card.children || card.children.length === 0)) {
      const starter = pickWeightedRandomTitle() || state.media.catalog[0];
      renderMovieCard(starter, true);
    }

    const wlBtn = document.getElementById('btnWatchlistModal');
    if (wlBtn) {
      wlBtn.textContent = `Буду смотреть (${state.media.watchlist.length})`;
    }
  }

  /* ==========================================================================
     11. DATA BACKUP & RESTORATION
     ========================================================================== */

  function exportData() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `pulseflow_backup_${getTodayString()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Резервная копия экспортирована');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!imported || typeof imported !== 'object') {
          throw new Error('Файл не содержит корректного JSON-объекта');
        }
        state = deepMergeWithDefaults(createDefaultState(), imported);
        saveState();
        applyTheme(state.theme || 'dark');
        renderActiveTab();
        showToast('Данные успешно импортированы');
        closeAllModals();
      } catch (err) {
        showToast('Ошибка импорта: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  /* ==========================================================================
     12. NAVIGATION, ACCESSIBLE MODALS & FOCUS TRAP
     ========================================================================== */

  let previouslyFocusedElement = null;

  function applyTheme(theme) {
    state.theme = theme;
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    const themeBtn = document.getElementById('btnThemeToggle');
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
    saveState();
    renderWeightChart();
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    saveState();

    document.querySelectorAll('.tab-content').forEach(tab => {
      const isActive = tab.id === tabId;
      tab.classList.toggle('active', isActive);
      if (!isActive) {
        tab.setAttribute('hidden', '');
      } else {
        tab.removeAttribute('hidden');
      }
    });

    document.querySelectorAll('.nav-item').forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    renderActiveTab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderActiveTab() {
    switch (state.activeTab) {
      case 'tab-home':
        renderWaterTracker();
        renderWeightSection();
        break;
      case 'tab-workouts':
        renderWorkoutsTab();
        break;
      case 'tab-diary':
        renderDiaryTab();
        break;
      case 'tab-randomizer':
        renderMediaTab();
        break;
      default:
        renderWaterTracker();
        renderWeightSection();
    }
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    previouslyFocusedElement = document.activeElement;

    if (modalId === 'modalWaterSettings') {
      const g = document.getElementById('inputWaterGoal');
      const i = document.getElementById('selectWaterInterval');
      const s = document.getElementById('inputWaterStart');
      const e = document.getElementById('inputWaterEnd');
      if (g) g.value = state.water.goal || 2500;
      if (i) i.value = state.water.reminderInterval || 90;
      if (s) s.value = state.water.reminderStart || '08:30';
      if (e) e.value = state.water.reminderEnd || '22:00';
    } else if (modalId === 'modalLogWeight') {
      const d = document.getElementById('inputWeightDate');
      const w = document.getElementById('inputWeightValue');
      if (d) d.value = getTodayString();
      if (w) w.value = state.weight.current || 75;
    } else if (modalId === 'modalTargetWeight') {
      const tw = document.getElementById('inputTargetWeightVal');
      if (tw) tw.value = state.weight.target || 70;
    } else if (modalId === 'modalAddExercise') {
      const exInp = document.getElementById('inputExerciseName');
      if (exInp) exInp.value = '';
    }

    modal.removeAttribute('hidden');
    modal.classList.add('active');

    const appEl = document.getElementById('app');
    if (appEl) appEl.setAttribute('aria-hidden', 'true');

    // Перемещение фокуса на первый интерактивный элемент диалога
    const focusable = modal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      setTimeout(() => focusable[0].focus(), 50);
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.remove('active');
      m.setAttribute('hidden', '');
    });

    const appEl = document.getElementById('app');
    if (appEl) appEl.removeAttribute('aria-hidden');

    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }
  }

  // Ловушка фокуса (Focus Trap) и обработчик клавиши Escape
  document.addEventListener('keydown', (e) => {
    const activeModal = document.querySelector('.modal-overlay.active');
    if (!activeModal) return;

    if (e.key === 'Escape') {
      closeAllModals();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = Array.from(activeModal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  });

  /* ==========================================================================
     13. PUBLIC GLOBAL API
     ========================================================================== */

  window.PulseFlow = {
    // Water
    addWater,
    setWaterGoal(newGoal, interval, start, end) {
      if (newGoal) state.water.goal = Number(newGoal) || 2500;
      if (interval) state.water.reminderInterval = Number(interval) || 90;
      if (start) state.water.reminderStart = start;
      if (end) state.water.reminderEnd = end;
      saveState();
      renderWaterTracker();
      closeAllModals();
      showToast('Параметры гидратации обновлены');
    },

    // Weight & Metrics
    logWeight(date, weight) {
      const w = parseFloat(weight);
      if (!w || isNaN(w)) return;
      state.weight.current = w;
      state.weight.history.push({ date: date || getTodayString(), weight: w });
      saveState();
      renderWeightSection();
      closeAllModals();
      showToast(`Вес ${w} кг сохранен`);
    },

    setWeightTarget(target) {
      state.weight.target = parseFloat(target) || 70;
      saveState();
      renderWeightSection();
      closeAllModals();
      showToast(`Целевой вес ${state.weight.target} кг установлен`);
    },

    addMeasurement(chest, waist, hips, biceps, neck) {
      state.measurements.push({
        date: getTodayString(),
        chest: parseFloat(chest) || null,
        waist: parseFloat(waist) || null,
        hips: parseFloat(hips) || null,
        biceps: parseFloat(biceps) || null,
        neck: parseFloat(neck) || null
      });
      saveState();
      renderMeasurements();
      closeAllModals();
      showToast('Замеры тела сохранены');
    },

    setWeightFilter(period) {
      state.weight.filterPeriod = period;
      document.querySelectorAll('#weightFilterPills .pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === period);
      });
      saveState();
      renderWeightChart();
    },

    // Workouts
    startWorkout: startWorkoutFromTemplate,
    startEmptyWorkout(customTitle = 'Свободная сессия', customDesc = '') {
      state.workouts.activeWorkout = {
        id: 'active-' + Date.now(),
        title: customTitle,
        startTime: Date.now(),
        exercises: [
          { name: 'Жим лёжа на скамье', sets: [{ weight: 50, reps: 10, completed: false }] }
        ]
      };
      requestWakeLock();
      saveState();
      renderWorkoutsTab();
      showToast(`Сессия «${customTitle}» начата`);
    },

    finishWorkout,

    addSet(exIdx) {
      const active = state.workouts.activeWorkout;
      if (!active) return;
      const ex = active.exercises[exIdx];
      const lastSet = ex.sets[ex.sets.length - 1] || { weight: 50, reps: 10 };
      ex.sets.push({ weight: lastSet.weight, reps: lastSet.reps, completed: false });
      saveState();
      renderWorkoutsTab();
    },

    updateSet(exIdx, sIdx, field, val) {
      const active = state.workouts.activeWorkout;
      if (!active) return;
      active.exercises[exIdx].sets[sIdx][field] = Number(val) || 0;
      saveState();
    },

    toggleSetComplete(exIdx, sIdx) {
      const active = state.workouts.activeWorkout;
      if (!active) return;
      const set = active.exercises[exIdx].sets[sIdx];
      set.completed = !set.completed;
      saveState();
      renderWorkoutsTab();

      if (set.completed) {
        startRestTimer(90);
        showToast('Подход завершен. Запущен таймер отдыха (90 с)');
      }
    },

    promptAddExercise() {
      openModal('modalAddExercise');
    },

    confirmAddExercise() {
      const inp = document.getElementById('inputExerciseName');
      const name = inp ? inp.value.trim() : '';
      if (!name || !state.workouts.activeWorkout) return;

      state.workouts.activeWorkout.exercises.push({
        name: name,
        sets: [{ weight: 0, reps: 10, completed: false }]
      });

      saveState();
      renderWorkoutsTab();
      closeAllModals();
      showToast(`Упражнение «${name}» добавлено`);
    },

    startRestTimer,
    stopRestTimer,

    // Diary
    changeDiaryDate(deltaDays) {
      const curr = new Date(state.diary.selectedDate + 'T00:00:00');
      curr.setDate(curr.getDate() + deltaDays);
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      state.diary.selectedDate = `${y}-${m}-${d}`;
      saveState();
      renderDiaryTab();
    },

    setMood(mood) {
      const page = getSelectedDatePage();
      page.mood = mood;
      saveState();
      renderDiaryTab();
    },

    setPagePattern(pattern) {
      const page = getSelectedDatePage();
      page.pattern = pattern;
      saveState();
      renderDiaryTab();
    },

    setPageAccent(color) {
      const page = getSelectedDatePage();
      page.accentColor = color;
      saveState();
      renderDiaryTab();
    },

    setPageFont(font) {
      const page = getSelectedDatePage();
      page.fontFamily = font;
      saveState();
      renderDiaryTab();
    },

    toggleHabit(habitId) {
      const page = getSelectedDatePage();
      page.habits[habitId] = !page.habits[habitId];
      saveState();
      renderDiaryTab();
      if (page.habits[habitId]) {
        playWaterChime();
        showToast('Привычка отмечена');
      }
    },

    addTodo(text) {
      if (!text || !text.trim()) return;
      const page = getSelectedDatePage();
      page.todos.push({
        id: 'td-' + Date.now(),
        text: text.trim(),
        done: false
      });
      saveState();
      renderDiaryTodos();
    },

    toggleTodo(todoId) {
      const page = getSelectedDatePage();
      const td = page.todos.find(t => t.id === todoId);
      if (td) {
        td.done = !td.done;
        saveState();
        renderDiaryTodos();
        if (td.done) playWaterChime();
      }
    },

    deleteTodo(todoId) {
      const page = getSelectedDatePage();
      page.todos = page.todos.filter(t => t.id !== todoId);
      saveState();
      renderDiaryTodos();
    },

    saveNotes(val) {
      const page = getSelectedDatePage();
      page.notes = val;
      saveState();
    },

    // Media
    setMediaCategory(cat) {
      state.media.selectedCategory = cat;
      saveState();
      renderMediaTab();
    },

    toggleFilterTag(tag) {
      const idx = state.media.activeFilterTags.indexOf(tag);
      if (idx > -1) {
        state.media.activeFilterTags.splice(idx, 1);
      } else {
        state.media.activeFilterTags.push(tag);
      }
      saveState();
      renderMediaTab();
    },

    spinRoulette: triggerMediaRandomizer,

    toggleWatchlist(itemId) {
      const idx = state.media.watchlist.indexOf(itemId);
      if (idx > -1) {
        state.media.watchlist.splice(idx, 1);
        showToast('Удалено из списка просмотра');
      } else {
        state.media.watchlist.push(itemId);
        showToast('Добавлено в список просмотра');
      }
      saveState();
      const item = state.media.catalog.find(i => i.id === itemId);
      renderMovieCard(item, true);
      renderMediaTab();
    },

    toggleWatched(itemId) {
      const idx = state.media.watchedHistory.indexOf(itemId);
      const item = state.media.catalog.find(i => i.id === itemId);

      if (idx > -1) {
        state.media.watchedHistory.splice(idx, 1);
        showToast('Удалено из истории просмотра');
      } else {
        state.media.watchedHistory.push(itemId);
        if (item) {
          item.genres.forEach(g => {
            state.media.userLikes.genres[g] = (state.media.userLikes.genres[g] || 0) + 1;
          });
          item.mood.forEach(m => {
            state.media.userLikes.moods[m] = (state.media.userLikes.moods[m] || 0) + 1;
          });
        }
        showToast('Отмечено в истории. Профиль предпочтений обновлен');
      }
      saveState();
      renderMovieCard(item, true);
    },

    openWatchlistModal() {
      const container = document.getElementById('watchlistItemsContainer');
      if (container) {
        const items = state.media.catalog.filter(i => state.media.watchlist.includes(i.id));
        if (items.length === 0) {
          container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:16px;">Список пуст. Выбирайте произведения в рандомайзере.</p>';
        } else {
          container.innerHTML = items.map(it => `
            <div class="watchlist-item">
              <div>
                <div style="font-weight:600;">${escapeHtml(it.title)}</div>
                <div style="font-size:0.75rem; color:var(--text-secondary);">${it.genres.map(g => escapeHtml(g)).join(', ')} • ★ ${escapeHtml(it.rating)}</div>
              </div>
              <button class="btn btn-sm btn-danger" onclick="window.PulseFlow.toggleWatchlist('${escapeHtml(it.id)}'); window.PulseFlow.openWatchlistModal();">✕</button>
            </div>
          `).join('');
        }
      }
      openModal('modalWatchlist');
    },

    addCustomTitle(title, orig, cat, rating, genresStr, desc) {
      if (!title || !title.trim()) return;
      const newMedia = {
        id: 'custom-' + Date.now(),
        title: title.trim(),
        origTitle: orig.trim() || title.trim(),
        category: cat || 'movies',
        rating: parseFloat(rating) || 8.0,
        genres: genresStr.split(',').map(s => s.trim()).filter(Boolean),
        mood: ['Динамичный сюжет'],
        desc: desc.trim() || 'Пользовательский тайтл',
        icon: '🎬'
      };
      state.media.catalog.unshift(newMedia);
      saveState();
      closeAllModals();
      renderMediaTab();
      showToast(`«${title}» добавлено в каталог`);
    },

    // Modals & Storage
    exportData,
    importData,
    openModal,
    closeAllModals
  };

  /* ==========================================================================
     14. DOM INITIALIZATION
     ========================================================================== */

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(state.theme || 'dark');

    // Обработчик вкладок
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
      });
    });

    // Переключатель темы
    const themeBtn = document.getElementById('btnThemeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
      });
    }

    // Уведомления
    const notifyBtn = document.getElementById('btnNotifyToggle');
    if (notifyBtn) {
      notifyBtn.addEventListener('click', requestNotificationPermission);
    }
    updateNotificationUI();

    // PWA Install Button Handler
    const installBtn = document.getElementById('btnInstallApp');
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          const { outcome } = await deferredInstallPrompt.userChoice;
          if (outcome === 'accepted') {
            installBtn.style.display = 'none';
          }
          deferredInstallPrompt = null;
        } else if ('install' in navigator && typeof navigator.install === 'function') {
          try {
            await navigator.install();
          } catch (e) {}
        }
      });
    }

    setupChartInteractivity();

    // Интервальный таймер проверки водного баланса
    setInterval(() => {
      if (!state.water.remindersEnabled) return;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startH, startM] = state.water.reminderStart.split(':').map(Number);
      const [endH, endM] = state.water.reminderEnd.split(':').map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      if (currentMinutes >= startTotal && currentMinutes <= endTotal) {
        const intervalMs = state.water.reminderInterval * 60 * 1000;
        const elapsed = Date.now() - (state.water.lastLogTimestamp || 0);

        if (elapsed >= intervalMs) {
          triggerWaterReminder();
        }
      }

      if (state.activeTab === 'tab-home') {
        renderWaterTracker();
      }
    }, 30000);

    // Закрытие модалок по клику на фон
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeAllModals();
        }
      });
    });

    // Отслеживание ресайза окна для перерисовки графика
    window.addEventListener('resize', () => {
      if (state.activeTab === 'tab-home') {
        renderWeightChart();
      }
    });

    // Регистрация Service Worker для PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('ServiceWorker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('ServiceWorker registration error:', err);
          });
      });
    }

    // Первичный рендер
    switchTab(state.activeTab || 'tab-home');
    updateAppBadge();
  });

})();
