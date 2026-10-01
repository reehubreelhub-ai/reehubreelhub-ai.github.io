/* ============================================================
   ReelHub Admin — admin.js
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
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* ============================================================
   FIREBASE CONFIG
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyC6421R1kr0jYwUJFbjB2YzIerlJw_cdLc",
  authDomain: "reelhub-24616.firebaseapp.com",
  projectId: "reelhub-24616",
  storageBucket: "reelhub-24616.firebasestorage.app",
  messagingSenderId: "397521504045",
  appId: "1:397521504045:web:bf6d3652a7375fd632b5a4",
  measurementId: "G-81RN37XN6H"
};

/* ============================================================
   🔐 ADMIN EMAILS — यहाँ अपने emails डालो
   ============================================================ */
const ADMIN_EMAILS = [
  "reehubreelhub@gmail.com"
  // जितने चाहो उतने emails add करो
  // "friend@gmail.com",
];

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db   = getFirestore(firebaseApp);

/* ============================================================
   STATE
   ============================================================ */
let currentAdmin = null;
let currentAdminProfile = null;
let currentPage = 'dashboard';
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
   HELPER — Email check
   ============================================================ */
function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS
    .map(e => e.toLowerCase().trim())
    .includes(email.toLowerCase().trim());
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

  // ---- Email check FIRST ----
  if (!isAdminEmail(email)) {
    loginMsg.textContent = 'Access denied. This email is not an admin.';
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Checking...';

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged will handle the rest
  } catch (err) {
    console.error(err);
    loginMsg.className = 'error-msg';
    if (
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/user-not-found'
    ) {
      loginMsg.textContent = 'Invalid email or password.';
    } else {
      loginMsg.textContent = err.message || 'Login failed.';
    }
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
  }
});

/* ============================================================
   LOGOUT
   ============================================================ */
document.getElementById('adminLogout').addEventListener('click', async () => {
  if (confirm('Logout from admin panel?')) {
    await signOut(auth);
  }
});

/* ============================================================
   AUTH STATE LISTENER
   ============================================================ */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // ---- Email check ----
    if (!isAdminEmail(user.email)) {
      // Not an admin — auto logout
      await signOut(auth);
      currentAdmin = null;
      currentAdminProfile = null;
      showLogin();
      return;
    }

    // ---- Load profile ----
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      currentAdminProfile = snap.exists()
        ? snap.data()
        : { name: user.email.split('@')[0] };
    } catch (e) {
      currentAdminProfile = { name: user.email.split('@')[0] };
    }

    currentAdmin = user;
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
  // clear password input
  const passEl = document.getElementById('adminPass');
  if (passEl) passEl.value = '';
}

function showApp() {
  loader.style.display = 'none';
  loginScreen.style.display = 'none';
  appScreen.classList.add('show');
  renderPage('dashboard');
}

/* ============================================================
   SIDEBAR NAV
   ============================================================ */
document.querySelectorAll('.side-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.side-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    renderPage(item.dataset.page);
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
    adminContent.innerHTML = `<div class="empty-box">Error: ${err.message}</div>`;
  }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
