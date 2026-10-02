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
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
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
   CLOUDINARY ACCOUNTS
   ============================================================ */
const CLOUDINARY_ACCOUNTS = [
  {
    cloudName: "fepzqr9t",
    apiKey:    "287332161532267",
    preset:    "reelhub_video"
  },
  {
    cloudName: "s3eresx6",
    apiKey:    "349223397331644",
    preset:    "reelhub_video"
  }
];

/* ============================================================
   DOM SHORTCUTS
   ============================================================ */
const authScreen     = document.getElementById('auth');
const loadingScreen  = document.getElementById('loadingScreen');
const appScreen      = document.getElementById('app');
const loginForm      = document.getElementById('loginForm');
const signupForm     = document.getElementById('signupForm');
const loginMsg       = document.getElementById('loginMsg');
const signupMsg      = document.getElementById('signupMsg');
const loginBtn       = document.getElementById('loginBtn');
const signupBtn      = document.getElementById('signupBtn');
const content        = document.getElementById('content');

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

// Upload
const uploadModal        = document.getElementById('uploadModal');
const uploadTabs         = document.querySelectorAll('.upload-tab');
const uploadFileInput    = document.getElementById('uploadFileInput');
const uploadCaption      = document.getElementById('uploadCaption');
const uploadSubmitBtn    = document.getElementById('uploadSubmitBtn');
const uploadMsg          = document.getElementById('uploadMsg');
const uploadPreview      = document.getElementById('uploadPreview');
const uploadPreviewWrap  = document.getElementById('uploadPreviewWrap');
const uploadPreviewInfo  = document.getElementById('uploadPreviewInfo');
const uploadPhotoPreview = document.getElementById('uploadPhotoPreview');
const uploadPhotoPreviewWrap = document.getElementById('uploadPhotoPreviewWrap');
const uploadPickerWrap   = document.getElementById('uploadPickerWrap');
const pickerTitle        = document.getElementById('pickerTitle');
const pickerSubtitle     = document.getElementById('pickerSubtitle');
const pickerLabel        = document.getElementById('pickerLabel');
const uploadProgressWrap = document.getElementById('uploadProgressWrap');
const uploadProgressBar  = document.getElementById('uploadProgressBar');
const uploadProgressText = document.getElementById('uploadProgressText');

// Player
const playerModal   = document.getElementById('playerModal');
const playerTitle   = document.getElementById('playerTitle');
const playerContent = document.getElementById('playerContent');

/* ============================================================
   STATE
   ============================================================ */
let currentUser    = null;
let currentProfile = null;
let selectedPhotoBase64 = null;
let isLoggingIn    = false;
let notifIntervalId = null;
let viewingUserId  = null;

let currentUploadType = 'short';   // short | long | photo
let selectedFile = null;
let selectedFileDuration = 0;      // seconds (videos)

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

    if (!result || !result.user) throw new Error('Login failed');

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

  if (!email) { forgotMsg.textContent = 'Please enter your email address.'; return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { forgotMsg.textContent = 'Please enter a valid email.'; return; }

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
    viewingUserId = null;

    try { await signOut(auth); } catch (e) {}

    loginForm.reset();
    signupForm.reset();
    document.getElementById('goLogin').click();
    showAuth();
  }
});

/* ============================================================
   HEADER BUTTONS
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
   AUTH STATE LISTENER
   ============================================================ */
onAuthStateChanged(auth, async (user) => {
  if (isLoggingIn) return;

  if (user) {
    currentUser = user;
    try { await loadProfile(user.uid); } catch (e) {}
    showApp();
    startNotifWatcher();
  } else {
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
    viewingUserId = null;
    setActiveNav(page);
    renderPage(page);
  });
});

