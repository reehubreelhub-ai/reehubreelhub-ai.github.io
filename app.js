/* ============================================================
   ReelHub — app.js
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit
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
   DOM SHORTCUTS
   ============================================================ */
const authScreen = document.getElementById('auth');
const loadingScreen = document.getElementById('loadingScreen');
const appScreen  = document.getElementById('app');
const loginForm  = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginMsg   = document.getElementById('loginMsg');
const signupMsg  = document.getElementById('signupMsg');
const loginBtn   = document.getElementById('loginBtn');
const signupBtn  = document.getElementById('signupBtn');
const content    = document.getElementById('content');

const editModal      = document.getElementById('editModal');
const editPreviewImg = document.getElementById('editPreviewImg');
const editPhotoInput = document.getElementById('editPhoto');
const editNameInput  = document.getElementById('editName');
const editUserInput  = document.getElementById('editUser');
const editBioInput   = document.getElementById('editBio');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const editMsg        = document.getElementById('editMsg');

const listModal = document.getElementById('listModal');
const listTitle = document.getElementById('listTitle');
const userList  = document.getElementById('userList');

const forgotModal  = document.getElementById('forgotModal');
const forgotEmail  = document.getElementById('forgotEmail');
const forgotMsg    = document.getElementById('forgotMsg');
const sendResetBtn = document.getElementById('sendResetBtn');

const notifBtn = document.getElementById('notifBtn');
const notifDot = document.getElementById('notifDot');
const searchBtn = document.getElementById('searchBtn');

/* ============================================================
   STATE
   ============================================================ */
let currentUser    = null;
let currentProfile = null;
let selectedPhotoBase64 = null;
let isLoggingIn    = false;
let notifIntervalId = null;

/* ============================================================
   SCREEN SWITCHING
   ============================================================ */
function showAuth() {
  if (loadingScreen) loadingScreen.style.display = 'none';
  authScreen.style.display = 'block';
  appScreen.classList.remove('show');
  stopNotifWatcher();
}

function showApp() {
  if (loadingScreen) loadingScreen.style.display = 'none';
  authScreen.style.display = 'none';
  appScreen.classList.add('show');
  setActiveNav('home');
  renderPage('home');
}

function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(i => {
    i.classList.toggle('active', i.dataset.page === page);
  });
}

/* ============================================================
   PASSWORD EYE TOGGLE
   ============================================================ */
document.querySelectorAll('.eye').forEach(eye => {
  eye.addEventListener('click', () => {
    const inp = document.getElementById(eye.dataset.target);
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
});

/* ============================================================
   LOGIN <-> SIGNUP SWITCH
   ============================================================ */
document.getElementById('goSignup').addEventListener('click', () => {
  loginForm.style.display = 'none';
  signupForm.style.display = 'block';
  loginMsg.textContent = '';
  signupMsg.textContent = '';
});
document.getElementById('goLogin').addEventListener('click', () => {
  signupForm.style.display = 'none';
  loginForm.style.display = 'block';
  loginMsg.textContent = '';
  signupMsg.textContent = '';
});

/* ============================================================
   SIGNUP
   ============================================================ */
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name  = document.getElementById('signupName').value.trim();
  const user  = document.getElementById('signupUser').value.trim().toLowerCase();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('signupPass').value;

  signupMsg.className = 'error-msg';
  signupMsg.textContent = '';

  if (!name || !user || !email || !pass) {
    signupMsg.textContent = 'Please fill all fields.';
    return;
  }
  if (!/^[a-z0-9._]{3,20}$/.test(user)) {
    signupMsg.textContent = 'Username: 3-20 chars, a-z, 0-9, . or _';
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    signupMsg.textContent = 'Please enter a valid email.';
    return;
  }
  if (pass.length < 6) {
    signupMsg.textContent = 'Password must be at least 6 characters.';
    return;
  }

  signupBtn.disabled = true;
  signupBtn.textContent = 'Creating...';

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('user', '==', user));
    const snap = await getDocs(q);
    if (!snap.empty) {
      signupMsg.textContent = 'Username already taken.';
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
      return;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    await setDoc(doc(db, 'users', uid), {
      uid: uid,
      name: name,
      user: user,
      email: email,
      bio: '',
      photo: '',
      followers: [],
      following: [],
      videoCount: 0,
      createdAt: serverTimestamp()
    });

    signupMsg.className = 'success-msg';
    signupMsg.textContent = 'Account created! Welcome 🎉';

  } catch (err) {
    console.error(err);
    signupMsg.className = 'error-msg';
    if (err.code === 'auth/email-already-in-use') {
      signupMsg.textContent = 'Email already registered. Try logging in.';
    } else if (err.code === 'auth/invalid-email') {
      signupMsg.textContent = 'Invalid email address.';
    } else if (err.code === 'auth/weak-password') {
      signupMsg.textContent = 'Password too weak.';
    } else {
      signupMsg.textContent = err.message || 'Signup failed.';
    }
  } finally {
    signupBtn.disabled = false;
    signupBtn.textContent = 'Sign Up';
  }
});

