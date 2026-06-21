// icons.jsx — Material-style line icons. All use currentColor + size prop.
// Exposes: Icon  ->  <Icon name="search" size={24} />

const ICON_PATHS = {
  search: 'M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z',
  sort: 'M4 6h16M6 12h12M9 18h6',
  filter: 'M4 5h16M7 12h10M10 19h4',
  add: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6L6 18',
  back: 'M15 18l-6-6 6-6',
  edit: 'M4 20h4L18.5 9.5a2.12 2.12 0 00-3-3L5 17v3z M13.5 6.5l3 3',
  trash: 'M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13',
  check: 'M5 13l4 4L19 7',
  move: 'M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20',
  bell: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  calendar: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  person: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1',
  chevronDown: 'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  clock: 'M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z',
  box: 'M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4 9-4M12 11v10',
  tag: 'M3 12V5a2 2 0 012-2h7l9 9-9 9-9-9zM7.5 7.5h.01',
  more: 'M12 6h.01M12 12h.01M12 18h.01',
  swap: 'M7 16l-4-4 4-4M3 12h13M17 8l4 4-4 4M21 12H8',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  lock: 'M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1zM8 11V7a4 4 0 018 0v4',
};

function Icon({ name, size = 24, stroke = 2, style = {}, fill = false }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  const segs = d.split(' M').map((s, i) => (i === 0 ? s : 'M' + s));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0, ...style }}
      fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {segs.map((seg, i) => <path key={i} d={seg} />)}
    </svg>
  );
}

Object.assign(window, { Icon });