document.querySelector('.upload-btn').addEventListener('click', () => {
  setActiveNav(null);
  openUploadModal();
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
   OWN PROFILE PAGE
   ============================================================ */
async function renderProfile() {
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
            <b id="myVideoCount">${p.videoCount || 0}</b><span>Videos</span>
          </div>
          <div class="profile-stat" data-action="followers">
            <b>${p.followers.length}</b><span>Followers</span>
          </div>
          <div class="profile-stat" data-action="following">
            <b>${p.following.length}</b><span>Following</span>
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
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share Profile
        </button>
      </div>

      <div class="profile-tabs">
        <button class="profile-tab active">Posts</button>
      </div>

      <div class="profile-grid" id="myPostsGrid">
        <div class="grid-empty">Loading posts...</div>
      </div>
    </div>
  `;

  document.getElementById('editProfileBtn').addEventListener('click', openEditModal);
  document.getElementById('avatarWrap').addEventListener('click', openEditModal);

  const shareBtn = document.getElementById('shareProfileBtn');
  if (shareBtn) shareBtn.addEventListener('click', () => shareProfile());

  document.querySelectorAll('.profile-stat').forEach(el => {
    el.addEventListener('click', () => {
      const action = el.dataset.action;
      if (action === 'videos') return;
      if (action === 'followers') openListModal('followers');
      if (action === 'following') openListModal('following');
    });
  });

  // Load user's posts
  await renderUserPosts(currentUser.uid, 'myPostsGrid');
}

/* ============================================================
   USER POSTS GRID (own or public)
   ============================================================ */
async function renderUserPosts(uid, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(60)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `
        <div class="grid-empty">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <div>No posts yet</div>
          <div style="font-size:12px;color:#444;margin-top:6px;">Tap + to add your first post</div>
        </div>`;
      return;
    }

    container.innerHTML = '';
    snap.forEach(docSnap => {
      const post = { id: docSnap.id, ...docSnap.data() };
      container.appendChild(makeGridItem(post));
    });

  } catch (e) {
    console.error('Could not load posts:', e);
    container.innerHTML = `<div class="grid-empty">Could not load posts.</div>`;
  }
}

function makeGridItem(post) {
  const item = document.createElement('div');
  item.className = 'grid-item';

  // Aspect ratio by type
  if (post.type === 'long') {
    item.style.aspectRatio = '16 / 9';
  } else {
    item.style.aspectRatio = '9 / 16';
  }

  const thumbUrl = post.thumbnail || (post.type === 'photo' ? post.url : '');

  let inner = '';
  if (post.type === 'photo') {
    inner = `<img src="${post.url}" alt="">`;
  } else {
    // Video — use Cloudinary generated thumbnail via /video/upload/so_0/ ... but we saved poster
    // Simpler: use video element with poster
    inner = `
      <video src="${post.url}" muted playsinline preload="metadata"
             ${thumbUrl ? `poster="${thumbUrl}"` : ''}></video>
    `;
  }

  const badgeText = post.type === 'photo' ? 'PHOTO' : (post.type === 'long' ? 'LONG' : 'SHORT');

  item.innerHTML = `
    ${inner}
    <div class="type-badge">${badgeText}</div>
    ${post.type !== 'photo' ? `<div class="play-icon">▶</div>` : ''}
  `;

  item.addEventListener('click', () => openPlayer(post));

  return item;
}

/* ============================================================
   UPLOAD MODAL
   ============================================================ */
function openUploadModal() {
  // Reset
  selectedFile = null;
  selectedFileDuration = 0;
  currentUploadType = 'short';

  uploadFileInput.value = '';
  uploadCaption.value = '';
  uploadMsg.textContent = '';
  uploadMsg.className = 'error-msg';
  uploadPreview.src = '';
  uploadPhotoPreview.src = '';
  uploadPreviewWrap.style.display = 'none';
  uploadPhotoPreviewWrap.style.display = 'none';
  uploadPickerWrap.style.display = 'flex';
  uploadSubmitBtn.disabled = true;
  uploadProgressWrap.style.display = 'none';
  uploadProgressBar.style.width = '0%';
  uploadProgressText.textContent = '0%';

  // Set short as active
  document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.upload-tab[data-type="short"]').classList.add('active');

  updatePickerText();
  uploadModal.classList.add('show');
}

function updatePickerText() {
  if (currentUploadType === 'short') {
    pickerTitle.textContent = 'Choose a short video';
    pickerSubtitle.textContent = 'Max 30 sec • 9:16 vertical';
    pickerLabel.textContent = 'Select video';
    uploadFileInput.accept = 'video/*';
  } else if (currentUploadType === 'long') {
    pickerTitle.textContent = 'Choose a long video';
    pickerSubtitle.textContent = 'Max 1 minute • 16:9 horizontal';
    pickerLabel.textContent = 'Select video';
    uploadFileInput.accept = 'video/*';
  } else {
    pickerTitle.textContent = 'Choose a photo';
    pickerSubtitle.textContent = 'Max 5 MB • JPG / PNG';
    pickerLabel.textContent = 'Select photo';
    uploadFileInput.accept = 'image/*';
  }
}

document.getElementById('closeUpload').addEventListener('click', () => {
  uploadModal.classList.remove('show');
});

uploadModal.addEventListener('click', (e) => {
  if (e.target === uploadModal) uploadModal.classList.remove('show');
});

// Tab switching
document.querySelectorAll('.upload-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentUploadType = tab.dataset.type;

    // Reset selection
    selectedFile = null;
    selectedFileDuration = 0;
    uploadFileInput.value = '';
    uploadPreview.src = '';
    uploadPhotoPreview.src = '';
    uploadPreviewWrap.style.display = 'none';
    uploadPhotoPreviewWrap.style.display = 'none';
    uploadPickerWrap.style.display = 'flex';
    uploadSubmitBtn.disabled = true;
    uploadMsg.textContent = '';

    updatePickerText();
  });
});

/* ============================================================
   FILE SELECT
   ============================================================ */
uploadFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  uploadMsg.className = 'error-msg';
  uploadMsg.textContent = '';

  if (currentUploadType === 'photo') {
    // PHOTO
    if (!file.type.startsWith('image/')) {
      uploadMsg.textContent = 'Please choose an image file.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      uploadMsg.textContent = 'Photo too large. Max 5 MB.';
      return;
    }
    selectedFile = file;
    const url = URL.createObjectURL(file);
    uploadPhotoPreview.src = url;
    uploadPhotoPreviewWrap.style.display = 'block';
    uploadPickerWrap.style.display = 'none';
    uploadSubmitBtn.disabled = false;
    return;
  }

  // VIDEO
  if (!file.type.startsWith('video/')) {
    uploadMsg.textContent = 'Please choose a video file.';
    return;
  }
  if (file.size > 100 * 1024 * 1024) {
    uploadMsg.textContent = 'Video too large. Max 100 MB.';
    return;
  }

  // Read duration
  const url = URL.createObjectURL(file);
  const tempVideo = document.createElement('video');
  tempVideo.preload = 'metadata';
  tempVideo.src = url;

  tempVideo.onloadedmetadata = () => {
    const duration = tempVideo.duration;

    if (!isFinite(duration) || duration <= 0) {
      uploadMsg.textContent = 'Could not read video duration.';
      return;
    }

    selectedFile = file;
    selectedFileDuration = duration;

    // Auto-correct type if needed
    if (currentUploadType === 'short' && duration > 30.5) {
      uploadMsg.textContent = `⚠️ Video is ${Math.round(duration)}s. It's a Long video. Switching to Long tab...`;
      setTimeout(() => {
        switchUploadType('long');
        uploadFileInput.value = '';
        selectedFile = null;
        selectedFileDuration = 0;
        uploadMsg.textContent = 'Please select the video again to upload as Long.';
      }, 1500);
      return;
    }

    if (currentUploadType === 'long' && duration <= 30.5) {
      uploadMsg.textContent = `⚠️ Video is ${Math.round(duration)}s. It's a Short video. Switching to Short tab...`;
      setTimeout(() => {
        switchUploadType('short');
        uploadFileInput.value = '';
        selectedFile = null;
        selectedFileDuration = 0;
        uploadMsg.textContent = 'Please select the video again to upload as Short.';
      }, 1500);
      return;
    }

    if (currentUploadType === 'long' && duration > 60.5) {
      uploadMsg.textContent = `⚠️ Long video must be max 1 minute. Yours is ${Math.round(duration)}s.`;
      return;
    }

    // Show preview
    uploadPreview.src = url;
    uploadPreviewWrap.style.display = 'block';
    uploadPickerWrap.style.display = 'none';
    uploadPreviewInfo.textContent = `Duration: ${Math.round(duration)}s • Size: ${(file.size/1024/1024).toFixed(2)} MB`;
    uploadSubmitBtn.disabled = false;
  };

  tempVideo.onerror = () => {
    uploadMsg.textContent = 'Could not load video. Try a different file.';
  };
});

