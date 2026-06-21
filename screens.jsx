// screens.jsx — overlays: name entry, add/edit sheet, detail, move, search, notifications, dialogs
// Depends on theme.jsx, icons.jsx, components.jsx globals + React hooks.
const { useState, useEffect, useRef } = React;

// ── Scrim + bottom sheet wrapper ────────────────────────────
function Scrim({ onClose, children, align = 'flex-end' }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 40, background: NEUTRAL.scrim,
      display: 'flex', flexDirection: 'column', justifyContent: align,
      animation: 'fst-fade 0.18s ease',
    }}>{children}</div>
  );
}

function Sheet({ children, accent, onClose, title, maxH = '88%' }) {
  return (
    <div onClick={e => e.stopPropagation()} style={{
      background: NEUTRAL.surface, borderRadius: '26px 26px 0 0', maxHeight: maxH,
      width: '100%', maxWidth: 470, marginLeft: 'auto', marginRight: 'auto',
      display: 'flex', flexDirection: 'column', animation: 'fst-slide-up 0.26s cubic-bezier(.2,.8,.2,1)',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.18)', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
        <div style={{ width: 34, height: 4, borderRadius: 2, background: NEUTRAL.outline }} />
      </div>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px 4px' }}>
          <span style={{ flex: 1, fontSize: 20, fontWeight: 700, color: NEUTRAL.onSurface, letterSpacing: -0.3 }}>{title}</span>
          <button onClick={onClose} style={iconBtn(NEUTRAL.onSurfaceVar)}><Icon name="close" size={22} /></button>
        </div>
      )}
      {children}
    </div>
  );
}

function iconBtn(color, bg = 'transparent') {
  return {
    width: 38, height: 38, borderRadius: '50%', border: 'none', background: bg, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0, padding: 0,
  };
}

// ── Form fields ─────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: NEUTRAL.onSurfaceVar, marginBottom: 6, letterSpacing: 0.1 }}>
        {label}{required && <span style={{ color: EXPIRY.expired.text }}> *</span>}
      </div>
      {children}
    </label>
  );
}

const inputStyle = (accent, invalid) => ({
  width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: 15.5,
  padding: '12px 14px', borderRadius: 13, color: NEUTRAL.onSurface,
  border: `1.5px solid ${invalid ? EXPIRY.expired.dot : NEUTRAL.outlineSoft}`,
  background: NEUTRAL.bg, outline: 'none', transition: 'border-color 0.15s',
});

function TextField({ value, onChange, placeholder, accent, multiline, invalid, autoFocus }) {
  const ref = useRef(null);
  const onFocus = e => { e.target.style.borderColor = accent; };
  const onBlur = e => { e.target.style.borderColor = invalid ? EXPIRY.expired.dot : NEUTRAL.outlineSoft; };
  if (multiline) {
    return <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      onFocus={onFocus} onBlur={onBlur} rows={2} style={{ ...inputStyle(accent, invalid), resize: 'none', lineHeight: 1.4 }} />;
  }
  return <input ref={ref} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    autoFocus={autoFocus} onFocus={onFocus} onBlur={onBlur} style={inputStyle(accent, invalid)} />;
}

