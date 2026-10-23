/* ============================================================
   ReelHub Admin — admin.js (FINAL V5 — APP LIKE + NOTIFY)
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
const db   = getFirestore(firebaseApp);

const HARDCODED_ADMIN_EMAILS = ["reehubreelhub@gmail.com"];
let ADMIN_EMAILS = [...HARDCODED_ADMIN_EMAILS];

async function loadAdminEmails() {
  try {
    const snap = await getDoc(doc(db, 'admin_config', 'emails'));
    if (snap.exists()) {
      const list = snap.data().list || [];
      ADMIN_EMAILS = [...new Set([...HARDCODED_ADMIN_EMAILS, ...list].map(e => String(e).toLowerCase().trim()))];
    }
  } catch (e) { ADMIN_EMAILS = [...HARDCODED_ADMIN_EMAILS]; }
}
function isAdminEmail(email) { return email && ADMIN_EMAILS.includes(String(email).toLowerCase().trim()); }
function isSuperAdmin(email) { return email && HARDCODED_ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(String(email).toLowerCase().trim()); }

let currentAdmin = null;
let currentAdminProfile = null;
let currentPage = 'dashboard';
let isLoggingIn = false;
let cachedData = { users: [], videos: [] };

const loader = document.getElementById('loader');
const loginScreen = document.getElementById('adminLogin');
const appScreen = document.getElementById('adminApp');
const loginBtn = document.getElementById('adminLoginBtn');
const loginMsg = document.getElementById('adminLoginMsg');
const adminContent = document.getElementById('adminContent');
const adminNameEl = document.getElementById('adminName');
const modalOverlay = document.getElementById('adminModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

function safeNum(v) { const n = Number(v); return isNaN(n) || !isFinite(n) ? 0 : n; }
function safeArray(v) { return Array.isArray(v) ? v : []; }
function escapeHtml(str) { if (str === null || str === undefined) return ''; return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function defaultAvatar(name) { const l = (name || '?').trim().charAt(0).toUpperCase() || '?'; const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1e1e28"/><text x="50" y="50" font-size="44" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${l}</text></svg>`; return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg); }
function timeAgo(d) { const s = Math.floor((new Date()-d)/1000); if (s<60) return 'now'; const m=Math.floor(s/60); if (m<60) return m+'m'; const h=Math.floor(m/60); if (h<24) return h+'h'; return Math.floor(h/24)+'d'; }

function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const colors = { success: '#4ade80', error: '#ff4d4d', info: '#4ea8ff' };
  const toast = document.createElement('div');
  toast.style.cssText = `background:#1e1e28;color:#fff;padding:12px 16px;border-radius:10px;font-size:13px;border-left:3px solid ${colors[type] || colors.info};margin-bottom:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ============================================================
   AUTH & LOGIN
   ============================================================ */
loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('adminEmail').value.trim().toLowerCase();
  const pass = document.getElementById('adminPass').value;
  loginMsg.textContent = '';
  if (!email || !pass) { loginMsg.textContent = 'Enter email and password'; return; }

  isLoggingIn = true; loginBtn.disabled = true; loginBtn.textContent = 'Checking...';
  try {
    await loadAdminEmails();
    if (!isAdminEmail(email)) { loginMsg.textContent = 'Access denied.'; return; }
    const result = await signInWithEmailAndPassword(auth, email, pass);
    currentAdmin = result.user;
    const snap = await getDoc(doc(db, 'users', result.user.uid));
    currentAdminProfile = snap.exists() ? snap.data() : { name: email.split('@')[0] };
    adminNameEl.textContent = currentAdminProfile.name || 'Admin';
    loader.style.display = 'none'; loginScreen.style.display = 'none'; appScreen.style.display = 'flex';
    goToPage('dashboard');
  } catch (err) {
    loginMsg.textContent = 'Invalid credentials.';
    try { await signOut(auth); } catch (e) {}
  } finally { loginBtn.disabled = false; loginBtn.textContent = 'Log In'; isLoggingIn = false; }
});

document.getElementById('adminPass')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') loginBtn.click(); });

onAuthStateChanged(auth, async (user) => {
  if (isLoggingIn) return;
  if (user) {
    await loadAdminEmails();
    if (!isAdminEmail(user.email)) { await signOut(auth); showLogin(); return; }
    currentAdmin = user;
    const snap = await getDoc(doc(db, 'users', user.uid));
    currentAdminProfile = snap.exists() ? snap.data() : { name: user.email.split('@')[0] };
    adminNameEl.textContent = currentAdminProfile.name || 'Admin';
    showApp();
  } else { showLogin(); }
});

