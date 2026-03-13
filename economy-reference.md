# The Final Frontier — Economy System Reference

> Paste alongside CLAUDE.md at the start of any new session when working on the economy.

---

## Overview

The economy is a dynamic supply/demand trading system. Each star system has an economic identity (planet or station type) that determines what resources it produces cheaply and what it needs at a premium. Prices fluctuate over time as stock levels change through consumption, production, random drift, and player trading. The player profits by buying low at surplus locations and selling high at deficit ones.

---

## File

**`js/economy.js`** — single self-contained file, vanilla JS, no imports/exports.
Load in `index.html` after `data.js` and before `ui.js`.

```html
<script src="js/data.js"></script>
<script src="js/economy.js"></script>
<script src="js/engine.js"></script>
```

---

## Resource Catalogue (70 resources across 7 categories)

### Raw Materials (10)
Iron Ore, Titanium Ore, Copper Ore, Rare Earth Metals, Silicate Rock, Raw Crystals, Gold Ore, Radioactive Ore, Raw Carbon, Exotic Matter

### Agricultural (10)
Grain, Protein Packs, Luxury Foods, Stimulants, Medicinal Herbs, Hydroponic Kits, Live Cultures, Algae Mass, Ration Packs, Exotic Spices

### Chemicals & Liquids (10)
Fuel Compound, Refined Water, Industrial Acid, Coolant Fluid, Noble Gas, Lubricants, Industrial Solvent, Reactive Agent, Liquid Oxygen, Polymer Base

### Manufactured Components (10)
Circuit Boards, Hull Plating, Mechanical Parts, Wiring Looms, Industrial Filters, Power Cells, Servo Motors, Optical Lenses, Pressure Valves, Alloy Sheets

### Consumer Goods (10)
Clothing, Entertainment, Furniture, Appliances, Luxury Goods, Basic Tools, Medical Supplies, Technical Manuals, Personal Tech, Hygiene Packs

### Advanced Technology (10)
AI Core, Navigation System, Medical Equipment, Scanner Array, Weapon Components, Shield Emitter, Jump Drive Coil, Sensor Suite, Fusion Cell, Holo Display

### Contraband — Black Market Only (7)
Narcotics, Illegal Weapons, Stolen Tech, Forged Documents, Smuggled Goods, Experimental Bioware, Pirate Intel

---

## Planet Types

| Type | Produces | Consumes |
|------|----------|----------|
| **Mining World** | Raw metals, ores, crystals | Food, consumer goods, medical, components |
| **Agricultural World** | Food, organics, medicines | Machinery, tech, fuel |
| **Industrial World** | Manufactured components, consumer goods | Raw materials, chemicals, food |
| **Tech World** | Advanced technology, AI, medical equipment | Rare earth, crystals, circuit boards |
| **Ocean / Gas World** | Liquids, gases, fuel, chemicals | Components, tech, food |
| **Colony / Frontier World** | Nothing (needs everything) | Food, tools, medicine, components |
| **Barren / Hostile World** | Exotic/rare ores only | Rations, fuel, medical |
| **Pirate World** | Contraband (black market) | Fuel, rations, weapons |

---

## Station Types

| Type | Produces | Consumes | Special |
|------|----------|----------|---------|
| **Shipyard Station** | Hull plating, parts | Metals, circuits, weapons | — |
| **Mining Station** | Raw ores, metals | Food, fuel, tools | — |
| **Refinery Station** | Alloys, polymers, chemicals | Raw ores | Mid-chain |
| **Trading Hub** | Everything at moderate levels | Everything at moderate levels | `isHub: true` |
| **Military Station** | Weapon components, sensors | Fuel, rations, medical | `isMilitary: true` — contraband checks |
| **Research Station** | AI, fusion cells, exotic matter | Rare earth, chemicals, food | — |
| **Pirate Station** | Contraband (black market) | Fuel, weapons, parts | `blackMarket: true` |
| **Luxury Resort Station** | Luxury goods, entertainment | Luxury food, consumer goods, personal tech | — |
| **Fuel Depot** | Fuel, gases, coolant | Food, tools | — |

---

## Supply Chain Flow

```
Mining World / Station
        ↓ raw metals, ores
Refinery Station
        ↓ alloys, polymers, chemicals
Industrial World
        ↓ manufactured components, consumer goods
Tech World / Shipyard
        ↓ advanced technology, ship parts
Colony Worlds, Military Stations, Research Stations

Agricultural World → Food → everywhere
Ocean / Gas World → Chemicals, Fuel → everywhere
Pirate World / Station → Contraband → black market routes only
```

---

## Price Engine

### Stock Scale
- Each resource at each location has a **stock level: 0–100**
- 0 = completely depleted, 100 = fully stocked

### Starting Stock
- **Produced resources**: start at 65–95 (high supply, cheap)
- **Consumed resources**: start at 5–35 (low supply, expensive)
- **Trading Hub resources**: start at 35–65 (moderate)
- **Unstocked resources**: not available at that location

### Price Formula
Price is calculated from stock level using an inverse supply curve:

```
norm = stock / 100
mult = PRICE_MULT_MAX − (PRICE_MULT_MAX − PRICE_MULT_MIN) × norm

PRICE_MULT_MIN = 0.4   (40% of base price at full stock)
PRICE_MULT_MAX = 2.5   (250% of base price at zero stock)

finalPrice = round(basePrice × mult)
```

