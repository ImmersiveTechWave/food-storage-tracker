// web-app.jsx — WEB variant root.
// Same UI as the phone mock, but: password gate, Firestore live sync (shared
// with the Android app), real dates, and a responsive full-height shell.
// Loaded LAST. Depends on all prior globals + window.FST / window.ACCESS_PASSWORD.
const { useState: uS, useEffect: uE, useMemo: uM, useRef: uR } = React;

// ── Sort config + helpers (copied from app.jsx; not globally exported) ────────
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

// ── Breakpoint: desktop vs phone ──────────────────────────────────────────────
const DESKTOP_MIN = 860;
function useIsDesktop() {
  const [d, setD] = uS(() => typeof window !== 'undefined' && window.innerWidth >= DESKTOP_MIN);
  uE(() => {
    const on = () => setD(window.innerWidth >= DESKTOP_MIN);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return d;
}

const PAGE_BG = 'linear-gradient(160deg,#e9ece8,#dde2dd)';

// ── Shell for the simple screens (login / splash / name entry) ────────────────
// Phone: fills the screen. Desktop: a centered rounded card.
function WebShell({ children, tint }) {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: PAGE_BG, padding: 24, boxSizing: 'border-box' }}>
        <div style={{
          width: '100%', maxWidth: 460, height: 'min(760px, 92vh)', position: 'relative',
          display: 'flex', flexDirection: 'column', background: tint, overflow: 'hidden',
          borderRadius: 28, boxShadow: '0 30px 80px rgba(0,0,0,0.28)',
        }}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'stretch', background: PAGE_BG }}>
      <div style={{
        width: '100%', maxWidth: 480, minHeight: '100dvh', position: 'relative',
        display: 'flex', flexDirection: 'column', background: tint, overflow: 'hidden',
        boxShadow: '0 0 60px rgba(0,0,0,0.12)',
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Login gate (real Firebase Authentication: email + password) ───────────────
function AuthGate() {
  const [email, setEmail] = uS('');
  const [pw, setPw] = uS('');
  const [err, setErr] = uS('');
  const [busy, setBusy] = uS(false);
  const accent = LOCATIONS.fridge.accent;

  const submit = async e => {
    e.preventDefault();
    if (!email.trim() || !pw) return;
    setBusy(true); setErr('');
    try {
      // On success, App's onAuthStateChanged listener swaps this screen for the app.
      await window.FST_AUTH.signIn(email.trim(), pw);
    } catch (ex) {
      setErr(window.FST_AUTH.friendlyError(ex && ex.code));
      setBusy(false);
    }
  };

  const fieldStyle = {
    width: '100%', maxWidth: 320, boxSizing: 'border-box', font: 'inherit', fontSize: 16,
    padding: '14px 16px', borderRadius: 14, textAlign: 'center',
    border: `1.5px solid ${err ? EXPIRY.expired.dot : NEUTRAL.outline}`,
    background: NEUTRAL.surface, color: NEUTRAL.onSurface, outline: 'none',
  };

  return (
    <WebShell tint={LOCATIONS.fridge.page}>
      <form onSubmit={submit} style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: '24px 28px', gap: 14, textAlign: 'center',
      }}>
        <div style={{ fontSize: 54 }}>🧊❄️🛢️🫙</div>
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 25, fontWeight: 800, color: LOCATIONS.fridge.accentDark, letterSpacing: -0.4 }}>Home Food Storage</div>
          <div style={{ fontSize: 14, color: NEUTRAL.onSurfaceVar, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Icon name="lock" size={14} /> Sign in to your shared inventory
          </div>
        </div>
        <input type="email" value={email} autoFocus autoComplete="username"
          onChange={e => { setEmail(e.target.value); setErr(''); }}
          placeholder="Email" style={fieldStyle} />
        <input type="password" value={pw} autoComplete="current-password"
          onChange={e => { setPw(e.target.value); setErr(''); }}
          placeholder="Password" style={fieldStyle} />
        {err && <div style={{ fontSize: 13, color: EXPIRY.expired.text, fontWeight: 600, maxWidth: 320 }}>{err}</div>}
        <button type="submit" disabled={busy} style={{
          width: '100%', maxWidth: 320, border: 'none', cursor: busy ? 'default' : 'pointer', font: 'inherit',
          fontSize: 16, fontWeight: 700, padding: '14px', borderRadius: 14, opacity: busy ? 0.7 : 1,
          background: accent, color: LOCATIONS.fridge.onAccent, boxShadow: `0 8px 22px ${accent}55`,
        }}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </WebShell>
  );
}

