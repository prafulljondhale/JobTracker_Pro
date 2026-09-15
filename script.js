/* ============================================================
   Job Application Tracker — script.js
   Fully client-side, localStorage-backed
   ============================================================ */

const THEME_KEY = 'jobTrackerTheme';
const FILTER_KEY = 'jobTrackerDashFilter';
const USERS_KEY = 'jobTrackerUsers_v2';
const DATA_PREFIX = 'jobTrackerData_v2_';
const SESSION_KEY = 'jobTrackerSession_v2';
const OLD_APPS_KEY = 'jobTrackerApps_v1';
const OLD_CREDS_KEY = 'jobTrackerCreds_v1';
const NOTIF_READ_PREFIX = 'jobTrackerNotifRead_';
const RESET_TOKENS_KEY = 'jobTrackerResetTokens_v2';
const RESET_RATE_KEY = 'jobTrackerResetRate_v2';
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const RESET_RATE_LIMIT = 3;
const RESET_RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const DEMO_ADMIN = {
  id: 'user_admin',
  username: 'admin',
  password: 'admin123',
  fullName: 'Admin',
  email: 'admin@local'
};

// ---------- Seed data from Excel (migrated to admin on first run) ----------
const SEED_DATA = [
  {
    id: 'SAMPLE-001',
    applicationDate: '2026-08-01',
    company: 'Google',
    jobTitle: 'Senior Product Manager',
    location: 'Bengaluru, IN',
    workMode: 'Hybrid',
    hrName: 'Ananya Rao',
    hrPhone: '9876500001',
    hrEmail: 'ananya.rao@google-example.com',
    source: 'LinkedIn',
    status: 'Final Round',
    interviewRound: 'Final Round',
    interviewDate: '2026-09-18',
    interviewTime: '15:00',
    salary: '3500000',
    followUpDate: '2026-09-20',
    followUpStatus: 'Due',
    offerStatus: 'Pending',
    notes: 'Great culture fit; panel mentioned quick turnaround.'
  },
  {
    id: 'SAMPLE-002',
    applicationDate: '2026-08-03',
    company: 'Microsoft',
    jobTitle: 'Program Manager II',
    location: 'Hyderabad, IN',
    workMode: 'On-site',
    hrName: 'Rohit Sharma',
    hrPhone: '9876500002',
    hrEmail: 'rohit.sharma@microsoft-example.com',
    source: 'Naukri',
    status: 'Technical Round',
    interviewRound: 'Technical Round',
    interviewDate: '2026-09-16',
    interviewTime: '11:30',
    salary: '3200000',
    followUpDate: '2026-09-17',
    followUpStatus: 'Due',
    offerStatus: 'Pending',
    notes: '2nd interviewer focused on system design.'
  },
  {
    id: 'SAMPLE-003',
    applicationDate: '2026-07-20',
    company: 'Amazon',
    jobTitle: 'Senior Product Manager - Tech',
    location: 'Pune, IN',
    workMode: 'Hybrid',
    hrName: 'Kavya Menon',
    hrPhone: '9876500003',
    hrEmail: 'kavya.menon@amazon-example.com',
    source: 'Company Website',
    status: 'Interviewing',
    interviewRound: 'Managerial Round',
    interviewDate: '2026-09-22',
    interviewTime: '10:00',
    salary: '3300000',
    followUpDate: '2026-09-19',
    followUpStatus: 'Due',
    offerStatus: 'Pending',
    notes: 'Awaiting bar-raiser round scheduling.'
  },
  {
    id: 'SAMPLE-004',
    applicationDate: '2026-07-15',
    company: 'TCS',
    jobTitle: 'IT Project Manager',
    location: 'Mumbai, IN',
    workMode: 'On-site',
    hrName: 'Suresh Iyer',
    hrPhone: '9876500004',
    hrEmail: 'suresh.iyer@tcs-example.com',
    source: 'Referral',
    status: 'Offer Received',
    interviewRound: 'Completed',
    interviewDate: '2026-08-25',
    interviewTime: '09:00',
    salary: '1800000',
    followUpDate: '2026-09-15',
    followUpStatus: 'Due',
    offerStatus: 'Received',
    notes: 'Offer letter received; awaiting final negotiation.'
  },
  {
    id: 'SAMPLE-005',
    applicationDate: '2026-07-05',
    company: 'Infosys',
    jobTitle: 'Delivery Manager',
    location: 'Chennai, IN',
    workMode: 'Hybrid',
    hrName: 'Priya Nair',
    hrPhone: '9876500005',
    hrEmail: 'priya.nair@infosys-example.com',
    source: 'Indeed',
    status: 'Rejected',
    interviewRound: 'Completed',
    interviewDate: '2026-08-05',
    interviewTime: '14:00',
    salary: '1900000',
    followUpDate: '',
    followUpStatus: 'No Response Needed',
    offerStatus: 'Not Applicable',
    notes: 'Role went to an internal candidate.'
  },
  {
    id: 'SAMPLE-006',
    applicationDate: '2026-08-10',
    company: 'Flipkart',
    jobTitle: 'Category Manager',
    location: 'Bengaluru, IN',
    workMode: 'Remote',
    hrName: 'Vikram Desai',
    hrPhone: '9876500006',
    hrEmail: 'vikram.desai@flipkart-example.com',
    source: 'LinkedIn',
    status: 'On Hold',
    interviewRound: 'Completed',
    interviewDate: '',
    interviewTime: '',
    salary: '2600000',
    followUpDate: '2026-09-25',
    followUpStatus: 'Not Due',
    offerStatus: 'Not Applicable',
    notes: 'Hiring paused for budget approval.'
  },
  {
    id: 'SAMPLE-007',
    applicationDate: '2026-08-18',
    company: 'Accenture',
    jobTitle: 'Associate Director - Strategy',
    location: 'Gurugram, IN',
    workMode: 'Hybrid',
    hrName: 'Meera Pillai',
    hrPhone: '9876500007',
    hrEmail: 'meera.pillai@accenture-example.com',
    source: 'Consultancy',
    status: 'Interviewing',
    interviewRound: 'Not Started',
    interviewDate: '',
    interviewTime: '',
    salary: '3600000',
    followUpDate: '2026-09-16',
    followUpStatus: 'Due',
    offerStatus: 'Not Applicable',
    notes: 'Recruiter to confirm screening call.'
  },
  {
    id: 'SAMPLE-008',
    applicationDate: '2026-08-22',
    company: 'Wipro',
    jobTitle: 'Engagement Manager',
    location: 'Pune, IN',
    workMode: 'On-site',
    hrName: 'Arjun Kapoor',
    hrPhone: '9876500008',
    hrEmail: 'arjun.kapoor@wipro-example.com',
    source: 'Company Website',
    status: 'Withdrawn',
    interviewRound: '1st Round',
    interviewDate: '',
    interviewTime: '',
    salary: '2100000',
    followUpDate: '',
    followUpStatus: 'No Response Needed',
    offerStatus: 'Not Applicable',
    notes: 'Withdrew -- accepted another offer.'
  },
  {
    id: 'SAMPLE-009',
    applicationDate: '2026-09-01',
    company: 'Netflix',
    jobTitle: 'Senior Manager, Content Ops',
    location: 'Mumbai, IN',
    workMode: 'Remote',
    hrName: 'Diya Kulkarni',
    hrPhone: '9876500009',
    hrEmail: 'diya.kulkarni@netflix-example.com',
    source: 'Referral',
    status: 'Applied',
    interviewRound: 'Not Started',
    interviewDate: '',
    interviewTime: '',
    salary: '4000000',
    followUpDate: '2026-09-14',
    followUpStatus: 'Overdue',
    offerStatus: 'Not Applicable',
    notes: 'Follow up with referrer this week.'
  },
  {
    id: 'SAMPLE-010',
    applicationDate: '2026-06-10',
    company: 'Deloitte',
    jobTitle: 'Manager - Consulting',
    location: 'Delhi, IN',
    workMode: 'Hybrid',
    hrName: 'Karan Malhotra',
    hrPhone: '9876500010',
    hrEmail: 'karan.malhotra@deloitte-example.com',
    source: 'Naukri',
    status: 'Accepted',
    interviewRound: 'Completed',
    interviewDate: '2026-07-01',
    interviewTime: '10:00',
    salary: '2000000',
    followUpDate: '',
    followUpStatus: 'Completed',
    offerStatus: 'Not Applicable',
    notes: 'Joined -- closed successfully.'
  }
];

// ---------- State ----------
let applications = [];
let charts = {};
let dashFilter = null;
let confirmCallback = null;
let currentUser = null; // { id, username, fullName, email }
let _appInitialized = false;

// ---------- Multi-user storage layer ----------
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function dataKey(userId) {
  return DATA_PREFIX + userId;
}

function getUserData(userId) {
  try {
    const raw = localStorage.getItem(dataKey(userId));
    if (!raw) return { applications: [] };
    const parsed = JSON.parse(raw);
    return { applications: Array.isArray(parsed.applications) ? parsed.applications : [] };
  } catch {
    return { applications: [] };
  }
}

function saveUserData(userId, data) {
  localStorage.setItem(dataKey(userId), JSON.stringify({
    applications: data.applications || []
  }));
}

function findUserByUsername(username) {
  const u = (username || '').trim().toLowerCase();
  return getUsers().find(x => x.username.toLowerCase() === u) || null;
}

function generateUserId() {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function migrateLegacyData() {
  let users = getUsers();
  if (!users.length) {
    users = [{ ...DEMO_ADMIN }];
    saveUsers(users);
    // Prefer old single-user apps if present, else seed data
    let apps = null;
    const oldApps = localStorage.getItem(OLD_APPS_KEY);
    if (oldApps) {
      try { apps = JSON.parse(oldApps); } catch { apps = null; }
    }
    if (!Array.isArray(apps) || !apps.length) apps = [...SEED_DATA];
    saveUserData(DEMO_ADMIN.id, { applications: apps });
    // Clean old single-user keys after migration
    localStorage.removeItem(OLD_APPS_KEY);
    localStorage.removeItem(OLD_CREDS_KEY);
  }
}

function getSession() {
  try {
    const s = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function setSession(user, remember) {
  const payload = JSON.stringify({
    id: user.id,
    username: user.username,
    fullName: user.fullName || user.username,
    email: user.email || ''
  });
  sessionStorage.setItem(SESSION_KEY, payload);
  if (remember) {
    localStorage.setItem(SESSION_KEY, payload);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
}

function isLoggedIn() {
  const s = getSession();
  if (!s || !s.id) return false;
  const user = getUsers().find(u => u.id === s.id);
  return !!user;
}

function restoreCurrentUser() {
  const s = getSession();
  if (!s) { currentUser = null; return false; }
  const user = getUsers().find(u => u.id === s.id);
  if (!user) { clearSession(); return false; }
  currentUser = {
    id: user.id,
    username: user.username,
    fullName: user.fullName || user.username,
    email: user.email || ''
  };
  return true;
}

function loadApplications() {
  if (!currentUser) { applications = []; return; }
  const data = getUserData(currentUser.id);
  applications = data.applications || [];
}

function saveApplications() {
  if (!currentUser) return;
  saveUserData(currentUser.id, { applications });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  migrateLegacyData();
  setupAuthUI();
  if (restoreCurrentUser()) {
    showApp();
  } else {
    showLogin();
  }
});

function initApp() {
  loadApplications();
  if (!_appInitialized) {
    setupNav();
    setupSearch();
    setupForm();
    setupImport();
    setupCredentialsForm();
    setupNotificationsUI();
    setupExportMenu();
    setupHeaderTheme();
    setupUserMenu();
    _appInitialized = true;
  }
  updateCurrentDate();
  updateUserHeader();
  renderAll();
}

function showAuthCard(id) {
  ['signInView', 'registerView', 'forgotView', 'forgotSentView', 'resetView', 'resetSuccessView'].forEach(cid => {
    const el = document.getElementById(cid);
    if (el) el.hidden = (cid !== id);
  });
}

function showLogin() {
  const overlay = document.getElementById('loginOverlay');
  const app = document.getElementById('appContainer');
  if (overlay) overlay.hidden = false;
  if (app) app.hidden = true;
  showAuthCard('signInView');
  const pw = document.getElementById('loginPassword');
  if (pw) pw.value = '';
  const err = document.getElementById('loginError');
  if (err) { err.hidden = true; err.textContent = ''; }
}

function showApp() {
  if (!restoreCurrentUser()) {
    showLogin();
    return;
  }
  const overlay = document.getElementById('loginOverlay');
  const app = document.getElementById('appContainer');
  if (overlay) overlay.hidden = true;
  if (app) app.hidden = false;
  initApp();
}

function updateUserHeader() {
  if (!currentUser) return;
  const name = currentUser.fullName || currentUser.username || 'User';
  const initials = name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const av = document.getElementById('userAvatar');
  const dn = document.getElementById('userDisplayName');
  if (av) av.textContent = initials;
  if (dn) dn.textContent = name;
}

function setupUserMenu() {
  const btn = document.getElementById('userMenuBtn');
  const menu = document.getElementById('userMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) {
      menu.hidden = true;
    }
  });
  document.getElementById('userMenuLogout')?.addEventListener('click', () => doLogout());
}

function closeUserMenu() {
  const menu = document.getElementById('userMenu');
  if (menu) menu.hidden = true;
}

function doLogout() {
  clearSession();
  applications = [];
  dashFilter = null;
  Object.keys(charts).forEach(k => { try { charts[k]?.destroy(); } catch (_) {} charts[k] = null; });
  closeUserMenu();
  showLogin();
  toast('Logged out');
}

function bindTogglePassword(btnId, inputId) {
  document.getElementById(btnId)?.addEventListener('click', () => {
    const input = document.getElementById(inputId);
    const icon = document.querySelector('#' + btnId + ' i');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.className = 'fas fa-eye-slash';
      document.getElementById(btnId)?.setAttribute('aria-label', 'Hide password');
    } else {
      input.type = 'password';
      if (icon) icon.className = 'fas fa-eye';
      document.getElementById(btnId)?.setAttribute('aria-label', 'Show password');
    }
  });
}