/* ============================================================
   LOGIN
   ============================================================ */
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('loginPass').value;

  loginMsg.className = 'error-msg';
  loginMsg.textContent = '';

  if (!email || !pass) {
    loginMsg.textContent = 'Please enter email and password.';
    return;
  }

  isLoggingIn = true;
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);

    if (!result || !result.user) {
      throw new Error('Login failed');
    }

    currentUser = result.user;
    await loadProfile(result.user.uid);

    loginMsg.textContent = '';
    showApp();
    startNotifWatcher();

  } catch (err) {
    console.error(err);

    try { await signOut(auth); } catch (e) {}

    currentUser = null;
    currentProfile = null;

    loginMsg.className = 'error-msg';

    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/invalid-credential' ||
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

    showAuth();

  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
    isLoggingIn = false;
  }
});

/* ============================================================
   FORGOT PASSWORD
   ============================================================ */
document.getElementById('forgotLink').addEventListener('click', () => {
  const loginEmailVal = document.getElementById('loginEmail').value.trim();
  forgotEmail.value = loginEmailVal;
  forgotMsg.textContent = '';
  forgotMsg.className = 'error-msg';
  forgotModal.classList.add('show');
});

document.getElementById('closeForgot').addEventListener('click', () => {
  forgotModal.classList.remove('show');
});

forgotModal.addEventListener('click', (e) => {
  if (e.target === forgotModal) forgotModal.classList.remove('show');
});

sendResetBtn.addEventListener('click', async () => {
  const email = forgotEmail.value.trim().toLowerCase();

  forgotMsg.className = 'error-msg';
  forgotMsg.textContent = '';

  if (!email) {
    forgotMsg.textContent = 'Please enter your email address.';
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    forgotMsg.textContent = 'Please enter a valid email.';
    return;
  }

  sendResetBtn.disabled = true;
  sendResetBtn.textContent = 'Sending...';

  try {
    await sendPasswordResetEmail(auth, email);

    forgotMsg.className = 'success-msg';
    forgotMsg.textContent = 'Reset link sent! Check your inbox (and spam folder).';

    setTimeout(() => {
      forgotModal.classList.remove('show');
      forgotEmail.value = '';
      forgotMsg.textContent = '';
    }, 3500);

  } catch (err) {
    console.error(err);
    forgotMsg.className = 'error-msg';

    if (err.code === 'auth/user-not-found') {
      forgotMsg.textContent = 'No account found with this email.';
    } else if (err.code === 'auth/invalid-email') {
      forgotMsg.textContent = 'Invalid email address.';
    } else if (err.code === 'auth/too-many-requests') {
      forgotMsg.textContent = 'Too many attempts. Try again later.';
    } else {
      forgotMsg.textContent = err.message || 'Failed to send reset email.';
    }
  } finally {
    sendResetBtn.disabled = false;
    sendResetBtn.textContent = 'Send Reset Link';
  }
});

/* ============================================================
   LOGOUT
   ============================================================ */
document.getElementById('logoutBtn').addEventListener('click', async () => {
  if (confirm('Log out of ReelHub?')) {
    stopNotifWatcher();
    currentUser = null;
    currentProfile = null;

    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout error:', e);
    }

    loginForm.reset();
    signupForm.reset();
    document.getElementById('goLogin').click();
    showAuth();
  }
});

/* ============================================================
   BELL + SEARCH BUTTONS
   ============================================================ */
notifBtn.addEventListener('click', () => {
  setActiveNav(null);
  renderPage('notifications');
});

searchBtn.addEventListener('click', () => {
  setActiveNav(null);
  renderPage('search');
});

/* ============================================================
   AUTH STATE LISTENER (Auto-login)
   ============================================================ */