async function renderDashboard() {
  const [usersSnap, videosSnap, commentsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'posts')),
    getDocs(collection(db, 'comments'))
  ]);

  const totalUsers = usersSnap.size;
  const totalVideos = videosSnap.size;
  const totalComments = commentsSnap.size;

  let totalLikes = 0;
  videosSnap.forEach(d => {
    const likes = d.data().likes || [];
    totalLikes += likes.length;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let todaySignups = 0;
  usersSnap.forEach(d => {
    const created = d.data().createdAt?.toDate?.();
    if (created && created >= today) todaySignups++;
  });

  adminContent.innerHTML = `
    <div class="page-title-admin">Dashboard</div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">Total Users</div>
        <div class="value pink">${totalUsers}</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Videos</div>
        <div class="value blue">${totalVideos}</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Likes</div>
        <div class="value orange">${totalLikes}</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Comments</div>
        <div class="value green">${totalComments}</div>
      </div>
      <div class="stat-card">
        <div class="label">Today's Signups</div>
        <div class="value">${todaySignups}</div>
      </div>
    </div>
  `;
}

/* ============================================================
   USERS
   ============================================================ */
async function renderUsers() {
  const snap = await getDocs(collection(db, 'users'));
  cachedData.users = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  adminContent.innerHTML = `
    <div class="page-title-admin">Users (${cachedData.users.length})</div>

    <div class="table-wrap">
      <div class="table-search">
        <input type="text" id="userSearch" placeholder="Search by name, username or email...">
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

  function paint(filter = '') {
    const q = filter.toLowerCase().trim();
    const list = cachedData.users.filter(u => {
      if (!q) return true;
      return (u.name || '').toLowerCase().includes(q)
          || (u.user || '').toLowerCase().includes(q)
          || (u.email || '').toLowerCase().includes(q);
    });

    const tbody = document.getElementById('usersTbody');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-box">No users found.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    list.forEach(u => {
      const tr = document.createElement('tr');
      const avatar = u.photo || defaultAvatar(u.name);
      const roleBadge = isAdminEmail(u.email)
        ? `<span class="badge-pill admin">ADMIN</span>`
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
        <td>${escapeHtml(u.email || '')}</td>
        <td>${roleBadge}</td>
        <td>${u.videoCount || 0}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-sm primary" data-action="msg" data-uid="${u.id}">Msg</button>
            <button class="btn-sm gray" data-action="verify" data-uid="${u.id}">${u.verified ? 'Unverify' : 'Verify'}</button>
            <button class="btn-sm danger" data-action="ban" data-uid="${u.id}">${u.banned ? 'Unban' : 'Ban'}</button>
            <button class="btn-sm danger" data-action="delete" data-uid="${u.id}">Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => handleUserAction(btn.dataset.action, btn.dataset.uid));
    });
  }

  paint();
  document.getElementById('userSearch').addEventListener('input', (e) => paint(e.target.value));
}

async function handleUserAction(action, uid) {
  const user = cachedData.users.find(u => u.id === uid);
  if (!user) return;

  if (action === 'msg') {
    openMessageModal(user);
  }
  else if (action === 'verify') {
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
    await renderUsers();
  }
  else if (action === 'ban') {
    const newVal = !user.banned;
    if (newVal && !confirm(`Ban ${user.name}?`)) return;
    await updateDoc(doc(db, 'users', uid), { banned: newVal });
    user.banned = newVal;
    if (newVal) {
      await pushNotification(uid, {
        type: 'banned',
        title: '🚫 Account banned',
        message: 'Your account has been banned by admin.'
      });
    }
    await renderUsers();
  }
  else if (action === 'delete') {
    if (!confirm(`DELETE ${user.name}? This cannot be undone.`)) return;
    if (!confirm(`Really delete? All data will be lost.`)) return;
    await deleteDoc(doc(db, 'users', uid));
    await renderUsers();
  }
}

/* ============================================================
   VIDEOS
   ============================================================ */
async function renderVideos() {
  const snap = await getDocs(collection(db, 'posts'));
  cachedData.videos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  adminContent.innerHTML = `
    <div class="page-title-admin">Videos (${cachedData.videos.length})</div>

    <div class="table-wrap">
      <div class="table-search">
        <input type="text" id="videoSearch" placeholder="Search by caption or user...">
      </div>
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>User</th>
              <th>Caption</th>
              <th>Likes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="videosTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  function paint(filter = '') {
    const q = filter.toLowerCase().trim();
    const list = cachedData.videos.filter(v => {
      if (!q) return true;
      return (v.caption || '').toLowerCase().includes(q)
          || (v.userHandle || '').toLowerCase().includes(q)
          || (v.userName || '').toLowerCase().includes(q);
    });

    const tbody = document.getElementById('videosTbody');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-box">No videos found.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    list.forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <video src="${v.videoUrl}" style="width:60px;height:80px;object-fit:cover;border-radius:6px;background:#000;" muted></video>
        </td>
        <td>
          <div style="font-size:12px;">
            <b>${escapeHtml(v.userName || '')}</b><br>
            <span style="color:#666">@${escapeHtml(v.userHandle || '')}</span>
          </div>
        </td>
        <td style="max-width:200px;">
          <div style="font-size:12px;color:#aaa;">${escapeHtml(v.caption || '—')}</div>
        </td>
        <td>${(v.likes || []).length}</td>
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
      btn.addEventListener('click', () => handleVideoAction(btn.dataset.action, btn.dataset.id));
    });
  }

  paint();
  document.getElementById('videoSearch').addEventListener('input', (e) => paint(e.target.value));
}

