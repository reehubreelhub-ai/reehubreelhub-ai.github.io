/* ============================================================
   ReelHub Admin — admin.js (FINAL v4 — FULL UPDATED)
   Dashboard + Users + Videos + Payments + Wallet + Admins + Reports
   ✅ Wallet section added (approve/reject withdrawals)
   ✅ Time-based Blue Tick
   ✅ Payment Plans + UPI Settings
   ✅ All bugs fixed
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc, serverTimestamp,
  orderBy, limit, writeBatch, Timestamp,
  increment  // ✅ IMPORTANT for wallet
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* ============================================================
   FIREBASE CONFIG
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyC6421R1kr0jYwUJFbjB2YzIerlJw_cdLc",
  authDomain: "reelhub-24616.firebaseapp.com",
  projectId: "reelhub-24616",
  storageBucket: "reelhub-24616.appspot.com",
  messagingSenderId: "397521504045",
  appId: "1:397521504045:web:bf6d3652a7375fd632b5a4",
  measurementId: "G-81RN37XN6H"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db   = getFirestore(firebaseApp);

/* ============================================================
   🔐 ADMIN EMAILS
   ============================================================ */
const HARDCODED_ADMIN_EMAILS = ["reehubreelhub@gmail.com"];
let ADMIN_EMAILS = [...HARDCODED_ADMIN_EMAILS];

async function loadAdminEmails() {
  try {
    const snap = await getDoc(doc(db, 'admin_config', 'emails'));
    if (snap.exists()) {
      const list = snap.data().list || [];
      ADMIN_EMAILS = [...new Set(
        [...HARDCODED_ADMIN_EMAILS, ...list].map(e => String(e).toLowerCase().trim())
      )];
    }
  } catch (e) {
    ADMIN_EMAILS = [...HARDCODED_ADMIN_EMAILS];
  }
}

function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(String(email).toLowerCase().trim());
}

function isSuperAdmin(email) {
  if (!email) return false;
  return HARDCODED_ADMIN_EMAILS.map(e => e.toLowerCase().trim())
    .includes(String(email).toLowerCase().trim());
}

/* ============================================================
   STATE
   ============================================================ */
let currentAdmin = null;
let currentAdminProfile = null;
let currentPage = 'dashboard';
let isLoggingIn = false;
let cachedData = { users: [], videos: [], comments: [], invites: [], reports: [] };
let currentUpi = '';
let currentQr = '';

/* ============================================================
   DOM
   ============================================================ */
const loader       = document.getElementById('loader');
const loginScreen  = document.getElementById('adminLogin');
const appScreen    = document.getElementById('adminApp');
const loginBtn     = document.getElementById('adminLoginBtn');
const loginMsg     = document.getElementById('adminLoginMsg');
const adminContent = document.getElementById('adminContent');
const adminNameEl  = document.getElementById('adminName');
const modalOverlay = document.getElementById('adminModal');
const modalTitle   = document.getElementById('modalTitle');
const modalBody    = document.getElementById('modalBody');

/* ============================================================
   HELPERS
   ============================================================ */
function safeNum(v) {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return isNaN(n) || !isFinite(n) ? 0 : n;
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' hr ago';
  const days = Math.floor(hrs / 24);
  return days + ' day' + (days > 1 ? 's' : '') + ' ago';
}

