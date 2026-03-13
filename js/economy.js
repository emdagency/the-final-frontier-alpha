// economy.js — The Final Frontier
// Dynamic trading economy: resources, supply/demand, price fluctuation, black market
// Load order: after data.js, before ui.js
// All globals, no imports/exports — vanilla JS

// ─────────────────────────────────────────────
// RESOURCE CATALOGUE
// Each resource: { id, name, category, basePrice, unit, contraband? }
// basePrice = galactic baseline in credits
// ─────────────────────────────────────────────

const RESOURCE_CATEGORIES = [
  'raw_materials',
  'agricultural',
  'chemicals',
  'manufactured',
  'consumer_goods',
  'advanced_tech',
  'contraband'
];

const RESOURCES = {

  // ── RAW MATERIALS ───────────────────────────
  iron_ore:       { id: 'iron_ore',       name: 'Iron Ore',         category: 'raw_materials',  basePrice: 40  },
  titanium_ore:   { id: 'titanium_ore',   name: 'Titanium Ore',     category: 'raw_materials',  basePrice: 90  },
  copper_ore:     { id: 'copper_ore',     name: 'Copper Ore',       category: 'raw_materials',  basePrice: 55  },
  rare_earth:     { id: 'rare_earth',     name: 'Rare Earth Metals',category: 'raw_materials',  basePrice: 180 },
  silicate:       { id: 'silicate',       name: 'Silicate Rock',    category: 'raw_materials',  basePrice: 25  },
  crystals:       { id: 'crystals',       name: 'Raw Crystals',     category: 'raw_materials',  basePrice: 120 },
  gold_ore:       { id: 'gold_ore',       name: 'Gold Ore',         category: 'raw_materials',  basePrice: 210 },
  radioactive:    { id: 'radioactive',    name: 'Radioactive Ore',  category: 'raw_materials',  basePrice: 160 },
  carbon_raw:     { id: 'carbon_raw',     name: 'Raw Carbon',       category: 'raw_materials',  basePrice: 30  },
  exotic_matter:  { id: 'exotic_matter',  name: 'Exotic Matter',    category: 'raw_materials',  basePrice: 500 },

  // ── AGRICULTURAL ───────────────────────────
  grain:          { id: 'grain',          name: 'Grain',            category: 'agricultural',   basePrice: 30  },
  protein_pack:   { id: 'protein_pack',   name: 'Protein Packs',    category: 'agricultural',   basePrice: 55  },
  luxury_food:    { id: 'luxury_food',    name: 'Luxury Foods',     category: 'agricultural',   basePrice: 140 },
  stimulants:     { id: 'stimulants',     name: 'Stimulants',       category: 'agricultural',   basePrice: 90  },
  med_herbs:      { id: 'med_herbs',      name: 'Medicinal Herbs',  category: 'agricultural',   basePrice: 75  },
  hydroponic_kit: { id: 'hydroponic_kit', name: 'Hydroponic Kits',  category: 'agricultural',   basePrice: 110 },
  live_cultures:  { id: 'live_cultures',  name: 'Live Cultures',    category: 'agricultural',   basePrice: 95  },
  algae_mass:     { id: 'algae_mass',     name: 'Algae Mass',       category: 'agricultural',   basePrice: 20  },
  ration_packs:   { id: 'ration_packs',   name: 'Ration Packs',     category: 'agricultural',   basePrice: 45  },
  spices:         { id: 'spices',         name: 'Exotic Spices',    category: 'agricultural',   basePrice: 170 },

  // ── CHEMICALS & LIQUIDS ─────────────────────
  fuel_compound:  { id: 'fuel_compound',  name: 'Fuel Compound',    category: 'chemicals',      basePrice: 60  },
  water_refined:  { id: 'water_refined',  name: 'Refined Water',    category: 'chemicals',      basePrice: 20  },
  industrial_acid:{ id: 'industrial_acid',name: 'Industrial Acid',  category: 'chemicals',      basePrice: 80  },
  coolant:        { id: 'coolant',        name: 'Coolant Fluid',    category: 'chemicals',      basePrice: 65  },
  noble_gas:      { id: 'noble_gas',      name: 'Noble Gas',        category: 'chemicals',      basePrice: 100 },
  lubricants:     { id: 'lubricants',     name: 'Lubricants',       category: 'chemicals',      basePrice: 50  },
  solvent:        { id: 'solvent',        name: 'Industrial Solvent',category: 'chemicals',     basePrice: 70  },
  reactive_agent: { id: 'reactive_agent', name: 'Reactive Agent',   category: 'chemicals',      basePrice: 130 },
  liquid_oxygen:  { id: 'liquid_oxygen',  name: 'Liquid Oxygen',    category: 'chemicals',      basePrice: 85  },
  polymer_base:   { id: 'polymer_base',   name: 'Polymer Base',     category: 'chemicals',      basePrice: 55  },

  // ── MANUFACTURED COMPONENTS ─────────────────
  circuit_board:  { id: 'circuit_board',  name: 'Circuit Boards',   category: 'manufactured',   basePrice: 150 },
  hull_plating:   { id: 'hull_plating',   name: 'Hull Plating',     category: 'manufactured',   basePrice: 200 },
  mech_parts:     { id: 'mech_parts',     name: 'Mechanical Parts', category: 'manufactured',   basePrice: 120 },
  wiring_loom:    { id: 'wiring_loom',    name: 'Wiring Looms',     category: 'manufactured',   basePrice: 90  },
  filters:        { id: 'filters',        name: 'Industrial Filters',category: 'manufactured',  basePrice: 70  },
  power_cells:    { id: 'power_cells',    name: 'Power Cells',      category: 'manufactured',   basePrice: 110 },
  servo_motors:   { id: 'servo_motors',   name: 'Servo Motors',     category: 'manufactured',   basePrice: 135 },
  optical_lens:   { id: 'optical_lens',   name: 'Optical Lenses',   category: 'manufactured',   basePrice: 160 },
  pressure_valve: { id: 'pressure_valve', name: 'Pressure Valves',  category: 'manufactured',   basePrice: 85  },
  alloy_sheets:   { id: 'alloy_sheets',   name: 'Alloy Sheets',     category: 'manufactured',   basePrice: 175 },

  // ── CONSUMER GOODS ──────────────────────────
  clothing:       { id: 'clothing',       name: 'Clothing',         category: 'consumer_goods', basePrice: 80  },
  entertainment:  { id: 'entertainment',  name: 'Entertainment',    category: 'consumer_goods', basePrice: 100 },
  furniture:      { id: 'furniture',      name: 'Furniture',        category: 'consumer_goods', basePrice: 120 },
  appliances:     { id: 'appliances',     name: 'Appliances',       category: 'consumer_goods', basePrice: 150 },
  luxury_goods:   { id: 'luxury_goods',   name: 'Luxury Goods',     category: 'consumer_goods', basePrice: 300 },
  tools_basic:    { id: 'tools_basic',    name: 'Basic Tools',      category: 'consumer_goods', basePrice: 65  },
  med_supplies:   { id: 'med_supplies',   name: 'Medical Supplies', category: 'consumer_goods', basePrice: 140 },
  textbooks:      { id: 'textbooks',      name: 'Technical Manuals',category: 'consumer_goods', basePrice: 90  },
  personal_tech:  { id: 'personal_tech',  name: 'Personal Tech',    category: 'consumer_goods', basePrice: 200 },
  hygiene_packs:  { id: 'hygiene_packs',  name: 'Hygiene Packs',    category: 'consumer_goods', basePrice: 40  },

  // ── ADVANCED TECHNOLOGY ─────────────────────
  ai_core:        { id: 'ai_core',        name: 'AI Core',          category: 'advanced_tech',  basePrice: 800 },
  nav_system:     { id: 'nav_system',     name: 'Navigation System',category: 'advanced_tech',  basePrice: 500 },
  med_equipment:  { id: 'med_equipment',  name: 'Medical Equipment',category: 'advanced_tech',  basePrice: 400 },
  scanner_array:  { id: 'scanner_array',  name: 'Scanner Array',    category: 'advanced_tech',  basePrice: 350 },
  weapon_comp:    { id: 'weapon_comp',    name: 'Weapon Components',category: 'advanced_tech',  basePrice: 450 },
  shield_emitter: { id: 'shield_emitter', name: 'Shield Emitter',   category: 'advanced_tech',  basePrice: 600 },
  jump_coil:      { id: 'jump_coil',      name: 'Jump Drive Coil',  category: 'advanced_tech',  basePrice: 700 },
  sensor_suite:   { id: 'sensor_suite',   name: 'Sensor Suite',     category: 'advanced_tech',  basePrice: 380 },
  fusion_cell:    { id: 'fusion_cell',    name: 'Fusion Cell',      category: 'advanced_tech',  basePrice: 550 },
  holo_display:   { id: 'holo_display',   name: 'Holo Display',     category: 'advanced_tech',  basePrice: 320 },

  // ── CONTRABAND (black market only) ──────────
  narcotics:      { id: 'narcotics',      name: 'Narcotics',        category: 'contraband',     basePrice: 400,  contraband: true },
  illegal_weapons:{ id: 'illegal_weapons',name: 'Illegal Weapons',  category: 'contraband',     basePrice: 600,  contraband: true },
  stolen_tech:    { id: 'stolen_tech',    name: 'Stolen Tech',      category: 'contraband',     basePrice: 750,  contraband: true },
  forged_docs:    { id: 'forged_docs',    name: 'Forged Documents', category: 'contraband',     basePrice: 300,  contraband: true },
  smuggled_goods: { id: 'smuggled_goods', name: 'Smuggled Goods',   category: 'contraband',     basePrice: 250,  contraband: true },
  exp_bioware:    { id: 'exp_bioware',    name: 'Experimental Bioware', category: 'contraband', basePrice: 900,  contraband: true },
  pirate_intel:   { id: 'pirate_intel',   name: 'Pirate Intel',     category: 'contraband',     basePrice: 500,  contraband: true },
};

