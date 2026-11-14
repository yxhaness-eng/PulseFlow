# PulseFlow

PulseFlow is an offline-capable Progressive Web Application (PWA) designed for holistic daily tracking: health telemetry, workout routines, personal journaling, and leisure recommendations. Built with pure modern web technologies, it features an Ink-inspired aesthetic, local client-side persistence, and responsive mobile-first views.

## Key Capabilities

### 1. Health & Telemetry
- **Hydration Tracker**: Real-time circular progress gauge, quick-log increments (+250ml, +500ml, custom volume), undo capability, and customizable reminder intervals.
- **Body Telemetry & BMI**: Dynamic Body Mass Index calculation based on height and weight inputs, categorization (Underweight, Normal, Overweight, Obese), and an HTML5 Canvas trend graph supporting 7-day, 30-day, and all-time views.
- **Circumference Measurements**: Logging body measurements including waist, chest, hips, arms, and legs.

### 2. Workout & Fitness Logging
- **Routine Templates**: Structured starter routines (Full Body, Upper Body, Lower Body, Cardio/HIIT) with custom exercise additions.
- **Active Set Tracker**: Log sets, weights, and repetitions with tactile completion checks.
- **Rest Interval Timer**: Visual and audio countdown between workout sets with common presets.
- **Web Platform Capabilities**:
  - *Screen Wake Lock API*: Prevents screen dimming during active workout sessions and rest intervals.
  - *Badging API*: Displays remaining daily goals directly on the application icon.
  - *Web Share API*: One-tap sharing of workout logs or recommendations.

### 3. Personal Diary & Habits
- **Date Navigation**: Seamless day-by-day switcher.
- **Mood Tracking**: Quick visual mood selectors to capture daily sentiment.
- **Habit Tracking**: Interactive habit checklist with automatic daily progress calculation.
- **Task Management**: Simple to-do list with completion states.
- **Daily Reflections**: Auto-saving freeform notes.

### 4. Smart Media Selector
- **Curated Catalog**: Filter by media format, genres, and moods.
- **Kinetic Selection**: Random selection engine to pick activities or media.
- **Watchlist & History**: Track items saved for later and mark completed titles.

---

## Technical Architecture

PulseFlow runs as a zero-dependency vanilla web application with no build steps or heavy bundlers required.

```text
PulseFlow/
├── index.html        # Single-page application structure and accessible dialogs
├── style.css         # Ink design system, CSS custom properties, and safe-area insets
├── app.js            # Reactive application logic, state management, and Web APIs
├── sw.js             # Service Worker with multi-strategy caching
├── manifest.json     # PWA metadata, icons, and shortcuts configuration
├── icon.svg          # Vector master icon
├── icon-192.png      # 192x192 raster icon
├── icon-512.png      # 512x512 raster icon
└── .gitignore        # Repository ignore rules
```

### Service Worker Caching Strategies (`sw.js`)
- **Navigation Requests**: `NetworkFirst` policy with an instant offline fallback to `./index.html`.
- **Static Assets**: `CacheFirst` policy with `Stale-While-Revalidate` for CSS, JavaScript, fonts, and images.
- **Scheme Guard**: Ignores non-HTTP/HTTPS traffic to prevent interference with browser extensions.
- **Notification Focus**: Automatically focuses or opens the application window upon interacting with system notifications.

---

## Getting Started

### Local Setup
Run a static file server in the project directory:

```bash
# Using Python 3
python -m http.server 8080

# Using Node.js
npx serve .
```

Navigate to `http://localhost:8080` in any modern web browser.

### Installing the PWA
- **Desktop (Chrome / Edge)**: Click the Install button in the application header or the install icon in the address bar.
- **Mobile (iOS Safari)**: Tap the Share button and select "Add to Home Screen".
- **Mobile (Android Chrome)**: Tap the prompt to install or select "Install App" from the browser menu.

---

## Data Privacy & Storage

All user data is stored strictly on device within `localStorage`. PulseFlow operates entirely client-side with no remote telemetry or third-party trackers.
