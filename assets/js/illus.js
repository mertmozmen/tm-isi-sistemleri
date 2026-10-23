/* TM Isı Sistemleri — animasyonlu ürün çizimleri.
   TMArt.svg(type, {title, accent}) -> SVG string (viewBox 0 0 240 200).
   Gerçek ürün fotoğrafı eklendiğinde (assets/img/urunler/<id>.jpg) katalog onu kullanır. */
(function () {
  let n = 0;

  function defs(u) {
    return `<defs>
      <linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6D98A"/><stop offset=".45" stop-color="#D3A040"/><stop offset="1" stop-color="#8A5B14"/></linearGradient>
      <linearGradient id="${u}bh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A5B14"/><stop offset=".5" stop-color="#E8BE62"/><stop offset="1" stop-color="#8A5B14"/></linearGradient>
      <linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DDE3EE"/></linearGradient>
      <linearGradient id="${u}n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A54B5"/><stop offset="1" stop-color="#0B1F55"/></linearGradient>
      <linearGradient id="${u}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4475E"/><stop offset="1" stop-color="#A80C25"/></linearGradient>
      <linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7F9FC"/><stop offset=".5" stop-color="#C3CBD9"/><stop offset="1" stop-color="#8792A8"/></linearGradient>
      <linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A5468"/><stop offset="1" stop-color="#1D2433"/></linearGradient>
      <linearGradient id="${u}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9E8DA"/><stop offset="1" stop-color="#B2CDB6"/></linearGradient>
      <linearGradient id="${u}hc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E11B38"/><stop offset="1" stop-color="#2A54B5"/></linearGradient>
      <radialGradient id="${u}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0B1430" stop-opacity=".28"/><stop offset="1" stop-color="#0B1430" stop-opacity="0"/></radialGradient>
    </defs>`;
  }

  const shadow = (u, cx = 120, w = 92, y = 182) =>
    `<ellipse cx="${cx}" cy="${y}" rx="${w}" ry="9" fill="url(#${u}s)"/>`;

  // Yatay pirinç boru + somunlar
  function pipe(u, y = 120, h = 26, x1 = 22, x2 = 218) {
    return `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${h}" rx="6" fill="url(#${u}b)"/>
      <rect x="${x1 - 8}" y="${y - 6}" width="22" height="${h + 12}" rx="4" fill="url(#${u}b)" stroke="#7A4E10" stroke-opacity=".35"/>
      <rect x="${x2 - 14}" y="${y - 6}" width="22" height="${h + 12}" rx="4" fill="url(#${u}b)" stroke="#7A4E10" stroke-opacity=".35"/>
      <line x1="${x1 - 1}" y1="${y - 6}" x2="${x1 - 1}" y2="${y + h + 6}" stroke="#7A4E10" stroke-opacity=".3"/>
      <line x1="${x2 + 1}" y1="${y - 6}" x2="${x2 + 1}" y2="${y + h + 6}" stroke="#7A4E10" stroke-opacity=".3"/>
      <line class="tm-flow" x1="${x1 + 6}" y1="${y + h / 2}" x2="${x2 - 6}" y2="${y + h / 2}" stroke="#FFF7DF" stroke-opacity=".75" stroke-width="2.5" stroke-linecap="round"/>`;
  }

  function lcd(u, x, y, w, h, v, unit, step = 0.1, dec = 1, size = 17) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="url(#${u}l)" stroke="#8FA894" stroke-opacity=".6"/>
      <text x="${x + 6}" y="${y + 10}" font-size="6.5" font-family="Manrope,sans-serif" font-weight="700" fill="#2B3B2F" opacity=".7">${unit}</text>
      <text class="tm-lcd" data-v="${v}" data-step="${step}" data-dec="${dec}" x="${x + w - 6}" y="${y + h - 8}" text-anchor="end" font-size="${size}" font-family="'JetBrains Mono',ui-monospace,monospace" font-weight="600" fill="#1C2A20" letter-spacing=".5">${Number(v).toFixed(dec)}</text>`;
  }

  const waves = (x, y, dir = 1, col = '#2A54B5') =>
    [0, 1, 2].map(i => `<path class="tm-wave" style="animation-delay:${i * 0.45}s" d="M${x} ${y - 10 - i * 5} q${dir * (8 + i * 5)} ${10 + i * 5} 0 ${20 + i * 10}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>`).join('');

  function impeller(cx, cy, r, col = '#0B1F55', blades = 6) {
    let p = '';
    for (let i = 0; i < blades; i++) {
      const a = (i * 360) / blades;
      p += `<path d="M0 0 C ${r * 0.35} ${-r * 0.2}, ${r * 0.7} ${-r * 0.3}, ${r} 0 C ${r * 0.7} ${r * 0.08}, ${r * 0.3} ${r * 0.12}, 0 0Z" transform="rotate(${a})" fill="${col}" opacity=".9"/>`;
    }
    return `<g transform="translate(${cx} ${cy})"><g class="tm-spin">${p}<circle r="${r * 0.22}" fill="#E8ECF4" stroke="${col}" stroke-width="1.5"/></g></g>`;
  }

  function radio(x, y, col = '#E11B38') {
    return [0, 1, 2].map(i => `<path class="tm-ping" style="animation-delay:${i * 0.35}s" d="M${x - 8 - i * 7} ${y - 6 - i * 6} a${11 + i * 9} ${11 + i * 9} 0 0 1 ${16 + i * 14} 0" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/>`).join('');
  }

  const bolt = (x, y) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#E9EDF4" stroke="#6B7690" stroke-width="1"/>`;

  /* ---------- tipler ---------- */
  const T = {};

  T['heat-us'] = (u) => `${shadow(u)}${pipe(u, 124, 26)}
    <path d="M70 146 C 52 172, 30 164, 22 178" fill="none" stroke="#E11B38" stroke-width="3.2" stroke-linecap="round"/>
    <rect x="14" y="172" width="16" height="7" rx="3" fill="url(#${u}c)"/>
    <rect x="52" y="46" width="136" height="104" rx="20" fill="url(#${u}w)" stroke="#C9D1E3"/>
    <rect x="52" y="46" width="136" height="16" rx="8" fill="#0B1F55" opacity=".06"/>
    ${lcd(u, 66, 66, 108, 38, 48213.4, 'kWh', 0.3)}
    <circle cx="160" cy="128" r="9" fill="url(#${u}n)"/><circle cx="160" cy="128" r="3" fill="#fff" opacity=".7"/>
    <rect x="68" y="120" width="40" height="5" rx="2.5" fill="#C9D1E3"/><rect x="68" y="130" width="26" height="5" rx="2.5" fill="#E11B38" opacity=".8"/>
    ${waves(42, 137, -1)}${waves(198, 137, 1)}`;

  T['heat-mech'] = (u) => `${shadow(u)}${pipe(u, 132, 26)}
    <path d="M78 150 C 58 176, 34 166, 24 180" fill="none" stroke="#E11B38" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="120" cy="92" r="60" fill="url(#${u}w)" stroke="#C9D1E3"/>
    <circle cx="120" cy="92" r="50" fill="none" stroke="#0B1F55" stroke-opacity=".12" stroke-width="6"/>
    ${lcd(u, 82, 62, 76, 28, 1834.2, 'MWh', 0.1, 1, 14)}
    <circle cx="120" cy="120" r="17" fill="#EEF2F8" stroke="#C9D1E3"/>
    ${impeller(120, 120, 13, '#E11B38', 5)}`;

  T['heat-flange'] = (u) => `${shadow(u, 120, 104)}
    <rect x="36" y="124" width="168" height="44" rx="8" fill="url(#${u}n)"/>
    <rect x="36" y="128" width="168" height="8" rx="4" fill="#fff" opacity=".12"/>
    <rect x="22" y="110" width="18" height="72" rx="4" fill="url(#${u}c)"/><rect x="200" y="110" width="18" height="72" rx="4" fill="url(#${u}c)"/>
    ${bolt(31, 118)}${bolt(31, 146)}${bolt(31, 174)}${bolt(209, 118)}${bolt(209, 146)}${bolt(209, 174)}
    <rect x="74" y="114" width="16" height="14" rx="3" fill="url(#${u}c)"/><rect x="150" y="114" width="16" height="14" rx="3" fill="url(#${u}c)"/>
    <path class="tm-flow" d="M82 132 L 100 160 L 118 132 L 136 160 L 158 132" fill="none" stroke="#7FD3FF" stroke-width="2" stroke-dasharray="4 6"/>
    <rect x="113" y="88" width="14" height="30" fill="url(#${u}c)"/>
    <rect x="62" y="26" width="116" height="68" rx="14" fill="url(#${u}w)" stroke="#C9D1E3"/>
    ${lcd(u, 74, 36, 92, 32, 912.84, 'MWh', 0.02, 2, 15)}
    <circle cx="154" cy="80" r="6" fill="url(#${u}r)"/>
    <rect x="76" y="76" width="44" height="4" rx="2" fill="#C9D1E3"/>`;

  function water(u, accent, opt = {}) {
    const ring = opt.split
      ? `<path d="M120 46 a50 50 0 0 0 0 100" fill="none" stroke="#E11B38" stroke-width="7"/><path d="M120 46 a50 50 0 0 1 0 100" fill="none" stroke="#2A54B5" stroke-width="7"/>`
      : `<circle cx="120" cy="96" r="50" fill="none" stroke="${accent}" stroke-width="7"/>`;
    return `${shadow(u)}${pipe(u, 120, 30, 26, 214)}
      <circle cx="120" cy="96" r="58" fill="url(#${u}b)"/>
      ${ring}
      <circle cx="120" cy="96" r="44" fill="url(#${u}w)"/>
      <rect x="92" y="70" width="56" height="18" rx="3" fill="#10172A"/>
      <text class="tm-lcd" data-v="${opt.v || 1284}" data-step="1" data-dec="0" x="144" y="84" text-anchor="end" font-size="13" font-family="'JetBrains Mono',ui-monospace,monospace" fill="#fff" letter-spacing="2">${opt.v || 1284}</text>
      <text x="120" y="101" text-anchor="middle" font-size="7" font-family="Manrope,sans-serif" font-weight="800" fill="#5B6582">m³</text>
      ${impeller(104, 118, 9, accent, 6)}
      <g transform="translate(138 118)"><circle r="10" fill="#fff" stroke="#C9D1E3"/><g class="tm-spin tm-slow"><path d="M0 2 L0 -8" stroke="#E11B38" stroke-width="2.2" stroke-linecap="round"/></g><circle r="2" fill="#10172A"/></g>
      ${opt.radio ? `<rect x="168" y="30" width="34" height="26" rx="6" fill="url(#${u}n)"/>${radio(185, 30, '#E11B38')}` : ''}`;
  }
  T['water-hot'] = (u) => water(u, '#E11B38', { v: 2361 });
  T['water-cold'] = (u) => water(u, '#2A54B5', { v: 1284 });
  T['water-radio'] = (u) => water(u, '#2A54B5', { v: 3570, radio: true, split: true });

  T['water-us'] = (u) => `${shadow(u)}${pipe(u, 126, 24, 30, 210)}
    <rect x="62" y="56" width="116" height="92" rx="22" fill="url(#${u}w)" stroke="#C9D1E3"/>
    <rect x="62" y="56" width="116" height="22" rx="11" fill="#2A54B5" opacity=".9"/>
    <rect x="62" y="68" width="116" height="10" fill="#2A54B5" opacity=".9"/>
    ${lcd(u, 74, 86, 92, 32, 76.512, 'm³', 0.004, 3, 15)}
    ${waves(48, 138, -1, '#7FB2FF')}${waves(192, 138, 1, '#7FB2FF')}
    <circle cx="160" cy="132" r="6" fill="url(#${u}n)"/>`;

  T['converter'] = (u) => `${shadow(u, 120, 96)}
    <rect x="24" y="96" width="192" height="14" rx="3" fill="url(#${u}c)"/>
    <rect x="52" y="44" width="136" height="122" rx="14" fill="url(#${u}w)" stroke="#C9D1E3"/>
    <rect x="52" y="44" width="136" height="26" rx="13" fill="url(#${u}n)"/><rect x="52" y="58" width="136" height="12" fill="url(#${u}n)"/>
    ${[0, 1, 2, 3].map(i => `<circle class="tm-blink" style="animation-delay:${i * 0.3}s" cx="${68 + i * 14}" cy="57" r="3.6" fill="${i === 3 ? '#E11B38' : '#57E39A'}"/>`).join('')}
    ${lcd(u, 66, 80, 108, 30, 248, 'SAYAÇ', 1, 0, 16)}
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${66 + i * 18}" y="132" width="14" height="20" rx="2" fill="#E6EAF2" stroke="#B9C2D3"/><circle cx="${73 + i * 18}" cy="142" r="3" fill="url(#${u}c)" stroke="#6B7690" stroke-width=".8"/>`).join('')}
    <rect x="172" y="12" width="5" height="34" rx="2" fill="#10172A"/>
    ${radio(174, 14, '#E11B38')}`;

  function circ(u, opt = {}) {
    const flange = opt.flange;
    return `${shadow(u)}
      ${flange
        ? `<rect x="30" y="130" width="180" height="30" rx="6" fill="url(#${u}g)"/><rect x="18" y="116" width="18" height="58" rx="3" fill="url(#${u}c)"/><rect x="204" y="116" width="18" height="58" rx="3" fill="url(#${u}c)"/>${bolt(27, 124)}${bolt(27, 166)}${bolt(213, 124)}${bolt(213, 166)}`
        : pipe(u, 132, 26, 28, 212)}
      <path d="M78 150 Q 78 112 120 108 Q 162 112 162 150 Z" fill="url(#${u}g)"/>
      <circle cx="120" cy="90" r="56" fill="url(#${u}n)"/>
      <circle cx="120" cy="90" r="56" fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="2"/>
      <circle cx="120" cy="90" r="42" fill="url(#${u}w)"/>
      <circle cx="120" cy="90" r="30" fill="#0B1F55" opacity=".06"/>
      ${impeller(120, 90, 26, '#2A54B5', 7)}
      <rect x="96" y="48" width="48" height="16" rx="4" fill="#10172A"/>
      <text class="tm-lcd" data-v="${opt.w || 38}" data-step="1" data-dec="0" data-jitter="1" x="132" y="60" text-anchor="end" font-size="11" font-family="'JetBrains Mono',monospace" fill="#57E39A">${opt.w || 38}</text>
      <text x="136" y="60" font-size="7" font-family="Manrope" font-weight="800" fill="#57E39A">W</text>
      <circle cx="120" cy="128" r="6" fill="url(#${u}r)"/>`;
  }
  T['pump-circ'] = (u) => circ(u);
  T['pump-flange'] = (u) => circ(u, { flange: true, w: 186 });

  T['pump-twin'] = (u) => `${shadow(u, 120, 104)}
    <rect x="22" y="138" width="196" height="28" rx="6" fill="url(#${u}g)"/>
    <rect x="12" y="126" width="16" height="52" rx="3" fill="url(#${u}c)"/><rect x="212" y="126" width="16" height="52" rx="3" fill="url(#${u}c)"/>
    ${[78, 162].map(cx => `<rect x="${cx - 20}" y="108" width="40" height="34" fill="url(#${u}g)"/>
      <circle cx="${cx}" cy="80" r="40" fill="url(#${u}n)"/><circle cx="${cx}" cy="80" r="29" fill="url(#${u}w)"/>
      ${impeller(cx, 80, 19, '#2A54B5', 6)}<circle cx="${cx}" cy="112" r="4.5" fill="url(#${u}r)"/>`).join('')}`;

  function booster(u, opt = {}) {
    const tankCol = opt.fire ? `url(#${u}r)` : `url(#${u}n)`;
    return `${shadow(u, 120, 104)}
      <rect x="20" y="166" width="200" height="10" rx="3" fill="url(#${u}g)"/>
      <rect x="146" y="40" width="64" height="122" rx="30" fill="${tankCol}"/>
      <rect x="152" y="52" width="12" height="96" rx="6" fill="#fff" opacity=".18"/>
      <rect x="170" y="158" width="14" height="10" fill="url(#${u}g)"/>
      <rect x="30" y="104" width="62" height="50" rx="12" fill="url(#${u}n)"/>
      ${[0, 1, 2, 3, 4].map(i => `<line x1="${38 + i * 11}" y1="108" x2="${38 + i * 11}" y2="150" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>`).join('')}
      <path d="M92 112 h18 a14 14 0 0 1 14 14 v14 a14 14 0 0 1 -14 14 h-18z" fill="url(#${u}g)"/>
      <path d="M118 112 V 84 H 146" fill="none" stroke="url(#${u}bh)" stroke-width="9" stroke-linejoin="round"/>
      <path class="tm-flow" d="M118 112 V 84 H 146" fill="none" stroke="#FFF7DF" stroke-width="2" stroke-opacity=".8"/>
      <rect x="40" y="88" width="30" height="16" rx="3" fill="url(#${u}r)"/>
      <g transform="translate(118 64)"><circle r="14" fill="#fff" stroke="#8792A8" stroke-width="2"/>
        <path d="M-9 4 a10 10 0 0 1 18 0" fill="none" stroke="#C9D1E3" stroke-width="2"/>
        <g class="tm-needle"><path d="M0 0 L0 -10" stroke="#E11B38" stroke-width="2.2" stroke-linecap="round"/></g><circle r="2" fill="#10172A"/></g>
      ${opt.packet ? `<rect x="24" y="158" width="190" height="6" rx="2" fill="#C9D1E3"/>` : ''}`;
  }
  T['pump-booster'] = (u, o) => booster(u, { fire: /yangın/i.test(o.title || ''), packet: /paket/i.test(o.title || '') });

  T['pump-sub'] = (u) => `
    <rect x="36" y="70" width="168" height="118" rx="14" fill="#2A54B5" opacity=".1"/>
    <path class="tm-water" d="M36 76 q 21 -8 42 0 t 42 0 t 42 0 t 42 0" fill="none" stroke="#2A54B5" stroke-opacity=".5" stroke-width="2.5"/>
    <path d="M120 10 C 120 30, 140 30, 140 50" fill="none" stroke="#10172A" stroke-width="3"/>
    <rect x="98" y="40" width="44" height="140" rx="20" fill="url(#${u}c)" stroke="#8792A8"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="100" y="${108 + i * 9}" width="40" height="3" rx="1.5" fill="#6B7690" opacity=".55"/>`).join('')}
    <rect x="98" y="88" width="44" height="12" fill="url(#${u}n)"/>
    ${[0, 1, 2, 3, 4].map(i => `<circle class="tm-bubble" style="animation-delay:${i * 0.5}s" cx="${82 + (i % 2) * 74 + i * 2}" cy="170" r="${3 + (i % 3)}" fill="none" stroke="#2A54B5" stroke-opacity=".6" stroke-width="1.6"/>`).join('')}`;

  T['pump-solar'] = (u) => `${circ(u, { w: 24 })}
    <g transform="translate(200 34)"><g class="tm-spin tm-slow">${[...Array(10)].map((_, i) => `<line x1="0" y1="-16" x2="0" y2="-24" stroke="#E11B38" stroke-width="3" stroke-linecap="round" transform="rotate(${i * 36})"/>`).join('')}</g><circle r="12" fill="url(#${u}r)"/></g>`;

  T['heatpump'] = (u) => `${shadow(u, 120, 104)}
    <rect x="22" y="170" width="16" height="10" fill="url(#${u}g)"/><rect x="202" y="170" width="16" height="10" fill="url(#${u}g)"/>
    <rect x="16" y="34" width="208" height="138" rx="12" fill="url(#${u}w)" stroke="#C9D1E3"/>
    <circle cx="96" cy="103" r="54" fill="#0B1F55" opacity=".08"/>
    <circle cx="96" cy="103" r="50" fill="#EEF2F8" stroke="#C9D1E3" stroke-width="2"/>
    ${impeller(96, 103, 44, '#8792A8', 3)}
    ${[0, 1, 2, 3, 4].map(i => `<circle cx="96" cy="103" r="${12 + i * 9}" fill="none" stroke="#10172A" stroke-opacity=".25" stroke-width="1"/>`).join('')}
    ${[...Array(9)].map((_, i) => `<line x1="${164 + i * 5.5}" y1="52" x2="${164 + i * 5.5}" y2="154" stroke="#C9D1E3" stroke-width="2"/>`).join('')}
    <rect x="160" y="42" width="52" height="8" rx="4" fill="url(#${u}hc)"/>
    ${[0, 1, 2].map(i => `<path class="tm-heat" style="animation-delay:${i * 0.6}s" d="M${70 + i * 26} 28 q 6 -8 0 -16 q -6 -8 0 -14" fill="none" stroke="#E11B38" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/>`).join('')}`;

  T['valve3'] = (u, o) => {
    const two = /2 yollu/i.test(o.title || '');
    const motorOnly = /motor/i.test(o.title || '') && !/vana siemens/i.test(o.title || '');
    return `${shadow(u)}
      ${pipe(u, 140, 24, 26, 214)}
      ${two ? '' : `<rect x="108" y="150" width="24" height="34" fill="url(#${u}bh)"/><rect x="102" y="176" width="36" height="10" rx="3" fill="url(#${u}b)"/>`}
      <rect x="92" y="124" width="56" height="52" rx="12" fill="url(#${u}b)"/>
      <rect x="112" y="102" width="16" height="26" fill="url(#${u}c)"/>
      <rect x="66" y="${motorOnly ? 22 : 30}" width="108" height="76" rx="14" fill="url(#${u}w)" stroke="#C9D1E3"/>
      <rect x="66" y="${motorOnly ? 22 : 30}" width="108" height="20" rx="10" fill="url(#${u}g)"/>
      <g transform="translate(120 ${motorOnly ? 72 : 80})"><circle r="16" fill="#EEF2F8" stroke="#C9D1E3"/><g class="tm-needle tm-slow"><rect x="-2.5" y="-14" width="5" height="16" rx="2.5" fill="#E11B38"/></g><circle r="3" fill="#10172A"/></g>
      <circle class="tm-blink" cx="154" cy="${motorOnly ? 32 : 40}" r="3.4" fill="#57E39A"/>
      <path class="tm-arrow" d="M40 152 l10 0" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
  };

  T['valve'] = (u, o) => {
    const t = (o.title || '').toLowerCase();
    let head;
    if (/termostatik/.test(t)) head = `<rect x="98" y="30" width="44" height="66" rx="20" fill="url(#${u}w)" stroke="#C9D1E3"/>${[0, 1, 2, 3].map(i => `<rect x="100" y="${44 + i * 11}" width="40" height="3" rx="1.5" fill="#C9D1E3"/>`).join('')}<circle class="tm-blink tm-slow" cx="120" cy="38" r="3" fill="#E11B38"/>`;
    else if (/emniyet/.test(t)) head = `<rect x="100" y="40" width="40" height="52" rx="8" fill="url(#${u}r)"/><rect x="104" y="44" width="10" height="44" rx="5" fill="#fff" opacity=".25"/>`;
    else if (/düşürücü|fark|limit/.test(t)) head = `<rect x="94" y="34" width="52" height="58" rx="10" fill="url(#${u}b)"/><g transform="translate(120 52)"><circle r="16" fill="#fff" stroke="#8792A8" stroke-width="2"/><g class="tm-needle"><path d="M0 0 L0 -12" stroke="#E11B38" stroke-width="2.2" stroke-linecap="round"/></g><circle r="2" fill="#10172A"/></g>`;
    else head = `<rect x="114" y="66" width="12" height="28" fill="url(#${u}c)"/><g transform="translate(120 56)"><g class="tm-turn"><rect x="-38" y="-7" width="76" height="14" rx="7" fill="url(#${u}r)"/></g></g>`;
    return `${shadow(u)}${pipe(u, 126, 30, 28, 212)}
      <path d="M78 141 C 78 104, 162 104, 162 141 C 162 178, 78 178, 78 141Z" fill="url(#${u}b)"/>
      <rect x="104" y="88" width="32" height="22" rx="4" fill="url(#${u}b)"/>
      ${head}
      ${/karışım/.test(t) ? `<rect x="108" y="150" width="24" height="30" fill="url(#${u}bh)"/>` : ''}`;
  };

  T['vent'] = (u) => `${shadow(u, 120, 60)}
    <rect x="96" y="150" width="48" height="26" rx="4" fill="url(#${u}b)"/>
    <rect x="86" y="70" width="68" height="84" rx="14" fill="url(#${u}b)"/>
    <rect x="94" y="78" width="12" height="68" rx="6" fill="#fff" opacity=".25"/>
    <rect x="100" y="50" width="40" height="24" rx="6" fill="url(#${u}c)"/>
    <rect x="114" y="38" width="12" height="16" rx="3" fill="url(#${u}r)"/>
    ${[0, 1, 2, 3].map(i => `<circle class="tm-bubble" style="animation-delay:${i * 0.55}s" cx="${112 + (i % 2) * 16}" cy="40" r="${3 + (i % 2)}" fill="none" stroke="#2A54B5" stroke-opacity=".7" stroke-width="1.6"/>`).join('')}`;

  T['thermostat'] = (u) => `${shadow(u, 120, 70)}
    <rect x="50" y="22" width="140" height="150" rx="30" fill="url(#${u}w)" stroke="#C9D1E3"/>
    <circle cx="120" cy="92" r="52" fill="#F3F5F9" stroke="#DDE3EE" stroke-width="2"/>
    <circle cx="120" cy="92" r="44" fill="none" stroke="#E6EAF2" stroke-width="8"/>
    <circle class="tm-arc" cx="120" cy="92" r="44" fill="none" stroke="url(#${u}hc)" stroke-width="8" stroke-linecap="round" pathLength="100" stroke-dasharray="62 100" transform="rotate(130 120 92)"/>
    <text class="tm-lcd" data-v="21.5" data-step="0.5" data-dec="1" data-osc="1" x="120" y="100" text-anchor="middle" font-size="24" font-family="Manrope,sans-serif" font-weight="300" fill="#0B1430">21.5</text>
    <text x="120" y="116" text-anchor="middle" font-size="8" font-family="Manrope" font-weight="700" fill="#8792A8">°C</text>
    <circle class="tm-blink tm-slow" cx="120" cy="154" r="3.5" fill="#E11B38"/>`;

  T['manifold'] = (u) => `${shadow(u, 120, 100)}
    ${[0, 1, 2, 3].map(i => {
      const x = 58 + i * 40;
      return `<path class="tm-flow" d="M${x} 132 C ${x} 176, ${x + 26} 176, ${x + 26} 132" fill="none" stroke="url(#${u}hc)" stroke-width="5" stroke-linecap="round" stroke-dasharray="7 7" style="animation-delay:${i * 0.2}s"/>`;
    }).join('')}
    <rect x="30" y="48" width="180" height="22" rx="11" fill="url(#${u}c)"/>
    <rect x="30" y="110" width="180" height="22" rx="11" fill="url(#${u}c)"/>
    <rect x="22" y="44" width="16" height="30" rx="4" fill="url(#${u}r)"/><rect x="22" y="106" width="16" height="30" rx="4" fill="url(#${u}n)"/>
    ${[0, 1, 2, 3].map(i => {
      const x = 58 + i * 40;
      return `<rect x="${x - 7}" y="18" width="14" height="32" rx="7" fill="#fff" fill-opacity=".7" stroke="#8792A8"/>
        <rect class="tm-bob" style="animation-delay:${i * 0.3}s" x="${x - 4}" y="30" width="8" height="8" rx="2" fill="#E11B38"/>
        <rect x="${x - 6}" y="70" width="12" height="40" fill="url(#${u}bh)" opacity=".9"/>
        <circle cx="${x + 26}" cy="121" r="7" fill="url(#${u}n)"/>`;
    }).join('')}`;

  T['gauge'] = (u) => `${shadow(u, 120, 60)}
    <rect x="108" y="150" width="24" height="30" fill="url(#${u}bh)"/><rect x="100" y="168" width="40" height="12" rx="3" fill="url(#${u}b)"/>
    <circle cx="120" cy="88" r="66" fill="url(#${u}c)"/>
    <circle cx="120" cy="88" r="56" fill="#fff"/>
    ${[...Array(11)].map((_, i) => { const a = -135 + i * 27; return `<line x1="120" y1="40" x2="120" y2="${i % 5 === 0 ? 50 : 46}" stroke="#10172A" stroke-width="${i % 5 === 0 ? 2.4 : 1.4}" transform="rotate(${a} 120 88)"/>`; }).join('')}
    <path d="M78 130 A 56 56 0 0 1 64 104" fill="none" stroke="#E11B38" stroke-width="0"/>
    <path d="M160 128 a56 56 0 0 0 14 -24" fill="none" stroke="#E11B38" stroke-width="5"/>
    <text x="120" y="120" text-anchor="middle" font-size="9" font-family="Manrope" font-weight="800" fill="#5B6582">bar</text>
    <g transform="translate(120 88)"><g class="tm-needle tm-wide"><path d="M0 8 L0 -46" stroke="#E11B38" stroke-width="3" stroke-linecap="round"/></g><circle r="6" fill="#10172A"/></g>`;

  T['station'] = (u) => `${shadow(u, 120, 96)}
    <rect x="40" y="18" width="160" height="160" rx="12" fill="url(#${u}w)" stroke="#C9D1E3"/>
    <rect x="50" y="28" width="140" height="140" rx="8" fill="#F3F5F9"/>
    <path d="M70 168 V 70 H 108" fill="none" stroke="#E11B38" stroke-width="7" stroke-linejoin="round"/>
    <path d="M170 168 V 70 H 132" fill="none" stroke="#2A54B5" stroke-width="7" stroke-linejoin="round"/>
    <path class="tm-flow" d="M70 168 V 70 H 108" fill="none" stroke="#fff" stroke-width="2" stroke-opacity=".8"/>
    <path class="tm-flow" d="M132 70 H 170 V 168" fill="none" stroke="#fff" stroke-width="2" stroke-opacity=".8"/>
    <rect x="104" y="50" width="32" height="50" rx="4" fill="url(#${u}c)"/>
    ${[0, 1, 2, 3, 4].map(i => `<line x1="108" y1="${56 + i * 9}" x2="132" y2="${56 + i * 9}" stroke="#6B7690" stroke-opacity=".6"/>`).join('')}
    <rect x="94" y="116" width="52" height="34" rx="8" fill="#fff" stroke="#C9D1E3"/>
    ${lcd(u, 99, 121, 42, 24, 312, 'kWh', 1, 0, 11)}`;

  T['macerator'] = (u) => `${shadow(u, 120, 90)}
    <rect x="44" y="70" width="152" height="104" rx="18" fill="url(#${u}w)" stroke="#C9D1E3"/>
    <rect x="44" y="70" width="152" height="18" rx="9" fill="#0B1F55" opacity=".07"/>
    <path d="M168 70 V 26 H 214" fill="none" stroke="url(#${u}c)" stroke-width="12" stroke-linejoin="round"/>
    <path class="tm-flow" d="M168 72 V 26 H 214" fill="none" stroke="#2A54B5" stroke-opacity=".5" stroke-width="3"/>
    <circle cx="96" cy="124" r="28" fill="#EEF2F8" stroke="#C9D1E3"/>
    ${impeller(96, 124, 22, '#2A54B5', 4)}
    <circle class="tm-blink" cx="166" cy="102" r="4" fill="#57E39A"/>
    <rect x="150" y="120" width="30" height="5" rx="2.5" fill="#C9D1E3"/><rect x="150" y="132" width="20" height="5" rx="2.5" fill="#C9D1E3"/>`;

  T['tank'] = (u) => `${shadow(u, 120, 64)}
    <rect x="110" y="164" width="20" height="18" fill="url(#${u}bh)"/>
    <g class="tm-breathe"><rect x="66" y="22" width="108" height="148" rx="54" fill="url(#${u}r)"/>
    <rect x="66" y="88" width="108" height="10" fill="#8A0A1E" opacity=".45"/>
    <rect x="80" y="38" width="16" height="110" rx="8" fill="#fff" opacity=".2"/></g>
    <rect x="112" y="14" width="16" height="12" rx="3" fill="url(#${u}c)"/>`;

  T['battery'] = (u) => `${shadow(u, 120, 50)}
    <rect x="96" y="18" width="48" height="12" rx="4" fill="url(#${u}c)"/>
    <rect x="80" y="28" width="80" height="148" rx="14" fill="url(#${u}n)"/>
    <rect x="90" y="40" width="60" height="124" rx="8" fill="#0B1430" opacity=".35"/>
    ${[0, 1, 2, 3].map(i => `<rect class="tm-charge" style="animation-delay:${(3 - i) * 0.3}s" x="96" y="${48 + i * 28}" width="48" height="22" rx="4" fill="#57E39A"/>`).join('')}`;

  T['gasket'] = (u) => `${shadow(u, 120, 80)}
    <g transform="translate(120 104)"><g class="tm-spin tm-slower">
      <circle r="66" fill="none" stroke="#10172A" stroke-width="16"/>
      <circle r="66" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="2" stroke-dasharray="3 9"/>
    </g></g>
    <circle cx="86" cy="96" r="26" fill="none" stroke="#E11B38" stroke-width="9"/>
    <circle cx="150" cy="118" r="22" fill="none" stroke="url(#${u}b)" stroke-width="9"/>
    <circle cx="124" cy="78" r="14" fill="none" stroke="#2A54B5" stroke-width="6"/>`;

  T['fitting'] = (u) => `${shadow(u)}
    <rect x="30" y="92" width="80" height="32" rx="5" fill="url(#${u}b)"/>
    <path d="M96 80 h34 l8 14 v28 l-8 14 h-34 l-8 -14 v-28z" fill="url(#${u}b)" stroke="#7A4E10" stroke-opacity=".35"/>
    <line x1="113" y1="80" x2="113" y2="136" stroke="#7A4E10" stroke-opacity=".3"/>
    <g class="tm-join"><rect x="138" y="94" width="72" height="28" rx="5" fill="url(#${u}b)"/>
    ${[0, 1, 2, 3, 4].map(i => `<line x1="${150 + i * 11}" y1="94" x2="${146 + i * 11}" y2="122" stroke="#7A4E10" stroke-opacity=".35" stroke-width="2"/>`).join('')}</g>`;

  function svg(type, opts = {}) {
    const u = 'tm' + (++n);
    const fn = T[type] || T['valve'];
    return `<svg class="tm-art" viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${(opts.title || '').replace(/"/g, '')}">${defs(u)}${fn(u, opts)}</svg>`;
  }

  // LCD sayaçları: yalnızca görünür kartlarda ilerler
  function tick() {
    document.querySelectorAll('.is-live .tm-lcd').forEach(el => {
      const step = parseFloat(el.dataset.step || '1');
      const dec = parseInt(el.dataset.dec || '0', 10);
      let v = parseFloat(el.dataset.v);
      if (el.dataset.osc) {
        el._d = el._d || 1;
        v += step * el._d;
        if (v > 23 || v < 20) el._d *= -1;
      } else if (el.dataset.jitter) {
        const base = el._b || (el._b = v);
        v = Math.max(1, base + Math.round((Math.random() - 0.5) * base * 0.12));
      } else v += step * (0.5 + Math.random());
      el.dataset.v = v;
      el.textContent = v.toFixed(dec);
    });
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(tick, 1100);

  window.TMArt = { svg, types: Object.keys(T) };
})();