// ─────────────────────────────────────────────
// PLANET & STATION ECONOMIC PROFILES
// Each profile: { produces[], consumes[], blackMarket? }
// produces = resources this location generates (sells cheaply)
// consumes = resources this location needs (buys/sells at premium)
// ─────────────────────────────────────────────

const LOCATION_PROFILES = {

  // ── PLANET TYPES ────────────────────────────
  mining_world: {
    label: 'Mining World',
    produces: ['iron_ore','titanium_ore','copper_ore','silicate','carbon_raw','crystals','gold_ore','radioactive'],
    consumes: ['grain','ration_packs','med_supplies','mech_parts','circuit_board','clothing','tools_basic','fuel_compound'],
    blackMarket: false
  },
  agricultural_world: {
    label: 'Agricultural World',
    produces: ['grain','protein_pack','luxury_food','stimulants','med_herbs','hydroponic_kit','algae_mass','ration_packs','spices'],
    consumes: ['mech_parts','circuit_board','fuel_compound','alloy_sheets','power_cells','tools_basic','personal_tech','appliances'],
    blackMarket: false
  },
  industrial_world: {
    label: 'Industrial World',
    produces: ['circuit_board','hull_plating','mech_parts','wiring_loom','filters','servo_motors','alloy_sheets','pressure_valve','power_cells'],
    consumes: ['iron_ore','titanium_ore','copper_ore','fuel_compound','industrial_acid','grain','ration_packs','polymer_base'],
    blackMarket: false
  },
  tech_world: {
    label: 'Tech World',
    produces: ['ai_core','nav_system','med_equipment','scanner_array','shield_emitter','jump_coil','sensor_suite','fusion_cell','holo_display','weapon_comp'],
    consumes: ['rare_earth','crystals','exotic_matter','circuit_board','optical_lens','grain','luxury_food','noble_gas'],
    blackMarket: false
  },
  ocean_world: {
    label: 'Ocean / Gas World',
    produces: ['water_refined','liquid_oxygen','noble_gas','fuel_compound','algae_mass','reactive_agent','live_cultures'],
    consumes: ['mech_parts','circuit_board','med_supplies','clothing','food_packs','tools_basic','personal_tech'],
    blackMarket: false
  },
  colony_world: {
    label: 'Colony / Frontier World',
    produces: [],
    consumes: ['grain','ration_packs','med_supplies','tools_basic','clothing','fuel_compound','mech_parts','circuit_board','power_cells','hygiene_packs'],
    blackMarket: false
  },
  barren_world: {
    label: 'Barren / Hostile World',
    produces: ['exotic_matter','rare_earth','radioactive','crystals','gold_ore'],
    consumes: ['ration_packs','fuel_compound','med_supplies','tools_basic','coolant'],
    blackMarket: false
  },
  pirate_world: {
    label: 'Pirate World',
    produces: ['narcotics','illegal_weapons','stolen_tech','forged_docs','smuggled_goods','exp_bioware','pirate_intel'],
    consumes: ['fuel_compound','ration_packs','weapon_comp','power_cells','med_supplies'],
    blackMarket: true
  },

  // ── STATION TYPES ───────────────────────────
  shipyard_station: {
    label: 'Shipyard Station',
    produces: ['hull_plating','alloy_sheets','mech_parts','pressure_valve','wiring_loom'],
    consumes: ['iron_ore','titanium_ore','circuit_board','servo_motors','optical_lens','alloy_sheets','power_cells','weapon_comp'],
    blackMarket: false
  },
  mining_station: {
    label: 'Mining Station',
    produces: ['iron_ore','titanium_ore','copper_ore','silicate','carbon_raw','gold_ore'],
    consumes: ['grain','ration_packs','fuel_compound','med_supplies','tools_basic','mech_parts'],
    blackMarket: false
  },
  refinery_station: {
    label: 'Refinery Station',
    produces: ['alloy_sheets','polymer_base','industrial_acid','lubricants','solvent','fuel_compound','reactive_agent'],
    consumes: ['iron_ore','copper_ore','carbon_raw','silicate','radioactive','liquid_oxygen'],
    blackMarket: false
  },
  trading_hub: {
    label: 'Trading Hub',
    produces: [],   // carries everything at middling prices — handled by wide stock levels
    consumes: [],
    blackMarket: false,
    isHub: true     // special flag: stocks all non-contraband resources at moderate levels
  },
  military_station: {
    label: 'Military Station',
    produces: ['weapon_comp','scanner_array','sensor_suite'],
    consumes: ['fuel_compound','ration_packs','med_supplies','med_equipment','weapon_comp','power_cells','hull_plating'],
    blackMarket: false,
    isMilitary: true  // contraband confiscated on dock
  },
  research_station: {
    label: 'Research Station',
    produces: ['ai_core','fusion_cell','exotic_matter','holo_display','scanner_array','med_equipment'],
    consumes: ['rare_earth','crystals','noble_gas','reactive_agent','grain','live_cultures'],
    blackMarket: false
  },
  pirate_station: {
    label: 'Pirate Station',
    produces: ['narcotics','illegal_weapons','stolen_tech','forged_docs','smuggled_goods','pirate_intel'],
    consumes: ['fuel_compound','ration_packs','weapon_comp','med_supplies','power_cells','circuit_board'],
    blackMarket: true
  },
  luxury_station: {
    label: 'Luxury Resort Station',
    produces: ['luxury_goods','entertainment','luxury_food','spices'],
    consumes: ['luxury_food','spices','clothing','entertainment','furniture','appliances','personal_tech','holo_display'],
    blackMarket: false
  },
  fuel_depot: {
    label: 'Fuel Depot',
    produces: ['fuel_compound','liquid_oxygen','coolant','noble_gas'],
    consumes: ['grain','ration_packs','med_supplies','tools_basic'],
    blackMarket: false
  },
};

