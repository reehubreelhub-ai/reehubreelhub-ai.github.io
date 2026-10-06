/* ============================================================
   ReelHub Admin — admin.js (COMPLETE + FIXED)
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  writeBatch
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
   🔐 ADMIN EMAILS — Dynamic from Firebase
   ============================================================ */
const HARDCODED_ADMIN_EMAILS = [
  "reehubreelhub@gmail.com"    // ✅ Super admin (कभी remove नहीं होगा)
];

let ADMIN_EMAILS = [...HARDCODED_ADMIN_EMAILS];

async function loadAdminEmails() {
  try {
    const snap = await getDoc(doc(db, 'admin_config', 'emails'));
    if (snap.exists()) {
      const list = snap.data().list || [];
      const merged = [...new Set([...HARDCODED_ADMIN_EMAILS, ...list])];
      ADMIN_EMAILS = merged.map(e => e.toLowerCase().trim());
      console.log('✅ Admin list loaded:', ADMIN_EMAILS.length);
    }
  } catch (e) {
    console.warn('⚠️ Could not load admin list:', e.message);
    ADMIN_EMAILS = [...HARDCODED_ADMIN_EMAILS];
  }
}

function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(email.toLowerCase().trim());
}

function isSuperAdmin(email) {
  if (!email) return false;
  return HARDCODED_ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(email.toLowerCase().trim());
}

/* ============================================================
   STATE
   ============================================================ */
let currentAdmin = null;
let currentAdminProfile = null;
let currentPage = 'dashboard';
let isLoggingIn = false;
let cachedData = {
  users: [],
  videos: [],
  comments: [],
  invites: [],
  reports: []
};

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
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    // Fallback agar toast container nahi hai
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;right:20px;background:#1e1e28;color:#fff;padding:12px 16px;border-radius:10px;font-size:13px;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.6);`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
    return;
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || ''}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function debounce(fn, wait = 300) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function setButtonLoading(btn, loading = true) {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.classList.add('loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
  }
}

/* ============================================================
   LOGIN BUTTON
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
    // ✅ पहले admin list load करो
    await loadAdminEmails();

    if (!isAdminEmail(email)) {
      loginMsg.textContent = 'Access denied. This email is not an admin.';
      return;
    }

    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (!result || !result.user) throw new Error('Login failed');

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
    appScreen.classList.add('show');
    goToPage('dashboard');

  } catch (err) {
    console.error(err);
    loginMsg.className = 'error-msg';
    try { await signOut(auth); } catch (e) {}
    currentAdmin = null;
    currentAdminProfile = null;

    if (
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-login-credentials'
    ) {
      loginMsg.textContent = 'Invalid email or password.';
    } else if (err.code === 'auth/too-many-requests') {
      loginMsg.textContent = 'Too many attempts. Try again later.';
    } else if (err.code === 'auth/network-request-failed') {
      loginMsg.textContent = 'Network error. Check your internet.';
    } else {
      loginMsg.textContent = err.message || 'Login failed.';
    }
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
    isLoggingIn = false;
  }
});

// Enter key support
document.getElementById('adminPass')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

/* ============================================================
   LOGOUT
   ============================================================ */
document.getElementById('adminLogout').addEventListener('click', async () => {
  if (confirm('Logout from admin panel?')) {
    try {
      await signOut(auth);
      showToast('Logged out', 'info');
    } catch (e) {
      showToast('Logout failed', 'error');
    }
  }
});

/* ============================================================
   AUTH STATE LISTENER
   ============================================================ */
