# The Final Frontier — Economy System Reference

> Paste alongside CLAUDE.md at the start of any new session when working on the economy or trading UI.

---

## Overview

The economy is a dynamic supply/demand trading system. Each star system has an economic identity (planet or station type) that determines what resources it produces cheaply and what it needs at a premium. Prices fluctuate over time as stock levels change through consumption, production, random drift, and player trading. The player profits by buying low at surplus locations and selling high at deficit ones.

---

## File

**`js/economy.js`** — single self-contained file, vanilla JS, no imports/exports.

### Script Load Order
```html
<script src="js/data.js"></script>
<script src="js/economy.js"></script>   ← after data.js, before engine.js
<script src="js/engine.js?v=2"></script>
```

---

## Integration Status — ALL COMPLETE ✅

| Step | Description | File | Status |
|------|-------------|------|--------|
| 1 | Add `economy.js` script tag | `index.html` | ✅ Done |
| 2 | Call `initAllEconomy()` at game start | `engine.js` | ✅ Done |
| 3 | Hook `tickEconomy()` into game loop | `render.js` | ✅ Done |
| 4 | Add `cargoCapacity` to ships and player | `data.js` / `engine.js` | ✅ Done |
| 5 | Call `contrabandCheck()` on dock | `ui.js` | ✅ Done |
| 6 | System profile mappings confirmed | `economy.js` | ✅ Done |
| 7 | Trading UI panel built | `ui.js` | ✅ Done |
| 8 | Economy save/load | `engine.js` | ✅ Done |

---

## Resource Catalogue — 70 Resources across 7 Categories

### Raw Materials (10)
| ID | Name | Base Price |
|----|------|-----------|
| `iron_ore` | Iron Ore | 40 Cr |
| `titanium_ore` | Titanium Ore | 90 Cr |
| `copper_ore` | Copper Ore | 55 Cr |
| `rare_earth` | Rare Earth Metals | 180 Cr |
| `silicate` | Silicate Rock | 25 Cr |
| `crystals` | Raw Crystals | 120 Cr |
| `gold_ore` | Gold Ore | 210 Cr |
| `radioactive` | Radioactive Ore | 160 Cr |
| `carbon_raw` | Raw Carbon | 30 Cr |
| `exotic_matter` | Exotic Matter | 500 Cr |

### Agricultural (10)
| ID | Name | Base Price |
|----|------|-----------|
| `grain` | Grain | 30 Cr |
| `protein_pack` | Protein Packs | 55 Cr |
| `luxury_food` | Luxury Foods | 140 Cr |
| `stimulants` | Stimulants | 90 Cr |
| `med_herbs` | Medicinal Herbs | 75 Cr |
| `hydroponic_kit` | Hydroponic Kits | 110 Cr |
| `live_cultures` | Live Cultures | 95 Cr |
| `algae_mass` | Algae Mass | 20 Cr |
| `ration_packs` | Ration Packs | 45 Cr |
| `spices` | Exotic Spices | 170 Cr |

### Chemicals & Liquids (10)
| ID | Name | Base Price |
|----|------|-----------|
| `fuel_compound` | Fuel Compound | 60 Cr |
| `water_refined` | Refined Water | 20 Cr |
| `industrial_acid` | Industrial Acid | 80 Cr |
| `coolant` | Coolant Fluid | 65 Cr |
| `noble_gas` | Noble Gas | 100 Cr |
| `lubricants` | Lubricants | 50 Cr |
| `solvent` | Industrial Solvent | 70 Cr |
| `reactive_agent` | Reactive Agent | 130 Cr |
| `liquid_oxygen` | Liquid Oxygen | 85 Cr |
| `polymer_base` | Polymer Base | 55 Cr |

### Manufactured Components (10)
| ID | Name | Base Price |
|----|------|-----------|
| `circuit_board` | Circuit Boards | 150 Cr |
| `hull_plating` | Hull Plating | 200 Cr |
| `mech_parts` | Mechanical Parts | 120 Cr |
| `wiring_loom` | Wiring Looms | 90 Cr |
| `filters` | Industrial Filters | 70 Cr |
| `power_cells` | Power Cells | 110 Cr |
| `servo_motors` | Servo Motors | 135 Cr |
| `optical_lens` | Optical Lenses | 160 Cr |
| `pressure_valve` | Pressure Valves | 85 Cr |
| `alloy_sheets` | Alloy Sheets | 175 Cr |

