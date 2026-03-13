# CLAUDE.md — AI Assistant Instructions for The Final Frontier

> Paste this file's contents at the start of any new Claude conversation to get up to speed instantly.

---

## Latest Update (v0.17)
- Moved dock and hangar backgrounds out of `index.html` into `assets/backgrounds/`
- Station and planet dock screens now use separate background files
- Added `updateDockBackgrounds()` in `js/ui.js` so the dock UI swaps artwork by dock type
- Repacked the working project into a clean folder structure for GitHub and future updates

---

## Project: The Final Frontier

A browser-based 2D space game. Single HTML/CSS/JS project, no build tools, no frameworks. Runs directly in browser via GitHub Pages.

**GitHub Pages URL:** `https://emdagency.github.io/the-final-frontier/`

---

## File Structure

```text
index.html
styles.css
README.md
assets/
  backgrounds/
    stations/
      station-hub.jpg
      station-hangar.jpg
    planets/
      planet-hub.jpg
      planet-hangar.jpg
js/
  audio.js
  data.js
  engine.js
  render.js
  input.js
  ui.js                  ← dock flow, hub UI, galaxy map, jump system (v6)
  main.js
  sprites/
    centaurian.js
    player.js            ← ?v=10
    environment.js
```

**Never upload sprite files to Claude** — they are huge base64 image blobs and will fill the context window.

---

## Current Cache-Bust Versions (index.html)

| File | Version |
|------|---------|
| `js/sprites/player.js` | `?v=9` |
| `js/sprites/environment.js` | *(no version)* |
| `js/ui.js` | `?v=12` |

Increment `?v=N` on any file that changes to force browser cache refresh.

---

## Key Variables & Architecture

### Global State (engine.js)
- `player` — ship object: `{x, y, vx, vy, angle, hull, shield, maxHull, maxShield, speed, thrust, turnRate, shipType, damage, mods{}}`
- `state` — game flags: `{credits, fuel, maxFuel, reputation{}, missions[], activeMission, kills, ownedStations{}, cargo{}, storedShips[]}`
- `systemKey` — current star system key (e.g. `"sol"`, `"vega"`)
- `enemies[]`, `asteroids[]`, `bullets[]`, `particles[]` — live entity arrays

### Game Data (data.js)
- `SYSTEMS` — 13 star systems with `{name, x, y, faction, desc, neighbors[], hasShipyard?}`
- `SHIP_TYPES` — player and enemy ship stat blocks
- `CENTAURIAN_FLEET` — spawn weights for alien enemies
- `ENEMY_CFGS` — faction-based enemy configurations
- `ASTEROID_SIZES` — small/medium/large radius, HP, damage

### Sprites (sprites/)
- `centaurianImgs` — object keyed by `"fighter"`, `"cruiser"`, `"frigate"`, `"capital"`
- `shipSprite` — player ship Image object
- `planetSprite`, `stationSprite` — environment Image objects

### Render Pipeline (render.js)
- Main loop: `gameLoop()` → `update()` → `draw()`
- Draw order: stars → asteroids → station → planet → enemies → player → bullets → particles → HUD
- Asteroid system uses pre-rendered offscreen canvases (`ASTEROID_VISUAL_DEFS`)
- Station sprite uses **`screen` blend mode** — black background PNG, no alpha needed
- Station renders at **200×200px** in all systems
- **Velocity arrow removed**
- **Retro thruster visuals removed** (data still in `player.js` for future use)

---

## Hub UI System (ui.js + index.html)

### Architecture
The dock screen is a full-screen overlay (`#stationscreen`) that replaces the old card-based layout. It has three layers:

1. **Background image layer** (`#hub-bg`) — faction/location-specific background photo (base64 embedded in CSS)
2. **Header bar** — location name, faction, credits, hull bar, quick repair/refuel buttons
3. **Navigation bar** — service tabs + Galaxy Map + Main Menu + Launch
4. **Content area** — hub landing or one of four service panels