onAuthStateChanged(auth, async (user) => {
  // 🔒 Login process chal raha hai → skip
  if (isLoggingIn) {
    console.log('Login in progress — skipping auto redirect');
    return;
  }

  if (user) {
    // ✅ User logged-in hai → Home page
    console.log('Auto-login: user found', user.email);
    currentUser = user;

    try {
      await loadProfile(user.uid);
    } catch (e) {
      console.warn('Profile load failed:', e);
    }

    showApp();
    startNotifWatcher();

  } else {
    // ❌ User logged-out → Login page
    console.log('No user — showing login');
    currentUser = null;
    currentProfile = null;
    stopNotifWatcher();

    loginForm.reset();
    signupForm.reset();
    document.getElementById('goLogin').click();

    showAuth();
  }
});

/* ============================================================
   LOAD PROFILE
   ============================================================ */
async function loadProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      currentProfile = snap.data();
      if (!Array.isArray(currentProfile.followers)) currentProfile.followers = [];
      if (!Array.isArray(currentProfile.following)) currentProfile.following = [];
      if (typeof currentProfile.videoCount !== 'number') currentProfile.videoCount = 0;
    } else {
      currentProfile = null;
    }
  } catch (e) {
    console.warn('Could not load profile:', e);
  }
}

/* ============================================================
   PAGE ROUTER
   ============================================================ */
const pages = {
  home:     'Home Feed',
  shorts:   'Shorts',
  upload:   'Upload',
  messages: 'Messages',
  profile:  'Profile'
};

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    setActiveNav(page);
    renderPage(page);
  });
});

document.querySelector('.upload-btn').addEventListener('click', () => {
  setActiveNav(null);
  renderPage('upload');
});

function renderPage(page) {
  if (page === 'profile') {
    renderProfile();
  } else if (page === 'notifications') {
    renderNotifications();
  } else if (page === 'search') {
    renderSearch();
  } else if (page === 'home' || page === 'shorts' || page === 'upload' || page === 'messages') {
    content.innerHTML = `
      <div class="page-placeholder">
        <div class="page-title">${pages[page]}</div>
      </div>`;
  }
}

/* ============================================================
   PROFILE PAGE
   ============================================================ */
function renderProfile() {
  if (!currentProfile) {
    content.innerHTML = `<div class="page-placeholder"><div class="page-title">Loading...</div></div>`;
    return;
  }

  const p = currentProfile;
  const avatarSrc = p.photo || defaultAvatar(p.name);

  content.innerHTML = `
    <div class="profile-page">

      <div class="profile-top">
        <div class="profile-avatar-wrap" id="avatarWrap">
          <img class="profile-avatar" src="${avatarSrc}" alt="${p.name}">
          <div class="avatar-plus">+</div>
        </div>

        <div class="profile-stats">
          <div class="profile-stat" data-action="videos">
            <b>${p.videoCount || 0}</b><span>Videos</span>
          </div>
          <div class="profile-stat" data-action="followers">
            <b id="followersCount">${p.followers.length}</b><span>Followers</span>
          </div>
          <div class="profile-stat" data-action="following">
            <b id="followingCount">${p.following.length}</b><span>Following</span>
          </div>
        </div>
      </div>

      <div class="profile-info">
        <div class="profile-name">${escapeHtml(p.name)}</div>
        <div class="profile-username">@${escapeHtml(p.user)}</div>
        <div class="profile-bio">${p.bio ? escapeHtml(p.bio) : '<span style="color:#555">No bio yet.</span>'}</div>
      </div>

      <div class="profile-actions">
        <button class="btn-outline" id="editProfileBtn">Edit Profile</button>
        <button class="btn-outline share-btn" id="shareProfileBtn">
          <svg viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share Profile
        </button>
      </div>

      <div class="profile-tabs">
        <button class="profile-tab active">Videos</button>
      </div>

      <div class="profile-grid" id="profileGrid">
        ${renderEmptyGrid()}
      </div>

    </div>
  `;

  document.getElementById('editProfileBtn').addEventListener('click', openEditModal);
  document.getElementById('avatarWrap').addEventListener('click', openEditModal);

  const shareBtn = document.getElementById('shareProfileBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => shareProfile());
  }

  document.querySelectorAll('.profile-stat').forEach(el => {
    el.addEventListener('click', () => {
      const action = el.dataset.action;
      if (action === 'videos') return;
      if (action === 'followers') openListModal('followers');
      if (action === 'following') openListModal('following');
    });
  });
}

function renderEmptyGrid() {
  return `
    <div class="grid-empty">
      <svg viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="4"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
      <div>No videos yet</div>
      <div style="font-size:12px;color:#444;margin-top:6px;">Upload your first video to get started</div>
    </div>`;
}

