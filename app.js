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
   CLOUDINARY
   ============================================================ */
const CLOUDINARY_ACCOUNTS = [
  {
    cloudName: "fepzqr9t",
    apiKey:    "287332161532267",
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
const chatsDot = document.getElementById('chatsDot');

const uploadModal        = document.getElementById('uploadModal');
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

const playerModal   = document.getElementById('playerModal');
const playerTitle   = document.getElementById('playerTitle');
const playerContent = document.getElementById('playerContent');

// Comments
const commentsModal      = document.getElementById('commentsModal');
const commentsTitle      = document.getElementById('commentsTitle');
const commentsList       = document.getElementById('commentsList');
const commentInput       = document.getElementById('commentInput');
const postCommentBtn     = document.getElementById('postCommentBtn');
const myAvatarForComment = document.getElementById('myAvatarForComment');
const replyIndicator     = document.getElementById('replyIndicator');
const replyIndicatorText = document.getElementById('replyIndicatorText');
const cancelReplyBtn     = document.getElementById('cancelReplyBtn');

// Chats
const newChatModal = document.getElementById('newChatModal');
const newChatSearch = document.getElementById('newChatSearch');
const newChatResults = document.getElementById('newChatResults');
const chatWindowModal = document.getElementById('chatWindowModal');
const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatHeaderHandle = document.getElementById('chatHeaderHandle');
const chatHeaderInfo = document.getElementById('chatHeaderInfo');
const chatMessages = document.getElementById('chatMessages');
const chatMessageInput = document.getElementById('chatMessageInput');
const sendTextBtn = document.getElementById('sendTextBtn');
const micBtn = document.getElementById('micBtn');
const recordingIndicator = document.getElementById('recordingIndicator');
const recordingTimer = document.getElementById('recordingTimer');
const cancelRecordingBtn = document.getElementById('cancelRecordingBtn');

/* ============================================================
   STATE
   ============================================================ */
let currentUser    = null;
let currentProfile = null;
let selectedPhotoBase64 = null;
let isLoggingIn    = false;
let notifIntervalId = null;
let viewingUserId  = null;

let currentUploadType = 'short';
let selectedFile = null;
let selectedFileDuration = 0;

let shortsObserver = null;

// Comments state
let activeCommentPostId = null;
let activeReplyTo = null;
let allCommentsForPost = [];

// Chat state
let activeChatId = null;         // e.g. "uidA_uidB"
let activeChatUser = null;       // other user's profile
let chatMessagesUnsub = null;    // realtime unsubscribe
let chatListInterval = null;     // interval to refresh chat list

// Voice state
let mediaRecorder = null;
let audioChunks = [];
let voiceTimerInterval = null;
let voiceSeconds = 0;
let isRecording = false;
let currentPlayingAudio = null;
let currentPlayingBtn = null;

/* ============================================================
   SCREEN SWITCHING
   ============================================================ */
function showAuth() {
  if (loadingScreen) loadingScreen.style.display = 'none';
  authScreen.style.display = 'block';
  appScreen.classList.remove('show');
  stopNotifWatcher();
  stopShortsObserver();
  stopChatListWatcher();
}

function showApp() {
  if (loadingScreen) loadingScreen.style.display = 'none';
  authScreen.style.display = 'none';
  appScreen.classList.add('show');
  setActiveNav('home');
  renderPage('home');
  startChatListWatcher();
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
    stopShortsObserver();
    stopChatListWatcher();
    closeChatWindow();
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
    stopShortsObserver();
    stopChatListWatcher();
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
  messages: 'Chats',
  profile:  'Profile'
};

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    viewingUserId = null;
    stopShortsObserver();
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
  } else if (page === 'home') {
    renderHomeFeed();
  } else if (page === 'shorts') {
    renderShortsFeed();
  } else if (page === 'messages') {
    renderChatsPage();
  } else if (page === 'notifications') {
    renderNotifications();
  } else if (page === 'search') {
    renderSearch();
  } else if (page === 'upload') {
    content.innerHTML = `
      <div class="page-placeholder">
        <div class="page-title">${pages[page]}</div>
      </div>`;
  }
}

/* ============================================================
   HOME FEED
   ============================================================ */
async function renderHomeFeed() {
  content.innerHTML = `
    <div class="home-feed">
      <div class="feed-empty">
        <div class="page-title">Loading feed...</div>
      </div>
    </div>
  `;

  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, limit(50));
    const snap = await getDocs(q);

    if (snap.empty) {
      content.innerHTML = `
        <div class="feed-empty">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <h3>No posts yet</h3>
          <p>Be the first to upload a video!</p>
        </div>`;
      return;
    }

    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    posts.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });

    const wrap = document.createElement('div');
    wrap.className = 'home-feed';

    posts.forEach(post => {
      wrap.appendChild(makeFeedPost(post));
    });

    content.innerHTML = '';
    content.appendChild(wrap);

    setupFeedAutoplay();

  } catch (e) {
    console.error('Home feed error:', e);
    content.innerHTML = `
      <div class="feed-empty">
        <h3>Could not load feed</h3>
        <p>Please try again later</p>
      </div>`;
  }
}