async function handleVideoAction(action, id) {
  const video = cachedData.videos.find(v => v.id === id);
  if (!video) return;

  if (action === 'preview') {
    openModal('Video Preview', `
      <video src="${video.videoUrl}" controls playsinline style="width:100%;border-radius:10px;background:#000;max-height:60vh;"></video>
      <div style="margin-top:12px;font-size:13px;color:#888;">
        <div><b style="color:#fff;">${escapeHtml(video.userName)}</b> @${escapeHtml(video.userHandle)}</div>
        <div style="margin-top:6px;">${escapeHtml(video.caption || '')}</div>
      </div>
    `);
  }
  else if (action === 'feature') {
    const newVal = !video.featured;
    await updateDoc(doc(db, 'posts', id), { featured: newVal });
    video.featured = newVal;
    await renderVideos();
  }
  else if (action === 'delete') {
    if (!confirm('Delete this video?')) return;
    await deleteDoc(doc(db, 'posts', id));
    await renderVideos();
  }
}

/* ============================================================
   COMMENTS
   ============================================================ */
async function renderComments() {
  const snap = await getDocs(collection(db, 'comments'));
  cachedData.comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  adminContent.innerHTML = `
    <div class="page-title-admin">Comments (${cachedData.comments.length})</div>

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
              <th>Post</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="commentsTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  function paint(filter = '') {
    const q = filter.toLowerCase().trim();
    const list = cachedData.comments.filter(c => {
      if (!q) return true;
      return (c.text || '').toLowerCase().includes(q)
          || (c.userName || '').toLowerCase().includes(q);
    });

    const tbody = document.getElementById('commentsTbody');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-box">No comments.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    list.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-size:12px;">
            <b>${escapeHtml(c.userName || '')}</b><br>
            <span style="color:#666">@${escapeHtml(c.userHandle || '')}</span>
          </div>
        </td>
        <td style="max-width:280px;font-size:12px;color:#ccc;">${escapeHtml(c.text || '')}</td>
        <td style="font-size:11px;color:#666;">${escapeHtml((c.postId || '').slice(0, 8))}...</td>
        <td>
          <button class="btn-sm danger" data-id="${c.id}">Delete</button>
        </td>
      `;
      tr.querySelector('button').addEventListener('click', async () => {
        if (!confirm('Delete comment?')) return;
        await deleteDoc(doc(db, 'comments', c.id));
        await renderComments();
      });
      tbody.appendChild(tr);
    });
  }

  paint();
  document.getElementById('commentSearch').addEventListener('input', (e) => paint(e.target.value));
}

/* ============================================================
   ADMINS
   ============================================================ */
async function renderAdmins() {
  adminContent.innerHTML = `
    <div class="page-title-admin">Admin Management</div>

    <div class="section-head">
      <h3>Current Admins (${ADMIN_EMAILS.length})</h3>
    </div>

    <div id="adminsList"></div>

    <div class="section-head" style="margin-top:32px;">
      <h3>Admin Invitations</h3>
      <button class="btn-outline" id="inviteNewBtn">+ Invite by Email</button>
    </div>

    <div id="invitesList"></div>
  `;

  // Current admins (from code)
  const adminsList = document.getElementById('adminsList');
  adminsList.innerHTML = '';
  ADMIN_EMAILS.forEach(email => {
    const card = document.createElement('div');
    card.className = 'invite-card';
    const isMe = email.toLowerCase() === (currentAdmin?.email || '').toLowerCase();
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;flex:1;">
        <img src="${defaultAvatar(email)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
        <div class="info">
          <b>${escapeHtml(email)} ${isMe ? '(You)' : ''}</b>
          <span>Admin</span>
        </div>
      </div>
    `;
    adminsList.appendChild(card);
  });

  // Pending invites
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
          ${inv.status === 'pending'
            ? `<button class="btn-sm danger" data-inv="${inv.id}">Cancel</button>`
            : ''}
        `;
        const btn = card.querySelector('button');
        if (btn) {
          btn.addEventListener('click', async () => {
            if (!confirm('Cancel this invitation?')) return;
            await updateDoc(doc(db, 'admin_invites', inv.id), {
              status: 'rejected',
              respondedAt: serverTimestamp()
            });
            await renderAdmins();
          });
        }
        invitesList.appendChild(card);
      });
    }
  } catch (e) {
    console.warn(e);
    document.getElementById('invitesList').innerHTML = `<div class="empty-box">Could not load invites.</div>`;
  }

  // invite new
  document.getElementById('inviteNewBtn').addEventListener('click', openInviteModal);
}