/* ============================================================
   EDIT PROFILE MODAL
   ============================================================ */
function openEditModal() {
  if (!currentProfile) return;
  selectedPhotoBase64 = null;

  editNameInput.value = currentProfile.name || '';
  editUserInput.value = currentProfile.user || '';
  editBioInput.value  = currentProfile.bio  || '';
  editPreviewImg.src  = currentProfile.photo || defaultAvatar(currentProfile.name);
  editMsg.textContent = '';

  editModal.classList.add('show');
}

document.getElementById('closeEdit').addEventListener('click', () => {
  editModal.classList.remove('show');
});

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) editModal.classList.remove('show');
});

editPhotoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 500 * 1024) {
    editMsg.className = 'error-msg';
    editMsg.textContent = 'Image too large. Please choose a smaller photo (< 500 KB).';
    return;
  }

  const base64 = await fileToBase64(file);
  selectedPhotoBase64 = base64;
  editPreviewImg.src = base64;
  editMsg.textContent = '';
});

saveProfileBtn.addEventListener('click', async () => {
  if (!currentUser) return;

  const newName = editNameInput.value.trim();
  const newUser = editUserInput.value.trim().toLowerCase();
  const newBio  = editBioInput.value.trim();

  editMsg.className = 'error-msg';
  editMsg.textContent = '';

  if (!newName) {
    editMsg.textContent = 'Name cannot be empty.';
    return;
  }
  if (!/^[a-z0-9._]{3,20}$/.test(newUser)) {
    editMsg.textContent = 'Username: 3-20 chars, a-z, 0-9, . or _';
    return;
  }
  if (newBio.length > 150) {
    editMsg.textContent = 'Bio too long (max 150).';
    return;
  }

  saveProfileBtn.disabled = true;
  saveProfileBtn.textContent = 'Saving...';

  try {
    if (newUser !== currentProfile.user) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('user', '==', newUser));
      const snap = await getDocs(q);
      if (!snap.empty) {
        editMsg.textContent = 'Username already taken.';
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = 'Save Changes';
        return;
      }
    }

    const updateData = {
      name: newName,
      user: newUser,
      bio:  newBio
    };

    if (selectedPhotoBase64) {
      updateData.photo = selectedPhotoBase64;
    }

    await updateDoc(doc(db, 'users', currentUser.uid), updateData);

    currentProfile.name = newName;
    currentProfile.user = newUser;
    currentProfile.bio  = newBio;
    if (selectedPhotoBase64) currentProfile.photo = selectedPhotoBase64;

    editMsg.className = 'success-msg';
    editMsg.textContent = 'Profile updated!';

    setTimeout(() => {
      editModal.classList.remove('show');
      renderProfile();
    }, 500);

  } catch (err) {
    console.error(err);
    editMsg.className = 'error-msg';
    editMsg.textContent = err.message || 'Update failed.';
  } finally {
    saveProfileBtn.disabled = false;
    saveProfileBtn.textContent = 'Save Changes';
  }
});

/* ============================================================
   FOLLOWERS / FOLLOWING LIST MODAL
   ============================================================ */
function openListModal(type) {
  if (!currentProfile) return;

  const isFollowers = type === 'followers';
  listTitle.textContent = isFollowers ? 'Followers' : 'Following';
  userList.innerHTML = '<div class="empty-msg">Loading...</div>';
  listModal.classList.add('show');

  const uids = isFollowers ? currentProfile.followers : currentProfile.following;

  if (!uids || uids.length === 0) {
    userList.innerHTML = `<div class="empty-msg">No ${isFollowers ? 'followers' : 'following'} yet.</div>`;
    return;
  }

  loadUsersByIds(uids).then(users => {
    if (users.length === 0) {
      userList.innerHTML = `<div class="empty-msg">No users found.</div>`;
      return;
    }
    userList.innerHTML = '';
    users.forEach(u => {
      const row = document.createElement('div');
      row.className = 'user-row';
      row.innerHTML = `
        <img src="${u.photo || defaultAvatar(u.name)}" alt="${escapeHtml(u.name)}">
        <div class="meta">
          <b>${escapeHtml(u.name)}</b>
          <span>@${escapeHtml(u.user)}</span>
        </div>
        <button class="${currentProfile.following.includes(u.uid) ? 'unfollow' : 'follow'}"
                data-uid="${u.uid}">
          ${currentProfile.following.includes(u.uid) ? 'Following' : 'Follow'}
        </button>
      `;
      row.querySelector('button').addEventListener('click', async (e) => {
        e.stopPropagation();
        await toggleFollow(u.uid, e.target);
      });
      userList.appendChild(row);
    });
  });
}

