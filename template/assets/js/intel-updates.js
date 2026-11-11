/*!
 * intel-updates.js  -  generic "what changed since the last intel refresh" layer.
 * Version 20261111. Drop-in for any competitor-intel-template repo; copy UNCHANGED together with
 * assets/css/intel-updates.css. No dependencies, no build step, light theme only.
 *
 * DATA CONTRACT (written by the refresh, read here):
 *   record.added       "YYYY-MM-DD"                -> badge NEW
 *   record.updates[]   {date,field,was,now,source,note} -> badge UPDATED + was/now
 *   record.retired_on  "YYYY-MM-DD" (+retired_reason)   -> badge RETIRED + strikethrough
 *   meta.refresh_log[] {date,window,added,updated,retired,summary} -> "What's new" panel
 *   record.event_date, record.sources[{url,title,accessed}], record.confidence -> detail block
 *
 * PAGE HOOKS (see INTEGRATION.md):
 *   1. In the renderer:   IntelUpdates.tag(h('div', {...}), record)   // returns the same element
 *   2. Anywhere on page:  <div data-intel-panel></div>               // the "What's new" panel + toggle
 *   3. Include:           <link rel="stylesheet" href="../assets/css/intel-updates.css?v=20261111">
 *                         <script src="../assets/js/intel-updates.js?v=20261111"></script>
 *   Optional attributes on the script tag:
 *      data-intel-data="../data/"                       folder holding the JSON files (default ../data/)
 *      data-intel-files="competitors,market-intelligence,pricing-strategy,whitespace-framework"
 *
 * Counts for verification:  IntelUpdates.stats()  ->  {data:{added,updated,retired}, badges:{...}, panelOnly:{...}}
 */