### Consumer Goods (10)
| ID | Name | Base Price |
|----|------|-----------|
| `clothing` | Clothing | 80 Cr |
| `entertainment` | Entertainment | 100 Cr |
| `furniture` | Furniture | 120 Cr |
| `appliances` | Appliances | 150 Cr |
| `luxury_goods` | Luxury Goods | 300 Cr |
| `tools_basic` | Basic Tools | 65 Cr |
| `med_supplies` | Medical Supplies | 140 Cr |
| `textbooks` | Technical Manuals | 90 Cr |
| `personal_tech` | Personal Tech | 200 Cr |
| `hygiene_packs` | Hygiene Packs | 40 Cr |

### Advanced Technology (10)
| ID | Name | Base Price |
|----|------|-----------|
| `ai_core` | AI Core | 800 Cr |
| `nav_system` | Navigation System | 500 Cr |
| `med_equipment` | Medical Equipment | 400 Cr |
| `scanner_array` | Scanner Array | 350 Cr |
| `weapon_comp` | Weapon Components | 450 Cr |
| `shield_emitter` | Shield Emitter | 600 Cr |
| `jump_coil` | Jump Drive Coil | 700 Cr |
| `sensor_suite` | Sensor Suite | 380 Cr |
| `fusion_cell` | Fusion Cell | 550 Cr |
| `holo_display` | Holo Display | 320 Cr |

### Contraband — Black Market Only (7)
| ID | Name | Base Price |
|----|------|-----------|
| `narcotics` | Narcotics | 400 Cr |
| `illegal_weapons` | Illegal Weapons | 600 Cr |
| `stolen_tech` | Stolen Tech | 750 Cr |
| `forged_docs` | Forged Documents | 300 Cr |
| `smuggled_goods` | Smuggled Goods | 250 Cr |
| `exp_bioware` | Experimental Bioware | 900 Cr |
| `pirate_intel` | Pirate Intel | 500 Cr |

---

## Planet & Station Types

### Planet Types

| Type | Produces | Consumes | Black Market |
|------|----------|----------|-------------|
| `mining_world` | Raw metals, ores, crystals | Food, consumer goods, medical, components | No |
| `agricultural_world` | Food, organics, medicines | Machinery, tech, fuel | No |
| `industrial_world` | Manufactured components, consumer goods | Raw materials, chemicals, food | No |
| `tech_world` | Advanced technology, AI, medical equipment | Rare earth, crystals, circuit boards | No |
| `ocean_world` | Liquids, gases, fuel, chemicals | Components, tech, food | No |
| `colony_world` | Nothing — needs everything | Food, tools, medicine, components | No |
| `barren_world` | Exotic/rare ores only | Rations, fuel, medical | No |
| `pirate_world` | Contraband | Fuel, rations, weapons | ✅ Yes |

### Station Types

| Type | Produces | Consumes | Special |
|------|----------|----------|---------|
| `shipyard_station` | Hull plating, parts | Metals, circuits, weapons | — |
| `mining_station` | Raw ores, metals | Food, fuel, tools | — |
| `refinery_station` | Alloys, polymers, chemicals | Raw ores | Mid supply chain |
| `trading_hub` | Everything moderate | Everything moderate | `isHub: true` |
| `military_station` | Weapon components, sensors | Fuel, rations, medical | `isMilitary: true` — contraband checks |
| `research_station` | AI, fusion cells, exotic matter | Rare earth, chemicals, food | — |
| `pirate_station` | Contraband | Fuel, weapons, parts | `blackMarket: true` |
| `luxury_station` | Luxury goods, entertainment | Luxury food, consumer goods | — |
| `fuel_depot` | Fuel, gases, coolant | Food, tools | — |

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

Agricultural World  → Food        → everywhere
Ocean / Gas World   → Chemicals, Fuel → everywhere
Pirate World/Station → Contraband → black market routes only
```

---

## Price Engine

### Stock Scale
- Each resource has a **stock level: 0–100**
- 0 = completely depleted, 100 = fully stocked

### Starting Stock
| Condition | Starting Stock | Effect |
|-----------|---------------|--------|
| Produced resource | 65–95 | High supply, cheap |
| Consumed resource | 5–35 | Low supply, expensive |
| Trading Hub | 35–65 | Moderate |
| Not produced/consumed | Not stocked | Not available |

### Price Formula
```
norm = stock / 100
mult = 2.5 − (2.5 − 0.4) × norm

Stock = 0   → price = basePrice × 2.5   (250% — severe shortage)
Stock = 50  → price ≈ basePrice × 1.45
Stock = 100 → price = basePrice × 0.4   (40% — oversupply)

