/*
  Homeroom matching logic. Pure functions, no DOM.
  Score = budget 30 + bedrooms 10 + baths 10 + commute 20 + amenities 20 + lease 10 = 100.
*/
(function (root) {
  'use strict';
  const D = root.HOMEROOM;

  // 0.0018 miles per map unit, times 1.25 for street grids instead of straight lines
  const MILES_PER_UNIT = 0.00225;
  const MAX = { budget: 30, bedrooms: 10, baths: 10, commute: 20, amenities: 20, lease: 10 };
  const LEASE_SHORT = { semester: 'one-semester', academic: 'academic-year', year: '12-month', flex: 'month-to-month' };
  const LEASE_NAME = { semester: 'One semester', academic: 'Academic year', year: '12 months', flex: 'Month-to-month' };
  const LEASE_COMPAT = {
    academic: { year: 4, semester: 2 },
    year: { academic: 5 },
    semester: { flex: 8, academic: 2 },
    flex: { semester: 6, year: 3, academic: 2 },
  };

  const AMENITY = {};
  D.quiz.amenities.forEach((a) => { AMENITY[a.value] = a; });

  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  function roundTo(n, step) {
    return Math.round(n / step) * step;
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function bedWord(n) { return n === 0 ? 'a studio' : n === 1 ? '1 bedroom' : n + ' bedrooms'; }
  function bedWant(n) { return n === 0 ? 'a studio' : n === 1 ? '1 bedroom' : n + ' bedrooms'; }
  function bathWord(n) { return n === 0 ? 'a shared bathroom' : n === 1 ? '1 bathroom' : n + ' bathrooms'; }

  function commute(l) {
    const q = D.campus.quad;
    const miles = Math.hypot(l.pos[0] - q[0], l.pos[1] - q[1]) * MILES_PER_UNIT;
    const walk = Math.max(2, Math.round(miles * 20));
    const bike = Math.max(2, Math.round(miles * 6.3 + 2));
    const drive = Math.max(4, Math.round(miles * 3.3 + 5));
    const bus = l.transit ? l.transit.total : null;
    return { miles, walk, bike, drive, bus };
  }

  function effective(l) {
    return l.rent + (l.utilities.included ? 0 : (l.utilities.estimate || 0));
  }

  function amenitySet(l) {
    const s = new Set(l.amenities);
    if (l.furnished) s.add('furnished');
    if (l.utilities.included) s.add('utilities');
    if (l.parking && l.parking.kind !== 'none') s.add('parking');
    if (l.petsAllowed) s.add('pets');
    return s;
  }

  function leaseKeys(l) {
    return Object.keys(l.leases);
  }

  function parkingText(l) {
    const p = l.parking;
    if (!p || p.kind === 'none') return 'No parking';
    if (p.kind === 'free') return 'Free parking';
    if (p.kind === 'permit') return 'Campus permit ' + money(p.cost) + '/semester';
    if (p.kind === 'street') return 'Street permit ' + money(p.cost) + '/mo';
    return 'Parking ' + money(p.cost) + '/mo';
  }

  // Short label for the commute sign on cards, in the student's chosen mode
  function commuteLabel(l, mode) {
    const c = commute(l);
    switch (mode) {
      case 'bike': return { icon: 'bike', short: c.bike + ' min bike', minutes: c.bike };
      case 'transit':
        if (c.bus != null && c.bus < c.walk) return { icon: 'bus', short: 'Route ' + l.transit.route + ' · ' + c.bus + ' min', minutes: c.bus };
        return { icon: 'walk', short: c.walk + ' min walk', minutes: c.walk };
      case 'car': return { icon: 'car', short: c.drive + ' min drive', minutes: c.drive };
      default: return { icon: 'walk', short: c.walk + ' min walk', minutes: c.walk };
    }
  }

  function listJoin(items) {
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }

  /*
    a = { budget, bedrooms, baths, commute, amenities: [], lease }
    keys = which parts to count (for the live preview while the quiz is in progress)
  */
  function score(l, a, keys) {
    keys = keys || Object.keys(MAX);
    const parts = {};
    const pros = [];
    const cons = [];
    const c = commute(l);
    const eff = effective(l);

    // Budget
    const diff = a.budget - eff;
    if (diff >= 0) parts.budget = 30;
    else {
      const over = -diff / a.budget;
      parts.budget = over <= 0.05 ? 22 : over <= 0.1 ? 14 : over <= 0.15 ? 8 : over <= 0.25 ? 3 : 0;
    }
    const utilNote = l.utilities.included ? '' : ', utilities counted';
    if (diff >= 25) pros.push({ k: 'budget', w: 3 + Math.min(diff / 100, 2), text: money(roundTo(diff, 5)) + ' under your budget' + utilNote });
    else if (diff >= 0) pros.push({ k: 'budget', w: 2.5, text: 'Right at your budget' + utilNote });
    else cons.push({ k: 'budget', w: 3 + Math.min(-diff / 100, 3), text: money(roundTo(-diff, 5)) + ' over your budget' + utilNote });

    // Bedrooms (exact match scores highest; off by more loses more)
    const wantBd = Number(a.bedrooms) || 0;
    const bd = l.bedrooms;
    const dBd = Math.abs(bd - wantBd);
    parts.bedrooms = dBd === 0 ? 10 : dBd === 1 ? 6 : dBd === 2 ? 3 : 0;
    if (dBd === 0) {
      pros.push({ k: 'bedrooms', w: 2.4, text: cap(bedWord(bd)) + ', exactly what you wanted' });
    } else {
      cons.push({ k: 'bedrooms', w: 1.4 + dBd, text: cap(bedWord(bd)) + ' (you wanted ' + bedWant(wantBd) + ')' });
    }

    // Baths (exact match scores highest; half-baths count)
    const wantBa = Number(a.baths) || 0;
    const ba = l.baths;
    const dBa = Math.abs(ba - wantBa);
    parts.baths = dBa === 0 ? 10 : dBa <= 0.5 ? 8 : dBa <= 1 ? 6 : dBa <= 2 ? 3 : 0;
    if (dBa === 0) {
      pros.push({ k: 'baths', w: 1.6, text: cap(bathWord(ba)) + ', just as you picked' });
    } else if (dBa > 1) {
      cons.push({ k: 'baths', w: 1.2 + dBa / 2, text: cap(bathWord(ba)) + ' (you wanted ' + bathWord(wantBa) + ')' });
    }

    // Commute
    let cs = 0;
    let ctext = '';
    switch (a.commute) {
      case 'bike': {
        const m = c.bike;
        cs = m <= 6 ? 20 : m <= 9 ? 18 : m <= 12 ? 15 : m <= 16 ? 10 : 5;
        if (amenitySet(l).has('bike')) cs = Math.min(20, cs + 2);
        ctext = m + ' min bike ride to the Quad';
        break;
      }
      case 'transit': {
        const hasBus = c.bus != null && c.bus < c.walk;
        const m = hasBus ? c.bus : c.walk;
        cs = m <= 10 ? 20 : m <= 14 ? 17 : m <= 18 ? 13 : m <= 22 ? 8 : 3;
        if (hasBus) ctext = 'Route ' + l.transit.route + ' bus, ' + c.bus + ' min door to door';
        else if (l.campus === 'on') ctext = 'On campus, ' + c.walk + ' min walk to the Quad';
        else if (c.walk <= 15) ctext = 'No bus needed, ' + c.walk + ' min walk';
        else ctext = 'No bus line nearby, ' + c.walk + ' min walk';
        break;
      }
      case 'car': {
        const k = l.parking ? l.parking.kind : 'none';
        cs = k === 'free' ? 20 : k === 'paid' ? 16 : k === 'permit' ? 15 : k === 'street' ? 11 : 2;
        if (c.drive > 10) cs -= 2;
        ctext = k === 'none' ? 'No parking here' : parkingText(l) + ', ' + c.drive + ' min drive';
        break;
      }
      default: {
        const m = c.walk;
        cs = m <= 8 ? 20 : m <= 12 ? 17 : m <= 16 ? 13 : m <= 20 ? 9 : m <= 25 ? 5 : 2;
        ctext = m + ' min walk to the Quad';
      }
    }
    parts.commute = Math.max(0, cs);
    if (cs >= 15) pros.push({ k: 'commute', w: 2 + cs / 10, text: ctext });
    else if (cs <= 10) cons.push({ k: 'commute', w: 2 + (10 - cs) / 4, text: ctext });

    // Amenities
    const want = a.amenities || [];
    const has = amenitySet(l);
    const got = want.filter((x) => has.has(x));
    const miss = want.filter((x) => !has.has(x));
    parts.amenities = want.length ? Math.round((20 * got.length) / want.length) : 20;
    if (got.length) {
      const names = got.map((x) => AMENITY[x].label.toLowerCase());
      let t;
      if (got.length === want.length && got.length <= 3) t = 'Matches your picks: ' + names.join(', ');
      else if (got.length === want.length) t = 'Has all ' + got.length + ' amenities you picked';
      else t = 'Has ' + got.length + ' of the ' + want.length + ' amenities you picked';
      pros.push({ k: 'amenities', w: 1.2 + got.length * 0.6, text: t });
    }
    miss.forEach((x, i) => cons.push({ k: 'amenities', w: 1.6 - i * 0.1, text: AMENITY[x].missing }));

    // Lease
    const opts = leaseKeys(l);
    let ls = 0;
    if (opts.includes(a.lease)) ls = 10;
    else {
      const compat = LEASE_COMPAT[a.lease] || {};
      ls = Math.max(0, ...opts.map((o) => compat[o] || 0));
    }
    parts.lease = ls;
    if (ls === 10) pros.push({ k: 'lease', w: 1.8, text: 'Offers ' + (a.lease === 'academic' ? 'an ' : a.lease === 'flex' ? '' : 'a ') + LEASE_SHORT[a.lease] + (a.lease === 'flex' ? ' terms' : ' lease') });
    else cons.push({ k: 'lease', w: 2.4 - ls / 10, text: 'No ' + LEASE_SHORT[a.lease] + ' lease' + (opts.length === 1 ? ' (' + LEASE_SHORT[opts[0]] + ' only)' : '') });

    let got2 = 0;
    let max = 0;
    keys.forEach((k) => { got2 += parts[k]; max += MAX[k]; });
    const total = Math.round((100 * got2) / (max || 1));

    pros.sort((x, y) => y.w - x.w);
    cons.sort((x, y) => y.w - x.w);
    return { total, parts, pros, cons, effective: eff, commute: c };
  }

  function rank(listings, a, opts) {
    opts = opts || {};
    return listings
      .filter((l) => !opts.campus || opts.campus === 'all' || l.campus === opts.campus)
      .map((l) => ({ l, s: score(l, a, opts.keys) }))
      .sort((x, y) => y.s.total - x.s.total || x.s.effective - y.s.effective);
  }

  root.HR_MATCH = {
    MAX, LEASE_SHORT, LEASE_NAME, AMENITY,
    money, commute, effective, amenitySet, leaseKeys, parkingText, commuteLabel, listJoin, score, rank,
    bedWord, bathWord,
  };
})(typeof window !== 'undefined' ? window : globalThis);