function switchUploadType(type) {
  document.querySelectorAll('.upload-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.type === type);
  });
  currentUploadType = type;
  updatePickerText();
  uploadPreview.src = '';
  uploadPhotoPreview.src = '';
  uploadPreviewWrap.style.display = 'none';
  uploadPhotoPreviewWrap.style.display = 'none';
  uploadPickerWrap.style.display = 'flex';
  uploadSubmitBtn.disabled = true;
}

/* ============================================================
   UPLOAD SUBMIT
   ============================================================ */
uploadSubmitBtn.addEventListener('click', async () => {
  if (!currentUser || !currentProfile) {
    uploadMsg.textContent = 'You must be logged in.';
    return;
  }
  if (!selectedFile) {
    uploadMsg.textContent = 'Please select a file first.';
    return;
  }

  const caption = uploadCaption.value.trim();

  uploadSubmitBtn.disabled = true;
  uploadSubmitBtn.textContent = 'Uploading...';
  uploadMsg.textContent = '';
  uploadMsg.className = 'error-msg';
  uploadProgressWrap.style.display = 'block';
  uploadProgressBar.style.width = '0%';
  uploadProgressText.textContent = '0%';

  try {
    const result = await uploadToCloudinary(selectedFile, (percent) => {
      uploadProgressBar.style.width = percent + '%';
      uploadProgressText.textContent = percent + '%';
    });

    // Save to Firestore
    const postData = {
      userId: currentUser.uid,
      userName: currentProfile.name,
      userHandle: currentProfile.user,
      userPhoto: currentProfile.photo || '',
      type: currentUploadType,
      url: result.secure_url,
      thumbnail: buildThumbnailUrl(result.secure_url, currentUploadType),
      caption: caption,
      duration: selectedFileDuration || 0,
      aspectRatio: currentUploadType === 'long' ? '16:9' : (currentUploadType === 'short' ? '9:16' : '1:1'),
      likes: [],
      comments: [],
      views: 0,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'posts'), postData);

    // Increment video count on user
    await updateDoc(doc(db, 'users', currentUser.uid), {
      videoCount: (currentProfile.videoCount || 0) + 1
    });
    currentProfile.videoCount = (currentProfile.videoCount || 0) + 1;

    uploadMsg.className = 'success-msg';
    uploadMsg.textContent = '✅ Uploaded successfully!';

    setTimeout(() => {
      uploadModal.classList.remove('show');
      if (document.querySelector('.nav-item[data-page="profile"]').classList.contains('active')) {
        renderProfile();
      }
    }, 1500);

  } catch (err) {
    console.error('Upload failed:', err);
    uploadMsg.className = 'error-msg';
    uploadMsg.textContent = err.message || 'Upload failed. Please try again.';
    uploadSubmitBtn.disabled = false;
    uploadSubmitBtn.textContent = 'Upload';
  }
});