finalPrice = round(basePrice × mult)
```

### Stock Changes (every 300 ticks ≈ 5 seconds at 60fps)
| Event | Effect |
|-------|--------|
| Produced resource tick | stock +0.03 per tick |
| Consumed resource tick | stock −0.02 per tick |
| Random economic drift | stock ±0.01 per tick |
| Player buys N units | stock −N, price recalculated immediately |
| Player sells N units | stock +N, price recalculated immediately |

### Trend Indicators
▲ rising &nbsp;·&nbsp; ▼ falling &nbsp;·&nbsp; – stable

---

## System Profile Mapping (13 Systems)

| System Key | Profile | System Name | Faction |
|------------|---------|-------------|---------|
| `sol` | `trading_hub` | Alpha Centauri | Federation |
| `proxima` | `mining_world` | Proxima | Federation |
| `barnard` | `agricultural_world` | Barnard | Federation |
| `sirius` | `trading_hub` | Sirius | Federation |
| `luyten` | `colony_world` | Luyten | Rebel |
| `ross` | `military_station` | Ross | Rebel |
| `vega` | `pirate_world` | Vega | Pirate |
| `altair` | `military_station` | Altair | Federation |
| `wolf` | `pirate_station` | Wolf | Pirate |
| `epsilon` | `mining_station` | Epsilon | Rebel |
| `kruger` | `refinery_station` | Kruger | Neutral |
| `fomalhaut` | `trading_hub` | Fomalhaut | Neutral |
| `deneb` | `pirate_world` | Deneb | Pirate |

---

## Black Market

- Contraband only at `blackMarket: true` locations: `pirate_world`, `pirate_station`
- Hidden from all other market listings automatically
- **Contraband check on dock** at `military_station`:
  - 70% detection chance if contraband in cargo
  - All contraband confiscated
  - Fine = 150% of base value per unit
  - Faction reputation −20

---

## Trading UI (ui.js)

### State Variables
```js
_tradeCategory   // active category filter: 'all' | category id
_tradeSelected   // selected resourceId or null
_tradeQty        // current buy/sell quantity (default 1)
```

### Functions
| Function | Description |
|----------|-------------|
| `renderTrading()` | Renders full market panel — called by `hubOpen('trading')` |
| `tradingAdjQty(delta)` | Adjusts qty by delta, clamped to valid range |
| `tradingSetMax(max)` | Sets qty to MAX BUY value |
| `updateTradeCosts()` | Refreshes buy/sell cost display |
| `tradingBuy()` | Executes buy via `buyResource()`, refreshes panel |
| `tradingSell()` | Executes sell via `sellResource()`, shows profit/loss |

### MAX BUY Calculation
```js
canBuyMax = Math.min(
  Math.floor(state.credits / price),   // affordability
  cargoMax - cargoCount,                // available cargo space
  Math.floor(stock)                     // available stock
)
```

---

## Economy API Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `initAllEconomy()` | void | Bootstrap all systems |
| `initSystemEconomy(sysKey, profType)` | void | Init one system |
| `tickEconomy()` | void | Called each frame |
| `getMarketListings()` | Array | Market data for current system |
| `buyResource(id, qty)` | `{success, message, cost}` | Execute purchase |
| `sellResource(id, qty)` | `{success, message, earned, profit}` | Execute sale |
| `contrabandCheck()` | `{caught, fine, cargoLost[]}` | Contraband detection |
| `calcPrice(id, stock)` | number | Price from stock level |
| `getCargoCount()` | number | Total cargo units held |
| `trendIcon(trend)` | string | ▲ / ▼ / – |
| `trendClass(trend)` | string | CSS class name |
| `getSystemProfileType(sysKey)` | string | Profile key for system |

### getMarketListings() return shape
```js
{
  resourceId,   // e.g. 'grain'
  name,         // e.g. 'Grain'
  category,     // e.g. 'agricultural'
  price,        // current price in Cr
  stock,        // 0–100
  trend,        // -1 | 0 | 1
  cargoQty,     // units in player cargo
  pricePaid,    // avg buy price (null if not held)
  contraband    // true | false
}
```

---

## Save / Load

```js
// buildSaveData() in engine.js
{
  systemKey,
  player: { ... },
  state: { ..., cargo: { resourceId: { quantity, pricePaid } } },
  economyState: { [systemKey]: { [resourceId]: { stock, price, trend } } }
}

// loadSaveData() in engine.js
if (data.economyState) economyState = data.economyState;
else initAllEconomy();
```

---

## Planned Enhancements

- NPC freighters flying trade routes (shifts stock at both ends automatically)
- Market history charts (price over time per resource)
- Player reputation affecting buy/sell prices at faction stations
- Trade licenses required for certain resource categories
- Shortage missions — low stock triggers special high-value delivery contracts
- Per-faction import/export restrictions