// ─────────────────────────────────────────────
// ECONOMY STATE
// Initialised per-system via initEconomy()
// economyState[systemKey][resourceId] = { stock, price, trend }
// ─────────────────────────────────────────────

let economyState = {};

// How many units of stock each location starts with (relative to supply/demand)
const STOCK_BASE        = 50;   // neutral stock level (0–100 scale)
const STOCK_MAX         = 100;
const STOCK_MIN         = 0;

// Price multiplier range relative to basePrice
const PRICE_MULT_MIN    = 0.4;  // floor: 40% of base (oversupply)
const PRICE_MULT_MAX    = 2.5;  // ceiling: 250% of base (severe shortage)

// How fast stock depletes per game tick (consumed resources)
const CONSUME_RATE      = 0.02; // units per tick
const PRODUCE_RATE      = 0.03; // units per tick (produced resources replenish faster)

// Random drift applied to stock each tick (simulates economic noise)
const DRIFT_MAGNITUDE   = 0.01;

// How many ticks between full price recalculations
const PRICE_UPDATE_INTERVAL = 300; // ~5 seconds at 60fps
let   _priceUpdateTimer     = 0;

// ─────────────────────────────────────────────
// INITIALISE ECONOMY FOR A SYSTEM
// Call once per system when first visited, or on new game
// profileType: key from LOCATION_PROFILES
// ─────────────────────────────────────────────

