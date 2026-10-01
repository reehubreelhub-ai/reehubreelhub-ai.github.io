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
  arrayRemove
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

/* ============================================================
   STATE
   ============================================================ */
let currentUser    = null;
let currentProfile = null;
let selectedPhotoBase64 = null;
let isLoggingIn    = false;   // 🔒 Login in progress flag

/* ============================================================
   SCREEN SWITCHING
   ============================================================ */
function showAuth() {
  authScreen.style.display = 'block';
  appScreen.classList.remove('show');
}

function showApp() {
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
   LOGIN <-> SIGNUP
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
    // Check username unique
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('user', '==', user));
    const snap = await getDocs(q);
    if (!snap.empty) {
      signupMsg.textContent = 'Username already taken.';
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
      return;
    }

    // Create auth user
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    // Save profile in Firestore
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
    // onAuthStateChanged will auto-show app
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

  isLoggingIn = true;   // 🔒 Set flag

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);

    if (!result || !result.user) {
      throw new Error('Login failed — no user returned');
    }

    currentUser = result.user;
    await loadProfile(result.user.uid);

    loginMsg.className = 'success-msg';
    loginMsg.textContent = 'Login successful! 🎉';

    showApp();

  } catch (err) {
    console.error(err);
    loginMsg.className = 'error-msg';

    // 🔒 Login fail — sign out if any session remains
    try { await signOut(auth); } catch (e) {}

    currentUser = null;
    currentProfile = null;

    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/invalid-login-credentials'
    ) {
      loginMsg.textContent = '❌ Invalid email or password.';
    } else if (err.code === 'auth/too-many-requests') {
      loginMsg.textContent = '⚠️ Too many attempts. Try again later.';
    } else if (err.code === 'auth/network-request-failed') {
      loginMsg.textContent = '🌐 Network error. Check your internet.';
    } else {
      loginMsg.textContent = '❌ ' + (err.code || 'Error') + ' — ' + (err.message || 'Login failed.');
    }

    // Stay on login screen
    showAuth();
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
    isLoggingIn = false;   // 🔒 Clear flag
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
    forgotMsg.textContent = 'Reset link sent! Check your inbox (and spam).';

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
    await signOut(auth);
  }
});

/* ============================================================
   AUTH STATE LISTENER
   ============================================================ */
onAuthStateChanged(auth, async (user) => {
  console.log('Auth state changed:', user ? user.email : 'null');

  // 🔒 Skip if login form is processing
  if (isLoggingIn) {
    console.log('Login in progress — skipping auto redirect');
    return;
  }

  if (user) {
    currentUser = user;
    await loadProfile(user.uid);
    showApp();
  } else {
    currentUser = null;
    currentProfile = null;
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
    alert('Could not update follow. Please try again.');
  }
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