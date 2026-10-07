KK.mascot = (() => {
  const INK = '#2B1A33';
  const petals = Array.from({ length: 6 }, (_, k) =>
    `<g transform="rotate(${k * 60} 60 58)"><ellipse cx="60" cy="27" rx="16" ry="21" fill="#FF5FA2"/><ellipse cx="60" cy="22" rx="8" ry="11" fill="#FF8CC0" opacity=".75"/></g>`
  ).join('');

  const eyes = `<ellipse cx="51" cy="55" rx="4.6" ry="6" fill="${INK}"/><ellipse cx="69" cy="55" rx="4.6" ry="6" fill="${INK}"/>
    <circle cx="52.6" cy="52.4" r="1.7" fill="#fff"/><circle cx="70.6" cy="52.4" r="1.7" fill="#fff"/>`;
  const cheeks = '<ellipse cx="42.5" cy="64" rx="5" ry="3.2" fill="#FF8FB1" opacity=".8"/><ellipse cx="77.5" cy="64" rx="5" ry="3.2" fill="#FF8FB1" opacity=".8"/>';
  const stroke = `stroke="${INK}" stroke-width="3.2" stroke-linecap="round" fill="none"`;

  const FACES = {
    happy: `${eyes}<path d="M51 64 Q60 73 69 64" ${stroke}/>`,
    cheer: `<path d="M45.5 56 Q51 49 56.5 56" ${stroke}/><path d="M63.5 56 Q69 49 74.5 56" ${stroke}/>
      <path d="M49 63 Q60 79 71 63 Z" fill="${INK}"/><path d="M54 70 Q60 75 66 70 Q60 67 54 70 Z" fill="#FF7A9C"/>`,
    think: `<circle cx="51" cy="55" r="5.4" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="69" cy="55" r="5.4" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <circle cx="53" cy="52.6" r="2.8" fill="${INK}"/><circle cx="71" cy="52.6" r="2.8" fill="${INK}"/><path d="M55 68 Q60 66 65 68" ${stroke}/>`,
    oops: `${eyes}<path d="M50 69 q5 -4.5 10 0 q5 4.5 10 0" ${stroke}/>
      <path d="M83 40 q4 7 0 9 q-4 -2 0 -9 Z" fill="#7FD3FF"/>`,
    wow: `${eyes}<ellipse cx="60" cy="68" rx="5" ry="6" fill="${INK}"/>`,
  };

  const OUTFITS = {
    bow: '<g transform="translate(0 -1)"><path d="M60 12 L43 2 Q40 12 43 22 Z" fill="#9B6BFF"/><path d="M60 12 L77 2 Q80 12 77 22 Z" fill="#9B6BFF"/><circle cx="60" cy="12" r="5.5" fill="#7A4BE0"/></g>',
    shades: `<rect x="39.5" y="47" width="18" height="13" rx="5.5" fill="${INK}"/><rect x="62.5" y="47" width="18" height="13" rx="5.5" fill="${INK}"/>
      <path d="M57.5 52 h5" stroke="${INK}" stroke-width="3"/><path d="M43 51 l5 -2" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/><path d="M66 51 l5 -2" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`,
    crown: '<path d="M43 15 L46 -1 L54 9 L60 -5 L66 9 L74 -1 L77 15 Z" fill="#FFC53D" stroke="#E0A300" stroke-width="2.4" stroke-linejoin="round"/><circle cx="60" cy="9" r="2.6" fill="#FF4B91"/>',
  };

  // mood: happy | cheer | think | oops | wow
  function kiki(mood = 'happy', { size = 96, cls = '', outfit = null } = {}) {
    const face = FACES[mood] || FACES.happy;
    const extra = outfit && OUTFITS[outfit] ? OUTFITS[outfit] : '';
    return `<span class="kiki ${cls}" style="width:${size}px" aria-hidden="true"><svg viewBox="-4 -8 128 130">
      <ellipse class="k-leaf" cx="26" cy="100" rx="15" ry="8" transform="rotate(-28 26 100)" fill="#3DD68C"/>
      <ellipse class="k-leaf" cx="94" cy="100" rx="15" ry="8" transform="rotate(28 94 100)" fill="#3DD68C"/>
      <g class="k-petals">${petals}</g>
      <circle cx="60" cy="58" r="27" fill="#FFD84D"/><circle cx="60" cy="58" r="27" fill="none" stroke="#F2B90F" stroke-width="3"/>
      ${cheeks}${face}${extra}
    </svg></span>`;
  }

  return { kiki, OUTFITS: Object.keys(OUTFITS) };
})();
