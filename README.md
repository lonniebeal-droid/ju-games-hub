# JU Games Hub (`ju-games-hub`)

Public web play hub and deployment repository for **JU Games** — playable instantly in any modern desktop or mobile browser.

---

## 🎮 Live Portal

| Property | Value |
| :--- | :--- |
| **Live GitHub Pages URL** | [`https://lonniebeal-droid.github.io/ju-games-hub/`](https://lonniebeal-droid.github.io/ju-games-hub/) |
| **Hosting Status** | 🟢 **HTTP 200 Live** |
| **Mobile Ready** | ✅ Responsive layout with viewport-fit & touch controls |

---

## 🕹️ Featured Games

### 1. 🏙️ HUSTLEBOUND: Atlanta
- **Genre**: Open-World Urban Adventure Prototype
- **Play Online**: [`./hustlebound/`](https://lonniebeal-droid.github.io/ju-games-hub/hustlebound/)
- **Android Build**: [Pixel 10 APK Release](https://github.com/lonniebeal-droid/ju-games-hub/releases/download/pixel10-20260912/HUSTLEBOUND-JU-ATL-Pixel-VERIFIED-20260912.apk)
- **Features**: Atlanta cityscape navigation, vehicles, missions & hustles, responsive mobile touch controls, persistent save states. Canonical Godot source is tracked in `lonniebeal-droid/ju-atl-game`.

### 2. ♠️ SPADES: THE A
- **Genre**: Atlanta Rules 4-Player Card Game
- **Play Online**: [`./spades/`](https://lonniebeal-droid.github.io/ju-games-hub/spades/)
- **Features**: Classic Atlanta Spades rules, autonomous AI partner and opponents, bidding system, sandbag tracking, trick taking, career stats, and automated selftest mode (`?selftest=1`).

### 3. ✨ Blessing's Block Party (Lil Steppers)
- **Genre**: Kids Arcade & Movement Game
- **Play Online**: [`./lil-steppers/`](https://lonniebeal-droid.github.io/ju-games-hub/lil-steppers/)
- **Features**: Meet Blessing! Grab stars and goodies, dodge silly obstacles, build streaks, level up, dash, dance, and celebrate with confetti.

---

## 📁 Repository Structure

```
ju-games-hub/
├── index.html                   # Main portal landing page (cards, links, responsive CSS)
├── favicon.ico                  # Hub icon
├── .nojekyll                    # Ensures static assets and underscores are served by GitHub Pages
├── AI_GAME_PRODUCTION_PIPELINE.md # Pipeline rules, engine lanes, and verification standards
├── hustlebound/                 # Web export of HUSTLEBOUND prototype
├── spades/                      # Pure HTML/JS Spades game engine + specs
│   ├── index.html
│   ├── FEATURE_SPEC.md
│   └── verify_spades_browser.py
├── lil-steppers/                # Lil Steppers web game assets & logic
├── sale/                        # Promotional & game merchandising landing pages
└── verify_hub.py                # Automated structural and HTTP smoke verification suite
```

---

## 🧪 Verification & Smoke Testing

Run the automated verification suite from the repository root:

```bash
python3 verify_hub.py
```

### Verification Checks
1. **Required Files**: Confirms `index.html`, `spades/index.html`, `lil-steppers/index.html`, and `hustlebound/index.html` exist.
2. **Local Link Parsing**: Validates that all relative links in `index.html` resolve to existing files or directories.
3. **Automated Selftest Hooks**: Confirms the Spades engine includes required automated testing hooks (`selftest=1`, `dataset.selftest`).
4. **Graphic Markers**: Verifies visual asset and character markers in Lil Steppers (`Blessing`, `confetti`, `class="road"`).
5. **Local HTTP Server Smoke**: Spins up a local test HTTP server on an ephemeral port and requests `/`, `/spades/`, `/lil-steppers/`, and `/hustlebound/` to confirm HTTP 200 responses.

---

## 🛡️ Production Standards & Governance

- Follows the [JU Games AI Production Pipeline](AI_GAME_PRODUCTION_PIPELINE.md).
- Tracked in the canonical **JU_SYSTEM Master Operations Dashboard** (`1gO_3FvISUQ7lktda8fSiOlWX7MizbGyJExcHoHrg-Qk`) and synchronized with `ju-command-center`.
