// PromptVault Content Script
// Injects floating button and prompt panel into AI websites

(function () {
  'use strict';

  if (document.getElementById('pv-fab')) return; // Prevent double injection

  // ——— State ———
  let isPanelOpen = false;
  let allPrompts = [];
  let activeInput = null;
  let searchTimeout = null;

  // ——— Track active input ———
  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (
      el.tagName === 'TEXTAREA' ||
      (el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'radio') ||
      el.contentEditable === 'true'
    ) {
      activeInput = el;
    }
  }, true);

  // ——— FAB Button ———
  const fab = document.createElement('button');
  fab.id = 'pv-fab';
  fab.title = 'PromptVault — Click to insert prompt';
  fab.innerHTML = '⚡';

  // ——— Panel ———
  const panel = document.createElement('div');
  panel.id = 'pv-panel';
  panel.style.display = 'none';

  panel.innerHTML = `
    <div class="pv-header">
      <div class="pv-logo">
        <div class="pv-logo-icon">⚡</div>
        PromptVault
      </div>
      <button class="pv-close-btn" id="pv-close">✕</button>
    </div>
    <div class="pv-search-wrap">
      <input type="text" class="pv-search" id="pv-search" placeholder="Search prompts..." />
    </div>
    <div class="pv-list" id="pv-list">
      <div class="pv-loading">⏳ Loading prompts...</div>
    </div>
    <div class="pv-footer">
      <span class="pv-footer-text" id="pv-footer-text">PromptVault</span>
      <a href="http://localhost:5173" target="_blank" class="pv-open-btn">Open App ↗</a>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  // ——— Toggle panel ———
  fab.addEventListener('click', () => {
    isPanelOpen = !isPanelOpen;
    panel.style.display = isPanelOpen ? 'flex' : 'none';
    if (isPanelOpen) {
      loadPrompts();
      document.getElementById('pv-search').focus();
    }
  });

  document.getElementById('pv-close').addEventListener('click', () => {
    isPanelOpen = false;
    panel.style.display = 'none';
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (isPanelOpen && !panel.contains(e.target) && e.target !== fab) {
      isPanelOpen = false;
      panel.style.display = 'none';
    }
  });

  // ——— Search ———
  document.getElementById('pv-search').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const q = e.target.value.trim();
    if (!q) {
      renderPrompts(allPrompts);
      return;
    }
    searchTimeout = setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'SEARCH_PROMPTS', q }, (res) => {
        if (res?.prompts) renderPrompts(res.prompts);
      });
    }, 300);
  });

  // ——— Load prompts ———
  function loadPrompts() {
    const list = document.getElementById('pv-list');
    list.innerHTML = '<div class="pv-loading">⏳ Loading...</div>';

    chrome.runtime.sendMessage({ type: 'FETCH_PROMPTS' }, (res) => {
      if (chrome.runtime.lastError) {
        list.innerHTML = '<div class="pv-error">❌ Extension error. Reload page.</div>';
        return;
      }
      if (res?.error === 'not_authenticated') {
        list.innerHTML = '<div class="pv-empty"><div class="pv-empty-icon">🔐</div>Sign in to PromptVault first,<br/>then reload this page.</div>';
        return;
      }
      if (res?.error) {
        list.innerHTML = `<div class="pv-error">❌ ${res.message || 'Cannot connect to server'}</div>`;
        return;
      }
      allPrompts = res.prompts || [];
      renderPrompts(allPrompts);
    });
  }

  // ——— Render prompts list ———
  function renderPrompts(prompts) {
    const list = document.getElementById('pv-list');
    const footer = document.getElementById('pv-footer-text');
    footer.textContent = `${prompts.length} prompt${prompts.length !== 1 ? 's' : ''}`;

    if (!prompts.length) {
      list.innerHTML = '<div class="pv-empty"><div class="pv-empty-icon">📭</div>No prompts found</div>';
      return;
    }

    list.innerHTML = '';
    prompts.forEach((prompt) => {
      const item = document.createElement('div');
      item.className = 'pv-item';
      item.innerHTML = `
        <div class="pv-item-title">${escapeHtml(prompt.title)}</div>
        <div class="pv-item-preview">${escapeHtml(prompt.content.slice(0, 80))}${prompt.content.length > 80 ? '…' : ''}</div>
        <span class="pv-item-cat">${escapeHtml(prompt.category)}</span>
      `;
      item.addEventListener('click', () => insertPrompt(prompt));
      list.appendChild(item);
    });
  }

  // ——— Insert prompt into active field ———
  function insertPrompt(prompt) {
    const target = findBestInput();
    if (!target) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(prompt.content).then(() => {
        showToast('Copied to clipboard! (No input detected)');
      });
      closePanel();
      return;
    }

    if (target.contentEditable === 'true') {
      // ContentEditable (ChatGPT, Claude)
      target.focus();
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);
      const textNode = document.createTextNode(prompt.content);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // textarea / input
      target.focus();
      const start = target.selectionStart || target.value.length;
      const before = target.value.slice(0, start);
      const after = target.value.slice(target.selectionEnd || start);
      target.value = before + prompt.content + after;
      // Trigger React synthetic event
      const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
        || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeInputSetter) nativeInputSetter.call(target, target.value);
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
      const newPos = start + prompt.content.length;
      target.setSelectionRange(newPos, newPos);
    }

    // Track usage
    chrome.runtime.sendMessage({ type: 'TRACK_USE', promptId: prompt._id });
    closePanel();
    showToast(`✅ Inserted: "${prompt.title}"`);
  }

  // ——— Find best input on page ———
  function findBestInput() {
    if (activeInput && document.body.contains(activeInput)) return activeInput;

    // Common selectors for AI platforms
    const selectors = [
      'textarea#prompt-textarea',          // ChatGPT
      'div[contenteditable="true"]',        // Claude, Gemini
      'textarea[data-id="root"]',           // ChatGPT old
      'textarea',
      'input[type="text"]',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function closePanel() {
    isPanelOpen = false;
    panel.style.display = 'none';
  }

  // ——— Toast notification ———
  function showToast(message) {
    const existing = document.getElementById('pv-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'pv-toast';
    toast.style.cssText = `
      position: fixed; bottom: 90px; right: 28px; z-index: 2147483647;
      background: #18181b; color: #fff; padding: 10px 16px;
      border-radius: 10px; font-size: 13px; font-family: Inter, system-ui;
      font-weight: 500; box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      animation: pvFadeIn 0.2s ease; max-width: 280px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  console.log('[PromptVault] Content script loaded');
})();