function defaultAvatar(name) {
  const letter = (name || '?').trim().charAt(0).toUpperCase().replace(/[<>&"']/g, '') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1e1e28"/><text x="50" y="50" font-size="44" font-family="sans-serif" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${letter}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function setButtonLoading(btn, loading = true) {
  if (!btn) return;
  if (loading) {
    if (!btn.classList.contains('loading')) {
      btn.dataset.originalText = btn.innerHTML;
    }
    btn.classList.add('loading');
    btn.disabled = true;
    btn.innerHTML = 'Wait...';
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    if (btn.dataset.originalText) {
      btn.innerHTML = btn.dataset.originalText;
      delete btn.dataset.originalText;
    }
  }
}

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.style.cssText = `
    background:#1e1e28; color:#fff; padding:12px 16px; border-radius:10px;
    margin-bottom:8px; font-size:13px; display:flex; gap:8px; align-items:center;
    box-shadow:0 4px 12px rgba(0,0,0,0.5);
    border-left:3px solid ${
      type === 'success' ? '#4ade80' :
      type === 'error'   ? '#ff4d4d' :
      type === 'warn'    ? '#ff8a00' : '#4ea8ff'
    };
    max-width:340px; word-wrap:break-word; line-height:1.4;
  `;
  toast.innerHTML = `<span style="flex-shrink:0;">${icons[type] || ''}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity .25s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

function getVideoThumbnail(v) {
  if (!v || !v.url) return defaultAvatar(v?.userName || 'V');
  if (v.thumbnail && typeof v.thumbnail === 'string' && v.thumbnail.startsWith('http')) {
    return v.thumbnail;
  }
  if (v.type === 'photo') return v.url;
  if (v.url.includes('/video/upload/')) {
    return v.url
      .replace('/video/upload/', '/video/upload/so_auto,w_200,h_260,c_fill,q_auto/')
      .replace(/\/v\d+\//, '/')
      .replace(/\.[^.]+$/, '.jpg');
  }
  return v.url;
}

/* ============================================================
   AUTH
   ============================================================ */
loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('adminEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('adminPass').value;

  loginMsg.textContent = '';
  loginMsg.className = 'error-msg';

  if (!email || !pass) {
    loginMsg.textContent = 'Please enter email and password.';
    return;
  }

  isLoggingIn = true;
  loginBtn.disabled = true;
  loginBtn.textContent = 'Checking...';

  try {
    await loadAdminEmails();
    if (!isAdminEmail(email)) {
      loginMsg.textContent = 'Access denied. This email is not an admin.';
      return;
    }

    const result = await signInWithEmailAndPassword(auth, email, pass);
    currentAdmin = result.user;

    try {
      const snap = await getDoc(doc(db, 'users', result.user.uid));
      currentAdminProfile = snap.exists() ? snap.data() : { name: email.split('@')[0] };
    } catch (e) {
      currentAdminProfile = { name: email.split('@')[0] };
    }

    adminNameEl.textContent = currentAdminProfile.name || 'Admin';
    loader.style.display = 'none';
    loginScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    goToPage('dashboard');
  } catch (err) {
    loginMsg.className = 'error-msg';
    try { await signOut(auth); } catch (e) {}
    currentAdmin = null;
    const code = err.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' || code === 'auth/invalid-login-credentials') {
      loginMsg.textContent = 'Invalid email or password.';
    } else if (code === 'auth/too-many-requests') {
      loginMsg.textContent = 'Too many attempts. Try again later.';
    } else {
      loginMsg.textContent = err.message || 'Login failed.';
    }
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
    isLoggingIn = false;
  }
});

document.getElementById('adminPass')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

document.getElementById('adminLogout')?.addEventListener('click', async () => {
  if (!confirm('Logout?')) return;
  try {
    await signOut(auth);
    showToast('Logged out', 'info');
  } catch (e) {
    showToast('Logout failed', 'error');
  }
});

onAuthStateChanged(auth, async (user) => {
  if (isLoggingIn) return;

  if (user) {
    await loadAdminEmails();
    if (!isAdminEmail(user.email)) {
      await signOut(auth);
      currentAdmin = null;
      showLogin();
      return;
    }
    currentAdmin = user;
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      currentAdminProfile = snap.exists() ? snap.data() : { name: user.email.split('@')[0] };
    } catch (e) {
      currentAdminProfile = { name: user.email.split('@')[0] };
    }
    adminNameEl.textContent = currentAdminProfile.name || 'Admin';
    showApp();
    return;
  }

  currentAdmin = null;
  currentAdminProfile = null;
  showLogin();
});

function showLogin() {
  loader.style.display = 'none';
  loginScreen.style.display = 'flex';
  appScreen.style.display = 'none';
  const passEl = document.getElementById('adminPass');
  if (passEl) passEl.value = '';
  if (window.location.hash) history.replaceState(null, '', window.location.pathname);
}

function showApp() {
  loader.style.display = 'none';
  loginScreen.style.display = 'none';
  appScreen.style.display = 'flex';
  const hash = window.location.hash.replace('#', '');
  const validPages = ['dashboard', 'users', 'videos', 'comments', 'payments', 'wallet', 'admins', 'notifications', 'reports'];
  goToPage(validPages.includes(hash) ? hash : 'dashboard');
}

function goToPage(page) {
  document.querySelectorAll('.side-item').forEach(i =>
    i.classList.toggle('active', i.dataset.page === page)
  );
  if (window.location.hash !== '#' + page) {
    history.replaceState(null, '', '#' + page);
  }
  renderPage(page);
}

window.addEventListener('hashchange', () => {
  if (!currentAdmin) return;
  const hash = window.location.hash.replace('#', '');
  const validPages = ['dashboard', 'users', 'videos', 'comments', 'payments', 'wallet', 'admins', 'notifications', 'reports'];
  if (validPages.includes(hash) && hash !== currentPage) goToPage(hash);
});

document.querySelectorAll('.side-item').forEach(item => {
  item.addEventListener('click', () => goToPage(item.dataset.page));
});

/* ============================================================
   PAGE ROUTER
   ============================================================ */
async function renderPage(page) {
  currentPage = page;
  adminContent.innerHTML = `<div class="loader-screen" style="min-height:200px;"><div class="spinner"></div></div>`;
  try {
    if (page === 'dashboard')          await renderDashboard();
    else if (page === 'users')         await renderUsers();
    else if (page === 'videos')        await renderVideos();
    else if (page === 'comments')      await renderComments();
    else if (page === 'payments')      await renderPayments();
    else if (page === 'wallet')        await renderWallet();
    else if (page === 'admins')        await renderAdmins();
    else if (page === 'notifications') await renderNotify();
    else if (page === 'reports')       await renderReports();
  } catch (err) {
    console.error('renderPage error:', err);
    adminContent.innerHTML = `
      <div class="empty-box" style="color:#ff4d4d;">
        ⚠️ Error: ${escapeHtml(err.message || String(err))}
      </div>`;
    showToast('Page load failed: ' + (err.message || 'unknown'), 'error', 5000);
  }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
async function renderDashboard() {
  try {
    const [usersSnap, videosSnap, commentsSnap, reportsSnap, walletSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'posts')),
      getDocs(collection(db, 'comments')),
      getDocs(collection(db, 'reports')),
      getDocs(collection(db, 'wallet_transactions'))
    ]);

    const totalUsers = usersSnap.size;
    const totalVideos = videosSnap.size;
    const totalComments = commentsSnap.size;
    const totalReports = reportsSnap.size;

    let totalLikes = 0, totalViews = 0, shortsCount = 0, longCount = 0, photosCount = 0;
    videosSnap.forEach(d => {
      const data = d.data() || {};
      totalLikes += safeArray(data.likes).length;
      totalViews += safeNum(data.views);
      if (data.type === 'short') shortsCount++;
      else if (data.type === 'long') longCount++;
      else if (data.type === 'photo') photosCount++;
    });

    let pendingWithdrawals = 0, pendingTopups = 0, totalPayout = 0;
    walletSnap.forEach(d => {
      const t = d.data();
      if (t.status === 'pending' && t.category === 'withdrawal') pendingWithdrawals++;
      if (t.status === 'pending' && t.category === 'topup') pendingTopups++;
      if (t.status === 'completed' && t.category === 'withdrawal') totalPayout += safeNum(t.amount);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let todaySignups = 0, todayVideos = 0;
    usersSnap.forEach(d => {
      const created = d.data()?.createdAt?.toDate?.();
      if (created && created >= today) todaySignups++;
    });
    videosSnap.forEach(d => {
      const created = d.data()?.createdAt?.toDate?.();
      if (created && created >= today) todayVideos++;
    });

    adminContent.innerHTML = `
      <div class="page-title-admin">
        <div class="title-text">Dashboard</div>
        <div style="display:flex; gap:8px;">
          <button class="refresh-btn" id="refreshDashBtn">Refresh</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card clickable" data-nav="users"><div class="label">Total Users</div><div class="value pink">${totalUsers}</div></div>
        <div class="stat-card clickable" data-nav="videos"><div class="label">Total Videos</div><div class="value blue">${totalVideos}</div></div>
        <div class="stat-card"><div class="label">Total Likes</div><div class="value orange">${totalLikes}</div></div>
        <div class="stat-card clickable" data-nav="comments"><div class="label">Total Comments</div><div class="value green">${totalComments}</div></div>
        <div class="stat-card"><div class="label">Total Views</div><div class="value">${totalViews}</div></div>
        <div class="stat-card clickable" data-nav="reports"><div class="label">Pending Reports</div><div class="value" style="color:#ff8a00">${totalReports}</div></div>
        <div class="stat-card"><div class="label">Today's Signups</div><div class="value">${todaySignups}</div></div>
        <div class="stat-card"><div class="label">Today's Uploads</div><div class="value">${todayVideos}</div></div>
      </div>

      <div class="stats-grid" style="margin-top:14px;">
        <div class="stat-card clickable" data-nav="wallet">
          <div class="label">Pending Withdrawals</div>
          <div class="value" style="color:#ff8a00">${pendingWithdrawals}</div>
        </div>
        <div class="stat-card clickable" data-nav="wallet">
          <div class="label">Pending Top-ups</div>
          <div class="value" style="color:#4ade80">${pendingTopups}</div>
        </div>
        <div class="stat-card">
          <div class="label">Total Paid Out</div>
          <div class="value" style="color:#ff4d4d">₹${totalPayout}</div>
        </div>
      </div>

      <div class="stats-grid" style="margin-top:14px;">
        <div class="stat-card"><div class="label">Shorts</div><div class="value" style="color:#ff2e63">${shortsCount}</div></div>
        <div class="stat-card"><div class="label">Long Videos</div><div class="value" style="color:#4ea8ff">${longCount}</div></div>
        <div class="stat-card"><div class="label">Photos</div><div class="value" style="color:#4ade80">${photosCount}</div></div>
      </div>
    `;

    document.getElementById('refreshDashBtn')?.addEventListener('click', () => renderDashboard());
    document.querySelectorAll('[data-nav]').forEach(card => {
      card.addEventListener('click', () => goToPage(card.dataset.nav));
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    adminContent.innerHTML = `<div class="empty-box" style="color:#ff4d4d;">⚠️ Failed: ${escapeHtml(err.message || '')}</div>`;
  }
}

/* ============================================================
   USERS
   ============================================================ */
async function renderUsers() {
  try {
    const [usersSnap, postsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'posts'))
    ]);

    cachedData.users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const videoCountMap = {};
    postsSnap.forEach(d => {
      const uid = d.data()?.userId;
      if (uid) videoCountMap[uid] = (videoCountMap[uid] || 0) + 1;
    });

    cachedData.users.forEach(u => {
      u._realVideoCount = videoCountMap[u.id] || 0;
    });

    const bannedCount = cachedData.users.filter(u => u.banned).length;
    const verifiedCount = cachedData.users.filter(u => u.verified).length;

    adminContent.innerHTML = `
      <div class="page-title-admin">
        <div class="title-text">Users (${cachedData.users.length})</div>
        <button class="refresh-btn" id="refreshUsersBtn">Refresh</button>
      </div>
      <div class="table-wrap">
        <div class="table-search">
          <input type="text" id="userSearch" placeholder="Search by name, username or email...">
        </div>
        <div class="filter-tabs" id="userFilterTabs">
          <button class="filter-tab active" data-filter="all">All (${cachedData.users.length})</button>
          <button class="filter-tab" data-filter="verified">Verified (${verifiedCount})</button>
          <button class="filter-tab" data-filter="banned">Banned (${bannedCount})</button>
          <button class="filter-tab" data-filter="admin">Admins (${ADMIN_EMAILS.length})</button>
        </div>
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Videos</th>
                <th>Wallet</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="usersTbody"></tbody>
          </table>
        </div>
      </div>
    `;

    let currentFilter = 'all';
    let currentSearch = '';

    function paint() {
      const q = currentSearch.toLowerCase().trim();
      const list = cachedData.users.filter(u => {
        if (currentFilter === 'verified' && !u.verified) return false;
        if (currentFilter === 'banned' && !u.banned) return false;
        if (currentFilter === 'admin' && !isAdminEmail(u.email)) return false;
        if (!q) return true;
        return (u.name || '').toLowerCase().includes(q)
          || (u.user || '').toLowerCase().includes(q)
          || (u.email || '').toLowerCase().includes(q);
      });

      const tbody = document.getElementById('usersTbody');
      if (!tbody) return;

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h4>No users found</h4></div></td></tr>`;
        return;
      }

      tbody.innerHTML = '';
      list.forEach(u => {
        const tr = document.createElement('tr');
        const avatar = u.photo || defaultAvatar(u.name);
        const roleBadge = isAdminEmail(u.email)
          ? `<span class="badge-pill admin">${isSuperAdmin(u.email) ? 'SUPER' : 'ADMIN'}</span>`
          : `<span style="color:#666">user</span>`;
        const verifiedBadge = u.verified ? ` <span class="badge-pill verified">✓</span>` : '';
        const bannedBadge = u.banned ? ` <span class="badge-pill banned">BANNED</span>` : '';
        const realCount = safeNum(u._realVideoCount);
        const walletBal = safeNum(u.walletBalance);

        tr.innerHTML = `
          <td>
            <div class="user-cell">
              <img src="${avatar}" alt="">
              <div class="info">
                <b>${escapeHtml(u.name || 'Unknown')}${verifiedBadge}${bannedBadge}</b>
                <span>@${escapeHtml(u.user || '')}</span>
              </div>
            </div>
          </td>
          <td style="font-size:12px;">${escapeHtml(u.email || '')}</td>
          <td>${roleBadge}</td>
          <td style="font-weight:700; color:${realCount > 0 ? '#4ade80' : '#666'};">${realCount}</td>
          <td style="font-weight:700; color:${walletBal > 0 ? '#ff8a00' : '#666'};">₹${walletBal}</td>
          <td>
            <div class="actions-cell" style="flex-wrap:wrap; gap:4px;">
              <button class="btn-sm primary" data-action="msg" data-uid="${u.id}">Msg</button>
              <div style="display:flex; gap:4px; align-items:center; background:#0a0a12; padding:2px; border-radius:6px; border:1px solid #333;">
                <select id="tick-select-${u.id}" style="background:transparent; color:#fff; border:none; padding:4px; font-size:11px; outline:none; cursor:pointer;">
                  <option value="none" style="background:#1a1a24;" ${!u.verified ? 'selected' : ''}>Remove Tick</option>
                  <option value="1" style="background:#1a1a24;">1 Day</option>
                  <option value="2" style="background:#1a1a24;">2 Days</option>
                  <option value="30" style="background:#1a1a24;">30 Days</option>
                  <option value="365" style="background:#1a1a24;">1 Year</option>
                </select>
                <button class="btn-sm primary" data-action="apply-tick" data-uid="${u.id}">Apply</button>
              </div>
              <button class="btn-sm ${u.banned ? 'green' : 'danger'}" data-action="ban" data-uid="${u.id}">${u.banned ? 'Unban' : 'Ban'}</button>
              <button class="btn-sm danger" data-action="delete" data-uid="${u.id}">Delete</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => handleUserAction(btn.dataset.action, btn.dataset.uid, btn));
      });
    }

    paint();

    document.getElementById('userSearch')?.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      paint();
    });

    document.getElementById('userFilterTabs')?.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      document.querySelectorAll('#userFilterTabs .filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      paint();
    });

    document.getElementById('refreshUsersBtn')?.addEventListener('click', () => renderUsers());
  } catch (err) {
    console.error('renderUsers error:', err);
    adminContent.innerHTML = `<div class="empty-box" style="color:#ff4d4d;">⚠️ Failed: ${escapeHtml(err.message || '')}</div>`;
  }
}

async function handleUserAction(action, uid, btnEl) {
  const user = cachedData.users.find(u => u.id === uid);
  if (!user) return;

  if (action === 'msg') {
    openMessageModal(user);
    return;
  }

  if (action === 'apply-tick') {
    const selectEl = document.getElementById(`tick-select-${uid}`);
    const duration = selectEl ? selectEl.value : 'none';
    setButtonLoading(btnEl, true);
    try {
      let isVerified = false;
      let verifiedUntil = null;
      if (duration !== 'none') {
        isVerified = true;
        const now = new Date();
        now.setDate(now.getDate() + parseInt(duration, 10));
        verifiedUntil = Timestamp.fromDate(now);
      }
      await updateDoc(doc(db, 'users', uid), { verified: isVerified, verifiedUntil });

      user.verified = isVerified;
      user.verifiedUntil = verifiedUntil;

      if (isVerified) {
        await pushNotification(uid, {
          type: 'verified',
          title: '✅ You are verified!',
          message: `Your account is now verified for ${duration} days.`
        });
        showToast(`Blue Tick active for ${duration} days`, 'success');
      } else {
        showToast('Blue Tick removed', 'info');
      }
      await renderUsers();
    } catch (e) {
      console.error('apply-tick error:', e);
      showToast('Action failed: ' + (e.message || ''), 'error');
      setButtonLoading(btnEl, false);
    }
    return;
  }

  if (action === 'ban') {
    const newVal = !user.banned;
    if (newVal && !confirm(`Ban ${user.name}?`)) return;
    setButtonLoading(btnEl, true);
    try {
      await updateDoc(doc(db, 'users', uid), { banned: newVal });
      user.banned = newVal;
      if (newVal) {
        await pushNotification(uid, {
          type: 'banned',
          title: '🚫 Account banned',
          message: 'Your account has been banned by admin.'
        });
      }
      showToast(newVal ? 'User banned' : 'User unbanned', newVal ? 'warn' : 'success');
      await renderUsers();
    } catch (e) {
      showToast('Action failed', 'error');
      setButtonLoading(btnEl, false);
    }
    return;
  }

  if (action === 'delete') {
    if (!confirm(`DELETE ${user.name}? This cannot be undone.`)) return;
    setButtonLoading(btnEl, true);
    try {
      await cascadeDeleteUser(uid);
      showToast('User deleted', 'success');
      await renderUsers();
    } catch (e) {
      showToast('Delete failed: ' + (e.message || ''), 'error');
      setButtonLoading(btnEl, false);
    }
  }
}

async function cascadeDeleteUser(uid) {
  const collections = ['posts', 'comments', 'stories', 'notifications', 'wallet_transactions', 'referrals'];
  for (const col of collections) {
    try {
      const snap = await getDocs(query(collection(db, col), where('userId', '==', uid)));
      await batchDelete(snap.docs.map(d => d.ref));
    } catch (e) { /* ignore */ }
  }
  await deleteDoc(doc(db, 'users', uid));
}

async function batchDelete(refs) {
  const chunks = [];
  for (let i = 0; i < refs.length; i += 450) chunks.push(refs.slice(i, i + 450));
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(ref => batch.delete(ref));
    await batch.commit();
  }
}

/* ============================================================
   VIDEOS
   ============================================================ */
async function renderVideos() {
  try {
    const snap = await getDocs(collection(db, 'posts'));
    cachedData.videos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    adminContent.innerHTML = `
      <div class="page-title-admin">
        <div class="title-text">Videos (${cachedData.videos.length})</div>
        <button class="refresh-btn" id="refreshVideosBtn">Refresh</button>
      </div>
      <div class="table-wrap">
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>User</th>
                <th>Type</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Caption</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="videosTbody"></tbody>
          </table>
        </div>
      </div>
    `;

    const tbody = document.getElementById('videosTbody');
    if (cachedData.videos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><h4>No videos found</h4></div></td></tr>`;
    } else {
      cachedData.videos.forEach(v => {
        const tr = document.createElement('tr');
        const thumb = getVideoThumbnail(v);
        const typeLabel = v.type === 'short' ? 'SHORT' : v.type === 'long' ? 'LONG' : 'PHOTO';
        const views = safeNum(v.views);
        const likes = safeArray(v.likes).length;

        tr.innerHTML = `
          <td>
            <img src="${thumb}" alt="" loading="lazy"
              style="width:60px;height:80px;object-fit:cover;border-radius:6px;background:#1a1a24;">
          </td>
          <td>
            <div style="font-size:12px;">
              <b>${escapeHtml(v.userName || 'Unknown')}</b><br>
              <span style="color:#666">@${escapeHtml(v.userHandle || '')}</span>
            </div>
          </td>
          <td><span class="badge-pill" style="background:#2a2a3a;color:#4ea8ff;">${typeLabel}</span></td>
          <td style="font-weight:700; color:${views > 0 ? '#4ea8ff' : '#666'};">${views}</td>
          <td style="font-weight:700; color:${likes > 0 ? '#ff2e63' : '#666'};">${likes}</td>
          <td style="max-width:180px;font-size:12px;color:#aaa;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${escapeHtml(v.caption || '—')}
          </td>
          <td>
            <button class="btn-sm danger" data-del-vid="${v.id}">Delete</button>
          </td>
        `;

        tr.querySelector('[data-del-vid]')?.addEventListener('click', async (e) => {
          if (!confirm('Delete this video permanently?')) return;
          const btn = e.currentTarget;
          setButtonLoading(btn, true);
          try {
            await deleteDoc(doc(db, 'posts', v.id));
            showToast('Video deleted', 'success');
            await renderVideos();
          } catch (err) {
            console.error('Delete video error:', err);
            showToast('Delete failed: ' + (err.message || ''), 'error');
            setButtonLoading(btn, false);
          }
        });

        tbody.appendChild(tr);
      });
    }

    document.getElementById('refreshVideosBtn')?.addEventListener('click', () => renderVideos());
  } catch (err) {
    console.error('renderVideos error:', err);
    adminContent.innerHTML = `<div class="empty-box" style="color:#ff4d4d;">⚠️ Failed: ${escapeHtml(err.message || '')}</div>`;
  }
}

async function renderComments() {
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Comments</div></div>
    <div class="empty-box">Coming soon...</div>
  `;
}

/* ============================================================
   PAYMENTS
   ============================================================ */
async function renderPayments() {
  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Payments & Plans</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn-outline" id="editUpiBtn">⚙️ UPI Settings</button>
        <button class="btn-outline" id="addPlanBtn" style="color:#4ade80; border-color:#4ade80;">➕ Add Plan</button>
        <button class="refresh-btn" id="refreshPayBtn">Refresh</button>
      </div>
    </div>

    <div class="section-head"><h3>Active Plans</h3></div>
    <div id="plansList" style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;"></div>

    <div class="section-head"><h3>Payment Requests</h3></div>
    <div class="table-wrap">
      <div class="filter-tabs" id="payFilterTabs">
        <button class="filter-tab active" data-filter="pending">Pending</button>
        <button class="filter-tab" data-filter="all">All History</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Screenshot</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="paymentsTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  try {
    const snap = await getDoc(doc(db, 'admin_config', 'payment'));
    if (snap.exists()) {
      currentUpi = snap.data().upiId || '';
      currentQr  = snap.data().qrUrl || '';
    } else {
      currentUpi = '';
      currentQr  = '';
    }
  } catch (e) {
    currentUpi = '';
    currentQr  = '';
  }

  async function loadPlans() {
    const plansList = document.getElementById('plansList');
    if (!plansList) return;
    plansList.innerHTML = `<div class="empty-box" style="width:100%;">Loading plans...</div>`;
    try {
      const snap = await getDocs(collection(db, 'payment_plans'));
      const plans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      plans.sort((a, b) => safeNum(a.amount) - safeNum(b.amount));

      if (plans.length === 0) {
        plansList.innerHTML = `<div class="empty-box" style="width:100%;">No plans added yet. Click "Add Plan".</div>`;
        return;
      }

      plansList.innerHTML = '';
      plans.forEach(p => {
        const card = document.createElement('div');
        card.className = 'invite-card';
        card.style.cssText = 'flex-direction:column; align-items:flex-start; padding:15px; min-width:120px;';
        card.innerHTML = `
          <b style="font-size:20px; color:#ff2e63;">₹${safeNum(p.amount)}</b>
          <span style="font-size:13px; color:#aaa;">${safeNum(p.days)} Days</span>
          <button class="btn-sm danger" style="margin-top:10px; width:100%;">Delete</button>
        `;
        card.querySelector('button').addEventListener('click', async () => {
          if (!confirm('Delete this plan?')) return;
          try {
            await deleteDoc(doc(db, 'payment_plans', p.id));
            showToast('Plan deleted', 'info');
            await loadPlans();
          } catch (e) {
            showToast('Delete failed', 'error');
          }
        });
        plansList.appendChild(card);
      });
    } catch (e) {
      plansList.innerHTML = `<div class="empty-box" style="width:100%;">Could not load plans.</div>`;
    }
  }
  await loadPlans();

  document.getElementById('editUpiBtn')?.addEventListener('click', () => {
    document.getElementById('adminUpiId').value = currentUpi;
    document.getElementById('adminQrUrl').value = currentQr;
    document.getElementById('paymentSettingsModal').style.display = 'flex';
  });

  document.getElementById('addPlanBtn')?.addEventListener('click', () => {
    document.getElementById('planAmount').value = '';
    document.getElementById('planDays').value = '';
    document.getElementById('addPlanModal').style.display = 'flex';
  });

  let requests = [];
  try {
    const reqSnap = await getDocs(collection(db, 'payment_requests'));
    requests = reqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    requests.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });
  } catch (e) {
    console.error('Load payment requests error:', e);
  }

  let currentFilter = 'pending';

  function paintRequests() {
    const tbody = document.getElementById('paymentsTbody');
    if (!tbody) return;

    const list = requests.filter(r => currentFilter === 'all' || r.status === 'pending');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h4>No requests found</h4></div></td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    list.forEach(r => {
      const tr = document.createElement('tr');
      const dateStr = r.createdAt?.toDate?.() ? timeAgo(r.createdAt.toDate()) : 'now';
      const statusClass = r.status === 'pending' ? 'pending'
        : r.status === 'approved' ? 'accepted' : 'ignored';

      tr.innerHTML = `
        <td>
          <b>${escapeHtml(r.userName || 'Unknown')}</b><br>
          <span style="font-size:11px;color:#888;">@${escapeHtml(r.userHandle || '')}</span>
        </td>
        <td><span class="badge-pill pending">₹${safeNum(r.amount)} - ${safeNum(r.days)} Days</span></td>
        <td>
          ${r.screenshotUrl
            ? `<a href="${escapeHtml(r.screenshotUrl)}" target="_blank" rel="noopener">
                 <img src="${escapeHtml(r.screenshotUrl)}" style="width:50px; height:50px; object-fit:cover; border-radius:6px; border:1px solid #333;">
               </a>`
            : '<span style="color:#666;font-size:11px;">No image</span>'}
        </td>
        <td style="font-size:12px; color:#888;">${dateStr}</td>
        <td><span class="badge-pill ${statusClass}">${escapeHtml(String(r.status || '').toUpperCase())}</span></td>
        <td data-actions="${r.id}"></td>
      `;

      const actionCell = tr.querySelector(`[data-actions="${r.id}"]`);
      if (r.status === 'pending') {
        const approveBtn = document.createElement('button');
        approveBtn.className = 'btn-sm green';
        approveBtn.textContent = 'Approve ✓';
        approveBtn.addEventListener('click', () => approvePayment(r, approveBtn));

        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'btn-sm danger';
        rejectBtn.style.marginLeft = '4px';
        rejectBtn.textContent = 'Reject ✕';
        rejectBtn.addEventListener('click', () => rejectPayment(r, rejectBtn));

        actionCell.appendChild(approveBtn);
        actionCell.appendChild(rejectBtn);
      } else {
        actionCell.innerHTML = '<span style="color:#555;font-size:12px;">—</span>';
      }

      tbody.appendChild(tr);
    });
  }

  paintRequests();

  document.getElementById('payFilterTabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('#payFilterTabs .filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    paintRequests();
  });

  document.getElementById('refreshPayBtn')?.addEventListener('click', () => renderPayments());
}

async function approvePayment(req, btnEl) {
  if (!confirm('Approve this payment and give Blue Tick?')) return;
  setButtonLoading(btnEl, true);
  try {
    const days = safeNum(req.days);
    const now = new Date();
    now.setDate(now.getDate() + days);

    await updateDoc(doc(db, 'users', req.userId), {
      verified: true,
      verifiedUntil: Timestamp.fromDate(now)
    });
    await updateDoc(doc(db, 'payment_requests', req.id), {
      status: 'approved',
      approvedAt: serverTimestamp()
    });
    await pushNotification(req.userId, {
      type: 'verified',
      title: '✅ Payment Approved!',
      message: `Your Blue Tick is now active for ${days} days.`
    });
    showToast('Tick Approved!', 'success');
    await renderPayments();
  } catch (e) {
    console.error('approvePayment error:', e);
    showToast('Error: ' + (e.message || 'unknown'), 'error');
    setButtonLoading(btnEl, false);
  }
}

async function rejectPayment(req, btnEl) {
  if (!confirm('Reject this payment?')) return;
  setButtonLoading(btnEl, true);
  try {
    await updateDoc(doc(db, 'payment_requests', req.id), {
      status: 'rejected',
      rejectedAt: serverTimestamp()
    });
    await pushNotification(req.userId, {
      type: 'warning',
      title: '❌ Payment Rejected',
      message: 'Your payment screenshot was invalid. Please try again.'
    });
    showToast('Payment Rejected', 'warn');
    await renderPayments();
  } catch (e) {
    console.error('rejectPayment error:', e);
    showToast('Error', 'error');
    setButtonLoading(btnEl, false);
  }
}

/* ============================================================
   💰 WALLET
   ============================================================ */
async function renderWallet() {
  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Wallet Transactions</div>
      <button class="refresh-btn" id="refreshWalletBtn">Refresh</button>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-bottom:16px;">
      <div class="stat-card"><div class="label">Pending Top-ups</div><div class="value" style="color:#4ade80" id="pendingTopups">0</div></div>
      <div class="stat-card"><div class="label">Pending Withdrawals</div><div class="value" style="color:#ff8a00" id="pendingWithdrawals">0</div></div>
      <div class="stat-card"><div class="label">Total Transactions</div><div class="value" id="totalWtx">0</div></div>
    </div>

    <div class="filter-tabs" id="walletFilterTabs">
      <button class="filter-tab active" data-filter="pending">Pending</button>
      <button class="filter-tab" data-filter="topup">Top-ups</button>
      <button class="filter-tab" data-filter="withdrawal">Withdrawals</button>
      <button class="filter-tab" data-filter="all">All</button>
    </div>

    <div class="table-wrap">
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>UPI / Proof</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="walletTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  let transactions = [];
  try {
    const snap = await getDocs(collection(db, 'wallet_transactions'));
    transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    transactions.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });
  } catch (e) { console.warn('Load wallet tx error:', e); }

  const pendingTopups = transactions.filter(t => t.status === 'pending' && t.category === 'topup').length;
  const pendingWithdrawals = transactions.filter(t => t.status === 'pending' && t.category === 'withdrawal').length;
  document.getElementById('pendingTopups').textContent = pendingTopups;
  document.getElementById('pendingWithdrawals').textContent = pendingWithdrawals;
  document.getElementById('totalWtx').textContent = transactions.length;

  let currentFilter = 'pending';

  function paint() {
    const tbody = document.getElementById('walletTbody');
    if (!tbody) return;

    let list = transactions;
    if (currentFilter === 'pending') list = transactions.filter(t => t.status === 'pending');
    else if (currentFilter === 'topup') list = transactions.filter(t => t.category === 'topup');
    else if (currentFilter === 'withdrawal') list = transactions.filter(t => t.category === 'withdrawal');

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><h4>No transactions</h4></div></td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    list.forEach(t => {
      const tr = document.createElement('tr');
      const dateStr = t.createdAt?.toDate?.() ? timeAgo(t.createdAt.toDate()) : 'now';
      const statusColor = t.status === 'completed' ? '#4ade80'
        : t.status === 'pending' ? '#ff8a00'
        : '#ff4d4d';
      const typeLabel = t.category === 'topup' ? '💰 Top-up'
        : t.category === 'withdrawal' ? '💸 Withdrawal'
        : t.category === 'referral' ? '🎁 Referral'
        : t.category === 'verification' ? '⭐ Verification'
        : t.category === 'refund' ? '↩️ Refund'
        : t.category || 'Other';
      const sign = t.type === 'credit' ? '+' : '−';
      const amountColor = t.type === 'credit' ? '#4ade80' : '#ff2e63';

      let upiOrProof = '—';
      if (t.upiId) {
        upiOrProof = `<div style="font-family:monospace;font-size:11px;">${escapeHtml(t.upiId)}</div>`;
      } else if (t.screenshotUrl) {
        upiOrProof = `<a href="${escapeHtml(t.screenshotUrl)}" target="_blank" rel="noopener">
          <img src="${escapeHtml(t.screenshotUrl)}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #333;">
        </a>`;
      }

      tr.innerHTML = `
        <td>
          <b>${escapeHtml(t.userName || 'Unknown')}</b><br>
          <span style="font-size:11px;color:#888;">@${escapeHtml(t.userHandle || '')}</span>
        </td>
        <td style="font-size:12px;">${typeLabel}</td>
        <td><b style="color:${amountColor};">${sign}₹${safeNum(t.amount)}</b></td>
        <td>${upiOrProof}</td>
        <td style="font-size:11px;color:#888;">${dateStr}</td>
        <td><span style="color:${statusColor};font-weight:800;font-size:11px;">${escapeHtml((t.status||'').toUpperCase())}</span></td>
        <td data-wa="${t.id}"></td>
      `;

      const actionsCell = tr.querySelector(`[data-wa="${t.id}"]`);
      if (t.status === 'pending') {
        const approveBtn = document.createElement('button');
        approveBtn.className = 'btn-sm green';
        approveBtn.textContent = 'Approve ✓';
        approveBtn.addEventListener('click', () => approveWalletTx(t, approveBtn));

        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'btn-sm danger';
        rejectBtn.style.marginLeft = '4px';
        rejectBtn.textContent = 'Reject ✕';
        rejectBtn.addEventListener('click', () => rejectWalletTx(t, rejectBtn));

        actionsCell.appendChild(approveBtn);
        actionsCell.appendChild(rejectBtn);
      } else {
        actionsCell.innerHTML = '<span style="color:#555;font-size:11px;">—</span>';
      }

      tbody.appendChild(tr);
    });
  }

  paint();

  document.getElementById('walletFilterTabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('#walletFilterTabs .filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    paint();
  });

  document.getElementById('refreshWalletBtn')?.addEventListener('click', () => renderWallet());
}

async function approveWalletTx(tx, btnEl) {
  const amt = safeNum(tx.amount);

  let msg = '';
  if (tx.category === 'topup') {
    msg = `Approve ₹${amt} TOP-UP for ${tx.userName}?\n\n⚠️ Confirm you RECEIVED ₹${amt} in your UPI.\n\nOn approval: ₹${amt} will be ADDED to user's wallet.`;
  } else if (tx.category === 'withdrawal') {
    msg = `Approve ₹${amt} WITHDRAWAL for ${tx.userName}?\n\n⚠️ Confirm you SENT ₹${amt} to UPI: ${tx.upiId}\n\nOn approval: transaction marked complete.`;
  } else {
    msg = `Approve this ₹${amt} transaction?`;
  }

  if (!confirm(msg)) return;

  setButtonLoading(btnEl, true);
  try {
    await updateDoc(doc(db, 'wallet_transactions', tx.id), {
      status: 'completed',
      approvedAt: serverTimestamp(),
      approvedBy: currentAdmin?.email || 'admin'
    });

    if (tx.category === 'topup') {
      await updateDoc(doc(db, 'users', tx.userId), {
        walletBalance: increment(amt)
      });
    }

    await pushNotification(tx.userId, {
      type: 'wallet',
      title: tx.category === 'topup' ? '✅ Wallet Top-up Approved!' : '✅ Withdrawal Approved!',
      message: tx.category === 'topup'
        ? `₹${amt} added to your wallet balance.`
        : `₹${amt} sent to ${tx.upiId}. Check your UPI app.`
    });

    showToast('Approved', 'success');
    await renderWallet();
  } catch (e) {
    console.error('Approve wallet error:', e);
    showToast('Failed: ' + (e.message || ''), 'error');
    setButtonLoading(btnEl, false);
  }
}

