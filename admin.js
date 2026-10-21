/* ============================================================
   ReelHub Admin — admin.js (COMPLETE + TIME-BASED TICK)
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc, serverTimestamp,
  orderBy, limit, writeBatch, Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

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

const HARDCODED_ADMIN_EMAILS = ["reehubreelhub@gmail.com"];
let ADMIN_EMAILS = [...HARDCODED_ADMIN_EMAILS];

async function loadAdminEmails() {
  try {
    const snap = await getDoc(doc(db, 'admin_config', 'emails'));
    if (snap.exists()) {
      const list = snap.data().list || [];
      const merged = [...new Set([...HARDCODED_ADMIN_EMAILS, ...list])];
      ADMIN_EMAILS = merged.map(e => e.toLowerCase().trim());
    }
  } catch (e) { ADMIN_EMAILS = [...HARDCODED_ADMIN_EMAILS]; }
}

function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(email.toLowerCase().trim());
}

function isSuperAdmin(email) {
  if (!email) return false;
  return HARDCODED_ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(email.toLowerCase().trim());
}

let currentAdmin = null;
let currentAdminProfile = null;
let currentPage = 'dashboard';
let isLoggingIn = false;
let cachedData = { users: [], videos: [], comments: [], invites: [], reports: [] };

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

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.style.cssText = `background:#1e1e28; color:#fff; padding:12px 16px; border-radius:10px; margin-bottom:8px; font-size:13px; display:flex; gap:8px; align-items:center; box-shadow:0 4px 12px rgba(0,0,0,0.5); border-left:3px solid ${type==='success'?'#4ade80':type==='error'?'#ff4d4d':'#4ea8ff'}; animation: slideIn 0.3s ease;`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, duration);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
}

function setButtonLoading(btn, loading = true) {
  if (!btn) return;
  if (loading) { btn.dataset.originalText = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Wait...'; }
  else { btn.disabled = false; if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText; }
}

loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('adminEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('adminPass').value;
  loginMsg.textContent = ''; loginMsg.className = 'error-msg';
  if (!email || !pass) { loginMsg.textContent = 'Please enter email and password.'; return; }
  isLoggingIn = true; loginBtn.disabled = true; loginBtn.textContent = 'Checking...';
  try {
    await loadAdminEmails();
    if (!isAdminEmail(email)) { loginMsg.textContent = 'Access denied. This email is not an admin.'; return; }
    const result = await signInWithEmailAndPassword(auth, email, pass);
    currentAdmin = result.user;
    try { const snap = await getDoc(doc(db, 'users', result.user.uid)); currentAdminProfile = snap.exists() ? snap.data() : { name: email.split('@')[0] }; } catch (e) { currentAdminProfile = { name: email.split('@')[0] }; }
    adminNameEl.textContent = currentAdminProfile.name || 'Admin';
    loader.style.display = 'none'; loginScreen.style.display = 'none'; appScreen.classList.add('show'); goToPage('dashboard');
  } catch (err) {
    loginMsg.className = 'error-msg'; try { await signOut(auth); } catch (e) {} currentAdmin = null;
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') loginMsg.textContent = 'Invalid email or password.';
    else loginMsg.textContent = err.message || 'Login failed.';
  } finally { loginBtn.disabled = false; loginBtn.textContent = 'Log In'; isLoggingIn = false; }
});

document.getElementById('adminPass')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') loginBtn.click(); });

document.getElementById('adminLogout').addEventListener('click', async () => {
  if (confirm('Logout from admin panel?')) { try { await signOut(auth); showToast('Logged out', 'info'); } catch (e) { showToast('Logout failed', 'error'); } }
});

onAuthStateChanged(auth, async (user) => {
  if (isLoggingIn) return;
  if (user) {
    await loadAdminEmails();
    if (!isAdminEmail(user.email)) { await signOut(auth); currentAdmin = null; showLogin(); return; }
    currentAdmin = user;
    try { const snap = await getDoc(doc(db, 'users', user.uid)); currentAdminProfile = snap.exists() ? snap.data() : { name: user.email.split('@')[0] }; } catch (e) { currentAdminProfile = { name: user.email.split('@')[0] }; }
    adminNameEl.textContent = currentAdminProfile.name || 'Admin'; showApp(); return;
  }
  currentAdmin = null; currentAdminProfile = null; showLogin();
});

function showLogin() {
  loader.style.display = 'none'; loginScreen.style.display = 'flex'; appScreen.classList.remove('show');
  const passEl = document.getElementById('adminPass'); if (passEl) passEl.value = '';
  if (window.location.hash) history.replaceState(null, '', window.location.pathname);
}

function showApp() {
  loader.style.display = 'none'; loginScreen.style.display = 'none'; appScreen.classList.add('show');
  const hash = window.location.hash.replace('#', '');
  const validPages = ['dashboard', 'users', 'videos', 'comments', 'admins', 'notifications', 'reports'];
  goToPage(validPages.includes(hash) ? hash : 'dashboard');
}

function goToPage(page) {
  document.querySelectorAll('.side-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  if (window.location.hash !== '#' + page) history.replaceState(null, '', '#' + page);
  renderPage(page);
}

window.addEventListener('hashchange', () => {
  if (!currentAdmin) return;
  const hash = window.location.hash.replace('#', '');
  const validPages = ['dashboard', 'users', 'videos', 'comments', 'admins', 'notifications', 'reports'];
  if (validPages.includes(hash) && hash !== currentPage) goToPage(hash);
});

document.querySelectorAll('.side-item').forEach(item => { item.addEventListener('click', () => goToPage(item.dataset.page)); });

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
  } catch (err) { adminContent.innerHTML = `<div class="empty-box">Error: ${escapeHtml(err.message)}</div>`; }
}

async function renderDashboard() {
  const [usersSnap, videosSnap, commentsSnap, reportsSnap] = await Promise.all([
    getDocs(collection(db, 'users')), getDocs(collection(db, 'posts')), getDocs(collection(db, 'comments')), getDocs(collection(db, 'reports'))
  ]);
  const totalUsers = usersSnap.size, totalVideos = videosSnap.size, totalComments = commentsSnap.size, totalReports = reportsSnap.size;
  let totalLikes = 0, totalViews = 0, shortsCount = 0, longCount = 0;
  videosSnap.forEach(d => { const data = d.data(); totalLikes += (data.likes || []).length; totalViews += data.views || 0; if (data.type === 'short') shortsCount++; else if (data.type === 'long') longCount++; });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let todaySignups = 0, todayVideos = 0;
  usersSnap.forEach(d => { const created = d.data().createdAt?.toDate?.(); if (created && created >= today) todaySignups++; });
  videosSnap.forEach(d => { const created = d.data().createdAt?.toDate?.(); if (created && created >= today) todayVideos++; });

  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Dashboard</div><button class="refresh-btn" id="refreshDashBtn">Refresh</button></div>
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
      <div class="stat-card"><div class="label">Shorts</div><div class="value" style="color:#ff2e63">${shortsCount}</div></div>
      <div class="stat-card"><div class="label">Long Videos</div><div class="value" style="color:#4ea8ff">${longCount}</div></div>
    </div>
  `;
  document.getElementById('refreshDashBtn')?.addEventListener('click', () => renderDashboard());
  document.querySelectorAll('[data-nav]').forEach(card => { card.addEventListener('click', () => goToPage(card.dataset.nav)); });
}

async function renderUsers() {
  const snap = await getDocs(collection(db, 'users'));
  cachedData.users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const bannedCount = cachedData.users.filter(u => u.banned).length;
  const verifiedCount = cachedData.users.filter(u => u.verified).length;

  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Users (${cachedData.users.length})</div><button class="refresh-btn" id="refreshUsersBtn">Refresh</button></div>
    <div class="table-wrap">
      <div class="table-search"><input type="text" id="userSearch" placeholder="Search by name, username or email..."></div>
      <div class="filter-tabs" id="userFilterTabs">
        <button class="filter-tab active" data-filter="all">All (${cachedData.users.length})</button>
        <button class="filter-tab" data-filter="verified">Verified (${verifiedCount})</button>
        <button class="filter-tab" data-filter="banned">Banned (${bannedCount})</button>
        <button class="filter-tab" data-filter="admin">Admins (${ADMIN_EMAILS.length})</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Videos</th><th>Actions</th></tr></thead>
          <tbody id="usersTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  let currentFilter = 'all', currentSearch = '';

  function paint() {
    const q = currentSearch.toLowerCase().trim();
    let list = cachedData.users.filter(u => {
      if (currentFilter === 'verified' && !u.verified) return false;
      if (currentFilter === 'banned' && !u.banned) return false;
      if (currentFilter === 'admin' && !isAdminEmail(u.email)) return false;
      if (!q) return true;
      return (u.name || '').toLowerCase().includes(q) || (u.user || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    });

    const tbody = document.getElementById('usersTbody');
    if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><h4>No users found</h4></div></td></tr>`; return; }

    tbody.innerHTML = '';
    list.forEach(u => {
      const tr = document.createElement('tr');
      const avatar = u.photo || defaultAvatar(u.name);
      const roleBadge = isAdminEmail(u.email) ? `<span class="badge-pill admin">${isSuperAdmin(u.email) ? 'SUPER' : 'ADMIN'}</span>` : `<span style="color:#666">user</span>`;
      const verifiedBadge = u.verified ? ` <span class="badge-pill verified">✓</span>` : '';
      const bannedBadge = u.banned ? ` <span class="badge-pill banned">BANNED</span>` : '';

      tr.innerHTML = `
        <td><div class="user-cell"><img src="${avatar}" alt=""><div class="info"><b>${escapeHtml(u.name)}${verifiedBadge}${bannedBadge}</b><span>@${escapeHtml(u.user)}</span></div></div></td>
        <td style="font-size:12px;">${escapeHtml(u.email || '')}</td>
        <td>${roleBadge}</td>
        <td>${u.videoCount || 0}</td>
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
            <button class="btn-sm danger" data-action="delete" data-uid="${u.id}">Del</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('[data-action]').forEach(btn => { btn.addEventListener('click', () => handleUserAction(btn.dataset.action, btn.dataset.uid, btn)); });
  }

  paint();
  const debouncedSearch = debounce((val) => { currentSearch = val; paint(); }, 300);
  document.getElementById('userSearch').addEventListener('input', (e) => debouncedSearch(e.target.value));
  document.getElementById('userFilterTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab'); if (!tab) return;
    document.querySelectorAll('#userFilterTabs .filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active'); currentFilter = tab.dataset.filter; paint();
  });
  document.getElementById('refreshUsersBtn')?.addEventListener('click', () => renderUsers());
}

async function handleUserAction(action, uid, btnEl) {
  const user = cachedData.users.find(u => u.id === uid);
  if (!user) return;

  if (action === 'msg') { openMessageModal(user); return; }

  if (action === 'apply-tick') {
    const selectEl = document.getElementById(`tick-select-${uid}`);
    const duration = selectEl ? selectEl.value : 'none';
    setButtonLoading(btnEl, true);
    try {
      let isVerified = false, verifiedUntil = null;
      if (duration !== 'none') {
        isVerified = true;
        const now = new Date();
        now.setDate(now.getDate() + parseInt(duration));
        verifiedUntil = Timestamp.fromDate(now);
      }
      await updateDoc(doc(db, 'users', uid), { verified: isVerified, verifiedUntil: verifiedUntil });
      user.verified = isVerified; user.verifiedUntil = verifiedUntil;
      if (isVerified) {
        await pushNotification(uid, { type: 'verified', title: '✅ You are verified!', message: `Your account is now verified for ${duration} days.` });
        showToast(`Blue Tick active for ${duration} days`, 'success');
      } else { showToast('Blue Tick removed', 'info'); }
      await renderUsers();
    } catch (e) { showToast('Action failed', 'error'); setButtonLoading(btnEl, false); }
    return;
  }

  if (action === 'ban') {
    const newVal = !user.banned;
    if (newVal && !confirm(`Ban ${user.name}?`)) return;
    setButtonLoading(btnEl, true);
    try {
      await updateDoc(doc(db, 'users', uid), { banned: newVal }); user.banned = newVal;
      if (newVal) await pushNotification(uid, { type: 'banned', title: '🚫 Account banned', message: 'Your account has been banned by admin.' });
      showToast(newVal ? 'User banned' : 'User unbanned', newVal ? 'warn' : 'success');
      await renderUsers();
    } catch (e) { showToast('Action failed', 'error'); setButtonLoading(btnEl, false); }
    return;
  }

  if (action === 'delete') {
    if (!confirm(`DELETE ${user.name}? This cannot be undone.`)) return;
    setButtonLoading(btnEl, true);
    try { await cascadeDeleteUser(uid); showToast('User deleted', 'success'); await renderUsers(); }
    catch (e) { showToast('Delete failed', 'error'); setButtonLoading(btnEl, false); }
    return;
  }
}

async function cascadeDeleteUser(uid) {
  try { const snap = await getDocs(query(collection(db, 'posts'), where('userId', '==', uid))); await batchDelete(snap.docs.map(d => d.ref)); } catch (e) {}
  try { const snap = await getDocs(query(collection(db, 'comments'), where('userId', '==', uid))); await batchDelete(snap.docs.map(d => d.ref)); } catch (e) {}
  try { const snap = await getDocs(query(collection(db, 'stories'), where('userId', '==', uid))); await batchDelete(snap.docs.map(d => d.ref)); } catch (e) {}
  try { const snap = await getDocs(query(collection(db, 'notifications'), where('userId', '==', uid))); await batchDelete(snap.docs.map(d => d.ref)); } catch (e) {}
  await deleteDoc(doc(db, 'users', uid));
}

async function batchDelete(refs) {
  const chunks = [];
  for (let i = 0; i < refs.length; i += 450) chunks.push(refs.slice(i, i + 450));
  for (const chunk of chunks) { const batch = writeBatch(db); chunk.forEach(ref => batch.delete(ref)); await batch.commit(); }
}

async function renderVideos() {
  const snap = await getDocs(collection(db, 'posts'));
  cachedData.videos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const shortsCount = cachedData.videos.filter(v => v.type === 'short').length, longCount = cachedData.videos.filter(v => v.type === 'long').length, photoCount = cachedData.videos.filter(v => v.type === 'photo').length;

  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Videos</div><button class="refresh-btn" id="refreshVideosBtn">Refresh</button></div>
    <div class="table-wrap">
      <div class="table-search"><input type="text" id="videoSearch" placeholder="Search..."></div>
      <div class="filter-tabs" id="videoFilterTabs">
        <button class="filter-tab active" data-filter="all">All (${cachedData.videos.length})</button>
        <button class="filter-tab" data-filter="short">Shorts (${shortsCount})</button>
        <button class="filter-tab" data-filter="long">Long (${longCount})</button>
        <button class="filter-tab" data-filter="photo">Photos (${photoCount})</button>
      </div>
      <div style="overflow-x:auto;"><table class="admin-table"><thead><tr><th>Preview</th><th>User</th><th>Caption</th><th>Actions</th></tr></thead><tbody id="videosTbody"></tbody></table></div>
    </div>
  `;

  let currentFilter = 'all', currentSearch = '';

  function paint() {
    const q = currentSearch.toLowerCase().trim();
    const list = cachedData.videos.filter(v => {
      if (currentFilter !== 'all' && v.type !== currentFilter) return false;
      if (!q) return true;
      return (v.caption || '').toLowerCase().includes(q) || (v.userName || '').toLowerCase().includes(q);
    });
    const tbody = document.getElementById('videosTbody');
    if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><h4>No videos found</h4></div></td></tr>`; return; }
    tbody.innerHTML = '';
    list.forEach(v => {
      const tr = document.createElement('tr');
      let preview = `<img src="${v.thumbnail || v.url}" style="width:60px;height:80px;object-fit:cover;border-radius:6px;">`;
      tr.innerHTML = `
        <td>${preview}</td>
        <td><div style="font-size:12px;"><b>${escapeHtml(v.userName || '')}</b><br><span style="color:#666">@${escapeHtml(v.userHandle || '')}</span></div></td>
        <td style="max-width:180px;font-size:12px;color:#aaa;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(v.caption || '—')}</td>
        <td><div class="actions-cell"><button class="btn-sm gray" data-action="preview" data-id="${v.id}">View</button><button class="btn-sm danger" data-action="delete" data-id="${v.id}">Delete</button></div></td>
      `;
      tr.querySelector('[data-action="preview"]').addEventListener('click', () => openModal('Video', `<video src="${v.url}" controls style="width:100%;border-radius:10px;max-height:60vh;background:#000;"></video>`));
      tr.querySelector('[data-action="delete"]').addEventListener('click', async () => { if (!confirm('Delete?')) return; await deleteDoc(doc(db, 'posts', v.id)); showToast('Deleted'); renderVideos(); });
      tbody.appendChild(tr);
    });
  }
  paint();
  document.getElementById('videoSearch').addEventListener('input', (e) => { currentSearch = e.target.value; paint(); });
  document.getElementById('videoFilterTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab'); if (!tab) return;
    document.querySelectorAll('#videoFilterTabs .filter-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); currentFilter = tab.dataset.filter; paint();
  });
  document.getElementById('refreshVideosBtn')?.addEventListener('click', () => renderVideos());
}

async function renderComments() {
  adminContent.innerHTML = `<div class="page-title-admin"><div class="title-text">Comments</div></div><div class="empty-box">Coming soon...</div>`;
}

async function renderAdmins() {
  await loadAdminEmails();
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Admins</div><button class="refresh-btn" id="refreshAdminsBtn">Refresh</button></div>
    <div class="section-head"><h3>Current Admins (${ADMIN_EMAILS.length})</h3><button class="btn-outline" id="inviteNewBtn">+ Invite</button></div>
    <div id="adminsList"></div>
  `;
  const adminsList = document.getElementById('adminsList');
  ADMIN_EMAILS.forEach(email => {
    const card = document.createElement('div'); card.className = 'invite-card';
    card.innerHTML = `<div class="info"><b>${email}</b></div>`;
    adminsList.appendChild(card);
  });
  document.getElementById('inviteNewBtn').addEventListener('click', () => openModal('Invite', `<p>Feature coming soon</p>`));
  document.getElementById('refreshAdminsBtn')?.addEventListener('click', () => renderAdmins());
}

async function renderNotify() {
  adminContent.innerHTML = `<div class="page-title-admin"><div class="title-text">Send Notification</div></div><div class="empty-box">Coming soon...</div>`;
}

async function renderReports() {
  adminContent.innerHTML = `<div class="page-title-admin"><div class="title-text">Reports</div></div><div class="empty-box">Coming soon...</div>`;
}

function openMessageModal(user) {
  openModal('Message', `<p>Message to ${user.name}</p><div class="error-msg">Feature coming soon</div>`);
}

function openModal(title, html) {
  modalTitle.textContent = title; modalBody.innerHTML = html; modalOverlay.classList.add('show');
}
function closeModal() { modalOverlay.classList.remove('show'); modalBody.innerHTML = ''; }
document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

async function pushNotification(userId, data) {
  if (!userId) return;
  await addDoc(collection(db, 'notifications'), {
    userId: userId, type: data.type || 'info', title: data.title || '', message: data.message || '', read: false, createdAt: serverTimestamp()
  });
}