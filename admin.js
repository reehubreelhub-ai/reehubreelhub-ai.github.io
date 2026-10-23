/* ============================================================
   ReelHub Admin — admin.js (ULTIMATE DEBUG VERSION)
   ✅ Login fix with detailed alerts
   ✅ Dashboard error handling
   ✅ Wallet + Payments + All sections
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc, serverTimestamp,
  writeBatch, Timestamp, increment
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
  appId: "1:397521504045:web:bf6d3652a7375fd632b5a4"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

/* ============================================================
   🔐 ADMIN EMAILS (Always accessible)
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
      console.log("✅ Admin list loaded:", ADMIN_EMAILS);
    } else {
      console.log("⚠️ admin_config/emails not found. Using hardcoded only.");
    }
  } catch (e) {
    console.warn("⚠️ Could not load admin emails (permission?). Using hardcoded only.", e.message);
  }
}

function isAdminEmail(email) {
  if (!email) return false;
  const normalized = String(email).toLowerCase().trim();
  return ADMIN_EMAILS.includes(normalized) || HARDCODED_ADMIN_EMAILS.includes(normalized);
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
let cachedData = { users: [], videos: [] };
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
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  return days + 'd ago';
}

function defaultAvatar(name) {
  const letter = (name || '?').trim().charAt(0).toUpperCase().replace(/[<>&"']/g, '') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1e1e28"/><text x="50" y="50" font-size="44" font-family="sans-serif" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${letter}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function setButtonLoading(btn, loading = true) {
  if (!btn) return;
  if (loading) {
    if (!btn.classList.contains('loading')) btn.dataset.originalText = btn.innerHTML;
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
  if (!container) {
    alert(message);
    return;
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    background:#1e1e28; color:#fff; padding:12px 16px; border-radius:10px;
    margin-bottom:8px; font-size:13px; display:flex; gap:8px; align-items:center;
    box-shadow:0 4px 12px rgba(0,0,0,0.5);
    border-left:3px solid ${
      type === 'success' ? '#4ade80' :
      type === 'error' ? '#ff4d4d' :
      type === 'warn' ? '#ff8a00' : '#4ea8ff'
    };
    max-width:340px; word-wrap:break-word; line-height:1.4;
  `;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity .25s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

/* ============================================================
   LOGIN — THE CRITICAL PART
   ============================================================ */
loginBtn.addEventListener('click', async () => {
  const emailInput = document.getElementById('adminEmail');
  const passInput = document.getElementById('adminPass');
  
  const email = emailInput.value.trim().toLowerCase();
  const pass = passInput.value;

  loginMsg.textContent = '';
  loginMsg.className = 'error-msg';

  if (!email || !pass) {
    loginMsg.textContent = 'Please enter email and password.';
    return;
  }

  isLoggingIn = true;
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    console.log("🔵 Step 1: Attempting sign in for:", email);
    alert("Step 1: Attempting login for:\n" + email);

    // Sign in
    const result = await signInWithEmailAndPassword(auth, email, pass);
    console.log("✅ Auth Success! UID:", result.user.uid);
    alert("✅ Login Success!\nUID: " + result.user.uid);

    currentAdmin = result.user;

    // Load admin emails (with the user now authenticated)
    console.log("🔵 Step 2: Loading admin emails...");
    await loadAdminEmails();

    // Check if admin
    const isAdmin = isAdminEmail(email) || isSuperAdmin(email);
    console.log("🔵 Is Admin?", isAdmin, "ADMIN_EMAILS:", ADMIN_EMAILS);
    
    if (!isAdmin) {
      alert("❌ Access Denied!\n\nAapka email admin list me nahi hai:\n" + email + "\n\nAllowed admins:\n" + ADMIN_EMAILS.join(", "));
      await signOut(auth);
      currentAdmin = null;
      loginMsg.textContent = '❌ Access Denied. Email not in admin list.';
      return;
    }

    // Load profile
    console.log("🔵 Step 3: Loading profile...");
    try {
      const snap = await getDoc(doc(db, 'users', result.user.uid));
      currentAdminProfile = snap.exists() ? snap.data() : { name: email.split('@')[0] };
    } catch (e) {
      currentAdminProfile = { name: email.split('@')[0] };
    }

    // Show app
    console.log("✅ Step 4: Showing app...");
    if (adminNameEl) adminNameEl.textContent = currentAdminProfile.name || 'Admin';
    if (loader) loader.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'none';
    if (appScreen) appScreen.style.display = 'flex';
    
    goToPage('dashboard');
    
    alert("✅ Dashboard loaded successfully!");

  } catch (err) {
    console.error('❌ Login Error:', err);
    try { await signOut(auth); } catch (e) {}
    currentAdmin = null;
    loginMsg.className = 'error-msg';

    const code = err.code || '';
    let errMsg = '';
    
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-login-credentials') {
      errMsg = 'Invalid email or password.';
    } else if (code === 'auth/too-many-requests') {
      errMsg = 'Too many attempts. Try again later.';
    } else if (code === 'auth/network-request-failed') {
      errMsg = 'Network error. Check internet.';
    } else if (code === 'auth/invalid-email') {
      errMsg = 'Invalid email format.';
    } else {
      errMsg = err.message || 'Login failed.';
    }
    
    loginMsg.textContent = errMsg;
    alert("❌ Login Failed!\n\n" + errMsg + "\n\nCode: " + code);
    
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
    isLoggingIn = false;
  }
});