function showLogin() { loader.style.display = 'none'; loginScreen.style.display = 'flex'; appScreen.style.display = 'none'; }
function showApp() { loader.style.display = 'none'; loginScreen.style.display = 'none'; appScreen.style.display = 'flex'; goToPage('dashboard'); }

function goToPage(page) {
  document.querySelectorAll('.side-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  currentPage = page;
  renderPage(page);
}
document.querySelectorAll('.side-item').forEach(item => item.addEventListener('click', () => goToPage(item.dataset.page)));

async function renderPage(page) {
  adminContent.innerHTML = `<div class="loader-screen" style="min-height:200px;"><div class="spinner"></div></div>`;
  try {
    if (page === 'dashboard') await renderDashboard();
    else if (page === 'users') await renderUsers();
    else if (page === 'videos') await renderVideos();
    else if (page === 'payments') await renderPayments();
    else if (page === 'wallet') await renderWallet();
    else if (page === 'notifications') await renderNotify();
    else adminContent.innerHTML = `<div class="empty-box">Coming soon...</div>`;
  } catch (err) { adminContent.innerHTML = `<div class="empty-box" style="color:#ff4d4d;">Error: ${err.message}</div>`; }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
async function renderDashboard() {
  const [u, v, c, r] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'posts')),
    getDocs(collection(db, 'comments')),
    getDocs(collection(db, 'reports'))
  ]);
  let views = 0; v.forEach(d => views += safeNum(d.data().views));

  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Dashboard</div><button class="refresh-btn" onclick="renderDashboard()">Refresh</button></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="label">Users</div><div class="value" style="color:#4ea8ff">${u.size}</div></div>
      <div class="stat-card"><div class="label">Videos</div><div class="value" style="color:#ff2e63">${v.size}</div></div>
      <div class="stat-card"><div class="label">Comments</div><div class="value" style="color:#4ade80">${c.size}</div></div>
      <div class="stat-card"><div class="label">Views</div><div class="value" style="color:#ff8a00">${views}</div></div>
    </div>
  `;
}

/* ============================================================
   USERS (WITH INSTANT VERIFY, SUSPEND, NOTIFY)
   ============================================================ */
async function renderUsers() {
  const [uSnap, pSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'posts'))
  ]);
  
  cachedData.users = uSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const vMap = {};
  pSnap.forEach(d => { const uid = d.data().userId; if(uid) vMap[uid] = (vMap[uid]||0)+1; });
  cachedData.users.forEach(u => u._realVids = vMap[u.id] || 0);

  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Users (${cachedData.users.length})</div><button class="refresh-btn" onclick="renderUsers()">Refresh</button></div>
    <div class="table-wrap">
      <div class="table-search"><input type="text" id="userSearch" placeholder="Search users..."></div>
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead><tr><th>User</th><th>Videos</th><th>Wallet</th><th>Actions</th></tr></thead>
          <tbody id="usersTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  function paint() {
    const q = (document.getElementById('userSearch')?.value || '').toLowerCase();
    const list = cachedData.users.filter(u => (u.name||'').toLowerCase().includes(q) || (u.user||'').toLowerCase().includes(q));
    const tbody = document.getElementById('usersTbody');
    
    if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;">No users found</td></tr>`; return; }

    tbody.innerHTML = '';
    list.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${u.photo || defaultAvatar(u.name)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
            <div>
              <b>${escapeHtml(u.name || 'Unknown')}</b> ${u.verified ? '<span class="badge-pill verified">✓</span>' : ''} ${u.banned ? '<span class="badge-pill banned">SUSPENDED</span>' : ''}<br>
              <span style="font-size:11px;color:#888;">@${escapeHtml(u.user || '')}</span>
            </div>
          </div>
        </td>
        <td>${safeNum(u._realVids)}</td>
        <td>₹${safeNum(u.walletBalance)}</td>
        <td>
          <button class="btn-sm primary" onclick="window.toggleVerify('${u.id}', ${u.verified||false})">${u.verified ? 'Unverify' : 'Verify'}</button>
          <button class="btn-sm warn" onclick="window.toggleSuspend('${u.id}', ${u.banned||false})">${u.banned ? 'Unsuspend' : 'Suspend'}</button>
          <button class="btn-sm dark" onclick="window.msgUser('${u.id}', '${escapeHtml(u.name)}')">Msg</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  paint();
  document.getElementById('userSearch')?.addEventListener('input', paint);
}