function initSystemEconomy(systemKey, profileType) {
  if (economyState[systemKey]) return; // already initialised

  const profile = LOCATION_PROFILES[profileType];
  if (!profile) {
    console.warn(`[Economy] Unknown profile type: ${profileType}`);
    return;
  }

  economyState[systemKey] = {};

  const allIds = Object.keys(RESOURCES);

  allIds.forEach(id => {
    const res = RESOURCES[id];

    // Skip contraband at non-black-market locations
    if (res.contraband && !profile.blackMarket) return;

    let stock;
    if (profile.produces.includes(id)) {
      // This location produces it — high stock, sells cheap
      stock = rand(65, 95);
    } else if (profile.consumes.includes(id)) {
      // This location consumes it — low stock, expensive
      stock = rand(5, 35);
    } else if (profile.isHub) {
      // Trading hubs carry everything at moderate stock
      stock = rand(35, 65);
    } else {
      // Not produced or consumed — not stocked here
      return;
    }

    economyState[systemKey][id] = {
      stock:    stock,
      price:    calcPrice(id, stock),
      trend:    0,      // +1 rising, -1 falling, 0 stable
      lastTick: 0
    };
  });
}

// ─────────────────────────────────────────────
// PRICE CALCULATION
// Price is driven by stock level relative to STOCK_BASE
// Low stock → high price, high stock → low price
// ─────────────────────────────────────────────

