/* ============================================================
   ReelHub Admin — admin.js (FINAL V10)
   ✅ Fixed: Failed Notification Issue (fromUserId added)
   ✅ Professional English Message on Approve
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

/* ============================================================
   ADMIN EMAILS
   ============================================================ */
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

/* ============================================================
   STATE
   ============================================================ */
let currentAdmin = null;
let currentAdminProfile = null;
let currentPage = 'dashboard';
let isLoggingIn = false;
let cachedData = { users: [], videos: [] };

/* ============================================================
   DOM
   ============================================================ */
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

/* ============================================================
   HELPERS
   ============================================================ */
function safeNum(v) { const n = Number(v); return isNaN(n) || !isFinite(n) ? 0 : n; }
function safeArray(v) { return Array.isArray(v) ? v : []; }
function escapeHtml(str) { if (str === null || str === undefined) return ''; return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function defaultAvatar(name) { const l = (name || '?').trim().charAt(0).toUpperCase() || '?'; return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1e1e28"/><text x="50" y="50" font-size="44" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${l}</text></svg>`); }
function timeAgo(d) { const s = Math.floor((new Date()-d)/1000); if (s<60) return 'now'; const m=Math.floor(s/60); if (m<60) return m+'m'; const h=Math.floor(m/60); if (h<24) return h+'h'; return Math.floor(h/24)+'d'; }

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

function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const colors = { success: '#4ade80', error: '#ff4d4d', info: '#4ea8ff' };
  const toast = document.createElement('div');
  toast.style.cssText = `background:#1e1e28;color:#fff;padding:12px 16px;border-radius:10px;font-size:13px;border-left:3px solid ${colors[type]||colors.info};margin-bottom:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);z-index:99999;`;
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
  adminContent.innerHTML = `<div class="loader-screen" style="min-height:200px; background:transparent;"><div class="spinner"></div></div>`;
  try {
    if (page === 'dashboard') await renderDashboard();
    else if (page === 'users') await renderUsers();
    else if (page === 'videos') await renderVideos();
    else if (page === 'payments') await renderPayments();
    else if (page === 'wallet') await renderWallet();
    else if (page === 'notifications') await renderNotify();
    else if (page === 'reports') await renderReports();
  } catch (err) { adminContent.innerHTML = `<div class="empty-box" style="color:#ff4d4d;">Error: ${escapeHtml(err.message)}</div>`; }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
async function renderDashboard() {
  const [u, v, c, r, w] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'posts')),
    getDocs(collection(db, 'comments')),
    getDocs(collection(db, 'reports')),
    getDocs(collection(db, 'wallet_transactions')).catch(()=>({forEach:()=>{},size:0}))
  ]);
  
  let views = 0, likes = 0;
  v.forEach(d => { const data = d.data(); views += safeNum(data.views); likes += (data.likes||[]).length; });
  
  let pendingWd = 0;
  if(w.forEach) w.forEach(d => { if(d.data().status==='pending' && d.data().category==='withdrawal') pendingWd++; });

  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Dashboard</div><button type="button" class="refresh-btn" onclick="window.renderDashboard()">Refresh</button></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="label">Total Users</div><div class="value" style="color:#4ea8ff">${u.size}</div></div>
      <div class="stat-card"><div class="label">Total Videos</div><div class="value" style="color:#ff2e63">${v.size}</div></div>
      <div class="stat-card"><div class="label">Total Views</div><div class="value" style="color:#ff8a00">${views}</div></div>
      <div class="stat-card"><div class="label">Total Likes</div><div class="value" style="color:#4ade80">${likes}</div></div>
      <div class="stat-card"><div class="label">Comments</div><div class="value">${c.size}</div></div>
      <div class="stat-card"><div class="label">Reports</div><div class="value" style="color:#ff4d4d">${r.size}</div></div>
      <div class="stat-card"><div class="label">Pending Withdrawals</div><div class="value" style="color:#ff8a00">${pendingWd}</div></div>
    </div>
  `;
}
window.renderDashboard = renderDashboard;

/* ============================================================
   USERS
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
    <div class="page-title-admin"><div class="title-text">Users (${cachedData.users.length})</div><button type="button" class="refresh-btn" onclick="window.renderUsers()">Refresh</button></div>
    <div class="table-wrap">
      <div class="table-search"><input type="text" id="userSearch" placeholder="Search by name or username..."></div>
      <div class="table-responsive">
        <table class="admin-table">
          <thead><tr><th>User Info</th><th>Videos</th><th>Wallet</th><th>Actions</th></tr></thead>
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
              <b style="display:flex;align-items:center;gap:5px;">${escapeHtml(u.name || 'Unknown')} 
                ${u.verified ? '<span class="badge-pill verified">✓</span>' : ''} 
                ${u.banned ? '<span class="badge-pill banned">SUSPENDED</span>' : ''}
              </b>
              <span style="font-size:11px;color:#888;">@${escapeHtml(u.user || '')}</span>
            </div>
          </div>
        </td>
        <td style="font-weight:bold;">${safeNum(u._realVids)}</td>
        <td style="font-weight:bold;color:#ff8a00;">₹${safeNum(u.walletBalance)}</td>
        <td>
          <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;">
            <div style="display:flex; gap:2px; background:#0a0a12; padding:2px; border-radius:6px; border:1px solid #333;">
              <select id="tick-${u.id}" style="background:transparent; color:#fff; border:none; padding:4px; font-size:11px; outline:none;">
                <option value="none" ${!u.verified ? 'selected' : ''}>Remove</option>
                <option value="1">1 Day</option>
                <option value="30">30 Days</option>
                <option value="365">1 Year</option>
              </select>
              <button type="button" class="btn-sm primary" onclick="window.applyTick('${u.id}')">Apply</button>
            </div>
            <button type="button" class="btn-sm primary" onclick="window.toggleVerify('${u.id}', ${u.verified||false})">${u.verified ? 'Unverify' : 'Verify'}</button>
            <button type="button" class="btn-sm warn" onclick="window.toggleSuspend('${u.id}', ${u.banned||false})">${u.banned ? 'Unsuspend' : 'Suspend'}</button>
            <button type="button" class="btn-sm dark" onclick="window.msgUser('${u.id}', '${escapeHtml(u.name)}')">Msg</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  paint();
  document.getElementById('userSearch')?.addEventListener('input', paint);
}
window.renderUsers = renderUsers;

window.applyTick = async (uid) => {
  const val = document.getElementById('tick-' + uid).value;
  try {
    let isVerified = false, verifiedUntil = null;
    if(val !== 'none') {
      isVerified = true;
      const d = new Date(); d.setDate(d.getDate() + parseInt(val));
      verifiedUntil = Timestamp.fromDate(d);
    }
    await updateDoc(doc(db, 'users', uid), { verified: isVerified, verifiedUntil });
    showToast('Blue Tick Updated!');
    renderUsers();
  } catch(e) { showToast(e.message, 'error'); }
};

window.toggleVerify = async (uid, current) => {
  try {
    await updateDoc(doc(db, 'users', uid), { verified: !current, verifiedUntil: null });
    showToast(!current ? 'User Verified!' : 'Verification Removed');
    renderUsers();
  } catch(e) { showToast('Error: '+e.message, 'error'); }
};

window.toggleSuspend = async (uid, current) => {
  if (!confirm(`Are you sure you want to ${current?'unsuspend':'suspend'} this user?`)) return;
  try {
    await updateDoc(doc(db, 'users', uid), { banned: !current });
    showToast(!current ? 'User Suspended' : 'User Unsuspended');
    renderUsers();
  } catch(e) { showToast('Error: '+e.message, 'error'); }
};

window.msgUser = (uid, name) => {
  openModal(`Message to ${name}`, `
    <div class="input-group">
      <label>Notification Message</label>
      <textarea id="directMsgText" rows="3" placeholder="Type message to send..."></textarea>
    </div>
    <button type="button" class="btn-primary" onclick="window.sendDirectMsg('${uid}')">Send Message</button>
  `);
};

window.sendDirectMsg = async (uid) => {
  const msg = document.getElementById('directMsgText').value.trim();
  if(!msg) return showToast('Enter message', 'error');
  try {
    // ✅ FIXED: fromUserId added
    await addDoc(collection(db, 'notifications'), {
      userId: uid, 
      type: 'admin', 
      title: 'New Message from Admin', 
      message: msg, 
      fromUserId: currentAdmin.uid, 
      read: false, 
      createdAt: serverTimestamp()
    });
    showToast('Message Sent!');
    closeModal();
  } catch(e) { showToast(e.message, 'error'); }
};

/* ============================================================
   NOTIFY (Single / All) — ✅ FIXED
   ============================================================ */
async function renderNotify() {
  if (cachedData.users.length === 0) {
    const snap = await getDocs(collection(db, 'users'));
    cachedData.users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  const userOptions = cachedData.users.map(u => `<option value="${u.id}">${escapeHtml(u.name)} (@${escapeHtml(u.user)})</option>`).join('');

  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Send Notification</div></div>
    <div class="card-box">
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

      <div class="input-group"><label>Notification Title</label><input type="text" id="notifyTitle" placeholder="e.g. 🎉 New Update!"></div>
      <div class="input-group"><label>Message Body</label><textarea id="notifyMessage" rows="4" placeholder="Write your message here..."></textarea></div>
      <button type="button" class="btn-primary" id="sendNotifyBtn">Send Notification 🚀</button>
    </div>
  `;

  document.getElementById('notifyTarget').addEventListener('change', (e) => {
    document.getElementById('userSelectGroup').style.display = e.target.value === 'specific' ? 'block' : 'none';
  });

  document.getElementById('sendNotifyBtn').addEventListener('click', async (e) => {
    const target = document.getElementById('notifyTarget').value;
    const title = document.getElementById('notifyTitle').value.trim();
    const msg = document.getElementById('notifyMessage').value.trim();
    
    if (!title || !msg) { showToast('Title and Message required!', 'error'); return; }

    e.target.disabled = true; e.target.textContent = 'Sending...';

    try {
      if (target === 'all') {
        let batch = writeBatch(db); let count = 0;
        for(const u of cachedData.users) {
          const ref = doc(collection(db, 'notifications'));
          batch.set(ref, { 
            userId: u.id, 
            type: 'admin', 
            title, 
            message: msg, 
            fromUserId: currentAdmin.uid, // ✅ FIXED
            read: false, 
            createdAt: serverTimestamp() 
          });
          count++;
          if(count === 400) { await batch.commit(); batch = writeBatch(db); count = 0; }
        }
        if(count > 0) await batch.commit();
        showToast(`✅ Sent to ALL (${cachedData.users.length} users)!`);
      } else {
        const uid = document.getElementById('notifyUserSelect').value;
        await addDoc(collection(db, 'notifications'), { 
          userId: uid, 
          type: 'admin', 
          title, 
          message: msg, 
          fromUserId: currentAdmin.uid, // ✅ FIXED
          read: false, 
          createdAt: serverTimestamp() 
        });
        showToast('✅ Sent successfully!');
      }
      document.getElementById('notifyTitle').value = ''; document.getElementById('notifyMessage').value = '';
    } catch (err) { 
      console.error(err); 
      showToast('Failed: ' + err.message, 'error'); 
    } finally { 
      e.target.disabled = false; 
      e.target.textContent = 'Send Notification 🚀'; 
    }
  });
}