async function rejectWalletTx(tx, btnEl) {
  const amt = safeNum(tx.amount);
  if (!confirm(`Reject ₹${amt} ${tx.category}?\n\n${tx.category === 'withdrawal' ? 'Balance will be REFUNDED.' : 'No balance change.'}`)) return;

  setButtonLoading(btnEl, true);
  try {
    await updateDoc(doc(db, 'wallet_transactions', tx.id), {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectedBy: currentAdmin?.email || 'admin'
    });

    if (tx.category === 'withdrawal') {
      await updateDoc(doc(db, 'users', tx.userId), {
        walletBalance: increment(amt)
      });
    }

    await pushNotification(tx.userId, {
      type: 'wallet',
      title: '❌ Transaction Rejected',
      message: tx.category === 'withdrawal'
        ? `₹${amt} refunded to your wallet.`
        : `Your ₹${amt} top-up request was rejected.`
    });

    showToast('Rejected', 'warn');
    await renderWallet();
  } catch (e) {
    console.error('Reject wallet error:', e);
    showToast('Failed: ' + (e.message || ''), 'error');
    setButtonLoading(btnEl, false);
  }
}

/* ============================================================
   ADMINS / NOTIFS / REPORTS
   ============================================================ */
async function renderAdmins() {
  await loadAdminEmails();
  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Admins</div>
      <button class="refresh-btn" id="refreshAdminsBtn">Refresh</button>
    </div>
    <div class="section-head">
      <h3>Current Admins (${ADMIN_EMAILS.length})</h3>
      <button class="btn-outline" id="inviteNewBtn">+ Invite</button>
    </div>
    <div id="adminsList"></div>
  `;

  const adminsList = document.getElementById('adminsList');
  ADMIN_EMAILS.forEach(email => {
    const card = document.createElement('div');
    card.className = 'invite-card';
    card.innerHTML = `
      <div class="info">
        <b>${escapeHtml(email)}</b>
        ${isSuperAdmin(email) ? ' <span class="badge-pill admin">SUPER</span>' : ''}
      </div>`;
    adminsList.appendChild(card);
  });

  document.getElementById('inviteNewBtn')?.addEventListener('click', () => {
    openModal('Invite Admin', `<p>Admin invitation feature coming soon.</p>`);
  });
  document.getElementById('refreshAdminsBtn')?.addEventListener('click', () => renderAdmins());
}

async function renderNotify() {
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Send Notification</div></div>
    <div class="empty-box">Coming soon...</div>
  `;
}

