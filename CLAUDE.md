# CLAUDE.md — AI Assistant Instructions for The Final Frontier

> Paste this file's contents at the start of any new Claude conversation to get up to speed instantly.
> Also paste `economy-reference.md` when working on the economy or trading UI.

---

## Project: The Final Frontier

A browser-based 2D space game. Single HTML/CSS/JS project, no build tools, no frameworks. Runs directly in browser via GitHub Pages.

**GitHub Pages URL:** `https://emdagency.github.io/the-final-frontier-alpha/`

---

## File Structure

```
index.html              ← HTML shell + all hub/dock CSS (inline <style>) — changes frequently
styles.css              ← In-flight HUD CSS, galaxy map, start screen CSS
js/
  audio.js              ← Web Audio thruster + SFX engine
  data.js               ← SYSTEMS, SHIP_TYPES, ENEMY_CFGS, ASTEROID_SIZES
  economy.js            ← Trading economy: resources, supply/demand, prices, black market
  engine.js             ← State vars, save/load, canvas setup, world init
  render.js             ← Game loop, draw functions, asteroids, missions
  input.js              ← Keyboard, touch, event handlers, updateHUD(), showToast()
  ui.js                 ← Hub screen, dock flow, galaxy map, jump system
  main.js               ← Boot only (< 1KB)
  sprites/
    centaurian.js       ← CENTAURIAN_B64 object: fighter/cruiser/frigate/capital (4.3MB)
    player.js           ← SHIP_B64 string + NOZZLES + flame config (430KB) — ?v=10
    environment.js      ← PLANET_B64 + STATION_B64 strings (4.1MB)
```

**Never upload sprite files to Claude** — they are huge base64 image blobs and will fill the context window.

---

## Current Cache-Bust Versions (index.html)

| File | Version |
|------|---------|
| `js/sprites/player.js` | `?v=10` |
| `js/sprites/environment.js` | *(no version)* |
| `js/ui.js` | `?v=12` |
| `js/input.js` | `?v=2` |
| `js/engine.js` | `?v=2` |
| `js/render.js` | `?v=11` |
| `js/economy.js` | *(no version — new file)* |

Increment `?v=N` on any file that changes to force browser cache refresh.

---

## Key Variables & Architecture

### Global State (engine.js)
- `player` — ship object: `{x, y, vx, vy, angle, hull, shield, maxHull, maxShield, speed, thrust, turnRate, shipType, damage, cargoCapacity, mods{}}`
- `state` — game flags: `{credits, fuel, maxFuel, reputation{}, missions[], activeMission, kills, ownedStations{}, cargo{}, storedShips[]}`
- `systemKey` — current star system key (e.g. `"sol"`, `"vega"`)
- `enemies[]`, `asteroids[]`, `bullets[]`, `particles[]` — live entity arrays

### Cargo State
- `state.cargo` — keyed by resourceId: `{ quantity, pricePaid }`
- `player.cargoCapacity` — max cargo units (Shuttle=20, Fighter=10, Gunship=30)
- `getCargoCount()` in `economy.js` — returns total units currently held

### Game Data (data.js)
- `SYSTEMS` — 13 star systems with `{name, x, y, faction, desc, neighbors[], hasShipyard?}`
- `SHIP_TYPES` — player and enemy ship stat blocks, includes `cargoCapacity` on player ships
- `CENTAURIAN_FLEET` — spawn weights for alien enemies
- `ENEMY_CFGS` — faction-based enemy configurations
- `ASTEROID_SIZES` — small/medium/large radius, HP, damage

### Economy (economy.js)
- `economyState` — `{ [systemKey]: { [resourceId]: { stock, price, trend } } }`
- `RESOURCES` — master catalogue of 70 resources across 7 categories
- `LOCATION_PROFILES` — economic profiles for all planet/station types
- See `economy-reference.md` for full documentation

### Sprites (sprites/)
- `centaurianImgs` — object keyed by `"fighter"`, `"cruiser"`, `"frigate"`, `"capital"`
- `shipSprite` — player ship Image object
- `planetSprite`, `stationSprite` — environment Image objects

### Render Pipeline (render.js)
- Main loop: `tick()` handles update + draw in one pass
- Draw order: stars → asteroids → station → planet → enemies → player → bullets → particles → HUD
- Asteroid system uses pre-rendered offscreen canvases (`ASTEROID_VISUAL_DEFS`)
- Station sprite uses **`screen` blend mode** — black background PNG, no alpha needed
- Station renders at **200×200px** in all systems
- **Velocity arrow removed**
- **Retro thruster visuals removed** (data still in `player.js` for future use)

