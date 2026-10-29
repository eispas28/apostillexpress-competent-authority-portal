/* WCAG 2.2 AA shared runtime: landmarks, skip link, dialogs, names, labels, errors, keyboard. */
(function () {
  if (window.__caA11y) return; window.__caA11y = 1;
  var d = document, uid = 0;
  var FOC = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';
  var CTRL = 'input:not([type=hidden]),select,textarea';
  var NAMES = { x: 'Close', 'x-lg': 'Close', 'x-circle': 'Clear', trash: 'Delete', 'trash3': 'Delete', pencil: 'Edit', 'pencil-square': 'Edit', plus: 'Add', 'plus-lg': 'Add', search: 'Search', funnel: 'Filter', download: 'Download', printer: 'Print', 'three-dots': 'More actions', 'three-dots-vertical': 'More actions', 'chevron-left': 'Previous', 'chevron-right': 'Next', 'chevron-down': 'Expand', 'chevron-up': 'Collapse', copy: 'Copy', eye: 'Show', 'eye-slash': 'Hide', 'arrow-repeat': 'Refresh', 'arrows-fullscreen': 'Expand', 'qr-code-scan': 'Scan QR code' };
  function id(p) { return 'ca-' + p + '-' + (++uid); }
  function vis(e) { return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length); }
  function focusables(root) { return Array.prototype.filter.call(root.querySelectorAll(FOC), vis); }
  function txt(e) { return (e.textContent || '').replace(/\s+/g, ' ').trim(); }

  d.documentElement.lang || (d.documentElement.setAttribute('lang', 'en'));

  /* Live region for status messages */
  var live = d.createElement('div'); live.id = 'ca-live'; live.className = 'ca-sr'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); live.setAttribute('aria-atomic', 'true');
  window.caAnnounce = function (m) { live.textContent = ''; setTimeout(function () { live.textContent = m; }, 40); };

  /* Skip link + main target */
  var skip = d.createElement('a'); skip.className = 'ca-skip'; skip.href = '#ca-main'; skip.textContent = 'Skip to main content';
  skip.addEventListener('click', function (e) { var m = d.getElementById('ca-main'); if (m) { e.preventDefault(); m.focus({ preventScroll: false }); } });
  function landmarks() {
    var m = d.querySelector('main'); if (m) { if (!m.id) m.id = 'ca-main'; m.id === 'ca-main' || (skip.href = '#' + m.id); if (m.tabIndex < 0 || !m.hasAttribute('tabindex')) m.setAttribute('tabindex', '-1'); }
  }
  function title() {
    var h = d.querySelector('h1'); var t = h ? txt(h) : '';
    var base = d.documentElement.getAttribute('data-ca-title') || 'ApostilleXpress';
    var want = t && t !== base ? t + ' \u2013 ' + base : base;
    if (d.title !== want) d.title = want;
  }

  /* Dialogs: focus in, trap, Escape, restore */
  var stack = [];
  function openDlg(el) {
    if (el.__caD) return;
    el.__caD = { trigger: d.activeElement };
    stack.push(el);
    if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
      var h = el.querySelector('h1,h2,h3'); if (h) { if (!h.id) h.id = id('dt'); el.setAttribute('aria-labelledby', h.id); }
    }
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    setTimeout(function () {
      if (el.contains(d.activeElement) && d.activeElement !== el) return;
      var t = el.querySelector('[autofocus]') || focusables(el).filter(function (n) { return !/^close$|^dismiss$/i.test(n.getAttribute('aria-label') || ''); })[0] || focusables(el)[0] || el;
      t.focus({ preventScroll: true });
    }, 30);
  }
  function closeDlg(el) {
    var i = stack.indexOf(el); if (i >= 0) stack.splice(i, 1);
    var t = el.__caD && el.__caD.trigger; el.__caD = null;
    if (t && t.isConnected && vis(t)) setTimeout(function () { t.focus({ preventScroll: true }); }, 0);
  }
  d.addEventListener('keydown', function (e) {
    var top = stack[stack.length - 1]; if (!top || !top.isConnected) return;
    if (e.key === 'Tab') {
      var f = focusables(top); if (!f.length) { e.preventDefault(); top.focus(); return; }
      var first = f[0], last = f[f.length - 1], a = d.activeElement;
      if (!top.contains(a)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && (a === first || a === top)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    } else if (e.key === 'Escape' && !e.defaultPrevented) {
      var openMenu = top.querySelector('[aria-expanded="true"]');
      if (openMenu && openMenu.getAttribute('aria-haspopup')) return;
      var c = top.querySelector('[aria-label="Close"],[aria-label^="Close "],[aria-label="Dismiss"],[aria-label="Cancel"]') ||
        Array.prototype.filter.call(top.querySelectorAll('button'), function (b) { return /^(cancel|close|done|no, go back|back)$/i.test(txt(b)) && !b.disabled; })[0];
      if (c) { e.preventDefault(); e.stopPropagation(); c.click(); }
    }
  }, true);
  /* Keep focus inside the topmost dialog */
  d.addEventListener('focusin', function (e) {
    var top = stack[stack.length - 1]; if (!top || !top.isConnected || top.contains(e.target) || e.target === d.body) return;
    if (e.target.closest && e.target.closest('#ca-live,.ca-skip')) return;
    var f = focusables(top); (f[0] || top).focus({ preventScroll: true });
  });

  /* Tabs: arrow-key roving */
  d.addEventListener('keydown', function (e) {
    var t = e.target; if (!t || !t.closest || !/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) return;
    var tab = t.closest('[role=tab]'); if (!tab) return;
    var list = tab.closest('[role=tablist]'); if (!list) return;
    var tabs = Array.prototype.filter.call(list.querySelectorAll('[role=tab]'), function (x) { return !x.disabled && vis(x); });
    var i = tabs.indexOf(tab), n = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    e.preventDefault(); tabs[n].focus();
  });

  /* Enter/Space activates pseudo-buttons */
  d.addEventListener('keydown', function (e) {
    var t = e.target; if (!t || !t.getAttribute || t.getAttribute('data-ca-kb') !== '1') return;
    if (e.key === 'Enter' || (e.key === ' ' && t.getAttribute('role') === 'button')) { e.preventDefault(); t.click(); }
  });

  function enhance(root) {
    if (!root || root.nodeType !== 1) return;
    var q = function (s) { var a = Array.prototype.slice.call(root.querySelectorAll(s)); if (root.matches && root.matches(s)) a.unshift(root); return a; };
    q('[role=dialog],[role=alertdialog]').forEach(openDlg);
    /* decorative icons */
    q('i.bi:not([aria-hidden])').forEach(function (i) { i.setAttribute('aria-hidden', 'true'); });
    q('svg:not([aria-hidden]):not([role]):not([aria-label])').forEach(function (s) { s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false'); });
    q('img:not([alt])').forEach(function (i) { i.setAttribute('alt', ''); });
    /* names for icon-only controls */
    q('button,[role=button],a[href],[role=menuitem]').forEach(function (b) {
      if (b.hasAttribute('aria-label') || b.hasAttribute('aria-labelledby')) return;
      if (txt(b) || b.querySelector('img[alt]:not([alt=""])')) return;
      var n = b.getAttribute('title');
      if (!n) { var ic = b.querySelector('i.bi'); if (ic) { var m = /bi-([a-z0-9-]+)/.exec(ic.className); if (m) { var k = m[1].replace(/-fill$/, ''); n = NAMES[k] || k.replace(/-/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }); } } }
      if (n) b.setAttribute('aria-label', n);
    });
    /* headings in tables */
    q('th:not([scope])').forEach(function (h) { h.setAttribute('scope', h.closest('thead') ? 'col' : 'row'); });
    /* pseudo-buttons and clickable rows */
    q('[style*="cursor: pointer"],[style*="cursor:pointer"]').forEach(function (e) {
      if (e.hasAttribute('data-ca-kb') || e.matches('a,button,input,select,textarea,label,summary,option,[role=button],[role=tab],[role=menuitem],[role=link],[tabindex]')) return;
      if (e.closest('button,a[href],[role=button]') || e.querySelector(FOC)) return;
      e.setAttribute('tabindex', '0'); e.setAttribute('data-ca-kb', '1');
      if (!/^(TR|TD|TH|TBODY|THEAD)$/.test(e.tagName)) e.setAttribute('role', 'button');
      if (!e.getAttribute('aria-label') && !txt(e) && e.getAttribute('title')) e.setAttribute('aria-label', e.getAttribute('title'));
    });
    /* labels */
    q('label:not([for])').forEach(function (l) {
      if (l.querySelector(CTRL)) return;
      var scope = l.parentElement, c = null;
      for (var i = 0; scope && i < 3 && !c; i++, scope = scope.parentElement) { c = Array.prototype.filter.call(scope.querySelectorAll(CTRL), function (x) { return !x.id || !d.querySelector('label[for="' + x.id + '"]'); })[0]; if (scope.querySelectorAll('label').length > 1 && i > 0) break; }
      if (c) { if (!c.id) c.id = id('f'); l.setAttribute('for', c.id); }
    });
    q(CTRL).forEach(function (c) {
      if (c.type === 'hidden') return;
      if (!c.hasAttribute('aria-label') && !c.hasAttribute('aria-labelledby') && !(c.labels && c.labels.length) && !(c.id && d.querySelector('label[for="' + c.id + '"]'))) {
        var p = c.getAttribute('placeholder') || c.getAttribute('title') || c.getAttribute('name');
        if (p) c.setAttribute('aria-label', p.replace(/[-_]/g, ' '));
      }
      var lab = (c.id && d.querySelector('label[for="' + c.id + '"]')) || (c.labels && c.labels[0]);
      if (lab && !c.hasAttribute('aria-required') && !c.required && lab.querySelector('[aria-hidden="true"]') && /^\s*\*\s*$/.test(lab.querySelector('[aria-hidden="true"]').textContent)) {
        c.setAttribute('aria-required', 'true');
        if (!/required/i.test(lab.textContent)) { var s = d.createElement('span'); s.className = 'ca-sr'; s.textContent = ' (required)'; lab.appendChild(s); }
      }
    });
    /* error messages linked to their field and announced */
    q('[role=alert]').forEach(function (a) {
      if (a.__caE || a.children.length > 3 || txt(a).length > 160) return;
      var scope = a.parentElement, c = null;
      for (var i = 0; scope && i < 3 && !c; i++, scope = scope.parentElement) { var cs = scope.querySelectorAll(CTRL); if (cs.length === 1) c = cs[0]; else if (cs.length > 1) break; }
      if (!c) return; a.__caE = 1;
      if (!a.id) a.id = id('err');
      c.setAttribute('aria-invalid', 'true');
      var cur = (c.getAttribute('aria-describedby') || '').split(' ').filter(Boolean); if (cur.indexOf(a.id) < 0) cur.push(a.id); c.setAttribute('aria-describedby', cur.join(' '));
    });
  }
  var pend = [], tm = 0;
  function flush() {
    tm = 0;
    var nodes = pend; pend = [];
    nodes.forEach(enhance);
    for (var i = stack.length - 1; i >= 0; i--) if (!stack[i].isConnected) closeDlg(stack[i]);
    landmarks(); title();
    /* an invalid control whose error is gone */
    Array.prototype.forEach.call(d.querySelectorAll('[aria-invalid="true"][aria-describedby^="ca-err-"]'), function (c) { var e = d.getElementById(c.getAttribute('aria-describedby').split(' ').pop()); if (!e || !e.isConnected) { c.removeAttribute('aria-invalid'); c.removeAttribute('aria-describedby'); } });
  }
  function sched(n) { if (n) pend.push(n); if (!tm) tm = setTimeout(flush, 60); }
  function start() {
    d.body.appendChild(live); (function put(n){ var r = d.getElementById('dc-root') || d.getElementById('root'); if (r && r.firstChild) r.insertBefore(skip, r.firstChild); else if (n < 40) setTimeout(function () { put(n + 1); }, 100); else d.body.insertBefore(skip, d.body.firstChild); })(0);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        m.addedNodes.forEach(function (n) { if (n.nodeType === 1) sched(n); });
        if (m.removedNodes.length) sched(null);
        if (m.type === 'attributes' && m.target.nodeType === 1 && m.attributeName === 'role') sched(m.target);
      });
    }).observe(d.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['role'] });
    sched(d.body);
  }
  if (d.body) start(); else d.addEventListener('DOMContentLoaded', start);
})();