document.getElementById('adminPass')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

/* ============================================================
   LOGOUT
   ============================================================ */
document.getElementById('adminLogout')?.addEventListener('click', async () => {
  if (!confirm('Logout?')) return;
  try {
    await signOut(auth);
    showToast('Logged out', 'info');
  } catch (e) {
    showToast('Logout failed', 'error');
  }
});

/* ============================================================
   AUTH STATE LISTENER
   ============================================================ */
onAuthStateChanged(auth, async (user) => {
  console.log("🔥 Auth state changed:", user ? user.email : "null");

  // Skip if we're in the middle of login
  if (isLoggingIn) return;

  if (user) {
    currentAdmin = user;
    await loadAdminEmails();
    
    if (!isAdminEmail(user.email) && !isSuperAdmin(user.email)) {
      console.log("❌ User not admin, signing out");
      await signOut(auth);
      currentAdmin = null;
      showLogin();
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      currentAdminProfile = snap.exists() ? snap.data() : { name: user.email.split('@')[0] };
    } catch (e) {
      currentAdminProfile = { name: user.email.split('@')[0] };
    }

    if (adminNameEl) adminNameEl.textContent = currentAdminProfile.name || 'Admin';
    showApp();
    return;
  }

  currentAdmin = null;
  currentAdminProfile = null;
  showLogin();
});

function showLogin() {
  if (loader) loader.style.display = 'none';
  if (loginScreen) loginScreen.style.display = 'flex';
  if (appScreen) appScreen.style.display = 'none';
  const passEl = document.getElementById('adminPass');
  if (passEl) passEl.value = '';
}

