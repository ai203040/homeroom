/*
  Homeroom illustrations and campus map.
  Every listing gets four generated "photos" (exterior + rooms) and the town map is drawn once.
  A listing with  photos: [...]  in data.js uses those image URLs instead.
*/
(function (root) {
  'use strict';

  const W = 480;
  const H = 320;
  const GY = 252;
  const LIT = '#FFD98A';
  const LEAF = ['#6E9A6A', '#5F8B62', '#7EA273', '#668F70'];
  const SKIES = [
    { top: '#B4D1E6', bot: '#E8F1F5', sun: '#FFF7DE', far: '#9DB8A6', lawn: '#9FB98B', litP: 0.06 },
    { top: '#EDC6A2', bot: '#FAECDF', sun: '#FFEBC4', far: '#BCA98F', lawn: '#A3B486', litP: 0.3 },
    { top: '#AEB6DB', bot: '#F1D5CB', sun: '#FFE3D0', far: '#9C9EB6', lawn: '#8FA683', litP: 0.45 },
    { top: '#C8D4DA', bot: '#EDF1F2', sun: null, far: '#AEBDB4', lawn: '#9CB38E', litP: 0.1 },
  ];

  function hash(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rgb(hex) {
    const v = parseInt(hex.slice(1), 16);
    return [v >> 16, (v >> 8) & 255, v & 255];
  }
  function shade(hex, amt) {
    const c = rgb(hex);
    const t = amt < 0 ? 0 : 255;
    const p = Math.abs(amt);
    return '#' + c.map((v) => Math.round((t - v) * p + v).toString(16).padStart(2, '0')).join('');
  }
  function lum(hex) {
    const c = rgb(hex);
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  const n = (v) => Math.round(v * 10) / 10;
  const at = (extra) => (extra ? ' ' + extra : '');
  const rect = (x, y, w, h, fill, extra) => `<rect x="${n(x)}" y="${n(y)}" width="${n(Math.max(0, w))}" height="${n(Math.max(0, h))}" fill="${fill}"${at(extra)}/>`;
  const circ = (cx, cy, r, fill, extra) => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${at(extra)}/>`;
  const ell = (cx, cy, rx, ry, fill, extra) => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${at(extra)}/>`;
  const poly = (pts, fill, extra) => `<polygon points="${pts.map((p) => n(p[0]) + ',' + n(p[1])).join(' ')}" fill="${fill}"${at(extra)}/>`;
  const path = (d, fill, extra) => `<path d="${d}" fill="${fill}"${at(extra)}/>`;
  const pick = (arr, rand) => arr[Math.floor(rand() * arr.length)];

  function defs(sky) {
    return '<defs>' +
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky.top}"/><stop offset="1" stop-color="${sky.bot}"/></linearGradient>` +
      '<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D3E3EA"/><stop offset=".55" stop-color="#A9C4D2"/><stop offset="1" stop-color="#8EAEC0"/></linearGradient>' +
      '<linearGradient id="glass2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DBBCB"/><stop offset="1" stop-color="#6F92A6"/></linearGradient>' +
      '<linearGradient id="wallshade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".07"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".05"/></linearGradient>' +
      '</defs>';
  }

  // ---------- shared scene parts ----------

  function backdrop(sky, rand) {
    let o = rect(0, 0, W, H, 'url(#sky)');
    if (sky.sun) o += circ(90 + rand() * 300, 58 + rand() * 26, 24, sky.sun, 'opacity=".9"');
    for (let i = 0; i < 3; i++) {
      const cx = 30 + rand() * 420;
      const cy = 34 + rand() * 60;
      const w = 34 + rand() * 40;
      o += `<g fill="#FFFFFF" opacity="${(0.5 + rand() * 0.3).toFixed(2)}">` + ell(cx, cy, w, 9) + ell(cx - w * 0.3, cy - 7, w * 0.42, 10) + ell(cx + w * 0.22, cy - 5, w * 0.38, 8) + '</g>';
    }
    o += path(`M0 ${GY - 30}Q60 ${GY - 58} 120 ${GY - 38}T240 ${GY - 42}T360 ${GY - 34}T480 ${GY - 48}V${GY}H0Z`, sky.far, 'opacity=".6"');
    return o;
  }

  function street(sky) {
    let o = rect(0, GY, W, H - GY, sky.lawn);
    o += rect(0, GY + 6, W, 14, '#DDD8CD');
    o += rect(0, GY + 20, W, 3, '#BDB7AB');
    o += rect(0, GY + 23, W, H - GY - 23, '#7F8786');
    for (let x = 14; x < W; x += 64) o += rect(x, GY + 47, 32, 3, '#ECE7DA', 'opacity=".85"');
    return o;
  }

  function lawnGround(sky, doorX) {
    let o = rect(0, GY, W, H - GY, sky.lawn);
    o += poly([[doorX - 16, GY], [doorX + 16, GY], [doorX + 54, H], [doorX - 54, H]], '#E3DCCB');
    o += rect(0, GY, W, 3, '#000000', 'opacity=".05"');
    return o;
  }

  function win(x, y, w, h, o) {
    let s = '';
    const glass = o.lit ? LIT : 'url(#glass)';
    if (o.arch) {
      const r = w / 2;
      const i = 2.2;
      s += path(`M${n(x)} ${n(y + h)}V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w)} ${n(y + r)}V${n(y + h)}Z`, o.frame);
      s += path(`M${n(x + i)} ${n(y + h - i)}V${n(y + r)}A${n(r - i)} ${n(r - i)} 0 0 1 ${n(x + w - i)} ${n(y + r)}V${n(y + h - i)}Z`, glass);
    } else {
      s += rect(x, y, w, h, o.frame);
      s += rect(x + 2.2, y + 2.2, w - 4.4, h - 4.4, glass);
    }
    if (o.panes) {
      for (let k = 1; k < 3; k++) s += rect(x + (w * k) / 3 - 0.6, y + 2, 1.2, h - 4, o.frame);
      for (let k = 1; k < 3; k++) s += rect(x + 2, y + (h * k) / 3 - 0.6, w - 4, 1.2, o.frame);
    } else if (o.mullion !== false) {
      s += rect(x + w / 2 - 0.8, y + 2, 1.6, h - 4, o.frame);
      if (h > w * 1.15) s += rect(x + 2, y + h * 0.45, w - 4, 1.6, o.frame);
    }
    if (!o.lit && !o.arch && w > 14) s += poly([[x + 3, y + h * 0.62], [x + w * 0.55, y + 3], [x + w * 0.75, y + 3], [x + 3, y + h * 0.9]], '#FFFFFF', 'opacity=".18"');
    if (o.sill) s += rect(x - 2, y + h, w + 4, 3, o.sill);
    return s;
  }

  function tree(x, gy, s, rand) {
    const c = pick(LEAF, rand);
    return rect(x - 3 * s, gy - 34 * s, 6 * s, 34 * s, '#6B5443') +
      circ(x, gy - 52 * s, 22 * s, c) + circ(x - 16 * s, gy - 40 * s, 16 * s, c) + circ(x + 15 * s, gy - 38 * s, 17 * s, c) +
      circ(x - 7 * s, gy - 60 * s, 11 * s, shade(c, 0.2), 'opacity=".55"');
  }

  function shrubs(x1, x2, y, rand) {
    let o = '';
    for (let x = x1; x < x2; x += 15 + rand() * 9) o += ell(x, y, 11 + rand() * 6, 8 + rand() * 3, pick(LEAF, rand));
    return o;
  }

  function lamp(x, gy) {
    return rect(x - 1.5, gy - 58, 3, 58, '#3B4440') + rect(x - 6, gy - 64, 12, 7, '#3B4440') + circ(x, gy - 56, 3, '#FFE3A1');
  }

  function bike(x, y) {
    return `<g fill="none" stroke="#35423B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="${x}" cy="${y - 8}" r="7.5"/><circle cx="${x + 24}" cy="${y - 8}" r="7.5"/><path d="M${x} ${y - 8}L${x + 9} ${y - 21}H${x + 19}L${x + 24} ${y - 8}M${x + 9} ${y - 21}L${x + 13} ${y - 8}H${x}M${x + 19} ${y - 21}L${x + 17} ${y - 26}"/></g>`;
  }

  function siding(x, y, w, h, wall, step) {
    let o = '';
    for (let yy = y + step; yy < y + h; yy += step) o += rect(x, yy, w, 0.9, shade(wall, -0.14), 'opacity=".5"');
    return o;
  }

  // ---------- building styles ----------

  function hall(a, rand, litP) {
    const trim = a.trim;
    const dark = shade(a.wall, -0.14);
    const base = shade(trim, -0.1);
    let o = rect(60, 98, 360, GY - 98, a.wall);
    o += siding(60, 98, 360, 108, a.wall, 7);
    for (let x = 58; x < 418; x += 18) o += rect(x, 82, 10, 10, trim);
    o += rect(54, 90, 372, 9, trim);
    o += rect(204, 50, 72, GY - 50, dark);
    o += poly([[198, 54], [240, 22], [282, 54]], a.roof);
    o += rect(198, 52, 84, 6, trim);
    o += win(229, 66, 22, 36, { frame: trim, arch: true, lit: rand() < litP });
    [214, 254].forEach((x) => {
      o += rect(x, 112, 12, 38, a.accent) + poly([[x, 150], [x + 6, 144], [x + 12, 150]], dark) + rect(x, 110, 12, 3, '#C9A15A');
    });
    const cols = [76, 110, 144, 178, 288, 322, 356, 390];
    [108, 140, 172].forEach((y) => cols.forEach((x) => {
      o += rect(x - 2, y - 4, 22, 3, trim) + win(x, y, 18, 24, { frame: trim, lit: rand() < litP, sill: trim });
    }));
    o += win(231, 160, 18, 24, { frame: trim, lit: rand() < litP, sill: trim });
    o += rect(60, 206, 360, GY - 206, base);
    for (let x = 90; x < 420; x += 30) o += rect(x, 206, 1, GY - 206, shade(base, -0.12));
    [80, 132, 316, 368].forEach((x) => { o += win(x, 214, 32, 24, { frame: trim, lit: rand() < litP }); });
    o += path(`M218 ${GY}V218A22 22 0 0 1 262 218V${GY}Z`, trim);
    o += path(`M224 ${GY}V220A16 16 0 0 1 256 220V${GY}Z`, '#4A3A33');
    o += rect(212, GY - 4, 56, 4, base);
    o += ell(70, 200, 14, 30, '#5F8B62', 'opacity=".85"') + ell(66, 168, 9, 18, '#6E9A6A', 'opacity=".8"') + ell(410, 210, 12, 26, '#5F8B62', 'opacity=".85"');
    o += shrubs(70, 200, GY + 2, rand) + shrubs(282, 420, GY + 2, rand);
    return o;
  }

  function suites(a, rand, litP) {
    const band = shade(a.wall, -0.38);
    let o = rect(50, 80, 380, GY - 80, a.wall);
    o += rect(44, 72, 392, 9, shade(a.wall, -0.25));
    for (let f = 0; f < 4; f++) {
      const y = 90 + f * 32;
      o += rect(60, y, 360, 22, band);
      for (let x = 62; x < 410; x += 22) o += rect(x, y + 2, 20, 18, rand() < litP ? LIT : 'url(#glass)');
      for (let k = 0; k < 3; k++) {
        const x = 62 + Math.floor(rand() * 16) * 22;
        o += rect(x, y + 2, 20, 18, a.accent);
      }
    }
    for (let x = 60; x <= 420; x += 90) o += rect(x - 2, 84, 4, 132, shade(a.wall, -0.1));
    o += rect(140, 222, 200, GY - 222, 'url(#glass)');
    for (let x = 140; x <= 340; x += 25) o += rect(x - 1, 222, 2, GY - 222, band);
    o += rect(128, 216, 224, 7, band);
    o += shrubs(60, 130, GY + 2, rand) + shrubs(350, 430, GY + 2, rand);
    return o;
  }

  function garden(a, rand, litP) {
    let o = poly([[36, 124], [240, 86], [444, 124]], a.roof);
    o += rect(50, 120, 380, GY - 120, a.wall);
    o += siding(50, 120, 380, GY - 120, a.wall, 7);
    o += rect(46, 118, 388, 5, shade(a.roof, 0.15));
    o += rect(218, 104, 44, GY - 104, shade(a.wall, -0.12));
    for (let y = 116; y < 214; y += 15) o += rect(230, y, 20, 10, rand() < litP ? LIT : 'url(#glass)');
    o += rect(226, 220, 28, 4, a.trim) + rect(228, 224, 24, GY - 224, a.accent);
    const cols = [66, 112, 158, 288, 334, 380];
    [134, 174, 214].forEach((y, f) => cols.forEach((x, i) => {
      o += win(x, y, 30, 24, { frame: a.trim, lit: rand() < litP });
      if (f < 2 && (i === 1 || i === 4)) {
        o += rect(x - 6, y + 13, 42, 2, a.trim) + rect(x - 6, y + 25, 42, 3, a.trim);
        for (let k = 0; k <= 6; k++) o += rect(x - 5 + k * 6.6, y + 14, 1.4, 11, a.trim);
      }
    }));
    o += shrubs(56, 210, GY + 2, rand) + shrubs(270, 430, GY + 2, rand);
    return o;
  }

  function loft(a, rand, litP) {
    const frame = a.trim;
    let o = rect(398, 22, 24, 90, shade(a.wall, -0.08)) + rect(395, 18, 30, 6, shade(a.wall, -0.3));
    [44, 66].forEach((y) => { o += rect(398, y, 24, 3, shade(a.wall, -0.25)); });
    for (let x = 30; x < 449; x += 52.5) {
      o += poly([[x, 104], [x + 52.5, 82], [x + 52.5, 104]], shade(a.wall, -0.2));
      o += rect(x + 47, 86, 4, 18, 'url(#glass)');
    }
    o += rect(30, 102, 420, GY - 102, a.wall);
    o += siding(30, 102, 420, GY - 102, a.wall, 7);
    if (a.sign) o += `<text x="240" y="126" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="14" letter-spacing="5" fill="#F3E9DC" opacity=".42">${a.sign}</text>`;
    for (let x = 46; x < 440; x += 52) {
      o += win(x, 138, 30, 48, { frame, arch: true, panes: true, lit: rand() < litP });
      o += win(x, 198, 30, 42, { frame, panes: true, lit: rand() < litP });
    }
    o += rect(196, 192, 92, 5, frame);
    o += shrubs(36, 120, GY + 2, rand) + shrubs(360, 444, GY + 2, rand);
    return o;
  }

  function house(a, rand, litP) {
    const wide = !!a.wide;
    const x0 = wide ? 84 : 128;
    const w = wide ? 312 : 224;
    const top = 132;
    const peak = wide ? 52 : 60;
    const cx = x0 + w / 2;
    let o = rect(x0 + w * 0.74, 72, 18, 56, shade(a.roof, 0.12));
    o += poly([[x0 - 16, top + 4], [cx, peak], [x0 + w + 16, top + 4]], a.roof);
    o += poly([[x0 + 6, top], [cx, peak + 16], [x0 + w - 6, top]], a.wall);
    o += rect(x0, top, w, GY - top, a.wall);
    o += siding(x0, top, w, GY - top, a.wall, 8);
    o += circ(cx, top - 24, 11, a.trim) + circ(cx, top - 24, 8, rand() < litP ? LIT : 'url(#glass)') + rect(cx - 0.8, top - 32, 1.6, 16, a.trim);
    const up = wide ? [x0 + 26, x0 + 92, x0 + w - 122, x0 + w - 56] : [x0 + 28, x0 + w - 58];
    up.forEach((x) => { o += win(x, top + 12, 30, 40, { frame: a.trim, lit: rand() < litP, sill: a.trim }); });
    const py = 186;
    o += rect(x0 - 12, py, w + 24, 8, a.trim) + rect(x0 - 12, py + 8, w + 24, 3, shade(a.trim, -0.18));
    const cols = wide ? [x0 - 8, x0 + w * 0.3, x0 + w * 0.7, x0 + w + 2] : [x0 - 8, x0 + w / 3, x0 + (2 * w) / 3, x0 + w + 2];
    cols.forEach((x) => { o += rect(x, py + 10, 6, GY - py - 10, a.trim); });
    const low = wide ? [98, 138, 316, 356] : [x0 + 20, x0 + w - 56];
    low.forEach((x) => { o += win(x, 200, 34, 30, { frame: a.trim, lit: rand() < litP }); });
    o += rect(x0 - 10, 226, cx - 22 - (x0 - 10), 3, a.trim) + rect(cx + 22, 226, x0 + w + 10 - (cx + 22), 3, a.trim);
    for (let x = x0 - 6; x < cx - 24; x += 9) o += rect(x, 229, 2, GY - 233, a.trim);
    for (let x = cx + 26; x < x0 + w + 10; x += 9) o += rect(x, 229, 2, GY - 233, a.trim);
    o += rect(cx - 15, 200, 30, 6, 'url(#glass)') + rect(cx - 15, 207, 30, GY - 213, a.accent) + circ(cx + 9, 228, 1.8, '#EBD9A4');
    o += rect(cx - 24, GY - 6, 48, 6, shade(a.trim, -0.22));
    if (a.bikes) o += bike(18, GY + 16) + bike(52, GY + 16);
    return o;
  }

  function duplex(a, rand, litP) {
    const x0 = 84;
    const w = 312;
    const top = 128;
    let o = poly([[x0 - 14, top + 4], [x0 + 78, 64], [240, top - 6], [x0 + w - 78, 64], [x0 + w + 14, top + 4]], a.roof);
    o += poly([[x0 + 8, top], [x0 + 78, 80], [x0 + 148, top]], a.wall) + poly([[x0 + w - 148, top], [x0 + w - 78, 80], [x0 + w - 8, top]], a.wall);
    o += rect(x0, top, w, GY - top, a.wall);
    o += siding(x0, top, w, GY - top, a.wall, 8);
    o += rect(238, top - 2, 4, GY - top + 2, shade(a.wall, -0.2));
    [x0 + 78, x0 + w - 78].forEach((cx) => { o += win(cx - 10, 92, 20, 26, { frame: a.trim, lit: rand() < litP }); });
    [106, 182, 268, 344].forEach((x) => { o += win(x, top + 12, 30, 38, { frame: a.trim, lit: rand() < litP, sill: a.trim }); });
    [[74, 76], [330, 76]].forEach(([px, pw]) => {
      o += rect(px, 188, pw, 8, a.trim) + rect(px, 196, pw, 3, shade(a.trim, -0.18));
      [px + 2, px + pw - 8].forEach((x) => { o += rect(x, 198, 6, GY - 198, a.trim); });
    });
    [98, 352].forEach((x) => { o += rect(x, 204, 30, GY - 210, a.accent) + rect(x, 199, 30, 4, 'url(#glass)') + circ(x + 24, 228, 1.8, '#EBD9A4') + rect(x - 6, GY - 6, 42, 6, shade(a.trim, -0.22)); });
    [160, 200, 248, 288].forEach((x) => { o += win(x, 202, 32, 30, { frame: a.trim, lit: rand() < litP }); });
    o += shrubs(160, 325, GY + 3, rand);
    return o;
  }

  function studio(a, rand, litP) {
    const x0 = 116;
    const w = 248;
    let o = rect(x0, 84, w, GY - 84, a.wall);
    o += siding(x0, 84, w, GY - 84, a.wall, 7);
    o += rect(x0 - 8, 72, w + 16, 12, a.trim);
    for (let x = x0 - 4; x < x0 + w + 4; x += 12) o += rect(x, 84, 5, 5, a.trim);
    const bx = x0 + 20;
    o += rect(bx - 4, 94, 112, 128, shade(a.wall, 0.08));
    o += rect(bx - 6, 92, 116, 4, a.trim) + rect(bx - 6, 220, 116, 4, a.trim);
    [102, 144, 186].forEach((y) => [bx + 2, bx + 36, bx + 70].forEach((x) => { o += win(x, y, 30, 32, { frame: a.trim, lit: rand() < litP }); }));
    [102, 144].forEach((y) => [x0 + 154, x0 + 202].forEach((x) => { o += win(x, y, 30, 32, { frame: a.trim, lit: rand() < litP, sill: a.trim }); }));
    o += rect(x0 + 160, 186, 64, 6, a.trim);
    o += rect(x0 + 176, 196, 32, GY - 206, a.accent) + rect(x0 + 176, 192, 32, 4, 'url(#glass)') + circ(x0 + 202, 224, 1.8, '#EBD9A4');
    o += rect(x0 + 172, GY - 10, 40, 4, shade(a.trim, -0.12)) + rect(x0 + 168, GY - 6, 48, 6, shade(a.trim, -0.2));
    o += shrubs(x0 + 10, x0 + 140, GY + 2, rand);
    return o;
  }

  function tower(a, rand, litP) {
    const gx = 122;
    const gw = 204;
    const top = 34;
    const slab = lum(a.wall) > lum(a.trim) ? a.wall : a.trim;
    let o = rect(gx + gw, 62, 74, GY - 62, a.wall);
    for (let y = 76; y < GY - 30; y += 28) o += win(gx + gw + 22, y, 30, 16, { frame: shade(a.wall, -0.2), lit: rand() < litP, mullion: false });
    o += rect(gx + gw, 62, 9, GY - 62, a.accent);
    o += rect(gx, top, gw, GY - top, 'url(#glass2)');
    for (let x = gx; x <= gx + gw; x += 25.5) o += rect(x - 0.7, top, 1.4, GY - top, '#FFFFFF', 'opacity=".35"');
    for (let y = top; y < GY; y += 28) {
      o += rect(gx, y, gw, 3, slab);
      for (let x = gx; x < gx + gw - 2; x += 25.5) if (rand() < litP * 0.8) o += rect(x + 1, y + 3, 24, 25, LIT, 'opacity=".55"');
    }
    for (let y = top + 28; y < GY - 30; y += 28) o += rect(gx - 14, y - 12, 76, 12, '#FFFFFF', 'opacity=".22"') + rect(gx - 14, y - 13, 76, 1.5, slab) + rect(gx - 14, y, 76, 4, slab);
    o += rect(gx - 4, top - 6, gw + 8, 7, slab);
    o += rect(gx + 12, top - 22, 96, 3, a.accent);
    [gx + 14, gx + 60, gx + 104].forEach((x) => { o += rect(x, top - 20, 2.5, 14, a.accent); });
    o += rect(gx + 30, GY - 28, 120, 28, LIT, 'opacity=".55"') + rect(gx + 22, GY - 32, 136, 5, slab);
    o += shrubs(gx - 40, gx + 24, GY + 2, rand) + shrubs(gx + gw + 10, gx + gw + 80, GY + 2, rand);
    return o;
  }

  function cottage(a, rand, litP) {
    let o = tree(118, GY, 1.7, rand);
    o += rect(286, 100, 16, 40, shade(a.roof, 0.15));
    o += rect(172, 150, 152, GY - 150, a.wall);
    o += siding(172, 150, 152, GY - 150, a.wall, 8);
    o += poly([[158, 156], [248, 90], [338, 156]], a.roof);
    o += win(239, 112, 18, 24, { frame: a.trim, lit: rand() < litP });
    o += win(186, 168, 70, 52, { frame: a.trim, lit: rand() < litP, panes: true });
    o += rect(266, 178, 42, 4, a.trim) + rect(270, 182, 34, GY - 182, a.accent) + circ(297, 220, 1.8, '#EBD9A4');
    o += rect(184, 221, 74, 6, a.accent);
    for (let x = 189; x < 256; x += 7) o += circ(x, 219, 3.2, pick(['#E58F7B', '#F2C14E', '#F7F3EA'], rand));
    for (let x = 4; x < W; x += 14) {
      if (x > 262 && x < 310) continue;
      o += rect(x, GY + 2, 8, 22, '#F4F1EA') + poly([[x, GY + 2], [x + 4, GY - 3], [x + 8, GY + 2]], '#F4F1EA');
    }
    o += rect(0, GY + 8, 264, 3, '#E2DDD2') + rect(310, GY + 8, W - 310, 3, '#E2DDD2') + rect(0, GY + 17, 264, 3, '#E2DDD2') + rect(310, GY + 17, W - 310, 3, '#E2DDD2');
    return o;
  }

  function shopfront(a, rand, litP) {
    const x0 = 96;
    const w = 288;
    let o = rect(x0, 62, w, GY - 62, a.wall);
    o += siding(x0, 62, w, 104, a.wall, 7);
    o += rect(x0 - 8, 54, w + 16, 10, a.trim) + rect(x0 - 4, 64, w + 8, 4, shade(a.trim, -0.15));
    [80, 124].forEach((y) => [x0 + 20, x0 + 86, x0 + 166, x0 + 232].forEach((x) => {
      o += rect(x - 3, y - 5, 42, 4, a.trim) + win(x, y, 36, 34, { frame: a.trim, lit: rand() < litP, sill: a.trim });
    }));
    o += rect(x0 + 8, 168, w - 16, 22, shade(a.accent, -0.12));
    if (a.sign) o += `<text x="240" y="183.5" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="12.5" font-weight="700" letter-spacing="3" fill="#F7F0E0">${a.sign}</text>`;
    const aw = (w - 16) / 10;
    for (let i = 0; i < 10; i++) {
      const x = x0 + 8 + i * aw;
      const c = i % 2 ? '#F7F3EA' : a.accent;
      o += rect(x, 192, aw, 14, c) + path(`M${n(x)} 206Q${n(x + aw / 2)} 213 ${n(x + aw)} 206Z`, c);
    }
    o += rect(x0 + 14, 214, 112, GY - 218, a.trim) + rect(x0 + 18, 217, 104, GY - 224, 'url(#glass)');
    o += rect(x0 + w - 126, 214, 112, GY - 218, a.trim) + rect(x0 + w - 122, 217, 104, GY - 224, 'url(#glass)');
    for (let i = 0; i < 4; i++) o += ell(x0 + 40 + i * 22, GY - 12, 9, 5, '#C98B4E') + ell(x0 + 40 + i * 22, GY - 13.5, 6, 2, '#E0A866');
    o += rect(225, 210, 30, GY - 210, shade(a.accent, -0.25)) + rect(229, 214, 22, 18, 'url(#glass)');
    return o;
  }

  function townhouse(a, rand, litP) {
    const walls = a.walls || [a.wall, shade(a.wall, 0.15), shade(a.wall, -0.1)];
    let o = '';
    for (let i = 0; i < 3; i++) {
      const x = 75 + i * 110;
      const w = 110;
      const top = i === 1 ? 80 : 94;
      const wall = walls[i % walls.length];
      if (i !== 1) o += poly([[x - 4, top + 2], [x + w / 2, top - 32], [x + w + 4, top + 2]], a.roof);
      o += rect(x, top, w, GY - top, wall);
      o += siding(x, top, w, GY - top, wall, 7);
      if (i === 1) o += rect(x - 3, top - 8, w + 6, 10, a.roof);
      [top + 16, top + 58].forEach((y) => {
        o += win(x + 16, y, 30, 30, { frame: a.trim, lit: rand() < litP, sill: a.trim });
        o += win(x + 64, y, 30, 30, { frame: a.trim, lit: rand() < litP, sill: a.trim });
      });
      o += rect(x + 10, 198, 58, GY - 198, shade(wall, 0.22));
      for (let y = 204; y < GY; y += 8) o += rect(x + 10, y, 58, 1.4, shade(wall, -0.08));
      o += rect(x + 74, 198, 28, 4, a.trim) + rect(x + 76, 202, 24, GY - 202, a.accent) + circ(x + 95, 228, 1.6, '#EBD9A4');
      o += rect(x + w - 1, top, 2, GY - top, shade(wall, -0.25));
    }
    o += shrubs(36, 72, GY + 2, rand) + shrubs(408, 446, GY + 2, rand);
    return o;
  }

  const STYLES = { hall, suites, garden, loft, house, duplex, studio, tower, cottage, shopfront, townhouse };
  const DOOR_X = { hall: 240, suites: 240, garden: 240, studio: 308 };

  function exterior(l) {
    const a = l.art || {};
    const rand = rng(hash(l.id + ':ext'));
    const sky = SKIES[a.sky || 0];
    const ground = l.campus === 'on' ? 'campus' : a.style === 'cottage' ? 'garden' : 'street';
    let o = backdrop(sky, rand);
    o += tree(26 + rand() * 18, GY + 3, 1.05 + rand() * 0.3, rand) + tree(456 - rand() * 18, GY + 3, 1 + rand() * 0.35, rand);
    o += ground === 'street' ? street(sky) : lawnGround(sky, ground === 'campus' ? DOOR_X[a.style] || 240 : 287);
    o += (STYLES[a.style] || garden)(a, rand, sky.litP);
    if (ground === 'campus') o += lamp(120, GY + 34) + lamp(360, GY + 34);
    return o;
  }

  // ---------- interiors ----------

  function roomBase(a, floorY) {
    const wall = a.room || '#ECE7DF';
    const floor = a.floor || '#C49A6C';
    let o = rect(0, 0, W, H, wall) + rect(0, 0, W, floorY, 'url(#wallshade)');
    o += rect(0, floorY, W, H - floorY, floor);
    for (let y = floorY + 12; y < H; y += 13) o += rect(0, y, W, 1, shade(floor, -0.18), 'opacity=".5"');
    o += rect(0, floorY - 6, W, 6, shade(wall, 0.4));
    return o;
  }

  function windowView(x, y, w, h, a, curtains) {
    const sky = SKIES[a.sky || 0];
    let o = '';
    if (curtains) o += rect(x - 30, y - 18, w + 60, 4, '#6B5443');
    o += rect(x - 6, y - 6, w + 12, h + 12, '#FFFFFF');
    o += rect(x, y, w, h, 'url(#sky)');
    o += path(`M${n(x)} ${n(y + h * 0.7)}Q${n(x + w * 0.25)} ${n(y + h * 0.5)} ${n(x + w * 0.5)} ${n(y + h * 0.66)}T${n(x + w)} ${n(y + h * 0.6)}V${n(y + h)}H${n(x)}Z`, sky.far, 'opacity=".85"');
    o += rect(x + w / 2 - 2, y, 4, h, '#FFFFFF') + rect(x, y + h / 2 - 2, w, 4, '#FFFFFF');
    o += rect(x - 10, y + h + 6, w + 20, 6, '#FFFFFF');
    if (curtains) o += rect(x - 26, y - 14, 22, h + 30, curtains, 'opacity=".92"') + rect(x + w + 4, y - 14, 22, h + 30, curtains, 'opacity=".92"');
    return o;
  }

  function bed(x, y, w, a, color) {
    const wood = shade(a.floor || '#C49A6C', -0.3);
    let o = ell(x + w / 2, y + 106, w * 0.56, 7, '#000000', 'opacity=".1"');
    o += rect(x, y, w, 60, wood, 'rx="8"');
    if (w < 150) o += rect(x + w / 2 - 26, y + 34, 52, 22, '#FBFAF7', 'rx="7"');
    else o += rect(x + 10, y + 34, w / 2 - 15, 22, '#FBFAF7', 'rx="7"') + rect(x + w / 2 + 5, y + 34, w / 2 - 15, 22, '#FBFAF7', 'rx="7"');
    o += rect(x - 4, y + 52, w + 8, 12, '#F4F1EA', 'rx="3"');
    o += rect(x - 4, y + 60, w + 8, 40, color, 'rx="4"');
    o += rect(x - 4, y + 60, w + 8, 9, shade(color, 0.25), 'rx="3"');
    o += rect(x + 2, y + 98, 6, 8, wood) + rect(x + w - 8, y + 98, 6, 8, wood);
    return o;
  }

  function bunk(x, y, w, a) {
    const wood = shade(a.floor || '#C49A6C', -0.3);
    let o = rect(x, y, 8, 246 - y, wood) + rect(x + w - 8, y, 8, 246 - y, wood);
    o += rect(x + 12, y + 26, 40, 16, '#FBFAF7', 'rx="6"') + rect(x + 4, y + 40, w - 8, 10, '#F4F1EA', 'rx="3"') + rect(x + 4, y + 46, w - 8, 22, a.textile2 || '#C0704E', 'rx="3"');
    o += rect(x, y + 30, w, 4, wood);
    o += rect(x + 12, y + 116, 44, 18, '#FBFAF7', 'rx="6"') + rect(x + 4, y + 132, w - 8, 10, '#F4F1EA', 'rx="3"') + rect(x + 4, y + 140, w - 8, 36, a.textile || '#5A7D9A', 'rx="3"');
    o += rect(x + w - 30, y + 40, 4, 136, wood) + rect(x + w - 12, y + 40, 4, 136, wood);
    for (let k = 0; k < 5; k++) o += rect(x + w - 30, y + 60 + k * 24, 22, 3, wood);
    return o;
  }

  function desk(x, y, w, a) {
    const wood = shade(a.floor || '#C49A6C', -0.15);
    const leg = shade(wood, -0.2);
    let o = rect(x, y, w, 7, wood) + rect(x + 4, y + 7, 5, 246 - y - 7, leg) + rect(x + w - 9, y + 7, 5, 246 - y - 7, leg);
    o += rect(x + w - 62, y + 7, 46, 30, wood) + rect(x + w - 44, y + 20, 10, 2, leg);
    o += rect(x + 20, y - 24, 40, 24, '#3A4045', 'rx="2"') + rect(x + 23, y - 21, 34, 18, '#5C7A8C') + rect(x + 14, y - 2, 52, 3, '#2E3337');
    o += rect(x + w - 26, y - 32, 3, 32, '#3B4440') + poly([[x + w - 38, y - 30], [x + w - 12, y - 30], [x + w - 18, y - 44], [x + w - 32, y - 44]], a.textile2 || '#D1A13F');
    o += rect(x + 70, y - 12, 9, 12, '#F4F1EA', 'rx="2"');
    return o;
  }

  function shelf(x, y, w, rand) {
    const colors = ['#5A7D9A', '#C0704E', '#7C8F5A', '#D1A13F', '#8A6C9E', '#E8E1D6', '#3E6B5A'];
    let o = '';
    let cx = x + 4;
    while (cx < x + w - 12) {
      const bw = 6 + rand() * 6;
      const bh = 20 + rand() * 14;
      o += rect(cx, y - bh, bw, bh, pick(colors, rand));
      cx += bw + 1;
      if (rand() < 0.12) cx += 9;
    }
    return o + rect(x, y, w, 5, '#8B6A4E');
  }

  function plant(x, y, s) {
    let o = '';
    for (let i = 0; i < 6; i++) {
      const ang = -Math.PI / 2 + (i - 2.5) * 0.45;
      const lx = x + Math.cos(ang) * 22 * s;
      const ly = y - 26 * s + Math.sin(ang) * 30 * s;
      o += `<ellipse cx="${n(lx)}" cy="${n(ly)}" rx="${n(6 * s)}" ry="${n(16 * s)}" fill="${shade(LEAF[1], (i % 2) * 0.14)}" transform="rotate(${n((ang * 180) / Math.PI + 90)} ${n(lx)} ${n(ly)})"/>`;
    }
    return o + rect(x - 12 * s, y - 26 * s, 24 * s, 26 * s, '#C9855E', 'rx="3"');
  }

  function artwork(x, y, w, h, a) {
    return rect(x - 4, y - 4, w + 8, h + 8, '#3B3F3C') + rect(x, y, w, h, '#F7F4EE') +
      circ(x + w * 0.35, y + h * 0.45, h * 0.26, a.textile2 || '#D1A13F') + rect(x + w * 0.5, y + h * 0.2, w * 0.32, h * 0.6, a.textile || '#5A7D9A', 'opacity=".85"');
  }

  function rug(cx, cy, rx, ry, color) {
    return ell(cx, cy, rx, ry, color, 'opacity=".5"') + ell(cx, cy, rx - 10, ry - 5, '#FFFFFF', 'opacity=".12"');
  }

  function bedroom(l) {
    const a = l.art || {};
    const rand = rng(hash(l.id + ':bed'));
    const t1 = a.textile || '#5A7D9A';
    const t2 = a.textile2 || '#C0704E';
    let o = roomBase(a, 236);
    const beds = a.beds || 1;
    if (beds === 1) {
      o += windowView(318, 46, 112, 96, a, t2);
      o += shelf(40, 100, 140, rand) + artwork(200, 62, 58, 44, a);
      o += bed(30, 142, 196, a, t1);
      o += rect(236, 196, 40, 46, shade(a.floor || '#C49A6C', -0.22), 'rx="3"') + rect(252, 178, 8, 18, '#E8E1D6') + poly([[242, 180], [270, 180], [264, 162], [248, 162]], t2);
      o += desk(300, 196, 140, a);
      o += plant(458, 246, 0.9);
      o += rug(240, 288, 170, 20, t2);
    } else if (beds === 2) {
      o += windowView(184, 46, 112, 96, a, null);
      o += shelf(26, 100, 110, rand) + shelf(344, 100, 110, rand);
      o += bed(18, 142, 132, a, t1) + bed(330, 142, 132, a, t2);
      o += desk(170, 196, 140, a);
      o += rug(240, 290, 120, 18, t1);
    } else {
      o += windowView(190, 46, 100, 90, a, null);
      o += bunk(20, 60, 140, a);
      o += bed(320, 142, 140, a, t2);
      o += desk(176, 196, 128, a);
      o += rug(240, 290, 130, 18, t1);
    }
    return o;
  }

  function kitchen(l) {
    const a = l.art || {};
    const rand = rng(hash(l.id + ':kit'));
    const FY = 252;
    const colored = rand() < 0.55;
    const cab = colored ? shade(a.textile || '#5A7D9A', 0.08) : '#F1EFEA';
    const counter = colored ? '#EDEAE4' : shade(a.floor || '#C49A6C', -0.05);
    const line = shade(cab, -0.16);
    let o = rect(0, 0, W, H, a.room || '#ECE7DF');
    o += rect(0, FY, W, H - FY, '#D8D2C8');
    for (let x = 0; x < W; x += 34) o += rect(x, FY, 1, H - FY, '#C4BDB2');
    for (let y = FY + 22; y < H; y += 22) o += rect(0, y, W, 1, '#C4BDB2');
    o += rect(26, 108, 364, 66, '#F6F4F0');
    for (let row = 0, y = 108; y < 174; y += 11, row++) {
      o += rect(26, y, 364, 0.8, '#DAD6CF');
      for (let x = 26 + (row % 2) * 11; x < 390; x += 22) o += rect(x, y, 0.8, 11, '#DAD6CF');
    }
    o += windowView(206, 30, 90, 66, a, null);
    [[26, 162, 4], [314, 76, 2]].forEach(([x, w, doors]) => {
      o += rect(x, 22, w, 78, cab, 'rx="2"');
      const dw = w / doors;
      for (let k = 1; k < doors; k++) o += rect(x + k * dw - 0.6, 24, 1.2, 74, line);
      for (let k = 0; k < doors; k++) o += rect(x + k * dw + dw / 2 - 1.5, 86, 3, 9, '#9EA4A8', 'rx="1.5"');
    });
    o += rect(398, 22, 66, FY - 22, '#DADDE0', 'rx="5"') + rect(398, 104, 66, 2, '#B9BDC1') + rect(452, 44, 3, 44, '#9EA4A8') + rect(452, 118, 3, 56, '#9EA4A8');
    o += rect(26, 182, 364, FY - 182, cab);
    for (let x = 26 + 52; x < 390; x += 52) o += rect(x - 0.6, 184, 1.2, FY - 186, line);
    for (let x = 26; x < 386; x += 52) o += rect(x + 22, 190, 8, 2.5, '#9EA4A8', 'rx="1"');
    o += rect(60, 192, 72, 54, '#3A3F42', 'rx="3"') + rect(68, 204, 56, 28, '#56616A', 'rx="2"') + rect(68, 196, 56, 3, '#9EA4A8');
    o += rect(22, 172, 372, 10, counter, 'rx="2"');
    o += rect(212, 172, 72, 4, '#B9C0C4') + path('M250 172V156Q250 148 258 148H264', 'none', 'stroke="#8E979C" stroke-width="3" stroke-linecap="round"');
    o += ell(98, 164, 15, 9, a.textile2 || '#C0704E') + rect(92, 150, 12, 6, '#3A3F42', 'rx="2"') + path('M112 160Q122 160 120 170', 'none', 'stroke="#3A3F42" stroke-width="2.5"');
    o += path('M318 166A22 9 0 0 0 362 166Z', '#F4F1EA') + circ(330, 162, 6, '#E58F7B') + circ(342, 160, 6, '#F2C14E') + circ(352, 163, 5.5, '#7EA273');
    o += plant(376, 172, 0.55);
    return o;
  }

  function living(l) {
    const a = l.art || {};
    const t1 = a.textile || '#5A7D9A';
    const t2 = a.textile2 || '#C0704E';
    const sofa = shade(t1, -0.04);
    let o = roomBase(a, 240);
    o += windowView(44, 44, 130, 120, a, t2);
    o += artwork(282, 62, 72, 54, a);
    o += rect(206, 96, 3, 146, '#3B4440') + poly([[192, 100], [222, 100], [216, 76], [198, 76]], '#F4EBD6') + ell(207.5, 243, 12, 3, '#3B4440');
    const sx = 214;
    const sw = 230;
    const sy = 150;
    o += ell(sx + sw / 2, 250, sw * 0.55, 8, '#000000', 'opacity=".09"');
    o += rect(sx + 12, sy, sw - 24, 52, sofa, 'rx="12"');
    o += rect(sx, sy + 26, 26, 62, shade(sofa, -0.08), 'rx="10"') + rect(sx + sw - 26, sy + 26, 26, 62, shade(sofa, -0.08), 'rx="10"');
    o += rect(sx + 20, sy + 50, sw - 40, 34, shade(sofa, 0.06), 'rx="8"');
    const cw = (sw - 52) / 2;
    o += rect(sx + 24, sy + 10, cw, 40, shade(sofa, 0.12), 'rx="10"') + rect(sx + 28 + cw, sy + 10, cw, 40, shade(sofa, 0.12), 'rx="10"');
    o += `<rect x="${sx + 38}" y="${sy + 22}" width="30" height="28" rx="6" fill="${t2}" transform="rotate(-9 ${sx + 53} ${sy + 36})"/>`;
    o += rect(sx + 14, sy + 84, 6, 10, '#3B3F3C') + rect(sx + sw - 20, sy + 84, 6, 10, '#3B3F3C');
    o += rug(330, 292, 170, 22, t2);
    const tw = shade(a.floor || '#C49A6C', -0.32);
    o += rect(250, 262, 150, 8, tw, 'rx="3"') + rect(258, 270, 5, 20, tw) + rect(387, 270, 5, 20, tw);
    o += rect(276, 254, 36, 8, '#E8E1D6') + rect(280, 248, 30, 6, t1) + rect(350, 252, 10, 10, '#F4F1EA', 'rx="2"');
    o += plant(462, 244, 1);
    return o;
  }

  function lounge(l) {
    const a = l.art || {};
    const rand = rng(hash(l.id + ':lng'));
    const t1 = a.textile || '#5A7D9A';
    const t2 = a.textile2 || '#C0704E';
    let o = roomBase(a, 236);
    [40, 150, 260].forEach((x) => { o += windowView(x, 40, 84, 112, a, null); });
    o += rect(368, 30, 100, 206, '#8B6A4E') + rect(374, 36, 88, 194, shade('#8B6A4E', -0.2));
    [76, 120, 164, 208].forEach((y) => { o += shelf(374, y, 88, rand); });
    [90, 200, 310].forEach((x) => { o += rect(x - 0.8, 0, 1.6, 20, '#3B4440') + path(`M${x - 14} 32A14 12 0 0 1 ${x + 14} 32Z`, t2) + ell(x, 33, 10, 2, '#FFE7B0'); });
    [60, 130, 200, 270].forEach((x) => { o += rect(x, 176, 34, 32, t1, 'rx="7"') + rect(x + 4, 180, 26, 6, shade(t1, 0.18), 'rx="3"'); });
    const wood = shade(a.floor || '#C49A6C', -0.3);
    o += rect(30, 206, 320, 8, wood, 'rx="2"') + rect(40, 214, 6, 30, wood) + rect(334, 214, 6, 30, wood);
    o += rect(70, 186, 34, 20, '#3A4045', 'rx="2"') + rect(73, 189, 28, 14, '#5C7A8C') + rect(210, 186, 34, 20, '#3A4045', 'rx="2"') + rect(213, 189, 28, 14, '#6C8A7C');
    o += rect(150, 196, 10, 10, '#F4F1EA', 'rx="2"') + rect(276, 196, 30, 5, t2) + rect(278, 191, 26, 5, '#E8E1D6');
    o += ell(190, 280, 150, 20, t1, 'opacity=".25"');
    return o;
  }

  function photoKinds(l) {
    const dorm = l.campus === 'on' && /hall|community/i.test(l.kind);
    if (dorm) return [['exterior', 'Exterior'], ['bedroom', 'Room'], ['lounge', 'Study lounge'], ['living', 'Floor lounge']];
    if (l.roommates === 0) return [['exterior', 'Exterior'], ['living', 'Main room'], ['kitchen', 'Kitchen'], ['bedroom', 'Sleeping area']];
    return [['exterior', 'Exterior'], ['living', 'Living room'], ['kitchen', 'Kitchen'], ['bedroom', 'Bedroom']];
  }

  function sceneSVG(l, kind) {
    const sky = SKIES[(l.art && l.art.sky) || 0];
    const body = kind === 'bedroom' ? bedroom(l) : kind === 'kitchen' ? kitchen(l) : kind === 'living' ? living(l) : kind === 'lounge' ? lounge(l) : exterior(l);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs(sky)}${body}</svg>`;
  }

  const photoCache = new Map();
  function photos(l) {
    if (photoCache.has(l.id)) return photoCache.get(l.id);
    const list = photoKinds(l).map(([kind, caption], i) => ({
      caption,
      src: (l.photos && l.photos[i]) || 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sceneSVG(l, kind)),
    }));
    photoCache.set(l.id, list);
    return list;
  }

  // ---------- map ----------

  function distSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const len = dx * dx + dy * dy;
    let t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  function distPoly(px, py, pts) {
    let m = Infinity;
    for (let i = 0; i < pts.length - 1; i++) m = Math.min(m, distSeg(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
    return m;
  }

  function smooth(pts) {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      d += `C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

  function blocksPath(M) {
    const rand = rng(20270);
    const inBox = (x, y, b, pad) => x > b[0] - pad && x < b[2] + pad && y > b[1] - pad && y < b[3] + pad;
    const parks = M.parks.map((p) => [p.rect[0], p.rect[1], p.rect[0] + p.rect[2], p.rect[1] + p.rect[3]]);
    let d = '';
    for (let gy = -150; gy < 960; gy += 30) {
      for (let gx = -230; gx < 1430; gx += 30) {
        if (rand() < 0.28) continue;
        const w = 9 + rand() * 13;
        const h = 8 + rand() * 12;
        const x = gx + rand() * (30 - w);
        const y = gy + rand() * (30 - h);
        const cx = x + w / 2;
        const cy = y + h / 2;
        const rr = Math.max(w, h) / 2;
        if (M.campusBox.some((b) => inBox(cx, cy, b, 10))) continue;
        if (parks.some((b) => inBox(cx, cy, b, 8))) continue;
        if (distPoly(cx, cy, M.river.pts) < 30 + rr) continue;
        let ok = true;
        for (const r of M.roads) {
          if (distPoly(cx, cy, r.pts) < (r.major ? 8 : 5.5) + rr + 2) { ok = false; break; }
        }
        if (ok) d += `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`;
      }
    }
    return d;
  }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  function mapGroup(M) {
    const P = (pts) => 'M' + pts.map((p) => n(p[0]) + ' ' + n(p[1])).join('L');
    let o = '<rect class="m-land" x="-800" y="-600" width="2800" height="2000"/>';
    o += `<path class="m-block" d="${blocksPath(M)}"/>`;
    M.parks.forEach((p) => { o += `<rect class="m-park" x="${p.rect[0]}" y="${p.rect[1]}" width="${p.rect[2]}" height="${p.rect[3]}" rx="16"/>`; });
    o += `<path class="m-campus" d="${M.campus}"/>`;
    const q = M.quadRect;
    o += `<rect class="m-quad" x="${q[0]}" y="${q[1]}" width="${q[2]}" height="${q[3]}" rx="14"/>`;
    o += `<path class="m-cpath" d="${M.campusPaths.map(P).join('')}"/>`;
    o += `<path class="m-bldg" d="${M.campusBuildings.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}z`).join('')}"/>`;
    o += `<path class="m-water" d="${smooth(M.river.pts)}"/>`;
    o += `<ellipse class="m-pond" cx="${M.pond[0]}" cy="${M.pond[1]}" rx="${M.pond[2]}" ry="${M.pond[3]}"/>`;
    const minor = M.roads.filter((r) => !r.major).map((r) => P(r.pts)).join('');
    const major = M.roads.filter((r) => r.major).map((r) => P(r.pts)).join('');
    o += `<path class="m-casing" d="${minor}" stroke-width="9.5"/><path class="m-casing" d="${major}" stroke-width="15"/>`;
    o += `<path class="m-road" d="${minor}" stroke-width="7"/><path class="m-road" d="${major}" stroke-width="12"/>`;
    M.routes.forEach((r) => { o += `<path class="m-route m-route-${r.id}" d="${P(r.pts)}"/>`; });
    M.routes.forEach((r) => r.stops.forEach((s) => { o += `<circle class="m-stop m-stop-${r.id}" cx="${s[0]}" cy="${s[1]}" r="4.2"/>`; }));
    M.parks.forEach((p) => { o += `<text class="m-txt m-plabel" x="${p.label[0]}" y="${p.label[1]}" text-anchor="middle">${esc(p.name)}</text>`; });
    const rl = M.river.label;
    o += `<text class="m-txt m-river" x="${rl[0]}" y="${rl[1]}" text-anchor="middle" transform="rotate(${rl[2]} ${rl[0]} ${rl[1]})">${esc(M.river.name)}</text>`;
    M.roads.forEach((r) => (r.labels || []).forEach(([x, y, ang]) => {
      o += `<text class="m-txt m-rlabel${r.major ? ' is-major' : ''}" x="${x}" y="${y}" dy="0.34em" text-anchor="middle"${ang ? ` transform="rotate(${ang} ${x} ${y})"` : ''}>${esc(r.name)}</text>`;
    }));
    M.hoods.forEach((h) => { o += `<text class="m-txt m-hood" x="${h.at[0]}" y="${h.at[1]}" text-anchor="middle">${esc(h.name.toUpperCase())}</text>`; });
    o += `<text class="m-txt m-clabel" x="${M.campusLabel[0]}" y="${M.campusLabel[1]}" text-anchor="middle">HARTWELL UNIVERSITY</text>`;
    o += `<text class="m-txt m-qlabel" x="${q[0] + q[2] / 2}" y="${q[1] + q[3] - 9}" text-anchor="middle">Main Quad</text>`;
    return o;
  }

  root.HR_ART = {
    photos,
    photo: (l, i) => photos(l)[i || 0].src,
    mapGroup,
    hash,
  };
})(typeof window !== 'undefined' ? window : globalThis);
