// theme.jsx — Material You design tokens for Food Storage Tracker
// Exposes: LOCATIONS, UNITS, EXPIRY, NEUTRAL, fmtDate, daysUntil, expiryStatus, TODAY

// Deterministic "today" so seeded expiry coding is stable in the prototype.
const TODAY = new Date(2026, 5, 2); // June 2, 2026

const NEUTRAL = {
  bg: '#FCFCFB',          // app background behind cards
  surface: '#FFFFFF',     // card surface
  surfaceDim: '#F2F3F1',
  onSurface: '#1A1C1A',
  onSurfaceVar: '#44483F',
  outline: '#C5C8C0',
  outlineSoft: '#E6E8E2',
  scrim: 'rgba(20,22,18,0.42)',
};

// Per-location identity. Each has a saturated accent, a soft tinted page bg,
// a container tint for chips, and on-colors for text/icon contrast.
const LOCATIONS = {
  freezer: {
    key: 'freezer', label: 'Freezer', icon: '🧊',
    accent: '#1C73D2', accentDark: '#0B4E96', onAccent: '#FFFFFF',
    page: '#F1F7FE', container: '#DDEBFB', onContainer: '#0B3A6B',
    navTint: '#E3EFFC',
  },
  fridge: {
    key: 'fridge', label: 'Fridge', icon: '❄️',
    accent: '#0E8C99', accentDark: '#06606A', onAccent: '#FFFFFF',
    page: '#EFFAFB', container: '#D3EFF2', onContainer: '#05454C',
    navTint: '#DCF2F4',
  },
  cellar: {
    key: 'cellar', label: 'Cellar', icon: '🛢️',
    accent: '#9A6A45', accentDark: '#6E4626', onAccent: '#FFFFFF',
    page: '#FAF3EC', container: '#EDDFD1', onContainer: '#4B2E17',
    navTint: '#F0E4D7',
  },
  pantry: {
    key: 'pantry', label: 'Pantry', icon: '🫙',
    accent: '#B0832A', accentDark: '#7E5C12', onAccent: '#FFFFFF',
    page: '#FBF6E9', container: '#F4E8C9', onContainer: '#4E3A0C',
    navTint: '#F6EDD3',
  },
};

const LOCATION_ORDER = ['freezer', 'fridge', 'cellar', 'pantry'];

const CATEGORIES = {
  freezer: ['Meat & Fish', 'Poultry', 'Seafood', 'Vegetables', 'Fruits', 'Meals & Leftovers', 'Bread & Dough', 'Dairy', 'Other'],
  fridge: ['Dairy & Eggs', 'Meat & Fish', 'Fruits & Vegetables', 'Leftovers', 'Drinks & Juices', 'Condiments & Sauces', 'Other'],
  cellar: ['Wine & Drinks', 'Canned Goods', 'Jarred Goods', 'Root Vegetables', 'Home Preserves & Jams', 'Other'],
  pantry: ['Pasta & Rice', 'Flour & Baking', 'Canned & Jarred', 'Oils & Vinegars', 'Spices & Herbs', 'Snacks', 'Cereals & Grains', 'Other'],
};

const UNITS = ['pieces', 'kg', 'g', 'L', 'ml', 'bottles', 'bags', 'boxes', 'jars', 'cans'];

// Expiry color coding
const EXPIRY = {
  expired: { key: 'expired', dot: '#D11A2A', text: '#A0121F', bg: '#FBE3E5', label: 'Expired' },
  soon:    { key: 'soon',    dot: '#E07A0C', text: '#9A4E00', bg: '#FCEBD6', label: 'Soon' },
  fine:    { key: 'fine',    dot: '#2E8B4F', text: '#1F6B3A', bg: '#E1F2E6', label: 'Fresh' },
  none:    { key: 'none',    dot: '#9AA0A6', text: '#6B7177', bg: '#EEF0ED', label: 'No date' },
};

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = startOfDay(new Date(dateStr + 'T00:00:00'));
  const t = startOfDay(TODAY);
  return Math.round((d - t) / 86400000);
}

function expiryStatus(dateStr) {
  if (!dateStr) return EXPIRY.none;
  const d = daysUntil(dateStr);
  if (d < 0) return EXPIRY.expired;
  if (d <= 7) return EXPIRY.soon;
  return EXPIRY.fine;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtShort(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// Relative expiry phrase, e.g. "in 3 days", "today", "5 days ago"
function expiryPhrase(dateStr) {
  if (!dateStr) return 'No expiry';
  const d = daysUntil(dateStr);
  if (d === 0) return 'Expires today';
  if (d === 1) return 'Expires tomorrow';
  if (d > 1) return `Expires in ${d} days`;
  if (d === -1) return 'Expired yesterday';
  return `Expired ${Math.abs(d)} days ago`;
}

function isoToday() {
  const t = TODAY;
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

Object.assign(window, {
  TODAY, NEUTRAL, LOCATIONS, LOCATION_ORDER, CATEGORIES, UNITS, EXPIRY,
  daysUntil, expiryStatus, fmtDate, fmtShort, expiryPhrase, isoToday,
});