/* ============================================================
   CLOUDINARY UPLOAD (with account fallback)
   ============================================================ */
function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const resourceType = currentUploadType === 'photo' ? 'image' : 'video';
    const accountIndex = 0;

    tryAccount(accountIndex);

    function tryAccount(idx) {
      if (idx >= CLOUDINARY_ACCOUNTS.length) {
        reject(new Error('All Cloudinary accounts failed. Please try again later.'));
        return;
      }

      const acc = CLOUDINARY_ACCOUNTS[idx];
      const url = `https://api.cloudinary.com/v1_1/${acc.cloudName}/${resourceType}/upload`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', acc.preset);
      formData.append('api_key', acc.apiKey);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            resolve(res);
          } catch (e) {
            reject(new Error('Invalid response from Cloudinary.'));
          }
        } else {
          console.warn(`Account ${idx+1} failed (status ${xhr.status}). Trying next...`);
          tryAccount(idx + 1);
        }
      };

      xhr.onerror = () => {
        console.warn(`Account ${idx+1} network error. Trying next...`);
        tryAccount(idx + 1);
      };

      xhr.send(formData);
    }
  });
}

function buildThumbnailUrl(videoUrl, type) {
  // Cloudinary auto-thumbnail from video
  if (!videoUrl) return '';
  if (type === 'photo') return videoUrl;

  // Replace /video/upload/ with /video/upload/so_0/ for first-frame thumbnail
  // Also add transformations for smaller size
  try {
    if (videoUrl.includes('/video/upload/')) {
      return videoUrl.replace(
        '/video/upload/',
        '/video/upload/so_0,w_400,c_fill,q_auto/'
      );
    }
  } catch (e) {}

  return '';
}