function setupAuthUI() {
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin();
  });
  document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleRegister();
  });
  bindTogglePassword('togglePassword', 'loginPassword');
  bindTogglePassword('toggleRegPassword', 'regPassword');
  bindTogglePassword('toggleRegConfirm', 'regConfirm');
  bindTogglePassword('toggleResetPassword', 'resetPassword');
  bindTogglePassword('toggleResetConfirm', 'resetConfirm');

  document.getElementById('showRegister')?.addEventListener('click', () => showAuthCard('registerView'));
  document.getElementById('showSignIn')?.addEventListener('click', () => showAuthCard('signInView'));
  document.getElementById('forgotBtn')?.addEventListener('click', () => {
    showAuthCard('forgotView');
    const fe = document.getElementById('forgotEmail');
    if (fe) fe.value = '';
    const err = document.getElementById('forgotEmailErr');
    if (err) err.textContent = '';
  });
  document.getElementById('forgotBackSignIn')?.addEventListener('click', () => showAuthCard('signInView'));
  document.getElementById('forgotSentBack')?.addEventListener('click', () => showAuthCard('signInView'));
  document.getElementById('resetBackSignIn')?.addEventListener('click', () => showAuthCard('signInView'));
  document.getElementById('resetSuccessSignIn')?.addEventListener('click', () => showAuthCard('signInView'));
  document.getElementById('logoutBtn')?.addEventListener('click', () => doLogout());
  document.getElementById('regPassword')?.addEventListener('input', updatePasswordStrength);
  document.getElementById('resetPassword')?.addEventListener('input', () => updatePasswordStrengthField('resetPassword', 'resetPwdStrength', 'resetPwdBarFill', 'resetPwdLabel'));

  document.getElementById('forgotForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleForgotPassword();
  });
  document.getElementById('resetForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleResetPassword();
  });
  // Support deep-link style reset via URL hash: #reset=TOKEN (legacy token flow)
  const hash = (location.hash || '').replace(/^#/, '');
  if (hash.startsWith('reset=')) {
    const token = decodeURIComponent(hash.slice(6));
    if (token) {
      showLogin();
      openResetWithToken(token);
      history.replaceState(null, '', location.pathname + location.search);
    }
  }
}

function updatePasswordStrength() {
  updatePasswordStrengthField('regPassword', 'pwdStrength', 'pwdBarFill', 'pwdLabel');
}

function updatePasswordStrengthField(inputId, wrapId, barId, labelId) {
  const pwd = document.getElementById(inputId)?.value || '';
  const wrap = document.getElementById(wrapId);
  const bar = document.getElementById(barId);
  const label = document.getElementById(labelId);
  if (!wrap || !bar || !label) return;
  if (!pwd) { wrap.hidden = true; return; }
  wrap.hidden = false;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  const levels = [
    { w: '25%', c: '#ef4444', t: 'Weak' },
    { w: '50%', c: '#f59e0b', t: 'Fair' },
    { w: '75%', c: '#3b82f6', t: 'Good' },
    { w: '100%', c: '#10b981', t: 'Strong' }
  ];
  const idx = Math.min(Math.max(score - 1, 0), 3);
  const L = levels[idx];
  bar.style.width = L.w;
  bar.style.background = L.c;
  label.textContent = L.t;
  label.style.color = L.c;
}

/* ---------- Password reset service (local/offline + future backend-ready) ---------- */
function getResetTokens() {
  try { return JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '[]'); }
  catch { return []; }
}
function saveResetTokens(list) {
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(list));
}

function getResetRateMap() {
  try { return JSON.parse(localStorage.getItem(RESET_RATE_KEY) || '{}'); }
  catch { return {}; }
}
function saveResetRateMap(map) {
  localStorage.setItem(RESET_RATE_KEY, JSON.stringify(map));
}

function generateSecureToken() {
  const bytes = new Uint8Array(32);
  if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function hashToken(token) {
  if (window.crypto && crypto.subtle) {
    const data = new TextEncoder().encode(token);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback (not cryptographic) for very old browsers
  let h = 0;
  for (let i = 0; i < token.length; i++) h = ((h << 5) - h) + token.charCodeAt(i) | 0;
  return 'fb_' + Math.abs(h).toString(16) + '_' + token.length;
}

function findUserByEmail(email) {
  const e = (email || '').trim().toLowerCase();
  return getUsers().find(u => (u.email || '').toLowerCase() === e) || null;
}

function isRateLimited(email) {
  const key = (email || '').trim().toLowerCase();
  const map = getResetRateMap();
  const now = Date.now();
  const entries = (map[key] || []).filter(t => now - t < RESET_RATE_WINDOW_MS);
  map[key] = entries;
  saveResetRateMap(map);
  return entries.length >= RESET_RATE_LIMIT;
}

function recordResetRequest(email) {
  const key = (email || '').trim().toLowerCase();
  const map = getResetRateMap();
  const now = Date.now();
  const entries = (map[key] || []).filter(t => now - t < RESET_RATE_WINDOW_MS);
  entries.push(now);
  map[key] = entries;
  saveResetRateMap(map);
}

/**
 * Email service config
 * Pure browser apps cannot use Gmail SMTP without exposing credentials.
 * From-address intended for production: jobtrackerp@gmail.com
 *
 * Offline (default): show username + password after email match.
 * Optional EmailJS: fill EMAIL_CONFIG and load EmailJS SDK.
 * Production: use a backend endpoint that sends mail server-side.
 */
const EMAIL_CONFIG = {
  fromAddress: 'jobtrackerp@gmail.com',
  emailjsPublicKey: '',
  emailjsServiceId: '',
  emailjsTemplateId: ''
};

function isEmailJsConfigured() {
  return !!(EMAIL_CONFIG.emailjsPublicKey && EMAIL_CONFIG.emailjsServiceId && EMAIL_CONFIG.emailjsTemplateId && window.emailjs);
}

async function sendLoginDetailsEmail(user) {
  if (!isEmailJsConfigured()) {
    return { sent: false, reason: 'not_configured' };
  }
  try {
    await window.emailjs.send(
      EMAIL_CONFIG.emailjsServiceId,
      EMAIL_CONFIG.emailjsTemplateId,
      {
        to_email: user.email,
        username: user.username,
        password: user.password,
        from_name: 'JobTracker Pro',
        from_email: EMAIL_CONFIG.fromAddress
      },
      EMAIL_CONFIG.emailjsPublicKey
    );
    return { sent: true };
  } catch (err) {
    console.warn('Email send failed:', err);
    return { sent: false, reason: 'send_failed' };
  }
}

async function requestLoginDetails(email) {
  const normalized = (email || '').trim().toLowerCase();
  if (isRateLimited(normalized)) {
    return { ok: false, rateLimited: true };
  }
  recordResetRequest(normalized);

  const user = findUserByEmail(normalized);
  if (!user) {
    return { ok: true, userFound: false };
  }

  const mail = await sendLoginDetailsEmail(user);
  return {
    ok: true,
    userFound: true,
    username: user.username,
    password: user.password,
    email: user.email,
    emailSent: mail.sent,
    emailReason: mail.reason || null
  };
}

async function validateResetToken(token) {
  if (!token) return { valid: false, reason: 'missing' };
  const tokenHash = await hashToken(token);
  const tokens = getResetTokens();
  const entry = tokens.find(t => t.tokenHash === tokenHash);
  if (!entry) return { valid: false, reason: 'invalid' };
  if (entry.usedAt) return { valid: false, reason: 'used' };
  if (Date.now() > entry.expiresAt) return { valid: false, reason: 'expired' };
  const user = getUsers().find(u => u.id === entry.userId);
  if (!user) return { valid: false, reason: 'invalid' };
  return { valid: true, entry, user };
}

async function consumeResetToken(token, newPassword) {
  const result = await validateResetToken(token);
  if (!result.valid) return result;
  const users = getUsers();
  const idx = users.findIndex(u => u.id === result.user.id);
  if (idx < 0) return { valid: false, reason: 'invalid' };
  users[idx].password = newPassword;
  saveUsers(users);
  const tokens = getResetTokens();
  const tIdx = tokens.findIndex(t => t.tokenHash === result.entry.tokenHash);
  if (tIdx >= 0) {
    tokens[tIdx].usedAt = Date.now();
    saveResetTokens(tokens);
  }
  return { valid: true, user: users[idx] };
}

function handleForgotPassword() {
  const email = (document.getElementById('forgotEmail')?.value || '').trim();
  const errEl = document.getElementById('forgotEmailErr');
  const boxErr = document.getElementById('forgotError');
  const btn = document.getElementById('forgotSubmitBtn');
  if (errEl) errEl.textContent = '';
  if (boxErr) { boxErr.hidden = true; boxErr.textContent = ''; }

  if (!email) {
    if (errEl) errEl.textContent = 'Please enter your email address.';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (errEl) errEl.textContent = 'Please enter a valid email address.';
    return;
  }

  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'; }

  requestLoginDetails(email).then(res => {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Login Details'; }

    if (res.rateLimited) {
      if (boxErr) {
        boxErr.textContent = 'Please wait before requesting login details again.';
        boxErr.hidden = false;
      }
      return;
    }

    showAuthCard('forgotSentView');
    const title = document.getElementById('forgotSentTitle');
    const msg = document.getElementById('forgotSentMsg');
    const credsBox = document.getElementById('credsRecoveryBox');
    const notFound = document.getElementById('forgotNotFoundBox');
    const note = document.getElementById('emailSendNote');

    if (!res.userFound) {
      if (title) title.textContent = 'No account found';
      if (msg) msg.textContent = 'We could not find an account with that email address.';
      if (credsBox) credsBox.hidden = true;
      if (notFound) notFound.hidden = false;
      return;
    }

    if (notFound) notFound.hidden = true;
    if (title) title.textContent = 'Login details';
    if (msg) {
      msg.textContent = res.emailSent
        ? 'Your login details have been sent to your email.'
        : 'Your login credentials are shown below.';
    }
    if (credsBox) credsBox.hidden = false;
    const uEl = document.getElementById('recoveredUsername');
    const pEl = document.getElementById('recoveredPassword');
    if (uEl) uEl.textContent = res.username || '—';
    if (pEl) pEl.textContent = res.password || '—';
    if (note) {
      if (res.emailSent) {
        note.textContent = 'An email was also sent from ' + EMAIL_CONFIG.fromAddress + ' to ' + res.email + '.';
      } else {
        note.textContent = 'Offline mode: email cannot be sent from the browser. For real email from ' + EMAIL_CONFIG.fromAddress + ', configure EmailJS or a backend mail service.';
      }
    }
  }).catch(() => {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Login Details'; }
    if (boxErr) {
      boxErr.textContent = 'Something went wrong. Please try again.';
      boxErr.hidden = false;
    }
  });
}

async function openResetWithToken(token) {
  const result = await validateResetToken(token);
  if (!result.valid) {
    showAuthCard('forgotView');
    const boxErr = document.getElementById('forgotError');
    if (boxErr) {
      if (result.reason === 'used') {
        boxErr.textContent = 'This password reset link has already been used. Please request a new one.';
      } else {
        boxErr.textContent = 'This password reset link is invalid or has expired.';
      }
      boxErr.hidden = false;
    }
    return;
  }
  document.getElementById('resetToken').value = token;
  document.getElementById('resetPassword').value = '';
  document.getElementById('resetConfirm').value = '';
  document.getElementById('resetPassErr').textContent = '';
  document.getElementById('resetConfirmErr').textContent = '';
  const re = document.getElementById('resetError');
  if (re) { re.hidden = true; re.textContent = ''; }
  showAuthCard('resetView');
}

async function handleResetPassword() {
  const token = document.getElementById('resetToken')?.value || '';
  const password = document.getElementById('resetPassword')?.value || '';
  const confirm = document.getElementById('resetConfirm')?.value || '';
  const passErr = document.getElementById('resetPassErr');
  const confirmErr = document.getElementById('resetConfirmErr');
  const boxErr = document.getElementById('resetError');
  if (passErr) passErr.textContent = '';
  if (confirmErr) confirmErr.textContent = '';
  if (boxErr) { boxErr.hidden = true; boxErr.textContent = ''; }

  let ok = true;
  if (password.length < 8) {
    if (passErr) passErr.textContent = 'Password must be at least 8 characters.';
    ok = false;
  } else if (!/\d/.test(password)) {
    if (passErr) passErr.textContent = 'Password must contain at least one number.';
    ok = false;
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    if (passErr) passErr.textContent = 'Password must contain at least one special character.';
    ok = false;
  }
  if (password !== confirm) {
    if (confirmErr) confirmErr.textContent = 'Passwords do not match.';
    ok = false;
  }
  if (!ok) return;

  const result = await consumeResetToken(token, password);
  if (!result.valid) {
    if (boxErr) {
      if (result.reason === 'used') {
        boxErr.textContent = 'This password reset link has already been used.';
      } else {
        boxErr.textContent = 'This password reset link is invalid or has expired.';
      }
      boxErr.hidden = false;
    }
    return;
  }
  window.__devResetToken = null;
  showAuthCard('resetSuccessView');
  toast('Password reset successfully.');
}

function handleLogin() {
  const username = (document.getElementById('loginUsername')?.value || '').trim();
  const password = document.getElementById('loginPassword')?.value || '';
  const remember = document.getElementById('rememberMe')?.checked || false;
  const errorEl = document.getElementById('loginError');
  const userErr = document.getElementById('loginUserErr');
  const passErr = document.getElementById('loginPassErr');
  if (userErr) userErr.textContent = '';
  if (passErr) passErr.textContent = '';
  if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }

  let ok = true;
  if (!username) {
    if (userErr) userErr.textContent = 'Please enter your username.';
    ok = false;
  }
  if (!password) {
    if (passErr) passErr.textContent = 'Please enter your password.';
    ok = false;
  }
  if (!ok) return;

  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    if (errorEl) {
      errorEl.textContent = 'Invalid username or password.';
      errorEl.hidden = false;
    }
    return;
  }

  setSession(user, remember);
  currentUser = {
    id: user.id,
    username: user.username,
    fullName: user.fullName || user.username,
    email: user.email || ''
  };
  showApp();
  toast('Welcome back, ' + (user.fullName || user.username));
}