### Hub Screen Flow
```
enterDock() → hubOpen(null)           ← shows hub landing with 4 service cards
hubOpen('hangar')                     ← opens Hangar panel
hubOpen('missions')                   ← opens Missions panel
hubOpen('trading')                    ← opens Trading stub
hubOpen('shipyard')                   ← opens Shipyard stub
```

### Navigation Structure
- **Header**: always visible — location name, credits, hull bar, ⚙ REPAIR +30 / ⚙ FULL REPAIR / ⛽ REFUEL buttons
- **Nav bar**: HANGAR · TRADING · MISSIONS · SHIPYARD | GALAXY MAP · MAIN MENU · ▶ LAUNCH
- **Hangar tab bar**: ← HUB · CARGO BAY · MODIFICATIONS
- **Back nav breadcrumb**: appears at top of every sub-panel (← HUB, ← HANGAR as appropriate)

### Repair & Refuel
- Always accessible from the header — no need to navigate to cargo bay
- `doRepair('small')` / `doRepair('full')` — costs vary by planet (80/280 Cr) vs station (50/200 Cr)
- `doRefuel()` — 30 Cr per jump, fills to `state.maxFuel`
- `updateHeaderRepairButtons()` — call after any state change to refresh button disabled states

### Hangar — Cargo Bay
- Ship status row (ship type, hull, shield, fuel, kills)
- Cargo hold inventory
- Stored ships at this location with ⇄ BOARD SHIP button
- `swapToStoredShip(idx)` — stores current ship here, boards selected ship
- `state.storedShips[]` — array of `{shipType, hull, maxHull, shield, maxShield, speed, thrust, turnRate, damage, mods, locationKey}`

### Hangar — Modifications
- Left: ship card with top-down sprite (200×200 canvas, screen blend) + hull/shield/speed/damage bars
- Right: flat list of 8 named module slots (COCKPIT, FORWARD WEAPON, LEFT WEAPON, RIGHT WEAPON, SCANNER, SHIELDS, ENGINES, AFTERBURNER) + 4 EXOTIC slots at bottom
- Clicking a slot shows detail panel — installed mod info or "visit Shipyard" prompt
- `player.mods{}` — keyed by slot ID (e.g. `"left_weapon"`, `"exotic_0"`)
- `MOD_SLOTS[]` — slot definitions with `{id, label, side, desc}`
- `SLOT_ICONS{}` — symbol per slot for the icon column

### Missions Panel
- Active mission shown at top (Complete button appears if at destination)
- Available missions listed with Accept button
- Faction reputation grid at bottom
- `completeMissionNow()` — awards pay, clears active mission
- `acceptMission(id)` — sets active mission

### Background Images
Dock backgrounds are now loaded from image files in `assets/backgrounds/` instead of being embedded in `index.html`.

- **Station hub** → `assets/backgrounds/stations/station-hub.jpg`
- **Station hangar** → `assets/backgrounds/stations/station-hangar.jpg`
- **Planet hub** → `assets/backgrounds/planets/planet-hub.jpg`
- **Planet hangar** → `assets/backgrounds/planets/planet-hangar.jpg`

Behavior:
- `updateDockBackgrounds()` in `js/ui.js` sets `#stationscreen[data-dock="station"|"planet"]`
- `index.html` uses that attribute to swap the correct hub and hangar backgrounds
- Planet artwork has been darkened slightly for UI readability
- This keeps `index.html` smaller and makes future planet/station variants easier to add

To replace a background, swap the file and keep the same path, or add a new file and update the CSS selector in `index.html`.

### Ship Image in Modifications
- `MODS_SHIP_B64` constant in `ui.js` — base64 PNG of the starter ship (top-down, black bg)
- Loaded lazily via `getModsShipImg()` — returns a cached `Image` object
- Drawn in `drawModsShip()` using `screen` blend mode on a 200×200 canvas
- To replace: update `MODS_SHIP_B64` in `ui.js` with new base64 PNG

---

## Jump System (ui.js)

