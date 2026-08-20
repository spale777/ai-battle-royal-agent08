/**
 * URL Share feature for Digital Art Lab canvas tools.
 * Include via <script src="/share.js"></script> on each tool page.
 *
 * Each page must define:
 *   window.getShareParams()  — returns a plain object of shareable parameters
 *   window.applyShareParams(params) — restores parameters from the object
 *
 * This module:
 *   - Adds a "🔗 Copy Link" button (id="btn-share") next to other action buttons
 *   - Listens for the "C" key to copy a shareable URL
 *   - On page load, checks for ?p= query param and restores state
 *   - Shows a toast notification on copy
 */
(function () {
  'use strict';

  // ── URL encoding ──────────────────────────────────────────────
  function encodeParams(obj) {
    const json = JSON.stringify(obj);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    // Make base64 URL-safe
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeParams(str) {
    try {
      // Restore base64 padding and chars
      let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const json = decodeURIComponent(escape(atob(b64)));
      return JSON.parse(json);
    } catch (e) {
      console.warn('[share.js] Failed to decode params:', e);
      return null;
    }
  }

  // ── Toast notification ────────────────────────────────────────
  function showToast(message, duration) {
    duration = duration || 2500;
    const existing = document.getElementById('share-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      top: '72px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '8px 20px',
      background: 'rgba(100, 200, 100, 0.9)',
      color: '#fff',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '600',
      zIndex: '10001',
      pointerEvents: 'none',
      transition: 'opacity 0.4s',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    });
    document.body.appendChild(toast);
    setTimeout(function () { toast.style.opacity = '0'; }, duration);
    setTimeout(function () { toast.remove(); }, duration + 400);
  }

  // ── Copy shareable URL ────────────────────────────────────────
  function copyShareURL() {
    if (typeof window.getShareParams !== 'function') {
      console.warn('[share.js] getShareParams not defined');
      return;
    }

    const params = window.getShareParams();
    if (!params || Object.keys(params).length === 0) {
      showToast('⚠️ No parameters to share');
      return;
    }

    const encoded = encodeParams(params);
    const url = window.location.origin + window.location.pathname + '?p=' + encoded;

    // Update URL without reload
    history.replaceState(null, '', '?p=' + encoded);

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        showToast('🔗 Link copied to clipboard!');
      }).catch(function () {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('🔗 Link copied to clipboard!');
    } catch (e) {
      showToast('⚠️ Copy failed — check address bar');
      // Still updated the URL
    }
    document.body.removeChild(ta);
  }

  // ── Restore from URL ──────────────────────────────────────────
  function tryRestore() {
    const urlParams = new URLSearchParams(window.location.search);
    const p = urlParams.get('p');
    if (!p) return;

    const params = decodeParams(p);
    if (!params) return;

    if (typeof window.applyShareParams === 'function') {
      // Defer to next frame so DOM is ready
      requestAnimationFrame(function () {
        window.applyShareParams(params);
        showToast('🎨 Shared settings applied!');
      });
    }
  }

  // ── Share button UI ───────────────────────────────────────────
  function createShareButton() {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.id = 'btn-share';
    btn.innerHTML = '🔗 Share' +
      '<kbd style="margin-left:4px;font-size:0.6rem;opacity:.45;background:none;border:none;padding:0;color:inherit;">C</kbd>';
    btn.addEventListener('click', copyShareURL);
    return btn;
  }

  // ── Inject share button next to snapshot/export ───────────────
  function injectButton() {
    // Find the best insertion point
    const snapshotBtn = document.getElementById('btn-snapshot') ||
                        document.getElementById('btnExport');
    if (snapshotBtn && snapshotBtn.parentNode) {
      snapshotBtn.parentNode.insertBefore(createShareButton(), snapshotBtn.nextSibling);
    }
  }

  // ── Keyboard shortcut (C key) ─────────────────────────────────
  function handleKey(e) {
    if (e.key === 'c' || e.key === 'C') {
      // Don't intercept if typing in an input
      var t = document.activeElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
        return;
      }
      e.preventDefault();
      copyShareURL();
    }
  }

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    injectButton();
    document.addEventListener('keydown', handleKey);
    tryRestore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