### Stock Change Over Time (every 300 ticks ≈ 5 seconds)
- **Produced** resources: stock +0.03 per tick (replenish)
- **Consumed** resources: stock −0.02 per tick (deplete)
- **All resources**: random drift ±0.01 per tick (economic noise)
- Player buying reduces stock → price rises
- Player selling increases stock → price falls

### Trend Indicators
Each resource tracks whether its price is **▲ rising**, **▼ falling**, or **– stable** since last update.

---

## Black Market

- Contraband resources only appear at locations with `blackMarket: true`
- Currently: `pirate_world` and `pirate_station`
- Contraband is hidden from all other market listings
- **Contraband check** triggers on docking at `military_station`:
  - 70% detection chance if contraband in cargo
  - On detection: cargo confiscated, fine = 150% of base value per unit
  - Faction reputation −20 with the station's governing faction

---

## Global Variables & State

```js
economyState          // { [systemKey]: { [resourceId]: { stock, price, trend } } }
RESOURCES             // master resource catalogue
LOCATION_PROFILES     // economic profiles per planet/station type
```

Economy persists in `economyState` during a session. For save/load, serialize `economyState` into `localStorage` alongside the pilot save.

---

## Key Functions

| Function | Description |
|----------|-------------|
| `initAllEconomy()` | Bootstrap — call once at game start from `engine.js` |
| `initSystemEconomy(sysKey, profType)` | Initialise a single system's economy |
| `tickEconomy()` | Called every frame from `update()` in `render.js` |
| `getMarketListings()` | Returns sorted market array for current system |
| `buyResource(id, qty)` | Execute a purchase, returns `{success, message, cost}` |
| `sellResource(id, qty)` | Execute a sale, returns `{success, message, earned, profit}` |
| `contrabandCheck()` | Run on dock at military stations, returns `{caught, fine, cargoLost}` |
| `calcPrice(id, stock)` | Calculate price from stock level |
| `getCargoCount()` | Returns total units currently in cargo |
| `trendIcon(trend)` | Returns ▲ / ▼ / – string for UI |
| `trendClass(trend)` | Returns CSS class name for trend colour |
| `getSystemProfileType(sysKey)` | Maps systemKey → LOCATION_PROFILES key |

---

## Integration Checklist

### 1. Add to index.html
```html
<script src="js/economy.js"></script>
<!-- Load after data.js, before engine.js -->
```

### 2. Call initAllEconomy() at game start
In `engine.js`, wherever the game initialises (e.g. `loadPilot()` or `newGame()`):
```js
initAllEconomy();
```

### 3. Hook tickEconomy() into the game loop
At the bottom of `update()` in `render.js`:
```js
if (typeof tickEconomy === 'function') tickEconomy();
```

### 4. Call contrabandCheck() on dock
In `dockShip()` in `ui.js`, after dock is confirmed:
```js
const check = contrabandCheck();
if (check.caught) {
  showToast(`CONTRABAND SEIZED — Fined ${check.fine} Cr`);
}
```

### 5. Wire up the Trading panel
In `hubOpen('trading')` in `ui.js`, call `getMarketListings()` to populate the UI.
Use `buyResource(id, qty)` and `sellResource(id, qty)` for buy/sell buttons.

### 6. Map your systems
Edit `getSystemProfileType()` in `economy.js` to assign each of your 13 SYSTEMS keys to a profile type.

### 7. Add cargo capacity to player
The economy expects `player.cargoCapacity` (integer, units). Add to `SHIP_TYPES` in `data.js`:
```js
cargoCapacity: 20  // default starter ship
```

### 8. Save/load economy state
Add to pilot save in `engine.js`:
```js
// Saving
save.economyState = JSON.parse(JSON.stringify(economyState));

// Loading
if (save.economyState) economyState = save.economyState;
else initAllEconomy();
```

---

## System Profile Mapping (13 Systems)

Edit `getSystemProfileType()` in `economy.js` to confirm or adjust these assignments:

| System Key | Suggested Profile | Rationale |
|------------|------------------|-----------|
| `sol` | `trading_hub` | Alpha Centauri — central crossroads |
| `vega` | `industrial_world` | Heavy manufacturing |
| `sirius` | `tech_world` | Advanced research and production |
| `proxima` | `mining_world` | Resource extraction |
| `barnard` | `agricultural_world` | Farming colony |
| `wolf` | `colony_world` | Frontier settlement — needs everything |
| `lalande` | `refinery_station` | Mid-chain processing |
| `ross` | `military_station` | Fleet base |
| `61cygni` | `research_station` | Science outpost |
| `epsilon` | `mining_station` | Asteroid mining |
| `tau` | `pirate_world` | Lawless black market |
| `delta` | `luxury_station` | Wealthy resort |
| `rigel` | `barren_world` | Exotic ore source |

---

## Planned Enhancements (Not Yet Built)

- NPC freighters flying trade routes (shifts stock at both ends automatically)
- Market history charts (price over time per resource)
- Player reputation affecting buy/sell prices at faction stations
- Cargo insurance against pirate attack
- Trade licenses required for certain resource categories
- Per-faction import/export restrictions
- Shortages triggering special high-value delivery missions