---

## Economy System

### Script Load Order (index.html)
```html
<script src="js/data.js"></script>
<script src="js/economy.js"></script>   ← must be after data.js, before engine.js
<script src="js/engine.js?v=2"></script>
```

### Initialisation (engine.js)
- `initAllEconomy()` called in `resetToFreshState()` — new pilots start with a fresh economy
- `loadSaveData()` restores `economyState` from save, or calls `initAllEconomy()` if no save exists
- `buildSaveData()` includes `economyState` so prices/stock persist between sessions

### Game Loop Hook (render.js)
- `tickEconomy()` called inside `tick()` just before dock detection
- Wrapped in guard: `if (typeof tickEconomy === 'function') tickEconomy();`

### Cargo Capacity
- `player.cargoCapacity` — set on `player` object in `engine.js` (default: 20)
- Also defined per ship in `SHIP_TYPES` in `data.js`: Shuttle=20, Fighter=10, Gunship=30

### Contraband Check (ui.js)
- `contrabandCheck()` called in `dockShip()` after station dock is confirmed
- Only fires at `military_station` profile locations — 70% detection chance
- On detection: cargo confiscated, fine = 150% base value, reputation −20 with faction

### Trading UI (ui.js)
- `renderTrading()` — full market screen, called from `hubOpen('trading')`
- Category tabs across the top, resource rows below, detail/buy-sell panel at bottom
- Click a row to select, use +1/−1/+5/−5/MAX qty buttons, then BUY or SELL
- MAX BUY calculates lowest of: credits available, cargo space, stock available
- Profit/loss per unit shown vs original buy price
- Contraband only visible at pirate world/station locations
- State vars: `_tradeCategory`, `_tradeSelected`, `_tradeQty`

### Key Economy Functions
| Function | Description |
|----------|-------------|
| `initAllEconomy()` | Bootstrap all 13 systems — call at game start |
| `tickEconomy()` | Called every frame from `tick()` in render.js |
| `getMarketListings()` | Returns sorted market array for current system |
| `buyResource(id, qty)` | Returns `{success, message, cost}` |
| `sellResource(id, qty)` | Returns `{success, message, earned, profit}` |
| `contrabandCheck()` | Run on dock at military stations |
| `getCargoCount()` | Total units in cargo hold |
| `trendIcon(trend)` | Returns ▲ / ▼ / – for UI |
| `trendClass(trend)` | Returns CSS class name for trend colour |

### System Profile Mapping
Defined in `getSystemProfileType()` in `economy.js`:

| System Key | Profile | System Name |
|------------|---------|-------------|
| `sol` | `trading_hub` | Alpha Centauri |
| `proxima` | `mining_world` | Proxima |
| `barnard` | `agricultural_world` | Barnard |
| `sirius` | `trading_hub` | Sirius |
| `luyten` | `colony_world` | Luyten |
| `ross` | `military_station` | Ross |
| `vega` | `pirate_world` | Vega |
| `altair` | `military_station` | Altair |
| `wolf` | `pirate_station` | Wolf |
| `epsilon` | `mining_station` | Epsilon |
| `kruger` | `refinery_station` | Kruger |
| `fomalhaut` | `trading_hub` | Fomalhaut |
| `deneb` | `pirate_world` | Deneb |

---

## Hub UI System (ui.js + index.html)

### Architecture
The dock screen is a full-screen overlay (`#stationscreen`) with three layers:
1. **Background image layer** (`#hub-bg`) — faction/location-specific background photo (base64 embedded in CSS)
2. **Header bar** — location name, faction, credits, hull bar, quick repair/refuel buttons
3. **Navigation bar** — service tabs + Galaxy Map + Main Menu + Launch
4. **Content area** — hub landing or one of five service panels

### Hub Screen Flow
```
enterDock() → hubOpen(null)           ← shows hub landing with service cards
hubOpen('hangar')                     ← opens Hangar panel
hubOpen('missions')                   ← opens Missions panel
hubOpen('trading')                    ← opens Trading market panel ✅ BUILT
hubOpen('shipyard')                   ← opens Shipyard stub
hubOpen('factions')                   ← opens Factions/reputation panel
```