/* ============================================================
   PAYMENTS (UPI, Plans, Approvals) — ✅ FIXED
   ============================================================ */
async function renderPayments() {
  const [configSnap, plansSnap, reqSnap] = await Promise.all([
    getDoc(doc(db, 'admin_config', 'payment')).catch(()=>null),
    getDocs(collection(db, 'payment_plans')).catch(()=>({docs:[]})),
    getDocs(collection(db, 'payment_requests')).catch(()=>({docs:[]}))
  ]);

  let upi = configSnap && configSnap.exists() ? configSnap.data().upiId : 'Not Set';
  let qr = configSnap && configSnap.exists() ? configSnap.data().qrUrl : '';
  const plans = plansSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const requests = reqSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  adminContent.innerHTML = `
    <div class="page-title-admin">
      <div class="title-text">Payments & Plans</div>
      <div style="display:flex;gap:10px;">
        <button type="button" class="btn-sm primary" onclick="document.getElementById('paymentSettingsModal').style.display='flex'">⚙️ UPI</button>
        <button type="button" class="btn-sm green" onclick="document.getElementById('addPlanModal').style.display='flex'">➕ Plan</button>
      </div>
    </div>

    <div class="card-box" style="margin-bottom:20px;">
      <h3>Active Plans</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
        ${plans.length===0 ? 'No plans.' : plans.map(p => `<div style="background:#1a1a24;padding:10px;border-radius:8px;text-align:center;"><b style="color:#ff2e63;font-size:18px;">₹${p.amount}</b><br>${p.days} Days <button type="button" class="btn-sm danger" onclick="window.delPlan('${p.id}')">X</button></div>`).join('')}
      </div>
    </div>

    <div class="table-wrap">
      <div style="padding:15px; border-bottom:1px solid #222;"><h3>Blue Tick Requests</h3></div>
      <div class="table-responsive">
        <table class="admin-table">
          <thead><tr><th>User</th><th>Amount</th><th>Proof</th><th>Actions</th></tr></thead>
          <tbody>
            ${requests.length===0 ? '<tr><td colspan="4" style="text-align:center;padding:20px;">No requests</td></tr>' : requests.map(r => `
              <tr>
                <td><b>${r.userName}</b></td>
                <td>₹${r.amount} (${r.days}d)</td>
                <td>${r.screenshotUrl ? `<a href="${r.screenshotUrl}" target="_blank" style="color:#4ea8ff;">View</a>` : '—'}</td>
                <td>
                  ${r.status === 'pending' ? `
                    <button type="button" class="btn-sm green" onclick="window.approvePayment('${r.id}', '${r.userId}', ${r.days})">Approve</button>
                    <button type="button" class="btn-sm danger" onclick="window.rejectPayment('${r.id}')">Reject</button>
                  ` : r.status}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.delPlan = async (id) => { if(confirm('Delete plan?')) { await deleteDoc(doc(db,'payment_plans',id)); renderPayments(); } };

window.approvePayment = async (reqId, uid, days) => {
  if(!confirm('Approve payment and give tick?')) return;
  try {
    const now = new Date(); now.setDate(now.getDate() + days);
    await updateDoc(doc(db, 'users', uid), { verified: true, verifiedUntil: Timestamp.fromDate(now) });
    await updateDoc(doc(db, 'payment_requests', reqId), { status: 'approved' });
    
    // ✅ FIXED: fromUserId added
    await addDoc(collection(db, 'notifications'), { 
      userId: uid, 
      type: 'admin', 
      title: '✅ Payment Approved!', 
      message: `Your Blue Tick is now active for ${days} days.`, 
      fromUserId: currentAdmin.uid, 
      read: false, 
      createdAt: serverTimestamp() 
    });
    showToast('Approved!'); renderPayments();
  } catch(e) { showToast(e.message, 'error'); }
};

window.rejectPayment = async (reqId) => {
  if(!confirm('Reject?')) return;
  await updateDoc(doc(db, 'payment_requests', reqId), { status: 'rejected' });
  renderPayments();
};

document.getElementById('savePaymentSettingsBtn')?.addEventListener('click', async (e) => {
  const upi = document.getElementById('adminUpiId').value;
  const qr = document.getElementById('adminQrUrl').value;
  await setDoc(doc(db, 'admin_config', 'payment'), { upiId: upi, qrUrl: qr });
  showToast('Settings saved!'); document.getElementById('paymentSettingsModal').style.display = 'none';
});

document.getElementById('savePlanBtn')?.addEventListener('click', async () => {
  const amount = parseInt(document.getElementById('planAmount').value);
  const days = parseInt(document.getElementById('planDays').value);
  if(!amount || !days) return showToast('Invalid inputs', 'error');
  await addDoc(collection(db, 'payment_plans'), { amount, days, createdAt: serverTimestamp() });
  showToast('Plan added!'); document.getElementById('addPlanModal').style.display = 'none'; renderPayments();
});

/* ============================================================
   WALLET — ✅ FIXED + PROFESSIONAL MESSAGE
   ============================================================ */
async function renderWallet() {
  const snap = await getDocs(collection(db, 'wallet_transactions'));
  const txs = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (b.createdAt?.toDate?.()?.getTime()||0) - (a.createdAt?.toDate?.()?.getTime()||0));
  
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Wallet Requests</div><button type="button" class="refresh-btn" onclick="window.renderWallet()">Refresh</button></div>
    <div class="table-wrap">
      <div class="table-responsive">
        <table class="admin-table">
          <thead><tr><th>User</th><th>Type/Status</th><th>Amount</th><th>UPI</th><th>Actions</th></tr></thead>
          <tbody>
            ${txs.length===0 ? '<tr><td colspan="5" style="text-align:center;padding:20px;">No transactions</td></tr>' : txs.map(t => `
              <tr>
                <td><b>${t.userName || 'Unknown'}</b></td>
                <td>${t.category}<br><span style="font-size:10px;color:${t.status==='pending'?'#ff8a00':(t.status==='completed'?'#4ade80':'#ff4d4d')}">${t.status.toUpperCase()}</span></td>
                <td style="color:${t.type==='credit'?'#4ade80':'#ff2e63'}; font-weight:bold;">${t.type==='credit'?'+':'-'}₹${t.amount}</td>
                <td>${t.upiId || '—'}</td>
                <td>
                  ${t.status === 'pending' ? `
                    <button type="button" class="btn-sm green" onclick="window.approveTx('${t.id}', '${t.userId}', ${t.amount}, '${t.category}', '${t.upiId||''}', '${t.userName}')">Approve</button>
                    <button type="button" class="btn-sm danger" onclick="window.rejectTx('${t.id}', '${t.userId}', ${t.amount}, '${t.category}')">Reject</button>
                  ` : 'Done'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
window.renderWallet = renderWallet;

window.approveTx = async (txId, uid, amt, cat, upiId, userName) => {
  const msg = cat === 'withdrawal' 
    ? `Approve ₹${amt} WITHDRAWAL?\n\n⚠️ Confirm you SENT ₹${amt} to UPI: ${upiId}`
    : `Approve ₹${amt} TOP-UP?\n\n⚠️ Confirm you RECEIVED ₹${amt} in your UPI.`;

  if(!confirm(msg)) return;
  
  try {
    await updateDoc(doc(db, 'wallet_transactions', txId), { 
      status: 'completed',
      approvedAt: serverTimestamp(),
      approvedBy: currentAdmin?.email || 'admin'
    });
    
    if(cat === 'topup') {
      await updateDoc(doc(db, 'users', uid), { walletBalance: increment(amt) });
    }

    // ✅ PROFESSIONAL MESSAGE & FIXED fromUserId
    let notifTitle, notifMessage;
    if (cat === 'withdrawal') {
      notifTitle = '💸 Payment Sent Successfully';
      notifMessage = `Dear ${userName || 'User'},\n\nYour money has been successfully sent to your UPI ID: ${upiId}.\n\nAmount: ₹${amt}\n\nPlease check your UPI app or bank account. Thank you for using ReelHub!`;
    } else if (cat === 'topup') {
      notifTitle = '✅ Wallet Top-up Approved';
      notifMessage = `Dear ${userName || 'User'},\n\nAn amount of ₹${amt} has been successfully added to your wallet.`;
    } else {
      notifTitle = '✅ Transaction Approved';
      notifMessage = `Your ₹${amt} transaction has been completed successfully.`;
    }

    await addDoc(collection(db, 'notifications'), {
      userId: uid,
      type: 'wallet',
      title: notifTitle,
      message: notifMessage,
      fromUserId: currentAdmin.uid, // ✅ FIXED
      read: false,
      createdAt: serverTimestamp()
    });

    showToast('✅ Approved & user notified!', 'success');
    renderWallet();
  } catch(e) { 
    console.error(e);
    showToast(e.message, 'error'); 
  }
};

window.rejectTx = async (txId, uid, amt, cat) => {
  const refundMsg = cat === 'withdrawal' ? `\n\n₹${amt} will be REFUNDED to user's wallet.` : '\n\nNo balance change.';
  if(!confirm(`Reject ₹${amt} ${cat}?${refundMsg}`)) return;
  
  try {
    await updateDoc(doc(db, 'wallet_transactions', txId), { 
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectedBy: currentAdmin?.email || 'admin'
    });

    if (cat === 'withdrawal') {
      await updateDoc(doc(db, 'users', uid), { walletBalance: increment(amt) });
    }

    // ✅ FIXED fromUserId
    await addDoc(collection(db, 'notifications'), {
      userId: uid,
      type: 'wallet',
      title: '❌ Transaction Rejected',
      message: cat === 'withdrawal'
        ? `Your ₹${amt} withdrawal was rejected. ₹${amt} has been refunded to your wallet.`
        : `Your ₹${amt} top-up request was rejected. Please upload a valid screenshot.`,
      fromUserId: currentAdmin.uid, 
      read: false,
      createdAt: serverTimestamp()
    });

    showToast('Rejected & user notified', 'info');
    renderWallet();
  } catch(e) { 
    console.error(e);
    showToast(e.message, 'error'); 
  }
};

/* ============================================================
   VIDEOS & REPORTS
   ============================================================ */
async function renderVideos() {
  const snap = await getDocs(collection(db, 'posts'));
  const vids = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Videos</div></div>
    <div class="table-wrap"><div class="table-responsive">
      <table class="admin-table">
        <thead><tr><th>Preview</th><th>User</th><th>Actions</th></tr></thead>
        <tbody>
          ${vids.length===0 ? '<tr><td colspan="3" style="text-align:center;padding:20px;">No videos</td></tr>' : vids.map(v => `<tr>
            <td><img src="${v.thumbnail||v.url}" style="width:40px;height:60px;border-radius:4px;object-fit:cover;"></td>
            <td><b>${escapeHtml(v.userName||'')}</b></td>
            <td><button type="button" class="btn-sm danger" onclick="window.delVid('${v.id}')">Delete</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div></div>
  `;
}
window.delVid = async (id) => { if(confirm('Delete video?')) { await deleteDoc(doc(db,'posts',id)); renderVideos(); } };

async function renderReports() {
  const snap = await getDocs(collection(db, 'reports'));
  const rpts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  adminContent.innerHTML = `
    <div class="page-title-admin"><div class="title-text">Reports</div></div>
    <div class="table-wrap"><div class="table-responsive">
      <table class="admin-table">
        <thead><tr><th>Reported By</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          ${rpts.length===0 ? '<tr><td colspan="4" style="text-align:center;">No reports</td></tr>' : rpts.map(r => `<tr>
            <td>${escapeHtml(r.reportedBy||'')}</td>
            <td>${escapeHtml(r.reason||'')}</td>
            <td>${r.status||'pending'}</td>
            <td><button type="button" class="btn-sm green" onclick="window.resolveReport('${r.id}')">Resolve</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div></div>
  `;
}
window.resolveReport = async (id) => { await updateDoc(doc(db,'reports',id), {status:'resolved'}); renderReports(); };

/* ============================================================
   MODAL HELPERS
   ============================================================ */
function openModal(title, html) {
  modalTitle.textContent = title; modalBody.innerHTML = html; modalOverlay.style.display = 'flex';
}
function closeModal() { modalOverlay.style.display = 'none'; modalBody.innerHTML = ''; }
document.getElementById('modalClose')?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (e) => { if(e.target === modalOverlay) closeModal(); });

console.log("✅ Admin V10 Loaded — Failed Notification Issue Fixed & Professional Message Enabled");