/* Searchable type-ahead for native Country / State-Province <select>s.
   The select stays in place (same layout, same React onChange); opening it shows
   a filter box + listbox. Only selects whose options come from the embedded
   country/state dataset (window.__axGeoSets) are enhanced. */
(function () {
  if (window.__axTypeahead) return; window.__axTypeahead = true;
  const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const isGeo = (sel) => {
    const g = window.__axGeoSets; if (!g || !sel || sel.tagName !== 'SELECT' || sel.disabled || sel.multiple) return false;
    let n = 0;
    for (const o of sel.options) { if (!o.value) continue; if (g.countries.has(o.value) || g.states.has(o.value)) return true; if (++n > 3) break; }
    return false;
  };
  let pop = null, cur = null, items = [], active = 0, uid = 0;
  const css = (el, s) => Object.assign(el.style, s);

  function build() {
    pop = document.createElement('div');
    css(pop, { position: 'fixed', zIndex: 10000, background: '#fff', border: '1px solid var(--ax-gray-200, #E9ECEF)', borderRadius: '8px', boxShadow: '0 12px 16px -4px rgba(10,13,18,.08), 0 4px 6px -2px rgba(10,13,18,.03)', padding: '6px', boxSizing: 'border-box', fontFamily: 'Roboto, system-ui, sans-serif', fontSize: '14px', color: 'var(--ax-text-primary, #212529)' });
    const wrap = document.createElement('div'); css(wrap, { position: 'relative', marginBottom: '6px' });
    const ic = document.createElement('i'); ic.className = 'bi bi-search'; ic.setAttribute('aria-hidden', 'true');
    css(ic, { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--ax-text-tertiary, #6C757D)', pointerEvents: 'none' });
    const inp = document.createElement('input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
    inp.setAttribute('role', 'combobox'); inp.setAttribute('aria-autocomplete', 'list'); inp.setAttribute('aria-expanded', 'true');
    css(inp, { width: '100%', boxSizing: 'border-box', height: '36px', padding: '0 10px 0 30px', border: '1px solid var(--ax-gray-300, #DEE2E6)', borderRadius: '8px', font: 'inherit', fontSize: '14px', outline: 'none' });
    inp.addEventListener('focus', () => { inp.style.borderColor = '#00B6BD'; inp.style.boxShadow = '0 0 0 4px rgba(0,182,189,.35)'; });
    inp.addEventListener('blur', () => { inp.style.borderColor = ''; inp.style.boxShadow = ''; });
    const ul = document.createElement('ul'); ul.setAttribute('role', 'listbox'); ul.id = 'ax-ta-list';
    css(ul, { listStyle: 'none', margin: 0, padding: 0, maxHeight: '264px', overflowY: 'auto' });
    inp.setAttribute('aria-controls', ul.id);
    wrap.append(ic, inp); pop.append(wrap, ul);
    pop.addEventListener('mousedown', (e) => { if (e.target !== inp) e.preventDefault(); });
    inp.addEventListener('input', () => render(inp.value));
    inp.addEventListener('keydown', onKey);
    ul.addEventListener('click', (e) => { const li = e.target.closest('li[data-v]'); if (li) commit(li.dataset.v); });
    ul.addEventListener('mousemove', (e) => { const li = e.target.closest('li[data-i]'); if (li && +li.dataset.i !== active) setActive(+li.dataset.i, false); });
    pop._inp = inp; pop._ul = ul;
  }

  function render(q) {
    const f = fold(q).trim();
    const all = Array.from(cur.options).filter((o) => o.value !== '').map((o) => ({ v: o.value, label: o.textContent }));
    const starts = [], has = [];
    all.forEach((o) => { const l = fold(o.label); if (!f || l.startsWith(f)) starts.push(o); else if (l.indexOf(f) >= 0) has.push(o); });
    items = starts.concat(has);
    const ul = pop._ul; ul.textContent = '';
    if (!items.length) {
      const li = document.createElement('li'); li.textContent = 'No matches'; li.setAttribute('role', 'option'); li.setAttribute('aria-disabled', 'true');
      css(li, { padding: '9px 10px', color: 'var(--ax-text-tertiary, #6C757D)' }); ul.append(li);
      pop._inp.removeAttribute('aria-activedescendant'); return;
    }
    const selIdx = items.findIndex((o) => o.v === cur.value);
    items.forEach((o, i) => {
      const li = document.createElement('li'); li.id = 'ax-ta-' + uid + '-' + i; li.dataset.v = o.v; li.dataset.i = i;
      li.setAttribute('role', 'option'); li.setAttribute('aria-selected', o.v === cur.value ? 'true' : 'false');
      css(li, { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', lineHeight: '1.35' });
      const s = document.createElement('span'); s.textContent = o.label; s.style.flex = '1';
      li.append(s);
      if (o.v === cur.value) { const c = document.createElement('i'); c.className = 'bi bi-check2'; c.setAttribute('aria-hidden', 'true'); c.style.color = 'var(--ax-sea-depths, #0D5257)'; li.append(c); }
      ul.append(li);
    });
    setActive(f ? 0 : Math.max(0, selIdx), true);
  }

  function setActive(i, scroll) {
    const lis = pop._ul.children; if (!items.length) return;
    active = Math.max(0, Math.min(items.length - 1, i));
    for (let k = 0; k < lis.length; k++) lis[k].style.background = k === active ? 'var(--ax-gray-100, #F1F3F5)' : '';
    const li = lis[active]; pop._inp.setAttribute('aria-activedescendant', li.id);
    if (scroll) { const ul = pop._ul; if (li.offsetTop < ul.scrollTop) ul.scrollTop = li.offsetTop; else if (li.offsetTop + li.offsetHeight > ul.scrollTop + ul.clientHeight) ul.scrollTop = li.offsetTop + li.offsetHeight - ul.clientHeight; }
  }

  function onKey(e) {
    const page = 8;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Enter', 'Escape', 'Tab'].indexOf(e.key) >= 0) e.stopPropagation();
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1, true); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1, true); }
    else if (e.key === 'PageDown') { e.preventDefault(); setActive(active + page, true); }
    else if (e.key === 'PageUp') { e.preventDefault(); setActive(active - page, true); }
    else if (e.key === 'Enter') { e.preventDefault(); if (items[active]) commit(items[active].v); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === 'Tab') { e.preventDefault(); close(true); }
  }

  function place() {
    const r = cur.getBoundingClientRect(), vh = window.innerHeight, w = Math.max(r.width, 260);
    const h = Math.min(pop.offsetHeight || 320, 320);
    const below = vh - r.bottom >= h + 8 || r.top < h + 8;
    css(pop, { width: w + 'px', left: Math.min(r.left, window.innerWidth - w - 8) + 'px', top: (below ? r.bottom + 4 : r.top - h - 4) + 'px' });
  }

  function open(sel, seed) {
    if (!pop) build();
    cur = sel; uid++;
    document.body.appendChild(pop);
    sel.setAttribute('aria-expanded', 'true');
    const lbl = sel.getAttribute('aria-label') || (sel.id && document.querySelector('label[for="' + sel.id + '"]') || {}).textContent || (sel.closest('div') && sel.closest('div').querySelector('label') || {}).textContent || 'Search';
    pop._inp.setAttribute('aria-label', 'Search ' + String(lbl).replace(/\*/g, '').trim());
    pop._inp.placeholder = 'Type to search';
    pop._inp.value = seed || '';
    render(pop._inp.value); place();
    pop._inp.focus();
    window.addEventListener('scroll', onScroll, true); window.addEventListener('resize', onResize);
  }

  function close(refocus) {
    if (!pop || !cur) return;
    const sel = cur; cur = null; sel.removeAttribute('aria-expanded');
    pop.remove();
    window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onResize);
    if (refocus) sel.focus();
  }
  const onScroll = (e) => { if (pop && pop.contains(e.target)) return; close(false); };
  const onResize = () => close(false);

  function commit(v) {
    const sel = cur; if (!sel) return;
    if (sel.value !== v) {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(sel, v);
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    close(true);
  }

  document.addEventListener('mousedown', (e) => {
    if (pop && cur && !pop.contains(e.target) && e.target !== cur) close(false);
    const sel = e.target.closest && e.target.closest('select');
    if (e.button !== 0 || !isGeo(sel)) return;
    e.preventDefault();
    if (cur === sel) { close(true); return; }
    sel.focus(); open(sel, '');
  }, true);

  document.addEventListener('keydown', (e) => {
    const sel = e.target;
    if (!isGeo(sel) || cur === sel) return;
    const k = e.key;
    if (k === 'Enter' || k === ' ' || k === 'F4' || (e.altKey && (k === 'ArrowDown' || k === 'ArrowUp'))) { e.preventDefault(); open(sel, ''); }
    else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); open(sel, k); }
  }, true);

  /* Screen readers announce that the select opens a searchable list. */
  document.addEventListener('focusin', (e) => { if (isGeo(e.target) && !e.target.hasAttribute('aria-haspopup')) e.target.setAttribute('aria-haspopup', 'listbox'); });
})();