onAuthStateChanged(auth, async (user) => {
  if (isLoggingIn) return;

  if (user) {
    await loadAdminEmails();

    if (!isAdminEmail(user.email)) {
      await signOut(auth);
      currentAdmin = null;
      currentAdminProfile = null;
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

/* ============================================================
   SHOW SCREENS
   ============================================================ */
function showLogin() {
  loader.style.display = 'none';
  loginScreen.style.display = 'flex';
  appScreen.classList.remove('show');
  const passEl = document.getElementById('adminPass');
  if (passEl) passEl.value = '';
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
  }
}

function showApp() {
  loader.style.display = 'none';
  loginScreen.style.display = 'none';
  appScreen.classList.add('show');

  // Restore page from URL hash
  const hash = window.location.hash.replace('#', '');
  const validPages = ['dashboard', 'users', 'videos', 'comments', 'admins', 'notifications', 'reports'];
  const page = validPages.includes(hash) ? hash : 'dashboard';
  goToPage(page);
}

function goToPage(page) {
  document.querySelectorAll('.side-item').forEach(i => {
    i.classList.toggle('active', i.dataset.page === page);
  });

  if (window.location.hash !== '#' + page) {
    history.replaceState(null, '', '#' + page);
  }

  renderPage(page);
}

window.addEventListener('hashchange', () => {
  if (!currentAdmin) return;
  const hash = window.location.hash.replace('#', '');
  const validPages = ['dashboard', 'users', 'videos', 'comments', 'admins', 'notifications', 'reports'];
  if (validPages.includes(hash) && hash !== currentPage) {
    goToPage(hash);
  }
});

/* ============================================================
   SIDEBAR NAV
   ============================================================ */
document.querySelectorAll('.side-item').forEach(item => {
  item.addEventListener('click', () => {
    goToPage(item.dataset.page);
  });
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
    else if (page === 'admins')        await renderAdmins();
    else if (page === 'notifications') await renderNotify();
    else if (page === 'reports')       await renderReports();
  } catch (err) {
    console.error(err);
    adminContent.innerHTML = `<div class="empty-box">Error: ${escapeHtml(err.message)}</div>`;
  }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
async function renderDashboard() {
  const [usersSnap, videosSnap, commentsSnap, reportsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'posts')),
    getDocs(collection(db, 'comments')),
    getDocs(collection(db, 'reports'))
  ]);

  const totalUsers = usersSnap.size;
  const totalVideos = videosSnap.size;
  const totalComments = commentsSnap.size;
  const totalReports = reportsSnap.size;

  let totalLikes = 0;
  let totalViews = 0;
  let shortsCount = 0;
  let longCount = 0;

  videosSnap.forEach(d => {
    const data = d.data();
    totalLikes += (data.likes || []).length;
    totalViews += data.views || 0;
    if (data.type === 'short') shortsCount++;
    else if (data.type === 'long') longCount++;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let todaySignups = 0;
  let todayVideos = 0;

  usersSnap.forEach(d => {
    const created = d.data().createdAt?.toDate?.();
    if (created && created >= today) todaySignups++;
  });

  videosSnap.forEach(d => {
    const created = d.data().createdAt?.toDate?.();
    if (created && created >= today) todayVideos++;
  });

  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Dashboard</div>
      <button class="refresh-btn" id="refreshDashBtn">
        <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Refresh
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card clickable" data-nav="users">
        <div class="label">Total Users</div>
        <div class="value pink">${totalUsers}</div>
      </div>
      <div class="stat-card clickable" data-nav="videos">
        <div class="label">Total Videos</div>
        <div class="value blue">${totalVideos}</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Likes</div>
        <div class="value orange">${totalLikes}</div>
      </div>
      <div class="stat-card clickable" data-nav="comments">
        <div class="label">Total Comments</div>
        <div class="value green">${totalComments}</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Views</div>
        <div class="value">${totalViews}</div>
      </div>
      <div class="stat-card clickable" data-nav="reports">
        <div class="label">Pending Reports</div>
        <div class="value" style="color:#ff8a00">${totalReports}</div>
      </div>
      <div class="stat-card">
        <div class="label">Today's Signups</div>
        <div class="value">${todaySignups}</div>
      </div>
      <div class="stat-card">
        <div class="label">Today's Uploads</div>
        <div class="value">${todayVideos}</div>
      </div>
    </div>

    <div class="stats-grid" style="margin-top:14px;">
      <div class="stat-card">
        <div class="label">Shorts</div>
        <div class="value" style="color:#ff2e63">${shortsCount}</div>
      </div>
      <div class="stat-card">
        <div class="label">Long Videos</div>
        <div class="value" style="color:#4ea8ff">${longCount}</div>
      </div>
    </div>
  `;

  document.getElementById('refreshDashBtn')?.addEventListener('click', () => renderDashboard());
  document.querySelectorAll('[data-nav]').forEach(card => {
    card.addEventListener('click', () => goToPage(card.dataset.nav));
  });
}

/* ============================================================
   USERS
   ============================================================ */
async function renderUsers() {
  const snap = await getDocs(collection(db, 'users'));
  cachedData.users = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const bannedCount = cachedData.users.filter(u => u.banned).length;
  const verifiedCount = cachedData.users.filter(u => u.verified).length;

  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Users (${cachedData.users.length})</div>
      <button class="refresh-btn" id="refreshUsersBtn">
        <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Refresh
      </button>
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
    let list = cachedData.users.filter(u => {
      if (currentFilter === 'verified' && !u.verified) return false;
      if (currentFilter === 'banned' && !u.banned) return false;
      if (currentFilter === 'admin' && !isAdminEmail(u.email)) return false;

      if (!q) return true;
      return (u.name || '').toLowerCase().includes(q)
          || (u.user || '').toLowerCase().includes(q)
          || (u.email || '').toLowerCase().includes(q);
    });

    const tbody = document.getElementById('usersTbody');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h4>No users found</h4>
          <p>Try a different search or filter</p>
        </div>
      </td></tr>`;
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

      tr.innerHTML = `
        <td>
          <div class="user-cell">
            <img src="${avatar}" alt="">
            <div class="info">
              <b>${escapeHtml(u.name)}${verifiedBadge}${bannedBadge}</b>
              <span>@${escapeHtml(u.user)}</span>
            </div>
          </div>
        </td>
        <td style="font-size:12px;">${escapeHtml(u.email || '')}</td>
        <td>${roleBadge}</td>
        <td>${u.videoCount || 0}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-sm primary" data-action="msg" data-uid="${u.id}">Msg</button>
            <button class="btn-sm gray" data-action="verify" data-uid="${u.id}">${u.verified ? 'Unverify' : 'Verify'}</button>
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

  const debouncedSearch = debounce((val) => {
    currentSearch = val;
    paint();
  }, 300);

  document.getElementById('userSearch').addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  document.getElementById('userFilterTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('#userFilterTabs .filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    paint();
  });

  document.getElementById('refreshUsersBtn')?.addEventListener('click', () => renderUsers());
}

async function handleUserAction(action, uid, btnEl) {
  const user = cachedData.users.find(u => u.id === uid);
  if (!user) return;

  if (action === 'msg') {
    openMessageModal(user);
    return;
  }

  if (action === 'verify') {
    setButtonLoading(btnEl, true);
    try {
      const newVal = !user.verified;
      await updateDoc(doc(db, 'users', uid), { verified: newVal });
      user.verified = newVal;
      if (newVal) {
        await pushNotification(uid, {
          type: 'verified',
          title: '✅ You are verified!',
          message: 'Congratulations! Your account is now verified.'
        });
      }
      showToast(newVal ? 'User verified' : 'Verification removed', 'success');
      await renderUsers();
    } catch (e) {
      console.error(e);
      showToast('Action failed', 'error');
      setButtonLoading(btnEl, false);
    }
    return;
  }

  if (action === 'ban') {
    const newVal = !user.banned;
    if (newVal && !confirm(`Ban ${user.name}?\n\nThey won't be able to use the app.`)) return;
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
      console.error(e);
      showToast('Action failed', 'error');
      setButtonLoading(btnEl, false);
    }
    return;
  }

  if (action === 'delete') {
    if (!confirm(`DELETE ${user.name}?\n\nThis will delete the user AND all their posts, comments, stories.`)) return;
    if (!confirm(`⚠️ FINAL WARNING: This cannot be undone.`)) return;

    setButtonLoading(btnEl, true);
    try {
      await cascadeDeleteUser(uid);
      showToast('User deleted with all data', 'success');
      await renderUsers();
    } catch (e) {
      console.error(e);
      showToast('Delete failed: ' + e.message, 'error');
      setButtonLoading(btnEl, false);
    }
    return;
  }
}

async function cascadeDeleteUser(uid) {
  try {
    const postsQ = query(collection(db, 'posts'), where('userId', '==', uid));
    const postsSnap = await getDocs(postsQ);
    await batchDelete(postsSnap.docs.map(d => d.ref));
  } catch (e) { console.warn('Posts delete:', e); }

  try {
    const commentsQ = query(collection(db, 'comments'), where('userId', '==', uid));
    const commentsSnap = await getDocs(commentsQ);
    await batchDelete(commentsSnap.docs.map(d => d.ref));
  } catch (e) { console.warn('Comments delete:', e); }

  try {
    const storiesQ = query(collection(db, 'stories'), where('userId', '==', uid));
    const storiesSnap = await getDocs(storiesQ);
    await batchDelete(storiesSnap.docs.map(d => d.ref));
  } catch (e) { console.warn('Stories delete:', e); }

  try {
    const notifQ = query(collection(db, 'notifications'), where('userId', '==', uid));
    const notifSnap = await getDocs(notifQ);
    await batchDelete(notifSnap.docs.map(d => d.ref));
  } catch (e) { console.warn('Notifs delete:', e); }

  await deleteDoc(doc(db, 'users', uid));
}

async function batchDelete(refs) {
  const chunks = [];
  for (let i = 0; i < refs.length; i += 450) {
    chunks.push(refs.slice(i, i + 450));
  }
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
  const snap = await getDocs(collection(db, 'posts'));
  cachedData.videos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const shortsCount = cachedData.videos.filter(v => v.type === 'short').length;
  const longCount = cachedData.videos.filter(v => v.type === 'long').length;
  const photoCount = cachedData.videos.filter(v => v.type === 'photo').length;

  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Videos (${cachedData.videos.length})</div>
      <button class="refresh-btn" id="refreshVideosBtn">
        <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Refresh
      </button>
    </div>

    <div class="table-wrap">
      <div class="table-search">
        <input type="text" id="videoSearch" placeholder="Search by caption or user...">
      </div>

      <div class="filter-tabs" id="videoFilterTabs">
        <button class="filter-tab active" data-filter="all">All (${cachedData.videos.length})</button>
        <button class="filter-tab" data-filter="short">Shorts (${shortsCount})</button>
        <button class="filter-tab" data-filter="long">Long (${longCount})</button>
        <button class="filter-tab" data-filter="photo">Photos (${photoCount})</button>
      </div>

      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Type</th>
              <th>User</th>
              <th>Caption</th>
              <th>Stats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="videosTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  let currentFilter = 'all';
  let currentSearch = '';

  function paint() {
    const q = currentSearch.toLowerCase().trim();
    const list = cachedData.videos.filter(v => {
      if (currentFilter !== 'all' && v.type !== currentFilter) return false;
      if (!q) return true;
      return (v.caption || '').toLowerCase().includes(q)
          || (v.userHandle || '').toLowerCase().includes(q)
          || (v.userName || '').toLowerCase().includes(q);
    });

    const tbody = document.getElementById('videosTbody');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><polygon points="10,8 16,12 10,16"/></svg>
          <h4>No videos found</h4>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    list.forEach(v => {
      const tr = document.createElement('tr');
      const thumbUrl = v.thumbnail || v.url || '';
      const typeBadge = `<span class="type-badge ${v.type || 'short'}">${(v.type || 'video').toUpperCase()}</span>`;

      let durationStr = '';
      if (v.duration) {
        const m = Math.floor(v.duration / 60);
        const s = Math.floor(v.duration % 60);
        durationStr = `${m}:${String(s).padStart(2, '0')}`;
      }

      let previewHTML = '';
      if (v.type === 'photo') {
        previewHTML = `<div class="video-thumb-cell"><img src="${thumbUrl}" alt=""><div class="type-overlay">${typeBadge}</div></div>`;
      } else {
        previewHTML = `
          <div class="video-thumb-cell">
            <img src="${thumbUrl}" alt="">
            ${durationStr ? `<div class="duration">${durationStr}</div>` : ''}
            <div class="type-overlay">${typeBadge}</div>
          </div>
        `;
      }

      const likesCount = (v.likes || []).length;
      const viewsCount = v.views || 0;
      const commentsCount = v.commentsCount || 0;

      tr.innerHTML = `
        <td>${previewHTML}</td>
        <td>${typeBadge}</td>
        <td>
          <div style="font-size:12px;">
            <b>${escapeHtml(v.userName || '')}</b><br>
            <span style="color:#666">@${escapeHtml(v.userHandle || '')}</span>
          </div>
        </td>
        <td style="max-width:180px;">
          <div style="font-size:12px;color:#aaa;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${escapeHtml(v.caption || '—')}
          </div>
        </td>
        <td style="font-size:11px;color:#888;">
          <div>❤️ ${likesCount}</div>
          <div>👁 ${viewsCount}</div>
          <div>💬 ${commentsCount}</div>
        </td>
        <td>
          <div class="actions-cell">
            <button class="btn-sm gray" data-action="preview" data-id="${v.id}">Preview</button>
            <button class="btn-sm primary" data-action="feature" data-id="${v.id}">${v.featured ? 'Unfeature' : 'Feature'}</button>
            <button class="btn-sm danger" data-action="delete" data-id="${v.id}">Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => handleVideoAction(btn.dataset.action, btn.dataset.id, btn));
    });
  }

  paint();

  const debouncedSearch = debounce((val) => {
    currentSearch = val;
    paint();
  }, 300);

  document.getElementById('videoSearch').addEventListener('input', (e) => debouncedSearch(e.target.value));

  document.getElementById('videoFilterTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('#videoFilterTabs .filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    paint();
  });

  document.getElementById('refreshVideosBtn')?.addEventListener('click', () => renderVideos());
}

async function handleVideoAction(action, id, btnEl) {
  const video = cachedData.videos.find(v => v.id === id);
  if (!video) return;

  if (action === 'preview') {
    const isVideo = video.type !== 'photo';
    const mediaHTML = isVideo
      ? `<video src="${video.url}" controls playsinline style="width:100%;border-radius:10px;background:#000;max-height:60vh;"></video>`
      : `<img src="${video.url}" style="width:100%;border-radius:10px;max-height:60vh;object-fit:contain;">`;

    openModal('Video Preview', `
      ${mediaHTML}
      <div style="margin-top:12px;font-size:13px;color:#888;">
        <div><b style="color:#fff;">${escapeHtml(video.userName || '')}</b> @${escapeHtml(video.userHandle || '')}</div>
        <div style="margin-top:6px;">${escapeHtml(video.caption || '')}</div>
        <div style="margin-top:8px;display:flex;gap:12px;font-size:12px;">
          <span>❤️ ${(video.likes || []).length}</span>
          <span>👁 ${video.views || 0}</span>
          <span>💬 ${video.commentsCount || 0}</span>
        </div>
      </div>
    `);
  }
  else if (action === 'feature') {
    setButtonLoading(btnEl, true);
    try {
      const newVal = !video.featured;
      await updateDoc(doc(db, 'posts', id), { featured: newVal });
      video.featured = newVal;
      showToast(newVal ? 'Video featured' : 'Unfeatured', 'success');
      await renderVideos();
    } catch (e) {
      showToast('Action failed', 'error');
      setButtonLoading(btnEl, false);
    }
  }
  else if (action === 'delete') {
    if (!confirm('Delete this video?')) return;
    setButtonLoading(btnEl, true);
    try {
      await deleteDoc(doc(db, 'posts', id));

      try {
        const commentsQ = query(collection(db, 'comments'), where('postId', '==', id));
        const commentsSnap = await getDocs(commentsQ);
        if (commentsSnap.size > 0) {
          await batchDelete(commentsSnap.docs.map(d => d.ref));
        }
      } catch (e) {}

      if (video.userId) {
        try {
          const userRef = doc(db, 'users', video.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const currentCount = userSnap.data().videoCount || 0;
            await updateDoc(userRef, { videoCount: Math.max(0, currentCount - 1) });
          }
        } catch (e) {}
      }

      showToast('Video deleted', 'success');
      await renderVideos();
    } catch (e) {
      showToast('Delete failed', 'error');
      setButtonLoading(btnEl, false);
    }
  }
}

/* ============================================================
   COMMENTS
   ============================================================ */
async function renderComments() {
  const snap = await getDocs(collection(db, 'comments'));
  cachedData.comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Comments (${cachedData.comments.length})</div>
      <button class="refresh-btn" id="refreshCommentsBtn">
        <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Refresh
      </button>
    </div>

    <div class="table-wrap">
      <div class="table-search">
        <input type="text" id="commentSearch" placeholder="Search comments...">
      </div>
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Comment</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="commentsTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  let currentSearch = '';

  function paint() {
    const q = currentSearch.toLowerCase().trim();
    const list = cachedData.comments.filter(c => {
      if (!q) return true;
      return (c.text || '').toLowerCase().includes(q)
          || (c.userName || '').toLowerCase().includes(q);
    });

    const tbody = document.getElementById('commentsTbody');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <h4>No comments</h4>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    list.forEach(c => {
      const isReply = !!c.parentId;
      const typeBadge = isReply
        ? `<span class="badge-pill" style="background:#4ea8ff;color:#fff;">REPLY</span>`
        : `<span class="badge-pill" style="background:#16a34a;color:#fff;">COMMENT</span>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-size:12px;">
            <b>${escapeHtml(c.userName || '')}</b><br>
            <span style="color:#666">@${escapeHtml(c.userHandle || '')}</span>
          </div>
        </td>
        <td style="max-width:280px;font-size:12px;color:#ccc;">
          ${escapeHtml(c.text || '')}
          ${c.deleted ? ' <span style="color:#888;">(deleted)</span>' : ''}
        </td>
        <td>${typeBadge}</td>
        <td>
          <button class="btn-sm danger" data-id="${c.id}">Delete</button>
        </td>
      `;
      tr.querySelector('button').addEventListener('click', async (e) => {
        if (!confirm('Delete comment?')) return;
        setButtonLoading(e.target, true);
        try {
          await deleteDoc(doc(db, 'comments', c.id));

          if (c.postId) {
            try {
              const postRef = doc(db, 'posts', c.postId);
              const postSnap = await getDoc(postRef);
              if (postSnap.exists()) {
                const cc = postSnap.data().commentsCount || 0;
                await updateDoc(postRef, { commentsCount: Math.max(0, cc - 1) });
              }
            } catch (e) {}
          }

          showToast('Comment deleted', 'success');
          await renderComments();
        } catch (e) {
          showToast('Delete failed', 'error');
          setButtonLoading(e.target, false);
        }
      });
      tbody.appendChild(tr);
    });
  }

  paint();

  const debouncedSearch = debounce((val) => {
    currentSearch = val;
    paint();
  }, 300);

  document.getElementById('commentSearch').addEventListener('input', (e) => debouncedSearch(e.target.value));
  document.getElementById('refreshCommentsBtn')?.addEventListener('click', () => renderComments());
}

/* ============================================================
   ADMINS — Complete with invite system
   ============================================================ */
async function renderAdmins() {
  await loadAdminEmails();

  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Admin Management (${ADMIN_EMAILS.length})</div>
      <button class="refresh-btn" id="refreshAdminsBtn">
        <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Refresh
      </button>
    </div>

    <div class="section-head">
      <h3>Current Admins (${ADMIN_EMAILS.length})</h3>
      <button class="btn-outline" id="inviteNewBtn">+ Invite by Email</button>
    </div>

    <div id="adminsList"></div>

    <div class="section-head" style="margin-top:32px;">
      <h3>Invitation History</h3>
    </div>

    <div id="invitesList"></div>
  `;

  const adminsList = document.getElementById('adminsList');
  adminsList.innerHTML = '';

  for (const email of ADMIN_EMAILS) {
    const card = document.createElement('div');
    card.className = 'invite-card';
    const isMe = email.toLowerCase() === (currentAdmin?.email || '').toLowerCase();
    const isSuper = isSuperAdmin(email);

    let displayName = email;
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snap = await getDocs(q);
      if (!snap.empty) displayName = snap.docs[0].data().name || email;
    } catch (e) {}

    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;flex:1;">
        <img src="${defaultAvatar(displayName)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
        <div class="info">
          <b>${escapeHtml(displayName)} ${isMe ? '(You)' : ''} ${isSuper ? '<span class="badge-pill admin">SUPER</span>' : '<span class="badge-pill verified">ADMIN</span>'}</b>
          <span>${escapeHtml(email)}</span>
        </div>
      </div>
      ${!isSuper && !isMe ? `<button class="btn-sm danger" data-remove-admin="${escapeHtml(email)}">Remove</button>` : ''}
    `;
    adminsList.appendChild(card);
  }

  adminsList.querySelectorAll('[data-remove-admin]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.dataset.removeAdmin;
      if (!confirm(`Remove ${email} from admins?\n\nThey will lose admin access immediately.`)) return;
      setButtonLoading(btn, true);
      try {
        const configRef = doc(db, 'admin_config', 'emails');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          const currentList = configSnap.data().list || [];
          const newList = currentList.filter(e => e.toLowerCase() !== email.toLowerCase());
          await updateDoc(configRef, { list: newList });
          showToast(`${email} removed from admins`, 'success');
          await renderAdmins();
        }
      } catch (e) {
        showToast('Failed: ' + e.message, 'error');
        setButtonLoading(btn, false);
      }
    });
  });

  // Invitations history
  try {
    const invQ = query(collection(db, 'admin_invites'), orderBy('createdAt', 'desc'));
    const invSnap = await getDocs(invQ);
    const invites = invSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const invitesList = document.getElementById('invitesList');

    if (invites.length === 0) {
      invitesList.innerHTML = `<div class="empty-box">No invitations yet.</div>`;
    } else {
      invitesList.innerHTML = '';
      invites.forEach(inv => {
        const card = document.createElement('div');
        card.className = 'invite-card';
        const created = inv.createdAt?.toDate?.() || null;
        const timeStr = created ? timeAgo(created) : 'just now';

        let badge = '';
        if (inv.status === 'pending')  badge = `<span class="badge-pill pending">PENDING</span>`;
        if (inv.status === 'accepted') badge = `<span class="badge-pill accepted">ACCEPTED</span>`;
        if (inv.status === 'rejected') badge = `<span class="badge-pill rejected">REJECTED</span>`;

        card.innerHTML = `
          <div class="info">
            <b>${escapeHtml(inv.email)} ${badge}</b>
            <span>Invited ${timeStr} • by ${escapeHtml(inv.invitedByName || 'Admin')}</span>
          </div>
          ${inv.status === 'pending' ? `<button class="btn-sm danger" data-cancel-invite="${inv.id}">Cancel</button>` : ''}
        `;
        card.querySelector('button')?.addEventListener('click', async (e) => {
          if (!confirm('Cancel this invitation?')) return;
          setButtonLoading(e.target, true);
          try {
            await updateDoc(doc(db, 'admin_invites', inv.id), {
              status: 'rejected',
              respondedAt: serverTimestamp(),
              respondedBy: 'admin_cancelled'
            });
            showToast('Invitation cancelled', 'info');
            await renderAdmins();
          } catch (err) {
            showToast('Failed', 'error');
            setButtonLoading(e.target, false);
          }
        });
        invitesList.appendChild(card);
      });
    }
  } catch (e) {
    console.warn(e);
    const el = document.getElementById('invitesList');
    if (el) el.innerHTML = `<div class="empty-box">Could not load invites.</div>`;
  }

  document.getElementById('inviteNewBtn').addEventListener('click', openInviteModal);
  document.getElementById('refreshAdminsBtn')?.addEventListener('click', () => renderAdmins());
}

/* ============================================================
   INVITE MODAL — Send admin invitation
   ============================================================ */
function openInviteModal() {
  openModal('Invite New Admin', `
    <div class="input-group">
      <label>User's email address</label>
      <input type="email" id="inviteEmailInput" placeholder="user@email.com">
    </div>
    <p style="font-size:12px;color:#888;margin-bottom:14px;line-height:1.5;">
      📩 User को notification जाएगा। जब वो <b>Accept</b> करेगा, वो automatically admin बन जाएगा।
    </p>
    <button class="btn-primary" id="sendInviteBtn">Send Invitation</button>
    <div class="error-msg" id="inviteModalMsg"></div>
  `);

  const btn = document.getElementById('sendInviteBtn');
  btn.addEventListener('click', async () => {
    const email = document.getElementById('inviteEmailInput').value.trim().toLowerCase();
    const msg = document.getElementById('inviteModalMsg');
    msg.textContent = '';
    msg.className = 'error-msg';

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      msg.textContent = 'Please enter a valid email.';
      return;
    }

    if (isAdminEmail(email)) {
      msg.textContent = 'This email is already an admin.';
      return;
    }

    setButtonLoading(btn, true);

    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snap = await getDocs(q);

      if (snap.empty) {
        msg.textContent = 'No ReelHub user found with this email.';
        setButtonLoading(btn, false);
        return;
      }

      const userData = { id: snap.docs[0].id, ...snap.docs[0].data() };

      const existingInvite = await getDoc(doc(db, 'admin_invites', userData.id));
      if (existingInvite.exists() && existingInvite.data().status === 'pending') {
        msg.textContent = 'This user already has a pending invitation.';
        setButtonLoading(btn, false);
        return;
      }

      // Invitation create करो (ID = user UID for security)
      await setDoc(doc(db, 'admin_invites', userData.id), {
        email: email,
        userId: userData.id,
        userName: userData.name || '',
        invitedBy: currentAdmin.uid,
        invitedByEmail: currentAdmin.email,
        invitedByName: currentAdminProfile?.name || 'Admin',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Notification भेजो
      await pushNotification(userData.id, {
        type: 'admin_invite',
        title: '🎉 Admin Invitation',
        message: `You have been invited to become a ReelHub admin by ${currentAdminProfile?.name || 'Admin'}. Open the app to accept or decline.`,
        inviteId: userData.id
      });

      msg.className = 'success-msg';
      msg.textContent = '✅ Invitation sent!';
      showToast('Invitation sent to ' + email, 'success');
      setTimeout(() => { closeModal(); renderAdmins(); }, 900);

    } catch (err) {
      console.error(err);
      msg.textContent = err.message || 'Failed to send invitation.';
      setButtonLoading(btn, false);
    }
  });
}

/* ============================================================
   NOTIFICATIONS — Full featured (single + broadcast)
   ============================================================ */
async function renderNotify() {
  const usersSnap = await getDocs(collection(db, 'users'));
  const allUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Send Notification</div>
    </div>

    <div class="filter-tabs" id="notifTabs" style="margin-bottom:16px;">
      <button class="filter-tab active" data-tab="single">📧 To Specific User</button>
      <button class="filter-tab" data-tab="broadcast">📢 Broadcast to All</button>
    </div>

    <div id="notifSinglePanel">
      <div class="table-wrap" style="padding:16px;">
        <div class="input-group">
          <label>Select User</label>
          <select id="notifyUserSelect" style="height:46px;padding:0 14px;background:#0a0a0a;border:1px solid #262626;border-radius:10px;color:#fff;font-family:inherit;font-size:14px;width:100%;outline:none;">
            <option value="">-- Choose a user --</option>
            ${allUsers.map(u => `<option value="${u.id}">${escapeHtml(u.name || 'User')} (@${escapeHtml(u.user || '')}) — ${escapeHtml(u.email || '')}</option>`).join('')}
          </select>
        </div>

        <div style="text-align:center;color:#666;font-size:12px;margin:10px 0;">— OR —</div>

        <div class="input-group">
          <label>Enter email manually</label>
          <input type="email" id="notifyEmail" placeholder="user@email.com">
        </div>

        <div class="input-group">
          <label>Notification Title</label>
          <input type="text" id="notifyTitle" placeholder="e.g., New Update Available" maxlength="60">
        </div>

        <div class="input-group">
          <label>Message</label>
          <textarea id="notifyMessage" placeholder="Type your message..." maxlength="300"></textarea>
        </div>

        <div class="input-group">
          <label>Type (optional)</label>
          <select id="notifyType" style="height:46px;padding:0 14px;background:#0a0a0a;border:1px solid #262626;border-radius:10px;color:#fff;font-family:inherit;font-size:14px;width:100%;outline:none;">
            <option value="admin_message">📩 General Message</option>
            <option value="warning">⚠️ Warning</option>
            <option value="announcement">📢 Announcement</option>
            <option value="feature">✨ New Feature</option>
            <option value="info">ℹ️ Info</option>
          </select>
        </div>

        <button class="btn-primary" id="sendToUserBtn">Send Notification</button>
        <div class="error-msg" id="notifyMsg"></div>
      </div>
    </div>

    <div id="notifBroadcastPanel" style="display:none;">
      <div class="table-wrap" style="padding:16px;">
        <div class="input-group">
          <label>Broadcast Title</label>
          <input type="text" id="broadcastTitle" placeholder="e.g., Server Maintenance" maxlength="60">
        </div>
        <div class="input-group">
          <label>Broadcast Message</label>
          <textarea id="broadcastMessage" placeholder="Type message for all users..." maxlength="300"></textarea>
        </div>
        <div class="input-group">
          <label>Type</label>
          <select id="broadcastType" style="height:46px;padding:0 14px;background:#0a0a0a;border:1px solid #262626;border-radius:10px;color:#fff;font-family:inherit;font-size:14px;width:100%;outline:none;">
            <option value="admin_broadcast">📢 Broadcast</option>
            <option value="announcement">📣 Announcement</option>
            <option value="feature">✨ New Feature</option>
          </select>
        </div>
        <p style="font-size:12px;color:#888;margin-bottom:12px;">
          Total users: <b style="color:#fff;">${allUsers.length}</b>
        </p>
        <button class="btn-primary" id="broadcastBtn">Send to All Users</button>
        <div class="error-msg" id="broadcastMsg"></div>
      </div>
    </div>
  `;

  // Tab switching
  document.getElementById('notifTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('#notifTabs .filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    if (tab.dataset.tab === 'single') {
      document.getElementById('notifSinglePanel').style.display = 'block';
      document.getElementById('notifBroadcastPanel').style.display = 'none';
    } else {
      document.getElementById('notifSinglePanel').style.display = 'none';
      document.getElementById('notifBroadcastPanel').style.display = 'block';
    }
  });

  // Send to single user
  document.getElementById('sendToUserBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const selectUid = document.getElementById('notifyUserSelect').value;
    const email = document.getElementById('notifyEmail').value.trim().toLowerCase();
    const title = document.getElementById('notifyTitle').value.trim();
    const message = document.getElementById('notifyMessage').value.trim();
    const type = document.getElementById('notifyType').value;
    const msg = document.getElementById('notifyMsg');
    msg.textContent = '';
    msg.className = 'error-msg';

    if (!title || !message) {
      msg.textContent = 'Please fill title and message.';
      return;
    }

    if (!selectUid && !email) {
      msg.textContent = 'Please select a user or enter email.';
      return;
    }

    setButtonLoading(btn, true);

    try {
      let targetUid = selectUid;
      let targetName = '';

      if (!targetUid && email) {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const snap = await getDocs(q);
        if (snap.empty) {
          msg.textContent = 'No user found with this email.';
          setButtonLoading(btn, false);
          return;
        }
        targetUid = snap.docs[0].id;
        targetName = snap.docs[0].data().name || '';
      } else {
        const u = allUsers.find(u => u.id === targetUid);
        targetName = u?.name || '';
      }

      await pushNotification(targetUid, {
        type: type,
        title: title,
        message: message
      });

      msg.className = 'success-msg';
      msg.textContent = `✅ Sent to ${targetName || 'user'}!`;
      showToast(`Notification sent to ${targetName || 'user'}`, 'success');

      document.getElementById('notifyTitle').value = '';
      document.getElementById('notifyMessage').value = '';
      document.getElementById('notifyUserSelect').value = '';
      document.getElementById('notifyEmail').value = '';

    } catch (err) {
      console.error(err);
      msg.textContent = err.message || 'Failed to send.';
    } finally {
      setButtonLoading(btn, false);
    }
  });

  // Broadcast
  document.getElementById('broadcastBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const title = document.getElementById('broadcastTitle').value.trim();
    const message = document.getElementById('broadcastMessage').value.trim();
    const type = document.getElementById('broadcastType').value;
    const msg = document.getElementById('broadcastMsg');
    msg.textContent = '';
    msg.className = 'error-msg';

    if (!title || !message) {
      msg.textContent = 'Please fill title and message.';
      return;
    }

    if (!confirm(`Send this to ALL ${allUsers.length} users?`)) return;

    setButtonLoading(btn, true);

    try {
      const userIds = allUsers.map(u => u.id);
      let sent = 0;

      for (let i = 0; i < userIds.length; i += 450) {
        const chunk = userIds.slice(i, i + 450);
        const batch = writeBatch(db);
        chunk.forEach(uid => {
          const notifRef = doc(collection(db, 'notifications'));
          batch.set(notifRef, {
            userId: uid,
            type: type,
            title: title,
            message: message,
            read: false,
            createdAt: serverTimestamp()
          });
        });
        await batch.commit();
        sent += chunk.length;
        msg.textContent = `Sending... ${sent}/${userIds.length}`;
      }

      msg.className = 'success-msg';
      msg.textContent = `✅ Sent to ${sent} users!`;
      showToast(`Broadcast sent to ${sent} users`, 'success');

      document.getElementById('broadcastTitle').value = '';
      document.getElementById('broadcastMessage').value = '';

    } catch (err) {
      console.error(err);
      msg.textContent = err.message || 'Failed.';
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

/* ============================================================
   REPORTS
   ============================================================ */
async function renderReports() {
  const snap = await getDocs(collection(db, 'reports'));
  cachedData.reports = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const pending = cachedData.reports.filter(r => r.status === 'pending' || !r.status).length;
  const resolved = cachedData.reports.filter(r => r.status === 'resolved').length;
  const ignored = cachedData.reports.filter(r => r.status === 'ignored').length;

  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Reports (${cachedData.reports.length})</div>
      <button class="refresh-btn" id="refreshReportsBtn">
        <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Refresh
      </button>
    </div>

    <div class="table-wrap">
      <div class="filter-tabs" id="reportFilterTabs">
        <button class="filter-tab active" data-filter="pending">Pending (${pending})</button>
        <button class="filter-tab" data-filter="resolved">Resolved (${resolved})</button>
        <button class="filter-tab" data-filter="ignored">Ignored (${ignored})</button>
        <button class="filter-tab" data-filter="all">All</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Reported Item</th>
              <th>Reason</th>
              <th>Reported By</th>
              <th>When</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="reportsTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  let currentFilter = 'pending';

  function paint() {
    const list = cachedData.reports.filter(r => {
      const status = r.status || 'pending';
      if (currentFilter === 'all') return true;
      return status === currentFilter;
    });

    const tbody = document.getElementById('reportsTbody');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <h4>No ${currentFilter} reports</h4>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    list.forEach(r => {
      const isPost = r.type === 'post';
      const isUser = r.type === 'user';
      const status = r.status || 'pending';

      let reportedItem = '';
      if (isPost) {
        reportedItem = `<span style="font-size:12px;">📹 Post ID: <code>${escapeHtml((r.postId || '').slice(0, 10))}...</code></span>`;
      } else if (isUser) {
        reportedItem = `<span style="font-size:12px;">👤 @${escapeHtml(r.reportedUserHandle || 'user')}</span>`;
      }

      const created = r.createdAt?.toDate?.();
      const timeStr = created ? timeAgo(created) : '—';

      const statusBadge = status === 'pending'
        ? `<span class="badge-pill pending">PENDING</span>`
        : status === 'resolved'
          ? `<span class="badge-pill resolved">RESOLVED</span>`
          : `<span class="badge-pill ignored">IGNORED</span>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${statusBadge}<br><span style="font-size:11px;color:#888;">${isPost ? 'POST' : isUser ? 'USER' : '—'}</span></td>
        <td>${reportedItem}</td>
        <td style="max-width:220px;font-size:12px;color:#ccc;">${escapeHtml(r.reason || '')}</td>
        <td style="font-size:12px;color:#888;">@${escapeHtml(r.reportedByHandle || 'user')}</td>
        <td style="font-size:11px;color:#666;">${timeStr}</td>
        <td>
          <div class="actions-cell">
            ${status === 'pending' ? `
              <button class="btn-sm primary" data-action="view" data-id="${r.id}">View</button>
              <button class="btn-sm danger" data-action="action" data-id="${r.id}">Take Action</button>
              <button class="btn-sm gray" data-action="ignore" data-id="${r.id}">Ignore</button>
            ` : `
              <button class="btn-sm gray" data-action="view" data-id="${r.id}">View</button>
            `}
          </div>
        </td>
      `;
      tr.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => handleReportAction(btn.dataset.action, btn.dataset.id, btn));
      });
      tbody.appendChild(tr);
    });
  }

  paint();

  document.getElementById('reportFilterTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('#reportFilterTabs .filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    paint();
  });

  document.getElementById('refreshReportsBtn')?.addEventListener('click', () => renderReports());
}