function openInviteModal() {
  openModal('Invite New Admin', `
    <div class="input-group">
      <label>Email address</label>
      <input type="email" id="inviteEmailInput" placeholder="user@email.com">
    </div>
    <p style="font-size:12px;color:#888;margin-bottom:12px;">
      Aap is email ko ADMIN_EMAILS list me manually add kar sakte ho. Notification bhi bhej sakte ho.
    </p>
    <button class="btn-primary" id="sendInviteBtn">Send Notification</button>
    <div class="error-msg" id="inviteModalMsg"></div>
  `);

  document.getElementById('sendInviteBtn').addEventListener('click', async () => {
    const email = document.getElementById('inviteEmailInput').value.trim().toLowerCase();
    const msg = document.getElementById('inviteModalMsg');
    msg.textContent = '';
    msg.className = 'error-msg';

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      msg.textContent = 'Please enter a valid email.';
      return;
    }

    // find user
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) {
      msg.textContent = 'No ReelHub user found with this email.';
      return;
    }

    const userData = { id: snap.docs[0].id, ...snap.docs[0].data() };

    try {
      // Create invite document
      await addDoc(collection(db, 'admin_invites'), {
        email: email,
        userId: userData.id,
        invitedBy: currentAdmin.uid,
        invitedByName: currentAdminProfile?.name || 'Admin',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Send notification
      await pushNotification(userData.id, {
        type: 'admin_invite',
        title: '🎉 Admin Invitation',
        message: `You have been invited to become a ReelHub admin by ${currentAdminProfile?.name || 'Admin'}.`,
        actions: ['accept', 'reject']
      });

      msg.className = 'success-msg';
      msg.textContent = 'Invitation sent! Notification bhi bheji gayi.';
      setTimeout(() => { closeModal(); renderAdmins(); }, 1000);
    } catch (err) {
      console.error(err);
      msg.textContent = err.message || 'Failed.';
    }
  });
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
async function renderNotify() {
  adminContent.innerHTML = `
    <div class="page-title-admin">Send Notification</div>

    <div class="section-head"><h3>To specific user</h3></div>

    <div class="table-wrap" style="padding:16px;">
      <div class="input-group">
        <label>User email</label>
        <input type="email" id="notifyEmail" placeholder="user@email.com">
      </div>
      <div class="input-group">
        <label>Title</label>
        <input type="text" id="notifyTitle" placeholder="Notification title" maxlength="60">
      </div>
      <div class="input-group">
        <label>Message</label>
        <textarea id="notifyMessage" placeholder="Type message..." maxlength="300"></textarea>
      </div>
      <button class="btn-primary" id="sendToUserBtn">Send to User</button>
      <div class="error-msg" id="notifyMsg"></div>
    </div>

    <div class="section-head" style="margin-top:32px;"><h3>Broadcast to all users</h3></div>

    <div class="table-wrap" style="padding:16px;">
      <div class="input-group">
        <label>Title</label>
        <input type="text" id="broadcastTitle" placeholder="Announcement title" maxlength="60">
      </div>
      <div class="input-group">
        <label>Message</label>
        <textarea id="broadcastMessage" placeholder="Type message..." maxlength="300"></textarea>
      </div>
      <button class="btn-primary" id="broadcastBtn">Send to All Users</button>
      <div class="error-msg" id="broadcastMsg"></div>
    </div>
  `;

  document.getElementById('sendToUserBtn').addEventListener('click', async () => {
    const email = document.getElementById('notifyEmail').value.trim().toLowerCase();
    const title = document.getElementById('notifyTitle').value.trim();
    const message = document.getElementById('notifyMessage').value.trim();
    const msg = document.getElementById('notifyMsg');
    msg.textContent = '';
    msg.className = 'error-msg';

    if (!email || !title || !message) {
      msg.textContent = 'Please fill all fields.';
      return;
    }

    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) {
      msg.textContent = 'No user found with this email.';
      return;
    }

    await pushNotification(snap.docs[0].id, {
      type: 'admin_message',
      title: title,
      message: message
    });

    msg.className = 'success-msg';
    msg.textContent = 'Notification sent!';
    document.getElementById('notifyTitle').value = '';
    document.getElementById('notifyMessage').value = '';
  });

  document.getElementById('broadcastBtn').addEventListener('click', async () => {
    const title = document.getElementById('broadcastTitle').value.trim();
    const message = document.getElementById('broadcastMessage').value.trim();
    const msg = document.getElementById('broadcastMsg');
    msg.textContent = '';
    msg.className = 'error-msg';

    if (!title || !message) {
      msg.textContent = 'Please fill all fields.';
      return;
    }

    if (!confirm('Send this notification to ALL users?')) return;

    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);

      usersSnap.forEach(u => {
        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
          userId: u.id,
          type: 'admin_broadcast',
          title: title,
          message: message,
          read: false,
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
      msg.className = 'success-msg';
      msg.textContent = `Sent to ${usersSnap.size} users!`;
      document.getElementById('broadcastTitle').value = '';
      document.getElementById('broadcastMessage').value = '';
    } catch (err) {
      console.error(err);
      msg.textContent = err.message || 'Failed.';
    }
  });
}

