# JU Games Hub (`ju-games-hub`)

Public web play hub and deployment repository for **JU Games** — playable instantly in any modern desktop or mobile browser.

**REAL_MONEY_ENABLED=false** — virtual / free browser play only. No real-money wagering.

---

## Live Portal

| Property | Value |
| :--- | :--- |
| **Live GitHub Pages URL** | [`https://lonniebeal-droid.github.io/ju-games-hub/`](https://lonniebeal-droid.github.io/ju-games-hub/) |
| **Hosting Status** | HTTP 200 Live |
| **Mobile Ready** | Responsive layout with viewport + touch/pointer handling |
| **Last hub verify** | 2026-09-25 — `JU_GAMES_HUB_VERIFY=PASS` · `JU_MOBILE_VERIFY=PASS` (9 routes) |

---

## Featured Games

### HUSTLEBOUND: Atlanta
- **Genre**: Open-World Urban Adventure Prototype
- **Play**: [./hustlebound/](https://lonniebeal-droid.github.io/ju-games-hub/hustlebound/)
- **Android Build**: [Pixel 10 APK Release](https://github.com/lonniebeal-droid/ju-games-hub/releases/download/pixel10-20260912/HUSTLEBOUND-JU-ATL-Pixel-VERIFIED-20260912.apk)
- Canonical Godot source: `lonniebeal-droid/ju-atl-game`

### SPADES: THE A
- **Genre**: Atlanta Rules 4-Player Card Game
- **Play**: [./spades/](https://lonniebeal-droid.github.io/ju-games-hub/spades/) (`?selftest=1` for automated self-test)

### Blessing's Block Party (Lil Steppers)
- **Genre**: Kids Arcade & Movement Game
- **Play**: [./lil-steppers/](https://lonniebeal-droid.github.io/ju-games-hub/lil-steppers/)

---

## Recovered / Additional Browser Games

| Game | Path |
| :--- | :--- |
| 21 RUSH: THE A | [./21-rush/](https://lonniebeal-droid.github.io/ju-games-hub/21-rush/) |
| THE A: Living Atlanta | [./living-atlanta/](https://lonniebeal-droid.github.io/ju-games-hub/living-atlanta/) |
| ATLANTA ARCADE (5-in-1) | [./atlanta-arcade/](https://lonniebeal-droid.github.io/ju-games-hub/atlanta-arcade/) |
| BLOCK: THE A | [./block-the-a/](https://lonniebeal-droid.github.io/ju-games-hub/block-the-a/) |
| A-TOWN RUNNER | [./a-town-runner/](https://lonniebeal-droid.github.io/ju-games-hub/a-town-runner/) |
| A-TOWN LIFE | [./a-town-life/](https://lonniebeal-droid.github.io/ju-games-hub/a-town-life/) |
| Full inventory | [./all-games/](https://lonniebeal-droid.github.io/ju-games-hub/all-games/) |

---

## Verification

```bash
python3 verify_hub.py
```

Checks required files, local links from `index.html`, Spades self-test hooks, Lil Steppers markers, local HTTP 200 on all hub routes, and mobile viewport/touch markers on 9 public games.

---

## Governance

- [JU Games AI Production Pipeline](AI_GAME_PRODUCTION_PIPELINE.md)
- Tracked in **JU_SYSTEM Master Operations Dashboard** and `ju-command-center`