function makeFeedPost(post) {
  const postEl = document.createElement('div');
  postEl.className = 'feed-post';
  postEl.dataset.postId = post.id;

  const avatar = post.userPhoto || defaultAvatar(post.userName);
  const isLiked = (post.likes || []).includes(currentUser.uid);
  const likesCount = (post.likes || []).length;
  const commentsCount = (post.comments || []).length;

  let mediaHtml = '';
  if (post.type === 'photo') {
    mediaHtml = `<img src="${post.url}" alt="" loading="lazy">`;
  } else {
    const aspectClass = post.type === 'long' ? 'aspect-16-9' : 'aspect-9-16';
    mediaHtml = `
      <video src="${post.url}"
             class="${aspectClass}"
             controls
             muted
             playsinline
             preload="metadata"
             loop
             style="width:100%;max-height:600px;background:#000;"></video>
    `;
  }

  postEl.innerHTML = `
    <div class="feed-post-header">
      <img src="${avatar}" alt="" data-uid="${post.userId}">
      <div class="info" data-uid="${post.userId}">
        <b>${escapeHtml(post.userName || 'User')}</b>
        <span>@${escapeHtml(post.userHandle || '')}</span>
      </div>
    </div>

    <div class="feed-post-media">
      ${mediaHtml}
      <div class="type-badge-feed">${post.type === 'photo' ? 'PHOTO' : (post.type === 'long' ? 'LONG' : 'SHORT')}</div>
    </div>

    <div class="feed-actions">
      <button class="like-btn ${isLiked ? 'liked' : ''}" data-post="${post.id}">
        <svg viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>${likesCount}</span>
      </button>

      <button class="comment-btn" data-post="${post.id}">
        <svg viewBox="0 0 24 24">
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span>${commentsCount}</span>
      </button>

      <button class="share-btn-feed" data-post="${post.id}">
        <svg viewBox="0 0 24 24">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    </div>

    ${post.caption ? `
      <div class="feed-caption">
        <b>${escapeHtml(post.userHandle || '')}</b>${escapeHtml(post.caption)}
      </div>
    ` : ''}
  `;

  postEl.querySelector('.feed-post-header img').addEventListener('click', () => {
    openUserProfile(post.userId);
  });
  postEl.querySelector('.feed-post-header .info').addEventListener('click', () => {
    openUserProfile(post.userId);
  });

  postEl.querySelector('.like-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleLike(post.id, e.currentTarget);
  });

  postEl.querySelector('.comment-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openComments(post.id, post.caption || 'Comments');
  });

  postEl.querySelector('.share-btn-feed').addEventListener('click', async (e) => {
    e.stopPropagation();
    await sharePost(post);
  });

  return postEl;
}

/* ============================================================
   FEED AUTOPLAY
   ============================================================ */
function setupFeedAutoplay() {
  const videos = document.querySelectorAll('.feed-post-media video');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: [0, 0.6, 1] });

  videos.forEach(v => observer.observe(v));
}

/* ============================================================
   SHORTS FEED
   ============================================================ */
async function renderShortsFeed() {
  content.innerHTML = `
    <div class="shorts-wrap" id="shortsWrap">
      <div class="shorts-empty">
        <div class="page-title">Loading shorts...</div>
      </div>
    </div>
  `;

  const wrap = document.getElementById('shortsWrap');
  if (!wrap) return;

  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('type', '==', 'short'), limit(30));
    const snap = await getDocs(q);

    if (snap.empty) {
      wrap.innerHTML = `
        <div class="shorts-empty">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="5"/>
            <path d="M3 8h6M15 8h6"/>
            <path d="M10 12l5 3-5 3z" fill="currentColor" stroke="none"/>
          </svg>
          <h3>No shorts yet</h3>
          <p>Upload a short video to see it here</p>
        </div>`;
      return;
    }

    const shorts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    shorts.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });

    wrap.innerHTML = '';
    shorts.forEach(short => {
      wrap.appendChild(makeShortItem(short));
    });

    setupShortsAutoplay(wrap);

  } catch (e) {
    console.error('Shorts error:', e);
    wrap.innerHTML = `
      <div class="shorts-empty">
        <h3>Could not load shorts</h3>
        <p>Please try again later</p>
      </div>`;
  }
}

