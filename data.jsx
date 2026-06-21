// data.jsx — seeded shared inventory (relative to TODAY = 2026-06-02)
// Exposes: SEED_ITEMS

let _id = 0;
const id = () => `it_${(++_id).toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

const SEED_ITEMS = [
  // ── FREEZER ─────────────────────────────────────────────
  { id: id(), location: 'freezer', name: 'Beef mince', category: 'Meat & Fish', description: 'For bolognese / burgers', qty: 1.2, unit: 'kg', dateAdded: '2026-05-18', expiry: '2026-08-18', addedBy: 'Alex' },
  { id: id(), location: 'freezer', name: 'Chicken thighs', category: 'Poultry', description: '', qty: 8, unit: 'pieces', dateAdded: '2026-05-26', expiry: '2026-06-05', addedBy: 'Madalina' },
  { id: id(), location: 'freezer', name: 'Salmon fillets', category: 'Seafood', description: 'Vacuum packed', qty: 4, unit: 'pieces', dateAdded: '2026-04-30', expiry: '2026-05-29', addedBy: 'Alex' },
  { id: id(), location: 'freezer', name: 'Peas', category: 'Vegetables', description: '', qty: 750, unit: 'g', dateAdded: '2026-03-12', expiry: '2026-11-01', addedBy: 'Madalina' },
  { id: id(), location: 'freezer', name: 'Mixed berries', category: 'Fruits', description: 'Smoothie mix', qty: 2, unit: 'bags', dateAdded: '2026-05-10', expiry: '2026-09-10', addedBy: 'Alex' },
  { id: id(), location: 'freezer', name: 'Leftover lasagne', category: 'Meals & Leftovers', description: '2 portions, labelled', qty: 2, unit: 'boxes', dateAdded: '2026-05-30', expiry: '2026-06-09', addedBy: 'Madalina' },
  { id: id(), location: 'freezer', name: 'Sourdough loaf', category: 'Bread & Dough', description: 'Half loaf, sliced', qty: 1, unit: 'pieces', dateAdded: '2026-05-22', expiry: '', addedBy: 'Alex' },
  { id: id(), location: 'freezer', name: 'Butter (spare)', category: 'Dairy', description: '', qty: 2, unit: 'pieces', dateAdded: '2026-02-20', expiry: '2026-08-20', addedBy: 'Madalina' },

  // ── FRIDGE ──────────────────────────────────────────────
  { id: id(), location: 'fridge', name: 'Whole milk', category: 'Dairy & Eggs', description: '', qty: 2, unit: 'L', dateAdded: '2026-05-30', expiry: '2026-06-04', addedBy: 'Madalina' },
  { id: id(), location: 'fridge', name: 'Free-range eggs', category: 'Dairy & Eggs', description: 'Box of 6', qty: 6, unit: 'pieces', dateAdded: '2026-05-28', expiry: '2026-06-18', addedBy: 'Alex' },
  { id: id(), location: 'fridge', name: 'Greek yoghurt', category: 'Dairy & Eggs', description: '', qty: 500, unit: 'g', dateAdded: '2026-05-27', expiry: '2026-06-01', addedBy: 'Madalina' },
  { id: id(), location: 'fridge', name: 'Smoked bacon', category: 'Meat & Fish', description: '', qty: 1, unit: 'pieces', dateAdded: '2026-05-29', expiry: '2026-06-07', addedBy: 'Alex' },
  { id: id(), location: 'fridge', name: 'Spinach', category: 'Fruits & Vegetables', description: 'Bag, washed', qty: 1, unit: 'bags', dateAdded: '2026-05-31', expiry: '2026-06-03', addedBy: 'Madalina' },
  { id: id(), location: 'fridge', name: 'Cherry tomatoes', category: 'Fruits & Vegetables', description: '', qty: 400, unit: 'g', dateAdded: '2026-05-29', expiry: '2026-06-08', addedBy: 'Alex' },
  { id: id(), location: 'fridge', name: 'Thai green curry', category: 'Leftovers', description: 'From Sunday', qty: 1, unit: 'boxes', dateAdded: '2026-05-31', expiry: '2026-06-03', addedBy: 'Madalina' },
  { id: id(), location: 'fridge', name: 'Orange juice', category: 'Drinks & Juices', description: 'Not from concentrate', qty: 1, unit: 'L', dateAdded: '2026-05-25', expiry: '2026-06-15', addedBy: 'Alex' },
  { id: id(), location: 'fridge', name: 'Mayonnaise', category: 'Condiments & Sauces', description: 'Open jar', qty: 1, unit: 'jars', dateAdded: '2026-04-18', expiry: '2026-07-10', addedBy: 'Madalina' },

  // ── CELLAR ──────────────────────────────────────────────
  { id: id(), location: 'cellar', name: 'Rioja Reserva', category: 'Wine & Drinks', description: '2019, special occasion', qty: 3, unit: 'bottles', dateAdded: '2025-11-04', expiry: '', addedBy: 'Alex' },
  { id: id(), location: 'cellar', name: 'Chopped tomatoes', category: 'Canned Goods', description: '', qty: 8, unit: 'cans', dateAdded: '2026-01-15', expiry: '2027-09-01', addedBy: 'Madalina' },
  { id: id(), location: 'cellar', name: 'Chickpeas', category: 'Canned Goods', description: '', qty: 5, unit: 'cans', dateAdded: '2026-02-02', expiry: '2027-02-02', addedBy: 'Alex' },
  { id: id(), location: 'cellar', name: 'Cornichons', category: 'Jarred Goods', description: '', qty: 1, unit: 'jars', dateAdded: '2025-12-20', expiry: '2026-06-06', addedBy: 'Madalina' },
  { id: id(), location: 'cellar', name: 'Potatoes', category: 'Root Vegetables', description: 'Maris Piper sack', qty: 4, unit: 'kg', dateAdded: '2026-05-20', expiry: '2026-06-30', addedBy: 'Alex' },
  { id: id(), location: 'cellar', name: 'Onions', category: 'Root Vegetables', description: '', qty: 2, unit: 'kg', dateAdded: '2026-05-12', expiry: '', addedBy: 'Madalina' },
  { id: id(), location: 'cellar', name: 'Strawberry jam', category: 'Home Preserves & Jams', description: "Madalina's batch", qty: 4, unit: 'jars', dateAdded: '2025-08-30', expiry: '2026-08-30', addedBy: 'Madalina' },
  { id: id(), location: 'cellar', name: 'Pickled beetroot', category: 'Home Preserves & Jams', description: '', qty: 2, unit: 'jars', dateAdded: '2025-09-15', expiry: '2026-05-25', addedBy: 'Alex' },

  // ── PANTRY ──────────────────────────────────────────────
  { id: id(), location: 'pantry', name: 'Spaghetti', category: 'Pasta & Rice', description: '', qty: 3, unit: 'boxes', dateAdded: '2026-03-08', expiry: '2027-03-08', addedBy: 'Alex' },
  { id: id(), location: 'pantry', name: 'Basmati rice', category: 'Pasta & Rice', description: '', qty: 2, unit: 'kg', dateAdded: '2026-02-19', expiry: '2027-12-01', addedBy: 'Madalina' },
  { id: id(), location: 'pantry', name: 'Plain flour', category: 'Flour & Baking', description: '', qty: 1.5, unit: 'kg', dateAdded: '2026-04-01', expiry: '2026-06-08', addedBy: 'Alex' },
  { id: id(), location: 'pantry', name: 'Baking powder', category: 'Flour & Baking', description: '', qty: 1, unit: 'pieces', dateAdded: '2026-01-10', expiry: '2026-05-30', addedBy: 'Madalina' },
  { id: id(), location: 'pantry', name: 'Coconut milk', category: 'Canned & Jarred', description: '', qty: 4, unit: 'cans', dateAdded: '2026-03-22', expiry: '2027-03-22', addedBy: 'Alex' },
  { id: id(), location: 'pantry', name: 'Olive oil', category: 'Oils & Vinegars', description: 'Extra virgin', qty: 1, unit: 'bottles', dateAdded: '2026-04-12', expiry: '2027-04-12', addedBy: 'Madalina' },
  { id: id(), location: 'pantry', name: 'Smoked paprika', category: 'Spices & Herbs', description: '', qty: 1, unit: 'jars', dateAdded: '2025-10-05', expiry: '', addedBy: 'Alex' },
  { id: id(), location: 'pantry', name: 'Dark chocolate', category: 'Snacks', description: '70% — baking & snacking', qty: 3, unit: 'pieces', dateAdded: '2026-05-15', expiry: '2026-12-01', addedBy: 'Madalina' },
  { id: id(), location: 'pantry', name: 'Porridge oats', category: 'Cereals & Grains', description: '', qty: 1, unit: 'bags', dateAdded: '2026-04-28', expiry: '2026-06-10', addedBy: 'Alex' },
];

Object.assign(window, { SEED_ITEMS });