### In-Flight Jump Flow
1. Player opens Galaxy Map (`G` key or button), clicks a destination system
2. If **in flight**: `plotRoute(destKey)` stores `_plottedRoute`, jump HUD appears at screen bottom
3. `#jump-route-hud` shows destination + fuel cost, pulses blue
4. Player presses **⬡ JUMP** → `executeJump()` → `triggerJumpEffect(destKey, jumps)`
5. BSG-style jump effect (3.1 seconds total):
   - **0–800ms**: "JUMP DRIVE SPOOLING" overlay fades in
   - **800–1400ms**: Warning text + pulsing icon
   - **1400ms**: Screen flashes white — system changes here, fuel deducted
   - **1500–2600ms**: New system name fades in
   - **2600–3100ms**: Overlay fades out, toast notification fires
6. Player arrives via `initWorld(destKey, true)` — random edge of new system, in flight

### Jumping from Dock
- Galaxy map used while docked: `doJumpTo()` called directly — closes dock, runs same jump effect

### Key Functions
- `plotRoute(destKey)` — sets `_plottedRoute`, shows jump HUD
- `cancelPlottedRoute()` — clears route, hides HUD button
- `executeJump()` — validates fuel, calls `triggerJumpEffect()`
- `triggerJumpEffect(destKey, jumps)` — full BSG animation + world transition
- `doJumpTo(destKey, jumps)` — direct jump (from dock)
- `getJumpPath(fromKey, toKey)` — BFS pathfinding through SYSTEMS neighbors graph
- `getSystemJumpDistance(fromKey, toKey)` — returns jump count

### Jump Overlay Elements (index.html)
- `#warpoverlay` — full-screen white flash div
- `#jump-effect-overlay` — blue radial gradient overlay with text lines
- `#jet-line1/2/3` — text content updated during jump sequence
- `#jump-route-hud` — in-flight jump button panel (bottom-center)

---

## Galaxy Map (ui.js)

- `openGalaxyMap()` / `closeGalaxyMap()` — toggle map overlay
- `renderGalaxyMap()` — draws systems and connections on `#galaxymapCanvas`
- Current system: green dot + "◆ YOU ARE HERE"
- Reachable neighbors: blue highlight, others: grey
- Clicking a system: shows jump panel with path and fuel cost
- Confirm → `plotRoute()` (in flight) or `doJumpTo()` (docked)

---

## Main Menu
- `hubMainMenu()` — saves via `saveCurrentPilot("manual")`, closes dock, shows `#startscreen`
- Allows pilot switching without page refresh

---

## Common Edit Tasks

### Add a new star system
Edit `SYSTEMS` in `data.js`. Add key with `{name, x, y, faction, desc, neighbors[], hasShipyard?}`.

### Fix a system's planet/station positions
Edit `FIXED_LAYOUTS` in `engine.js` (inside `initWorld()`). Currently fixed: `sol` (Alpha Centauri).

### Add a shipyard to a system
Add `hasShipyard: true` to the system in `data.js`. The Shipyard panel checks this flag.

### Change repair/refuel costs
Edit `doRepair()`, `doRefuel()`, and `updateHeaderRepairButtons()` in `ui.js`.

### Add a module slot
Add to `MOD_SLOTS[]` in `ui.js` with `{id, label, side, desc}`. Add icon to `SLOT_ICONS{}`.

### Add a stored ship (for testing)
Push to `state.storedShips[]` with full ship data + `locationKey`.

### Tweak enemy stats
Edit `SHIP_TYPES` in `data.js`.

### Add a new mission type
Edit `render.js` around `// ── MISSION SYSTEM`.

### Add new sound effect
Edit `audio.js` — Web Audio API only, no external files.

---

## Ship Sprite System (player.js)

