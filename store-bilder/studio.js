// Theme + Statusleiste einsetzen (vor dem Fotografieren)
  const dunkel = new URLSearchParams(location.search).get('app') === 'dunkel';
  if (dunkel) document.body.classList.add('dunkel');
  if (new URLSearchParams(location.search).get('play') === '1') document.body.classList.add('play');   // Google Play: 9:16 + Android-Handy
  const farbe = dunkel ? '#F4EEE4' : '#1A1612';
  const balken = `<svg viewBox="0 0 36 24"><rect x="0" y="16" width="6" height="8" rx="1.5" fill="${farbe}"/><rect x="10" y="11" width="6" height="13" rx="1.5" fill="${farbe}"/><rect x="20" y="6" width="6" height="18" rx="1.5" fill="${farbe}"/><rect x="30" y="0" width="6" height="24" rx="1.5" fill="${farbe}"/></svg>`;
  const wlan = `<svg viewBox="0 0 32 24"><path d="M16 22l4.5-5a6.4 6.4 0 0 0-9 0zM6.5 11.5a13.4 13.4 0 0 1 19 0l-3 3.3a9 9 0 0 0-13 0zM1 5.8a21 21 0 0 1 30 0l-3 3.3a16.6 16.6 0 0 0-24 0z" fill="${farbe}"/></svg>`;
  const akku = `<svg viewBox="0 0 52 24"><rect x="1" y="1" width="44" height="22" rx="7" fill="none" stroke="${farbe}" stroke-opacity=".4" stroke-width="2"/><rect x="4" y="4" width="34" height="16" rx="4" fill="${farbe}"/><rect x="47" y="8" width="4" height="8" rx="2" fill="${farbe}" fill-opacity=".4"/></svg>`;
  const flug = `<svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" fill="${farbe}"/></svg>`;
  document.body.innerHTML = document.body.innerHTML
    .replaceAll('%STATUS_FLUG%', '').replaceAll('%STATUS%', '')   // Julian: keine Uhrzeit/Empfang/Akku
    .replaceAll('%SUFFIX%', dunkel ? '-dunkel' : '');