function handleRegister() {
  const fullName = (document.getElementById('regName')?.value || '').trim();
  const username = (document.getElementById('regUsername')?.value || '').trim();
  const email = (document.getElementById('regEmail')?.value || '').trim();
  const password = document.getElementById('regPassword')?.value || '';
  const confirm = document.getElementById('regConfirm')?.value || '';
  const errorEl = document.getElementById('registerError');

  const errs = {
    regNameErr: '', regUserErr: '', regEmailErr: '', regPassErr: '', regConfirmErr: ''
  };
  if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }

  let ok = true;
  if (!fullName) { errs.regNameErr = 'Please enter your full name.'; ok = false; }
  if (!username) { errs.regUserErr = 'Please choose a username.'; ok = false; }
  else if (username.length < 3) { errs.regUserErr = 'Username must be at least 3 characters.'; ok = false; }
  else if (findUserByUsername(username)) {
    errs.regUserErr = 'That username is already registered. Please choose another.';
    ok = false;
  }
  if (!email) { errs.regEmailErr = 'Please enter your email.'; ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errs.regEmailErr = 'Please enter a valid email address.';
    ok = false;
  }
  if (!password) { errs.regPassErr = 'Please enter a password.'; ok = false; }
  else if (password.length < 4) { errs.regPassErr = 'Password must contain at least 4 characters.'; ok = false; }
  if (password !== confirm) { errs.regConfirmErr = 'Passwords do not match.'; ok = false; }

  Object.keys(errs).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = errs[id];
  });
  if (!ok) return;

  const user = {
    id: generateUserId(),
    username,
    password,
    fullName,
    email
  };
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  saveUserData(user.id, { applications: [] });

  showAuthCard('signInView');
  document.getElementById('loginUsername').value = username;
  document.getElementById('loginPassword').value = '';
  toast('Account created successfully. Please sign in.');
}

function setupCredentialsForm() {
  const form = document.getElementById('credentialsForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) return;
    const newUsername = (document.getElementById('credUsername')?.value || '').trim();
    const currentPass = document.getElementById('credCurrentPassword')?.value || '';
    const newPass = document.getElementById('credNewPassword')?.value || '';
    const confirmPass = document.getElementById('credConfirmPassword')?.value || '';

    const users = getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx < 0) return;
    if (currentPass !== users[idx].password) {
      toast('Current password is incorrect', 'error');
      return;
    }
    if (!newUsername) {
      toast('Username cannot be empty', 'error');
      return;
    }
    const conflict = users.find(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== currentUser.id);
    if (conflict) {
      toast('That username is already taken', 'error');
      return;
    }
    users[idx].username = newUsername;
    users[idx].fullName = users[idx].fullName || newUsername;
    if (newPass) {
      if (newPass.length < 4) {
        toast('New password must be at least 4 characters', 'error');
        return;
      }
      if (newPass !== confirmPass) {
        toast('New passwords do not match', 'error');
        return;
      }
      users[idx].password = newPass;
    }
    saveUsers(users);
    currentUser.username = newUsername;
    setSession({ ...users[idx] }, !!localStorage.getItem(SESSION_KEY));
    updateUserHeader();
    document.getElementById('credCurrentPassword').value = '';
    document.getElementById('credNewPassword').value = '';
    document.getElementById('credConfirmPassword').value = '';
    toast('Credentials updated successfully');
  });
  // Prefill when settings opens — also on init
  const userEl = document.getElementById('credUsername');
  if (userEl && currentUser) userEl.value = currentUser.username || '';
}

// ---------- Theme ----------
function loadTheme() {
  const theme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeButton(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeButton(next);
  // Re-render charts for theme-aware colors
  if (document.getElementById('page-dashboard').classList.contains('active')) {
    updateCharts();
  }
}

function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.innerHTML = theme === 'dark'
      ? '<i class="fas fa-sun"></i><span>Light Mode</span>'
      : '<i class="fas fa-moon"></i><span>Dark Mode</span>';
  }
  const headerBtn = document.getElementById('themeToggleHeader');
  if (headerBtn) {
    headerBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
}

document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

function setupHeaderTheme() {
  document.getElementById('themeToggleHeader')?.addEventListener('click', toggleTheme);
}

// ---------- Navigation ----------
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('sidebarClose');

  hamburger?.addEventListener('click', () => sidebar.classList.add('open'));
  closeBtn?.addEventListener('click', () => sidebar.classList.remove('open'));

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    }
  });
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  const titles = {
    dashboard: 'Dashboard',
    applications: 'All Applications',
    add: 'Add Application',
    interviews: 'Interviews',
    followups: 'Follow-ups',
    pipeline: 'Pipeline',
    analytics: 'Analytics',
    settings: 'Settings'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  // Close mobile sidebar
  document.getElementById('sidebar')?.classList.remove('open');

  // Reset form if navigating to add
  if (page === 'add' && !document.getElementById('editId').value) {
    resetForm();
  }

  // Re-render page-specific content
  if (page === 'dashboard') renderDashboard();
  if (page === 'applications') renderApplicationsTable();
  if (page === 'interviews') renderInterviews();
  if (page === 'followups') renderFollowUps();
  if (page === 'pipeline') renderKanban();
  if (page === 'analytics') {
    // Analytics is overall reporting only — never inherits Application/Dashboard filters
    dashFilter = null;
    const resetBtn = document.getElementById('resetFilterBtn');
    if (resetBtn) {
      resetBtn.style.display = 'none';
      resetBtn.textContent = 'Reset';
    }
    renderAnalytics();
  }
  if (page === 'settings' && currentUser) {
    const userEl = document.getElementById('credUsername');
    if (userEl) userEl.value = currentUser.username || '';
  }
}

// ---------- Helpers ----------
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function parseDate(d) {
  if (!d) return null;
  const dt = new Date(d + 'T00:00:00');
  return isNaN(dt) ? null : dt;
}