function calcPrice(resourceId, stock) {
  const res = RESOURCES[resourceId];
  if (!res) return 0;

  // Normalise stock to 0–1
  const norm = Math.max(0, Math.min(1, stock / STOCK_MAX));

  // Inverse supply curve: low stock = high multiplier
  // At stock=0: mult = PRICE_MULT_MAX
  // At stock=50: mult ≈ 1.0 (baseline)
  // At stock=100: mult = PRICE_MULT_MIN
  const mult = PRICE_MULT_MAX - (PRICE_MULT_MAX - PRICE_MULT_MIN) * norm;

  return Math.round(res.basePrice * mult);
}

// ─────────────────────────────────────────────
// ECONOMY TICK
// Call from game loop (update()) every frame
// Handles stock drift, consumption, production, price updates
// ─────────────────────────────────────────────

function tickEconomy() {
  _priceUpdateTimer++;
  if (_priceUpdateTimer < PRICE_UPDATE_INTERVAL) return;
  _priceUpdateTimer = 0;

  Object.keys(economyState).forEach(sysKey => {
    const sysData  = economyState[sysKey];
    const profType = getSystemProfileType(sysKey);
    const profile  = LOCATION_PROFILES[profType];
    if (!profile) return;

    Object.keys(sysData).forEach(resId => {
      const entry = sysData[resId];

      // Produced resources: stock slowly replenishes
      if (profile.produces.includes(resId)) {
        entry.stock = Math.min(STOCK_MAX, entry.stock + PRODUCE_RATE * PRICE_UPDATE_INTERVAL);
      }

      // Consumed resources: stock slowly depletes
      if (profile.consumes.includes(resId)) {
        entry.stock = Math.max(STOCK_MIN, entry.stock - CONSUME_RATE * PRICE_UPDATE_INTERVAL);
      }

      // Random economic drift on all stocked resources
      const drift = (Math.random() - 0.5) * 2 * DRIFT_MAGNITUDE * PRICE_UPDATE_INTERVAL;
      entry.stock = Math.max(STOCK_MIN, Math.min(STOCK_MAX, entry.stock + drift));

      // Recalculate price
      const newPrice = calcPrice(resId, entry.stock);
      entry.trend = newPrice > entry.price ? 1 : newPrice < entry.price ? -1 : 0;
      entry.price = newPrice;
    });
  });
}