document.getElementById('closeList').addEventListener('click', () => {
  listModal.classList.remove('show');
});
listModal.addEventListener('click', (e) => {
  if (e.target === listModal) listModal.classList.remove('show');
});

/* ============================================================
   TOGGLE FOLLOW
   ============================================================ */
async function toggleFollow(targetUid, btnEl) {
  if (!currentUser || !currentProfile) return;
  if (targetUid === currentUser.uid) return;

  const isFollowing = currentProfile.following.includes(targetUid);

  try {
    const myRef     = doc(db, 'users', currentUser.uid);
    const targetRef = doc(db, 'users', targetUid);

    if (isFollowing) {
      await updateDoc(myRef, {
        following: arrayRemove(targetUid)
      });
      await updateDoc(targetRef, {
        followers: arrayRemove(currentUser.uid)
      });
      currentProfile.following = currentProfile.following.filter(id => id !== targetUid);
      if (btnEl) {
        btnEl.textContent = 'Follow';
        btnEl.className = 'follow';
      }
    } else {
      await updateDoc(myRef, {
        following: arrayUnion(targetUid)
      });
      await updateDoc(targetRef, {
        followers: arrayUnion(currentUser.uid)
      });
      currentProfile.following.push(targetUid);
      if (btnEl) {
        btnEl.textContent = 'Following';
        btnEl.className = 'unfollow';
      }
    }
  } catch (err) {
    console.error('Follow error:', err);
    showToast('Could not update follow. Please try again.');
  }
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
async function renderNotifications() {
  if (!currentUser) return;

  content.innerHTML = `
    <div class="notif-page">
      <div class="page-title" style="margin-bottom:16px;text-align:left;padding:0 4px;">Notifications</div>
      <div id="notifList">
        <div class="empty-notif">Loading...</div>
      </div>
    </div>
  `;

  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snap = await getDocs(q);
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    paintNotifications(notifications);

    for (const n of notifications) {
      if (!n.read) {
        try {
          await updateDoc(doc(db, 'notifications', n.id), { read: true });
        } catch (e) {}
      }
    }
    updateNotifDot(0);

  } catch (e) {
    console.error(e);
    const el = document.getElementById('notifList');
    if (el) el.innerHTML = `<div class="empty-notif">Could not load notifications.</div>`;
  }
}

function paintNotifications(list) {
  const wrap = document.getElementById('notifList');
  if (!wrap) return;

  if (list.length === 0) {
    wrap.innerHTML = `
      <div class="empty-notif">
        <svg viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <div>No notifications yet</div>
      </div>`;
    return;
  }

  wrap.innerHTML = '';
  list.forEach(n => {
    const item = document.createElement('div');
    item.className = 'notif-item' + (n.read ? '' : ' unread');

    const time = n.createdAt?.toDate?.();
    const timeStr = time ? timeAgo(time) : 'just now';

    let actionsHtml = '';
    if (n.type === 'admin_invite' && n.actions && n.actions.includes('accept')) {
      actionsHtml = `
        <div class="notif-actions">
          <button class="accept" data-action="accept" data-invite="${n.inviteId || ''}">✅ Accept</button>
          <button class="reject" data-action="reject" data-invite="${n.inviteId || ''}">❌ Reject</button>
        </div>
      `;
    }

    item.innerHTML = `
      <div class="notif-header">
        <div class="notif-title">${escapeHtml(n.title || 'Notification')}</div>
        <div class="notif-time">${timeStr}</div>
      </div>
      <div class="notif-message">${escapeHtml(n.message || '')}</div>
      ${actionsHtml}
    `;
    wrap.appendChild(item);
  });

  wrap.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      const inviteId = btn.dataset.invite;
      if (action === 'accept') await handleInviteAccept(inviteId);
      if (action === 'reject') await handleInviteReject(inviteId);
      await renderNotifications();
    });
  });
}

async function handleInviteAccept(inviteId) {
  if (!inviteId || !currentUser) return;
  try {
    await updateDoc(doc(db, 'admin_invites', inviteId), {
      status: 'accepted',
      respondedAt: serverTimestamp()
    });
    await updateDoc(doc(db, 'users', currentUser.uid), {
      role: 'admin'
    });
    showToast('🎉 You are now an admin!');
  } catch (e) {
    console.error(e);
    showToast('❌ Could not accept invite');
  }
}