### Navigation Structure
- **Header**: always visible — location name, credits, hull bar, ⚙ REPAIR +30 / ⚙ FULL REPAIR / ⛽ REFUEL buttons
- **Nav bar**: HANGAR · TRADING · MISSIONS · SHIPYARD | GALAXY MAP · MAIN MENU · ▶ LAUNCH
- **Hangar tab bar**: ← HUB · CARGO BAY · MODIFICATIONS
- **Back nav breadcrumb**: appears at top of every sub-panel

### Repair & Refuel
- Always accessible from the header
- `doRepair('small')` / `doRepair('full')` — costs vary by planet (80/280 Cr) vs station (50/200 Cr)
- `doRefuel()` — 30 Cr per jump, fills to `state.maxFuel`
- `updateHeaderRepairButtons()` — call after any state change to refresh button disabled states

### Hangar — Cargo Bay
- Ship status row (ship type, hull, shield, fuel, kills)
- Cargo hold inventory — reads from `state.cargo{}` (keyed by resourceId: `{quantity, pricePaid}`)
- Stored ships at this location with ⇄ BOARD SHIP button
- `swapToStoredShip(idx)` — stores current ship here, boards selected ship
- `state.storedShips[]` — array of `{shipType, hull, maxHull, shield, maxShield, speed, thrust, turnRate, damage, mods, locationKey}`

### Hangar — Modifications
- Left: ship card with top-down sprite (200×200 canvas, screen blend) + stat bars
- Right: flat list of 8 named module slots + 4 EXOTIC slots
- `player.mods{}` — keyed by slot ID
- `MOD_SLOTS[]` — slot definitions, `SLOT_ICONS{}` — symbol per slot

### Missions Panel
- Active mission at top, available missions listed below
- `completeMissionNow()` — awards pay, clears active mission
- `acceptMission(id)` — sets active mission

### Background Images
Base64-encoded JPEGs embedded in `<style>` block of `index.html`, darkened to ~30–35% brightness.

```python
import base64, re
from PIL import Image
import numpy as np
img = Image.open("new-bg.jpg").convert("RGB")
arr = np.array(img).astype(float) * 0.32
out = Image.fromarray(np.clip(arr,0,255).astype(np.uint8))
out.save("new-bg-dark.jpg", "JPEG", quality=80)
with open("new-bg-dark.jpg","rb") as f:
    b64 = base64.b64encode(f.read()).decode()
with open("index.html") as f:
    html = f.read()
html = re.sub(r"(#hub-panel-hangar \{[^}]*?url\('data:image/jpeg;base64,)[A-Za-z0-9+/=]+(')",
              lambda m: m.group(1) + b64 + m.group(2), html, flags=re.DOTALL)
with open("index.html","w") as f:
    f.write(html)
```

---

## Jump System (ui.js)

### In-Flight Jump Flow
1. Player opens Galaxy Map (`G` or `M` key), clicks destination
2. `plotRoute(destKey)` stores `_plottedRoute`, jump HUD appears
3. Player presses **⬡ JUMP** or `J` key → `executeJump()` → `triggerJumpEffect()`
4. BSG-style 3.1s jump effect, arrives via `initWorld(destKey, true)`

### Key Functions
- `plotRoute(destKey)` / `cancelPlottedRoute()` / `executeJump()`
- `triggerJumpEffect(destKey, jumps)` — full animation + world transition
- `doJumpTo(destKey, jumps)` — direct jump from dock
- `getJumpPath(fromKey, toKey)` — BFS pathfinding
- `getSystemJumpDistance(fromKey, toKey)` — returns jump count

---

## Galaxy Map (ui.js)

- `openGalaxyMap()` / `closeGalaxyMap()` / `toggleGalaxyMap()`
- `renderGalaxyMap()` — draws on `#galaxymapCanvas`
- Current system: green dot, reachable: blue, others: grey

---

## Common Edit Tasks

### Add a new star system
Edit `SYSTEMS` in `data.js`. Add key with `{name, x, y, faction, desc, neighbors[], hasShipyard?}`.
Also add the new key to `getSystemProfileType()` in `economy.js`.

### Fix a system's planet/station positions
Edit `FIXED_LAYOUTS` in `engine.js` inside `initWorld()`. Currently fixed: `sol`.

### Add a shipyard to a system
Add `hasShipyard: true` to the system in `data.js`.

### Change repair/refuel costs
Edit `doRepair()`, `doRefuel()`, `updateHeaderRepairButtons()` in `ui.js`.