// ── Connection / loading splash ───────────────────────────────────────────────
function Splash({ tint, text }) {
  return (
    <WebShell tint={tint}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 14, padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🧊❄️🛢️🫙</div>
        <div style={{ fontSize: 15, color: NEUTRAL.onSurfaceVar, fontWeight: 600 }}>{text}</div>
      </div>
    </WebShell>
  );
}

// ── "To Buy" shopping list ────────────────────────────────────────────────────
// A synthetic "location" so the existing header/nav styling works for it too.
const TOBUY = {
  key: 'tobuy', label: 'To Buy', icon: '🛒',
  accent: '#3F6F52', accentDark: '#2C4F3A', onAccent: '#FFFFFF',
  page: '#EFF5F0', container: '#DBEADF', onContainer: '#234032', navTint: '#E2EFE6',
};

// Bottom nav for phone — the 4 locations plus To Buy (the shared BottomNav only
// knows the 4 locations, so the web app uses its own).
function WebBottomNav({ active, onChange }) {
  const tabs = [...LOCATION_ORDER, 'tobuy'];
  return (
    <div style={{ display: 'flex', background: NEUTRAL.surface, borderTop: `1px solid ${NEUTRAL.outlineSoft}`, paddingTop: 8, paddingBottom: 6 }}>
      {tabs.map(key => {
        const l = key === 'tobuy' ? TOBUY : LOCATIONS[key];
        const on = active === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            flex: 1, border: 'none', background: 'none', cursor: 'pointer', font: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '2px 0',
          }}>
            <div style={{
              width: 56, height: 32, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on ? l.navTint : 'transparent', transition: 'background 0.2s', fontSize: 19,
              filter: on ? 'none' : 'grayscale(0.35)', opacity: on ? 1 : 0.78,
            }}>{l.icon}</div>
            <span style={{ fontSize: 11.5, fontWeight: on ? 700 : 500, color: on ? l.accentDark : NEUTRAL.onSurfaceVar }}>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// One row in the shopping list.
function BuyRow({ item, onBought, onEdit, onDelete }) {
  const accent = TOBUY.accent;
  return (
    <div className="fst-card" style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16,
      background: NEUTRAL.surface, border: `1px solid ${NEUTRAL.outlineSoft}`,
    }}>
      <button onClick={onBought} title="Got it" style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', padding: 0,
        border: `2px solid ${accent}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent,
      }}><Icon name="check" size={15} stroke={3} /></button>
      <div onClick={onEdit} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: NEUTRAL.onSurface, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
        <div style={{ fontSize: 12.5, color: NEUTRAL.onSurfaceVar, marginTop: 2 }}>
          {item.qty ? `${item.qty} ${item.unit || ''}`.trim() : ''}{item.qty && item.note ? ' · ' : ''}{item.note || (!item.qty ? `Added by ${item.addedBy}` : '')}
        </div>
      </div>
      <button onClick={onDelete} title="Remove" style={iconBtn(NEUTRAL.onSurfaceVar)}><Icon name="trash" size={18} /></button>
    </div>
  );
}

// The shopping list view (replaces the inventory body when tab === 'tobuy').
function ToBuyView({ buyItems, userName, onBought, onEdit, onDelete, onAdd, isDesktop }) {
  if (buyItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 32px', color: NEUTRAL.onSurfaceVar }}>
        <div style={{ fontSize: 46, marginBottom: 12 }}>🛒</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: NEUTRAL.onSurface }}>Your shopping list is empty</div>
        <div style={{ fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>Add things you need to restock — both of you<br />see the list update live.</div>
        <button onClick={onAdd} style={{
          marginTop: 20, border: 'none', cursor: 'pointer', font: 'inherit', fontSize: 15, fontWeight: 700,
          padding: '13px 22px', borderRadius: 100, background: TOBUY.accent, color: TOBUY.onAccent,
          display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 8px 22px ${TOBUY.accent}55`,
        }}><Icon name="add" size={20} stroke={2.4} /> Add to list</button>
      </div>
    );
  }
  const sorted = [...buyItems].sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || '') || a.name.localeCompare(b.name));
  return (
    <div style={{
      padding: isDesktop ? '10px 28px 40px' : '8px 16px 110px',
      display: isDesktop ? 'grid' : 'flex', flexDirection: 'column', gap: 10,
      gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined, alignItems: isDesktop ? 'start' : undefined,
    }}>
      {sorted.map(it => (
        <BuyRow key={it.id} item={it} onBought={() => onBought(it)} onEdit={() => onEdit(it)} onDelete={() => onDelete(it)} />
      ))}
    </div>
  );
}