async function handleReportAction(action, id, btnEl) {
  const report = cachedData.reports.find(r => r.id === id);
  if (!report) return;

  if (action === 'view') {
    const isPost = report.type === 'post';
    const isUser = report.type === 'user';

    let contentHTML = `
      <div style="font-size:13px;line-height:1.6;color:#ccc;">
        <div><b>Type:</b> ${escapeHtml(report.type || '')}</div>
        <div><b>Reason:</b> ${escapeHtml(report.reason || '')}</div>
        <div><b>Reported by:</b> @${escapeHtml(report.reportedByHandle || 'unknown')}</div>
      </div>
    `;

    if (isPost && report.postId) {
      try {
        const postSnap = await getDoc(doc(db, 'posts', report.postId));
        if (postSnap.exists()) {
          const post = postSnap.data();
          contentHTML += `
            <hr style="border-color:#1e1e28;margin:14px 0;">
            <div style="font-size:12px;color:#fff;">
              <b>Post by:</b> ${escapeHtml(post.userName || '')} @${escapeHtml(post.userHandle || '')}
            </div>
            <div style="margin-top:8px;font-size:12px;color:#ccc;">${escapeHtml(post.caption || '')}</div>
          `;
          if (post.type === 'photo') {
            contentHTML += `<img src="${post.url}" style="width:100%;border-radius:10px;margin-top:10px;">`;
          } else {
            contentHTML += `<video src="${post.url}" controls style="width:100%;border-radius:10px;margin-top:10px;background:#000;max-height:300px;"></video>`;
          }
        } else {
          contentHTML += `<div style="color:#888;margin-top:10px;">Post already deleted.</div>`;
        }
      } catch (e) {
        contentHTML += `<div style="color:#888;margin-top:10px;">Could not load post.</div>`;
      }
    }

    if (isUser && report.reportedUserId) {
      try {
        const userSnap = await getDoc(doc(db, 'users', report.reportedUserId));
        if (userSnap.exists()) {
          const user = userSnap.data();
          contentHTML += `
            <hr style="border-color:#1e1e28;margin:14px 0;">
            <div style="display:flex;align-items:center;gap:12px;">
              <img src="${user.photo || defaultAvatar(user.name)}" style="width:50px;height:50px;border-radius:50%;">
              <div>
                <b>${escapeHtml(user.name || '')}</b><br>
                <span style="color:#888;font-size:12px;">@${escapeHtml(user.user || '')}</span>
              </div>
            </div>
          `;
        }
      } catch (e) {}
    }

    contentHTML += `
      <hr style="border-color:#1e1e28;margin:14px 0;">
      <div style="font-size:11px;color:#666;">
        Report ID: ${escapeHtml(report.id)}
      </div>
    `;

    openModal('Report Details', contentHTML);
    return;
  }

  if (action === 'ignore') {
    setButtonLoading(btnEl, true);
    try {
      await updateDoc(doc(db, 'reports', id), {
        status: 'ignored',
        resolvedAt: serverTimestamp(),
        resolvedBy: currentAdmin.uid
      });
      report.status = 'ignored';
      showToast('Report ignored', 'info');
      await renderReports();
    } catch (e) {
      showToast('Failed', 'error');
      setButtonLoading(btnEl, false);
    }
    return;
  }

  if (action === 'action') {
    const isPost = report.type === 'post';

    const actionOptions = isPost ? `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <button class="btn-primary" id="deleteContentBtn" style="background:#dc2626;">Delete Post</button>
        <button class="btn-outline" id="warnUserBtn">Warn User</button>
        <button class="btn-outline" id="banUserBtn" style="color:#ff8a00;border-color:#ff8a00;">Ban User</button>
        <button class="btn-outline" id="resolveOnlyBtn">Mark as Resolved (No Action)</button>
      </div>
    ` : `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <button class="btn-outline" id="warnUserBtn">Warn User</button>
        <button class="btn-primary" id="banUserBtn" style="background:#dc2626;">Ban User</button>
        <button class="btn-outline" id="resolveOnlyBtn">Mark as Resolved (No Action)</button>
      </div>
    `;

    openModal('Take Action', `
      <p style="font-size:13px;color:#ccc;margin-bottom:14px;">
        Choose an action for this report:
      </p>
      ${actionOptions}
    `);

    document.getElementById('deleteContentBtn')?.addEventListener('click', async () => {
      if (!confirm('Delete this post?')) return;
      try {
        await deleteDoc(doc(db, 'posts', report.postId));
        await updateDoc(doc(db, 'reports', id), {
          status: 'resolved',
          resolvedAt: serverTimestamp(),
          resolvedBy: currentAdmin.uid,
          actionTaken: 'post_deleted'
        });
        showToast('Post deleted + report resolved', 'success');
        closeModal();
        await renderReports();
      } catch (e) {
        showToast('Failed', 'error');
      }
    });

    document.getElementById('warnUserBtn')?.addEventListener('click', async () => {
      const targetUid = isPost ? report.postUserId : report.reportedUserId;
      if (!targetUid) return;
      try {
        await pushNotification(targetUid, {
          type: 'warning',
          title: '⚠️ Warning from Admin',
          message: `Your content was reported: ${report.reason || 'violation'}. Please follow community guidelines.`
        });
        await updateDoc(doc(db, 'reports', id), {
          status: 'resolved',
          resolvedAt: serverTimestamp(),
          resolvedBy: currentAdmin.uid,
          actionTaken: 'user_warned'
        });
        showToast('User warned + report resolved', 'success');
        closeModal();
        await renderReports();
      } catch (e) {
        showToast('Failed', 'error');
      }
    });

    document.getElementById('banUserBtn')?.addEventListener('click', async () => {
      const targetUid = isPost ? report.postUserId : report.reportedUserId;
      if (!targetUid) return;
      if (!confirm('Ban this user?')) return;
      try {
        await updateDoc(doc(db, 'users', targetUid), { banned: true });
        await pushNotification(targetUid, {
          type: 'banned',
          title: '🚫 Account banned',
          message: 'Your account has been banned by admin.'
        });
        await updateDoc(doc(db, 'reports', id), {
          status: 'resolved',
          resolvedAt: serverTimestamp(),
          resolvedBy: currentAdmin.uid,
          actionTaken: 'user_banned'
        });
        showToast('User banned + report resolved', 'warn');
        closeModal();
        await renderReports();
      } catch (e) {
        showToast('Failed', 'error');
      }
    });

    document.getElementById('resolveOnlyBtn')?.addEventListener('click', async () => {
      try {
        await updateDoc(doc(db, 'reports', id), {
          status: 'resolved',
          resolvedAt: serverTimestamp(),
          resolvedBy: currentAdmin.uid,
          actionTaken: 'none'
        });
        showToast('Marked as resolved', 'success');
        closeModal();
        await renderReports();
      } catch (e) {
        showToast('Failed', 'error');
      }
    });
  }
}