function showApp() {
  if (loader) loader.style.display = 'none';
  if (loginScreen) loginScreen.style.display = 'none';
  if (appScreen) appScreen.style.display = 'flex';
  
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

document.querySelectorAll('.side-item').forEach(item => {
  item.addEventListener('click', () => goToPage(item.dataset.page));
});

/* ============================================================
   PAGE ROUTER
   ============================================================ */
async function renderPage(page) {
  currentPage = page;
  adminContent.innerHTML = `<div class="loader-screen" style="min-height:200px;display:flex;justify-content:center;align-items:center;"><div class="spinner"></div></div>`;
  
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
      <div style="padding:40px; text-align:center; color:#ff4d4d;">
        ⚠️ Error loading page: ${escapeHtml(err.message || 'Unknown')}
        <br><br>
        <button onclick="location.reload()" style="padding:10px 20px; background:#ff2e63; color:#fff; border:none; border-radius:8px; cursor:pointer;">Reload</button>
      </div>`;
  }
}

/* ============================================================
   DASHBOARD — Safe version that won't break on permissions
   ============================================================ */
async function renderDashboard() {
  let totalUsers = 0, totalVideos = 0, totalComments = 0, totalReports = 0;
  let totalLikes = 0, totalViews = 0, shortsCount = 0, longCount = 0, photosCount = 0;
  let pendingWithdrawals = 0, pendingTopups = 0, totalPayout = 0;
  let todaySignups = 0, todayVideos = 0;
  const today = new Date(); today.setHours(0,0,0,0);

  // Load each collection independently (so if one fails, others still work)
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    totalUsers = usersSnap.size;
    usersSnap.forEach(d => {
      const created = d.data()?.createdAt?.toDate?.();
      if (created && created >= today) todaySignups++;
    });
  } catch (e) { console.warn("Users load error:", e.message); }

  try {
    const videosSnap = await getDocs(collection(db, 'posts'));
    totalVideos = videosSnap.size;
    videosSnap.forEach(d => {
      const data = d.data() || {};
      totalLikes += safeArray(data.likes).length;
      totalViews += safeNum(data.views);
      if (data.type === 'short') shortsCount++;
      else if (data.type === 'long') longCount++;
      else if (data.type === 'photo') photosCount++;
      const created = data?.createdAt?.toDate?.();
      if (created && created >= today) todayVideos++;
    });
  } catch (e) { console.warn("Videos load error:", e.message); }

  try {
    const commentsSnap = await getDocs(collection(db, 'comments'));
    totalComments = commentsSnap.size;
  } catch (e) { console.warn("Comments load error:", e.message); }

  try {
    const reportsSnap = await getDocs(collection(db, 'reports'));
    totalReports = reportsSnap.size;
  } catch (e) { console.warn("Reports load error:", e.message); }

  try {
    const walletSnap = await getDocs(collection(db, 'wallet_transactions'));
    walletSnap.forEach(d => {
      const t = d.data();
      if (t.status === 'pending' && t.category === 'withdrawal') pendingWithdrawals++;
      if (t.status === 'pending' && t.category === 'topup') pendingTopups++;
      if (t.status === 'completed' && t.category === 'withdrawal') totalPayout += safeNum(t.amount);
    });
  } catch (e) { console.warn("Wallet load error:", e.message); }

  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Dashboard</div>
      <button class="refresh-btn" id="refreshDashBtn">Refresh</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="label">Total Users</div><div class="value pink">${totalUsers}</div></div>
      <div class="stat-card"><div class="label">Total Videos</div><div class="value blue">${totalVideos}</div></div>
      <div class="stat-card"><div class="label">Total Likes</div><div class="value orange">${totalLikes}</div></div>
      <div class="stat-card"><div class="label">Total Comments</div><div class="value green">${totalComments}</div></div>
      <div class="stat-card"><div class="label">Total Views</div><div class="value">${totalViews}</div></div>
      <div class="stat-card"><div class="label">Pending Reports</div><div class="value" style="color:#ff8a00">${totalReports}</div></div>
      <div class="stat-card"><div class="label">Today's Signups</div><div class="value">${todaySignups}</div></div>
      <div class="stat-card"><div class="label">Today's Uploads</div><div class="value">${todayVideos}</div></div>
    </div>

    <div class="stats-grid" style="margin-top:14px;">
      <div class="stat-card"><div class="label">Pending Withdrawals</div><div class="value" style="color:#ff8a00">${pendingWithdrawals}</div></div>
      <div class="stat-card"><div class="label">Pending Top-ups</div><div class="value" style="color:#4ade80">${pendingTopups}</div></div>
      <div class="stat-card"><div class="label">Total Paid Out</div><div class="value" style="color:#ff4d4d">₹${totalPayout}</div></div>
    </div>

    <div class="stats-grid" style="margin-top:14px;">
      <div class="stat-card"><div class="label">Shorts</div><div class="value" style="color:#ff2e63">${shortsCount}</div></div>
      <div class="stat-card"><div class="label">Long Videos</div><div class="value" style="color:#4ea8ff">${longCount}</div></div>
      <div class="stat-card"><div class="label">Photos</div><div class="value" style="color:#4ade80">${photosCount}</div></div>
    </div>
  `;

  document.getElementById('refreshDashBtn')?.addEventListener('click', () => renderDashboard());
}

/* ============================================================
   USERS
   ============================================================ */
async function renderUsers() {
  try {
    const [usersSnap, postsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'posts')).catch(() => ({ forEach: () => {} }))
    ]);

    cachedData.users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const videoCountMap = {};
    postsSnap.forEach(d => {
      const uid = d.data()?.userId;
      if (uid) videoCountMap[uid] = (videoCountMap[uid] || 0) + 1;
    });
    cachedData.users.forEach(u => u._realVideoCount = videoCountMap[u.id] || 0);

    const bannedCount = cachedData.users.filter(u => u.banned).length;
    const verifiedCount = cachedData.users.filter(u => u.verified).length;

    adminContent.innerHTML = `
      <div class="page-title-admin">
        <div class="title-text">Users (${cachedData.users.length})</div>
        <button class="refresh-btn" id="refreshUsersBtn">Refresh</button>
      </div>
      <div class="table-wrap">
        <div class="table-search">
          <input type="text" id="userSearch" placeholder="Search users...">
        </div>
        <div class="filter-tabs" id="userFilterTabs">
          <button class="filter-tab active" data-filter="all">All (${cachedData.users.length})</button>
          <button class="filter-tab" data-filter="verified">Verified (${verifiedCount})</button>
          <button class="filter-tab" data-filter="banned">Banned (${bannedCount})</button>
        </div>
        <div style="overflow-x:auto;">
          <table class="admin-table">
            <thead><tr><th>User</th><th>Email</th><th>Videos</th><th>Wallet</th><th>Actions</th></tr></thead>
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
        if (!q) return true;
        return (u.name || '').toLowerCase().includes(q)
          || (u.user || '').toLowerCase().includes(q)
          || (u.email || '').toLowerCase().includes(q);
      });

      const tbody = document.getElementById('usersTbody');
      if (!tbody) return;

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:#666;">No users</td></tr>`;
        return;
      }

      tbody.innerHTML = '';
      list.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${escapeHtml(u.name || 'Unknown')}</b><br><span style="font-size:11px;color:#888;">@${escapeHtml(u.user || '')}</span></td>
          <td style="font-size:12px;">${escapeHtml(u.email || '')}</td>
          <td>${safeNum(u._realVideoCount)}</td>
          <td>₹${safeNum(u.walletBalance)}</td>
          <td>
            <button class="btn-sm ${u.banned ? 'green' : 'danger'}" data-action="ban" data-uid="${u.id}">${u.banned ? 'Unban' : 'Ban'}</button>
          </td>
        `;
        tr.querySelector('[data-action="ban"]').addEventListener('click', async () => {
          const newVal = !u.banned;
          if (!confirm(`${newVal ? 'Ban' : 'Unban'} ${u.name}?`)) return;
          try {
            await updateDoc(doc(db, 'users', u.id), { banned: newVal });
            showToast(newVal ? 'Banned' : 'Unbanned', 'success');
            renderUsers();
          } catch (e) { showToast('Failed', 'error'); }
        });
        tbody.appendChild(tr);
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
    console.error(err);
    adminContent.innerHTML = `<div style="padding:40px;color:#ff4d4d;">⚠️ ${escapeHtml(err.message)}</div>`;
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
            <thead><tr><th>Preview</th><th>User</th><th>Type</th><th>Views</th><th>Actions</th></tr></thead>
            <tbody id="videosTbody"></tbody>
          </table>
        </div>
      </div>
    `;

    const tbody = document.getElementById('videosTbody');
    if (cachedData.videos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:#666;">No videos</td></tr>`;
    } else {
      cachedData.videos.forEach(v => {
        const tr = document.createElement('tr');
        const thumb = v.thumbnail || v.url || '';
        const typeLabel = v.type === 'short' ? 'SHORT' : v.type === 'long' ? 'LONG' : 'PHOTO';
        tr.innerHTML = `
          <td><img src="${thumb}" style="width:60px;height:80px;object-fit:cover;border-radius:6px;"></td>
          <td><b>${escapeHtml(v.userName || '')}</b><br><span style="color:#666;font-size:11px;">@${escapeHtml(v.userHandle || '')}</span></td>
          <td>${typeLabel}</td>
          <td>${safeNum(v.views)}</td>
          <td><button class="btn-sm danger" data-del="${v.id}">Delete</button></td>
        `;
        tr.querySelector('[data-del]').addEventListener('click', async () => {
          if (!confirm('Delete this video?')) return;
          try {
            await deleteDoc(doc(db, 'posts', v.id));
            showToast('Deleted', 'success');
            renderVideos();
          } catch (e) { showToast('Failed', 'error'); }
        });
        tbody.appendChild(tr);
      });
    }

    document.getElementById('refreshVideosBtn')?.addEventListener('click', () => renderVideos());
  } catch (err) {
    adminContent.innerHTML = `<div style="padding:40px;color:#ff4d4d;">⚠️ ${escapeHtml(err.message)}</div>`;
  }
}

