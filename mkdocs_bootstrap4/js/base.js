/*
 * NERVA docs theme — no jQuery, no Bootstrap bundle.
 *
 * Everything the theme needed from the Bootstrap 4 JavaScript surface is
 * implemented here against the same class contract (`.show`,
 * `.modal-backdrop`, `body.modal-open`, `[data-toggle=...]`), so the
 * existing CSS keeps working unchanged. On top of that: the dark mode
 * toggle, the keyboard shortcuts the keyboard modal advertises, code
 * highlighting, and the small content wiring (contributors, metadata
 * placement).
 */
(function () {
  'use strict';

  var html = document.documentElement;
  var SHORTCUTS = window.mkdocs_shortcuts || { help: 191, next: 78, previous: 80, search: 83 };

  function forEach(list, fn) { Array.prototype.forEach.call(list, fn); }
  function on(el, event, fn) { el.addEventListener(event, fn, false); }

  // Runs deferred: the DOM is already parsed at this point.
  // ---------------------------------------------------------------- dark mode

  var THEME_KEY = 'nerva-docs-theme';

  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function setTheme(dark) {
    html.classList.toggle('dark-mode', dark);
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch (e) { /* private mode */ }
  }

  forEach(document.querySelectorAll('.theme-toggle-btn'), function (btn) {
    on(btn, 'click', function (e) {
      e.preventDefault();
      setTheme(!html.classList.contains('dark-mode'));
    });
  });

  // Follow the system only while the visitor has made no explicit choice.
  // The handler re-reads storage on every system change: once the toggle
  // has stored a preference, that choice wins and an OS theme switch later
  // in the same session no longer flips the page back.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) {
      mq.addEventListener('change', function (e) {
        if (storedTheme() !== null) return;
        html.classList.toggle('dark-mode', e.matches);
      });
    }
  }

  // ---------------------------------------------------------------- collapse

  // [data-toggle="collapse"] flips .show on its target. The navbar and the
  // table of contents both use it; aria-expanded mirrors the state, and the
  // anchor offset is re-measured because an opened navbar grows taller.
  forEach(document.querySelectorAll('[data-toggle="collapse"]'), function (toggle) {
    on(toggle, 'click', function (e) {
      e.preventDefault();
      var target = document.querySelector(toggle.getAttribute('data-target'));
      if (!target) return;
      var open = target.classList.toggle('show');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      syncNavbarOffset();
    });
  });

  // ---------------------------------------------------------------- dropdown

  function closeDropdowns(except) {
    forEach(document.querySelectorAll('.dropdown.show'), function (dd) {
      if (dd === except) return;
      dd.classList.remove('show');
      var menu = dd.querySelector(':scope > .dropdown-menu');
      if (menu) menu.classList.remove('show');
      var toggle = dd.querySelector('[data-toggle="dropdown"]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  forEach(document.querySelectorAll('[data-toggle="dropdown"]'), function (toggle) {
    on(toggle, 'click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var dd = toggle.closest('.dropdown');
      if (!dd) return;
      var willOpen = !dd.classList.contains('show');
      closeDropdowns(willOpen ? dd : null);
      dd.classList.toggle('show', willOpen);
      var menu = dd.querySelector(':scope > .dropdown-menu');
      if (menu) menu.classList.toggle('show', willOpen);
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  on(document, 'click', function (e) {
    if (!e.target.closest('.dropdown')) closeDropdowns(null);
  });

  // ---------------------------------------------------------------- modal

  var backdrop = null;
  var openModal = null;
  var lastFocus = null;

  function focusables(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null; }
    );
  }

  // Width of the classic scrollbar, 0 with overlay scrollbars. Locking the
  // body with overflow:hidden takes it away, which shifts every centered
  // and fixed element: compensate the same way the Bootstrap JS used to.
  function scrollbarWidth() {
    return window.innerWidth - html.clientWidth;
  }

  function lockScroll() {
    var w = scrollbarWidth();
    if (w <= 0) return;
    document.body.style.paddingRight = (parseFloat(getComputedStyle(document.body).paddingRight) || 0) + w + 'px';
    forEach(document.querySelectorAll('.fixed-top, .fixed-bottom, .is-fixed, .sticky-top'), function (el) {
      el.style.paddingRight = (parseFloat(getComputedStyle(el).paddingRight) || 0) + w + 'px';
    });
  }

  function unlockScroll() {
    document.body.style.paddingRight = '';
    forEach(document.querySelectorAll('.fixed-top, .fixed-bottom, .is-fixed, .sticky-top'), function (el) {
      el.style.paddingRight = '';
    });
  }

  function showModal(el) {
    if (openModal) closeModal(openModal);
    lastFocus = document.activeElement;
    openModal = el;
    lockScroll();
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop show';
    document.body.appendChild(backdrop);
    document.body.classList.add('modal-open');
    el.classList.add('show');
    el.style.display = 'block';
    el.removeAttribute('aria-hidden');
    var first = el.querySelector('#mkdocs-search-query') || focusables(el)[0];
    if (first) first.focus();
  }

  function closeModal(el) {
    if (!el || el !== openModal) return;
    el.classList.remove('show');
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
    if (backdrop) { backdrop.remove(); backdrop = null; }
    document.body.classList.remove('modal-open');
    unlockScroll();
    openModal = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  forEach(document.querySelectorAll('[data-toggle="modal"]'), function (toggle) {
    on(toggle, 'click', function (e) {
      e.preventDefault();
      var target = document.querySelector(toggle.getAttribute('data-target'));
      if (target) showModal(target);
    });
  });

  forEach(document.querySelectorAll('[data-dismiss="modal"]'), function (btn) {
    on(btn, 'click', function (e) {
      e.preventDefault();
      closeModal(btn.closest('.modal'));
    });
  });

  // Click on the backdrop area (the .modal itself, outside .modal-dialog).
  forEach(document.querySelectorAll('.modal'), function (modal) {
    on(modal, 'mousedown', function (e) {
      if (e.target === modal) closeModal(modal);
    });
  });

  // ---------------------------------------------------------------- keyboard

  function isTyping(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ||
      el.tagName === 'SELECT' || el.isContentEditable);
  }

  on(document, 'keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      if (openModal) { closeModal(openModal); return; }
      closeDropdowns(null);
      var nav = document.querySelector('#navbarsExample04');
      if (nav && nav.classList.contains('show')) {
        nav.classList.remove('show');
        var t = document.querySelector('[data-target="#navbarsExample04"]');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
      return;
    }
    if (openModal) {
      if (e.key === 'Tab') {
        // keep focus inside the open dialog
        var items = focusables(openModal);
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    var key = e.which || e.keyCode;

    if (key === SHORTCUTS.search) {
      var searchModal = document.getElementById('mkdocs_search_modal');
      if (searchModal) { e.preventDefault(); showModal(searchModal); }
    } else if (key === SHORTCUTS.help) {
      // Key code 191 is both keys on a US layout: '/' bare and '?' with
      // Shift. Bare '/' is the conventional focus-search key, so it goes
      // to the search box; Shift+'/' opens this help.
      if (e.shiftKey) {
        var helpModal = document.getElementById('mkdocs_keyboard_modal');
        if (helpModal) { e.preventDefault(); showModal(helpModal); }
      } else {
        var searchModal2 = document.getElementById('mkdocs_search_modal');
        if (searchModal2) {
          e.preventDefault();
          showModal(searchModal2);
        } else {
          var query = document.getElementById('mkdocs-search-query');
          if (query) { e.preventDefault(); query.focus(); }
        }
      }
    } else if (key === SHORTCUTS.next) {
      go('next');
    } else if (key === SHORTCUTS.previous) {
      go('prev');
    }
  });

  // rel="next" / rel="prev" are the HTML5 link types on the header links:
  // keep the lookup and the markup spelled the same way.
  function go(rel) {
    var link = document.querySelector('a[rel="' + rel + '"]');
    if (link && link.getAttribute('href')) window.location = link.getAttribute('href');
  }

  // ---------------------------------------------------------------- content

  // Anchor jumps must land below the fixed navbar. The stylesheet carries a
  // fallback constant; here the real height is measured so the offset does
  // not drift when the navbar wraps on narrow viewports.
  function syncNavbarOffset() {
    var navbar = document.querySelector('.navbar.fixed-top');
    if (navbar) html.style.setProperty('--navbar-offset', (navbar.offsetHeight + 10) + 'px');
  }
  syncNavbarOffset();
  on(window, 'resize', syncNavbarOffset);

  // Contributor avatars: swap the data-src the git-committers plugin
  // leaves behind, so pages render without them and fill in afterwards.
  forEach(document.querySelectorAll('.contributors img[data-src]'), function (img) {
    img.src = img.getAttribute('data-src');
  });

  // The metadata line sits right under the page heading.
  var metadata = document.querySelector('.metadata');
  var heading = document.querySelector('#content h1');
  if (metadata && heading && heading.parentNode) {
    heading.parentNode.insertBefore(metadata, heading.nextSibling);
  }

  // Code highlighting, when the theme asked for it.
  if (window.hljs && window.hljs.highlightAll) {
    window.hljs.highlightAll();
  }
}());
