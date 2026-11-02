# BELOW THE SURFACE — A Journey into the Unknown

> **IIT Bombay Techfest · Web Development Challenge**  
> **Domain:** Web Development  
> **Score:** 150 Points  
> **Theme:** "Design the Unknown"

---

## 🌊 Overview

**Below the Surface** is an interactive, multi-layer parallax scrolling experience documenting humanity's descent from the open ocean surface into the deepest abyss on Earth. Designed with the cinematic aesthetic of high-end digital art installations and award-winning interactive documentaries, it combines:

- **6 Distinct Narrative Chapters** (Surface, Sunlight Zone, Coral Reef, Bioluminescent Zone, Abyssal Plain, Hadal Trench).
- **Custom Native Parallax Engine** utilizing hardware-accelerated `translate3d()` transforms computed in a single unified `requestAnimationFrame` loop.
- **True Multi-Layer Depth Stacking** where 5+ independent depth planes in each scene move at distinct relative velocities.
- **Dynamic Real-Time Canvas Particle System** generating motes, buoyant bubbles, marine snow, and bioluminescent sparks tuned to the current water depth and scroll velocity without DOM bloat.
- **Procedural Marine Life Engine** simulating natural schooling behaviors and fin swimming dynamics via HTML5 Canvas.
- **Interactive Depth Gauge & Navigation** featuring live meter readouts (`0 m` to `10,935 m`), active ocean zone classification, clickable chapter dots, and full keyboard/screen-reader accessibility.
- **Graceful Reduced-Motion Support** adhering strictly to `prefers-reduced-motion: reduce`.

---

## 🎨 Creative & Art Direction

### Color Palette
- **Deep Navy:** `#061626`
- **Ocean Blue:** `#073B5C`
- **Turquoise:** `#19B5B5`
- **Bioluminescent Cyan:** `#65F5E8`
- **Midnight Abyss:** `#020912`
- **Soft Light:** `#F2F7F8`

### Typography
- **Display:** *Cormorant Garamond* (Editorial, high-contrast, Italian-style italics for hero statements).
- **Body & Metrics:** *Inter Variable* (Crisp, technical, wide letter-spacing for coordinates and scientific metrics).

---

## 🧭 Narrative Structure (6 Chapters)

| # | Chapter | Depth | Oceanic Zone | Visual Focus |
|---|---|---|---|---|
| **01** | **The Ocean Above** | `0 m` | Atmosphere / Surface | Golden hour horizon, sun path glint, multi-speed swell bands, editorial hero. |
| **02** | **Crossing the Surface** | `12 m` | Sunlight Zone | Sunlight refracting through breaking swells, descending god rays, rising bubbles, scatter fish. |
| **03** | **The Living Ocean** | `40 m` | Sunlight Zone | Deep coral walls, a gliding green sea turtle, swirling sardine school, multi-depth foreground coral. |
| **04** | **The Bioluminescent World** | `1,000 m` | Midnight Zone | Pitch darkness, pulsing glowing jellyfish at 4 distinct depths, bioluminescent seabed tube organisms, mouse-tracking ambient torch. |
| **05** | **The Abyss** | `6,000 m` | Abyssal Zone | Giant basalt spires, jagged volcanic foreground rocks, distant ancient leviathan silhouette rim-lit in cold cyan. |
| **06** | **The Journey Continues** | `10,935 m` | Hadal Zone | Looking upward toward the surface glow, rising bubbles, animated *Explore Again* return button, Techfest credits. |

---

## ⚙️ Technical Architecture

### 1. Parallax Engine (`src/engine/parallax.js`)
- Does not rely on heavy third-party animation libraries (GSAP / ScrollMagic / Locomotion).
- Calculates normalized scroll progress `s = (scrollY - sceneTop) / viewportHeight` per active scene.
- Pinned sticky stages ensure that scenes remain anchored while depth planes travel at custom rates (`data-depth`, `data-x`, `data-scale`, `data-rot`, `data-mouse`).
- Keyframed opacity transitions (`data-o`) orchestrate smooth entrance and exit dissolves.
- Mouse/pointer parallax on desktop adds subtle horizontal tilt and natural perspective tracking.

### 2. High-Performance Canvas Particles (`src/components/ParticleField.jsx`)
- Uses offscreen pre-rendered radial sprites for motes, bubbles, marine snow, and bioluminescent sparks.
- Dynamically blends particle density and species distribution according to the current depth phase.
- Responds to scroll inertia and velocity.

### 3. Procedural Fish Simulation (`src/components/FishCanvas.jsx`)
- Canvas-based mathematical boid/ribbon kinematics.
- Smooth undulating tail fin physics and sinusoidal banking angles.
- Automatically throttled via `IntersectionObserver` when off-screen.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)

### Development Server
```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

### Production Build
```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

The production assets will be output to the `dist/` folder.

---

## 📱 Responsiveness & Accessibility

- **Desktop & Ultrawide:** Full multi-plane parallax with pointer tracking and fixed vertical depth gauge.
- **Tablet & Mobile:** Automatically downscales parallax intensity, swaps the desktop nav for an accessible full-screen modal menu, and displays a slim top progress indicator with a numeric depth badge.
- **Reduced Motion:** Fully disables transform transitions and pinned scrolling; content is presented cleanly as sequenced, accessible chapters.

---

*Submitted for IIT Bombay Techfest — Design the Unknown.*