// ─────────────────────────────────────────────
// TRADE FUNCTIONS
// ─────────────────────────────────────────────

// Buy a resource at current system price
// Returns { success, message, cost }
function buyResource(resourceId, quantity) {
  const sysData = economyState[systemKey];
  if (!sysData || !sysData[resourceId]) {
    return { success: false, message: 'Not available here.' };
  }

  const entry   = sysData[resourceId];
  const res     = RESOURCES[resourceId];
  const cost    = entry.price * quantity;

  // Check cargo space
  const currentCargo = getCargoCount();
  const cargoLimit   = player.cargoCapacity || 20;
  if (currentCargo + quantity > cargoLimit) {
    return { success: false, message: 'Not enough cargo space.' };
  }

  // Check credits
  if (state.credits < cost) {
    return { success: false, message: 'Not enough credits.' };
  }

  // Check stock
  if (entry.stock < quantity) {
    return { success: false, message: 'Insufficient stock available.' };
  }

  // Execute purchase
  state.credits -= cost;
  entry.stock   -= quantity;
  entry.price    = calcPrice(resourceId, entry.stock); // reprice immediately

  if (!state.cargo[resourceId]) {
    state.cargo[resourceId] = { quantity: 0, pricePaid: entry.price };
  }
  state.cargo[resourceId].quantity  += quantity;
  state.cargo[resourceId].pricePaid  = Math.round(
    (state.cargo[resourceId].pricePaid + entry.price) / 2
  ); // rolling average buy price

  return { success: true, message: `Purchased ${quantity}× ${res.name} for ${cost} Cr.`, cost };
}

// Sell a resource at current system price
// Returns { success, message, earned, profit }
function sellResource(resourceId, quantity) {
  const sysData = economyState[systemKey];
  if (!sysData || !sysData[resourceId]) {
    return { success: false, message: 'No market for this resource here.' };
  }

  const cargoEntry = state.cargo[resourceId];
  if (!cargoEntry || cargoEntry.quantity < quantity) {
    return { success: false, message: 'You don\'t have enough of that.' };
  }

  const entry   = sysData[resourceId];
  const res     = RESOURCES[resourceId];
  const earned  = entry.price * quantity;
  const profit  = earned - (cargoEntry.pricePaid * quantity);

  // Execute sale
  state.credits           += earned;
  cargoEntry.quantity     -= quantity;
  if (cargoEntry.quantity <= 0) delete state.cargo[resourceId];

  entry.stock  = Math.min(STOCK_MAX, entry.stock + quantity);
  entry.price  = calcPrice(resourceId, entry.stock); // reprice immediately

  return { success: true, message: `Sold ${quantity}× ${res.name} for ${earned} Cr.`, earned, profit };
}

// ─────────────────────────────────────────────
// CONTRABAND RISK
// Call on dock at military / government stations
// Returns { caught, fine, cargoLost[] }
// ─────────────────────────────────────────────

function contrabandCheck() {
  const profType = getSystemProfileType(systemKey);
  const profile  = LOCATION_PROFILES[profType];

  // Only military stations perform checks
  if (!profile || !profile.isMilitary) return { caught: false };

  const contrabandCargo = Object.keys(state.cargo).filter(id => {
    return RESOURCES[id] && RESOURCES[id].contraband && state.cargo[id].quantity > 0;
  });

  if (contrabandCargo.length === 0) return { caught: false };

  // 70% chance of detection at military stations
  const detected = Math.random() < 0.70;
  if (!detected) return { caught: false };

  // Calculate fine and confiscate cargo
  let fine      = 0;
  const lost    = [];
  contrabandCargo.forEach(id => {
    const qty  = state.cargo[id].quantity;
    fine      += RESOURCES[id].basePrice * qty * 1.5; // 150% of base value as fine
    lost.push({ id, qty, name: RESOURCES[id].name });
    delete state.cargo[id];
  });

  fine           = Math.round(fine);
  state.credits  = Math.max(0, state.credits - fine);

  // Hit reputation with governing faction
  const faction = SYSTEMS[systemKey] ? SYSTEMS[systemKey].faction : null;
  if (faction && state.reputation[faction] !== undefined) {
    state.reputation[faction] = Math.max(-100, state.reputation[faction] - 20);
  }

  return { caught: true, fine, cargoLost: lost };
}