function formatDate(d) {
  if (!d) return '—';
  const dt = parseDate(d);
  if (!dt) return d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysDiff(d1, d2) {
  const a = parseDate(d1);
  const b = parseDate(d2);
  if (!a || !b) return null;
  return Math.round((a - b) / 86400000);
}

function statusBadgeClass(status) {
  if (!status) return 'badge-applied';
  const s = status.toLowerCase();
  if (s.includes('offer received') || s === 'offer') return 'badge-offer';
  if (s === 'accepted') return 'badge-accepted';
  if (s === 'rejected') return 'badge-rejected';
  if (s === 'withdrawn') return 'badge-withdrawn';
  if (s === 'on hold') return 'badge-on-hold';
  if (s.includes('technical') || s.includes('managerial') || s.includes('final') || s.includes('1st') || s.includes('2nd') || s.includes('hr round')) return 'badge-technical';
  if (s.includes('interview')) return 'badge-interviewing';
  if (s.includes('screening') || s.includes('submitted')) return 'badge-screening';
  if (s === 'completed') return 'badge-completed';
  if (s === 'wishlist') return 'badge-wishlist';
  return 'badge-applied';
}

function statusBadge(status) {
  return `<span class="badge ${statusBadgeClass(status)}">${status || '—'}</span>`;
}

function generateId() {
  const now = new Date();
  const mon = now.toLocaleString('en', { month: 'short' }).toUpperCase();
  const existing = applications.map(a => a.id);
  let n = 1;
  let id;
  do {
    id = `${mon}-${String(n).padStart(3, '0')}`;
    n++;
  } while (existing.includes(id));
  return id;
}

function toast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function updateCurrentDate() {
  const el = document.getElementById('currentDate');
  if (el) {
    el.textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}

// ---------- KPI Calculations ----------
function getKPIs(apps = applications) {
  const total = apps.length;
  const applied = apps.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s === 'applied' || s === 'wishlist' || s.includes('submitted');
  }).length;
  const screening = apps.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s.includes('screening');
  }).length;
  const interviewing = apps.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s.includes('interview') || s.includes('technical') || s.includes('managerial') ||
           s.includes('hr round') || s.includes('final') || s.includes('1st') || s.includes('2nd');
  }).length;
  const offers = apps.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s.includes('offer') || s === 'accepted';
  }).length;
  const rejected = apps.filter(a => (a.status || '').toLowerCase() === 'rejected').length;
  const withdrawn = apps.filter(a => (a.status || '').toLowerCase() === 'withdrawn').length;

  const today = todayStr();
  const followupsDue = apps.filter(a => {
    if (!a.followUpDate) return false;
    const st = (a.followUpStatus || '').toLowerCase();
    if (st === 'completed' || st === 'no response needed') return false;
    return a.followUpDate <= today;
  }).length;

  // Response rate: anything beyond pure "Applied" / "Wishlist"
  const responded = apps.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s && s !== 'applied' && s !== 'wishlist' && !s.includes('submitted');
  }).length;
  const responseRate = total ? Math.round((responded / total) * 100) : 0;

  const interviewConversion = total ? Math.round((interviewing / total) * 100) : 0;
  const offerConversion = total ? Math.round((offers / total) * 100) : 0;

  return {
    total, applied, screening, interviewing, offers, rejected, withdrawn,
    followupsDue, responseRate, interviewConversion, offerConversion, responded
  };
}

// ---------- Render All ----------
function renderAll() {
  updateSidebarBadges();
  updateNotifBadge();
  const activePage = document.querySelector('.page.active')?.id?.replace('page-', '') || 'dashboard';
  if (activePage === 'dashboard') renderDashboard();
  else if (activePage === 'applications') renderApplicationsTable();
  else if (activePage === 'interviews') renderInterviews();
  else if (activePage === 'followups') renderFollowUps();
  else if (activePage === 'pipeline') renderKanban();
  else if (activePage === 'analytics') renderAnalytics();
}

function updateSidebarBadges() {
  const k = getKPIs();
  const today = todayStr();
  const upcomingInt = applications.filter(a =>
    a.interviewDate && a.interviewDate >= today && (a.interviewRound || '').toLowerCase() !== 'completed'
  ).length;

  setBadge('badgeApps', applications.length);
  setBadge('badgeInterviews', upcomingInt);
  setBadge('badgeFollowups', k.followupsDue);
}

function setBadge(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = count;
  el.setAttribute('data-count', count);
}

function buildNotifications() {
  const today = todayStr();
  const items = [];

  applications.forEach(a => {
    if (a.interviewDate && a.interviewDate >= today && (a.interviewRound || '').toLowerCase() !== 'completed') {
      const isTomorrow = daysDiff(a.interviewDate, today) === 1;
      items.push({
        id: 'int-' + a.id,
        type: 'interview',
        title: isTomorrow
          ? `Interview tomorrow with ${a.company}`
          : `Interview scheduled with ${a.company}`,
        meta: `${a.jobTitle || ''} · ${formatDate(a.interviewDate)}${a.interviewTime ? ' at ' + a.interviewTime : ''}`,
        date: a.interviewDate,
        appId: a.id
      });
    }
    if (a.followUpDate) {
      const st = (a.followUpStatus || '').toLowerCase();
      if (st !== 'completed' && st !== 'no response needed') {
        if (a.followUpDate < today) {
          items.push({
            id: 'fu-over-' + a.id,
            type: 'followup',
            title: `Overdue follow-up: ${a.company}`,
            meta: `${a.jobTitle || ''} · was due ${formatDate(a.followUpDate)}`,
            date: a.followUpDate,
            appId: a.id
          });
        } else if (a.followUpDate === today) {
          items.push({
            id: 'fu-today-' + a.id,
            type: 'followup',
            title: `Follow-up due today: ${a.company}`,
            meta: a.jobTitle || '',
            date: a.followUpDate,
            appId: a.id
          });
        } else if (daysDiff(a.followUpDate, today) <= 3) {
          items.push({
            id: 'fu-soon-' + a.id,
            type: 'followup',
            title: `Follow-up due soon: ${a.company}`,
            meta: `${a.jobTitle || ''} · ${formatDate(a.followUpDate)}`,
            date: a.followUpDate,
            appId: a.id
          });
        }
      }
    }
    const s = (a.status || '').toLowerCase();
    if (s.includes('offer') || s === 'accepted') {
      items.push({
        id: 'offer-' + a.id,
        type: 'status',
        title: `Offer status: ${a.status} — ${a.company}`,
        meta: a.jobTitle || '',
        date: a.applicationDate || today,
        appId: a.id
      });
    }
  });

  items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  return items;
}

function getReadNotifs() {
  if (!currentUser) return [];
  try {
    return JSON.parse(localStorage.getItem(NOTIF_READ_PREFIX + currentUser.id) || '[]');
  } catch { return []; }
}

function setReadNotifs(ids) {
  if (!currentUser) return;
  localStorage.setItem(NOTIF_READ_PREFIX + currentUser.id, JSON.stringify(ids));
}

function updateNotifBadge() {
  const items = buildNotifications();
  const read = getReadNotifs();
  const unread = items.filter(i => !read.includes(i.id)).length;
  const countEl = document.getElementById('notifCount');
  if (countEl) {
    countEl.textContent = unread;
    countEl.setAttribute('data-count', unread);
  }
}

function renderNotifPanel() {
  const list = document.getElementById('notifList');
  if (!list) return;
  const items = buildNotifications();
  const read = getReadNotifs();
  if (!items.length) {
    list.innerHTML = '<div class="notif-empty">No new notifications</div>';
    return;
  }
  list.innerHTML = items.map(n => `
    <div class="notif-item ${read.includes(n.id) ? '' : 'unread'}" data-id="${n.id}" data-app="${n.appId || ''}">
      <div class="ni-title">${esc(n.title)}</div>
      <div class="ni-meta">${esc(n.meta)}</div>
    </div>
  `).join('');

  list.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const appId = el.dataset.app;
      const readIds = getReadNotifs();
      if (!readIds.includes(id)) {
        readIds.push(id);
        setReadNotifs(readIds);
        updateNotifBadge();
        el.classList.remove('unread');
      }
      if (appId) {
        document.getElementById('notifPanel').hidden = true;
        viewApp(appId);
      }
    });
  });
}

function setupNotificationsUI() {
  const bell = document.getElementById('notifBell');
  const panel = document.getElementById('notifPanel');
  if (!bell || !panel) return;

  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !panel.hidden;
    panel.hidden = open;
    if (!open) renderNotifPanel();
    // close export menu
    const em = document.getElementById('exportMenu');
    if (em) em.hidden = true;
  });

  document.getElementById('markAllRead')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const items = buildNotifications();
    setReadNotifs(items.map(i => i.id));
    updateNotifBadge();
    renderNotifPanel();
    toast('All notifications marked as read');
  });

  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && !bell.contains(e.target)) {
      panel.hidden = true;
    }
  });
}

function setupExportMenu() {
  const btn = document.getElementById('exportBtn');
  const menu = document.getElementById('exportMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
    const panel = document.getElementById('notifPanel');
    if (panel) panel.hidden = true;
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });
  menu.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => { menu.hidden = true; });
  });
}

// ---------- Dashboard ----------
function normalizeLocation(loc) {
  if (!loc) return 'Other';
  const s = String(loc).trim();
  return s.includes(',') ? s.split(',')[0].trim() : s;
}

function renderDashboard() {
  // Charts always use the FULL dataset so labels/indexes stay stable after a click-filter.
  // KPIs, insights, and recent apps respect the active dashFilter.
  const filtered = dashFilter ? filterByDashFilter(applications) : applications;
  renderKPIs(filtered);
  updateCharts(); // always full dataset — never filtered
  renderInsights(filtered);
  renderUpcomingEvents();
  renderRecentApps(filtered);
  const resetBtn = document.getElementById('resetFilterBtn');
  if (resetBtn) {
    resetBtn.style.display = dashFilter ? 'inline-flex' : 'none';
    if (dashFilter) {
      const label = dashFilter.type === 'month'
        ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dashFilter.value - 1]
        : dashFilter.value;
      resetBtn.textContent = `Reset Filter (${dashFilter.type}: ${label})`;
    }
  }
}

/** Match an app status against a chart/pipeline filter value (exact or group). */
function statusMatchesFilter(appStatus, filterValue) {
  const s = (appStatus || '').toLowerCase();
  const v = (filterValue || '').toLowerCase();
  if (!v) return true;
  // Exact match first
  if (s === v) return true;
  // Pipeline group matches
  if (v === 'applied') return s === 'applied' || s === 'wishlist' || s.includes('submitted');
  if (v === 'hr screening' || v === 'screening') return s.includes('screening');
  if (v === 'interviewing') return s === 'interviewing' || s.includes('1st') || s.includes('2nd') || s.includes('managerial') || s.includes('hr round');
  if (v === 'technical round' || v === 'technical') return s.includes('technical');
  if (v === 'final round' || v === 'final') return s.includes('final');
  if (v === 'offer received' || v === 'offer') return s.includes('offer');
  if (v === 'accepted') return s === 'accepted';
  // Partial contains for flexibility
  return s.includes(v) || v.includes(s);
}

function filterByDashFilter(apps) {
  if (!dashFilter) return apps;
  const { type, value } = dashFilter;
  if (type === 'status') {
    return apps.filter(a => statusMatchesFilter(a.status, value));
  }
  if (type === 'location') {
    return apps.filter(a => normalizeLocation(a.location) === value);
  }
  if (type === 'month') {
    return apps.filter(a => {
      if (!a.applicationDate) return false;
      const m = parseInt(a.applicationDate.slice(5, 7), 10);
      return m === value;
    });
  }
  if (type === 'company') {
    return apps.filter(a => (a.company || '') === value);
  }
  return apps;
}

function applyChartFilter(type, value) {
  // Chart filters apply to All Applications only — never to Analytics
  dashFilter = { type, value };
  syncTableFiltersFromDash();
  navigateTo('applications');
  renderApplicationsTable();
  toast(`Applications: ${value}`);
}

function syncTableFiltersFromDash() {
  if (!dashFilter) return;
  // Clear table filters first
  const statusEl = document.getElementById('filterStatus');
  const locEl = document.getElementById('filterLocation');
  if (dashFilter.type === 'status' && statusEl) {
    // Ensure option exists
    populateFilterDropdowns();
    statusEl.value = dashFilter.value;
  }
  if (dashFilter.type === 'location' && locEl) {
    populateFilterDropdowns();
    // Try exact match against full location strings that start with city
    const match = [...locEl.options].find(o => normalizeLocation(o.value) === dashFilter.value);
    if (match) locEl.value = match.value;
  }
}