function makeShortItem(short) {
  const item = document.createElement('div');
  item.className = 'short-item';
  item.dataset.postId = short.id;

  const avatar = short.userPhoto || defaultAvatar(short.userName);
  const isLiked = (short.likes || []).includes(currentUser.uid);
  const likesCount = (short.likes || []).length;
  const commentsCount = (short.comments || []).length;

  item.innerHTML = `
    <video src="${short.url}"
           loop
           muted
           playsinline
           preload="metadata"
           style="width:100%;height:100%;object-fit:contain;background:#000;"></video>

    <div class="short-overlay">
      <div class="short-bottom-info">
        <div class="short-user-block">
          <div class="short-user-row">
            <img src="${avatar}" alt="" data-uid="${short.userId}">
            <div>
              <b>${escapeHtml(short.userName || 'User')}</b>
              <span>@${escapeHtml(short.userHandle || '')}</span>
            </div>
          </div>
          ${short.caption ? `<div class="short-caption">${escapeHtml(short.caption)}</div>` : ''}
        </div>

        <div class="short-side-actions">
          <button class="like-btn ${isLiked ? 'liked' : ''}" data-post="${short.id}">
            <svg viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>${likesCount}</span>
          </button>

          <button class="comment-btn" data-post="${short.id}">
            <svg viewBox="0 0 24 24">
              <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            <span>${commentsCount}</span>
          </button>

          <button class="share-btn-short" data-post="${short.id}">
            <svg viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const userImg = item.querySelector('.short-user-row img');
  if (userImg) {
    userImg.addEventListener('click', () => openUserProfile(short.userId));
  }

  item.querySelector('.like-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleLike(short.id, e.currentTarget);
  });

  item.querySelector('.comment-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openComments(short.id, short.caption || 'Comments');
  });

  item.querySelector('.share-btn-short').addEventListener('click', async (e) => {
    e.stopPropagation();
    await sharePost(short);
  });

  return item;
}

function setupShortsAutoplay(wrap) {
  stopShortsObserver();

  const videos = wrap.querySelectorAll('.short-item video');

  shortsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: [0, 0.6, 1] });

  videos.forEach(v => shortsObserver.observe(v));
}

function stopShortsObserver() {
  if (shortsObserver) {
    shortsObserver.disconnect();
    shortsObserver = null;
  }
  document.querySelectorAll('.short-item video').forEach(v => {
    try { v.pause(); } catch (e) {}
  });
}

/* ============================================================
   LIKE SYSTEM (posts)
   ============================================================ */
async function toggleLike(postId, btnEl) {
  if (!currentUser) return;

  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) return;

    const postData = postSnap.data();
    const likes = postData.likes || [];
    const isLiked = likes.includes(currentUser.uid);

    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
    }

    const newCount = isLiked ? likes.length - 1 : likes.length + 1;
    const countSpan = btnEl.querySelector('span');
    if (countSpan) countSpan.textContent = newCount;

    btnEl.classList.toggle('liked', !isLiked);

    btnEl.style.transform = 'scale(1.3)';
    setTimeout(() => { btnEl.style.transform = ''; }, 200);

  } catch (e) {
    console.error('Like error:', e);
  }
}

/* ============================================================
   SHARE POST
   ============================================================ */
async function sharePost(post) {
  const appUrl = window.location.origin;
  const shareText = `🎬 Check out this post on ReelHub!\n\n@${post.userHandle}\n\n${appUrl}`;
  const shareTitle = `ReelHub Post`;

  if (navigator.share) {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: appUrl });
      return;
    } catch (err) { if (err.name === 'AbortError') return; }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    showToast('✅ Link copied!');
  } catch (err) {
    showToast('❌ Could not share');
  }
}

/* ============================================================
   COMMENTS SYSTEM
   ============================================================ */
async function openComments(postId, title) {
  if (!currentUser) return;

  activeCommentPostId = postId;
  activeReplyTo = null;
  allCommentsForPost = [];

  commentsTitle.textContent = title || 'Comments';

  const myAvatar = currentProfile?.photo || defaultAvatar(currentProfile?.name || '?');
  myAvatarForComment.src = myAvatar;

  commentInput.value = '';
  postCommentBtn.disabled = true;

  hideReplyIndicator();

  commentsList.innerHTML = `<div class="empty-msg">Loading comments...</div>`;

  commentsModal.classList.add('show');

  await loadComments();
}

document.getElementById('closeComments').addEventListener('click', () => {
  commentsModal.classList.remove('show');
  activeCommentPostId = null;
  activeReplyTo = null;
});

commentsModal.addEventListener('click', (e) => {
  if (e.target === commentsModal) {
    commentsModal.classList.remove('show');
    activeCommentPostId = null;
    activeReplyTo = null;
  }
});

async function loadComments() {
  if (!activeCommentPostId) return;

  try {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('postId', '==', activeCommentPostId));
    const snap = await getDocs(q);

    const allComments = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const topLevel = allComments.filter(c => !c.parentId);
    const replies = allComments.filter(c => c.parentId);

    topLevel.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return ta - tb;
    });

    topLevel.forEach(c => {
      c.replies = replies
        .filter(r => r.parentId === c.id)
        .sort((a, b) => {
          const ta = a.createdAt?.toDate?.()?.getTime() || 0;
          const tb = b.createdAt?.toDate?.()?.getTime() || 0;
          return ta - tb;
        });
    });

    allCommentsForPost = topLevel;

    paintComments(topLevel);

  } catch (e) {
    console.error('Load comments error:', e);
    commentsList.innerHTML = `<div class="comments-empty">Could not load comments</div>`;
  }
}

function paintComments(comments) {
  if (comments.length === 0) {
    commentsList.innerHTML = `
      <div class="comments-empty">
        <svg viewBox="0 0 24 24">
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <div>No comments yet</div>
        <div style="font-size:12px;color:#444;margin-top:6px;">Be the first to comment!</div>
      </div>`;
    return;
  }

  commentsList.innerHTML = '';
  comments.forEach(comment => {
    commentsList.appendChild(makeCommentItem(comment, false));
  });
}

function makeCommentItem(comment, isReply) {
  const item = document.createElement('div');
  item.className = isReply ? 'comment-item reply-item' : 'comment-item';
  item.dataset.commentId = comment.id;

  const avatar = comment.userPhoto || defaultAvatar(comment.userName);
  const isLiked = (comment.likes || []).includes(currentUser.uid);
  const likesCount = (comment.likes || []).length;
  const isOwner = comment.userId === currentUser.uid;

  const time = comment.createdAt?.toDate?.();
  const timeStr = time ? timeAgo(time) : 'just now';

  let replyToHtml = '';
  if (comment.replyToHandle) {
    replyToHtml = `<span class="mention">@${escapeHtml(comment.replyToHandle)}</span> `;
  }

  let repliesHtml = '';
  if (!isReply && comment.replies && comment.replies.length > 0) {
    repliesHtml = `
      <div class="replies-wrap">
        <button class="replies-toggle" data-toggle="${comment.id}">
          <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          <span>View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}</span>
        </button>
        <div class="replies-list replies-hidden" data-replies="${comment.id}"></div>
      </div>
    `;
  }

  item.innerHTML = `
    <div class="comment-main">
      <img class="comment-avatar" src="${avatar}" alt="" data-uid="${comment.userId}">
      <div class="comment-content">
        <div class="comment-top">
          <span class="comment-name" data-uid="${comment.userId}">${escapeHtml(comment.userName || 'User')}</span>
          <span class="comment-time">${timeStr}</span>
        </div>
        <div class="comment-text">${replyToHtml}${escapeHtml(comment.text || '')}</div>
        <div class="comment-actions-row">
          <button class="comment-action-btn like-btn ${isLiked ? 'liked' : ''}" data-comment="${comment.id}">
            <svg viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="comment-like-count">${likesCount > 0 ? likesCount : ''}</span>
          </button>

          ${!isReply ? `
            <button class="comment-action-btn reply-btn" data-comment="${comment.id}" data-user="${escapeHtml(comment.userName)}" data-handle="${escapeHtml(comment.userHandle)}">
              <svg viewBox="0 0 24 24">
                <polyline points="9 17 4 12 9 7"/>
                <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
              </svg>
              Reply
            </button>
          ` : ''}

          ${isOwner ? `
            <button class="comment-delete-btn" data-comment="${comment.id}" title="Delete">🗑️</button>
          ` : ''}
        </div>
      </div>
    </div>
    ${repliesHtml}
  `;

  item.querySelector('.comment-avatar')?.addEventListener('click', () => {
    openUserProfile(comment.userId);
  });
  item.querySelector('.comment-name')?.addEventListener('click', () => {
    openUserProfile(comment.userId);
  });

  item.querySelector('.like-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleCommentLike(comment.id, e.currentTarget);
  });

  const replyBtn = item.querySelector('.reply-btn');
  if (replyBtn) {
    replyBtn.addEventListener('click', () => {
      showReplyIndicator(comment.id, comment.userName, comment.userHandle);
    });
  }

  const deleteBtn = item.querySelector('.comment-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Delete this comment?')) return;
      await deleteComment(comment.id);
    });
  }

  const toggleBtn = item.querySelector('.replies-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const repliesList = item.querySelector('.replies-list');
      const isHidden = repliesList.classList.contains('replies-hidden');

      if (isHidden) {
        repliesList.innerHTML = '';
        (comment.replies || []).forEach(reply => {
          repliesList.appendChild(makeCommentItem(reply, true));
        });
        repliesList.classList.remove('replies-hidden');
        toggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
          <span>Hide ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}</span>
        `;
      } else {
        repliesList.classList.add('replies-hidden');
        toggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          <span>View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}</span>
        `;
      }
    });
  }

  return item;
}

/* ============================================================
   COMMENT INPUT
   ============================================================ */
commentInput.addEventListener('input', () => {
  postCommentBtn.disabled = !commentInput.value.trim();
});

postCommentBtn.addEventListener('click', async () => {
  const text = commentInput.value.trim();
  if (!text || !activeCommentPostId || !currentUser) return;

  postCommentBtn.disabled = true;
  postCommentBtn.textContent = '...';

  try {
    const commentData = {
      postId: activeCommentPostId,
      userId: currentUser.uid,
      userName: currentProfile?.name || 'User',
      userHandle: currentProfile?.user || '',
      userPhoto: currentProfile?.photo || '',
      text: text,
      likes: [],
      parentId: activeReplyTo ? activeReplyTo.commentId : null,
      replyToUser: activeReplyTo ? activeReplyTo.userName : null,
      replyToHandle: activeReplyTo ? activeReplyTo.userHandle : null,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'comments'), commentData);

    try {
      const postRef = doc(db, 'posts', activeCommentPostId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const comments = postSnap.data().comments || [];
        await updateDoc(postRef, { comments: [...comments, 'new'] });
      }
    } catch (e) {}

    commentInput.value = '';
    hideReplyIndicator();
    postCommentBtn.textContent = 'Post';
    postCommentBtn.disabled = true;

    await loadComments();

  } catch (e) {
    console.error('Post comment error:', e);
    showToast('❌ Could not post comment');
    postCommentBtn.textContent = 'Post';
    postCommentBtn.disabled = false;
  }
});

/* ============================================================
   REPLY INDICATOR
   ============================================================ */
function showReplyIndicator(commentId, userName, userHandle) {
  activeReplyTo = { commentId, userName, userHandle };
  replyIndicatorText.textContent = `Replying to @${userHandle}`;
  replyIndicator.classList.add('show');
  replyIndicator.style.display = 'flex';
  commentInput.focus();
  commentInput.placeholder = `Reply to @${userHandle}...`;
}

function hideReplyIndicator() {
  activeReplyTo = null;
  replyIndicator.classList.remove('show');
  replyIndicator.style.display = 'none';
  commentInput.placeholder = 'Add a comment...';
}

cancelReplyBtn.addEventListener('click', () => {
  hideReplyIndicator();
});

/* ============================================================
   COMMENT LIKE
   ============================================================ */
async function toggleCommentLike(commentId, btnEl) {
  if (!currentUser) return;

  try {
    const ref = doc(db, 'comments', commentId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    const likes = data.likes || [];
    const isLiked = likes.includes(currentUser.uid);

    if (isLiked) {
      await updateDoc(ref, { likes: arrayRemove(currentUser.uid) });
    } else {
      await updateDoc(ref, { likes: arrayUnion(currentUser.uid) });
    }

    const newCount = isLiked ? likes.length - 1 : likes.length + 1;
    const countEl = btnEl.querySelector('.comment-like-count');
    if (countEl) countEl.textContent = newCount > 0 ? newCount : '';

    btnEl.classList.toggle('liked', !isLiked);

    btnEl.style.transform = 'scale(1.2)';
    setTimeout(() => { btnEl.style.transform = ''; }, 180);

  } catch (e) {
    console.error('Comment like error:', e);
  }
}

/* ============================================================
   DELETE COMMENT
   ============================================================ */
async function deleteComment(commentId) {
  try {
    await deleteDoc(doc(db, 'comments', commentId));

    const repliesQ = query(
      collection(db, 'comments'),
      where('parentId', '==', commentId)
    );
    const repliesSnap = await getDocs(repliesQ);

    for (const replyDoc of repliesSnap.docs) {
      await deleteDoc(doc(db, 'comments', replyDoc.id));
    }

    showToast('Comment deleted');
    await loadComments();

  } catch (e) {
    console.error('Delete comment error:', e);
    showToast('❌ Could not delete comment');
  }
}

/* ============================================================
   CHATS LIST PAGE
   ============================================================ */
async function renderChatsPage() {
  content.innerHTML = `
    <div class="chats-page">
      <div class="chats-header">
        <div class="chats-title">Chats</div>
        <button class="new-chat-btn" id="openNewChatBtn" title="New chat">
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      <div class="chats-list" id="chatsList">
        <div class="empty-msg">Loading chats...</div>
      </div>
    </div>
  `;

  document.getElementById('openNewChatBtn').addEventListener('click', openNewChatModal);

  await loadChatsList();
}

async function loadChatsList() {
  const wrap = document.getElementById('chatsList');
  if (!wrap) return;

  try {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('members', 'array-contains', currentUser.uid));
    const snap = await getDocs(q);

    if (snap.empty) {
      wrap.innerHTML = `
        <div class="chats-empty">
          <svg viewBox="0 0 24 24">
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <h3>No chats yet</h3>
          <p>Start a conversation with someone</p>
          <button class="start-btn" id="emptyStartChatBtn">Start New Chat</button>
        </div>`;
      document.getElementById('emptyStartChatBtn').addEventListener('click', openNewChatModal);
      return;
    }

    const chats = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Sort by lastMessageTime desc
    chats.sort((a, b) => {
      const ta = a.lastMessageTime?.toDate?.()?.getTime() || 0;
      const tb = b.lastMessageTime?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });

    // Load other user info for each chat
    const enriched = await Promise.all(chats.map(async (chat) => {
      const otherUid = chat.members.find(m => m !== currentUser.uid);
      if (!otherUid) return null;

      try {
        const userSnap = await getDoc(doc(db, 'users', otherUid));
        if (!userSnap.exists()) return null;
        return { ...chat, otherUser: { uid: otherUid, ...userSnap.data() } };
      } catch (e) {
        return null;
      }
    }));

    const validChats = enriched.filter(c => c);

    if (validChats.length === 0) {
      wrap.innerHTML = `<div class="empty-msg">No valid chats</div>`;
      return;
    }

    wrap.innerHTML = '';
    validChats.forEach(chat => {
      wrap.appendChild(makeChatItem(chat));
    });

  } catch (e) {
    console.error('Load chats error:', e);
    wrap.innerHTML = `<div class="empty-msg">Could not load chats</div>`;
  }
}

function makeChatItem(chat) {
  const item = document.createElement('div');
  item.className = 'chat-item';

  const otherUser = chat.otherUser;
  const avatar = otherUser.photo || defaultAvatar(otherUser.name);
  const time = chat.lastMessageTime?.toDate?.();
  const timeStr = time ? timeAgoShort(time) : '';

  const hasUnread = chat.lastMessageBy !== currentUser.uid &&
                    (chat.unreadBy || []).includes(currentUser.uid);

  let lastMsgHtml = '';
  if (chat.lastMessageType === 'voice') {
    lastMsgHtml = `
      <div class="last-msg voice ${hasUnread ? 'unread' : ''}">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;">
          <rect x="9" y="2" width="6" height="12" rx="3"/>
          <path d="M5 10v2a7 7 0 0 0 14 0v-2"/>
        </svg>
        Voice message
      </div>
    `;
  } else if (chat.lastMessageType === 'photo') {
    lastMsgHtml = `<div class="last-msg ${hasUnread ? 'unread' : ''}">📷 Photo (coming soon)</div>`;
  } else if (chat.lastMessageType === 'pdf') {
    lastMsgHtml = `<div class="last-msg ${hasUnread ? 'unread' : ''}">📄 PDF (coming soon)</div>`;
  } else {
    const preview = (chat.lastMessage || '').substring(0, 40);
    lastMsgHtml = `<div class="last-msg ${hasUnread ? 'unread' : ''}">${escapeHtml(preview)}${chat.lastMessage && chat.lastMessage.length > 40 ? '...' : ''}</div>`;
  }

  item.innerHTML = `
    <img src="${avatar}" alt="">
    <div class="meta">
      <b>${escapeHtml(otherUser.name || 'User')}</b>
      ${lastMsgHtml}
    </div>
    <div class="info">
      <div class="time">${timeStr}</div>
      ${hasUnread ? `<div class="unread-badge">●</div>` : ''}
    </div>
  `;

  item.addEventListener('click', () => {
    openChatWindow(otherUser);
  });

  return item;
}

/* ============================================================
   NEW CHAT MODAL
   ============================================================ */
function openNewChatModal() {
  newChatSearch.value = '';
  newChatResults.innerHTML = `<div class="search-empty">Start typing to search users...</div>`;
  newChatModal.classList.add('show');
  newChatSearch.focus();
}

document.getElementById('closeNewChat').addEventListener('click', () => {
  newChatModal.classList.remove('show');
});

newChatModal.addEventListener('click', (e) => {
  if (e.target === newChatModal) newChatModal.classList.remove('show');
});

let newChatDebounce = null;
newChatSearch.addEventListener('input', (e) => {
  clearTimeout(newChatDebounce);
  newChatDebounce = setTimeout(() => searchUsersForChat(e.target.value.trim()), 300);
});

async function searchUsersForChat(term) {
  if (!term) {
    newChatResults.innerHTML = `<div class="search-empty">Start typing to search users...</div>`;
    return;
  }

  newChatResults.innerHTML = `<div class="search-empty">Searching...</div>`;

  try {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);

    const lowerTerm = term.toLowerCase();
    const matches = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.id !== currentUser.uid)
      .filter(u =>
        (u.name || '').toLowerCase().includes(lowerTerm) ||
        (u.user || '').toLowerCase().includes(lowerTerm)
      )
      .slice(0, 20);

    if (matches.length === 0) {
      newChatResults.innerHTML = `<div class="search-empty">No users found</div>`;
      return;
    }

    newChatResults.innerHTML = '';
    matches.forEach(u => {
      const row = document.createElement('div');
      row.className = 'search-user';
      row.innerHTML = `
        <img src="${u.photo || defaultAvatar(u.name)}" alt="">
        <div class="info">
          <b>${escapeHtml(u.name)}</b>
          <span>@${escapeHtml(u.user)}</span>
        </div>
        <button class="follow">Chat</button>
      `;

      row.addEventListener('click', () => {
        newChatModal.classList.remove('show');
        openChatWindow(u);
      });

      newChatResults.appendChild(row);
    });

  } catch (e) {
    console.error('Search users error:', e);
    newChatResults.innerHTML = `<div class="search-empty">Search failed</div>`;
  }
}

/* ============================================================
   CHAT WINDOW
   ============================================================ */
function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

async function openChatWindow(otherUser) {
  if (!otherUser || otherUser.uid === currentUser.uid) return;

  activeChatId = getChatId(currentUser.uid, otherUser.uid);
  activeChatUser = otherUser;

  // Set header
  chatHeaderAvatar.src = otherUser.photo || defaultAvatar(otherUser.name);
  chatHeaderName.textContent = otherUser.name || 'User';
  chatHeaderHandle.textContent = '@' + (otherUser.user || '');

  chatHeaderInfo.addEventListener('click', () => {
    closeChatWindow();
    openUserProfile(otherUser.uid);
  }, { once: false });

  // Clear messages
  chatMessages.innerHTML = `<div class="empty-msg">Loading messages...</div>`;

  // Reset input
  chatMessageInput.value = '';
  updateSendTextBtn();

  chatWindowModal.classList.add('show');

  // Load messages + start realtime
  await loadChatMessages();

  // Mark as read
  await markChatRead();
}

function closeChatWindow() {
  chatWindowModal.classList.remove('show');
  if (chatMessagesUnsub) {
    chatMessagesUnsub();
    chatMessagesUnsub = null;
  }
  activeChatId = null;
  activeChatUser = null;
  stopVoicePlayback();
}

document.getElementById('closeChatWindow').addEventListener('click', () => {
  closeChatWindow();
});

async function loadChatMessages() {
  if (!activeChatId) return;

  try {
    const msgsRef = collection(db, 'chats', activeChatId, 'messages');
    const snap = await getDocs(msgsRef);

    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    messages.sort((a, b) => {
      const ta = a.time?.toDate?.()?.getTime() || 0;
      const tb = b.time?.toDate?.()?.getTime() || 0;
      return ta - tb;
    });

    paintChatMessages(messages);

    // Simple polling refresh (since onSnapshot import is not added)
    if (chatMessagesUnsub) clearInterval(chatMessagesUnsub);
    chatMessagesUnsub = setInterval(async () => {
      if (!activeChatId) return;
      try {
        const s = await getDocs(collection(db, 'chats', activeChatId, 'messages'));
        const msgs = s.docs.map(d => ({ id: d.id, ...d.data() }));
        msgs.sort((a, b) => {
          const ta = a.time?.toDate?.()?.getTime() || 0;
          const tb = b.time?.toDate?.()?.getTime() || 0;
          return ta - tb;
        });
        paintChatMessages(msgs);
      } catch (e) {}
    }, 3000);

  } catch (e) {
    console.error('Load chat messages error:', e);
    chatMessages.innerHTML = `<div class="chat-empty">Could not load messages</div>`;
  }
}

function paintChatMessages(messages) {
  if (messages.length === 0) {
    chatMessages.innerHTML = `<div class="chat-empty">No messages yet<br>Say hi! 👋</div>`;
    return;
  }

  // Save scroll position check
  const wasAtBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 100;

  chatMessages.innerHTML = '';

  let lastDateStr = '';
  messages.forEach(msg => {
    const msgDate = msg.time?.toDate?.();
    const dateStr = msgDate ? formatDate(msgDate) : '';
    if (dateStr && dateStr !== lastDateStr) {
      const sep = document.createElement('div');
      sep.className = 'msg-date-sep';
      sep.textContent = dateStr;
      chatMessages.appendChild(sep);
      lastDateStr = dateStr;
    }
    chatMessages.appendChild(makeMessageBubble(msg));
  });

  if (wasAtBottom || messages.length > 0) {
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
  }
}

function makeMessageBubble(msg) {
  const row = document.createElement('div');
  const isMe = msg.from === currentUser.uid;
  row.className = 'msg-row ' + (isMe ? 'me' : 'other');

  const time = msg.time?.toDate?.();
  const timeStr = time ? formatTime(time) : '';

  if (msg.type === 'voice') {
    const duration = msg.voiceDuration || 0;
    const bars = generateWaveformBars();

    row.innerHTML = `
      <div class="msg-bubble voice-bubble" data-msg="${msg.id}">
        <button class="voice-play-btn" data-play="${msg.id}">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>
        </button>
        <div class="voice-waveform">
          ${bars.map(h => `<div class="bar" style="height:${h}%"></div>`).join('')}
        </div>
        <div class="voice-duration">${formatVoiceDuration(duration)}</div>
        <div class="msg-time" style="position:absolute;bottom:-14px;right:0;">${timeStr}</div>
      </div>
    `;

    row.querySelector('.voice-play-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      await playVoiceMessage(msg, row.querySelector('.voice-waveform'), row.querySelector('.voice-play-btn'));
    });

  } else {
    row.innerHTML = `
      <div class="msg-bubble">
        ${escapeHtml(msg.text || '')}
        <div class="msg-time">${timeStr}</div>
      </div>
    `;
  }

  return row;
}

function generateWaveformBars() {
  // Random-looking bars but deterministic-ish
  const bars = [];
  for (let i = 0; i < 22; i++) {
    bars.push(30 + Math.floor(Math.random() * 70));
  }
  return bars;
}

function formatVoiceDuration(seconds) {
  const s = Math.round(seconds);
  return `0:${s < 10 ? '0' + s : s}`;
}

function formatTime(date) {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
}

function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/* ============================================================
   SEND TEXT MESSAGE
   ============================================================ */
function updateSendTextBtn() {
  const hasText = chatMessageInput.value.trim().length > 0;
  sendTextBtn.style.display = hasText ? 'flex' : 'none';
  micBtn.style.display = hasText ? 'none' : 'flex';
}

chatMessageInput.addEventListener('input', updateSendTextBtn);

sendTextBtn.addEventListener('click', async () => {
  const text = chatMessageInput.value.trim();
  if (!text || !activeChatId) return;

  chatMessageInput.value = '';
  updateSendTextBtn();

  await sendMessage({
    type: 'text',
    text: text
  });
});

chatMessageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendTextBtn.click();
  }
});

async function sendMessage(msgData) {
  if (!activeChatId || !activeChatUser) return;

  const message = {
    from: currentUser.uid,
    to: activeChatUser.uid,
    type: msgData.type || 'text',
    text: msgData.text || null,
    voiceData: msgData.voiceData || null,
    voiceDuration: msgData.voiceDuration || null,
    time: serverTimestamp(),
    read: false
  };

  try {
    await addDoc(collection(db, 'chats', activeChatId, 'messages'), message);

    // Update chat metadata
    const chatRef = doc(db, 'chats', activeChatId);
    const chatSnap = await getDoc(chatRef);

    const chatData = {
      members: [currentUser.uid, activeChatUser.uid],
      lastMessage: msgData.type === 'voice' ? '🎤 Voice message' : (msgData.text || ''),
      lastMessageType: msgData.type || 'text',
      lastMessageTime: serverTimestamp(),
      lastMessageBy: currentUser.uid,
      unreadBy: [activeChatUser.uid]
    };

    if (!chatSnap.exists()) {
      chatData.createdAt = serverTimestamp();
      await setDoc(chatRef, chatData);
    } else {
      await updateDoc(chatRef, chatData);
    }

    // Reload messages
    await loadChatMessages();

  } catch (e) {
    console.error('Send message error:', e);
    showToast('❌ Could not send message');
  }
}

/* ============================================================
   MARK CHAT READ
   ============================================================ */
async function markChatRead() {
  if (!activeChatId) return;
  try {
    const chatRef = doc(db, 'chats', activeChatId);
    await updateDoc(chatRef, { unreadBy: arrayRemove(currentUser.uid) });
    // Update chat list dot
    checkChatsUnread();
  } catch (e) {}
}

/* ============================================================
   VOICE RECORDING
   ============================================================ */
let isHoldingMic = false;

micBtn.addEventListener('mousedown', startVoiceRecording);
micBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startVoiceRecording(); }, { passive: false });

micBtn.addEventListener('mouseup', stopVoiceRecordingAndSend);
micBtn.addEventListener('mouseleave', () => { if (isRecording) stopVoiceRecordingAndSend(); });
micBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopVoiceRecordingAndSend(); }, { passive: false });

cancelRecordingBtn.addEventListener('click', cancelVoiceRecording);

async function startVoiceRecording() {
  if (isRecording) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    let mimeType = 'audio/webm';
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/mp4';
    }

    mediaRecorder = new MediaRecorder(stream, { mimeType });
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.start();

    isRecording = true;
    voiceSeconds = 0;
    recordingTimer.textContent = '0:00';
    recordingIndicator.classList.add('show');
    recordingIndicator.style.display = 'flex';
    micBtn.style.background = '#ff2e63';

    voiceTimerInterval = setInterval(() => {
      voiceSeconds++;
      recordingTimer.textContent = `0:${voiceSeconds < 10 ? '0' + voiceSeconds : voiceSeconds}`;

      if (voiceSeconds >= 10) {
        stopVoiceRecordingAndSend();
      }
    }, 1000);

  } catch (e) {
    console.error('Mic error:', e);
    showToast('❌ Microphone permission needed');
    isRecording = false;
  }
}

async function stopVoiceRecordingAndSend() {
  if (!isRecording || !mediaRecorder) return;

  isRecording = false;
  clearInterval(voiceTimerInterval);
  recordingIndicator.classList.remove('show');
  recordingIndicator.style.display = 'none';
  micBtn.style.background = '';
  micBtn.style.background = 'linear-gradient(90deg,#ff2e63,#ff8a00)';

  const finalSeconds = voiceSeconds;

  return new Promise((resolve) => {
    mediaRecorder.onstop = async () => {
      // Stop all tracks
      mediaRecorder.stream.getTracks().forEach(t => t.stop());

      if (finalSeconds < 1) {
        showToast('Too short — hold longer');
        resolve();
        return;
      }

      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });

      // Check size — should be small for 10 sec
      if (audioBlob.size > 500 * 1024) {
        showToast('Voice too large');
        resolve();
        return;
      }

      // Convert to base64
      const base64 = await blobToBase64(audioBlob);

      await sendMessage({
        type: 'voice',
        voiceData: base64,
        voiceDuration: finalSeconds
      });

      resolve();
    };

    try {
      mediaRecorder.stop();
    } catch (e) {
      resolve();
    }
  });
}

function cancelVoiceRecording() {
  if (!isRecording || !mediaRecorder) return;

  isRecording = false;
  clearInterval(voiceTimerInterval);
  recordingIndicator.classList.remove('show');
  recordingIndicator.style.display = 'none';
  micBtn.style.background = 'linear-gradient(90deg,#ff2e63,#ff8a00)';

  try {
    mediaRecorder.onstop = () => {
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
    };
    mediaRecorder.stop();
  } catch (e) {}

  audioChunks = [];
  voiceSeconds = 0;
  showToast('Recording cancelled');
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/* ============================================================
   VOICE PLAYBACK
   ============================================================ */
async function playVoiceMessage(msg, waveformEl, btnEl) {
  // If already playing this one → stop
  if (currentPlayingAudio && currentPlayingBtn === btnEl) {
    stopVoicePlayback();
    return;
  }

  stopVoicePlayback();

  if (!msg.voiceData) return;

  try {
    const audio = new Audio(msg.voiceData);
    currentPlayingAudio = audio;
    currentPlayingBtn = btnEl;

    waveformEl.classList.add('playing');

    btnEl.innerHTML = `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"/></svg>`;

    audio.onended = () => {
      stopVoicePlayback();
    };

    audio.onerror = () => {
      stopVoicePlayback();
      showToast('❌ Could not play');
    };

    await audio.play();

  } catch (e) {
    console.error('Play error:', e);
    stopVoicePlayback();
  }
}

