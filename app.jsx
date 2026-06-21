// app.jsx — Food Storage Tracker main application
// Depends on all prior globals. Renders into #root.
const { useState: uS, useEffect: uE, useMemo: uM, useRef: uR } = React;

const SORTS = [
  { key: 'expiry', label: 'Expiry date' },
  { key: 'added', label: 'Date added' },
  { key: 'category', label: 'Category' },
  { key: 'name', label: 'Name' },
];

function sortItems(items, by) {
  const a = [...items];
  if (by === 'expiry') {
    a.sort((x, y) => {
      const dx = daysUntil(x.expiry), dy = daysUntil(y.expiry);
      if (dx === null && dy === null) return x.name.localeCompare(y.name);
      if (dx === null) return 1;
      if (dy === null) return -1;
      return dx - dy;
    });
  } else if (by === 'added') {
    a.sort((x, y) => (y.dateAdded || '').localeCompare(x.dateAdded || ''));
  } else if (by === 'category') {
    a.sort((x, y) => x.category.localeCompare(y.category) || x.name.localeCompare(y.name));
  } else {
    a.sort((x, y) => x.name.localeCompare(y.name));
  }
  return a;
}

// ── Sort menu popover ───────────────────────────────────────
function SortMenu({ value, onChange, accent, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 5 }} />
      <div style={{
        position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 6, minWidth: 190,
        background: NEUTRAL.surface, borderRadius: 14, border: `1px solid ${NEUTRAL.outlineSoft}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.16)', padding: 6, animation: 'fst-pop .16s ease',
      }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: NEUTRAL.onSurfaceVar, padding: '6px 10px 4px', textTransform: 'uppercase', letterSpacing: 0.4 }}>Sort by</div>
        {SORTS.map(s => (
          <button key={s.key} onClick={() => { onChange(s.key); onClose(); }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', border: 'none',
            background: s.key === value ? `${accent}14` : 'transparent', cursor: 'pointer', font: 'inherit',
            fontSize: 14.5, padding: '10px 11px', borderRadius: 9, textAlign: 'left', color: NEUTRAL.onSurface, gap: 16,
          }}>{s.label}{s.key === value && <Icon name="check" size={17} style={{ color: accent }} />}</button>
        ))}
      </div>
    </>
  );
}

// ── Controls row: sort + category filter chips ──────────────
function Controls({ loc, items, sortBy, setSortBy, filter, setFilter }) {
  const [menu, setMenu] = uS(false);
  const cats = uM(() => {
    const present = new Set(items.map(i => i.category));
    return CATEGORIES[loc.key].filter(c => present.has(c));
  }, [items, loc.key]);

  return (
    <div style={{ padding: '6px 0 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', overflowX: 'auto', scrollbarWidth: 'none' }} className="fst-noscroll">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setMenu(m => !m)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px 8px 11px', borderRadius: 100, cursor: 'pointer',
            font: 'inherit', fontSize: 13.5, fontWeight: 600, border: `1px solid ${NEUTRAL.outline}`,
            background: NEUTRAL.surface, color: NEUTRAL.onSurface, whiteSpace: 'nowrap',
          }}>
            <Icon name="sort" size={17} style={{ color: loc.accentDark }} />
            {SORTS.find(s => s.key === sortBy).label}
            <Icon name="chevronDown" size={15} style={{ color: NEUTRAL.onSurfaceVar }} />
          </button>
          {menu && <SortMenu value={sortBy} onChange={setSortBy} accent={loc.accent} onClose={() => setMenu(false)} />}
        </div>
        <div style={{ width: 1, height: 22, background: NEUTRAL.outlineSoft, flexShrink: 0 }} />
        <Chip on={filter === 'all'} loc={loc} onClick={() => setFilter('all')}>All</Chip>
        {cats.map(c => (
          <Chip key={c} on={filter === c} loc={loc} onClick={() => setFilter(c)}>{c}</Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({ children, on, loc, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, padding: '8px 14px', borderRadius: 100, cursor: 'pointer', font: 'inherit',
      fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', transition: 'all .15s',
      border: `1px solid ${on ? loc.accent : NEUTRAL.outline}`,
      background: on ? loc.accent : NEUTRAL.surface, color: on ? loc.onAccent : NEUTRAL.onSurface,
    }}>{children}</button>
  );
}

// ── Toast ───────────────────────────────────────────────────
function Toast({ toast, onAction, onClear }) {
  uE(() => {
    if (!toast) return;
    const t = setTimeout(onClear, toast.action ? 4200 : 2400);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 96, zIndex: 55,
      background: '#2C312C', color: '#fff', borderRadius: 14, padding: '13px 16px',
      display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.3)',
      animation: 'fst-slide-up 0.22s ease',
    }}>
      <span style={{ flex: 1, fontSize: 14, lineHeight: 1.35 }}>{toast.msg}</span>
      {toast.action && (
        <button onClick={onAction} style={{
          border: 'none', background: 'none', cursor: 'pointer', font: 'inherit',
          fontSize: 14, fontWeight: 800, color: '#83d5c6', padding: '2px 4px',
        }}>{toast.action}</button>
      )}
    </div>
  );
}

// ── Main app ────────────────────────────────────────────────
function App() {
  const [userName, setUserName] = uS(() => localStorage.getItem('fst_user') || '');
  const [items, setItems] = uS(() => {
    try {
      const saved = localStorage.getItem('fst_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_ITEMS;
  });
  const [tab, setTab] = uS('freezer');
  const [sortMap, setSortMap] = uS({ freezer: 'expiry', fridge: 'expiry', cellar: 'expiry', pantry: 'expiry' });
  const [filterMap, setFilterMap] = uS({ freezer: 'all', fridge: 'all', cellar: 'all', pantry: 'all' });
  const [sheet, setSheet] = uS(null);       // {mode:'add'|'edit', item}
  const [detail, setDetail] = uS(null);
  const [move, setMove] = uS(null);
  const [confirm, setConfirm] = uS(null);    // {type:'delete'|'use', item}
  const [search, setSearch] = uS(false);
  const [notif, setNotif] = uS(false);
  const [toast, setToast] = uS(null);
  const [justAdded, setJustAdded] = uS(null);
  const scrollRef = uR(null);

  uE(() => { localStorage.setItem('fst_items', JSON.stringify(items)); }, [items]);
  uE(() => { if (userName) localStorage.setItem('fst_user', userName); }, [userName]);

  const loc = LOCATIONS[tab];
  const tabItems = uM(() => items.filter(i => i.location === tab), [items, tab]);
  const filter = filterMap[tab];
  const sortBy = sortMap[tab];
  const shown = uM(() => {
    let arr = tabItems;
    if (filter !== 'all') arr = arr.filter(i => i.category === filter);
    return sortItems(arr, sortBy);
  }, [tabItems, filter, sortBy]);

  const expiringCount = uM(() => items.filter(it => { const d = daysUntil(it.expiry); return d !== null && d <= 3; }).length, [items]);

  const setSortBy = v => setSortMap(m => ({ ...m, [tab]: v }));
  const setFilter = v => setFilterMap(m => ({ ...m, [tab]: v }));
  const showToast = (msg, action, onAction) => setToast({ msg, action, onAction });

  // ── mutations ──
  const saveItem = data => {
    if (data.id) {
      setItems(list => list.map(i => i.id === data.id ? data : i));
      showToast('Changes saved');
    } else {
      const id = `it_${Date.now().toString(36)}`;
      const created = { ...data, id };
      setItems(list => [created, ...list]);
      setJustAdded(id);
      setTimeout(() => setJustAdded(null), 600);
      showToast(`Added to ${LOCATIONS[data.location].label}`);
    }
    setSheet(null);
  };
  const reallyDelete = item => {
    setItems(list => list.filter(i => i.id !== item.id));
    setConfirm(null); setDetail(null);
    showToast(`Deleted “${item.name}”`, 'Undo', () => { setItems(list => [item, ...list]); setToast(null); });
  };
  const reallyUse = item => {
    setItems(list => list.filter(i => i.id !== item.id));
    setConfirm(null); setDetail(null);
    showToast(`“${item.name}” marked as used`, 'Undo', () => { setItems(list => [item, ...list]); setToast(null); });
  };
  const doMove = (item, target, category) => {
    setItems(list => list.map(i => i.id === item.id ? { ...i, location: target, category } : i));
    setMove(null); setDetail(null);
    setTab(target);
    showToast(`Moved to ${LOCATIONS[target].label}`);
  };

  // reset scroll on tab change
  uE(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [tab]);

  if (!userName) return (
    <Phone tint={LOCATIONS.fridge.page}>
      <NameEntry onSet={setUserName} />
    </Phone>
  );

  return (
    <Phone tint={loc.page}>
      {/* App bar */}
      <div style={{ background: loc.page, padding: '6px 8px 4px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px' }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: loc.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: `0 3px 10px ${loc.accent}40` }}>{loc.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 21, fontWeight: 800, color: loc.accentDark, letterSpacing: -0.4, lineHeight: 1.1 }}>{loc.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ display: 'flex' }}>
                <Avatar name="Alex" size={16} ring={loc.page} />
                <span style={{ marginLeft: -5 }}><Avatar name="Madalina" size={16} ring={loc.page} /></span>
              </span>
              <span style={{ fontSize: 11.5, color: NEUTRAL.onSurfaceVar, fontWeight: 500 }}>Shared · synced live</span>
            </div>
          </div>
          <button onClick={() => setSearch(true)} style={iconBtn(loc.accentDark, '#ffffffcc')}><Icon name="search" size={22} /></button>
          <button onClick={() => setNotif(true)} style={{ ...iconBtn(loc.accentDark, '#ffffffcc'), position: 'relative' }}>
            <Icon name="bell" size={21} />
            {expiringCount > 0 && (
              <span style={{ position: 'absolute', top: 5, right: 5, minWidth: 16, height: 16, padding: '0 3px', borderRadius: 8, background: EXPIRY.soon.dot, color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 2px ${loc.page}` }}>{expiringCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* scroll region */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', background: loc.page }}>
        <div style={{ paddingTop: 6 }}><SummaryBar items={tabItems} loc={loc} /></div>
        {tabItems.length > 0 && (
          <Controls loc={loc} items={tabItems} sortBy={sortBy} setSortBy={setSortBy} filter={filter} setFilter={setFilter} />
        )}
        {tabItems.length === 0 ? (
          <EmptyState loc={loc} onAdd={() => setSheet({ mode: 'add' })} />
        ) : shown.length === 0 ? (
          <EmptyState loc={loc} filtered onAdd={() => setSheet({ mode: 'add' })} />
        ) : (
          <div style={{ padding: '2px 16px 110px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {shown.map(it => (
              <ItemCard key={it.id} item={it} loc={loc} justAdded={it.id === justAdded} onClick={() => setDetail(it)} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setSheet({ mode: 'add' })} style={{
        position: 'absolute', right: 18, bottom: 90, zIndex: 30, height: 56, borderRadius: 18, border: 'none', cursor: 'pointer',
        background: loc.accent, color: loc.onAccent, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px 0 16px',
        boxShadow: `0 8px 22px ${loc.accent}55`, font: 'inherit', fontSize: 15.5, fontWeight: 700,
      }}>
        <Icon name="add" size={24} stroke={2.4} /> Add
      </button>

      {/* Bottom nav */}
      <BottomNav active={tab} onChange={setTab} />

      {/* Overlays */}
      <Toast toast={toast} onAction={() => { toast.onAction && toast.onAction(); }} onClear={() => setToast(null)} />
      {sheet && <AddEditSheet locKey={tab} editing={sheet.mode === 'edit' ? sheet.item : null} userName={userName} onClose={() => setSheet(null)} onSave={saveItem} />}
      {detail && <DetailSheet item={items.find(i => i.id === detail.id) || detail} onClose={() => setDetail(null)}
        onEdit={it => { setDetail(null); setSheet({ mode: 'edit', item: it }); }}
        onMove={it => { setDetail(null); setMove(it); }}
        onDelete={it => setConfirm({ type: 'delete', item: it })}
        onUse={it => setConfirm({ type: 'use', item: it })} />}
      {move && <MoveSheet item={move} onClose={() => setMove(null)} onConfirm={(t, c) => doMove(move, t, c)} />}
      {confirm && confirm.type === 'delete' && (
        <ConfirmDialog title="Delete this item?" icon="trash" danger confirmLabel="Delete"
          body={`“${confirm.item.name}” will be removed for both you and Madalina. You can undo right after.`}
          onCancel={() => setConfirm(null)} onConfirm={() => reallyDelete(confirm.item)} />
      )}
      {confirm && confirm.type === 'use' && (
        <ConfirmDialog title="Mark as used?" icon="check" accent={EXPIRY.fine.text} confirmLabel="Mark as used"
          body={`This removes “${confirm.item.name}” from your ${LOCATIONS[confirm.item.location].label.toLowerCase()}.`}
          onCancel={() => setConfirm(null)} onConfirm={() => reallyUse(confirm.item)} />
      )}
      {search && <SearchOverlay items={items} onClose={() => setSearch(false)} onPick={it => { setSearch(false); setTab(it.location); setDetail(it); }} />}
      {notif && <NotificationsPanel items={items} onClose={() => setNotif(false)} onPick={it => { setNotif(false); setTab(it.location); setDetail(it); }} />}
    </Phone>
  );
}

// ── Phone bezel (reuses starter status + nav bars) ──────────
function Phone({ children, tint }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(160deg,#e9ece8,#dde2dd)', boxSizing: 'border-box' }}>
      <div style={{
        width: 412, height: 880, borderRadius: 44, overflow: 'hidden', position: 'relative',
        background: tint, border: '10px solid #15171a', boxShadow: '0 40px 90px rgba(0,0,0,0.35), 0 0 0 2px #2b2e33',
        display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      }}>
        <div style={{ background: tint }}><AndroidStatusBar /></div>
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {children}
        </div>
        <div style={{ background: NEUTRAL.surface }}><AndroidNavBar /></div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