function resetDashboardFilter() {
  dashFilter = null;
  // Clear related table filters
  const statusEl = document.getElementById('filterStatus');
  const locEl = document.getElementById('filterLocation');
  if (statusEl) statusEl.value = '';
  if (locEl) locEl.value = '';
  renderDashboard();
  if (document.getElementById('page-applications')?.classList.contains('active')) {
    renderApplicationsTable();
  }
  toast('Filter cleared');
}

function renderKPIs(apps) {
  const k = getKPIs(apps);
  const grid = document.getElementById('kpiGrid');
  if (!grid) return;
  const cards = [
    { label: 'Total', value: k.total, icon: 'fa-folder', color: 'blue', action: () => navigateTo('applications') },
    { label: 'Applied', value: k.applied, icon: 'fa-paper-plane', color: 'purple', action: () => { dashFilter = { type: 'status', value: 'Applied' }; navigateTo('applications'); renderApplicationsTable(); } },
    { label: 'Shortlisted', value: k.screening, icon: 'fa-check-circle', color: 'cyan', action: () => { dashFilter = { type: 'status', value: 'HR Screening' }; navigateTo('applications'); renderApplicationsTable(); } },
    { label: 'Interviews', value: k.interviewing, icon: 'fa-video', color: 'orange', action: () => navigateTo('interviews') },
    { label: 'Offers', value: k.offers, icon: 'fa-trophy', color: 'green', action: () => { dashFilter = { type: 'status', value: 'Offer Received' }; navigateTo('applications'); renderApplicationsTable(); } },
    { label: 'Rejected', value: k.rejected, icon: 'fa-times-circle', color: 'red', action: () => { dashFilter = { type: 'status', value: 'Rejected' }; navigateTo('applications'); renderApplicationsTable(); } },
    { label: 'Follow-ups Due', value: k.followupsDue, icon: 'fa-bell', color: 'yellow', action: () => navigateTo('followups') },
    { label: 'Response Rate', value: k.responseRate + '%', icon: 'fa-chart-line', color: 'indigo', action: () => navigateTo('analytics') }
  ];
  grid.innerHTML = cards.map((c, i) => `
    <div class="kpi-card" data-kpi="${i}" role="button" tabindex="0">
      <div class="kpi-top">
        <div class="kpi-icon-box ${c.color}"><i class="fas ${c.icon}"></i></div>
        <span class="kpi-label">${c.label}</span>
      </div>
      <div class="kpi-value">${c.value}</div>
    </div>
  `).join('');
  grid.querySelectorAll('.kpi-card').forEach((el, i) => {
    el.addEventListener('click', () => cards[i].action());
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cards[i].action(); } });
  });
}

// ---------- Charts ----------
function getChartColors() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: dark ? '#94a3b8' : '#6c757d',
    grid: dark ? '#334155' : '#e0e4e8',
    palette: ['#4361ee', '#8b5cf6', '#06b6d4', '#f97316', '#10b981', '#ef4444', '#ec4899', '#f59e0b', '#6366f1', '#14b8a6']
  };
}

function destroyChart(name) {
  if (charts[name]) {
    charts[name].destroy();
    charts[name] = null;
  }
}

/**
 * Resolve the clicked data index from a Chart.js event.
 * Uses getElementsAtEventForMode for reliable hit-testing (especially line charts).
 */
function getClickedIndex(event, chart, mode) {
  if (!chart) return -1;
  const elems = chart.getElementsAtEventForMode(
    event,
    mode || 'nearest',
    { intersect: true },
    true
  );
  if (elems && elems.length) return elems[0].index;
  // Fallback: non-intersecting nearest (helps thin line charts)
  const near = chart.getElementsAtEventForMode(
    event,
    'nearest',
    { intersect: false },
    true
  );
  if (near && near.length) return near[0].index;
  return -1;
}

function updateCharts() {
  // Always build from the full applications array so click indexes stay valid.
  const apps = applications;
  const colors = getChartColors();

  // ---- Status doughnut ----
  destroyChart('status');
  const statusCounts = {};
  apps.forEach(a => {
    const s = a.status || 'Unknown';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusLabels = Object.keys(statusCounts);
  const statusData = Object.values(statusCounts);

  charts.status = new Chart(document.getElementById('statusChart'), {
    type: 'doughnut',
    data: {
      labels: statusLabels,
      datasets: [{
        data: statusData,
        backgroundColor: colors.palette.slice(0, statusLabels.length),
        borderWidth: 2,
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: colors.text, boxWidth: 12, font: { size: 11 } },
          onClick: (e, legendItem, legend) => {
            // Legend click also filters by status
            const idx = legendItem.index;
            if (idx != null && statusLabels[idx]) {
              applyChartFilter('status', statusLabels[idx], `Filtered by status: ${statusLabels[idx]}`);
            }
          }
        }
      },
      onClick: (event, _elements, chart) => {
        const idx = getClickedIndex(event, chart, 'nearest');
        if (idx >= 0 && statusLabels[idx]) {
          applyChartFilter('status', statusLabels[idx], `Filtered by status: ${statusLabels[idx]}`);
        }
      }
    }
  });

  // ---- Location bar ----
  destroyChart('location');
  const locCounts = {};
  apps.forEach(a => {
    const loc = normalizeLocation(a.location);
    locCounts[loc] = (locCounts[loc] || 0) + 1;
  });
  const locLabels = Object.keys(locCounts).sort((a, b) => locCounts[b] - locCounts[a]);
  const locData = locLabels.map(l => locCounts[l]);

  charts.location = new Chart(document.getElementById('locationChart'), {
    type: 'bar',
    data: {
      labels: locLabels,
      datasets: [{ label: 'Applications', data: locData, backgroundColor: colors.palette[0], borderRadius: 6 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: colors.text }, grid: { display: false } },
        y: { ticks: { color: colors.text, stepSize: 1 }, grid: { color: colors.grid }, beginAtZero: true }
      },
      onClick: (event, _elements, chart) => {
        const idx = getClickedIndex(event, chart, 'nearest');
        if (idx >= 0 && locLabels[idx]) {
          applyChartFilter('location', locLabels[idx], `Filtered by location: ${locLabels[idx]}`);
        }
      }
    }
  });

  // ---- Month line ----
  destroyChart('month');
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthCounts = new Array(12).fill(0);
  apps.forEach(a => {
    if (a.applicationDate) {
      const m = parseInt(a.applicationDate.slice(5, 7), 10) - 1;
      if (m >= 0 && m < 12) monthCounts[m]++;
    }
  });

  charts.month = new Chart(document.getElementById('monthChart'), {
    type: 'line',
    data: {
      labels: monthNames,
      datasets: [{
        label: 'Applications',
        data: monthCounts,
        borderColor: colors.palette[0],
        backgroundColor: colors.palette[0] + '33',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHitRadius: 20
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: colors.text }, grid: { display: false } },
        y: { ticks: { color: colors.text, stepSize: 1 }, grid: { color: colors.grid }, beginAtZero: true }
      },
      onClick: (event, _elements, chart) => {
        // Use intersect:false so clicking near a point still registers
        const idx = getClickedIndex(event, chart, 'index');
        if (idx >= 0) {
          applyChartFilter('month', idx + 1, `Filtered by month: ${monthNames[idx]}`);
        }
      }
    }
  });

  // ---- Company horizontal bar (top 10) ----
  destroyChart('company');
  const companyCounts = {};
  apps.forEach(a => {
    const c = a.company || 'Unknown';
    companyCounts[c] = (companyCounts[c] || 0) + 1;
  });
  const sortedCompanies = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const compLabels = sortedCompanies.map(c => c[0]);
  const compData = sortedCompanies.map(c => c[1]);

  charts.company = new Chart(document.getElementById('companyChart'), {
    type: 'bar',
    data: {
      labels: compLabels,
      datasets: [{ label: 'Applications', data: compData, backgroundColor: colors.palette[1], borderRadius: 6 }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: colors.text, stepSize: 1 }, grid: { color: colors.grid }, beginAtZero: true },
        y: { ticks: { color: colors.text }, grid: { display: false } }
      },
      onClick: (event, _elements, chart) => {
        const idx = getClickedIndex(event, chart, 'nearest');
        if (idx >= 0 && compLabels[idx]) {
          applyChartFilter('company', compLabels[idx], `Filtered by company: ${compLabels[idx]}`);
        }
      }
    }
  });

  // ---- Pipeline funnel-style bar ----
  destroyChart('pipeline');
  const pipelineOrder = ['Applied', 'HR Screening', 'Interviewing', 'Technical Round', 'Final Round', 'Offer Received', 'Accepted'];
  const pipelineStatusMap = {
    'Applied': 'Applied',
    'HR Screening': 'HR Screening',
    'Interviewing': 'Interviewing',
    'Technical Round': 'Technical Round',
    'Final Round': 'Final Round',
    'Offer Received': 'Offer Received',
    'Accepted': 'Accepted'
  };
  const pipelineCounts = pipelineOrder.map(stage => {
    return apps.filter(a => {
      const s = (a.status || '').toLowerCase();
      if (stage === 'Applied') return s === 'applied' || s === 'wishlist' || s.includes('submitted');
      if (stage === 'HR Screening') return s.includes('screening');
      if (stage === 'Interviewing') return s === 'interviewing' || s.includes('1st') || s.includes('2nd') || s.includes('managerial') || s.includes('hr round');
      if (stage === 'Technical Round') return s.includes('technical');
      if (stage === 'Final Round') return s.includes('final');
      if (stage === 'Offer Received') return s.includes('offer');
      if (stage === 'Accepted') return s === 'accepted';
      return false;
    }).length;
  });

  charts.pipeline = new Chart(document.getElementById('pipelineChart'), {
    type: 'bar',
    data: {
      labels: pipelineOrder,
      datasets: [{
        label: 'Count',
        data: pipelineCounts,
        backgroundColor: ['#4361ee', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#10b981', '#059669'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: colors.text, maxRotation: 45 }, grid: { display: false } },
        y: { ticks: { color: colors.text, stepSize: 1 }, grid: { color: colors.grid }, beginAtZero: true }
      },
      onClick: (event, _elements, chart) => {
        const idx = getClickedIndex(event, chart, 'nearest');
        if (idx >= 0 && pipelineOrder[idx]) {
          // Pipeline stages are aggregates — filter by matching status group
          const stage = pipelineOrder[idx];
          // Store as status filter using the canonical status label when possible
          applyChartFilter('status', pipelineStatusMap[stage] || stage, `Filtered by pipeline stage: ${stage}`);
        }
      }
    }
  });
}

// ---------- Insights ----------
function renderInsights(apps = applications) {
  const insights = [];
  const k = getKPIs(apps);
  const today = todayStr();

  if (k.total === 0) {
    insights.push('No applications yet. Start by adding your first job application!');
  } else {
    if (k.responseRate < 30 && k.total >= 5) {
      insights.push(`You have applied to ${k.total} roles but response rate is only ${k.responseRate}%. Consider refining your resume or targeting more relevant roles.`);
    }
    if (k.interviewConversion > 0) {
      insights.push(`Interview conversion rate: ${k.interviewConversion}%. Offer conversion: ${k.offerConversion}%.`);
    }
    // Most applied location
    const locCounts = {};
    apps.forEach(a => {
      let loc = (a.location || 'Other').split(',')[0].trim();
      locCounts[loc] = (locCounts[loc] || 0) + 1;
    });
    const topLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0];
    if (topLoc) insights.push(`Highest number of applications are in ${topLoc[0]} (${topLoc[1]} apps).`);

    // Follow-ups this week
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);
    const weekFollowups = apps.filter(a => {
      if (!a.followUpDate) return false;
      const st = (a.followUpStatus || '').toLowerCase();
      if (st === 'completed' || st === 'no response needed') return false;
      return a.followUpDate >= today && a.followUpDate <= weekEndStr;
    }).length;
    if (weekFollowups > 0) insights.push(`You have ${weekFollowups} application(s) requiring follow-up this week.`);

    // Overdue
    const overdue = apps.filter(a => {
      if (!a.followUpDate) return false;
      const st = (a.followUpStatus || '').toLowerCase();
      if (st === 'completed' || st === 'no response needed') return false;
      return a.followUpDate < today;
    });
    if (overdue.length > 0) insights.push(`You have ${overdue.length} overdue follow-up(s). Prioritize contacting these recruiters.`);

    // Old applications without response
    const oldNoResponse = apps.filter(a => {
      const s = (a.status || '').toLowerCase();
      if (s !== 'applied' && !s.includes('submitted')) return false;
      if (!a.applicationDate) return false;
      return daysDiff(today, a.applicationDate) > 7;
    });
    if (oldNoResponse.length > 0) {
      insights.push(`${oldNoResponse.length} application(s) submitted over 7 days ago with no response yet.`);
    }

    // Avg per month
    const dates = apps.map(a => a.applicationDate).filter(Boolean).sort();
    if (dates.length >= 2) {
      const first = parseDate(dates[0]);
      const last = parseDate(dates[dates.length - 1]);
      if (first && last) {
        const months = Math.max(1, (last - first) / (30 * 86400000));
        const avgMonth = (apps.length / months).toFixed(1);
        insights.push(`Average applications per month: ~${avgMonth}.`);
      }
    }
  }

  const el = document.getElementById('insightsList');
  if (!insights.length) {
    el.innerHTML = '<div class="empty-state">No insights available yet.</div>';
  } else {
    el.innerHTML = insights.map(i => `<div class="insight-item"><i class="fas fa-lightbulb"></i>${i}</div>`).join('');
  }
}

