// PromptVault Background Service Worker

const API_BASE = 'http://localhost:5000'; // Change to Render URL after deployment

// Listen for messages from content scripts / popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_TOKEN') {
    chrome.storage.local.get('pv_token', (data) => {
      sendResponse({ token: data.pv_token || null });
    });
    return true; // async
  }

  if (msg.type === 'SET_TOKEN') {
    chrome.storage.local.set({ pv_token: msg.token }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (msg.type === 'CLEAR_TOKEN') {
    chrome.storage.local.remove(['pv_token', 'pv_user'], () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (msg.type === 'FETCH_PROMPTS') {
    chrome.storage.local.get('pv_token', async (data) => {
      const token = data.pv_token;
      if (!token) {
        sendResponse({ error: 'not_authenticated' });
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/prompts?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          chrome.storage.local.remove(['pv_token', 'pv_user']);
          sendResponse({ error: 'not_authenticated' });
          return;
        }
        const json = await res.json();
        sendResponse({ prompts: json.prompts || [] });
      } catch (err) {
        sendResponse({ error: 'network_error', message: err.message });
      }
    });
    return true;
  }

  if (msg.type === 'SEARCH_PROMPTS') {
    chrome.storage.local.get('pv_token', async (data) => {
      const token = data.pv_token;
      if (!token) { sendResponse({ error: 'not_authenticated' }); return; }
      try {
        const url = `${API_BASE}/prompts/search?q=${encodeURIComponent(msg.q || '')}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        sendResponse({ prompts: json.prompts || [] });
      } catch (err) {
        sendResponse({ error: 'network_error' });
      }
    });
    return true;
  }

  if (msg.type === 'TRACK_USE') {
    chrome.storage.local.get('pv_token', async (data) => {
      const token = data.pv_token;
      if (!token) return;
      fetch(`${API_BASE}/prompts/${msg.promptId}/use`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    });
  }
});

console.log('[PromptVault] Service worker initialized');
