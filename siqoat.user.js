// ==UserScript==
// @name         Siqoat
// @namespace    https://siqnole.dev
// @version      0.1.0
// @description  A modern, cute, enhancement layer for Stoat.
// @match        https://stoat.chat/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const palette = {
    ink: '#24212b',
    inkSoft: '#302b38',
    panel: '#3b3446',
    panelSoft: '#484054',
    line: '#675c78',
    gray: '#aaa3b3',
    text: '#eeeaf3',
    lilac: '#bba8e5',
    lilacLight: '#dfd2ff',
    lavender: '#cbb8f4',
    pink: '#e6bfdc',
    mint: '#bad9d2'
  };
  const mono = '"IBM Plex Mono", "SFMono-Regular", "Cascadia Mono", "Roboto Mono", Consolas, monospace';

  GM_addStyle(`
    :root {
      color-scheme: dark !important;
      --md-sys-color-background: ${palette.ink} !important;
      --md-sys-color-surface: ${palette.ink} !important;
      --md-sys-color-surface-container-lowest: #1a1820 !important;
      --md-sys-color-surface-container-low: ${palette.inkSoft} !important;
      --md-sys-color-surface-container: ${palette.panel} !important;
      --md-sys-color-surface-container-high: ${palette.panelSoft} !important;
      --md-sys-color-surface-container-highest: #554a62 !important;
      --md-sys-color-on-surface: ${palette.text} !important;
      --md-sys-color-on-surface-variant: ${palette.gray} !important;
      --md-sys-color-outline: ${palette.line} !important;
      --md-sys-color-outline-variant: #50475d !important;
      --md-sys-color-primary: ${palette.lilacLight} !important;
      --md-sys-color-on-primary: ${palette.ink} !important;
      --md-sys-color-primary-container: #574b70 !important;
      --md-sys-color-on-primary-container: #f0e8ff !important;
      --md-sys-color-secondary: ${palette.lilac} !important;
      --md-sys-color-secondary-container: #51465d !important;
      --md-sys-color-tertiary: ${palette.pink} !important;
      --md-sys-color-error: #e5aab7 !important;
      --fonts-monospace: ${mono} !important;
      --colours-background: ${palette.ink} !important;
      --colours-foreground: ${palette.text} !important;
      --colours-link: ${palette.lilacLight} !important;
      --colours-settings-background: ${palette.ink} !important;
      --colours-settings-content-background: ${palette.inkSoft} !important;
      --colours-settings-foreground: ${palette.text} !important;
      --colours-settings-sidebar-category: ${palette.lilac} !important;
      --colours-settings-sidebar-foreground: ${palette.gray} !important;
      --colours-settings-sidebar-button-hover: ${palette.panelSoft} !important;
    }

    html, body, button, input, textarea, select, [role="button"] {
      font-family: ${mono} !important;
    }
    html, body { background: ${palette.ink} !important; color: ${palette.text} !important; }
    a { color: ${palette.lilacLight} !important; }
    button, [role="button"] { border-radius: 9px !important; }
    input, textarea, select {
      background: ${palette.inkSoft} !important;
      color: ${palette.text} !important;
      border: 1px solid ${palette.line} !important;
      caret-color: ${palette.lilacLight} !important;
    }
    input:focus, textarea:focus, select:focus {
      border-color: ${palette.lilacLight} !important;
      outline: 2px solid color-mix(in srgb, ${palette.lilacLight} 25%, transparent) !important;
    }
    .ͼ1 .cm-content, .ͼ1 .cm-scroller, .ͼ4 .cm-scroller, .ͼ7 .cm-content {
      font-family: ${mono} !important;
    }
    .ͼ3 .cm-gutters, .ͼ3 .cm-tooltip { background: ${palette.inkSoft} !important; color: ${palette.text} !important; }
    .ͼ3 .cm-activeLine, .ͼ3 .cm-activeLineGutter { background: ${palette.panel} !important; }
    ::selection { background: ${palette.lilac} !important; color: ${palette.ink} !important; }
    * { scrollbar-color: ${palette.line} ${palette.ink}; scrollbar-width: thin; }

    /* Siqoat's small, friendly command bubble. */
    #siqoat-bubble {
      position: fixed; right: 18px; bottom: 18px; z-index: 2147483646;
      width: 48px; height: 48px; display: grid; place-items: center;
      border: 1px solid ${palette.line}; border-radius: 16px !important;
      background: linear-gradient(145deg, ${palette.panelSoft}, ${palette.panel});
      color: ${palette.lilacLight}; box-shadow: 0 10px 24px rgba(15, 11, 22, .32);
      cursor: pointer; font: 20px ${mono}; transition: transform .2s ease, box-shadow .2s ease;
    }
    #siqoat-bubble:hover { transform: translateY(-3px) rotate(-3deg); box-shadow: 0 14px 30px rgba(15, 11, 22, .44); }
    #siqoat-bubble:focus-visible { outline: 2px solid ${palette.lilacLight}; outline-offset: 3px; }
    #siqoat-bubble::before { content: '✦'; }

    #siqoat-popover {
      position: fixed; right: 18px; bottom: 78px; z-index: 2147483647;
      width: min(380px, calc(100vw - 36px)); padding: 18px;
      border: 1px solid ${palette.line}; border-radius: 18px;
      background: linear-gradient(160deg, ${palette.panel}, ${palette.inkSoft});
      color: ${palette.text}; box-shadow: 0 18px 45px rgba(15, 11, 22, .5);
      font: 12px/1.55 ${mono};
    }
    #siqoat-popover[hidden] { display: none; }
    #siqoat-popover h2 { margin: 0; color: ${palette.lilacLight}; font-size: 16px; letter-spacing: .02em; }
    #siqoat-popover p { margin: 8px 0 15px; color: ${palette.gray}; font-size: 11px; }
    #siqoat-popover .siqoat-card { padding: 12px; border: 1px solid #5b5068; border-radius: 12px; background: rgba(36, 33, 43, .48); }
    #siqoat-popover .siqoat-card + .siqoat-card { margin-top: 9px; }
    #siqoat-popover .siqoat-label { color: ${palette.lilac}; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
    #siqoat-popover .siqoat-value { margin-top: 3px; color: ${palette.text}; }
    #siqoat-popover .siqoat-dot { display: inline-block; width: 7px; height: 7px; margin-right: 6px; border-radius: 50%; background: ${palette.mint}; box-shadow: 0 0 9px ${palette.mint}; }
  `);

  function mount() {
    if (!document.body || document.querySelector('#siqoat-bubble')) return;
    const bubble = document.createElement('button');
    bubble.id = 'siqoat-bubble';
    bubble.type = 'button';
    bubble.title = 'Open Siqoat';
    bubble.setAttribute('aria-label', 'Open Siqoat');

    const popover = document.createElement('aside');
    popover.id = 'siqoat-popover';
    popover.hidden = true;
    popover.innerHTML = `
      <h2>siqoat <span aria-hidden="true">✦</span></h2>
      <p>cute tools for Stoat, built around soft lilac, gray, and a little bit of sparkle.</p>
      <div class="siqoat-card"><div class="siqoat-label">Host</div><div class="siqoat-value"><span class="siqoat-dot"></span>Siqoat is running</div></div>
      <div class="siqoat-card"><div class="siqoat-label">Next up</div><div class="siqoat-value">Themes and plugins will live here.</div></div>
    `;
    bubble.addEventListener('click', () => { popover.hidden = !popover.hidden; });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') popover.hidden = true;
    });
    document.body.append(bubble, popover);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();