// ---------- Upcoming events ----------
function renderUpcomingEvents() {
  const today = todayStr();

  // Interviews
  const interviews = applications
    .filter(a => a.interviewDate && a.interviewDate >= today && (a.interviewRound || '').toLowerCase() !== 'completed')
    .sort((a, b) => a.interviewDate.localeCompare(b.interviewDate))
    .slice(0, 5);

  const intEl = document.getElementById('upcomingInterviews');
  if (!interviews.length) {
    intEl.innerHTML = '<div class="empty-state">No upcoming interviews</div>';
  } else {
    intEl.innerHTML = interviews.map(a => `
      <div class="event-item">
        <div class="ei-company">${esc(a.company)} — ${esc(a.jobTitle)}</div>
        <div class="ei-meta">${formatDate(a.interviewDate)}${a.interviewTime ? ' at ' + a.interviewTime : ''} · ${esc(a.interviewRound || '')}</div>
      </div>
    `).join('');
  }

  // Follow-ups
  const followups = applications
    .filter(a => {
      if (!a.followUpDate) return false;
      const st = (a.followUpStatus || '').toLowerCase();
      return st !== 'completed' && st !== 'no response needed';
    })
    .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
    .slice(0, 5);

  const fuEl = document.getElementById('upcomingFollowups');
  if (!followups.length) {
    fuEl.innerHTML = '<div class="empty-state">No pending follow-ups</div>';
  } else {
    fuEl.innerHTML = followups.map(a => {
      const overdue = a.followUpDate < today;
      return `
        <div class="event-item">
          <div class="ei-company">${overdue ? '🔴 ' : '🟡 '}${esc(a.company)} — ${esc(a.jobTitle)}</div>
          <div class="ei-meta">${formatDate(a.followUpDate)} · ${esc(a.followUpStatus || 'Due')}</div>
        </div>
      `;
    }).join('');
  }
}

function renderRecentApps(apps = applications) {
  const recent = [...apps].sort((a, b) => (b.applicationDate || '').localeCompare(a.applicationDate || '')).slice(0, 8);
  const el = document.getElementById('recentAppsTable');
  if (!recent.length) {
    el.innerHTML = '<div class="empty-state">No applications yet</div>';
    return;
  }
  el.innerHTML = `
    <table class="data-table">
      <thead><tr><th>Company</th><th>Job Title</th><th>Location</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>
        ${recent.map(a => `
          <tr>
            <td>${esc(a.company)}</td>
            <td>${esc(a.jobTitle)}</td>
            <td>${esc(a.location || '—')}</td>
            <td>${formatDate(a.applicationDate)}</td>
            <td>${statusBadge(a.status)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ---------- Applications Table ----------
function setupSearch() {
  document.getElementById('globalSearch')?.addEventListener('input', debounce(() => {
    if (document.getElementById('page-applications').classList.contains('active')) {
      renderApplicationsTable();
    }
  }, 250));

  ['filterStatus', 'filterLocation', 'filterWorkMode', 'filterSource', 'filterRound', 'filterDateFrom', 'filterDateTo'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => renderApplicationsTable());
  });
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function populateFilterDropdowns() {
  const statuses = [...new Set(applications.map(a => a.status).filter(Boolean))].sort();
  const locations = [...new Set(applications.map(a => a.location).filter(Boolean))].sort();
  const modes = [...new Set(applications.map(a => a.workMode).filter(Boolean))].sort();
  const sources = [...new Set(applications.map(a => a.source).filter(Boolean))].sort();
  const rounds = [...new Set(applications.map(a => a.interviewRound).filter(Boolean))].sort();

  fillSelect('filterStatus', statuses);
  fillSelect('filterLocation', locations);
  fillSelect('filterWorkMode', modes);
  fillSelect('filterSource', sources);
  fillSelect('filterRound', rounds);
}

function fillSelect(id, options) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const current = sel.value;
  const first = sel.options[0];
  sel.innerHTML = '';
  sel.appendChild(first);
  options.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    sel.appendChild(opt);
  });
  sel.value = current;
}

function getFilteredApps() {
  let apps = [...applications];

  // Apply dashboard chart filter first (company / month / status group / location)
  if (dashFilter) {
    apps = filterByDashFilter(apps);
  }

  const q = (document.getElementById('globalSearch')?.value || '').toLowerCase().trim();
  const status = document.getElementById('filterStatus')?.value || '';
  const location = document.getElementById('filterLocation')?.value || '';
  const workMode = document.getElementById('filterWorkMode')?.value || '';
  const source = document.getElementById('filterSource')?.value || '';
  const round = document.getElementById('filterRound')?.value || '';
  const dateFrom = document.getElementById('filterDateFrom')?.value || '';
  const dateTo = document.getElementById('filterDateTo')?.value || '';

  if (q) {
    apps = apps.filter(a =>
      (a.company || '').toLowerCase().includes(q) ||
      (a.jobTitle || '').toLowerCase().includes(q) ||
      (a.hrName || '').toLowerCase().includes(q) ||
      (a.location || '').toLowerCase().includes(q) ||
      (a.status || '').toLowerCase().includes(q) ||
      (a.notes || '').toLowerCase().includes(q) ||
      (a.id || '').toLowerCase().includes(q)
    );
  }
  // Only apply dropdown status/location if dashFilter is not already driving them
  if (status && !(dashFilter && dashFilter.type === 'status')) {
    apps = apps.filter(a => a.status === status);
  }
  if (location && !(dashFilter && dashFilter.type === 'location')) {
    apps = apps.filter(a => a.location === location);
  }
  if (workMode) apps = apps.filter(a => a.workMode === workMode);
  if (source) apps = apps.filter(a => a.source === source);
  if (round) apps = apps.filter(a => a.interviewRound === round);
  if (dateFrom) apps = apps.filter(a => a.applicationDate && a.applicationDate >= dateFrom);
  if (dateTo) apps = apps.filter(a => a.applicationDate && a.applicationDate <= dateTo);

  return apps.sort((a, b) => (b.applicationDate || '').localeCompare(a.applicationDate || ''));
}

