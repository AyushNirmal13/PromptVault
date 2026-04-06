const API_BASE = 'http://localhost:5000';

const contentEl = document.getElementById('pv-content');

function renderLoggedIn(user, prompts) {
  contentEl.innerHTML = `
    <div class="status-box">
      <img class="avatar" src="${user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}" alt="${user.name}" />
      <div>
        <p class="user-name">${user.name}</p>
        <p class="user-email">${user.email}</p>
      </div>
      <div class="stat-row">
        <div class="stat">
          <div class="stat-num">${prompts.length}</div>
          <div class="stat-label">Prompts</div>
        </div>
        <div class="stat">
          <div class="stat-num">${prompts.filter(p => p.isFavorite).length}</div>
          <div class="stat-label">Favorites</div>
        </div>
        <div class="stat">
          <div class="stat-num">${[...new Set(prompts.map(p => p.category))].length}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>
    </div>
    <button class="btn btn-secondary" id="logout-btn">Sign Out</button>
  `;

  document.getElementById('logout-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_TOKEN' }, () => {
      renderNotLoggedIn();
    });
  });
}

function renderNotLoggedIn() {
  contentEl.innerHTML = `
    <div class="not-logged">
      <div class="icon">🔐</div>
      <p>Sign in to PromptVault to use your prompts on AI websites.</p>
      <div class="badge-row">
        <span class="badge">ChatGPT</span>
        <span class="badge">Gemini</span>
        <span class="badge">Claude</span>
      </div>
    </div>
    <button class="btn btn-primary" id="signin-btn">Open PromptVault to Sign In</button>
  `;

  document.getElementById('signin-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_BASE.replace(':5000', ':5173')}/login` });
  });
}

function renderError(message) {
  contentEl.innerHTML = `
    <div class="not-logged">
      <div class="icon">❌</div>
      <p>${message || 'Something went wrong. Make sure the server is running.'}</p>
    </div>
  `;
}

// Load state
chrome.runtime.sendMessage({ type: 'GET_TOKEN' }, async (res) => {
  const token = res?.token;
  if (!token) {
    renderNotLoggedIn();
    return;
  }

  try {
    const [userRes, promptsRes] = await Promise.all([
      fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/prompts?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (userRes.status === 401) {
      chrome.runtime.sendMessage({ type: 'CLEAR_TOKEN' });
      renderNotLoggedIn();
      return;
    }

    const { user } = await userRes.json();
    const { prompts = [] } = await promptsRes.json();

    // Save user info for display
    chrome.storage.local.set({ pv_user: user });
    renderLoggedIn(user, prompts);
  } catch (err) {
    renderError('Cannot reach server. Is it running?');
  }
});

// Update open-app link to correct URL
document.getElementById('open-app')?.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
});