// Global functions for inline onclick (User actions)
window.toggleVerify = async (uid, current) => {
  try {
    await updateDoc(doc(db, 'users', uid), { verified: !current, verifiedUntil: null });
    showToast(!current ? 'User Verified!' : 'Verification Removed', 'success');
    renderUsers();
  } catch(e) { showToast('Error: '+e.message, 'error'); }
};

window.toggleSuspend = async (uid, current) => {
  if (!confirm(`Are you sure you want to ${current?'unsuspend':'suspend'} this user?`)) return;
  try {
    await updateDoc(doc(db, 'users', uid), { banned: !current });
    showToast(!current ? 'User Suspended' : 'User Unsuspended', 'success');
    renderUsers();
  } catch(e) { showToast('Error: '+e.message, 'error'); }
};

window.msgUser = (uid, name) => {
  alert(`Message feature coming soon for ${name}`);
};

/* ============================================================
   NOTIFY (SINGLE / ALL USER)
   ============================================================ */
async function renderNotify() {
  if (cachedData.users.length === 0) {
    const snap = await getDocs(collection(db, 'users'));
    cachedData.users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  const userOptions = cachedData.users.map(u => `<option value="${u.id}">${escapeHtml(u.name)} (@${escapeHtml(u.user)})</option>`).join('');

  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Send Notification</div></div>
    <div style="background:#121218; padding:20px; border-radius:12px; max-width:600px;">
      <div class="input-group">
        <label>Target Audience</label>
        <select id="notifyTarget" style="width:100%; padding:12px; background:#0a0a12; color:#fff; border:1px solid #333; border-radius:8px;">
          <option value="all">All Users (Broadcast)</option>
          <option value="specific">Specific User</option>
        </select>
      </div>
      
      <div class="input-group" id="userSelectGroup" style="display:none;">
        <label>Select User</label>
        <select id="notifyUserSelect" style="width:100%; padding:12px; background:#0a0a12; color:#fff; border:1px solid #333; border-radius:8px;">
          ${userOptions}
        </select>
      </div>

      <div class="input-group">
        <label>Notification Title</label>
        <input type="text" id="notifyTitle" placeholder="e.g. 🎉 New Update Available!" style="width:100%; padding:12px; background:#0a0a12; color:#fff; border:1px solid #333; border-radius:8px;">
      </div>

      <div class="input-group">
        <label>Message Body</label>
        <textarea id="notifyMessage" rows="4" placeholder="Write your message here..." style="width:100%; padding:12px; background:#0a0a12; color:#fff; border:1px solid #333; border-radius:8px;"></textarea>
      </div>

      <button class="btn-primary" id="sendNotifyBtn" style="margin-top:10px;">Send Notification 🚀</button>
    </div>
  `;

  const targetSelect = document.getElementById('notifyTarget');
  const userGroup = document.getElementById('userSelectGroup');

  targetSelect.addEventListener('change', (e) => {
    userGroup.style.display = e.target.value === 'specific' ? 'block' : 'none';
  });

  document.getElementById('sendNotifyBtn').addEventListener('click', async (e) => {
    const target = targetSelect.value;
    const title = document.getElementById('notifyTitle').value.trim();
    const msg = document.getElementById('notifyMessage').value.trim();
    
    if (!title || !msg) { showToast('Title and Message are required!', 'error'); return; }

    const btn = e.currentTarget;
    btn.disabled = true; btn.textContent = 'Sending...';

    try {
      if (target === 'all') {
        // Send to all users via batch
        const batches = [];
        let batch = writeBatch(db);
        let count = 0;

        cachedData.users.forEach(u => {
          const ref = doc(collection(db, 'notifications'));
          batch.set(ref, {
            userId: u.id,
            type: 'admin',
            title: title,
            message: msg,
            read: false,
            createdAt: serverTimestamp()
          });
          count++;
          if (count === 450) {
            batches.push(batch);
            batch = writeBatch(db);
            count = 0;
          }
        });
        if (count > 0) batches.push(batch);

        for (const b of batches) { await b.commit(); }
        showToast(`✅ Notification sent to ALL (${cachedData.users.length} users)!`, 'success');
      } else {
        // Send to specific user
        const uid = document.getElementById('notifyUserSelect').value;
        if (!uid) { showToast('Select a user!', 'error'); return; }

        await addDoc(collection(db, 'notifications'), {
          userId: uid,
          type: 'admin',
          title: title,
          message: msg,
          read: false,
          createdAt: serverTimestamp()
        });
        showToast('✅ Notification sent successfully!', 'success');
      }
      
      document.getElementById('notifyTitle').value = '';
      document.getElementById('notifyMessage').value = '';

    } catch (err) {
      console.error(err);
      showToast('Failed to send notification.', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Send Notification 🚀';
    }
  });
}

/* ============================================================
   VIDEOS
   ============================================================ */
async function renderVideos() {
  const snap = await getDocs(collection(db, 'posts'));
  const videos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Videos (${videos.length})</div></div>
    <div class="table-wrap">
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead><tr><th>Preview</th><th>User</th><th>Actions</th></tr></thead>
          <tbody id="videosTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = document.getElementById('videosTbody');
  videos.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${v.thumbnail || v.url || ''}" style="width:50px;height:70px;object-fit:cover;border-radius:6px;"></td>
      <td><b>${escapeHtml(v.userName || 'Unknown')}</b><br><span style="font-size:11px;color:#888;">@${escapeHtml(v.userHandle||'')}</span></td>
      <td><button class="btn-sm danger" onclick="window.delVideo('${v.id}')">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

window.delVideo = async (vid) => {
  if (!confirm('Delete this video permanently?')) return;
  try {
    await deleteDoc(doc(db, 'posts', vid));
    showToast('Video Deleted', 'success');
    renderVideos();
  } catch(e) { showToast('Error: '+e.message, 'error'); }
};

/* ============================================================
   PAYMENTS (Basic Placeholder for now)
   ============================================================ */
async function renderPayments() {
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Payments & Plans</div></div>
    <div class="empty-box">Payment Gateway integration coming soon.</div>
  `;
}

/* ============================================================
   WALLET (Withdrawals & Topups)
   ============================================================ */
async function renderWallet() {
  const snap = await getDocs(collection(db, 'wallet_transactions'));
  const txs = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt?.toDate?.()?.getTime()||0) - (a.createdAt?.toDate?.()?.getTime()||0));
  
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Wallet Transactions</div></div>
    <div class="table-wrap">
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>UPI/Proof</th><th>Actions</th></tr></thead>
          <tbody id="walletTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = document.getElementById('walletTbody');
  if(txs.length === 0) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;">No transactions yet</td></tr>`; return; }

  txs.forEach(t => {
    const tr = document.createElement('tr');
    const isCredit = t.type === 'credit';
    const sign = isCredit ? '+' : '-';
    tr.innerHTML = `
      <td><b>${escapeHtml(t.userName || 'Unknown')}</b></td>
      <td>${t.category || 'Other'} <br><span style="font-size:10px;color:${t.status==='pending'?'#ff8a00':(t.status==='completed'?'#4ade80':'#ff4d4d')}">${(t.status||'').toUpperCase()}</span></td>
      <td style="color:${isCredit?'#4ade80':'#ff2e63'}; font-weight:700;">${sign}₹${safeNum(t.amount)}</td>
      <td style="font-size:11px;">${t.upiId || t.screenshotUrl ? `<a href="${t.screenshotUrl||'#'}" target="_blank" style="color:#4ea8ff;">View Proof</a>` : '—'}</td>
      <td>
        ${t.status === 'pending' ? `
          <button class="btn-sm green" onclick="window.approveTx('${t.id}', '${t.userId}', ${t.amount}, '${t.category}')">Approve</button>
          <button class="btn-sm danger" onclick="window.rejectTx('${t.id}')">Reject</button>
        ` : '<span style="color:#555;">Done</span>'}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.approveTx = async (txId, userId, amt, category) => {
  if (!confirm(`Approve ₹${amt} ${category}?`)) return;
  try {
    await updateDoc(doc(db, 'wallet_transactions', txId), { status: 'completed', approvedAt: serverTimestamp() });
    if (category === 'topup') {
      await updateDoc(doc(db, 'users', userId), { walletBalance: increment(amt) });
    }
    showToast('Transaction Approved!', 'success');
    renderWallet();
  } catch(e) { showToast(e.message, 'error'); }
};

window.rejectTx = async (txId) => {
  if (!confirm(`Reject this transaction?`)) return;
  try {
    await updateDoc(doc(db, 'wallet_transactions', txId), { status: 'rejected', rejectedAt: serverTimestamp() });
    showToast('Transaction Rejected', 'info');
    renderWallet();
  } catch(e) { showToast(e.message, 'error'); }
};

console.log("✅ Admin App-Like V5 Loaded");