### Key Constants
- `SHIP_B64` — base64 PNG string (pure black background required)
- `SHIP_RENDER_H / SHIP_RENDER_W` — **80×80px**
- `NOZZLES[]` — rear engine nozzle positions for flame effects (render-space coords relative to ship center)
- `RETRO_THRUSTERS[]` — wing retro positions (data kept, not drawn)
- `WEAPON_PORTS{}` — gun hardpoints; `defaultEquipped: true` = active at game start
- `FLAME_CFG` — flame appearance config
- `WING_GUN_CONVERGENCE` — bullet toe-in angle (radians)

### Nozzle Positions (at 80px render size)
```js
NOZZLES = [
  { x: -10.6, y: 33.5 },  // left engine
  { x:  -0.1, y: 34.0 },  // center engine
  { x: +10.7, y: 33.5 },  // right engine
]
```

### Screen Blend Mode
Both ship and station use `globalCompositeOperation = "screen"` to eliminate black backgrounds at draw time. **PNG required** (not JPEG — compression artifacts break the effect).

### Replacing the Ship Sprite
1. Source image with **pure black background**
2. Run patch script:
```python
import base64, re
with open("your-ship.png", "rb") as f:
    data_uri = "data:image/png;base64," + base64.b64encode(f.read()).decode()
with open("js/sprites/player.js") as f:
    content = f.read()
content = re.sub(r'(const SHIP_B64\s*=\s*")[^"]*(")',
                 lambda m: m.group(1) + data_uri + m.group(2), content)
with open("js/sprites/player.js", "w") as f:
    f.write(content)
```
3. Bump `?v=N` on the player.js `<script>` tag in `index.html`

### Replacing the Station Sprite
Use `patch_station.py` workflow:
1. Process PNG (flood-fill bg removal + 512×512 Lanczos resize)
2. Run `python3 patch_station.py` from repo root
3. Push `environment.js` to GitHub

---

### `dockShip()` must compute `stationHostile` locally
`stationHostile` is a `const` scoped inside `tick()` in `render.js` — it is **not** a global. `dockShip()` in `ui.js` must compute it directly:
```js
const sysFac = SYSTEMS[systemKey].faction;
const sysRep = state.reputation[sysFac] || 0;
const stationHostile = !station.owned && sysRep <= REP_HOSTILE_THRESHOLD;
```
Never reference `stationHostile` as a global from `ui.js` — it will be `undefined`.

---

## Coding Conventions

- Vanilla JS — no imports, no modules, no bundler
- All scripts load globally via `<script src="...">` in `index.html`
- Canvas 2D context is `c`, canvas element is `gameCanvas`
- `rand(a, b)` — random float in range
- `dist2(a, b)` — squared distance between `{x,y}` objects
- `mkid()` — unique entity IDs
- `showToast(msg)` — in-flight notification (defined in `input.js`)
- `updateHUD()` — refreshes in-flight HUD (defined in `input.js`)

---

## What NOT to Do

- ❌ Don't add `import`/`export`
- ❌ Don't upload sprite files to Claude
- ❌ Don't introduce npm, webpack, or build tools
- ❌ Don't add external CDN dependencies
- ❌ Don't use JPEG for ship/station sprites (screen blend needs PNG)

---

## GitHub Pages

Deployed from `main` branch root. Live ~30 seconds after commit. No build step.

---

## Pending / Planned Features

- **Trading system** — buy/sell resources, tiered economy (common/rare/exotic/unique), supply/demand
- **Shipyard** — buy ships + modules; only at `hasShipyard: true` systems
- **Bullet spawn refactor** — iterate `player.equippedWeapons` instead of hardcoding wing ports
- **Nose cannon upgrade** — add `"forward_weapon"` to `player.equippedWeapons` via shipyard
- **Fixed layouts for other systems** — only `sol` fixed currently
- **Per-faction hub backgrounds** — different images per faction/system type
- **Module graphics** — small icons per module category for modification slots

---

## Save Data Notes

- Pilots stored in `localStorage` keyed by pilot name
- `state.storedShips[]` persists ship fleet across sessions
- `state.cargo{}` persists cargo hold contents
- Players with saves pre-dating `FIXED_LAYOUTS` need to clear save once to get fixed positions