async function renderComments() {
  adminContent.innerHTML = `<div class="page-title-admin"><div class="title-text">Comments</div></div><div style="padding:40px;text-align:center;color:#666;">Coming soon...</div>`;
}

/* ============================================================
   PAYMENTS
   ============================================================ */
async function renderPayments() {
  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Payments</div>
      <div style="display:flex;gap:10px;">
        <button class="btn-outline" id="editUpiBtn">⚙️ UPI Settings</button>
        <button class="refresh-btn" id="refreshPayBtn">Refresh</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>User</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody id="paymentsTbody"><tr><td colspan="3" style="text-align:center;padding:40px;color:#666;">Loading...</td></tr></tbody>
      </table>
    </div>
  `;

  try {
    const snap = await getDoc(doc(db, 'admin_config', 'payment'));
    if (snap.exists()) {
      currentUpi = snap.data().upiId || '';
      currentQr = snap.data().qrUrl || '';
    }
  } catch (e) {}

  try {
    const reqSnap = await getDocs(collection(db, 'payment_requests'));
    const requests = reqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const tbody = document.getElementById('paymentsTbody');
    if (requests.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:40px;color:#666;">No requests</td></tr>`;
    } else {
      tbody.innerHTML = '';
      requests.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(r.userName || '')}</td>
          <td>₹${safeNum(r.amount)}</td>
          <td>${escapeHtml(r.status || 'pending')}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (e) {
    document.getElementById('paymentsTbody').innerHTML = `<tr><td colspan="3" style="text-align:center;padding:40px;color:#ff4d4d;">Error: ${escapeHtml(e.message)}</td></tr>`;
  }

  document.getElementById('editUpiBtn')?.addEventListener('click', () => {
    document.getElementById('adminUpiId').value = currentUpi;
    document.getElementById('adminQrUrl').value = currentQr;
    document.getElementById('paymentSettingsModal').style.display = 'flex';
  });

  document.getElementById('refreshPayBtn')?.addEventListener('click', () => renderPayments());
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
    <div class="filter-tabs" id="walletFilterTabs" style="margin-bottom:14px;">
      <button class="filter-tab active" data-filter="pending">Pending</button>
      <button class="filter-tab" data-filter="all">All</button>
    </div>
    <div class="table-wrap">
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>UPI</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="walletTbody"><tr><td colspan="6" style="text-align:center;padding:40px;color:#666;">Loading...</td></tr></tbody>
        </table>
      </div>
    </div>
  `;

  let transactions = [];
  try {
    const snap = await getDocs(collection(db, 'wallet_transactions'));
    transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    transactions.sort((a,b) => (b.createdAt?.toDate?.()?.getTime()||0) - (a.createdAt?.toDate?.()?.getTime()||0));
  } catch (e) {
    console.warn("Wallet load error:", e.message);
  }

  let currentFilter = 'pending';

  function paint() {
    const tbody = document.getElementById('walletTbody');
    if (!tbody) return;

    let list = transactions;
    if (currentFilter === 'pending') list = transactions.filter(t => t.status === 'pending');

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#666;">No transactions</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    list.forEach(t => {
      const tr = document.createElement('tr');
      const sign = t.type === 'credit' ? '+' : '−';
      const color = t.type === 'credit' ? '#4ade80' : '#ff2e63';
      tr.innerHTML = `
        <td><b>${escapeHtml(t.userName || 'Unknown')}</b></td>
        <td>${t.category || ''}</td>
        <td style="color:${color};font-weight:700;">${sign}₹${safeNum(t.amount)}</td>
        <td style="font-family:monospace;font-size:11px;">${escapeHtml(t.upiId || '—')}</td>
        <td>${escapeHtml((t.status || '').toUpperCase())}</td>
        <td data-actions="${t.id}"></td>
      `;

      const actionsCell = tr.querySelector(`[data-actions="${t.id}"]`);
      if (t.status === 'pending') {
        const approveBtn = document.createElement('button');
        approveBtn.className = 'btn-sm green';
        approveBtn.textContent = 'Approve';
        approveBtn.addEventListener('click', () => approveWalletTx(t, approveBtn));

        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'btn-sm danger';
        rejectBtn.textContent = 'Reject';
        rejectBtn.style.marginLeft = '4px';
        rejectBtn.addEventListener('click', () => rejectWalletTx(t, rejectBtn));

        actionsCell.appendChild(approveBtn);
        actionsCell.appendChild(rejectBtn);
      } else {
        actionsCell.textContent = '—';
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
  const msg = `Approve ₹${amt} ${tx.category} for ${tx.userName}?\n\n⚠️ Confirm you SENT ₹${amt} to ${tx.upiId || 'UPI'}`;
  if (!confirm(msg)) return;

  setButtonLoading(btnEl, true);
  try {
    await updateDoc(doc(db, 'wallet_transactions', tx.id), {
      status: 'completed',
      approvedAt: serverTimestamp()
    });

    if (tx.category === 'topup') {
      await updateDoc(doc(db, 'users', tx.userId), {
        walletBalance: increment(amt)
      });
    }

    await addDoc(collection(db, 'notifications'), {
      userId: tx.userId,
      type: 'wallet',
      title: '✅ Approved!',
      message: `₹${amt} - ${tx.category === 'topup' ? 'Added to wallet' : 'Sent to your UPI'}`,
      read: false,
      createdAt: serverTimestamp()
    }).catch(() => {});

    showToast('Approved', 'success');
    renderWallet();
  } catch (e) {
    showToast('Failed: ' + e.message, 'error');
    setButtonLoading(btnEl, false);
  }
}

async function rejectWalletTx(tx, btnEl) {
  const amt = safeNum(tx.amount);
  if (!confirm(`Reject ₹${amt} ${tx.category}?`)) return;

  setButtonLoading(btnEl, true);
  try {
    await updateDoc(doc(db, 'wallet_transactions', tx.id), {
      status: 'rejected',
      rejectedAt: serverTimestamp()
    });

    if (tx.category === 'withdrawal') {
      await updateDoc(doc(db, 'users', tx.userId), {
        walletBalance: increment(amt)
      });
    }

    showToast('Rejected', 'warn');
    renderWallet();
  } catch (e) {
    showToast('Failed: ' + e.message, 'error');
    setButtonLoading(btnEl, false);
  }
}

/* ============================================================
   ADMINS / NOTIFS / REPORTS
   ============================================================ */
async function renderAdmins() {
  await loadAdminEmails();
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Admins (${ADMIN_EMAILS.length})</div></div>
    <div id="adminsList"></div>
  `;
  const adminsList = document.getElementById('adminsList');
  ADMIN_EMAILS.forEach(email => {
    const card = document.createElement('div');
    card.style.cssText = 'padding:12px 16px; background:#121218; border:1px solid #2a2a38; border-radius:12px; margin-bottom:8px;';
    card.innerHTML = `<b>${escapeHtml(email)}</b>${isSuperAdmin(email) ? ' <span style="background:#ff2e63;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;">SUPER</span>' : ''}`;
    adminsList.appendChild(card);
  });
}