function renderApplicationsTable() {
  populateFilterDropdowns();
  const apps = getFilteredApps();
  const tbody = document.getElementById('appsTableBody');
  if (!apps.length) {
    tbody.innerHTML = '<tr><td colspan="11" class="empty-state">No applications found</td></tr>';
    return;
  }
  tbody.innerHTML = apps.map(a => `
    <tr>
      <td>${esc(a.id)}</td>
      <td>${formatDate(a.applicationDate)}</td>
      <td>${esc(a.company)}</td>
      <td>${esc(a.jobTitle)}</td>
      <td>${esc(a.location || '—')}</td>
      <td>${esc(a.workMode || '—')}</td>
      <td>${statusBadge(a.status)}</td>
      <td>${esc(a.interviewRound || '—')}</td>
      <td>${formatDate(a.interviewDate)}</td>
      <td>${formatDate(a.followUpDate)}</td>
      <td class="actions-cell">
        <button class="btn-icon" title="View" onclick="viewApp('${a.id}')"><i class="fas fa-eye"></i></button>
        <button class="btn-icon" title="Edit" onclick="editApp('${a.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn-icon danger" title="Delete" onclick="deleteApp('${a.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function clearFilters() {
  document.getElementById('globalSearch').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterLocation').value = '';
  document.getElementById('filterWorkMode').value = '';
  document.getElementById('filterSource').value = '';
  document.getElementById('filterRound').value = '';
  document.getElementById('filterDateFrom').value = '';
  document.getElementById('filterDateTo').value = '';
  dashFilter = null;
  const resetBtn = document.getElementById('resetFilterBtn');
  if (resetBtn) resetBtn.style.display = 'none';
  renderApplicationsTable();
}

// ---------- CRUD ----------
function setupForm() {
  document.getElementById('appForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    saveForm();
  });
}

function validateForm() {
  let ok = true;
  const appId = document.getElementById('fId');
  const company = document.getElementById('fCompany');
  const title = document.getElementById('fTitle');
  const appDate = document.getElementById('fAppDate');
  const email = document.getElementById('fHrEmail');
  const phone = document.getElementById('fHrPhone');
  const editId = document.getElementById('editId').value;

  document.querySelectorAll('.form-group input, .form-group select').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

  if (!appId.value.trim()) {
    appId.classList.add('error');
    if (appId.nextElementSibling) appId.nextElementSibling.textContent = 'Please enter application ID.';
    ok = false;
  } else {
    // Unique ID when creating or if ID changed
    const conflict = applications.find(a => a.id === appId.value.trim() && a.id !== editId);
    if (conflict) {
      appId.classList.add('error');
      if (appId.nextElementSibling) appId.nextElementSibling.textContent = 'This Application ID already exists.';
      ok = false;
    }
  }
  if (!company.value.trim()) {
    company.classList.add('error');
    if (company.nextElementSibling) company.nextElementSibling.textContent = 'Please enter company name.';
    ok = false;
  }
  if (!title.value.trim()) {
    title.classList.add('error');
    if (title.nextElementSibling) title.nextElementSibling.textContent = 'Please enter job title.';
    ok = false;
  }
  if (!appDate.value) {
    appDate.classList.add('error');
    if (appDate.nextElementSibling) appDate.nextElementSibling.textContent = 'Please select application date.';
    ok = false;
  }
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email.classList.add('error');
    if (email.nextElementSibling) email.nextElementSibling.textContent = 'Please enter a valid email address.';
    ok = false;
  }
  if (phone.value && !/^[\d\s+\-()]{7,15}$/.test(phone.value.replace(/\s/g, ''))) {
    phone.classList.add('error');
    if (phone.nextElementSibling) phone.nextElementSibling.textContent = 'Please enter a valid phone number.';
    ok = false;
  }
  return ok;
}

function saveForm() {
  const editId = document.getElementById('editId').value;
  const data = {
    id: document.getElementById('fId').value.trim() || editId || generateId(),
    applicationDate: document.getElementById('fAppDate').value,
    company: document.getElementById('fCompany').value.trim(),
    jobTitle: document.getElementById('fTitle').value.trim(),
    location: document.getElementById('fLocation').value.trim(),
    workMode: document.getElementById('fWorkMode').value,
    hrName: document.getElementById('fHrName').value.trim(),
    hrPhone: document.getElementById('fHrPhone').value.trim(),
    hrEmail: document.getElementById('fHrEmail').value.trim(),
    source: document.getElementById('fSource').value,
    status: document.getElementById('fStatus').value,
    interviewRound: document.getElementById('fRound').value,
    interviewDate: document.getElementById('fIntDate').value,
    interviewTime: document.getElementById('fIntTime').value,
    salary: document.getElementById('fSalary').value.trim(),
    followUpDate: document.getElementById('fFollowDate').value,
    followUpStatus: document.getElementById('fFollowStatus').value,
    offerStatus: document.getElementById('fOfferStatus').value,
    notes: document.getElementById('fNotes').value.trim()
  };

  if (data.followUpDate) {
    const today = todayStr();
    if (data.followUpStatus !== 'Completed' && data.followUpStatus !== 'No Response Needed') {
      if (data.followUpDate < today) data.followUpStatus = 'Overdue';
      else if (data.followUpDate === today) data.followUpStatus = 'Due';
    }
  }

  if (editId) {
    const idx = applications.findIndex(a => a.id === editId);
    if (idx >= 0) applications[idx] = data;
    toast('Application saved successfully.');
  } else {
    applications.push(data);
    toast('Application saved successfully.');
  }

  saveApplications();
  resetForm();
  navigateTo('applications');
  renderAll();
}

function resetForm() {
  document.getElementById('appForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('formTitle').textContent = 'Add New Application';
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-check"></i> Save Application';
  document.getElementById('fId').value = generateId();
  document.getElementById('fAppDate').value = todayStr();
  document.getElementById('fStatus').value = 'Applied';
  document.getElementById('fRound').value = 'Not Started';
  document.getElementById('fFollowStatus').value = 'Not Due';
  document.getElementById('fOfferStatus').value = 'Not Applicable';
  document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-group input, .form-group select').forEach(el => el.classList.remove('error'));
}

function cancelForm() {
  resetForm();
  navigateTo('applications');
}

function editApp(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  document.getElementById('editId').value = app.id;
  document.getElementById('fId').value = app.id || '';
  document.getElementById('fCompany').value = app.company || '';
  document.getElementById('fTitle').value = app.jobTitle || '';
  document.getElementById('fLocation').value = app.location || '';
  document.getElementById('fWorkMode').value = app.workMode || '';
  document.getElementById('fAppDate').value = app.applicationDate || '';
  document.getElementById('fSource').value = app.source || '';
  document.getElementById('fHrName').value = app.hrName || '';
  document.getElementById('fHrEmail').value = app.hrEmail || '';
  document.getElementById('fHrPhone').value = app.hrPhone || '';
  document.getElementById('fStatus').value = app.status || 'Applied';
  document.getElementById('fRound').value = app.interviewRound || 'Not Started';
  document.getElementById('fIntDate').value = app.interviewDate || '';
  document.getElementById('fIntTime').value = app.interviewTime || '';
  document.getElementById('fSalary').value = app.salary || '';
  document.getElementById('fFollowDate').value = app.followUpDate || '';
  document.getElementById('fFollowStatus').value = app.followUpStatus || 'Not Due';
  document.getElementById('fOfferStatus').value = app.offerStatus || 'Not Applicable';
  document.getElementById('fNotes').value = app.notes || '';
  document.getElementById('formTitle').textContent = 'Edit Application';
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-check"></i> Update Application';
  navigateTo('add');
}

function viewApp(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  const body = document.getElementById('viewModalBody');
  body.innerHTML = [
    ['Application ID', app.id],
    ['Company', app.company],
    ['Job Title', app.jobTitle],
    ['Location', app.location],
    ['Work Mode', app.workMode],
    ['Application Date', formatDate(app.applicationDate)],
    ['Source', app.source],
    ['Status', app.status],
    ['Interview Round', app.interviewRound],
    ['Interview Date', formatDate(app.interviewDate)],
    ['Interview Time', app.interviewTime],
    ['HR Name', app.hrName],
    ['HR Email', app.hrEmail],
    ['HR Phone', app.hrPhone],
    ['Expected Salary', app.salary],
    ['Follow-up Date', formatDate(app.followUpDate)],
    ['Follow-up Status', app.followUpStatus],
    ['Offer Status', app.offerStatus],
    ['Notes', app.notes]
  ].map(([l, v]) => `<div class="detail-row"><div class="dl">${l}</div><div class="dv">${esc(v || '—')}</div></div>`).join('');

  document.getElementById('viewEditBtn').onclick = () => { closeModal(); editApp(id); };
  document.getElementById('viewModal').classList.add('show');
}

function closeModal() {
  document.getElementById('viewModal').classList.remove('show');
}

function deleteApp(id) {
  showConfirm('Delete this application? This cannot be undone.', () => {
    applications = applications.filter(a => a.id !== id);
    saveApplications();
    renderAll();
    toast('Application deleted');
  });
}

function showConfirm(msg, cb) {
  document.getElementById('confirmBody').textContent = msg;
  confirmCallback = cb;
  document.getElementById('confirmModal').classList.add('show');
}

function closeConfirm() {
  document.getElementById('confirmModal').classList.remove('show');
  confirmCallback = null;
}

document.getElementById('confirmYes')?.addEventListener('click', () => {
  if (confirmCallback) confirmCallback();
  closeConfirm();
});

// ---------- Interviews ----------
function renderInterviews() {
  const withInterview = applications
    .filter(a => a.interviewDate || (a.interviewRound && a.interviewRound !== 'Not Started'))
    .sort((a, b) => (a.interviewDate || '9999').localeCompare(b.interviewDate || '9999'));

  const tbody = document.getElementById('interviewsBody');
  if (!withInterview.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No interviews scheduled</td></tr>';
    return;
  }
  const today = todayStr();
  tbody.innerHTML = withInterview.map(a => {
    const upcoming = a.interviewDate && a.interviewDate >= today;
    return `
      <tr style="${upcoming ? 'background:rgba(67,97,238,0.06)' : ''}">
        <td>${esc(a.company)}</td>
        <td>${esc(a.jobTitle)}</td>
        <td>${esc(a.interviewRound || '—')}</td>
        <td>${formatDate(a.interviewDate)}</td>
        <td>${esc(a.interviewTime || '—')}</td>
        <td>${statusBadge(a.status)}</td>
        <td>${esc((a.notes || '').slice(0, 60))}${(a.notes || '').length > 60 ? '…' : ''}</td>
        <td class="actions-cell">
          <button class="btn-icon" title="Edit" onclick="editApp('${a.id}')"><i class="fas fa-edit"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

// ---------- Follow-ups ----------
function renderFollowUps() {
  const today = todayStr();
  const pending = applications.filter(a => {
    if (!a.followUpDate) return false;
    const st = (a.followUpStatus || '').toLowerCase();
    return st !== 'completed' && st !== 'no response needed';
  });

  const overdue = pending.filter(a => a.followUpDate < today).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
  const todayList = pending.filter(a => a.followUpDate === today);
  const future = pending.filter(a => a.followUpDate > today).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));

  renderFollowupList('overdueFollowups', overdue, '🔴');
  renderFollowupList('todayFollowups', todayList, '🟡');
  renderFollowupList('futureFollowups', future, '🟢');
}

function renderFollowupList(elId, list, icon) {
  const el = document.getElementById(elId);
  if (!list.length) {
    el.innerHTML = '<div class="empty-state">None</div>';
    return;
  }
  el.innerHTML = list.map(a => `
    <div class="followup-item">
      <div class="fi-info">
        <div class="fi-company">${icon} ${esc(a.company)} — ${esc(a.jobTitle)}</div>
        <div class="fi-meta">${formatDate(a.followUpDate)} · ${esc(a.hrName || '')} · ${esc(a.hrPhone || a.hrEmail || '')}</div>
        ${a.notes ? `<div class="fi-meta">${esc(a.notes.slice(0, 80))}</div>` : ''}
      </div>
      <button class="btn btn-sm btn-success" onclick="markFollowupDone('${a.id}')">Mark Done</button>
      <button class="btn-icon" onclick="editApp('${a.id}')"><i class="fas fa-edit"></i></button>
    </div>
  `).join('');
}

function markFollowupDone(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  app.followUpStatus = 'Completed';
  saveApplications();
  renderAll();
  toast('Follow-up marked as completed');
}

// ---------- Kanban Pipeline ----------
const KANBAN_COLUMNS = [
  { key: 'Applied', match: s => s === 'applied' || s === 'wishlist' || s.includes('submitted') },
  { key: 'Screening', match: s => s.includes('screening') },
  { key: 'Interviewing', match: s => s === 'interviewing' || s.includes('1st') || s.includes('2nd') || s.includes('managerial') || s.includes('hr round') },
  { key: 'Technical', match: s => s.includes('technical') },
  { key: 'Final Round', match: s => s.includes('final') },
  { key: 'Offer', match: s => s.includes('offer') || s === 'accepted' },
  { key: 'Rejected', match: s => s === 'rejected' || s === 'withdrawn' || s === 'on hold' }
];