/* ============================================================
   VIDEO PLAYER MODAL
   ============================================================ */
function openPlayer(post) {
  playerTitle.textContent = post.caption || (post.type === 'photo' ? 'Photo' : 'Video');

  if (post.type === 'photo') {
    playerContent.innerHTML = `
      <img src="${post.url}" alt="">
    `;
  } else {
    const aspectClass = post.type === 'long' ? 'aspect-16-9' : 'aspect-9-16';
    playerContent.innerHTML = `
      <video src="${post.url}" controls playsinline autoplay
             class="${aspectClass}"
             style="background:#000;"></video>
    `;
  }

  playerModal.classList.add('show');
}

document.getElementById('closePlayer').addEventListener('click', () => {
  playerModal.classList.remove('show');
  playerContent.innerHTML = '';
});

playerModal.addEventListener('click', (e) => {
  if (e.target === playerModal) {
    playerModal.classList.remove('show');
    playerContent.innerHTML = '';
  }
});

/* ============================================================
   PUBLIC USER PROFILE
   ============================================================ */
async function openUserProfile(userId) {
  if (!userId) return;
  if (userId === currentUser.uid) {
    setActiveNav('profile');
    renderPage('profile');
    return;
  }

  viewingUserId = userId;
  setActiveNav(null);

  content.innerHTML = `<div class="page-placeholder"><div class="page-title">Loading...</div></div>`;

  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) {
      content.innerHTML = `<div class="page-placeholder"><div class="page-title">User not found</div></div>`;
      return;
    }

    const user = snap.data();
    const followers = Array.isArray(user.followers) ? user.followers : [];
    const following = Array.isArray(user.following) ? user.following : [];
    const videoCount = typeof user.videoCount === 'number' ? user.videoCount : 0;
    const avatarSrc = user.photo || defaultAvatar(user.name);
    const isFollowing = currentProfile?.following?.includes(userId) || false;

    content.innerHTML = `
      <div style="padding: 12px 16px;">
        <button id="backFromProfileBtn">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
      </div>

      <div class="profile-page" style="padding-top:0;">
        <div class="profile-top">
          <div class="profile-avatar-wrap">
            <img class="profile-avatar" src="${avatarSrc}" alt="${escapeHtml(user.name)}">
          </div>

          <div class="profile-stats">
            <div class="profile-stat"><b>${videoCount}</b><span>Videos</span></div>
            <div class="profile-stat"><b>${followers.length}</b><span>Followers</span></div>
            <div class="profile-stat"><b>${following.length}</b><span>Following</span></div>
          </div>
        </div>

        <div class="profile-info">
          <div class="profile-name">${escapeHtml(user.name)}</div>
          <div class="profile-username">@${escapeHtml(user.user)}</div>
          <div class="profile-bio">${user.bio ? escapeHtml(user.bio) : '<span style="color:#555">No bio yet.</span>'}</div>
        </div>

        <div class="profile-actions">
          <button class="btn-outline" id="pubFollowBtn"
            style="${isFollowing ? '' : 'background: linear-gradient(90deg, #ff2e63, #ff8a00); border: none;'}">
            ${isFollowing ? 'Following' : 'Follow'}
          </button>
          <button class="btn-outline" id="pubShareBtn">
            <svg viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
        </div>

        <div class="profile-tabs">
          <button class="profile-tab active">Posts</button>
        </div>

        <div class="profile-grid" id="pubPostsGrid">
          <div class="grid-empty">Loading posts...</div>
        </div>
      </div>
    `;

    document.getElementById('backFromProfileBtn').addEventListener('click', () => {
      viewingUserId = null;
      setActiveNav(null);
      renderPage('search');
    });

    const followBtn = document.getElementById('pubFollowBtn');
    followBtn.addEventListener('click', async () => {
      const wasFollowing = currentProfile.following.includes(userId);
      await toggleFollow(userId, null);
      if (wasFollowing) {
        followBtn.textContent = 'Follow';
        followBtn.style.cssText = 'background: linear-gradient(90deg, #ff2e63, #ff8a00); border: none;';
      } else {
        followBtn.textContent = 'Following';
        followBtn.style.cssText = '';
      }
    });

    document.getElementById('pubShareBtn').addEventListener('click', () => shareUser(user));

    await renderUserPosts(userId, 'pubPostsGrid');

  } catch (e) {
    console.error('Could not open user profile:', e);
    content.innerHTML = `<div class="page-placeholder"><div class="page-title">Could not load profile</div></div>`;
  }
}

