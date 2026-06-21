// overlays.jsx — full-screen search + notifications panel
// Depends on theme.jsx, icons.jsx, components.jsx, screens.jsx globals.
const { useState: useStateO, useMemo: useMemoO } = React;

// ── Global search ───────────────────────────────────────────
function SearchOverlay({ items, onClose, onPick }) {
  const [q, setQ] = useStateO('');
  const accent = NEUTRAL.onSurface;
  const results = useMemoO(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return items.filter(it =>
      it.name.toLowerCase().includes(term) ||
      it.category.toLowerCase().includes(term) ||
      (it.description || '').toLowerCase().includes(term) ||
      it.addedBy.toLowerCase().includes(term)
    );
  }, [q, items]);

  // group by location
  const grouped = useMemoO(() => {
    const g = {};
    results.forEach(it => { (g[it.location] = g[it.location] || []).push(it); });
    return g;
  }, [results]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: NEUTRAL.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fst-fade 0.18s ease' }}>
      {/* search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 12px 12px 6px', width: '100%', maxWidth: 660, boxSizing: 'border-box' }}>
        <button onClick={onClose} style={iconBtn(NEUTRAL.onSurface)}><Icon name="back" size={24} /></button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: NEUTRAL.surface, borderRadius: 100, padding: '0 14px', height: 46, border: `1px solid ${NEUTRAL.outlineSoft}` }}>
          <Icon name="search" size={20} style={{ color: NEUTRAL.onSurfaceVar }} />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search all locations"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'none', font: 'inherit', fontSize: 16, color: NEUTRAL.onSurface }} />
          {q && <button onClick={() => setQ('')} style={iconBtn(NEUTRAL.onSurfaceVar)}><Icon name="close" size={18} /></button>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0 20px', width: '100%', maxWidth: 660, boxSizing: 'border-box' }}>
        {!q.trim() && (
          <div style={{ textAlign: 'center', padding: '56px 40px', color: NEUTRAL.onSurfaceVar }}>
            <Icon name="search" size={40} style={{ margin: '0 auto 14px', color: NEUTRAL.outline }} />
            <div style={{ fontSize: 15, lineHeight: 1.5 }}>Search across the freezer, fridge,<br />cellar and pantry at once.</div>
          </div>
        )}
        {q.trim() && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '56px 40px', color: NEUTRAL.onSurfaceVar }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: NEUTRAL.onSurface }}>No matches for “{q}”</div>
            <div style={{ fontSize: 14, marginTop: 6 }}>Try a different word.</div>
          </div>
        )}
        {q.trim() && results.length > 0 && (
          <div style={{ padding: '0 16px' }}>
            <div style={{ fontSize: 13, color: NEUTRAL.onSurfaceVar, margin: '4px 2px 12px', fontWeight: 600 }}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </div>
            {LOCATION_ORDER.filter(k => grouped[k]).map(k => {
              const loc = LOCATIONS[k];
              return (
                <div key={k} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 2px 8px' }}>
                    <span style={{ fontSize: 16 }}>{loc.icon}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: loc.accentDark }}>{loc.label}</span>
                    <span style={{ fontSize: 12.5, color: NEUTRAL.onSurfaceVar }}>· {grouped[k].length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {grouped[k].map(it => <ItemCard key={it.id} item={it} loc={loc} onClick={() => onPick(it)} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Notifications panel (expiring within 3 days) ────────────
function NotificationsPanel({ items, onClose, onPick }) {
  const expiring = items
    .filter(it => { const d = daysUntil(it.expiry); return d !== null && d <= 3; })
    .sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry));

  return (
    <Scrim onClose={onClose} align="flex-start">
      <div onClick={e => e.stopPropagation()} style={{
        width: 'calc(100% - 16px)', maxWidth: 440, margin: '8px auto 0',
        background: NEUTRAL.surface, borderRadius: 24, overflow: 'hidden',
        animation: 'fst-slide-down 0.26s cubic-bezier(.2,.8,.2,1)', boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
        maxHeight: '82%', display: 'flex', flexDirection: 'column',
      }}>
        {/* OS-style notification header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px 12px' }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: EXPIRY.soon.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: EXPIRY.soon.text }}>
            <Icon name="bell" size={17} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NEUTRAL.onSurface }}>Pantry Tracker</div>
            <div style={{ fontSize: 12, color: NEUTRAL.onSurfaceVar }}>Daily expiry check · now</div>
          </div>
          <button onClick={onClose} style={iconBtn(NEUTRAL.onSurfaceVar)}><Icon name="close" size={20} /></button>
        </div>

        <div style={{ overflowY: 'auto', padding: '0 14px 16px' }}>
          {expiring.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 30px 36px', color: NEUTRAL.onSurfaceVar }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: EXPIRY.fine.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: EXPIRY.fine.text }}>
                <Icon name="check" size={30} stroke={2.4} />
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: NEUTRAL.onSurface }}>All good for now</div>
              <div style={{ fontSize: 13.5, marginTop: 5, lineHeight: 1.4 }}>Nothing is expiring in the next 3 days.</div>
            </div>
          ) : (
            <>
              <div style={{ padding: '4px 6px 12px', fontSize: 14, color: NEUTRAL.onSurface, lineHeight: 1.5 }}>
                <b>{expiring.length} {expiring.length === 1 ? 'item is' : 'items are'}</b> expiring within 3 days — use them soon 👀
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {expiring.map(it => {
                  const loc = LOCATIONS[it.location];
                  const st = expiryStatus(it.expiry);
                  return (
                    <button key={it.id} onClick={() => onPick(it)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 14, cursor: 'pointer',
                      font: 'inherit', textAlign: 'left', border: 'none', background: NEUTRAL.bg, width: '100%',
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: loc.container, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{loc.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: NEUTRAL.onSurface, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                        <div style={{ fontSize: 12.5, color: NEUTRAL.onSurfaceVar }}>{loc.label} · {it.qty} {it.unit}</div>
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: st.text, background: st.bg, padding: '4px 9px', borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {expiryPhrase(it.expiry).replace('Expires ', '').replace('Expired ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Scrim>
  );
}

Object.assign(window, { SearchOverlay, NotificationsPanel });