/* ============================================================
   MESSAGE MODAL
   ============================================================ */
function openMessageModal(user) {
  openModal(`Message to ${user.name}`, `
    <div class="input-group">
      <label>Title</label>
      <input type="text" id="msgTitleInput" placeholder="Notification title" maxlength="60">
    </div>
    <div class="input-group">
      <label>Message</label>
      <textarea id="msgBodyInput" placeholder="Type message..." maxlength="300"></textarea>
    </div>
    <button class="btn-primary" id="sendMsgBtn">Send</button>
    <div class="error-msg" id="msgStatus"></div>
  `);

  document.getElementById('sendMsgBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const title = document.getElementById('msgTitleInput').value.trim();
    const message = document.getElementById('msgBodyInput').value.trim();
    const status = document.getElementById('msgStatus');

    status.textContent = '';
    status.className = 'error-msg';

    if (!title || !message) {
      status.textContent = 'Please fill both fields.';
      return;
    }

    setButtonLoading(btn, true);
    try {
      await pushNotification(user.id, {
        type: 'admin_message',
        title: title,
        message: message
      });
      status.className = 'success-msg';
      status.textContent = 'Sent!';
      showToast('Message sent', 'success');
      setTimeout(closeModal, 700);
    } catch (err) {
      console.error(err);
      status.textContent = err.message || 'Failed.';
      setButtonLoading(btn, false);
    }
  });
}

/* ============================================================
   MODAL HELPERS
   ============================================================ */
function openModal(title, html) {
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modalOverlay.classList.add('show');
}

function closeModal() {
  modalOverlay.classList.remove('show');
  modalBody.innerHTML = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

/* ============================================================
   NOTIFICATION HELPER
   ============================================================ */
async function pushNotification(userId, data) {
  if (!userId) return;
  await addDoc(collection(db, 'notifications'), {
    userId: userId,
    type: data.type || 'info',
    title: data.title || '',
    message: data.message || '',
    inviteId: data.inviteId || null,
    actions: data.actions || null,
    read: false,
    createdAt: serverTimestamp()
  });
}

console.log('✅ Admin panel loaded — COMPLETE version');