### Add a module slot
Add to `MOD_SLOTS[]` in `ui.js`. Add icon to `SLOT_ICONS{}`.

### Tweak enemy stats
Edit `SHIP_TYPES` in `data.js`.

### Add a new mission type
Edit `render.js` around `// ── MISSION SYSTEM`.

### Add new sound effect
Edit `audio.js` — Web Audio API only, no external files.

### Change a system's economy profile
Edit `getSystemProfileType()` in `economy.js`. See `economy-reference.md` for profile types.

### Add a new tradeable resource
Add to `RESOURCES` in `economy.js`. Add the id to relevant `produces[]`/`consumes[]` arrays in `LOCATION_PROFILES`.

### Change cargo capacity per ship
Edit `cargoCapacity` in `SHIP_TYPES` in `data.js` and the default on `player` in `engine.js`.

---

## Ship Sprite System (player.js)

- `SHIP_B64` — base64 PNG (pure black background required)
- `SHIP_RENDER_H / SHIP_RENDER_W` — **80×80px**
- `NOZZLES[]` — engine nozzle positions for flame effects
- Screen blend mode (`globalCompositeOperation = "screen"`) eliminates black backgrounds — **PNG only**

### Replacing the Ship Sprite
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
Bump `?v=N` on the script tag in `index.html` after replacing.

---

### `dockShip()` must compute `stationHostile` locally
`stationHostile` is scoped inside `tick()` in `render.js` — not a global. Always compute in `ui.js`:
```js
const sysFac = SYSTEMS[systemKey].faction;
const sysRep = state.reputation[sysFac] || 0;
const stationHostile = !station.owned && sysRep <= REP_HOSTILE_THRESHOLD;
```

---

## Coding Conventions

- Vanilla JS — no imports, no modules, no bundler
- All scripts load globally via `<script src="...">` in `index.html`
- Canvas 2D context is `ctx`, canvas element is `gameCanvas`
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

- **Shipyard** — buy ships + modules; only at `hasShipyard: true` systems
- **Bullet spawn refactor** — iterate `player.equippedWeapons` instead of hardcoding wing ports
- **Nose cannon upgrade** — add `"forward_weapon"` to `player.equippedWeapons` via shipyard
- **Fixed layouts for other systems** — only `sol` fixed currently
- **Per-faction hub backgrounds** — different images per faction/system type
- **Module graphics** — small icons per module category for modification slots
- **NPC traders** — freighters flying trade routes, shifting stock at both ends
- **Market history** — price over time charts per resource
- **Trade licenses** — faction permissions for certain resource categories
- **Shortage missions** — low stock triggers special high-value delivery missions

---

## Save Data Notes

- Pilots stored in `localStorage` keyed by pilot name
- `state.storedShips[]` persists ship fleet across sessions
- `state.cargo{}` persists cargo hold — keyed by resourceId: `{quantity, pricePaid}`
- `economyState` persists per pilot — prices and stock levels saved on every dock/jump
- Players with saves pre-dating `FIXED_LAYOUTS` need to clear save once to get fixed positions
- Players with saves pre-dating economy system will get a fresh economy on next load

---

## Version History

### v0.21 — Economy System (fully integrated)
- Added `js/economy.js` — 70-resource dynamic trading economy across 7 categories
- Full trading UI built in `ui.js` — category tabs, resource rows, buy/sell with qty controls
- `initAllEconomy()` in `resetToFreshState()` and `loadSaveData()` in `engine.js`
- `tickEconomy()` hooked into `tick()` in `render.js`
- `economyState` saved in `buildSaveData()` and restored in `loadSaveData()`
- `contrabandCheck()` called in `dockShip()` in `ui.js`
- `cargoCapacity` added to player ships: Shuttle=20, Fighter=10, Gunship=30
- `cargo: {}` and `cargoCapacity: 20` added to `state` and `player` in `engine.js`
- Script load order: `data.js` → `economy.js` → `engine.js`

### v0.20
- Fixed Galaxy Map rendering — show overlay before drawing canvas.
- Launching always returns to flight screen and closes Galaxy Map.
- Out-of-range destinations cannot be plotted.
- Added `M` keyboard shortcut for Galaxy Map, `J` for jump execution.
- Docked navigation order updated — MAIN MENU far-right.
- Cache bust: `js/ui.js?v=11`, `js/input.js?v=2`.