async function renderNotify() {
  adminContent.innerHTML = `<div class="page-title-admin"><div class="title-text">Notifications</div></div><div style="padding:40px;text-align:center;color:#666;">Coming soon...</div>`;
}

async function renderReports() {
  adminContent.innerHTML = `<div class="page-title-admin"><div class="title-text">Reports</div></div><div style="padding:40px;text-align:center;color:#666;">Coming soon...</div>`;
}

/* ============================================================
   MODALS
   ============================================================ */
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

/* ============================================================
   SAVE HANDLERS
   ============================================================ */
document.getElementById('savePaymentSettingsBtn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  setButtonLoading(btn, true);
  try {
    const upi = document.getElementById('adminUpiId').value.trim();
    const qr = document.getElementById('adminQrUrl').value.trim();
    await setDoc(doc(db, 'admin_config', 'payment'), { upiId: upi, qrUrl: qr });
    currentUpi = upi;
    currentQr = qr;
    showToast('Settings Saved!', 'success');
    document.getElementById('paymentSettingsModal').style.display = 'none';
  } catch (err) {
    showToast('Save failed: ' + err.message, 'error');
  } finally {
    setButtonLoading(btn, false);
  }
});

document.getElementById('savePlanBtn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const amount = parseInt(document.getElementById('planAmount').value, 10);
  const days = parseInt(document.getElementById('planDays').value, 10);
  if (!amount || amount <= 0 || !days || days <= 0) {
    showToast('Enter valid amount and days', 'error');
    return;
  }
  setButtonLoading(btn, true);
  try {
    await addDoc(collection(db, 'payment_plans'), {
      amount, days, createdAt: serverTimestamp()
    });
    showToast('Plan Added!', 'success');
    document.getElementById('addPlanModal').style.display = 'none';
  } catch (err) {
    showToast('Save failed: ' + err.message, 'error');
  } finally {
    setButtonLoading(btn, false);
  }
});

/* ============================================================
   INIT
   ============================================================ */
console.log('✅ ReelHub Admin loaded');
console.log('🔐 Hardcoded admins:', HARDCODED_ADMIN_EMAILS);