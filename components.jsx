// components.jsx — display components for the tracker
// Depends on theme.jsx + icons.jsx globals.

// ── Person avatar (color derived from name) ─────────────────
const PERSON_COLORS = {
  Alex: { bg: '#3E5BA9', fg: '#FFFFFF' },
  Madalina: { bg: '#A8447B', fg: '#FFFFFF' },
};
function personColor(name) {
  if (PERSON_COLORS[name]) return PERSON_COLORS[name];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return { bg: `hsl(${h} 42% 42%)`, fg: '#fff' };
}
function Avatar({ name, size = 24, ring }) {
  const c = personColor(name);
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: '50%', background: c.bg, color: c.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      fontSize: size * 0.42, fontWeight: 600, letterSpacing: 0.2,
      boxShadow: ring ? `0 0 0 2px ${ring}` : 'none',
    }}>{(name || '?').slice(0, 1).toUpperCase()}</div>
  );
}

// ── Category badge ──────────────────────────────────────────
function CategoryBadge({ children, loc }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 7, fontSize: 12, fontWeight: 600,
      background: loc.container, color: loc.onContainer, letterSpacing: 0.1,
      lineHeight: 1.3, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// ── Expiry pill ─────────────────────────────────────────────
function ExpiryPill({ item, mode = 'pill' }) {
  const st = expiryStatus(item.expiry);
  const label = item.expiry ? expiryPhrase(item.expiry) : 'No expiry date';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: mode === 'pill' ? '3px 9px 3px 8px' : 0, borderRadius: 7,
      background: mode === 'pill' ? st.bg : 'transparent',
      color: st.text, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ── Summary bar at top of a tab ─────────────────────────────
function SummaryBar({ items, loc }) {
  const total = items.length;
  let expired = 0, soon = 0;
  items.forEach(it => {
    const s = expiryStatus(it.expiry).key;
    if (s === 'expired') expired++;
    else if (s === 'soon') soon++;
  });
  const Stat = ({ value, label, color, dot }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />}
        <span style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1, letterSpacing: -0.3 }}>{value}</span>
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: NEUTRAL.onSurfaceVar, letterSpacing: 0.2, textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 14,
      padding: '14px 16px', margin: '0 16px 4px', borderRadius: 18,
      background: loc.container, border: `1px solid ${loc.accent}1f`,
    }}>
      <Stat value={total} label="Items" color={loc.onContainer} />
      <div style={{ width: 1, background: `${loc.onContainer}22` }} />
      <Stat value={expired} label="Expired" color={expired ? EXPIRY.expired.text : NEUTRAL.onSurfaceVar} dot={EXPIRY.expired.dot} />
      <Stat value={soon} label="Soon" color={soon ? EXPIRY.soon.text : NEUTRAL.onSurfaceVar} dot={EXPIRY.soon.dot} />
    </div>
  );
}

// ── Item card ───────────────────────────────────────────────
function ItemCard({ item, loc, onClick, justAdded }) {
  const st = expiryStatus(item.expiry);
  const qtyStr = `${Number.isInteger(item.qty) ? item.qty : item.qty} ${item.unit}`;
  return (
    <button onClick={onClick} className="fst-card" style={{
      width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none',
      background: NEUTRAL.surface, borderRadius: 16, padding: '13px 14px 13px 0',
      display: 'flex', alignItems: 'stretch', gap: 0, position: 'relative',
      boxShadow: '0 1px 2px rgba(20,22,18,0.06), 0 1px 1px rgba(20,22,18,0.04)',
      animation: justAdded ? 'fst-pop 0.4s ease' : 'none', overflow: 'hidden',
      font: 'inherit',
    }}>
      {/* status edge */}
      <div style={{ width: 5, background: st.dot, flexShrink: 0, marginRight: 13, borderRadius: '0 4px 4px 0' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'space-between' }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 600, color: NEUTRAL.onSurface, letterSpacing: -0.1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: loc.accentDark, whiteSpace: 'nowrap', flexShrink: 0 }}>{qtyStr}</span>
        </div>
        <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <CategoryBadge loc={loc}>{item.category}</CategoryBadge>
          <ExpiryPill item={item} />
        </div>
        <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar name={item.addedBy} size={18} />
          <span style={{ fontSize: 12, color: NEUTRAL.onSurfaceVar }}>Added by {item.addedBy}</span>
        </div>
      </div>
    </button>
  );
}

// ── Empty state ─────────────────────────────────────────────
function EmptyState({ loc, onAdd, filtered }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 36px', gap: 6,
    }}>
      <div style={{
        width: 92, height: 92, borderRadius: '50%', background: loc.container,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, marginBottom: 8,
      }}>{loc.icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: NEUTRAL.onSurface }}>
        {filtered ? 'Nothing matches' : `Your ${loc.label.toLowerCase()} is empty`}
      </div>
      <div style={{ fontSize: 14, color: NEUTRAL.onSurfaceVar, lineHeight: 1.45, maxWidth: 240 }}>
        {filtered ? 'Try a different category or clear the filter.'
          : `Add what you've stored and Madalina will see it instantly.`}
      </div>
      {!filtered && (
        <button onClick={onAdd} style={{
          marginTop: 14, border: 'none', cursor: 'pointer', font: 'inherit',
          background: loc.accent, color: loc.onAccent, fontWeight: 600, fontSize: 14.5,
          padding: '11px 20px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="add" size={19} stroke={2.4} /> Add first item
        </button>
      )}
    </div>
  );
}

// ── Bottom navigation ───────────────────────────────────────
function BottomNav({ active, onChange }) {
  return (
    <div style={{
      display: 'flex', background: NEUTRAL.surface, borderTop: `1px solid ${NEUTRAL.outlineSoft}`,
      paddingTop: 8, paddingBottom: 6,
    }}>
      {LOCATION_ORDER.map(key => {
        const loc = LOCATIONS[key];
        const on = active === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            flex: 1, border: 'none', background: 'none', cursor: 'pointer', font: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '2px 0',
          }}>
            <div style={{
              width: 60, height: 32, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on ? loc.navTint : 'transparent', transition: 'background 0.2s', fontSize: 19,
              filter: on ? 'none' : 'grayscale(0.35)', opacity: on ? 1 : 0.78,
            }}>{loc.icon}</div>
            <span style={{
              fontSize: 12, fontWeight: on ? 700 : 500,
              color: on ? loc.accentDark : NEUTRAL.onSurfaceVar,
            }}>{loc.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { Avatar, personColor, CategoryBadge, ExpiryPill, SummaryBar, ItemCard, EmptyState, BottomNav });
