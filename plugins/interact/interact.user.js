// ==UserScript==
// @name         Siqoat Interact
// @namespace    https://siqoat.local
// @version      0.1.0
// @description  Ctrl-click emoji choices, then click normally to send a native Stoat interaction message.
// @match        https://stoat.chat/app*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const selected = new Map();
  const API_ROOT = '/api';

  GM_addStyle(`
    #siqoat-interact-tray {
      position: fixed; left: 50%; bottom: 18px; z-index: 2147483647;
      transform: translateX(-50%); display: none; align-items: center; gap: 10px;
      max-width: min(520px, calc(100vw - 36px)); padding: 9px 12px;
      border: 1px solid #675c78; border-radius: 14px;
      background: linear-gradient(145deg, #484054, #302b38);
      color: #eeeaf3; box-shadow: 0 12px 30px rgba(15, 11, 22, .42);
      font: 12px/1.35 "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
    }
    #siqoat-interact-tray.is-visible { display: flex; }
    #siqoat-interact-tray .siqoat-interact-emojis { color: #dfd2ff; font-size: 18px; letter-spacing: 3px; white-space: nowrap; }
    #siqoat-interact-tray .siqoat-interact-help { color: #aaa3b3; }
    #siqoat-interact-tray button { border: 1px solid #675c78; border-radius: 8px; background: #3b3446; color: #dfd2ff; padding: 4px 7px; cursor: pointer; font: inherit; }
    #siqoat-interact-tray button:hover { background: #574b70; }
    [data-siqoat-interact-selected="true"] { outline: 2px solid #dfd2ff !important; outline-offset: 2px; border-radius: 7px !important; }
  `);

  function getTray() {
    let tray = document.querySelector('#siqoat-interact-tray');
    if (tray) return tray;
    tray = document.createElement('div');
    tray.id = 'siqoat-interact-tray';
    tray.innerHTML = '<span class="siqoat-interact-emojis"></span><span class="siqoat-interact-help">Ctrl-click emojis to add · click an emoji to send</span><button type="button" data-action="clear">clear</button>';
    tray.querySelector('[data-action="clear"]').addEventListener('click', clearSelection);
    document.body.appendChild(tray);
    return tray;
  }

  function updateTray() {
    const tray = getTray();
    tray.querySelector('.siqoat-interact-emojis').textContent = [...selected.values()].join(' ');
    tray.classList.toggle('is-visible', selected.size > 0);
  }

  function clearSelection() {
    selected.clear();
    document.querySelectorAll('[data-siqoat-interact-selected="true"]').forEach(node => node.removeAttribute('data-siqoat-interact-selected'));
    updateTray();
  }

  function channelId() {
    const match = location.pathname.match(/\/channel\/([^/]+)/i);
    return match?.[1] || null;
  }

  function looksLikeEmoji(value) {
    return !!value && (/[\p{Extended_Pictographic}]/u.test(value) || /^:[^:]+:$/.test(value));
  }

  function emojiNode(target) {
    return target.closest('[data-emoji], [data-emoji-id], [data-emoji-name], [aria-label], img[alt]');
  }

  function emojiFromTarget(target) {
    const node = emojiNode(target);
    if (!node) return null;
    const customId = node.getAttribute('data-emoji-id');
    if (customId) return customId;
    const value = node.getAttribute('data-emoji') || node.getAttribute('data-emoji-name') || node.getAttribute('aria-label') || node.getAttribute('alt');
    return looksLikeEmoji(value?.trim()) ? value.trim() : null;
  }

  function markTarget(target, value) {
    const node = emojiNode(target);
    if (node) node.toggleAttribute('data-siqoat-interact-selected', selected.has(value));
  }

  async function sendInteraction() {
    const id = channelId();
    const reactions = [...selected.keys()];
    if (!id) throw new Error('No Stoat channel is active.');
    if (!reactions.length) return;

    const response = await fetch(`${API_ROOT}/channels/${encodeURIComponent(id)}/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify({
        content: null,
        interactions: { reactions, restrict_reactions: true }
      })
    });
    if (!response.ok) throw new Error(`Stoat API returned ${response.status}`);
  }

  document.addEventListener('click', async event => {
    const value = emojiFromTarget(event.target);
    if (!value) return;

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      event.stopPropagation();
      if (selected.has(value)) selected.delete(value);
      else selected.set(value, value);
      markTarget(event.target, value);
      updateTray();
      return;
    }

    if (!selected.size) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      await sendInteraction();
      clearSelection();
    } catch (error) {
      getTray().querySelector('.siqoat-interact-help').textContent = `Could not send: ${error.message}`;
    }
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selected.size) clearSelection();
  });
})();