// ─────────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────────

// Get current cargo unit count
function getCargoCount() {
  return Object.values(state.cargo).reduce((sum, c) => sum + (c.quantity || 0), 0);
}

// Get available market listings for current system
// Returns array of { resourceId, name, category, price, stock, trend, canSell, contraband }
function getMarketListings() {
  const sysData  = economyState[systemKey];
  if (!sysData) return [];

  const profType  = getSystemProfileType(systemKey);
  const profile   = LOCATION_PROFILES[profType];
  const isBlack   = profile && profile.blackMarket;

  return Object.keys(sysData).map(id => {
    const entry = sysData[id];
    const res   = RESOURCES[id];
    return {
      resourceId: id,
      name:       res.name,
      category:   res.category,
      price:      entry.price,
      stock:      Math.floor(entry.stock),
      trend:      entry.trend,       // -1/0/1 for UI arrows
      cargoQty:   state.cargo[id] ? state.cargo[id].quantity : 0,
      pricePaid:  state.cargo[id] ? state.cargo[id].pricePaid : null,
      contraband: res.contraband || false
    };
  }).filter(item => {
    // Hide contraband from non-black-market locations
    if (item.contraband && !isBlack) return false;
    return true;
  }).sort((a, b) => {
    // Sort by category, then name
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
}

// Returns a trend indicator string for UI display
function trendIcon(trend) {
  if (trend > 0)  return '▲';
  if (trend < 0)  return '▼';
  return '–';
}

// Returns CSS class name for price trend
function trendClass(trend) {
  if (trend > 0)  return 'trend-up';
  if (trend < 0)  return 'trend-down';
  return 'trend-stable';
}

// ─────────────────────────────────────────────
// SYSTEM PROFILE MAPPING
// Maps systemKey (from data.js SYSTEMS) to a LOCATION_PROFILES key
// Edit this to assign economic identities to your 13 systems
// ─────────────────────────────────────────────

function getSystemProfileType(sysKey) {
  const MAP = {
    // ── Map your SYSTEMS keys here ──────────────
    // Format: 'systemKey': 'profile_type'
    // Profile types: mining_world, agricultural_world, industrial_world,
    //                tech_world, ocean_world, colony_world, barren_world, pirate_world,
    //                shipyard_station, mining_station, refinery_station, trading_hub,
    //                military_station, research_station, pirate_station, luxury_station, fuel_depot

    'sol':          'trading_hub',        // Alpha Centauri — central hub
    'vega':         'industrial_world',
    'sirius':       'tech_world',
    'proxima':      'mining_world',
    'barnard':      'agricultural_world',
    'wolf':         'colony_world',
    'lalande':      'refinery_station',
    'ross':         'military_station',
    '61cygni':      'research_station',
    'epsilon':      'mining_station',
    'tau':          'pirate_world',
    'delta':        'luxury_station',
    'rigel':        'barren_world',
  };

  return MAP[sysKey] || 'trading_hub'; // default fallback
}

// ─────────────────────────────────────────────
// BOOTSTRAP
// Call initAllEconomy() once at game start (from engine.js or main.js)
// ─────────────────────────────────────────────

function initAllEconomy() {
  economyState = {};
  Object.keys(SYSTEMS).forEach(sysKey => {
    const profType = getSystemProfileType(sysKey);
    initSystemEconomy(sysKey, profType);
  });
  console.log('[Economy] Initialised', Object.keys(economyState).length, 'systems');
}

// Expose economy tick to game loop — call this from update() in render.js
// e.g. at bottom of update(): if (typeof tickEconomy === 'function') tickEconomy();