(function () {
  'use strict';
  if (window.IntelUpdates) return;

  var VERSION = '20261111';
  var SCRIPT = document.currentScript;
  var DATA_DIR = (SCRIPT && SCRIPT.getAttribute('data-intel-data')) || '../data/';
  var FILES = ((SCRIPT && SCRIPT.getAttribute('data-intel-files')) ||
    'competitors,market-intelligence,pricing-strategy,whitespace-framework')
    .split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  if (DATA_DIR.charAt(DATA_DIR.length - 1) !== '/') DATA_DIR += '/';

  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var SKIP_KEYS = { meta: 1, updates: 1, sources: 1, refresh_log: 1 };

  // ---------- helpers ----------
  function fmtDate(s) {
    if (typeof s !== 'string') return s == null ? '' : String(s);
    var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(s);
    if (!m) return s;
    var mon = MON[parseInt(m[2], 10) - 1];
    if (!mon) return s;
    return (m[3] ? parseInt(m[3], 10) + ' ' : '') + mon + ' ' + m[1];
  }
  function append(n, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(n, x); }); return; }
    n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  function el(tag, attrs) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    for (var i = 2; i < arguments.length; i++) append(n, arguments[i]);
    return n;
  }
  function labelOf(r) {
    return String(r.title || r.name || r.indicator || r.item || r.claim || r.niche_name || r.id || '(untitled)');
  }
  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  function idOf(r) {
    var l = labelOf(r);
    return 'iu-' + l.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36) + '-' + hash(l);
  }
  function markers(r) {
    var upd = Array.isArray(r.updates) && r.updates.length ? r.updates : null;
    return {
      added: r.added || null,
      updates: upd,
      updatedOn: upd ? upd.reduce(function (a, u) { return u.date > a ? u.date : a; }, '') : null,
      retired: r.retired_on || null,
      stamped: !!(r.added || upd || r.retired_on)
    };
  }
  function safeUrl(u) { return /^https?:\/\//i.test(String(u || '')) ? String(u) : null; }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }

  function badge(kind, date) {
    var word = kind === 'new' ? 'NEW' : kind === 'updated' ? 'UPDATED' : 'RETIRED';
    return el('span', { class: 'iu-badge iu-badge--' + kind, 'data-intel-kind': kind, title: word + ' ' + fmtDate(date) },
      word + ' · ' + fmtDate(date));
  }

  // ---------- value rendering (compact was -> now) ----------
  function clamp(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }
  function valNodes(a, b, side) {
    var self = side === 'was' ? a : b, other = side === 'was' ? b : a;
    if (Array.isArray(a) && Array.isArray(b)) {
      var oset = other.map(function (x) { return JSON.stringify(x); });
      var items = self.filter(function (x) { return oset.indexOf(JSON.stringify(x)) < 0; });
      if (!items.length) return [document.createTextNode(side === 'was' ? '(no items removed)' : '(no items added)')];
      return items.map(function (x) {
        return el('div', { class: 'iu-li' }, (side === 'now' ? '+ ' : '− ') + (typeof x === 'string' ? x : JSON.stringify(x)));
      });
    }
    if (self === null || self === undefined) return [document.createTextNode('(empty)')];
    if (typeof self !== 'string') return [document.createTextNode(JSON.stringify(self))];
    if (typeof other === 'string' && (a.length + b.length) > 240) {
      var i = 0; while (i < a.length && i < b.length && a.charAt(i) === b.charAt(i)) i++;
      var j = 0; while (j < a.length - i && j < b.length - i && a.charAt(a.length - 1 - j) === b.charAt(b.length - 1 - j)) j++;
      var core = self.slice(i, self.length - j), ctx = 36;
      var pre = self.slice(Math.max(0, i - ctx), i), post = self.slice(self.length - j, self.length - j + ctx);
      return [
        document.createTextNode((i > ctx ? '…' : '') + pre),
        el('span', { class: 'iu-chg' }, core ? clamp(core, 420) : '(nothing here)'),
        document.createTextNode(post + (j > ctx ? '…' : ''))
      ];
    }
    return [document.createTextNode(clamp(self, 420))];
  }
  function sourceLink(url, text) {
    var u = safeUrl(url);
    return u ? el('a', { href: u, target: '_blank', rel: 'noopener noreferrer', class: 'iu-src' }, text || host(u)) : null;
  }

  function buildChanges(m) {
    if (!m.updates) return null;
    return el('div', { class: 'iu-changes' }, m.updates.map(function (u) {
      return el('div', { class: 'iu-change' },
        el('div', { class: 'iu-change-head' }, el('span', { class: 'iu-field' }, String(u.field || 'field')),
          el('span', { class: 'iu-when' }, fmtDate(u.date)), sourceLink(u.source)),
        u.note ? el('div', { class: 'iu-note' }, String(u.note)) : null,
        el('div', { class: 'iu-wasnow' },
          el('div', { class: 'iu-was' }, el('span', { class: 'iu-lbl' }, 'was'), el('span', { class: 'iu-val' }, valNodes(u.was, u.now, 'was'))),
          el('div', { class: 'iu-now' }, el('span', { class: 'iu-lbl' }, 'now'), el('span', { class: 'iu-val' }, valNodes(u.was, u.now, 'now')))));
    }));
  }
  function buildMeta(r, m) {
    var bits = [];
    if (m.added) bits.push('Added ' + fmtDate(m.added));
    if (r.event_date) bits.push('event ' + fmtDate(r.event_date));
    if (r.confidence != null) bits.push('confidence ' + (typeof r.confidence === 'number' ? Math.round(r.confidence * 100) + '%' : r.confidence));
    var srcs = (Array.isArray(r.sources) ? r.sources : []).map(function (s) {
      return sourceLink(s.url, s.title ? clamp(String(s.title), 90) : null);
    }).filter(Boolean);
    return el('div', { class: 'iu-meta' },
      bits.length ? el('div', { class: 'iu-meta-line' }, bits.join(' · ')) : null,
      m.retired ? el('div', { class: 'iu-reason' }, 'Retired ' + fmtDate(m.retired) + (r.retired_reason ? ': ' + r.retired_reason : '')) : null,
      srcs.length ? el('ul', { class: 'iu-srcs' }, srcs.map(function (a) { return el('li', null, a); })) : null);
  }
  function buildDetail(r, m, summaryText) {
    var n = (m.updates ? m.updates.length : 0);
    return el('details', { class: 'iu-detail' },
      el('summary', null, summaryText || (m.updates ? 'What changed (' + n + ')' : 'Sources and details')),
      buildChanges(m), buildMeta(r, m));
  }

  // ---------- registry of tagged page elements ----------
  var registry = [];       // {el,id}
  var syncTimer = null;

  function tag(node, rec) {
    try {
      if (!node || !rec || typeof rec !== 'object' || !node.setAttribute) return node;
      var m = markers(rec);
      if (!m.stamped || node.hasAttribute('data-intel-stamped')) return node;
      var id = idOf(rec), kinds = [];
      node.classList.add('iu-tagged');
      node.setAttribute('data-intel-stamped', '1');
      node.setAttribute('data-intel-record', id);
      if (!node.id) node.id = id;
      var strip = el('div', { class: 'iu-strip' });
      if (m.added) { node.setAttribute('data-intel-added', m.added); strip.appendChild(badge('new', m.added)); kinds.push('new'); }
      if (m.updates) { node.setAttribute('data-intel-updated', m.updatedOn); strip.appendChild(badge('updated', m.updatedOn)); kinds.push('updated'); }
      if (m.retired) { node.setAttribute('data-intel-retired', m.retired); strip.appendChild(badge('retired', m.retired)); node.classList.add('iu-retired'); kinds.push('retired'); }
      node.setAttribute('data-intel-kinds', kinds.join(' '));
      var extra = el('div', { class: 'iu-extra' }, buildDetail(rec, m));
      node.insertBefore(strip, node.firstChild);
      node.appendChild(extra);
      registry.push({ el: node, id: id });
      scheduleSync();
    } catch (e) { if (window.console) console.warn('IntelUpdates.tag skipped a record', e); }
    return node;
  }

  // ---------- data + panel ----------
  var model = { files: {}, logs: [], items: [], loaded: false };
  var panels = [];
  var filterOn = false;

  function walk(file, o, path, out) {
    if (Array.isArray(o)) { o.forEach(function (v) { walk(file, v, path, out); }); return; }
    if (!o || typeof o !== 'object') return;
    var m = markers(o);
    if (m.stamped) { out.push({ file: file, section: path, rec: o, m: m, id: idOf(o) }); return; }
    for (var k in o) {
      if (SKIP_KEYS[k]) continue;
      walk(file, o[k], path || k, out);
    }
  }

  function load() {
    return Promise.all(FILES.map(function (f) {
      return fetch(DATA_DIR + f + '.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; })
        .then(function (j) { return { f: f, j: j }; });
    })).then(function (res) {
      res.forEach(function (x) {
        if (!x.j) return;
        model.files[x.f] = x.j;
        var meta = x.j.meta || {};
        (meta.refresh_log || []).forEach(function (l) { model.logs.push({ file: x.f, entry: l }); });
        walk(x.f, x.j, '', model.items);
      });
      model.loaded = true;
    });
  }

  function prettySection(s) {
    return String(s || '').replace(/_/g, ' ').replace(/^\w/, function (c) { return c.toUpperCase(); });
  }
  function prettyFile(f) {
    return f.replace(/-/g, ' ').replace(/^\w/, function (c) { return c.toUpperCase(); });
  }
  function counts() {
    var c = { added: 0, updated: 0, retired: 0 };
    model.items.forEach(function (it) {
      if (it.m.added) c.added++;
      if (it.m.updates) c.updated++;
      if (it.m.retired) c.retired++;
    });
    return c;
  }
  function since() {
    var best = null;
    model.logs.forEach(function (l) { if (!best || l.entry.date > best.date) best = l.entry; });
    if (!best) return '';
    var w = String(best.window || '').split(/→|->/)[0].trim();
    return fmtDate(w || best.date);
  }
  function groups() {
    var g = {};
    model.logs.forEach(function (l) {
      var d = l.entry.date;
      g[d] = g[d] || { date: d, window: l.entry.window, parts: [], added: 0, updated: 0, retired: 0 };
      g[d].parts.push(l);
      g[d].added += l.entry.added || 0; g[d].updated += l.entry.updated || 0; g[d].retired += l.entry.retired || 0;
    });
    return Object.keys(g).sort().reverse().map(function (k) { return g[k]; });
  }
  function itemDates(it) {
    var d = [];
    if (it.m.added) d.push(it.m.added);
    if (it.m.updates) it.m.updates.forEach(function (u) { d.push(u.date); });
    if (it.m.retired) d.push(it.m.retired);
    return d;
  }

  function itemRow(it) {
    var kinds = [];
    if (it.m.added) kinds.push('new'); if (it.m.updates) kinds.push('updated'); if (it.m.retired) kinds.push('retired');
    var jump = el('a', { class: 'iu-jump', href: '#' + it.id, hidden: '' }, 'Jump to it on this page');
    var row = el('li', { class: 'iu-item' + (it.m.retired ? ' iu-item--retired' : ''), 'data-intel-item': it.id, 'data-intel-kinds': kinds.join(' ') },
      el('div', { class: 'iu-item-head' },
        el('span', { class: 'iu-badges' }, kinds.map(function (k) { return badge(k, k === 'new' ? it.m.added : k === 'updated' ? it.m.updatedOn : it.m.retired); })),
        el('span', { class: 'iu-item-title' }, labelOf(it.rec)),
        el('span', { class: 'iu-where' }, prettyFile(it.file) + ' › ' + prettySection(it.section))),
      jump,
      buildDetail(it.rec, it.m, 'Details and sources'));
    it.row = row; it.jump = jump;
    return row;
  }

  function buildPanel(target) {
    var gs = groups(), c = counts(), sinceTxt = since();
    var box = el('section', { class: 'iu-panel', 'aria-label': 'What is new in this intelligence pack', 'data-intel-ready': '1' });
    var head = el('div', { class: 'iu-panel-head' },
      el('h2', { class: 'iu-title' }, "What's new"),
      el('span', { class: 'iu-counts' },
        el('span', { class: 'iu-count iu-count--new', 'data-count': 'new' }, c.added + ' new'),
        el('span', { class: 'iu-count iu-count--updated', 'data-count': 'updated' }, c.updated + ' updated'),
        el('span', { class: 'iu-count iu-count--retired', 'data-count': 'retired' }, c.retired + ' retired')));
    box.appendChild(head);

    if (!gs.length && !model.items.length) {
      box.appendChild(el('p', { class: 'iu-empty' }, 'No refresh has been recorded for this pack yet.'));
    }
    if (sinceTxt && model.items.length) {
      var cb = el('input', { type: 'checkbox', class: 'iu-toggle-input', id: 'iu-toggle-' + panels.length });
      cb.checked = filterOn;
      cb.addEventListener('change', function () { setFilter(cb.checked); });
      box.appendChild(el('label', { class: 'iu-toggle', for: cb.id }, cb, el('span', null, 'Show only changes since ' + sinceTxt)));
    }
    gs.forEach(function (g, gi) {
      var items = model.items.filter(function (it) { return itemDates(it).indexOf(g.date) >= 0; });
      var win = String(g.window || '').split(/→|->/).map(function (s) { return fmtDate(s.trim()); }).join(' → ');
      var sec = el('div', { class: 'iu-log', 'data-intel-log': g.date },
        el('h3', { class: 'iu-log-head' }, 'Refresh ' + fmtDate(g.date),
          win ? el('span', { class: 'iu-window' }, 'window ' + win) : null),
        el('div', { class: 'iu-log-counts' }, g.added + ' new · ' + g.updated + ' updated · ' + g.retired + ' retired'),
        el('ul', { class: 'iu-summaries' }, g.parts.map(function (p) {
          return el('li', null, el('strong', null, prettyFile(p.file) + ': '), String(p.entry.summary || ''),
            el('span', { class: 'iu-pc' }, ' (' + (p.entry.added || 0) + ' new, ' + (p.entry.updated || 0) + ' updated, ' + (p.entry.retired || 0) + ' retired)'));
        })));
      if (items.length) {
        items.sort(function (a, b) {
          var ka = a.m.added ? 0 : a.m.updates ? 1 : 2, kb = b.m.added ? 0 : b.m.updates ? 1 : 2;
          return ka - kb;
        });
        sec.appendChild(el('details', { class: 'iu-items-wrap', open: gi === 0 ? '' : null },
          el('summary', null, 'All ' + items.length + ' changed items'),
          el('ul', { class: 'iu-items' }, items.map(itemRow))));
      }
      box.appendChild(sec);
    });
    target.textContent = '';
    target.appendChild(box);
    panels.push(target);
  }

  // ---------- sync (links, filter classes) ----------
  function scheduleSync() {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(sync, 60);
  }
  function liveIds() {
    registry = registry.filter(function (r) { return r.el.isConnected; });
    var o = {};
    registry.forEach(function (r) { o[r.id] = r.el; });
    return o;
  }
  function sync() {
    syncTimer = null;
    var live = liveIds();
    model.items.forEach(function (it) {
      if (!it.jump) return;
      var on = !!live[it.id];
      if (on) it.jump.removeAttribute('hidden'); else it.jump.setAttribute('hidden', '');
      it.row.setAttribute('data-intel-onpage', on ? '1' : '0');
    });
    applyFilter();
  }
  function setFilter(on) {
    filterOn = !!on;
    document.querySelectorAll('.iu-toggle-input').forEach(function (i) { i.checked = filterOn; });
    applyFilter();
  }
  function applyFilter() {
    var b = document.body;
    document.querySelectorAll('.iu-dim').forEach(function (n) { n.classList.remove('iu-dim'); });
    document.querySelectorAll('.iu-section-hidden').forEach(function (n) { n.classList.remove('iu-section-hidden'); });
    if (!filterOn) { b.classList.remove('iu-only-changes'); return; }
    b.classList.add('iu-only-changes');
    var tagged = Array.prototype.slice.call(document.querySelectorAll('.iu-tagged'));
    var parents = [];
    tagged.forEach(function (t) { if (parents.indexOf(t.parentNode) < 0) parents.push(t.parentNode); });
    parents.forEach(function (p) {
      var names = {};
      Array.prototype.forEach.call(p.children, function (c) { if (c.classList.contains('iu-tagged')) names[c.tagName] = 1; });
      Array.prototype.forEach.call(p.children, function (c) {
        if (!c.classList.contains('iu-tagged') && names[c.tagName] && !c.querySelector('.iu-tagged') && !c.hasAttribute('data-intel-panel')) c.classList.add('iu-dim');
      });
    });
    document.querySelectorAll('section').forEach(function (s) {
      if (s.querySelector('.iu-panel,[data-intel-panel]') || s.classList.contains('iu-panel')) return;
      if (s.closest('.iu-panel')) return;
      if (!s.querySelector('.iu-tagged')) s.classList.add('iu-section-hidden');
    });
  }

  function stats() {
    var live = liveIds();
    var d = counts();
    var badges = { new: 0, updated: 0, retired: 0 };
    registry.forEach(function (r) {
      var k = (r.el.getAttribute('data-intel-kinds') || '').split(' ');
      if (k.indexOf('new') >= 0) badges.new++;
      if (k.indexOf('updated') >= 0) badges.updated++;
      if (k.indexOf('retired') >= 0) badges.retired++;
    });
    var po = { new: 0, updated: 0, retired: 0 };
    model.items.forEach(function (it) {
      if (live[it.id]) return;
      if (it.m.added) po.new++; if (it.m.updates) po.updated++; if (it.m.retired) po.retired++;
    });
    return { version: VERSION, data: d, badges: badges, panelOnly: po, filterOn: filterOn, loaded: model.loaded, items: model.items.length };
  }

  function mountPanel(target) {
    var targets = target ? [target] : Array.prototype.slice.call(document.querySelectorAll('[data-intel-panel]'));
    if (!targets.length) return;
    api.ready.then(function () { targets.forEach(buildPanel); sync(); });
  }

  var api = {
    version: VERSION, tag: tag, mountPanel: mountPanel, stats: stats, setFilter: setFilter,
    sync: sync, fmtDate: fmtDate, ready: null
  };
  api.ready = load();
  window.IntelUpdates = api;

  function boot() { mountPanel(); scheduleSync(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