// Add / edit a shopping-list item.
function AddBuySheet({ editing, userName, onClose, onSave }) {
  const accent = TOBUY.accent;
  const [name, setName] = uS(editing ? editing.name : '');
  const [qty, setQty] = uS(editing && editing.qty ? String(editing.qty) : '');
  const [unit, setUnit] = uS(editing && editing.unit ? editing.unit : 'pieces');
  const [note, setNote] = uS(editing ? (editing.note || '') : '');
  const [tried, setTried] = uS(false);
  const valid = name.trim();
  const save = () => {
    setTried(true);
    if (!valid) return;
    onSave({
      ...(editing || {}),
      name: name.trim(),
      qty: qty ? parseFloat(qty) || null : null,
      unit: qty ? unit : '',
      note: note.trim(),
      addedBy: editing ? editing.addedBy : userName,
      dateAdded: editing ? editing.dateAdded : isoToday(),
    });
  };
  return (
    <Scrim onClose={onClose}>
      <Sheet onClose={onClose} accent={accent} title={editing ? 'Edit item' : 'Add to shopping list'}>
        <div style={{ overflowY: 'auto', padding: '6px 18px 4px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="What to buy" required>
            <TextField value={name} onChange={setName} placeholder="e.g. Milk" accent={accent} invalid={tried && !valid} autoFocus={!editing} />
          </Field>
          <Field label="Quantity (optional)">
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={qty} onChange={e => setQty(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder="—"
                style={{ width: 96, flexShrink: 0, fontWeight: 600, boxSizing: 'border-box', font: 'inherit', fontSize: 15.5, padding: '12px 14px', borderRadius: 13, color: NEUTRAL.onSurface, border: `1.5px solid ${NEUTRAL.outlineSoft}`, background: NEUTRAL.bg, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = NEUTRAL.outlineSoft} />
              <div style={{ flex: 1 }}><SelectField value={unit} onChange={setUnit} options={UNITS} accent={accent} /></div>
            </div>
          </Field>
          <Field label="Note (optional)">
            <TextField value={note} onChange={setNote} placeholder="e.g. the lactose-free one" accent={accent} multiline />
          </Field>
        </div>
        <div style={{ padding: '14px 18px 18px', display: 'flex', gap: 12, borderTop: `1px solid ${NEUTRAL.outlineSoft}` }}>
          <button onClick={onClose} style={ghostBtn()}>Cancel</button>
          <button onClick={save} style={{ ...fillBtn(accent), opacity: valid ? 1 : 0.55 }}>
            <Icon name="check" size={19} stroke={2.4} /> {editing ? 'Save changes' : 'Add to list'}
          </button>
        </div>
      </Sheet>
    </Scrim>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
function App() {
  // undefined = still checking with Firebase, null = signed out, object = signed in
  const [authUser, setAuthUser] = uS(undefined);
  const [userName, setUserName] = uS(() => localStorage.getItem('fst_user') || '');
  const [items, setItems] = uS([]);
  const [buyItems, setBuyItems] = uS([]);
  const [buySheet, setBuySheet] = uS(null);   // {item} for edit, or {} for add
  const [loading, setLoading] = uS(true);
  const [connError, setConnError] = uS(false);
  const [tab, setTab] = uS('freezer');
  const [sortMap, setSortMap] = uS({ freezer: 'expiry', fridge: 'expiry', cellar: 'expiry', pantry: 'expiry' });
  const [filterMap, setFilterMap] = uS({ freezer: 'all', fridge: 'all', cellar: 'all', pantry: 'all' });
  const [sheet, setSheet] = uS(null);
  const [detail, setDetail] = uS(null);
  const [move, setMove] = uS(null);
  const [confirm, setConfirm] = uS(null);
  const [search, setSearch] = uS(false);
  const [notif, setNotif] = uS(false);
  const [toast, setToast] = uS(null);
  const [justAdded, setJustAdded] = uS(null);
  const scrollRef = uR(null);

  uE(() => { if (userName) localStorage.setItem('fst_user', userName); }, [userName]);

  // ── Firebase auth state (drives the login gate) ──
  uE(() => {
    if (!window.FST_AUTH) { setAuthUser(null); return; }
    return window.FST_AUTH.onChange(u => setAuthUser(u || null));
  }, []);

  // ── Live Firestore subscription (shared with the Android app) ──
  uE(() => {
    if (!authUser || !userName) return;
    if (!window.FST) { setConnError(true); setLoading(false); return; }
    setLoading(true); setConnError(false);
    let unsub = () => {};
    window.FST.seedIfEmpty().catch(e => console.error('seed error', e));
    const unsubItems = window.FST.subscribeToItems(
      list => { setItems(list); setLoading(false); },
      () => { setConnError(true); setLoading(false); }
    );
    const unsubBuy = window.FST.subscribeToBuy(list => setBuyItems(list));
    unsub = () => { unsubItems(); unsubBuy(); };
    return () => unsub();
  }, [authUser, userName]);

  const signOut = () => { window.FST_AUTH && window.FST_AUTH.signOut(); };

  const isBuy = tab === 'tobuy';
  const loc = isBuy ? TOBUY : LOCATIONS[tab];
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

  // ── mutations (write to Firestore; the snapshot listener refreshes state) ──
  const saveItem = async data => {
    setSheet(null);
    try {
      if (data.id) {
        await window.FST.saveItem(data);
        showToast('Changes saved');
      } else {
        const id = await window.FST.saveItem(data);
        setJustAdded(id);
        setTimeout(() => setJustAdded(null), 800);
        showToast(`Added to ${LOCATIONS[data.location].label}`);
      }
    } catch (e) { showToast('Could not save — check connection'); }
  };
  const reallyDelete = async item => {
    setConfirm(null); setDetail(null);
    try {
      await window.FST.deleteItem(item.id);
      showToast(`Deleted “${item.name}”`, 'Undo', async () => { await window.FST.saveItem(item); setToast(null); });
    } catch (e) { showToast('Could not delete — check connection'); }
  };
  const reallyUse = async item => {
    setConfirm(null); setDetail(null);
    try {
      await window.FST.deleteItem(item.id);
      showToast(`“${item.name}” marked as used`, 'Undo', async () => { await window.FST.saveItem(item); setToast(null); });
    } catch (e) { showToast('Could not update — check connection'); }
  };
  const doMove = async (item, target, category) => {
    setMove(null); setDetail(null);
    setTab(target);
    try {
      await window.FST.saveItem({ ...item, location: target, category });
      showToast(`Moved to ${LOCATIONS[target].label}`);
    } catch (e) { showToast('Could not move — check connection'); }
  };

  // ── shopping list mutations ──
  const saveBuy = async data => {
    setBuySheet(null);
    try {
      await window.FST.saveBuy(data);
      showToast(data.id ? 'List updated' : 'Added to shopping list');
    } catch (e) { showToast('Could not save — check connection'); }
  };
  const removeBuy = async (item, boughtMsg) => {
    try {
      await window.FST.deleteBuy(item.id);
      showToast(boughtMsg ? `Got “${item.name}” ✓` : `Removed “${item.name}”`, 'Undo',
        async () => { await window.FST.saveBuy(item); setToast(null); });
    } catch (e) { showToast('Could not update — check connection'); }
  };

  uE(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [tab]);

  const isDesktop = useIsDesktop();

  // ── Gates ──
  if (authUser === undefined) return <Splash tint={LOCATIONS.fridge.page} text="Connecting…" />;
  if (!authUser) return <AuthGate />;
  if (!userName) return <WebShell tint={LOCATIONS.fridge.page}><NameEntry onSet={setUserName} /></WebShell>;
  if (connError) return <Splash tint={loc.page} text="Can't reach the shared inventory. Check the Firebase config in web-config.jsx and your connection." />;
  if (loading) return <Splash tint={loc.page} text="Loading shared inventory…" />;

  // ── Shared overlay layer (sheets, dialogs, search, notifications, toast) ──
  const overlays = (
    <>
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
      {buySheet && <AddBuySheet editing={buySheet && buySheet.id ? buySheet : null} userName={userName} onClose={() => setBuySheet(null)} onSave={saveBuy} />}
    </>
  );

  // ── Shared item area: a grid on desktop, a single column on phone ──
  const cards = shown.map(it => (
    <ItemCard key={it.id} item={it} loc={loc} justAdded={it.id === justAdded} onClick={() => setDetail(it)} />
  ));
  const itemsArea =
    tabItems.length === 0 ? <EmptyState loc={loc} onAdd={() => setSheet({ mode: 'add' })} />
      : shown.length === 0 ? <EmptyState loc={loc} filtered onAdd={() => setSheet({ mode: 'add' })} />
        : isDesktop
          ? <div style={{ padding: '6px 28px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))', gap: 12, alignItems: 'start' }}>{cards}</div>
          : <div style={{ padding: '2px 16px 110px', display: 'flex', flexDirection: 'column', gap: 10 }}>{cards}</div>;

  // ── Body + header helpers that switch between inventory and the shopping list ──
  const addClick = isBuy ? () => setBuySheet({}) : () => setSheet({ mode: 'add' });
  const buyView = (
    <ToBuyView buyItems={buyItems} userName={userName} isDesktop={isDesktop}
      onBought={it => removeBuy(it, true)} onEdit={it => setBuySheet(it)} onDelete={it => removeBuy(it, false)} onAdd={() => setBuySheet({})} />
  );
  const headerSub = isBuy
    ? `${buyItems.length} ${buyItems.length === 1 ? 'thing' : 'things'} to buy`
    : `${tabItems.length} ${tabItems.length === 1 ? 'item' : 'items'}`;
  const inventoryBody = (
    <>
      <SummaryBar items={tabItems} loc={loc} />
      {tabItems.length > 0 && (
        <Controls loc={loc} items={tabItems} sortBy={sortBy} setSortBy={setSortBy} filter={filter} setFilter={setFilter} />
      )}
      {itemsArea}
    </>
  );

  const notifBell = (
    <button onClick={() => setNotif(true)} style={{ ...iconBtn(loc.accentDark, '#ffffffcc'), position: 'relative' }}>
      <Icon name="bell" size={21} />
      {expiringCount > 0 && (
        <span style={{ position: 'absolute', top: 5, right: 5, minWidth: 16, height: 16, padding: '0 3px', borderRadius: 8, background: EXPIRY.soon.dot, color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 2px ${loc.page}` }}>{expiringCount}</span>
      )}
    </button>
  );

  // ── DESKTOP layout: sidebar + content panel ──
  if (isDesktop) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: PAGE_BG, padding: 24, boxSizing: 'border-box' }}>
        <div style={{
          width: '100%', maxWidth: 1180, height: 'min(900px, 94vh)', position: 'relative', display: 'flex',
          background: NEUTRAL.bg, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.28)',
        }}>
          {/* Sidebar */}
          <div style={{ width: 252, flexShrink: 0, background: NEUTRAL.surface, borderRight: `1px solid ${NEUTRAL.outlineSoft}`, display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 8px 20px' }}>
              <div style={{ fontSize: 27 }}>🧊</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: NEUTRAL.onSurface, letterSpacing: -0.3, lineHeight: 1.1 }}>Food Storage</div>
                <div style={{ fontSize: 12, color: NEUTRAL.onSurfaceVar }}>Shared household</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {LOCATION_ORDER.map(k => {
                const l = LOCATIONS[k]; const on = k === tab;
                const count = items.filter(i => i.location === k).length;
                return (
                  <button key={k} onClick={() => setTab(k)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                    font: 'inherit', textAlign: 'left', border: 'none', width: '100%', transition: 'background .15s',
                    background: on ? l.container : 'transparent', color: on ? l.onContainer : NEUTRAL.onSurface,
                    fontWeight: on ? 700 : 600, fontSize: 15,
                  }}>
                    <span style={{ fontSize: 20 }}>{l.icon}</span>
                    <span style={{ flex: 1 }}>{l.label}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: on ? l.accentDark : NEUTRAL.onSurfaceVar, background: on ? '#ffffffaa' : NEUTRAL.surfaceDim, borderRadius: 20, padding: '2px 9px', minWidth: 20, textAlign: 'center' }}>{count}</span>
                  </button>
                );
              })}
              <div style={{ height: 1, background: NEUTRAL.outlineSoft, margin: '8px 8px' }} />
              {(() => {
                const on = isBuy;
                return (
                  <button onClick={() => setTab('tobuy')} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                    font: 'inherit', textAlign: 'left', border: 'none', width: '100%', transition: 'background .15s',
                    background: on ? TOBUY.container : 'transparent', color: on ? TOBUY.onContainer : NEUTRAL.onSurface,
                    fontWeight: on ? 700 : 600, fontSize: 15,
                  }}>
                    <span style={{ fontSize: 20 }}>{TOBUY.icon}</span>
                    <span style={{ flex: 1 }}>{TOBUY.label}</span>
                    {buyItems.length > 0 && <span style={{ fontSize: 12.5, fontWeight: 700, color: on ? TOBUY.accentDark : NEUTRAL.onSurfaceVar, background: on ? '#ffffffaa' : NEUTRAL.surfaceDim, borderRadius: 20, padding: '2px 9px', minWidth: 20, textAlign: 'center' }}>{buyItems.length}</span>}
                  </button>
                );
              })()}
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${NEUTRAL.outlineSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 8px 12px' }}>
                <span style={{ display: 'flex' }}>
                  <Avatar name="Alex" size={22} ring={NEUTRAL.surface} />
                  <span style={{ marginLeft: -7 }}><Avatar name="Madalina" size={22} ring={NEUTRAL.surface} /></span>
                </span>
                <span style={{ fontSize: 12, color: NEUTRAL.onSurfaceVar, fontWeight: 500 }}>{userName} · synced live</span>
              </div>
              <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 12, cursor: 'pointer', font: 'inherit', fontSize: 14, fontWeight: 600, border: 'none', background: 'transparent', color: NEUTRAL.onSurfaceVar, width: '100%' }}>
                <Icon name="logout" size={18} /> Sign out
              </button>
            </div>
          </div>

          {/* Main panel */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: loc.page }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 28px 14px' }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: loc.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: `0 3px 10px ${loc.accent}40` }}>{loc.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: loc.accentDark, letterSpacing: -0.5, lineHeight: 1.1 }}>{loc.label}</div>
                <div style={{ fontSize: 12.5, color: NEUTRAL.onSurfaceVar, fontWeight: 500 }}>{headerSub}</div>
              </div>
              {!isBuy && <button onClick={() => setSearch(true)} style={iconBtn(loc.accentDark, '#ffffffcc')}><Icon name="search" size={22} /></button>}
              {!isBuy && notifBell}
              <button onClick={addClick} style={{
                height: 44, borderRadius: 14, border: 'none', cursor: 'pointer', background: loc.accent, color: loc.onAccent,
                display: 'flex', alignItems: 'center', gap: 7, padding: '0 18px 0 14px', marginLeft: 4,
                boxShadow: `0 6px 16px ${loc.accent}55`, font: 'inherit', fontSize: 15, fontWeight: 700,
              }}>
                <Icon name="add" size={22} stroke={2.4} /> {isBuy ? 'Add to list' : 'Add item'}
              </button>
            </div>
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto' }}>
              {isBuy ? buyView : inventoryBody}
            </div>
          </div>

          {overlays}
        </div>
      </div>
    );
  }

  // ── PHONE layout ──
  return (
    <WebShell tint={loc.page}>
      {/* App bar */}
      <div style={{ background: loc.page, padding: 'env(safe-area-inset-top) 8px 4px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px 6px' }}>
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
          {notifBell}
          <button onClick={signOut} title="Sign out" style={iconBtn(loc.accentDark, '#ffffffcc')}><Icon name="logout" size={20} /></button>
        </div>
      </div>

      {/* scroll region */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', background: loc.page }}>
        {isBuy ? buyView : (
          <>
            <div style={{ paddingTop: 6 }}><SummaryBar items={tabItems} loc={loc} /></div>
            {tabItems.length > 0 && (
              <Controls loc={loc} items={tabItems} sortBy={sortBy} setSortBy={setSortBy} filter={filter} setFilter={setFilter} />
            )}
            {itemsArea}
          </>
        )}
      </div>

      {/* FAB */}
      <button onClick={addClick} style={{
        position: 'absolute', right: 18, bottom: 90, zIndex: 30, height: 56, borderRadius: 18, border: 'none', cursor: 'pointer',
        background: loc.accent, color: loc.onAccent, display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px 0 16px',
        boxShadow: `0 8px 22px ${loc.accent}55`, font: 'inherit', fontSize: 15.5, fontWeight: 700,
      }}>
        <Icon name="add" size={24} stroke={2.4} /> Add
      </button>

      <WebBottomNav active={tab} onChange={setTab} />

      {overlays}
    </WebShell>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