function renderKanban() {
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = KANBAN_COLUMNS.map(col => {
    const cards = applications.filter(a => col.match((a.status || '').toLowerCase()));
    return `
      <div class="kanban-col" data-status="${col.key}" ondragover="event.preventDefault()" ondrop="kanbanDrop(event, '${col.key}')">
        <div class="kanban-col-header">
          <span>${col.key}</span>
          <span class="kanban-count">${cards.length}</span>
        </div>
        ${cards.map(a => `
          <div class="kanban-card" draggable="true" data-id="${a.id}"
               ondragstart="kanbanDrag(event)" ondragend="this.classList.remove('dragging')">
            <div class="kc-company">${esc(a.company)}</div>
            <div class="kc-title">${esc(a.jobTitle)}</div>
            <div class="kc-loc">${esc(a.location || '')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function kanbanDrag(e) {
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', e.target.dataset.id);
}

function kanbanDrop(e, colKey) {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const app = applications.find(a => a.id === id);
  if (!app) return;

  const statusMap = {
    'Applied': 'Applied',
    'Screening': 'HR Screening',
    'Interviewing': 'Interviewing',
    'Technical': 'Technical Round',
    'Final Round': 'Final Round',
    'Offer': 'Offer Received',
    'Rejected': 'Rejected'
  };
  app.status = statusMap[colKey] || colKey;
  saveApplications();
  renderKanban();
  updateNotifBadge();
  toast(`Moved to ${colKey}`);
}

// ---------- Analytics ----------
/**
 * Analytics page — always uses the FULL current-user applications array.
 * No company/status/location filters. No Reset Filter UI.
 * Multi-user isolation is handled by loadApplications() (current user only).
 */
function renderAnalytics() {
  // Always full dataset for the logged-in user — never dashFilter
  const apps = applications;
  const k = getKPIs(apps);
  const colors = getChartColors();

  const grid = document.getElementById('analyticsKpis');
  if (grid) {
    grid.innerHTML = `
      <div class="kpi-card"><div class="kpi-top"><div class="kpi-icon-box blue"><i class="fas fa-folder"></i></div><span class="kpi-label">Total</span></div><div class="kpi-value">${k.total}</div></div>
      <div class="kpi-card"><div class="kpi-top"><div class="kpi-icon-box purple"><i class="fas fa-percentage"></i></div><span class="kpi-label">Response Rate</span></div><div class="kpi-value">${k.responseRate}%</div></div>
      <div class="kpi-card"><div class="kpi-top"><div class="kpi-icon-box orange"><i class="fas fa-comments"></i></div><span class="kpi-label">Interview Conv.</span></div><div class="kpi-value">${k.interviewConversion}%</div></div>
      <div class="kpi-card"><div class="kpi-top"><div class="kpi-icon-box green"><i class="fas fa-trophy"></i></div><span class="kpi-label">Offer Conv.</span></div><div class="kpi-value">${k.offerConversion}%</div></div>
    `;
  }

  // Status doughnut
  destroyChart('aStatus');
  const statusCounts = {};
  apps.forEach(a => {
    const s = a.status || 'Unknown';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusLabels = Object.keys(statusCounts);
  const statusData = Object.values(statusCounts);
  const statusCanvas = document.getElementById('analyticsStatusChart');
  if (statusCanvas) {
    charts.aStatus = new Chart(statusCanvas, {
      type: 'doughnut',
      data: {
        labels: statusLabels,
        datasets: [{
          data: statusData,
          backgroundColor: colors.palette.slice(0, Math.max(statusLabels.length, 1)),
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: colors.text, boxWidth: 12, font: { size: 11 } } }
        }
        // No onClick filter — analytics is always full dataset
      }
    });
  }

  // Location bar
  destroyChart('aLocation');
  const locCounts = {};
  apps.forEach(a => {
    const loc = normalizeLocation(a.location);
    locCounts[loc] = (locCounts[loc] || 0) + 1;
  });
  const locLabels = Object.keys(locCounts).sort((a, b) => locCounts[b] - locCounts[a]);
  const locData = locLabels.map(l => locCounts[l]);
  const locCanvas = document.getElementById('analyticsLocationChart');
  if (locCanvas) {
    charts.aLocation = new Chart(locCanvas, {
      type: 'bar',
      data: {
        labels: locLabels,
        datasets: [{ label: 'Applications', data: locData, backgroundColor: colors.palette[0], borderRadius: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: colors.text }, grid: { display: false } },
          y: { ticks: { color: colors.text, stepSize: 1 }, grid: { color: colors.grid }, beginAtZero: true }
        }
      }
    });
  }

  // Month line
  destroyChart('aMonth');
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthCounts = new Array(12).fill(0);
  apps.forEach(a => {
    if (a.applicationDate) {
      const m = parseInt(a.applicationDate.slice(5, 7), 10) - 1;
      if (m >= 0 && m < 12) monthCounts[m]++;
    }
  });
  const monthCanvas = document.getElementById('analyticsMonthChart');
  if (monthCanvas) {
    charts.aMonth = new Chart(monthCanvas, {
      type: 'line',
      data: {
        labels: monthNames,
        datasets: [{
          label: 'Applications',
          data: monthCounts,
          borderColor: colors.palette[0],
          backgroundColor: colors.palette[0] + '33',
          fill: true,
          tension: 0.3,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: colors.text }, grid: { display: false } },
          y: { ticks: { color: colors.text, stepSize: 1 }, grid: { color: colors.grid }, beginAtZero: true }
        }
      }
    });
  }

  // Top companies
  destroyChart('aCompany');
  const companyCounts = {};
  apps.forEach(a => {
    const c = a.company || 'Unknown';
    companyCounts[c] = (companyCounts[c] || 0) + 1;
  });
  const sortedCompanies = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const compLabels = sortedCompanies.map(c => c[0]);
  const compData = sortedCompanies.map(c => c[1]);
  const compCanvas = document.getElementById('analyticsCompanyChart');
  if (compCanvas) {
    charts.aCompany = new Chart(compCanvas, {
      type: 'bar',
      data: {
        labels: compLabels,
        datasets: [{ label: 'Applications', data: compData, backgroundColor: colors.palette[1], borderRadius: 6 }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: colors.text, stepSize: 1 }, grid: { color: colors.grid }, beginAtZero: true },
          y: { ticks: { color: colors.text }, grid: { display: false } }
        }
      }
    });
  }

  // Pipeline
  destroyChart('aPipeline');
  const pipelineOrder = ['Applied', 'HR Screening', 'Interviewing', 'Technical Round', 'Final Round', 'Offer Received', 'Accepted'];
  const pipelineCounts = pipelineOrder.map(stage => {
    return apps.filter(a => {
      const s = (a.status || '').toLowerCase();
      if (stage === 'Applied') return s === 'applied' || s === 'wishlist' || s.includes('submitted');
      if (stage === 'HR Screening') return s.includes('screening');
      if (stage === 'Interviewing') return s === 'interviewing' || s.includes('1st') || s.includes('2nd') || s.includes('managerial') || s.includes('hr round');
      if (stage === 'Technical Round') return s.includes('technical');
      if (stage === 'Final Round') return s.includes('final');
      if (stage === 'Offer Received') return s.includes('offer');
      if (stage === 'Accepted') return s === 'accepted';
      return false;
    }).length;
  });
  const pipeCanvas = document.getElementById('analyticsPipelineChart');
  if (pipeCanvas) {
    charts.aPipeline = new Chart(pipeCanvas, {
      type: 'bar',
      data: {
        labels: pipelineOrder,
        datasets: [{
          label: 'Count',
          data: pipelineCounts,
          backgroundColor: ['#4361ee', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#10b981', '#059669'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: colors.text, maxRotation: 45 }, grid: { display: false } },
          y: { ticks: { color: colors.text, stepSize: 1 }, grid: { color: colors.grid }, beginAtZero: true }
        }
      }
    });
  }

  // Insights — full user dataset
  const insights = [];
  if (k.total === 0) {
    insights.push('No applications yet. Add applications to see insights.');
  } else {
    insights.push(`Interview conversion rate: ${k.interviewConversion}%. Offer conversion: ${k.offerConversion}%.`);
    const topLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0];
    if (topLoc) insights.push(`Highest number of applications are in ${topLoc[0]} (${topLoc[1]} apps).`);
    const topCo = sortedCompanies[0];
    if (topCo) insights.push(`Most applied company: ${topCo[0]} (${topCo[1]} application${topCo[1] > 1 ? 's' : ''}).`);
    const srcCounts = {};
    apps.forEach(a => {
      const src = a.source || 'Other';
      srcCounts[src] = (srcCounts[src] || 0) + 1;
    });
    const topSrc = Object.entries(srcCounts).sort((a, b) => b[1] - a[1])[0];
    if (topSrc) insights.push(`Most common application source: ${topSrc[0]}.`);
    insights.push(`Response rate: ${k.responseRate}% (${k.responded} of ${k.total} applications received a response).`);
  }
  const insightsEl = document.getElementById('analyticsInsightsList');
  if (insightsEl) {
    insightsEl.innerHTML = insights.map(i =>
      `<div class="insight-item"><i class="fas fa-lightbulb"></i>${esc(i)}</div>`
    ).join('');
  }
}

// ---------- Export / Import ----------
function exportJSON() {
  const blob = new Blob([JSON.stringify(applications, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `job-applications-backup-${todayStr()}.json`);
  toast('JSON backup downloaded');
}

function exportCSV() {
  const headers = ['id','applicationDate','company','jobTitle','location','workMode','hrName','hrPhone','hrEmail','source','status','interviewRound','interviewDate','interviewTime','salary','followUpDate','followUpStatus','offerStatus','notes'];
  const rows = applications.map(a => headers.map(h => {
    let v = a[h] || '';
    if (typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))) {
      v = '"' + v.replace(/"/g, '""') + '"';
    }
    return v;
  }).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv' }), `job-applications-${todayStr()}.csv`);
  toast('CSV exported');
}

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(applications.map(a => ({
    'Application ID': a.id,
    'Application Date': a.applicationDate,
    'Company Name': a.company,
    'Job Title / Position': a.jobTitle,
    'Job Location': a.location,
    'Work Mode': a.workMode,
    'Recruiter / HR Name': a.hrName,
    'HR Contact Number': a.hrPhone,
    'HR Email': a.hrEmail,
    'Application Source': a.source,
    'Application Status': a.status,
    'Current Interview Round': a.interviewRound,
    'Interview Date': a.interviewDate,
    'Interview Time': a.interviewTime,
    'Expected Salary': a.salary,
    'Next Follow-up Date': a.followUpDate,
    'Follow-up Status': a.followUpStatus,
    'Offer Status': a.offerStatus,
    'Notes / Remarks': a.notes
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Job Applications');
  XLSX.writeFile(wb, `job-applications-${todayStr()}.xlsx`);
  toast('Excel exported');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setupImport() {
  document.getElementById('importFile')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    try {
      if (name.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error('Invalid JSON format');
        mergeImport(data);
      } else if (name.endsWith('.csv')) {
        const text = await file.text();
        const data = parseCSV(text);
        mergeImport(data);
      } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        const mapped = rows.map(mapExcelRow);
        mergeImport(mapped);
      } else {
        toast('Unsupported file type', 'error');
      }
    } catch (err) {
      toast('Import failed: ' + err.message, 'error');
    }
    e.target.value = '';
  });
}

function mapExcelRow(row) {
  return {
    id: row['Application ID'] || row.id || generateId(),
    applicationDate: normalizeDate(row['Application Date'] || row.applicationDate),
    company: row['Company Name'] || row.company || '',
    jobTitle: row['Job Title / Position'] || row.jobTitle || '',
    location: row['Job Location'] || row.location || '',
    workMode: row['Work Mode'] || row.workMode || '',
    hrName: row['Recruiter / HR Name'] || row.hrName || '',
    hrPhone: String(row['HR Contact Number'] || row.hrPhone || ''),
    hrEmail: row['HR Email'] || row.hrEmail || '',
    source: row['Application Source'] || row.source || '',
    status: row['Application Status'] || row.status || 'Applied',
    interviewRound: row['Current Interview Round'] || row.interviewRound || 'Not Started',
    interviewDate: normalizeDate(row['Interview Date'] || row.interviewDate),
    interviewTime: normalizeTime(row['Interview Time'] || row.interviewTime),
    salary: String(row['Expected Salary'] || row.salary || ''),
    followUpDate: normalizeDate(row['Next Follow-up Date'] || row.followUpDate),
    followUpStatus: row['Follow-up Status'] || row.followUpStatus || 'Not Due',
    offerStatus: row['Offer Status'] || row.offerStatus || 'Not Applicable',
    notes: row['Notes / Remarks'] || row.notes || ''
  };
}

function normalizeDate(v) {
  if (!v) return '';
  if (typeof v === 'number') {
    // Excel serial date
    const d = XLSX.SSF ? null : null;
    const date = new Date((v - 25569) * 86400 * 1000);
    if (!isNaN(date)) return date.toISOString().slice(0, 10);
  }
  if (typeof v === 'string') {
    const m = v.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[0];
    const d = new Date(v);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
  }
  return '';
}

function normalizeTime(v) {
  if (!v) return '';
  if (typeof v === 'number') {
    const totalSec = Math.round(v * 86400);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  if (typeof v === 'string') {
    const m = v.match(/(\d{1,2}):(\d{2})/);
    if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
  }
  return String(v);
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; continue; }
      if (c === ',' && !inQ) { vals.push(cur); cur = ''; continue; }
      cur += c;
    }
    vals.push(cur);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return mapExcelRow(obj);
  });
}

function mergeImport(data) {
  let added = 0, updated = 0;
  data.forEach(item => {
    if (!item.company && !item.jobTitle) return;
    if (!item.id) item.id = generateId();
    const idx = applications.findIndex(a => a.id === item.id);
    if (idx >= 0) {
      applications[idx] = { ...applications[idx], ...item };
      updated++;
    } else {
      applications.push(item);
      added++;
    }
  });
  saveApplications();
  renderAll();
  toast(`Imported: ${added} added, ${updated} updated`);
}

function clearAllData() {
  showConfirm('Delete ALL applications? This cannot be undone.', () => {
    applications = [];
    saveApplications();
    renderAll();
    toast('All data cleared');
  });
}

// Close modals on backdrop click
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', (e) => {
    if (e.target === m) {
      m.classList.remove('show');
      confirmCallback = null;
    }
  });
});