function SelectField({ value, onChange, options, accent, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        ...inputStyle(accent), display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', textAlign: 'left', borderColor: open ? accent : NEUTRAL.outlineSoft,
        color: value ? NEUTRAL.onSurface : NEUTRAL.onSurfaceVar,
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || placeholder}</span>
        <Icon name="chevronDown" size={18} style={{ color: NEUTRAL.onSurfaceVar, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 2,
            background: NEUTRAL.surface, borderRadius: 14, border: `1px solid ${NEUTRAL.outlineSoft}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.16)', maxHeight: 230, overflowY: 'auto', padding: 6,
          }}>
            {options.map(opt => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                border: 'none', background: opt === value ? `${accent}14` : 'transparent', cursor: 'pointer',
                font: 'inherit', fontSize: 15, padding: '10px 12px', borderRadius: 9, textAlign: 'left',
                color: NEUTRAL.onSurface,
              }}>
                {opt}{opt === value && <Icon name="check" size={17} style={{ color: accent }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DateField({ value, onChange, accent, allowClear }) {
  const ref = useRef(null);
  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => { ref.current && (ref.current.showPicker ? ref.current.showPicker() : ref.current.focus()); }}
        style={{ ...inputStyle(accent), display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <Icon name="calendar" size={18} style={{ color: accent }} />
        <span style={{ flex: 1, color: value ? NEUTRAL.onSurface : NEUTRAL.onSurfaceVar }}>
          {value ? fmtDate(value) : 'Not set'}
        </span>
        {allowClear && value && (
          <button type="button" onClick={e => { e.stopPropagation(); onChange(''); }} style={iconBtn(NEUTRAL.onSurfaceVar)}>
            <Icon name="close" size={16} />
          </button>
        )}
      </div>
      <input ref={ref} type="date" value={value || ''} onChange={e => onChange(e.target.value)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />
    </div>
  );
}

// ── First-launch name entry ─────────────────────────────────
function NameEntry({ onSet }) {
  const [name, setName] = useState('');
  const accent = LOCATIONS.fridge.accent;
  const submit = () => { if (name.trim()) onSet(name.trim()); };
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60, background: NEUTRAL.bg,
      display: 'flex', flexDirection: 'column', padding: '8% 28px 40px', animation: 'fst-fade 0.25s ease',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 6, fontSize: 40, marginBottom: 22 }}>
          <span>🧊</span><span>❄️</span><span>🛢️</span><span>🫙</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: NEUTRAL.onSurface, margin: 0, letterSpacing: -0.6, lineHeight: 1.15 }}>
          Welcome to your<br />shared pantry
        </h1>
        <p style={{ fontSize: 15, color: NEUTRAL.onSurfaceVar, lineHeight: 1.5, marginTop: 12, marginBottom: 30 }}>
          One inventory for your whole home — freezer, fridge, cellar and pantry, synced live between you and Madalina.
        </p>
        <Field label="What should we call you?">
          <TextField value={name} onChange={setName} placeholder="e.g. Alex" accent={accent} autoFocus />
        </Field>
        <p style={{ fontSize: 12.5, color: NEUTRAL.onSurfaceVar, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="person" size={15} /> Saved on this device and shown on items you add.
        </p>
      </div>
      <button onClick={submit} disabled={!name.trim()} style={{
        border: 'none', cursor: name.trim() ? 'pointer' : 'default', font: 'inherit',
        background: name.trim() ? accent : NEUTRAL.outlineSoft, color: name.trim() ? '#fff' : NEUTRAL.onSurfaceVar,
        fontWeight: 700, fontSize: 16, padding: '15px', borderRadius: 100, transition: 'background .2s',
      }}>Start tracking</button>
    </div>
  );
}

// ── Add / Edit item sheet ───────────────────────────────────
function AddEditSheet({ locKey, editing, onClose, onSave, userName, allowRestock }) {
  const loc = LOCATIONS[locKey];
  const [name, setName] = useState(editing ? editing.name : '');
  const [category, setCategory] = useState(editing ? editing.category : '');
  const [description, setDescription] = useState(editing ? editing.description : '');
  const [qty, setQty] = useState(editing ? String(editing.qty) : '1');
  const [unit, setUnit] = useState(editing ? editing.unit : 'pieces');
  const [dateAdded, setDateAdded] = useState(editing ? editing.dateAdded : isoToday());
  const [expiry, setExpiry] = useState(editing ? editing.expiry : '');
  const [autoRestock, setAutoRestock] = useState(editing && editing.autoRestock ? true : false);
  const [tried, setTried] = useState(false);

  const valid = name.trim() && category;
  const save = () => {
    setTried(true);
    if (!valid) return;
    onSave({
      ...(editing || {}),
      ...(allowRestock ? { autoRestock } : {}),
      name: name.trim(), category, description: description.trim(),
      qty: parseFloat(qty) || 0, unit, dateAdded, expiry,
      location: locKey,
      addedBy: editing ? editing.addedBy : userName,
    });
  };

  return (
    <Scrim onClose={onClose}>
      <Sheet onClose={onClose} accent={loc.accent}
        title={editing ? 'Edit item' : `Add to ${loc.label}`}>
        <div style={{ overflowY: 'auto', padding: '6px 18px 4px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Name" required>
            <TextField value={name} onChange={setName} placeholder="e.g. Chicken thighs" accent={loc.accent}
              invalid={tried && !name.trim()} autoFocus={!editing} />
          </Field>
          <Field label="Category" required>
            <SelectField value={category} onChange={setCategory} options={CATEGORIES[locKey]} accent={loc.accent}
              placeholder="Choose a category" />
          </Field>
          <Field label="Quantity">
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={qty} onChange={e => setQty(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal"
                style={{ ...inputStyle(loc.accent), width: 96, flexShrink: 0, fontWeight: 600 }}
                onFocus={e => e.target.style.borderColor = loc.accent}
                onBlur={e => e.target.style.borderColor = NEUTRAL.outlineSoft} />
              <div style={{ flex: 1 }}>
                <SelectField value={unit} onChange={setUnit} options={UNITS} accent={loc.accent} />
              </div>
            </div>
          </Field>
          <Field label="Description">
            <TextField value={description} onChange={setDescription} placeholder="Optional notes" accent={loc.accent} multiline />
          </Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Field label="Date added"><DateField value={dateAdded} onChange={setDateAdded} accent={loc.accent} /></Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Expiry date"><DateField value={expiry} onChange={setExpiry} accent={loc.accent} allowClear /></Field>
            </div>
          </div>
          {allowRestock && (
            <div onClick={() => setAutoRestock(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, cursor: 'pointer',
              background: NEUTRAL.surfaceDim,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: NEUTRAL.onSurface }}>Auto-Restock</div>
                <div style={{ fontSize: 12.5, color: NEUTRAL.onSurfaceVar, marginTop: 2 }}>Add to shopping list when fully used</div>
              </div>
              <div style={{ width: 44, height: 26, borderRadius: 13, flexShrink: 0, position: 'relative', background: autoRestock ? loc.accent : NEUTRAL.outline, transition: 'background .2s' }}>
                <div style={{ position: 'absolute', top: 3, left: autoRestock ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: NEUTRAL.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left .2s' }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '14px 18px', paddingBottom: 18, display: 'flex', gap: 12, borderTop: `1px solid ${NEUTRAL.outlineSoft}` }}>
          <button onClick={onClose} style={ghostBtn()}>Cancel</button>
          <button onClick={save} style={{ ...fillBtn(loc.accent), opacity: valid ? 1 : 0.55 }}>
            <Icon name="check" size={19} stroke={2.4} /> {editing ? 'Save changes' : 'Add item'}
          </button>
        </div>
      </Sheet>
    </Scrim>
  );
}

function ghostBtn() {
  return {
    flex: '0 0 auto', padding: '13px 20px', borderRadius: 100, cursor: 'pointer', font: 'inherit',
    fontSize: 15, fontWeight: 600, border: `1.5px solid ${NEUTRAL.outline}`, background: 'transparent',
    color: NEUTRAL.onSurfaceVar,
  };
}
function fillBtn(accent) {
  return {
    flex: 1, padding: '13px 18px', borderRadius: 100, cursor: 'pointer', font: 'inherit',
    fontSize: 15, fontWeight: 700, border: 'none', background: accent, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity .15s',
  };
}

// ── Item detail sheet ───────────────────────────────────────
function DetailSheet({ item, onClose, onEdit, onDelete, onUse, onMove }) {
  const loc = LOCATIONS[item.location];
  const st = expiryStatus(item.expiry);
  const Row = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0', borderBottom: `1px solid ${NEUTRAL.outlineSoft}`, gap: 16 }}>
      <span style={{ fontSize: 13.5, color: NEUTRAL.onSurfaceVar, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14.5, fontWeight: 600, color: color || NEUTRAL.onSurface, textAlign: 'right', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
  return (
    <Scrim onClose={onClose}>
      <Sheet onClose={onClose} accent={loc.accent}>
        <div style={{ overflowY: 'auto', padding: '0 20px 4px' }}>
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: loc.container, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{loc.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: NEUTRAL.onSurface, letterSpacing: -0.4, lineHeight: 1.15 }}>{item.name}</h2>
              <div style={{ marginTop: 8 }}><CategoryBadge loc={loc}>{loc.label} · {item.category}</CategoryBadge></div>
            </div>
            <button onClick={onClose} style={iconBtn(NEUTRAL.onSurfaceVar)}><Icon name="close" size={22} /></button>
          </div>

          {/* expiry banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 14, background: st.bg, margin: '14px 0 6px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 700, color: st.text }}>{item.expiry ? expiryPhrase(item.expiry) : 'No expiry date set'}</span>
            {item.expiry && <span style={{ fontSize: 13, color: st.text, opacity: 0.85, whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(item.expiry)}</span>}
          </div>

          {item.description && (
            <p style={{ fontSize: 14.5, color: NEUTRAL.onSurface, lineHeight: 1.5, margin: '12px 0 4px' }}>{item.description}</p>
          )}

          <div style={{ marginTop: 8 }}>
            <Row label="Quantity" value={`${item.qty} ${item.unit}`} />
            <Row label="Date added" value={fmtDate(item.dateAdded)} />
            <Row label="Added by" value={item.addedBy} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${NEUTRAL.outlineSoft}`, gap: 16 }}>
              <span style={{ fontSize: 13.5, color: NEUTRAL.onSurfaceVar }}>Auto-Restock</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, borderRadius: 8, padding: '4px 10px',
                background: item.autoRestock ? EXPIRY.fine.bg : NEUTRAL.surfaceDim,
                color: item.autoRestock ? EXPIRY.fine.text : NEUTRAL.onSurfaceVar }}>
                {item.autoRestock ? '↺ Enabled' : 'Off'}
              </span>
            </div>
          </div>

          {/* actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '18px 0' }}>
            <ActionBtn icon="edit" label="Edit" onClick={() => onEdit(item)} accent={loc.accent} />
            <ActionBtn icon="swap" label="Move" onClick={() => onMove(item)} accent={loc.accent} />
            <ActionBtn icon="check" label="Mark as used" onClick={() => onUse(item)} accent={EXPIRY.fine.text} tint={EXPIRY.fine.bg} />
            <ActionBtn icon="trash" label="Delete" onClick={() => onDelete(item)} accent={EXPIRY.expired.text} tint={EXPIRY.expired.bg} />
          </div>
        </div>
      </Sheet>
    </Scrim>
  );
}

function ActionBtn({ icon, label, onClick, accent, tint }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 14, cursor: 'pointer',
      font: 'inherit', fontSize: 14.5, fontWeight: 600, border: 'none',
      background: tint || `${accent}12`, color: accent, textAlign: 'left',
    }}>
      <Icon name={icon} size={19} /> {label}
    </button>
  );
}

// ── Move sheet ──────────────────────────────────────────────
function MoveSheet({ item, onClose, onConfirm }) {
  const [target, setTarget] = useState(null);
  const [category, setCategory] = useState('');
  const src = LOCATIONS[item.location];
  const others = LOCATION_ORDER.filter(k => k !== item.location);
  return (
    <Scrim onClose={onClose}>
      <Sheet onClose={onClose} title="Move item" accent={src.accent}>
        <div style={{ overflowY: 'auto', padding: '4px 18px 6px' }}>
          <p style={{ fontSize: 14, color: NEUTRAL.onSurfaceVar, margin: '0 0 14px' }}>
            Move <b style={{ color: NEUTRAL.onSurface }}>{item.name}</b> from {src.icon} {src.label} to:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {others.map(k => {
              const l = LOCATIONS[k]; const on = target === k;
              return (
                <button key={k} onClick={() => { setTarget(k); setCategory(''); }} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 14, cursor: 'pointer',
                  font: 'inherit', textAlign: 'left', background: on ? l.container : NEUTRAL.bg,
                  border: `1.5px solid ${on ? l.accent : NEUTRAL.outlineSoft}`,
                }}>
                  <span style={{ fontSize: 22 }}>{l.icon}</span>
                  <span style={{ flex: 1, fontSize: 15.5, fontWeight: 600, color: on ? l.onContainer : NEUTRAL.onSurface }}>{l.label}</span>
                  {on && <Icon name="check" size={20} style={{ color: l.accent }} />}
                </button>
              );
            })}
          </div>
          {target && (
            <div style={{ marginTop: 16, animation: 'fst-fade .2s ease' }}>
              <Field label={`Category in ${LOCATIONS[target].label}`} required>
                <SelectField value={category} onChange={setCategory} options={CATEGORIES[target]} accent={LOCATIONS[target].accent} placeholder="Choose a category" />
              </Field>
            </div>
          )}
        </div>
        <div style={{ padding: '14px 18px 18px', display: 'flex', gap: 12, borderTop: `1px solid ${NEUTRAL.outlineSoft}` }}>
          <button onClick={onClose} style={ghostBtn()}>Cancel</button>
          <button onClick={() => target && category && onConfirm(target, category)}
            style={{ ...fillBtn(target ? LOCATIONS[target].accent : NEUTRAL.outline), opacity: target && category ? 1 : 0.5 }}>
            <Icon name="swap" size={18} /> Move here
          </button>
        </div>
      </Sheet>
    </Scrim>
  );
}

// ── Confirm dialog ──────────────────────────────────────────
function ConfirmDialog({ title, body, confirmLabel, danger, icon, accent, onCancel, onConfirm }) {
  return (
    <Scrim onClose={onCancel} align="center">
      <div onClick={e => e.stopPropagation()} style={{
        width: 'calc(100% - 52px)', maxWidth: 380, margin: '0 auto',
        background: NEUTRAL.surface, borderRadius: 26, padding: '24px 22px 18px',
        animation: 'fst-pop 0.22s ease', boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: danger ? EXPIRY.expired.bg : `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: danger ? EXPIRY.expired.text : accent }}>
          <Icon name={icon} size={24} />
        </div>
        <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: NEUTRAL.onSurface, letterSpacing: -0.3 }}>{title}</h3>
        <p style={{ fontSize: 14.5, color: NEUTRAL.onSurfaceVar, lineHeight: 1.5, margin: '8px 0 22px' }}>{body}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={ghostBtn()}>Cancel</button>
          <button onClick={onConfirm} style={{
            ...fillBtn(danger ? EXPIRY.expired.dot : accent), flex: '0 0 auto', padding: '13px 22px',
          }}>{confirmLabel}</button>
        </div>
      </div>
    </Scrim>
  );
}

Object.assign(window, {
  Scrim, Sheet, NameEntry, AddEditSheet, DetailSheet, MoveSheet, ConfirmDialog,
  Field, TextField, SelectField, DateField, iconBtn, ghostBtn, fillBtn,
});