async function handleInviteReject(inviteId) {
  if (!inviteId || !currentUser) return;
  try {
    await updateDoc(doc(db, 'admin_invites', inviteId), {
      status: 'rejected',
      respondedAt: serverTimestamp()
    });
    showToast('Invitation declined');
  } catch (e) {
    console.error(e);
    showToast('❌ Could not reject invite');
  }
}

/* ============================================================
   NOTIFICATION WATCHER
   ============================================================ */
function startNotifWatcher() {
  stopNotifWatcher();
  checkUnreadNotifications();
  notifIntervalId = setInterval(checkUnreadNotifications, 30000);
}

function stopNotifWatcher() {
  if (notifIntervalId) {
    clearInterval(notifIntervalId);
    notifIntervalId = null;
  }
  updateNotifDot(0);
}

async function checkUnreadNotifications() {
  if (!currentUser) return;
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false),
      limit(20)
    );
    const snap = await getDocs(q);
    updateNotifDot(snap.size);
  } catch (e) {
    // Silent
  }
}

function updateNotifDot(count) {
  if (!notifDot) return;
  notifDot.style.display = count > 0 ? 'block' : 'none';
}

/* ============================================================
   SEARCH
   ============================================================ */
async function renderSearch() {
  content.innerHTML = `
    <div class="search-page">
      <div class="search-bar-wrap">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" class="search-bar" id="searchInput" placeholder="Search users by name or username...">
      </div>
      <div class="search-results" id="searchResults">
        <div class="search-empty">Start typing to search users...</div>
      </div>
    </div>
  `;

  const input = document.getElementById('searchInput');
  let debounceTimer = null;

  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performSearch(e.target.value.trim());
    }, 300);
  });

  input.focus();
}

async function performSearch(searchTerm) {
  const results = document.getElementById('searchResults');
  if (!results) return;

  if (!searchTerm) {
    results.innerHTML = `<div class="search-empty">Start typing to search users...</div>`;
    return;
  }

  results.innerHTML = `<div class="search-empty">Searching...</div>`;

  try {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);

    const term = searchTerm.toLowerCase();
    const matches = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.id !== currentUser.uid)
      .filter(u =>
        (u.name || '').toLowerCase().includes(term) ||
        (u.user || '').toLowerCase().includes(term)
      )
      .slice(0, 30);

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-empty">No users found for "${escapeHtml(searchTerm)}"</div>`;
      return;
    }

    results.innerHTML = '';
    matches.forEach(u => {
      const row = document.createElement('div');
      row.className = 'search-user';

      const isFollowing = currentProfile?.following?.includes(u.id);
      row.innerHTML = `
        <img src="${u.photo || defaultAvatar(u.name)}" alt="">
        <div class="info">
          <b>${escapeHtml(u.name)}</b>
          <span>@${escapeHtml(u.user)}</span>
        </div>
        <button class="${isFollowing ? 'unfollow' : 'follow'}" data-uid="${u.id}">
          ${isFollowing ? 'Following' : 'Follow'}
        </button>
      `;

      row.querySelector('button').addEventListener('click', async (e) => {
        e.stopPropagation();
        await toggleFollow(u.id, e.target);
      });

      results.appendChild(row);
    });

  } catch (e) {
    console.error(e);
    results.innerHTML = `<div class="search-empty">Search failed. Please try again.</div>`;
  }
}

/* ============================================================
   SHARE PROFILE
   ============================================================ */
async function shareProfile() {
  if (!currentProfile) return;

  const appUrl = window.location.origin;
  const shareText = `🎬 Check out ${currentProfile.name}'s profile on ReelHub!\n\n@${currentProfile.user}\n\n${appUrl}`;
  const shareTitle = `${currentProfile.name} on ReelHub`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: appUrl
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('Share failed:', err);
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    showToast('✅ Link copied to clipboard!');
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = shareText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('✅ Link copied to clipboard!');
    } catch (e) {
      showToast('❌ Could not copy link');
    }
    document.body.removeChild(textarea);
  }
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
function showToast(message) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e1e28;
    color: #fff;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 8px 20px rgba(0,0,0,0.6);
    border: 1px solid #333;
    animation: toastSlide 0.3s ease;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ============================================================
   HELPERS
   ============================================================ */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

async function loadUsersByIds(uids) {
  const results = [];
  for (const uid of uids) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) results.push(snap.data());
    } catch (e) {
      console.warn('load user failed:', uid, e);
    }
  }
  return results;
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