async function renderReports() {
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Reports</div></div>
    <div class="empty-box">Coming soon...</div>
  `;
}

/* ============================================================
   MODALS & HELPERS
   ============================================================ */
function openMessageModal(user) {
  openModal('Message', `
    <p>Message to <b>${escapeHtml(user.name)}</b></p>
    <div class="error-msg">Feature coming soon</div>
  `);
}

function openModal(title, html) {
  if (!modalOverlay) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modalOverlay.style.display = 'flex';
}

document.getElementById('modalClose')?.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
  modalBody.innerHTML = '';
});

modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = 'none';
    modalBody.innerHTML = '';
  }
});

async function pushNotification(userId, data) {
  if (!userId) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type: data.type || 'info',
      title: data.title || '',
      message: data.message || '',
      fromUserId: currentAdmin?.uid || 'admin',
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('pushNotification failed:', e);
  }
}

/* ============================================================
   SAVE HANDLERS (once)
   ============================================================ */
document.getElementById('savePaymentSettingsBtn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  setButtonLoading(btn, true);
  try {
    const upi = document.getElementById('adminUpiId').value.trim();
    const qr  = document.getElementById('adminQrUrl').value.trim();
    await setDoc(doc(db, 'admin_config', 'payment'), { upiId: upi, qrUrl: qr });
    currentUpi = upi;
    currentQr  = qr;
    showToast('Settings Saved!', 'success');
    document.getElementById('paymentSettingsModal').style.display = 'none';
    if (currentPage === 'payments') await renderPayments();
  } catch (err) {
    console.error('Save UPI error:', err);
    showToast('Save failed: ' + (err.message || ''), 'error');
  } finally {
    setButtonLoading(btn, false);
  }
});

document.getElementById('savePlanBtn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const amount = parseInt(document.getElementById('planAmount').value, 10);
  const days   = parseInt(document.getElementById('planDays').value, 10);
  if (!amount || amount <= 0 || !days || days <= 0) {
    showToast('Enter valid amount and days', 'error');
    return;
  }
  setButtonLoading(btn, true);
  try {
    await addDoc(collection(db, 'payment_plans'), {
      amount,
      days,
      createdAt: serverTimestamp()
    });
    showToast('Plan Added!', 'success');
    document.getElementById('addPlanModal').style.display = 'none';
    if (currentPage === 'payments') await renderPayments();
  } catch (err) {
    console.error('Save plan error:', err);
    showToast('Save failed: ' + (err.message || ''), 'error');
  } finally {
    setButtonLoading(btn, false);
  }
});

console.log('✅ Admin Panel v4 loaded — Wallet + Payment + Blue Tick + Referral support');