/* ============================================================
   REPORTS
   ============================================================ */
async function renderReports() {
  const snap = await getDocs(collection(db, 'reports'));
  cachedData.reports = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  adminContent.innerHTML = `
    <div class="page-title-admin">Reports (${cachedData.reports.length})</div>

    <div class="table-wrap">
      <div style="overflow-x:auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Reported</th>
              <th>Reason</th>
              <th>Reported by</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="reportsTbody"></tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = document.getElementById('reportsTbody');
  if (cachedData.reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-box">No reports yet.</td></tr>`;
    return;
  }

  cachedData.reports.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="badge-pill pending">${escapeHtml(r.type || 'report')}</span></td>
      <td>${escapeHtml(r.targetName || r.targetId || '')}</td>
      <td style="max-width:220px;font-size:12px;color:#ccc;">${escapeHtml(r.reason || '')}</td>
      <td style="font-size:12px;color:#888;">${escapeHtml(r.reportedByName || '')}</td>
      <td>
        <button class="btn-sm gray" data-action="ignore" data-id="${r.id}">Ignore</button>
      </td>
    `;
    tr.querySelector('[data-action]').addEventListener('click', async () => {
      await deleteDoc(doc(db, 'reports', r.id));
      await renderReports();
    });
    tbody.appendChild(tr);
  });
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

  document.getElementById('sendMsgBtn').addEventListener('click', async () => {
    const title = document.getElementById('msgTitleInput').value.trim();
    const message = document.getElementById('msgBodyInput').value.trim();
    const status = document.getElementById('msgStatus');

    status.textContent = '';
    status.className = 'error-msg';

    if (!title || !message) {
      status.textContent = 'Please fill both fields.';
      return;
    }

    try {
      await pushNotification(user.id, {
        type: 'admin_message',
        title: title,
        message: message
      });
      status.className = 'success-msg';
      status.textContent = 'Sent!';
      setTimeout(closeModal, 700);
    } catch (err) {
      console.error(err);
      status.textContent = err.message || 'Failed.';
    }
  });
}

/* ============================================================
   HELPERS
   ============================================================ */
async function pushNotification(userId, data) {
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

function defaultAvatar(name) {
  const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#1e1e28"/>
      <text x="50" y="50" font-size="44" font-family="sans-serif" font-weight="700"
            fill="#fff" text-anchor="middle" dominant-baseline="central">
        ${letter}
      </text>
    </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
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