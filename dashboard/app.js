// Token Radar dashboard (window.RADAR in, ranked board out; no network). V4 radar-3:
// the page recomputes every row from the fitted size curve, prices each farm plan
// at a ticket and drop share the reader can change, and shows the out-of-sample
// check, the 758-protocol ledger and a verdict per row. FARM_PLANS (top rows'
// researched plans) backs the detail drawer; data.js carries every row's steps.
(function () {
  'use strict';
  var DATA = window.RADAR;
  if (!DATA) return;
  var PLANS = window.FARM_PLANS || {};
  var app = document.getElementById('board');
  var state = { q: '', category: 'all', chain: 'all', tab: 'pre-token', sort: 'implied', dir: -1, selected: null, scope: 'all', verdict: 'any', ticket: DATA.econ.ticket_usd, drop: DATA.econ.drop_share };
  var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  function fmtUsd(n) {
    if (n === null || n === undefined || !isFinite(n)) return 'n/a';
    if (n < 0) return '-' + fmtUsd(-n);
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
    return money.format(n);
  }
  function fmtUsd2(n) {
    if (n === null || n === undefined || !isFinite(n)) return 'n/a';
    return (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(2);
  }
  function fmtPct(n) { if (n === null || n === undefined || !isFinite(n)) return 'n/a'; return (n > 0 ? '+' : '') + n.toFixed(1) + '%'; }
  function fmtAge(d) { if (d === null || d === undefined) return 'unknown'; if (d >= 365) return (d / 365).toFixed(1) + 'y'; return Math.max(0, Math.round(d)) + 'd'; }
  function fmtMult(n) { return 'x' + n.toFixed(2); }
  function fmtDrop() { return (Math.round(state.drop * 1000) / 10) + '%'; }

  // radar-3, in the page's own words: the fitted curve plus the small priors.
  function impliedOf(row) {
    var f = DATA.fit, m = DATA.model;
    var g = Math.min(m.growth_cap, Math.max(m.growth_floor, row.change_7d === null || row.change_7d === undefined ? 0 : row.change_7d));
    var gm = 1 + (g / 100) * m.growth_weight;
    var age = row.age_days === null || row.age_days === undefined ? m.unknown_age_days : row.age_days;
    var mm = m.maturity_floor + (Math.min(Math.max(age, 0), m.maturity_days) / m.maturity_days) * m.maturity_range;
    var sm = DATA.sector[row.category || '?'] || 1;
    var km = row.kin ? m.kinship : 1;
    return Math.max(1, Math.round(Math.pow(10, f.a + f.b * Math.log10(row.tvl_usd)) * gm * mm * sm * km));
  }
  // Farm economics at the reader's ticket and drop share. Odds need the LOO ratios.
  function econOf(row) {
    var slice = row.implied_value_usd * state.drop * (state.ticket / row.tvl_usd);
    var fees = row.fees_usd;
    var lowF = row.implied_value_usd > 0 ? row.implied_low_usd / row.implied_value_usd : 0;
    var net = slice - fees, netLow = slice * lowF - fees;
    var verdict = netLow > 0 ? 'FARM' : net > 0 ? 'MARGINAL' : 'SKIP';
    var odds = 0;
    if (DATA.loo_ratios && DATA.loo_ratios.length) {
      var need = slice > 0 ? fees / slice : Infinity;
      var ln = Math.log10(need);
      var ok = 0;
      for (var i = 0; i < DATA.loo_ratios.length; i++) if (DATA.loo_ratios[i] >= ln) ok++;
      odds = Math.round(ok / DATA.loo_ratios.length * 100);
    } else odds = row.odds_pct;
    return { slice: slice, fees: fees, net: net, netLow: netLow, verdict: verdict, odds: odds };
  }

  function h(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x) node.appendChild(x); });
      else if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    }
    return node;
  }

  function readHash() {
    var hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    var p = new URLSearchParams(hash);
    if (p.get('q')) state.q = p.get('q');
    if (p.get('p')) state.selected = p.get('p');
    if (p.get('category')) state.category = p.get('category');
    if (p.get('chain')) state.chain = p.get('chain');
    if (p.get('scope')) state.scope = p.get('scope');
    if (p.get('verdict')) state.verdict = p.get('verdict');
  }
  function writeHash() {
    var p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.category !== 'all') p.set('category', state.category);
    if (state.chain !== 'all') p.set('chain', state.chain);
    if (state.scope !== 'all') p.set('scope', state.scope);
    if (state.verdict !== 'any') p.set('verdict', state.verdict);
    if (state.selected) p.set('p', state.selected);
    var next = p.toString();
    if (next) window.history.replaceState(null, '', '#' + next);
    else window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  function visibleRows() {
    var q = state.q.trim().toLowerCase();
    return DATA.rows.filter(function (r) {
      if (state.scope === 'watchlist' && !r.watchlist) return false;
      if (state.scope === 'offlist' && (r.watchlist || r.tvl_usd < DATA.floor_usd)) return false;
      if (state.scope === 'below' && r.tvl_usd >= DATA.floor_usd) return false;
      if (state.verdict !== 'any' && econOf(r).verdict !== state.verdict) return false;
      if (state.category !== 'all' && r.category !== state.category) return false;
      if (state.chain !== 'all' && !(r.chains || []).includes(state.chain)) return false;
      if (!q) return true;
      return [r.name, r.slug, r.category, (r.chains || []).join(' ')].join(' ').toLowerCase().indexOf(q) >= 0;
    });
  }
  function sortRows(list) {
    return list.slice().sort(function (a, b) {
      var av, bv;
      if (state.sort === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (state.sort === 'tvl') { av = a.tvl_usd; bv = b.tvl_usd; }
      else if (state.sort === 'growth') { av = a.change_7d === null ? -Infinity : a.change_7d; bv = b.change_7d === null ? -Infinity : b.change_7d; }
      else if (state.sort === 'age') { av = a.age_days === null ? Infinity : a.age_days; bv = b.age_days === null ? Infinity : b.age_days; }
      else if (state.sort === 'odds') { av = econOf(a).odds; bv = econOf(b).odds; }
      else if (state.sort === 'net') { av = econOf(a).net; bv = econOf(b).net; }
      else { av = a.implied_value_usd; bv = b.implied_value_usd; }
      if (av < bv) return -state.dir;
      if (av > bv) return state.dir;
      return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
    });
  }

  function topBar() {
    return h('header', { class: 'top' },
      h('div', { class: 'brand' }, h('span', { class: 'rings', 'aria-hidden': 'true' }), h('span', { class: 'brand-name', text: 'Token Radar' })),
      h('div', { class: 'top-meta' },
        h('span', null, 'Snapshot ', h('b', { text: DATA.as_of })),
        h('span', null, 'DefiLlama protocol index'),
        h('span', null, h('b', { text: DATA.model_version }), ' model'),
        h('span', null, h('b', { text: String(DATA.board_size) }), ' rows')));
  }

  function kpis() {
    var v = DATA.validation, loo = v ? v.loo : null;
    var odds = DATA.rows.map(function (r) { return r.odds_pct; }).sort(function (a, b) { return a - b; });
    var medianOdds = odds.length ? odds[Math.floor(odds.length / 2)] : 0;
    var tiles = [
      ['RANKED', String(DATA.board_size), 'record no token · ' + DATA.watchlist_size + ' of ' + DATA.watchlist_size + ' watchlist'],
      ['IMPLIED VALUE', fmtUsd(DATA.total_implied_usd), 'summed over the board · rank 1 ' + fmtUsd(DATA.rows[0].implied_value_usd)],
      ['OUT-OF-SAMPLE MISS', loo ? fmtMult(loo.miss) : 'n/a', loo ? 'leave-one-out, ' + v.comps + ' traded comps · flat ' + fmtMult(loo.flat.miss) + ' · radar-2 ' + fmtMult(loo.radar2.miss) : ''],
      ['RANGE HOLDS', v ? v.range_hold_pct + '%' : 'n/a', 'of held-out caps inside the printed P25–P75 range'],
      ['MEDIAN LAUNCH ODDS', medianOdds + '%', 'odds a row clears its breakeven, median across the board'],
      ['WORTH FARMING', String(DATA.farm_count), DATA.marginal_count + ' marginal · ' + DATA.skip_count + ' skip · netted at the range low end'],
    ];
    return h('section', { class: 'kpis' }, tiles.map(function (t) {
      return h('div', { class: 'kpi' }, h('div', { class: 'kpi-k', text: t[0] }), h('div', { class: 'kpi-v', text: t[1] }), h('div', { class: 'kpi-s', text: t[2] }));
    }));
  }

  function ledger() {
    var L = DATA.ledger;
    var parts = [
      ['Ranked', L.ranked, 'record no token and stand alone'],
      ['Token trades', L.token_trades, 'a market cap on record'],
      ['Token on record', L.token_on_record, 'a ticker, no market cap'],
      ['Bridge', L.bridge, 'the house rule, applied below the floor'],
      ['Liquid staking', L.liquid_staking, 'a staked form of a token that trades'],
      ['Exchange custody', L.exchange, 'a centralised exchange'],
      ['Versioned listing', L.versioned, 'one release of another protocol'],
      ['Wrapped or staked', L.wrapped, 'by name'],
    ];
    var total = parts.reduce(function (n, p) { return n + p[1]; }, 0);
    return h('section', { class: 'ledger' },
      h('div', { class: 'ledger-head' }, h('b', { text: String(total) + ' protocols read, each accounted for' }), h('span', { text: ' Every protocol in the snapshot sits in exactly one bucket; the rule for each is printed beside it.' })),
      h('div', { class: 'ledger-bar' }, parts.map(function (p) {
        return h('span', { class: 'ledger-seg seg-' + p[0].replace(/[^a-z]/gi, '').toLowerCase(), style: 'width:' + (p[1] / total * 100) + '%', title: p[0] + ' ' + p[1] });
      })),
      h('div', { class: 'ledger-list' }, parts.map(function (p) {
        return h('span', { class: 'ledger-item' }, h('i', { class: 'dot seg-' + p[0].replace(/[^a-z]/gi, '').toLowerCase() }), h('b', { text: String(p[1]) }), ' ' + p[0].toLowerCase() + ' — ' + p[2]);
      })));
  }

  function controls() {
    var cats = Array.from(new Set(DATA.rows.map(function (r) { return r.category || 'Other'; }))).sort();
    var chains = Array.from(new Set(DATA.rows.reduce(function (a, r) { return a.concat(r.chains || []); }, []))).sort();
    function scopeBtn(key, label, n) {
      return h('button', { type: 'button', class: 'pill' + (state.scope === key ? ' on' : ''), text: label + ' ' + n, onclick: function () { state.scope = key; writeHash(); render(); } });
    }
    function verdictBtn(key, label) {
      return h('button', { type: 'button', class: 'pill' + (state.verdict === key ? ' on' : ''), text: label, onclick: function () { state.verdict = key; writeHash(); render(); } });
    }
    function ticketBtn(v) {
      return h('button', { type: 'button', class: 'pill' + (state.ticket === v ? ' on' : ''), text: '$' + v.toLocaleString('en-US'), onclick: function () { state.ticket = v; render(); } });
    }
    function dropBtn(v) {
      return h('button', { type: 'button', class: 'pill' + (state.drop === v ? ' on' : ''), text: (Math.round(v * 1000) / 10) + '%', onclick: function () { state.drop = v; render(); } });
    }
    var search = h('input', { type: 'search', placeholder: 'Search name, category or chain', value: state.q, 'aria-label': 'Search protocols' });
    search.addEventListener('input', function () { state.q = search.value; writeHash(); render(); });
    var cat = h('select', { 'aria-label': 'Category' }, [h('option', { value: 'all', text: 'All categories' })].concat(cats.map(function (c) { return h('option', { value: c, text: c, selected: c === state.category ? 'selected' : null }); })));
    cat.addEventListener('change', function () { state.category = cat.value; writeHash(); render(); });
    var ch = h('select', { 'aria-label': 'Chain' }, [h('option', { value: 'all', text: 'All chains' })].concat(chains.map(function (c) { return h('option', { value: c, text: c, selected: c === state.chain ? 'selected' : null }); })));
    ch.addEventListener('change', function () { state.chain = ch.value; writeHash(); render(); });
    var sort = h('select', { 'aria-label': 'Sort' }, [['implied', 'Sort: implied value'], ['tvl', 'Sort: TVL'], ['growth', 'Sort: 7d growth'], ['age', 'Sort: age'], ['odds', 'Sort: launch odds'], ['net', 'Sort: net of fees'], ['name', 'Sort: name']].map(function (o) { return h('option', { value: o[0], text: o[1], selected: o[0] === state.sort ? 'selected' : null }); }));
    sort.addEventListener('change', function () { state.sort = sort.value; state.dir = state.sort === 'name' ? 1 : -1; render(); });
    var wl = DATA.rows.filter(function (r) { return r.watchlist; }).length;
    var off = DATA.rows.filter(function (r) { return !r.watchlist && r.tvl_usd >= DATA.floor_usd; }).length;
    var below = DATA.rows.filter(function (r) { return r.tvl_usd < DATA.floor_usd; }).length;
    return h('section', { class: 'controls' },
      h('div', { class: 'row' },
        scopeBtn('all', 'All', DATA.rows.length), scopeBtn('watchlist', 'Watchlist', wl),
        scopeBtn('offlist', 'Off list', off), scopeBtn('below', 'Below floor', below),
        h('span', { class: 'sep' }),
        verdictBtn('any', 'Any verdict'), verdictBtn('FARM', 'Farm ' + DATA.farm_count),
        verdictBtn('MARGINAL', 'Marginal ' + DATA.marginal_count), verdictBtn('SKIP', 'Skip ' + DATA.skip_count)),
      h('div', { class: 'row' }, search, cat, ch, sort,
        h('span', { class: 'sep' }),
        h('span', { class: 'lbl', text: 'Ticket' }), ticketBtn(1000), ticketBtn(10000),
        h('span', { class: 'lbl', text: 'Drop share' }), dropBtn(0.035), dropBtn(0.07), dropBtn(0.14)),
      h('div', { class: 'row tabs' },
        h('button', { type: 'button', class: 'pill' + (state.tab === 'pre-token' ? ' on' : ''), text: 'No token yet ' + DATA.rows.length, onclick: function () { state.tab = 'pre-token'; render(); } }),
        h('button', { type: 'button', class: 'pill' + (state.tab === 'live' ? ' on' : ''), text: 'Token trades ' + DATA.live.length, onclick: function () { state.tab = 'live'; render(); } }),
        h('span', { class: 'count', text: state.tab === 'pre-token' ? visibleRows().length + ' of ' + DATA.rows.length + ' shown' : DATA.live.length + ' live-token protocols' })));
  }

  function sortHead(key, label) {
    return h('th', null, h('button', { type: 'button', onclick: function () { if (state.sort === key) state.dir = -state.dir; else { state.sort = key; state.dir = key === 'name' ? 1 : -1; } render(); } },
      label + (state.sort === key ? (state.dir === -1 ? ' ▼' : ' ▲') : '')));
  }
  function verdictPill(v) { return h('span', { class: 'verdict v-' + v.toLowerCase(), text: v }); }

  function boardTable() {
    var list = sortRows(visibleRows());
    var shownImplied = list.reduce(function (n, r) { return n + r.implied_value_usd; }, 0);
    var body = h('tbody');
    list.forEach(function (r) {
      var e = econOf(r);
      var tags = [];
      if (r.watchlist) tags.push(h('span', { class: 'tag watch', text: 'WATCHLIST' }));
      if (r.kin) tags.push(h('span', { class: 'tag kin', text: 'SHARED' }));
      if (r.researched) tags.push(h('span', { class: 'tag res', text: 'RESEARCHED' }));
      var tr = h('tr', { tabindex: '0', onclick: function () { openDetail(r.slug); }, onkeydown: function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openDetail(r.slug); } } },
        h('td', { class: 'num', text: String(r.rank) }),
        h('td', null, h('div', { class: 'pname', text: r.name }), h('div', { class: 'psub', text: (r.category || 'Other') + ' · ' + (r.chains || []).slice(0, 2).join(', ') + ((r.chains || []).length > 2 ? ' +' + ((r.chains || []).length - 2) : '') }), h('div', { class: 'tags' }, tags)),
        h('td', { class: 'num', text: fmtUsd(r.tvl_usd) }),
        h('td', { class: 'num ' + (r.change_7d === null ? '' : r.change_7d >= 0 ? 'up' : 'down'), text: fmtPct(r.change_7d) }),
        h('td', { class: 'num', text: fmtAge(r.age_days) }),
        h('td', { class: 'num', text: e.odds + '%' }),
        h('td', { class: 'num' }, h('div', { text: fmtUsd(r.implied_value_usd) }), h('div', { class: 'range', text: fmtUsd(r.implied_low_usd) + ' – ' + fmtUsd(r.implied_high_usd) })),
        h('td', { class: 'num ' + (e.net >= 0 ? 'up' : 'down'), text: fmtUsd2(e.net) }),
        h('td', null, verdictPill(e.verdict)));
      body.appendChild(tr);
    });
    return h('section', { class: 'board' },
      h('p', { class: 'board-note', text: list.length + ' of ' + DATA.rows.length + ' protocols · ' + fmtUsd(shownImplied) + ' implied in view · sorted by ' + state.sort + ' · slice at ' + fmtDrop() + ' of value on a $' + state.ticket.toLocaleString('en-US') + ' ticket, less fees' }),
      h('table', null,
        h('thead', null, h('tr', null, sortHead('rank', 'Rank'), sortHead('name', 'Protocol'), sortHead('tvl', 'TVL'), sortHead('growth', '7d'), sortHead('age', 'Tracked'), sortHead('odds', 'Launch odds'), sortHead('implied', 'Implied value · range'), sortHead('net', 'Net of fees'), h('th', { text: 'Verdict' }))),
        body));
  }

  function liveTable() {
    var body = h('tbody');
    DATA.live.forEach(function (r) {
      body.appendChild(h('tr', null,
        h('td', { text: r.name }),
        h('td', { text: r.category || 'Other' }),
        h('td', { class: 'num', text: fmtUsd(r.tvl_usd) }),
        h('td', { class: 'num', text: fmtUsd(r.mcap_usd) }),
        h('td', { class: 'num', text: fmtPct(r.change_7d) })));
    });
    return h('section', { class: 'board' },
      h('p', { class: 'board-note', text: 'These already trade, so the board shows the market\u2019s own value, never a model\u2019s. They are the comps the curve is fitted on.' }),
      h('table', null, h('thead', null, h('tr', null, h('th', { text: 'Protocol' }), h('th', { text: 'Category' }), h('th', { text: 'TVL' }), h('th', { text: 'Market cap' }), h('th', { text: '7d' }))), body));
  }

  function scatter() {
    var W = 560, H = 220, P = 34;
    var pts = DATA.comps || [];
    var xs = pts.map(function (p) { return Math.log10(p.tvl_usd); }).concat(DATA.rows.map(function (r) { return Math.log10(r.tvl_usd); }));
    var ys = pts.map(function (p) { return Math.log10(p.mcap_usd); }).concat(DATA.rows.map(function (r) { return Math.log10(r.implied_value_usd); }));
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    function X(v) { return P + (v - x0) / (x1 - x0) * (W - 2 * P); }
    function Y(v) { return H - P - (v - y0) / (y1 - y0) * (H - 2 * P); }
    var f = DATA.fit;
    var line = 'M' + X(x0).toFixed(1) + ' ' + Y(f.a + f.b * x0).toFixed(1) + ' L' + X(x1).toFixed(1) + ' ' + Y(f.a + f.b * x1).toFixed(1);
    var dots = pts.map(function (p) { return '<circle cx="' + X(Math.log10(p.tvl_usd)).toFixed(1) + '" cy="' + Y(Math.log10(p.mcap_usd)).toFixed(1) + '" r="2.2" fill="#8ba393"/>'; }).join('');
    var board = DATA.rows.map(function (r) { return '<circle cx="' + X(Math.log10(r.tvl_usd)).toFixed(1) + '" cy="' + Y(Math.log10(r.implied_value_usd)).toFixed(1) + '" r="2" fill="#4ade80"/>'; }).join('');
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Market cap on TVL, log scale">' +
      '<path d="' + line + '" stroke="#fbbf24" stroke-width="1.5" fill="none"/>' + dots + board +
      '<text x="' + P + '" y="14" fill="#8ba393" font-size="11">Market cap on TVL, log scale. Grey: ' + pts.length + ' tokens that trade. Green: the board. Line: the size curve.</text></svg>';
    var div = h('div', { class: 'scatter' });
    div.innerHTML = svg;
    return div;
  }

  function modelPanel() {
    var v = DATA.validation;
    if (!v) return h('section', { class: 'model' }, h('h2', { text: 'How a row is priced' }), h('p', { text: 'Too few comps to validate.' }));
    var f = DATA.fit, m = DATA.model;
    function row3(name, s) {
      return h('tr', null, h('td', { text: name }), h('td', { class: 'num', text: fmtMult(s.flat.miss) + ' · ' + s.flat.within_3x_pct + '%' }), h('td', { class: 'num', text: fmtMult(s.radar2.miss) + ' · ' + s.radar2.within_3x_pct + '%' }), h('td', { class: 'num', text: fmtMult(s.radar3.miss) + ' · ' + s.radar3.within_3x_pct + '%' }));
    }
    return h('section', { class: 'model' },
      h('h2', { text: 'How a row is priced' }),
      h('p', { class: 'formula', text: 'implied = 10^' + f.a.toFixed(2) + ' × TVL^' + f.b.toFixed(3) + ' × growth × maturity × sector × kinship' }),
      h('p', { text: 'The curve is fitted on the snapshot\u2019s own ' + v.comps + ' traded-token comps (live-token, non-CEX, market cap and TVL both positive): log10(market cap) = ' + f.a.toFixed(2) + ' + ' + f.b.toFixed(3) + ' × log10(TVL). Growth moves value at most ±' + Math.round(m.growth_weight * 100) + '%, maturity 0.9×–1.1× by age with no token, sector is each category\u2019s mean log-residual shrunk toward 1 (k=' + m.sector_shrink_k + ', clamped 0.4×–2.5×), kinship is 0.5× where a name stem is shared with a traded token or another row. No name is ever special-cased.' }),
      h('h3', { text: 'Does it hold on tokens it never saw?' }),
      h('table', { class: 'mini' },
        h('thead', null, h('tr', null, h('th', { text: 'Held-out test' }), h('th', { text: 'Flat multiple' }), h('th', { text: 'radar-2' }), h('th', { text: 'radar-3' }))),
        h('tbody', null,
          row3('Leave-one-out (n=' + v.comps + ')', { flat: v.loo.flat, radar2: v.loo.radar2, radar3: v.loo }),
          v.folds.map(function (fd) { return row3(fd.name + ' (n=' + fd.test_n + ')', fd); }),
          row3('Older → newer (' + v.time.train_n + ' → ' + v.time.test_n + ')', v.time))),
      h('p', { text: 'Miss is the median |log10(pred/actual)| as an × factor; the second number is the share within 3×. radar-3 beats the flat multiple and radar-2 on every split. The printed range is the P25–P75 band of the leave-one-out residuals, by age: young (<18 months) ' + fmtMult(v.range_young[0]) + '–' + fmtMult(v.range_young[1]) + ', older ' + fmtMult(v.range_old[0]) + '–' + fmtMult(v.range_old[1]) + ', age unknown ' + fmtMult(v.range_unknown[0]) + '–' + fmtMult(v.range_unknown[1]) + '. ' + v.range_hold_pct + '% of held-out caps land inside their row\u2019s range.' }),
      scatter(),
      h('p', { class: 'fine', text: 'Gas per action is a stated assumption by chain (Ethereum $3.50, Solana $0.05, most L2s $0.30, default $1), not snapshot data; each plan needs ' + DATA.econ.txs_default + ' on-chain actions unless its researched plan says otherwise. The airdrop slice assumes the launch is worth the implied value and pays ' + fmtDrop() + ' to depositors pro-rata by ticket over TVL. This is an estimate, not a price — the board never predicts whether or when a token is issued.' }));
  }

  function openDetail(slug) {
    var row = DATA.rows.filter(function (r) { return r.slug === slug; })[0];
    if (!row) return;
    state.selected = slug; writeHash();
    var dlg = document.getElementById('detail');
    var e = econOf(row);
    var recomputed = impliedOf(row);
    var agrees = recomputed === row.implied_value_usd;
    var plan = PLANS[row.slug];
    dlg.innerHTML = '';
    dlg.appendChild(h('div', { class: 'detail-head' },
      h('div', null, h('span', { class: 'brand-name', text: 'Rank ' + row.rank + ' of ' + DATA.board_size }), h('h2', { text: row.name }), h('div', { class: 'psub', text: (row.category || 'Other') + ' · ' + (row.chains || []).join(', ') })),
      h('button', { type: 'button', class: 'x', text: 'Close', onclick: function () { dlg.close(); state.selected = null; writeHash(); } })));
    dlg.appendChild(h('p', { class: 'blurb', text: row.blurb }));
    if (row.note) dlg.appendChild(h('p', { class: 'warn', text: 'Warn: ' + row.note }));
    if (row.kin) dlg.appendChild(h('p', { class: 'warn', text: 'Shared launch: this row shares its name stem with ' + (row.shared_with || 'another protocol') + ' (' + (row.kin_kind === 'traded' ? 'a token that already trades' : 'another pre-token row') + '), so its value is halved — one launch, split two ways.' }));
    dlg.appendChild(h('div', { class: 'detail-econ' },
      h('div', null, h('div', { class: 'kpi-k', text: 'IMPLIED VALUE' }), h('div', { class: 'kpi-v', text: fmtUsd(row.implied_value_usd) }), h('div', { class: 'kpi-s', text: fmtUsd(row.implied_low_usd) + ' – ' + fmtUsd(row.implied_high_usd) + ' range' })),
      h('div', null, h('div', { class: 'kpi-k', text: 'LAUNCH ODDS' }), h('div', { class: 'kpi-v', text: e.odds + '%' }), h('div', { class: 'kpi-s', text: 'share of held-out comps clearing breakeven' })),
      h('div', null, h('div', { class: 'kpi-k', text: 'NET OF FEES' }), h('div', { class: 'kpi-v', text: fmtUsd2(e.net) }), h('div', { class: 'kpi-s', text: 'slice ' + fmtUsd2(e.slice) + ' − fees ' + fmtUsd2(e.fees) })),
      h('div', null, h('div', { class: 'kpi-k', text: 'VERDICT' }), h('div', { class: 'kpi-v', text: e.verdict }), h('div', { class: 'kpi-s', text: 'at the range low end: ' + fmtUsd2(e.netLow) }))));
    dlg.appendChild(h('div', { class: 'detail-section' },
      h('h3', { text: 'How this row is priced' }),
      h('p', { class: 'check', text: 'Model ' + DATA.model_version + ': the page recomputes this row as ' + fmtUsd(recomputed) + (agrees ? ', the same number board.json carries.' : ', which differs from the board: the data would be stale.') + ' This is an estimate, not a price.' }),
      h('p', { text: 'Base 10^' + DATA.fit.a.toFixed(2) + ' × TVL^' + DATA.fit.b.toFixed(3) + ' = ' + fmtUsd(Math.pow(10, DATA.fit.a + DATA.fit.b * Math.log10(row.tvl_usd))) + '; × growth ' + row.growth_multiplier.toFixed(2) + ' (7d ' + fmtPct(row.change_7d) + '); × maturity ' + row.maturity_multiplier.toFixed(2) + ' (' + fmtAge(row.age_days) + ' with no token); × sector ' + row.sector_multiplier.toFixed(2) + ' (' + (row.category || 'Other') + '); × kinship ' + (row.kin ? '0.50' : '1.00') + '.' })));
    // The detail drawer prefers the compact researched plan (FARM_PLANS, top rows
    // only) over the row's own steps when one exists, so plans.js is live, not dead.
    var steps = (plan && plan.s) ? plan.s.map(function (st) {
      return st[0] + ((st[1] || st[2]) ? ' Cost: ' + (st[1] || 'n/a') + ' · Time: ' + (st[2] || 'n/a') : '');
    }) : (row.farm_steps || []);
    dlg.appendChild(h('div', { class: 'detail-section' },
      h('h3', { text: 'Farm plan' + (row.researched ? ' — researched' : ' — from the protocol\u2019s own record') }),
      h('ol', { class: 'steps' }, steps.map(function (s) { return h('li', { text: s }); }))));
    dlg.appendChild(h('p', { class: 'fine', text: 'Ticket $' + state.ticket.toLocaleString('en-US') + ' · drop share ' + fmtDrop() + ' · fees ' + fmtUsd2(e.fees) + ' at ' + DATA.econ.txs_default + ' actions × gas on ' + (row.chains[0] || 'its main chain') + '. Change the ticket or drop share above and this verdict re-prices.' }));
    if (!dlg.open) dlg.showModal();
  }

  function render() {
    app.setAttribute('aria-busy', 'false');
    app.innerHTML = '';
    app.appendChild(topBar());
    app.appendChild(h('section', { class: 'lede' },
      h('h1', { text: 'Every protocol with no token, ranked by what a launch would be worth' }),
      h('p', { text: 'The watchlist is the floor: every protocol with at least $50M of TVL and no token on record. The radar adds every other standalone pre-token protocol below the floor, and prices each one off the market\u2019s own curve — then costs the farm, nets it, and says farm, marginal or skip. Implied value is a model, never a promise — and never a price.' })));
    app.appendChild(kpis());
    app.appendChild(ledger());
    app.appendChild(controls());
    app.appendChild(state.tab === 'pre-token' ? boardTable() : liveTable());
    app.appendChild(modelPanel());
    app.appendChild(h('footer', { class: 'foot' }, h('p', { text: 'Snapshot ' + DATA.as_of + ' · DefiLlama protocol index · ' + DATA.source + ' · No network: this page reads only its own data.js. A board row is an estimate from the snapshot\u2019s own figures, not investment advice.' })));
    if (state.selected) {
      var row = DATA.rows.filter(function (r) { return r.slug === state.selected; })[0];
      if (row) openDetail(row.slug);
    }
  }

  readHash();
  var dlg = document.createElement('dialog');
  dlg.id = 'detail';
  document.body.appendChild(dlg);
  dlg.addEventListener('close', function () { if (state.selected) { state.selected = null; writeHash(); } });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.selected) { state.selected = null; writeHash(); } });
  render();
})();
