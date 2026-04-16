const API = 'http://localhost:8080';

// ── TOKEN HELPERS ──────────────────────────────────────────────
function getToken()        { return localStorage.getItem('qm_token'); }
function getUser()         { return localStorage.getItem('qm_user'); }
function setAuth(token, u) { localStorage.setItem('qm_token', token); localStorage.setItem('qm_user', u); }
function clearAuth()       { localStorage.removeItem('qm_token'); localStorage.removeItem('qm_user'); }
function isLoggedIn()      { return !!getToken(); }

function requireAuth() {
  if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
  return true;
}

// ── API FETCH ──────────────────────────────────────────────────
async function apiFetch(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (getToken()) headers['Authorization'] = 'Bearer ' + getToken();
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(API + path, opts);
    if (res.status === 401) { clearAuth(); window.location.href = 'login.html'; return null; }
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || 'Request failed');
    return data;
  } catch (e) {
    throw e;
  }
}

// ── TOAST ──────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  const icons = { success: '✓', error: '✕', info: 'i' };
  const colors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--accent2)' };
  t.className = 'toast ' + type;
  t.innerHTML = `<span style="color:${colors[type]};font-weight:600;font-size:1rem">${icons[type]}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateY(10px)'; t.style.transition='.2s'; setTimeout(()=>t.remove(),200); }, 3000);
}

// ── NAV RENDER ─────────────────────────────────────────────────
function renderNav(activePage) {
  const loggedIn = isLoggedIn();
  const user = getUser() || '';
  return `
  <nav>
    <a class="nav-logo" href="${loggedIn ? 'index.html' : 'login.html'}">
      Quan<span>ment</span>
    </a>
    <div class="nav-links">
      ${loggedIn ? `
        <a href="index.html" class="${activePage==='home'?'active':''}">Home</a>
        <a href="history.html" class="${activePage==='history'?'active':''}">History</a>
      ` : ''}
    </div>
    <div class="nav-user">
      ${loggedIn ? `
        <div class="nav-avatar" title="${user}">${user.charAt(0).toUpperCase()}</div>
        <button class="btn btn-ghost btn-sm" onclick="logout()">Sign out</button>
      ` : `
        <a href="login.html" class="btn btn-ghost btn-sm">Sign in</a>
        <a href="register.html" class="btn btn-primary btn-sm">Register</a>
      `}
    </div>
  </nav>`;
}

function logout() {
  clearAuth();
  toast('Signed out successfully', 'info');
  setTimeout(() => window.location.href = 'login.html', 600);
}

// ── HISTORY ────────────────────────────────────────────────────
function addToHistory(entry) {
  const history = getHistory();
  history.unshift({ ...entry, id: Date.now(), time: new Date().toISOString() });
  localStorage.setItem('qm_history', JSON.stringify(history.slice(0, 100)));
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem('qm_history') || '[]'); } catch { return []; }
}

function clearHistory() {
  localStorage.removeItem('qm_history');
}

// ── UNITS MAP ──────────────────────────────────────────────────
const UNITS = {
  length:      ['INCHES','FEET','YARDS','CENTIMETERS'],
  weight:      ['MILLIGRAM','GRAM','KILOGRAM','POUND','TONNE'],
  volume:      ['MILLILITRE','LITRE','GALLON'],
  temperature: ['CELSIUS','FAHRENHEIT','KELVIN']
};

const TYPE_META = {
  length:      { icon: '📏', label: 'Length' },
  weight:      { icon: '⚖️', label: 'Weight' },
  volume:      { icon: '🧪', label: 'Volume' },
  temperature: { icon: '🌡️', label: 'Temperature' }
};

function buildSelect(id, units, selectedIndex = 0) {
  return `<select class="form-select" id="${id}">
    ${units.map((u,i) => `<option value="${u}" ${i===selectedIndex?'selected':''}>${u.charAt(0)+u.slice(1).toLowerCase()}</option>`).join('')}
  </select>`;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
