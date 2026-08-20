/**
 * Keyboard shortcuts for Digital Art Lab canvas tools.
 * Include via <script src="/shortcuts.js"></script> on each tool page.
 *
 * Expected buttons (by id) on each page — missing ones are silently skipped:
 *   #btn-snapshot  — Save / export PNG          (S)
 *   #btn-reset     — Reset view / state          (R)
 *   #btn-regenerate — Regenerate / redraw        (R)
 *   #btn-pause     — Pause / play toggle         (Space)
 *   #btn-clear     — Clear canvas                (Delete)
 *   #btnPlay       — Play / draw animation       (Space)
 *   #btnExport     — PNG export                  (S)
 *
 * Pages may also define:
 *   window.shortcuts_random  — called on D key
 *   window.shortcuts_redraw  — called on R key (fallback when no btn-reset / btn-regenerate)
 */
(function () {
  'use strict';

  // ── Tooltip badge ──────────────────────────────────────────────
  function createBadge() {
    const badge = document.createElement('div');
    badge.id = 'kb-shortcuts-badge';
    badge.innerHTML =
      '<span style="margin-right:6px;">⌨️</span>' +
      '<span>S save</span>' +
      '<span style="margin:0 4px; opacity:.3">·</span>' +
      '<span>R reset</span>' +
      '<span style="margin:0 4px; opacity:.3">·</span>' +
      '<span>Space play</span>' +
      '<span style="margin:0 4px; opacity:.3">·</span>' +
      '<span>D random</span>' +
      '<span style="margin:0 4px; opacity:.3">·</span>' +
      '<span>C share</span>';

    Object.assign(badge.style, {
      position: 'fixed',
      bottom: '12px',
      right: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      padding: '6px 14px',
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      color: 'rgba(255,255,255,0.45)',
      fontSize: '0.65rem',
      fontFamily: 'system-ui, sans-serif',
      letterSpacing: '0.02em',
      zIndex: '9999',
      pointerEvents: 'none',
      transition: 'opacity 0.4s',
      userSelect: 'none',
    });

    document.body.appendChild(badge);

    // Auto-fade after 6 seconds
    setTimeout(() => { badge.style.opacity = '0'; }, 6000);
    // Remove from DOM after fade
    setTimeout(() => { badge.remove(); }, 6500);
  }

  // ── Helpers ────────────────────────────────────────────────────
  function click(id) {
    const el = document.getElementById(id);
    if (el) { el.click(); return true; }
    return false;
  }

  function isTyping() {
    const t = document.activeElement;
    if (!t) return false;
    const tag = t.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
  }

  // ── Key handler ────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (isTyping()) return;

    // S — Save / Export
    if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      click('btn-snapshot') || click('btnExport');
      return;
    }

    // R — Reset / Regenerate / Redraw
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      if (
        !click('btn-reset') &&
        !click('btn-regenerate') &&
        !click('btnReset')
      ) {
        if (typeof window.shortcuts_redraw === 'function') window.shortcuts_redraw();
      }
      return;
    }

    // Space — Pause / Play toggle
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (
        !click('btn-pause') &&
        !click('btnPlay')
      ) {
        if (typeof window.shortcuts_toggle === 'function') window.shortcuts_toggle();
      }
      return;
    }

    // D — Randomize / Random
    if (e.key === 'd' || e.key === 'D') {
      if (typeof window.shortcuts_random === 'function') {
        e.preventDefault();
        window.shortcuts_random();
      }
      return;
    }

    // Delete — Clear
    if (e.key === 'Delete') {
      e.preventDefault();
      click('btn-clear');
      return;
    }
  });

  // Show badge on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBadge);
  } else {
    createBadge();
  }
})();
