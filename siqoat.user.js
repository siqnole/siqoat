// ==UserScript==
// @name         Siqoat
// @namespace    https://siqnole.dev
// @version      0.3.0
// @description  Siqoat settings hub for Stoat themes and plugins.
// @match        https://stoat.chat/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const palette = {
    ink: '#24212b', inkSoft: '#302b38', panel: '#3b3446', panelSoft: '#484054',
    line: '#675c78', gray: '#aaa3b3', text: '#eeeaf3', lilac: '#bba8e5',
    lilacLight: '#dfd2ff', lavender: '#cbb8f4', pink: '#e6bfdc', mint: '#bad9d2'
  };
  const mono = '"IBM Plex Mono", "SFMono-Regular", "Cascadia Mono", "Roboto Mono", Consolas, monospace';
  const REPO = 'siqnole/siqoat';
  const BRANCH = 'main';
  const RAW_ROOT = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/`;
  const TREE_API = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`;

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
    html, body, button, input, textarea, select, [role="button"] { font-family: ${mono} !important; }
    html, body { background: ${palette.ink} !important; color: ${palette.text} !important; }
    a { color: ${palette.lilacLight} !important; }
    button, [role="button"] { border-radius: 9px !important; }
    input, textarea, select { background: ${palette.inkSoft} !important; color: ${palette.text} !important; border: 1px solid ${palette.line} !important; caret-color: ${palette.lilacLight} !important; }
    input:focus, textarea:focus, select:focus { border-color: ${palette.lilacLight} !important; outline: 2px solid color-mix(in srgb, ${palette.lilacLight} 25%, transparent) !important; }
    .ͼ1 .cm-content, .ͼ1 .cm-scroller, .ͼ4 .cm-scroller, .ͼ7 .cm-content { font-family: ${mono} !important; }
    .ͼ3 .cm-gutters, .ͼ3 .cm-tooltip { background: ${palette.inkSoft} !important; color: ${palette.text} !important; }
    .ͼ3 .cm-activeLine, .ͼ3 .cm-activeLineGutter { background: ${palette.panel} !important; }
    ::selection { background: ${palette.lilac} !important; color: ${palette.ink} !important; }
    * { scrollbar-color: ${palette.line} ${palette.ink}; scrollbar-width: thin; }

    /* The item uses Stoat's own settings-sidebar geometry and typography. */
    #siqoat-settings-entry { cursor: pointer; }
    #siqoat-settings-entry[data-active="true"] { background: ${palette.panelSoft} !important; color: ${palette.lilacLight} !important; }
    #siqoat-settings-entry .siqoat-settings-glyph { width: 20px; height: 20px; display: grid; place-items: center; color: ${palette.lilacLight}; font-size: 16px; }
    #siqoat-settings-panel { display: none; box-sizing: border-box; min-height: 100%; padding: clamp(22px, 4vw, 48px); color: ${palette.text}; background: ${palette.inkSoft}; font-family: ${mono}; }
    #siqoat-settings-panel[data-open="true"] { display: block; }
    #siqoat-settings-panel .siqoat-kicker { margin-bottom: 6px; color: ${palette.lilac}; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
    #siqoat-settings-panel h1 { margin: 0; color: ${palette.lilacLight}; font-size: clamp(20px, 3vw, 28px); font-weight: 600; }
    #siqoat-settings-panel .siqoat-subtitle { max-width: 620px; margin: 9px 0 24px; color: ${palette.gray}; font-size: 12px; line-height: 1.6; }
    #siqoat-settings-panel .siqoat-tabs { display: flex; gap: 8px; margin-bottom: 18px; border-bottom: 1px solid #50475d; padding-bottom: 10px; }
    #siqoat-settings-panel .siqoat-tab { border: 1px solid ${palette.line}; background: ${palette.panel}; color: ${palette.gray}; padding: 7px 11px; cursor: pointer; font: inherit; font-size: 11px; }
    #siqoat-settings-panel .siqoat-tab[data-selected="true"] { background: #574b70; color: #f0e8ff; border-color: ${palette.lilac}; }
    #siqoat-settings-panel .siqoat-card { max-width: 720px; padding: 15px; border: 1px solid #5b5068; border-radius: 13px; background: rgba(59, 52, 70, .65); }
    #siqoat-settings-panel .siqoat-card + .siqoat-card { margin-top: 10px; }
    #siqoat-settings-panel .siqoat-card-title { color: ${palette.text}; font-size: 13px; font-weight: 600; }
    #siqoat-settings-panel .siqoat-card-copy { margin-top: 5px; color: ${palette.gray}; font-size: 11px; line-height: 1.5; }
    #siqoat-settings-panel .siqoat-card-meta { margin-top: 7px; color: ${palette.gray}; opacity: .78; font-size: 10px; }
    #siqoat-settings-panel .siqoat-card-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    #siqoat-settings-panel .siqoat-card-button { display: inline-block; border: 1px solid ${palette.line}; border-radius: 8px; padding: 6px 9px; background: ${palette.panel}; color: ${palette.lilacLight} !important; font: inherit; font-size: 10px; text-decoration: none; cursor: pointer; }
    #siqoat-settings-panel .siqoat-card-button:hover { border-color: ${palette.lilacLight}; background: #574b70; }
    #siqoat-settings-panel .siqoat-status { display: inline-flex; align-items: center; margin-top: 11px; color: ${palette.mint}; font-size: 10px; }
    #siqoat-settings-panel .siqoat-status::before { content: ''; width: 7px; height: 7px; margin-right: 6px; border-radius: 50%; background: ${palette.mint}; box-shadow: 0 0 9px ${palette.mint}; }
  `);

  function textNode(text) {
    return [...document.querySelectorAll('span, div, a, button')].find(node => node.textContent?.trim() === text && node.offsetParent !== null);
  }

  function settingsCategory() {
    const heading = textNode('User Settings');
    return heading?.parentElement || null;
  }

  function settingsContentHost() {
    const overlay = document.querySelector('.settings_overlay');
    const sidebar = overlay?.querySelector('.settings_sidebar');
    if (!overlay || !sidebar) return null;
    return [...overlay.children].find(child => child !== sidebar) || null;
  }

  const rawUrl = path => RAW_ROOT + path.split('/').map(encodeURIComponent).join('/');
  const repoUrl = path => `https://github.com/${REPO}/blob/${BRANCH}/${path.split('/').map(encodeURIComponent).join('/')}`;

  function packageCard(pkg) {
    const card = document.createElement('div');
    card.className = 'siqoat-card';
    card.innerHTML = `<div class="siqoat-card-title"></div><div class="siqoat-card-copy"></div><div class="siqoat-card-meta"></div><div class="siqoat-card-actions"></div>`;
    card.querySelector('.siqoat-card-title').textContent = pkg.name;
    card.querySelector('.siqoat-card-copy').textContent = pkg.description || `Siqoat ${pkg.kind} package.`;
    card.querySelector('.siqoat-card-meta').textContent = `${pkg.folder}/ · ${pkg.entry.split('/').pop()}`;
    const actions = card.querySelector('.siqoat-card-actions');
    const install = document.createElement('a'); install.className = 'siqoat-card-button'; install.textContent = 'Install'; install.href = rawUrl(pkg.entry); install.target = '_blank'; install.rel = 'noopener';
    const source = document.createElement('a'); source.className = 'siqoat-card-button'; source.textContent = 'Source'; source.href = repoUrl(pkg.entry); source.target = '_blank'; source.rel = 'noopener';
    actions.append(install, source);
    return card;
  }

  async function loadPackages(panel) {
    const response = await fetch(TREE_API, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const tree = await response.json();
    const blobs = (tree.tree || []).filter(item => item.type === 'blob' && /^(themes|plugins)\//.test(item.path));
    const folders = new Map();
    blobs.forEach(file => { const parts = file.path.split('/'); if (parts.length >= 3) { const folder = parts.slice(0, 2).join('/'); if (!folders.has(folder)) folders.set(folder, []); folders.get(folder).push(file); } });
    const packages = [];
    for (const [folder, files] of folders) {
      const kind = folder.split('/')[0] === 'plugins' ? 'plugins' : 'themes';
      const manifestFile = files.find(file => file.path === `${folder}/manifest.json`);
      let manifest = {};
      if (manifestFile) { try { manifest = await fetch(rawUrl(manifestFile.path)).then(r => r.ok ? r.json() : ({})); } catch (_) {} }
      const scripts = files.filter(file => /\.(user|tm)?\.js$/i.test(file.path));
      const entryFile = files.find(file => file.path === `${folder}/index.user.js`) || files.find(file => file.path === `${folder}/main.user.js`) || scripts[0];
      if (!entryFile) continue;
      packages.push({ kind, folder, entry: manifest.entry ? `${folder}/${manifest.entry}` : entryFile.path, name: manifest.name || folder.split('/').pop(), description: manifest.description || '' });
    }
    for (const kind of ['themes', 'plugins']) {
      const view = panel.querySelector(`[data-view="${kind}"]`);
      const matches = packages.filter(pkg => pkg.kind === kind);
      view.replaceChildren();
      if (!matches.length) { const empty = document.createElement('div'); empty.className = 'siqoat-card-copy'; empty.textContent = `No ${kind} found in the repository yet.`; view.appendChild(empty); }
      else matches.forEach(pkg => view.appendChild(packageCard(pkg)));
    }
  }

  function panelMarkup() {
    const panel = document.createElement('section');
    panel.id = 'siqoat-settings-panel';
    panel.innerHTML = `<div class="siqoat-kicker">siqoat ✦</div><h1>Make Stoat yours</h1><p class="siqoat-subtitle">Soft themes, tiny comforts, and carefully chosen plugins. Everything is packaged in the Siqoat repository.</p><div class="siqoat-tabs"><button class="siqoat-tab" data-tab="themes" data-selected="true">Themes</button><button class="siqoat-tab" data-tab="plugins">Plugins</button></div><div data-view="themes"><div class="siqoat-card-copy">Loading themes…</div></div><div data-view="plugins" hidden><div class="siqoat-card-copy">Loading plugins…</div></div>`;
    panel.querySelectorAll('.siqoat-tab').forEach(tab => tab.addEventListener('click', () => { panel.querySelectorAll('.siqoat-tab').forEach(item => item.dataset.selected = String(item === tab)); panel.querySelectorAll('[data-view]').forEach(view => { view.hidden = view.dataset.view !== tab.dataset.tab; }); }));
    loadPackages(panel).catch(error => panel.querySelectorAll('[data-view]').forEach(view => { view.replaceChildren(Object.assign(document.createElement('div'), { className: 'siqoat-card-copy', textContent: `Could not load ${view.dataset.view}: ${error.message}` })); }));
    return panel;
  }

  function addSettingsEntry() {
    const category = settingsCategory();
    if (!category || category.querySelector('#siqoat-settings-entry')) return;
    const existing = [...category.querySelectorAll('a, button')].filter(node => node.textContent?.trim());
    const template = existing[existing.length - 1];
    if (!template) return;
    const entry = template.cloneNode(true);
    entry.id = 'siqoat-settings-entry';
    entry.dataset.active = 'false';
    const label = [...entry.querySelectorAll('*')].find(node => node.textContent?.trim() === template.textContent?.trim());
    if (label) label.textContent = 'Siqoat';
    else entry.textContent = 'Siqoat';
    entry.querySelectorAll('svg, img').forEach(icon => icon.remove());
    const glyph = Object.assign(document.createElement('span'), { className: 'siqoat-settings-glyph', textContent: '✦' });
    const iconSlot = entry.querySelector('div');
    if (iconSlot) iconSlot.prepend(glyph); else entry.prepend(glyph);
    entry.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation();
      const host = settingsContentHost();
      if (!host) return;
      document.querySelectorAll('#siqoat-settings-entry').forEach(node => node.dataset.active = 'false');
      entry.dataset.active = 'true';
      let panel = document.querySelector('#siqoat-settings-panel');
      if (!panel) { panel = panelMarkup(); host.appendChild(panel); }
      panel.dataset.open = 'true';
      [...host.children].forEach(child => { if (child !== panel) child.hidden = true; });
    });
    category.appendChild(entry);
  }

  function removeLegacyFloatingUi() {
    ['#siqoat-bubble', '#siqoat-popover', '#stoat-market-button', '#stoat-market-panel', '#stoat-script-market-button', '#stoat-script-market-panel'].forEach(selector => {
      document.querySelectorAll(selector).forEach(node => node.remove());
    });
  }

  const observer = new MutationObserver(() => {
    removeLegacyFloatingUi();
    addSettingsEntry();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  removeLegacyFloatingUi();
  addSettingsEntry();
})();