async function shareUser(user) {
  const appUrl = window.location.origin;
  const shareText = `🎬 Check out ${user.name}'s profile on ReelHub!\n\n@${user.user}\n\n${appUrl}`;
  const shareTitle = `${user.name} on ReelHub`;
  if (navigator.share) {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: appUrl });
      return;
    } catch (err) { if (err.name === 'AbortError') return; }
  }
  try {
    await navigator.clipboard.writeText(shareText);
    showToast('✅ Link copied to clipboard!');
  } catch (err) {
    showToast('❌ Could not share');
  }
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
    editMsg.textContent = 'Image too large. Max 500 KB.';
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

  if (!newName) { editMsg.textContent = 'Name cannot be empty.'; return; }
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

    const updateData = { name: newName, user: newUser, bio: newBio };
    if (selectedPhotoBase64) updateData.photo = selectedPhotoBase64;

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
      row.querySelector('img').addEventListener('click', () => {
        listModal.classList.remove('show');
        openUserProfile(u.uid);
      });
      row.querySelector('.meta').addEventListener('click', () => {
        listModal.classList.remove('show');
        openUserProfile(u.uid);
      });
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
      await updateDoc(myRef, { following: arrayRemove(targetUid) });
      await updateDoc(targetRef, { followers: arrayRemove(currentUser.uid) });
      currentProfile.following = currentProfile.following.filter(id => id !== targetUid);
      if (btnEl) { btnEl.textContent = 'Follow'; btnEl.className = 'follow'; }
    } else {
      await updateDoc(myRef, { following: arrayUnion(targetUid) });
      await updateDoc(targetRef, { followers: arrayUnion(currentUser.uid) });
      currentProfile.following.push(targetUid);
      if (btnEl) { btnEl.textContent = 'Following'; btnEl.className = 'unfollow'; }
    }
  } catch (err) {
    console.error('Follow error:', err);
    showToast('Could not update follow. Try again.');
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
      <div id="notifList"><div class="empty-notif">Loading...</div></div>
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
        try { await updateDoc(doc(db, 'notifications', n.id), { read: true }); } catch (e) {}
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
    await updateDoc(doc(db, 'users', currentUser.uid), { role: 'admin' });
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
  } catch (e) {}
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
    debounceTimer = setTimeout(() => performSearch(e.target.value.trim()), 300);
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
      row.querySelector('img').addEventListener('click', (e) => {
        e.stopPropagation();
        openUserProfile(u.id);
      });
      row.querySelector('.info').addEventListener('click', (e) => {
        e.stopPropagation();
        openUserProfile(u.id);
      });
      row.querySelector('button').addEventListener('click', async (e) => {
        e.stopPropagation();
        await toggleFollow(u.id, e.target);
      });
      results.appendChild(row);
    });

  } catch (e) {
    console.error(e);
    results.innerHTML = `<div class="search-empty">Search failed. Try again.</div>`;
  }
}

/* ============================================================
   SHARE OWN PROFILE
   ============================================================ */
async function shareProfile() {
  if (!currentProfile) return;
  const appUrl = window.location.origin;
  const shareText = `🎬 Check out ${currentProfile.name}'s profile on ReelHub!\n\n@${currentProfile.user}\n\n${appUrl}`;
  const shareTitle = `${currentProfile.name} on ReelHub`;
  if (navigator.share) {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: appUrl });
      return;
    } catch (err) { if (err.name === 'AbortError') return; }
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
   TOAST
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
    } catch (e) {}
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