function stopVoicePlayback() {
  if (currentPlayingAudio) {
    try { currentPlayingAudio.pause(); } catch (e) {}
    currentPlayingAudio = null;
  }

  if (currentPlayingBtn) {
    currentPlayingBtn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>`;
    currentPlayingBtn = null;
  }

  document.querySelectorAll('.voice-waveform.playing').forEach(el => {
    el.classList.remove('playing');
  });
}

/* ============================================================
   CHAT LIST WATCHER (unread badge)
   ============================================================ */
function startChatListWatcher() {
  stopChatListWatcher();
  checkChatsUnread();
  chatListInterval = setInterval(checkChatsUnread, 15000);
}

function stopChatListWatcher() {
  if (chatListInterval) {
    clearInterval(chatListInterval);
    chatListInterval = null;
  }
  if (chatsDot) chatsDot.style.display = 'none';
}

async function checkChatsUnread() {
  if (!currentUser) return;
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('members', 'array-contains', currentUser.uid));
    const snap = await getDocs(q);

    let hasUnread = false;
    snap.forEach(d => {
      const data = d.data();
      if (data.lastMessageBy !== currentUser.uid &&
          (data.unreadBy || []).includes(currentUser.uid)) {
        hasUnread = true;
      }
    });

    if (chatsDot) chatsDot.style.display = hasUnread ? 'block' : 'none';

  } catch (e) {}
}

/* ============================================================
   TIME HELPERS
   ============================================================ */
function timeAgoShort(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return mins + 'm';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd';
  const weeks = Math.floor(days / 7);
  return weeks + 'w';
}