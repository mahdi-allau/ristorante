(function () {
  'use strict';

  /* ---------- Dati menu (nel progetto reale arrivano dal CMS) ---------- */
  var ALLERGENI = {
    G: 'Glutine', C: 'Crostacei', U: 'Uova', P: 'Pesce', S: 'Sesamo',
    L: 'Latte', N: 'Frutta a guscio', E: 'Sedano', M: 'Senape', V: 'Solfiti'
  };
  var DISHES = [
    { cat: 'antipasti', name: 'Crudo di gambero rosso', desc: 'Agrumi, finocchietto selvatico, olio al limone.', price: 24, al: ['C'] },
    { cat: 'antipasti', name: 'Burrata e pomodoro confit', desc: 'Basilico, pane al lievito madre tostato.', price: 18, al: ['L', 'G'], veg: true },
    { cat: 'antipasti', name: 'Tartare di manzo piemontese', desc: 'Tuorlo marinato, capperi, senape antica.', price: 22, al: ['U', 'M'] },
    { cat: 'primi', name: 'Tagliolini al limone e bottarga', desc: 'Pasta all\'uovo tirata a mano, scorza di limone.', price: 22, al: ['G', 'U', 'P'] },
    { cat: 'primi', name: 'Risotto allo zafferano e midollo', desc: 'Carnaroli invecchiato, mantecato al burro nocciola.', price: 24, al: ['L', 'E'] },
    { cat: 'primi', name: 'Ravioli di ricotta e menta', desc: 'Burro nocciola, nocciole del Piemonte tostate.', price: 20, al: ['G', 'U', 'L', 'N'], veg: true },
    { cat: 'primi', name: 'Gnocchi con ragù bianco di coniglio', desc: 'Patate di montagna, rosmarino, Parmigiano 30 mesi.', price: 21, al: ['G', 'U', 'E', 'L'] },
    { cat: 'secondi', name: 'Rombo arrosto', desc: 'Beurre blanc, asparagi, erba cipollina.', price: 34, al: ['P', 'L', 'V'] },
    { cat: 'secondi', name: 'Guancia di vitello brasata', desc: 'Purè di patate al burro, jus di cottura al Barolo.', price: 30, al: ['L', 'E', 'V'] },
    { cat: 'secondi', name: 'Cavolfiore arrosto', desc: 'Salsa tahini, nocciole, uvetta, limone.', price: 22, al: ['S', 'N'], veg: true },
    { cat: 'dolci', name: 'Tiramisù scomposto', desc: 'Savoiardo, crema al mascarpone, caffè di specialità.', price: 11, al: ['G', 'U', 'L'], veg: true },
    { cat: 'dolci', name: 'Panna cotta ai frutti rossi', desc: 'Vaniglia del Madagascar, coulis di lampone.', price: 10, al: ['L'], veg: true },
    { cat: 'dolci', name: 'Cioccolato fondente, sale e olio', desc: 'Cremoso 70%, olio extravergine, sale in fiocchi.', price: 12, al: ['L', 'N'], veg: true }
  ];
  var CAT_LABEL = { antipasti: 'Antipasti', primi: 'Primi', secondi: 'Secondi', dolci: 'Dolci' };

  /* ---------- Orari (Europe/Rome) ---------- */
  // 0 = domenica … 6 = sabato. null = chiuso
  var HOURS = {
    0: [[12.5, 14.5], [19.5, 23]], 1: null,
    2: [[12.5, 14.5], [19.5, 23]], 3: [[12.5, 14.5], [19.5, 23]], 4: [[12.5, 14.5], [19.5, 23]],
    5: [[12.5, 14.5], [19.5, 23]], 6: [[12.5, 14.5], [19.5, 23]]
  };
  var DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function romeNow() {
    var p = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { day: DAYS[p.weekday], time: (+p.hour % 24) + (+p.minute) / 60 };
  }
  function fmt(t) {
    var h = Math.floor(t), m = Math.round((t - h) * 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function renderStatus() {
    var el = document.getElementById('status');
    if (!el) return;
    var n = romeNow(), slots = HOURS[n.day] || [], msg = null, open = false, i;
    for (i = 0; i < slots.length; i++) {
      if (n.time >= slots[i][0] && n.time < slots[i][1]) { open = true; msg = 'Aperto ora · chiude alle ' + fmt(slots[i][1]); break; }
    }
    if (!open) {
      for (i = 0; i < slots.length; i++) {
        if (n.time < slots[i][0]) { msg = 'Chiuso ora · riapre alle ' + fmt(slots[i][0]); break; }
      }
    }
    if (!msg) {
      for (var d = 1; d <= 7; d++) {
        var nd = (n.day + d) % 7;
        if (HOURS[nd]) { msg = 'Chiuso ora · riapre ' + ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'][nd] + ' alle ' + fmt(HOURS[nd][0][0]); break; }
      }
    }
    el.innerHTML = '<i class="' + (open ? 'open' : '') + '"></i>' + msg;
    var row = document.querySelector('#hours tr[data-d="' + n.day + '"]');
    if (row) row.classList.add('today');
  }

  /* ---------- Menu ---------- */
  function renderMenu() {
    var ul = document.getElementById('dishes');
    if (!ul) return;
    ul.innerHTML = DISHES.map(function (d) {
      var al = d.al.map(function (a) {
        return '<span title="' + ALLERGENI[a] + '" aria-label="Contiene ' + ALLERGENI[a] + '">' + a + '</span>';
      }).join('') + (d.veg ? '<span class="v" title="Vegetariano" aria-label="Vegetariano">V+</span>' : '');
      return '<li class="dish reveal in" data-cat="' + d.cat + '" data-veg="' + (d.veg ? 1 : 0) + '">' +
        '<span class="cat">' + CAT_LABEL[d.cat] + '</span>' +
        '<h3>' + d.name + '</h3><span class="price">' + d.price + ' €</span>' +
        '<p>' + d.desc + '</p><div class="al">' + al + '</div></li>';
    }).join('');

    var lg = document.getElementById('legend');
    lg.innerHTML = Object.keys(ALLERGENI).map(function (k) {
      return '<div><span>' + k + '</span>' + ALLERGENI[k] + '</div>';
    }).join('') + '<div><span class="v">V+</span>Vegetariano</div>';

    var chips = document.querySelectorAll('.chip');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
        c.classList.add('is-active'); c.setAttribute('aria-selected', 'true');
        var f = c.dataset.filter;
        ul.querySelectorAll('.dish').forEach(function (li) {
          var show = f === 'all' || (f === 'veg' ? li.dataset.veg === '1' : li.dataset.cat === f);
          li.classList.toggle('hide', !show);
        });
      });
    });
  }

  /* ---------- Prenotazione (demo lato client) ---------- */
  var chosen = null;
  function seeded(str) { // pseudo-casuale stabile per data
    var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return function () { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
  }
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  function renderSlots() {
    var dateEl = document.getElementById('bDate'), box = document.getElementById('slots'), hint = document.getElementById('slotsHint');
    chosen = null; box.innerHTML = '';
    if (!dateEl.value) { hint.textContent = 'Scegli una data per vedere gli orari.'; return; }
    var d = new Date(dateEl.value + 'T12:00:00'), dow = d.getDay();
    if (!HOURS[dow]) { hint.textContent = 'Il lunedì siamo chiusi. Scegli un altro giorno.'; return; }
    var rnd = seeded(dateEl.value + document.getElementById('bGuests').value);
    var html = '', any = false;
    ['Pranzo|12.5|14', 'Cena|19.5|22.5'].forEach(function (s) {
      var p = s.split('|'), t;
      html += '<span class="slot-sep">' + p[0] + '</span>';
      for (t = +p[1]; t <= +p[2]; t += 0.5) {
        var full = rnd() < 0.28;
        if (!full) any = true;
        html += '<button type="button" class="slot" role="radio" aria-checked="false" data-t="' + fmt(t) + '"' + (full ? ' disabled' : '') + '>' + fmt(t) + '</button>';
      }
    });
    box.innerHTML = html;
    hint.textContent = any ? 'Gli orari barrati sono al completo.' : 'Giornata al completo: puoi iscriverti alla lista d\'attesa.';
    box.querySelectorAll('.slot:not(:disabled)').forEach(function (b) {
      b.addEventListener('click', function () {
        box.querySelectorAll('.slot').forEach(function (x) { x.classList.remove('sel'); x.setAttribute('aria-checked', 'false'); });
        b.classList.add('sel'); b.setAttribute('aria-checked', 'true'); chosen = b.dataset.t;
        document.querySelectorAll('.steps li').forEach(function (li, i) { li.classList.toggle('on', i <= 2); });
      });
    });
  }

  function initBooking() {
    var form = document.getElementById('bookForm');
    if (!form) return;
    var dateEl = document.getElementById('bDate'), today = new Date();
    dateEl.min = ymd(today);
    var max = new Date(today); max.setDate(max.getDate() + 90); dateEl.max = ymd(max);
    dateEl.addEventListener('change', renderSlots);
    document.getElementById('bGuests').addEventListener('change', renderSlots);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = document.getElementById('bError'), msg = '';
      var name = bName.value.trim(), phone = bPhone.value.trim(), email = bEmail.value.trim();
      if (!dateEl.value) msg = 'Scegli una data.';
      else if (!chosen) msg = 'Scegli un orario disponibile.';
      else if (!name) msg = 'Inserisci nome e cognome.';
      else if (phone.replace(/\D/g, '').length < 7) msg = 'Inserisci un numero di telefono valido.';
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) msg = 'Inserisci un indirizzo email valido.';
      else if (!bPrivacy.checked) msg = 'Per proseguire serve la presa visione dell\'informativa privacy.';
      err.hidden = !msg; err.textContent = msg;
      if (msg) return;

      var d = new Date(dateEl.value + 'T12:00:00');
      var dateStr = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
      var n = bGuests.value;
      document.getElementById('cTitle').textContent = 'Grazie, ' + name.split(' ')[0] + '.';
      document.getElementById('cText').textContent = 'Tavolo per ' + n + (n === '1' ? ' persona' : ' persone') + ', ' + dateStr + ' alle ' + chosen +
        '. Ti scriveremo a ' + email + ' e riceverai un promemoria 24 ore prima. (Demo: nessun dato è stato inviato.)';
      form.hidden = true;
      var c = document.getElementById('confirm'); c.hidden = false; c.focus();
      track('booking_confirmed');
    });
    document.getElementById('cReset').addEventListener('click', function () {
      form.reset(); form.hidden = false; document.getElementById('confirm').hidden = true; renderSlots();
    });
  }

  /* ---------- Tracking (nel progetto reale: GA4 con Consent Mode) ---------- */
  function track(ev) { try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: ev }); } catch (e) {} }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-track]');
    if (t) track(t.getAttribute('data-track'));
  });

  /* ---------- Header e reveal ---------- */
  function initUI() {
    var header = document.querySelector('.header');
    var onScroll = function () { header.classList.toggle('solid', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    var els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  renderMenu();
  renderStatus();
  setInterval(renderStatus, 60000);
  initBooking();
  initUI();
})();
