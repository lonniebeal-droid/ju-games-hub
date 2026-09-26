# BLOCK: THE A — Graphics Upgrade Receipt (2026-09-26)

**Owner:** Muse (JU Games graphics lane)
**Branch:** `muse/block-the-a-graphics-2026-09-26`
**Scope:** graphics/UI only. Game logic preserved.

## Visual changes
- Atlanta night theme: radial night-sky gradient, starfield, skyline silhouette
- Gold-gradient title treatment ("BLOCK: THE A")
- Glass-style score HUD (blur, border, shadow)
- Board: dark glass panel, gradient cells, pink glow on filled cells
- Piece tray: mini-grid block previews (colored cells) replacing "■" text
- Pop animation on status messages ("ATL CLEAR!", "That spot won't fit.")
- "How to play" tip line

## Logic preservation (untouched)
`B`, `score`, `sel`, `shapes`, `newHand`, `place`, `clearLines`, `reset`
identical in behavior. Only CSS and `draw()` markup changed; `flashMsg`
adds a CSS class around the same message text. Mobile/touch hardening
scripts preserved.

## Verification
- **Gameplay regression: 13/13 PASS** (`/tmp/test_block_a.js` — runs the real
  game script with a DOM stub): reset state, placement scoring (+10/block),
  overlap rejection, row clear (+200), ATL CLEAR message, new-hand dealing,
  64-cell board render, 3 piece previews, mini-grid (no text blocks).
- **Static checks PASS:** HTML tags balanced, CSS braces balanced (3 style
  blocks), 2 script blocks as expected.
- **Visual QA: BLOCKED (environment).** The managed browser runs on an
  isolated VM and cannot reach this VM's localhost; serveo SSH tunnel is
  blocked by the egress proxy; local meta-chromium headless capture produced
  no output in this environment. Recommend a 30-second visual check after
  push, or re-run QA where the page is network-reachable.

## Not touched
- `spades/` — COMPLETE, locked (verified live self-test PASS 2026-09-26)
- `hustlebound/`, `ju-atl/` — LOCKED
- Settlement/RPC/auth logic — none in this game
