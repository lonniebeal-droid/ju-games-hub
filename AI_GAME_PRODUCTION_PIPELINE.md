# JU Games AI Production Pipeline

Portfolio:
- HUSTLEBOUND / JU ATL: canonical Godot production game is in lonniebeal-droid/ju-atl-game.
- SPADES: THE A: browser card game in this repo.
- Blessing's Block Party / Lil Steppers: browser game in this repo.

Worker loop:
SPEC -> BUILD -> AUTOMATED TEST -> BROWSER/ENGINE SMOKE -> RECEIPT -> MERGE.

Rules:
1. Work only on development/feature branches.
2. Preserve verified releases and public builds until replacement passes.
3. Use original JU art, characters, audio, maps and mechanics.
4. Every gameplay change gets automated verification.
5. Record exact commit and test command before merge.

Engine lanes:
- Godot 4.7.2 is the HUSTLEBOUND engine on the M1/8GB Mac.
- Blender is the original 3D asset lane.
- Browser games remain web-first unless testing proves an engine migration is worth it.

Verification:
- python3 verify_hub.py
- python3 spades/verify_spades_browser.py
