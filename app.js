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
   CLOUDINARY — s3eresx6 account
   ============================================================ */
const CLOUDINARY_ACCOUNTS = [
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

// Stories
const storyUploadModal = document.getElementById('storyUploadModal');
const storyFileInput = document.getElementById('storyFileInput');
const storyPickerWrap = document.getElementById('storyPickerWrap');
const storyPickerTitle = document.getElementById('storyPickerTitle');
const storyPickerSubtitle = document.getElementById('storyPickerSubtitle');
const storyPickerLabel = document.getElementById('storyPickerLabel');
const storyPreviewWrap = document.getElementById('storyPreviewWrap');
const storyPreviewImg = document.getElementById('storyPreviewImg');
const storyVideoPreviewWrap = document.getElementById('storyVideoPreviewWrap');
const storyPreviewVideo = document.getElementById('storyPreviewVideo');
const storyPreviewInfo = document.getElementById('storyPreviewInfo');
const storySubmitBtn = document.getElementById('storySubmitBtn');
const storyUploadMsg = document.getElementById('storyUploadMsg');
const storyProgressWrap = document.getElementById('storyProgressWrap');
const storyProgressBar = document.getElementById('storyProgressBar');
const storyProgressText = document.getElementById('storyProgressText');

const storyViewer = document.getElementById('storyViewer');
const storyProgressBars = document.getElementById('storyProgressBars');
const storyUserAvatar = document.getElementById('storyUserAvatar');
const storyUserName = document.getElementById('storyUserName');
const storyTime = document.getElementById('storyTime');
const storyDeleteBtn = document.getElementById('storyDeleteBtn');
const storyCloseBtn = document.getElementById('storyCloseBtn');
const storyMedia = document.getElementById('storyMedia');
const storyTapLeft = document.getElementById('storyTapLeft');
const storyTapRight = document.getElementById('storyTapRight');

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
let activeChatId = null;
let activeChatUser = null;
let chatMessagesUnsub = null;
let chatListInterval = null;

// Voice state
let mediaRecorder = null;
let audioChunks = [];
let voiceTimerInterval = null;
let voiceSeconds = 0;
let isRecording = false;
let currentPlayingAudio = null;
let currentPlayingBtn = null;

// Story state
let currentStoryType = 'photo';
let currentStoryFile = null;
let currentStoryVideoDuration = 0;
let storiesByUser = [];
let currentStoryUserIndex = 0;
let currentStoryIndex = 0;
let storyProgressInterval = null;
let storyAutoAdvanceTimeout = null;
let currentStoryMediaEl = null;

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
   HOME FEED (with Stories Bar)
   ============================================================ */
async function renderHomeFeed() {
  content.innerHTML = `
    <div class="home-feed">
      <div class="stories-bar" id="storiesBar">
        <div class="story-item" id="addStoryBtn">
          <div class="story-ring add">
            <div class="plus-icon">
              <svg viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
          </div>
          <div class="story-name you">Your story</div>
        </div>
      </div>
      <div id="feedContainer">
        <div class="feed-empty">
          <div class="page-title">Loading feed...</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('addStoryBtn').addEventListener('click', openStoryUploadModal);

  await loadStoriesBar();
  await loadHomeFeedPosts();
}

async function loadHomeFeedPosts() {
  const container = document.getElementById('feedContainer');
  if (!container) return;

  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, limit(50));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `
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

    container.innerHTML = '';
    posts.forEach(post => {
      container.appendChild(makeFeedPost(post));
    });

    setupFeedAutoplay();

  } catch (e) {
    console.error('Home feed error:', e);
    container.innerHTML = `
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
   STORY BAR LOAD
   ============================================================ */
async function loadStoriesBar() {
  const bar = document.getElementById('storiesBar');
  if (!bar) return;

  // Remove existing story items (keep Add button)
  bar.querySelectorAll('.story-item:not(#addStoryBtn)').forEach(el => el.remove());

  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, limit(100));
    const snap = await getDocs(q);

    const allStories = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Filter by 24 hours
    const validStories = allStories.filter(s => {
      const t = s.createdAt?.toDate?.();
      return t && t.getTime() > cutoffTime.getTime();
    });

    if (validStories.length === 0) return;

    // Group by user
    const grouped = {};
    validStories.forEach(s => {
      if (!grouped[s.userId]) {
        grouped[s.userId] = {
          userId: s.userId,
          userName: s.userName,
          userHandle: s.userHandle,
          userPhoto: s.userPhoto,
          stories: []
        };
      }
      grouped[s.userId].stories.push(s);
    });

    // Sort each user's stories by time (oldest first)
    Object.values(grouped).forEach(u => {
      u.stories.sort((a, b) => {
        const ta = a.createdAt?.toDate?.()?.getTime() || 0;
        const tb = b.createdAt?.toDate?.()?.getTime() || 0;
        return ta - tb;
      });
    });

    // Convert to array + sort (own story first, then by latest)
    const userArray = Object.values(grouped);
    userArray.sort((a, b) => {
      // Own story first
      if (a.userId === currentUser.uid) return -1;
      if (b.userId === currentUser.uid) return 1;
      // Then by latest story time desc
      const ta = a.stories[a.stories.length-1].createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.stories[b.stories.length-1].createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });

    storiesByUser = userArray;

    // Render
    userArray.forEach(userGroup => {
      const item = document.createElement('div');
      item.className = 'story-item';

      const allViewed = userGroup.stories.every(s => (s.viewers || []).includes(currentUser.uid));
      const avatar = userGroup.userPhoto || defaultAvatar(userGroup.userName);

      item.innerHTML = `
        <div class="story-ring ${allViewed ? 'viewed' : ''}">
          <img src="${avatar}" alt="">
        </div>
        <div class="story-name ${userGroup.userId === currentUser.uid ? 'you' : ''}">
          ${userGroup.userId === currentUser.uid ? 'Your story' : escapeHtml(userGroup.userName)}
        </div>
      `;

      item.addEventListener('click', () => {
        openStoryViewer(userGroup.userId);
      });

      bar.appendChild(item);
    });

  } catch (e) {
    console.error('Load stories bar error:', e);
  }
}

/* ============================================================
   STORY UPLOAD MODAL
   ============================================================ */
function openStoryUploadModal() {
  currentStoryType = 'photo';
  currentStoryFile = null;
  currentStoryVideoDuration = 0;

  storyFileInput.value = '';
  storyPreviewImg.src = '';
  storyPreviewVideo.src = '';
  storyPreviewWrap.style.display = 'none';
  storyVideoPreviewWrap.style.display = 'none';
  storyPickerWrap.style.display = 'flex';
  storySubmitBtn.disabled = true;
  storyUploadMsg.textContent = '';
  storyProgressWrap.style.display = 'none';
  storyProgressBar.style.width = '0%';
  storyProgressText.textContent = '0%';

  document.querySelectorAll('.story-upload-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.story-upload-tab[data-type="photo"]').classList.add('active');

  updateStoryPickerText();
  storyUploadModal.classList.add('show');
}

function updateStoryPickerText() {
  if (currentStoryType === 'photo') {
    storyPickerTitle.textContent = 'Choose a photo';
    storyPickerSubtitle.textContent = 'JPG / PNG · Max 5 MB';
    storyPickerLabel.textContent = 'Select photo';
    storyFileInput.accept = 'image/*';
  } else {
    storyPickerTitle.textContent = 'Choose a video';
    storyPickerSubtitle.textContent = 'Max 15 sec · Up to 20 MB';
    storyPickerLabel.textContent = 'Select video';
    storyFileInput.accept = 'video/*';
  }
}

document.getElementById('closeStoryUpload').addEventListener('click', () => {
  storyUploadModal.classList.remove('show');
});

storyUploadModal.addEventListener('click', (e) => {
  if (e.target === storyUploadModal) storyUploadModal.classList.remove('show');
});

document.querySelectorAll('.story-upload-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.story-upload-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentStoryType = tab.dataset.type;

    currentStoryFile = null;
    currentStoryVideoDuration = 0;
    storyFileInput.value = '';
    storyPreviewImg.src = '';
    storyPreviewVideo.src = '';
    storyPreviewWrap.style.display = 'none';
    storyVideoPreviewWrap.style.display = 'none';
    storyPickerWrap.style.display = 'flex';
    storySubmitBtn.disabled = true;
    storyUploadMsg.textContent = '';

    updateStoryPickerText();
  });
});

storyFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  storyUploadMsg.className = 'error-msg';
  storyUploadMsg.textContent = '';

  if (currentStoryType === 'photo') {
    if (!file.type.startsWith('image/')) {
      storyUploadMsg.textContent = 'Please choose an image file.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      storyUploadMsg.textContent = 'Photo too large. Max 5 MB.';
      return;
    }
    currentStoryFile = file;
    const url = URL.createObjectURL(file);
    storyPreviewImg.src = url;
    storyPreviewWrap.style.display = 'block';
    storyPickerWrap.style.display = 'none';
    storySubmitBtn.disabled = false;
    return;
  }

  // VIDEO
  if (!file.type.startsWith('video/')) {
    storyUploadMsg.textContent = 'Please choose a video file.';
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    storyUploadMsg.textContent = 'Video too large. Max 20 MB.';
    return;
  }

  const url = URL.createObjectURL(file);
  const tempVideo = document.createElement('video');
  tempVideo.preload = 'metadata';
  tempVideo.src = url;

  tempVideo.onloadedmetadata = () => {
    const duration = tempVideo.duration;

    if (!isFinite(duration) || duration <= 0) {
      storyUploadMsg.textContent = 'Could not read video duration.';
      return;
    }

    if (duration > 15.5) {
      storyUploadMsg.textContent = `⚠️ Story video must be max 15 seconds. Yours is ${Math.round(duration)}s.`;
      return;
    }

    currentStoryFile = file;
    currentStoryVideoDuration = duration;

    storyPreviewVideo.src = url;
    storyVideoPreviewWrap.style.display = 'block';
    storyPreviewInfo.textContent = `Duration: ${Math.round(duration)}s · Size: ${(file.size/1024/1024).toFixed(2)} MB`;
    storyPickerWrap.style.display = 'none';
    storySubmitBtn.disabled = false;
  };

  tempVideo.onerror = () => {
    storyUploadMsg.textContent = 'Could not load video.';
  };
});

storySubmitBtn.addEventListener('click', async () => {
  if (!currentUser || !currentProfile) {
    storyUploadMsg.textContent = 'You must be logged in.';
    return;
  }
  if (!currentStoryFile) {
    storyUploadMsg.textContent = 'Please select a file.';
    return;
  }

  storySubmitBtn.disabled = true;
  storySubmitBtn.textContent = 'Uploading...';
  storyUploadMsg.textContent = '';
  storyProgressWrap.style.display = 'block';
  storyProgressBar.style.width = '0%';
  storyProgressText.textContent = '0%';

  try {
    const result = await uploadToCloudinaryStory(currentStoryFile, (percent) => {
      storyProgressBar.style.width = percent + '%';
      storyProgressText.textContent = percent + '%';
    });

    const storyData = {
      userId: currentUser.uid,
      userName: currentProfile.name,
      userHandle: currentProfile.user,
      userPhoto: currentProfile.photo || '',
      type: currentStoryType,
      url: result.secure_url,
      thumbnail: currentStoryType === 'video'
        ? buildThumbnailUrl(result.secure_url, 'video')
        : result.secure_url,
      duration: currentStoryType === 'photo' ? 5 : currentStoryVideoDuration,
      viewers: [],
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'stories'), storyData);

    storyUploadMsg.className = 'success-msg';
    storyUploadMsg.textContent = '✅ Story posted!';

    setTimeout(() => {
      storyUploadModal.classList.remove('show');
      if (document.querySelector('.nav-item[data-page="home"]').classList.contains('active')) {
        renderHomeFeed();
      }
    }, 1200);

  } catch (err) {
    console.error('Story upload failed:', err);
    storyUploadMsg.className = 'error-msg';
    storyUploadMsg.textContent = err.message || 'Story upload failed.';
    storySubmitBtn.disabled = false;
    storySubmitBtn.textContent = 'Share to Story';
  }
});

/* ============================================================
   CLOUDINARY — STORY UPLOAD
   ============================================================ */
function uploadToCloudinaryStory(file, onProgress) {
  return new Promise((resolve, reject) => {
    const resourceType = currentStoryType === 'photo' ? 'image' : 'video';
    const acc = CLOUDINARY_ACCOUNTS[0];

    const url = `https://api.cloudinary.com/v1_1/${acc.cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', acc.preset);
    formData.append('api_key', acc.apiKey);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.timeout = 120000;

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
          if (!res.secure_url) {
            reject(new Error('No URL returned'));
            return;
          }
          resolve(res);
        } catch (e) {
          reject(new Error('Invalid response'));
        }
      } else {
        let errMsg = 'Upload failed';
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.error && errData.error.message) errMsg = errData.error.message;
        } catch (e) { errMsg = 'HTTP ' + xhr.status; }
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Upload timeout'));

    xhr.send(formData);
  });
}

/* ============================================================
   STORY VIEWER
   ============================================================ */
function openStoryViewer(userId) {
  // Find user's index in storiesByUser
  const userIndex = storiesByUser.findIndex(u => u.userId === userId);
  if (userIndex === -1) return;

  currentStoryUserIndex = userIndex;
  currentStoryIndex = 0;

  storyViewer.style.display = 'block';
  document.body.style.overflow = 'hidden';

  renderCurrentStory();
}

function renderCurrentStory() {
  clearStoryTimers();

  const userGroup = storiesByUser[currentStoryUserIndex];
  if (!userGroup) {
    closeStoryViewer();
    return;
  }

  const story = userGroup.stories[currentStoryIndex];
  if (!story) {
    // Move to next user
    if (currentStoryUserIndex < storiesByUser.length - 1) {
      currentStoryUserIndex++;
      currentStoryIndex = 0;
      renderCurrentStory();
    } else {
      closeStoryViewer();
    }
    return;
  }

  // Header
  storyUserAvatar.src = userGroup.userPhoto || defaultAvatar(userGroup.userName);
  storyUserName.textContent = userGroup.userName || 'User';

  const time = story.createdAt?.toDate?.();
  storyTime.textContent = time ? timeAgo(time) : 'just now';

  // Delete button (own story only)
  if (userGroup.userId === currentUser.uid) {
    storyDeleteBtn.style.display = 'block';
  } else {
    storyDeleteBtn.style.display = 'none';
  }

  // Progress bars
  storyProgressBars.innerHTML = '';
  userGroup.stories.forEach((s, idx) => {
    const seg = document.createElement('div');
    seg.className = 'story-progress-segment';
    const fill = document.createElement('div');
    fill.className = 'story-progress-fill';
    if (idx < currentStoryIndex) {
      fill.style.width = '100%';
    }
    seg.appendChild(fill);
    storyProgressBars.appendChild(seg);
  });

  // Media
  storyMedia.innerHTML = '';
  if (story.type === 'photo') {
    const img = document.createElement('img');
    img.src = story.url;
    img.className = 'story-content';
    img.alt = '';
    storyMedia.appendChild(img);
    currentStoryMediaEl = img;
  } else {
    const video = document.createElement('video');
    video.src = story.url;
    video.className = 'story-content';
    video.autoplay = true;
    video.playsInline = true;
    video.muted = false;
    video.loop = false;
    storyMedia.appendChild(video);
    currentStoryMediaEl = video;
  }

  // Mark as viewed
  markStoryViewed(story.id);

  // Start progress
  const duration = (story.type === 'photo' ? 5 : (story.duration || 5)) * 1000;
  startStoryProgress(duration);
}

function startStoryProgress(duration) {
  const fills = storyProgressBars.querySelectorAll('.story-progress-fill');
  const currentFill = fills[currentStoryIndex];
  if (!currentFill) return;

  let startTime = Date.now();
  let elapsed = 0;

  storyProgressInterval = setInterval(() => {
    elapsed = Date.now() - startTime;
    const percent = Math.min((elapsed / duration) * 100, 100);
    currentFill.style.width = percent + '%';

    if (percent >= 100) {
      clearInterval(storyProgressInterval);
      storyProgressInterval = null;
      nextStory();
    }
  }, 50);

  // Auto-advance timeout as backup
  storyAutoAdvanceTimeout = setTimeout(() => {
    nextStory();
  }, duration + 100);
}

function clearStoryTimers() {
  if (storyProgressInterval) {
    clearInterval(storyProgressInterval);
    storyProgressInterval = null;
  }
  if (storyAutoAdvanceTimeout) {
    clearTimeout(storyAutoAdvanceTimeout);
    storyAutoAdvanceTimeout = null;
  }
  // Pause video if exists
  if (currentStoryMediaEl && currentStoryMediaEl.tagName === 'VIDEO') {
    try { currentStoryMediaEl.pause(); } catch (e) {}
  }
}

function nextStory() {
  clearStoryTimers();

  const userGroup = storiesByUser[currentStoryUserIndex];
  if (!userGroup) { closeStoryViewer(); return; }

  if (currentStoryIndex < userGroup.stories.length - 1) {
    currentStoryIndex++;
    renderCurrentStory();
  } else {
    // Next user
    if (currentStoryUserIndex < storiesByUser.length - 1) {
      currentStoryUserIndex++;
      currentStoryIndex = 0;
      renderCurrentStory();
    } else {
      closeStoryViewer();
    }
  }
}

function prevStory() {
  clearStoryTimers();

  if (currentStoryIndex > 0) {
    currentStoryIndex--;
    renderCurrentStory();
  } else {
    // Previous user
    if (currentStoryUserIndex > 0) {
      currentStoryUserIndex--;
      const prevUser = storiesByUser[currentStoryUserIndex];
      currentStoryIndex = prevUser.stories.length - 1;
      renderCurrentStory();
    } else {
      // Restart current story
      currentStoryIndex = 0;
      renderCurrentStory();
    }
  }
}

function closeStoryViewer() {
  clearStoryTimers();
  storyViewer.style.display = 'none';
  storyMedia.innerHTML = '';
  document.body.style.overflow = '';
  currentStoryMediaEl = null;
}

async function markStoryViewed(storyId) {
  if (!currentUser) return;
  try {
    const storyRef = doc(db, 'stories', storyId);
    const snap = await getDoc(storyRef);
    if (!snap.exists()) return;
    const viewers = snap.data().viewers || [];
    if (!viewers.includes(currentUser.uid)) {
      await updateDoc(storyRef, { viewers: arrayUnion(currentUser.uid) });
    }
  } catch (e) {}
}

/* Story viewer event listeners */
storyCloseBtn.addEventListener('click', closeStoryViewer);

storyTapLeft.addEventListener('click', () => {
  prevStory();
});

storyTapRight.addEventListener('click', () => {
  nextStory();
});

storyDeleteBtn.addEventListener('click', async () => {
  if (!confirm('Delete this story?')) return;

  const userGroup = storiesByUser[currentStoryUserIndex];
  if (!userGroup) return;
  const story = userGroup.stories[currentStoryIndex];
  if (!story) return;

  try {
    await deleteDoc(doc(db, 'stories', story.id));
    showToast('Story deleted');

    // Remove from local array
    userGroup.stories.splice(currentStoryIndex, 1);

    if (userGroup.stories.length === 0) {
      storiesByUser.splice(currentStoryUserIndex, 1);
      if (storiesByUser.length === 0) {
        closeStoryViewer();
        renderHomeFeed();
        return;
      }
      if (currentStoryUserIndex >= storiesByUser.length) {
        currentStoryUserIndex = storiesByUser.length - 1;
      }
      currentStoryIndex = 0;
    } else if (currentStoryIndex >= userGroup.stories.length) {
      currentStoryIndex = userGroup.stories.length - 1;
    }

    renderCurrentStory();

  } catch (e) {
    console.error(e);
    showToast('❌ Could not delete');
  }
});

// Pause on hold
let storyHoldTimer = null;
storyMedia.addEventListener('mousedown', pauseStory);
storyMedia.addEventListener('touchstart', pauseStory, { passive: true });
storyMedia.addEventListener('mouseup', resumeStory);
storyMedia.addEventListener('touchend', resumeStory);
storyMedia.addEventListener('mouseleave', resumeStory);

function pauseStory() {
  if (storyProgressInterval) {
    clearInterval(storyProgressInterval);
    storyProgressInterval = null;
  }
  if (currentStoryMediaEl && currentStoryMediaEl.tagName === 'VIDEO') {
    try { currentStoryMediaEl.pause(); } catch (e) {}
  }
}

function resumeStory() {
  if (!storyViewer || storyViewer.style.display === 'none') return;
  const userGroup = storiesByUser[currentStoryUserIndex];
  if (!userGroup) return;
  const story = userGroup.stories[currentStoryIndex];
  if (!story) return;

  if (currentStoryMediaEl && currentStoryMediaEl.tagName === 'VIDEO') {
    try { currentStoryMediaEl.play(); } catch (e) {}
  }

  // Resume progress (simplified — restart from current position not tracked)
  const fills = storyProgressBars.querySelectorAll('.story-progress-fill');
  const currentFill = fills[currentStoryIndex];
  if (!currentFill) return;

  const currentWidth = parseFloat(currentFill.style.width) || 0;
  const duration = (story.type === 'photo' ? 5 : (story.duration || 5)) * 1000;
  const remainingTime = duration * (1 - currentWidth / 100);

  setTimeout(() => {
    storyProgressInterval = setInterval(() => {
      const newWidth = parseFloat(currentFill.style.width) + (100 / (remainingTime / 50));
      if (newWidth >= 100) {
        currentFill.style.width = '100%';
        clearInterval(storyProgressInterval);
        storyProgressInterval = null;
        nextStory();
      } else {
        currentFill.style.width = newWidth + '%';
      }
    }, 50);
  }, 50);
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
           loop muted playsinline preload="metadata"
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
  if (userImg) userImg.addEventListener('click', () => openUserProfile(short.userId));

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
   LIKE SYSTEM
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
  } catch (e) { console.error('Like error:', e); }
}

/* ============================================================
   SHARE POST
   ============================================================ */
async function sharePost(post) {
  const appUrl = window.location.origin;
  const shareText = `🎬 Check out this post on ReelHub!\n\n@${post.userHandle}\n\n${appUrl}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'ReelHub Post', text: shareText, url: appUrl });
      return;
    } catch (err) { if (err.name === 'AbortError') return; }
  }
  try {
    await navigator.clipboard.writeText(shareText);
    showToast('✅ Link copied!');
  } catch (err) { showToast('❌ Could not share'); }
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
  myAvatarForComment.src = currentProfile?.photo || defaultAvatar(currentProfile?.name || '?');
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
      c.replies = replies.filter(r => r.parentId === c.id).sort((a, b) => {
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

          ${isOwner ? `<button class="comment-delete-btn" data-comment="${comment.id}" title="Delete">🗑️</button>` : ''}
        </div>
      </div>
    </div>
    ${repliesHtml}
  `;

  item.querySelector('.comment-avatar')?.addEventListener('click', () => openUserProfile(comment.userId));
  item.querySelector('.comment-name')?.addEventListener('click', () => openUserProfile(comment.userId));
  item.querySelector('.like-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleCommentLike(comment.id, e.currentTarget);
  });
  const replyBtn = item.querySelector('.reply-btn');
  if (replyBtn) replyBtn.addEventListener('click', () => showReplyIndicator(comment.id, comment.userName, comment.userHandle));
  const deleteBtn = item.querySelector('.comment-delete-btn');
  if (deleteBtn) deleteBtn.addEventListener('click', async () => {
    if (!confirm('Delete this comment?')) return;
    await deleteComment(comment.id);
  });

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

cancelReplyBtn.addEventListener('click', hideReplyIndicator);

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
  } catch (e) { console.error('Comment like error:', e); }
}

async function deleteComment(commentId) {
  try {
    await deleteDoc(doc(db, 'comments', commentId));
    const repliesQ = query(collection(db, 'comments'), where('parentId', '==', commentId));
    const repliesSnap = await getDocs(repliesQ);
    for (const replyDoc of repliesSnap.docs) {
      await deleteDoc(doc(db, 'comments', replyDoc.id));
    }
    showToast('Comment deleted');
    await loadComments();
  } catch (e) {
    console.error('Delete comment error:', e);
    showToast('❌ Could not delete');
  }
}

/* ============================================================
   CHATS
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
    chats.sort((a, b) => {
      const ta = a.lastMessageTime?.toDate?.()?.getTime() || 0;
      const tb = b.lastMessageTime?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });

    const enriched = await Promise.all(chats.map(async (chat) => {
      const otherUid = chat.members.find(m => m !== currentUser.uid);
      if (!otherUid) return null;
      try {
        const userSnap = await getDoc(doc(db, 'users', otherUid));
        if (!userSnap.exists()) return null;
        return { ...chat, otherUser: { uid: otherUid, ...userSnap.data() } };
      } catch (e) { return null; }
    }));

    const validChats = enriched.filter(c => c);
    if (validChats.length === 0) {
      wrap.innerHTML = `<div class="empty-msg">No valid chats</div>`;
      return;
    }

    wrap.innerHTML = '';
    validChats.forEach(chat => wrap.appendChild(makeChatItem(chat)));
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
  const hasUnread = chat.lastMessageBy !== currentUser.uid && (chat.unreadBy || []).includes(currentUser.uid);

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

  item.addEventListener('click', () => openChatWindow(otherUser));
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
    newChatResults.innerHTML = `<div class="search-empty">Start typing...</div>`;
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
    console.error(e);
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

  chatHeaderAvatar.src = otherUser.photo || defaultAvatar(otherUser.name);
  chatHeaderName.textContent = otherUser.name || 'User';
  chatHeaderHandle.textContent = '@' + (otherUser.user || '');

  chatHeaderInfo.onclick = () => {
    closeChatWindow();
    openUserProfile(otherUser.uid);
  };

  chatMessages.innerHTML = `<div class="empty-msg">Loading messages...</div>`;
  chatMessageInput.value = '';
  updateSendTextBtn();
  chatWindowModal.classList.add('show');

  await loadChatMessages();
  await markChatRead();
}

function closeChatWindow() {
  chatWindowModal.classList.remove('show');
  if (chatMessagesUnsub) {
    clearInterval(chatMessagesUnsub);
    chatMessagesUnsub = null;
  }
  activeChatId = null;
  activeChatUser = null;
  stopVoicePlayback();
}

document.getElementById('closeChatWindow').addEventListener('click', closeChatWindow);

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
  setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 50);
}

function makeMessageBubble(msg) {
  const row = document.createElement('div');
  const isMe = msg.from === currentUser.uid;
  row.className = 'msg-row ' + (isMe ? 'me' : 'other');

  const time = msg.time?.toDate?.();
  const timeStr = time ? formatTime(time) : '';

  if (msg.type === 'voice') {
    const duration = msg.voiceDuration || 0;
    const bars = [];
    for (let i = 0; i < 22; i++) bars.push(30 + Math.floor(Math.random() * 70));

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
   SEND TEXT
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
  await sendMessage({ type: 'text', text });
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

    await loadChatMessages();
  } catch (e) {
    console.error('Send message error:', e);
    showToast('❌ Could not send');
  }
}

async function markChatRead() {
  if (!activeChatId) return;
  try {
    await updateDoc(doc(db, 'chats', activeChatId), { unreadBy: arrayRemove(currentUser.uid) });
    checkChatsUnread();
  } catch (e) {}
}

/* ============================================================
   VOICE RECORDING
   ============================================================ */
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
    if (!MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/mp4';

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

    voiceTimerInterval = setInterval(() => {
      voiceSeconds++;
      recordingTimer.textContent = `0:${voiceSeconds < 10 ? '0' + voiceSeconds : voiceSeconds}`;
      if (voiceSeconds >= 10) stopVoiceRecordingAndSend();
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
  const finalSeconds = voiceSeconds;

  return new Promise((resolve) => {
    mediaRecorder.onstop = async () => {
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
      if (finalSeconds < 1) {
        showToast('Too short — hold longer');
        resolve();
        return;
      }
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      if (audioBlob.size > 500 * 1024) {
        showToast('Voice too large');
        resolve();
        return;
      }
      const base64 = await blobToBase64(audioBlob);
      await sendMessage({ type: 'voice', voiceData: base64, voiceDuration: finalSeconds });
      resolve();
    };
    try { mediaRecorder.stop(); } catch (e) { resolve(); }
  });
}

function cancelVoiceRecording() {
  if (!isRecording || !mediaRecorder) return;
  isRecording = false;
  clearInterval(voiceTimerInterval);
  recordingIndicator.classList.remove('show');
  recordingIndicator.style.display = 'none';
  try {
    mediaRecorder.onstop = () => mediaRecorder.stream.getTracks().forEach(t => t.stop());
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
    audio.onended = () => stopVoicePlayback();
    audio.onerror = () => { stopVoicePlayback(); showToast('❌ Could not play'); };
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
  document.querySelectorAll('.voice-waveform.playing').forEach(el => el.classList.remove('playing'));
}

/* ============================================================
   CHAT UNREAD WATCHER
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
      if (data.lastMessageBy !== currentUser.uid && (data.unreadBy || []).includes(currentUser.uid)) {
        hasUnread = true;
      }
    });
    if (chatsDot) chatsDot.style.display = hasUnread ? 'block' : 'none';
  } catch (e) {}
}

/* ============================================================
   PROFILE PAGE
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

  await renderUserPosts(currentUser.uid, 'myPostsGrid');
}

async function renderUserPosts(uid, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('userId', '==', uid), limit(60));
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
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    posts.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });
    container.innerHTML = '';
    posts.forEach(post => container.appendChild(makeGridItem(post)));
  } catch (e) {
    console.error('Could not load posts:', e);
    container.innerHTML = `<div class="grid-empty">Could not load posts.</div>`;
  }
}

function makeGridItem(post) {
  const item = document.createElement('div');
  item.className = 'grid-item';
  if (post.type === 'long') item.style.aspectRatio = '16 / 9';
  else item.style.aspectRatio = '9 / 16';

  const thumbUrl = post.thumbnail || (post.type === 'photo' ? post.url : '');
  let inner = '';
  if (post.type === 'photo') {
    inner = `<img src="${post.url}" alt="">`;
  } else {
    inner = `<video src="${post.url}" muted playsinline preload="metadata" ${thumbUrl ? `poster="${thumbUrl}"` : ''}></video>`;
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

document.querySelectorAll('.upload-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentUploadType = tab.dataset.type;
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

uploadFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadMsg.className = 'error-msg';
  uploadMsg.textContent = '';

  if (currentUploadType === 'photo') {
    if (!file.type.startsWith('image/')) { uploadMsg.textContent = 'Choose an image file.'; return; }
    if (file.size > 5 * 1024 * 1024) { uploadMsg.textContent = 'Photo too large. Max 5 MB.'; return; }
    selectedFile = file;
    const url = URL.createObjectURL(file);
    uploadPhotoPreview.src = url;
    uploadPhotoPreviewWrap.style.display = 'block';
    uploadPickerWrap.style.display = 'none';
    uploadSubmitBtn.disabled = false;
    return;
  }

  if (!file.type.startsWith('video/')) { uploadMsg.textContent = 'Choose a video file.'; return; }
  if (file.size > 100 * 1024 * 1024) { uploadMsg.textContent = 'Video too large. Max 100 MB.'; return; }

  const url = URL.createObjectURL(file);
  const tempVideo = document.createElement('video');
  tempVideo.preload = 'metadata';
  tempVideo.src = url;

  tempVideo.onloadedmetadata = () => {
    const duration = tempVideo.duration;
    if (!isFinite(duration) || duration <= 0) { uploadMsg.textContent = 'Could not read duration.'; return; }
    selectedFile = file;
    selectedFileDuration = duration;

    if (currentUploadType === 'short' && duration > 30.5) {
      uploadMsg.textContent = `⚠️ Switching to Long...`;
      setTimeout(() => { switchUploadType('long'); uploadFileInput.value = ''; selectedFile = null; uploadMsg.textContent = 'Select again as Long.'; }, 1500);
      return;
    }
    if (currentUploadType === 'long' && duration <= 30.5) {
      uploadMsg.textContent = `⚠️ Switching to Short...`;
      setTimeout(() => { switchUploadType('short'); uploadFileInput.value = ''; selectedFile = null; uploadMsg.textContent = 'Select again as Short.'; }, 1500);
      return;
    }
    if (currentUploadType === 'long' && duration > 60.5) {
      uploadMsg.textContent = `⚠️ Long video max 1 minute.`;
      return;
    }

    uploadPreview.src = url;
    uploadPreviewWrap.style.display = 'block';
    uploadPickerWrap.style.display = 'none';
    uploadPreviewInfo.textContent = `Duration: ${Math.round(duration)}s • Size: ${(file.size/1024/1024).toFixed(2)} MB`;
    uploadSubmitBtn.disabled = false;
  };
  tempVideo.onerror = () => { uploadMsg.textContent = 'Could not load video.'; };
});

function switchUploadType(type) {
  document.querySelectorAll('.upload-tab').forEach(t => t.classList.toggle('active', t.dataset.type === type));
  currentUploadType = type;
  updatePickerText();
  uploadPreview.src = '';
  uploadPhotoPreview.src = '';
  uploadPreviewWrap.style.display = 'none';
  uploadPhotoPreviewWrap.style.display = 'none';
  uploadPickerWrap.style.display = 'flex';
  uploadSubmitBtn.disabled = true;
}

uploadSubmitBtn.addEventListener('click', async () => {
  if (!currentUser || !currentProfile) { uploadMsg.textContent = 'Login required.'; return; }
  if (!selectedFile) { uploadMsg.textContent = 'Select a file first.'; return; }

  const caption = uploadCaption.value.trim();
  uploadSubmitBtn.disabled = true;
  uploadSubmitBtn.textContent = 'Uploading...';
  uploadMsg.textContent = '';
  uploadProgressWrap.style.display = 'block';
  uploadProgressBar.style.width = '0%';
  uploadProgressText.textContent = '0%';

  try {
    const result = await uploadToCloudinary(selectedFile, (percent) => {
      uploadProgressBar.style.width = percent + '%';
      uploadProgressText.textContent = percent + '%';
    });

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
    await updateDoc(doc(db, 'users', currentUser.uid), { videoCount: (currentProfile.videoCount || 0) + 1 });
    currentProfile.videoCount = (currentProfile.videoCount || 0) + 1;

    uploadMsg.className = 'success-msg';
    uploadMsg.textContent = '✅ Uploaded!';

    setTimeout(() => {
      uploadModal.classList.remove('show');
      if (document.querySelector('.nav-item[data-page="profile"]').classList.contains('active')) renderProfile();
    }, 1500);
  } catch (err) {
    console.error('Upload failed:', err);
    uploadMsg.className = 'error-msg';
    uploadMsg.textContent = err.message || 'Upload failed.';
    uploadSubmitBtn.disabled = false;
    uploadSubmitBtn.textContent = 'Upload';
  }
});

/* ============================================================
   CLOUDINARY — VIDEO/PHOTO UPLOAD
   ============================================================ */
function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const resourceType = currentUploadType === 'photo' ? 'image' : 'video';
    const acc = CLOUDINARY_ACCOUNTS[0];
    const url = `https://api.cloudinary.com/v1_1/${acc.cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', acc.preset);
    formData.append('api_key', acc.apiKey);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.timeout = 120000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (!res.secure_url) { reject(new Error('No URL returned')); return; }
          resolve(res);
        } catch (e) { reject(new Error('Invalid response')); }
      } else {
        let errMsg = 'Upload failed';
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.error && errData.error.message) errMsg = errData.error.message;
        } catch (e) { errMsg = 'HTTP ' + xhr.status; }
        reject(new Error(errMsg));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));
    xhr.send(formData);
  });
}

function buildThumbnailUrl(videoUrl, type) {
  if (!videoUrl) return '';
  if (type === 'photo') return videoUrl;
  try {
    if (videoUrl.includes('/video/upload/')) {
      return videoUrl.replace('/video/upload/', '/video/upload/so_0,w_400,c_fill,q_auto/');
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
    playerContent.innerHTML = `<img src="${post.url}" alt="">`;
  } else {
    const aspectClass = post.type === 'long' ? 'aspect-16-9' : 'aspect-9-16';
    playerContent.innerHTML = `<video src="${post.url}" controls playsinline autoplay class="${aspectClass}" style="background:#000;"></video>`;
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
          <button class="btn-outline" id="pubFollowBtn" style="${isFollowing ? '' : 'background: linear-gradient(90deg, #ff2e63, #ff8a00); border: none;'}">
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
        <div class="profile-tabs"><button class="profile-tab active">Posts</button></div>
        <div class="profile-grid" id="pubPostsGrid"><div class="grid-empty">Loading posts...</div></div>
      </div>
    `;

    document.getElementById('backFromProfileBtn').addEventListener('click', () => {
      viewingUserId = null;
      setActiveNav(null);
      renderPage('home');
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
    console.error(e);
    content.innerHTML = `<div class="page-placeholder"><div class="page-title">Could not load</div></div>`;
  }
}

async function shareUser(user) {
  const appUrl = window.location.origin;
  const shareText = `🎬 Check out ${user.name}'s profile on ReelHub!\n\n@${user.user}\n\n${appUrl}`;
  if (navigator.share) {
    try { await navigator.share({ title: `${user.name} on ReelHub`, text: shareText, url: appUrl }); return; } catch (err) { if (err.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(shareText); showToast('✅ Link copied!'); } catch (err) { showToast('❌ Could not share'); }
}

/* ============================================================
   EDIT PROFILE MODAL
   ============================================================ */
function openEditModal() {
  if (!currentProfile) return;
  selectedPhotoBase64 = null;
  editNameInput.value = currentProfile.name || '';
  editUserInput.value = currentProfile.user || '';
  editBioInput.value = currentProfile.bio || '';
  editPreviewImg.src = currentProfile.photo || defaultAvatar(currentProfile.name);
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
  if (file.size > 500 * 1024) { editMsg.className = 'error-msg'; editMsg.textContent = 'Max 500 KB.'; return; }
  const base64 = await fileToBase64(file);
  selectedPhotoBase64 = base64;
  editPreviewImg.src = base64;
  editMsg.textContent = '';
});

saveProfileBtn.addEventListener('click', async () => {
  if (!currentUser) return;
  const newName = editNameInput.value.trim();
  const newUser = editUserInput.value.trim().toLowerCase();
  const newBio = editBioInput.value.trim();
  editMsg.className = 'error-msg';
  editMsg.textContent = '';
  if (!newName) { editMsg.textContent = 'Name required.'; return; }
  if (!/^[a-z0-9._]{3,20}$/.test(newUser)) { editMsg.textContent = 'Username: 3-20 chars.'; return; }
  if (newBio.length > 150) { editMsg.textContent = 'Bio max 150 chars.'; return; }

  saveProfileBtn.disabled = true;
  saveProfileBtn.textContent = 'Saving...';

  try {
    if (newUser !== currentProfile.user) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('user', '==', newUser));
      const snap = await getDocs(q);
      if (!snap.empty) {
        editMsg.textContent = 'Username taken.';
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
    currentProfile.bio = newBio;
    if (selectedPhotoBase64) currentProfile.photo = selectedPhotoBase64;
    editMsg.className = 'success-msg';
    editMsg.textContent = 'Profile updated!';
    setTimeout(() => { editModal.classList.remove('show'); renderProfile(); }, 500);
  } catch (err) {
    editMsg.className = 'error-msg';
    editMsg.textContent = err.message || 'Update failed.';
  } finally {
    saveProfileBtn.disabled = false;
    saveProfileBtn.textContent = 'Save Changes';
  }
});

/* ============================================================
   FOLLOWERS / FOLLOWING LIST
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
    if (users.length === 0) { userList.innerHTML = `<div class="empty-msg">No users found.</div>`; return; }
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
        <button class="${currentProfile.following.includes(u.uid) ? 'unfollow' : 'follow'}" data-uid="${u.uid}">
          ${currentProfile.following.includes(u.uid) ? 'Following' : 'Follow'}
        </button>
      `;
      row.querySelector('img').addEventListener('click', () => { listModal.classList.remove('show'); openUserProfile(u.uid); });
      row.querySelector('.meta').addEventListener('click', () => { listModal.classList.remove('show'); openUserProfile(u.uid); });
      row.querySelector('button').addEventListener('click', async (e) => { e.stopPropagation(); await toggleFollow(u.uid, e.target); });
      userList.appendChild(row);
    });
  });
}

document.getElementById('closeList').addEventListener('click', () => listModal.classList.remove('show'));
listModal.addEventListener('click', (e) => { if (e.target === listModal) listModal.classList.remove('show'); });

/* ============================================================
   TOGGLE FOLLOW
   ============================================================ */
async function toggleFollow(targetUid, btnEl) {
  if (!currentUser || !currentProfile) return;
  if (targetUid === currentUser.uid) return;
  const isFollowing = currentProfile.following.includes(targetUid);
  try {
    const myRef = doc(db, 'users', currentUser.uid);
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
    console.error(err);
    showToast('Could not update follow.');
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
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), limit(50));
    const snap = await getDocs(q);
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    notifications.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });
    paintNotifications(notifications);
    for (const n of notifications) {
      if (!n.read) { try { await updateDoc(doc(db, 'notifications', n.id), { read: true }); } catch (e) {} }
    }
    updateNotifDot(0);
  } catch (e) {
    console.error(e);
    const el = document.getElementById('notifList');
    if (el) el.innerHTML = `<div class="empty-notif">Could not load.</div>`;
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
    await updateDoc(doc(db, 'admin_invites', inviteId), { status: 'accepted', respondedAt: serverTimestamp() });
    await updateDoc(doc(db, 'users', currentUser.uid), { role: 'admin' });
    showToast('🎉 You are now an admin!');
  } catch (e) { showToast('❌ Failed'); }
}

async function handleInviteReject(inviteId) {
  if (!inviteId || !currentUser) return;
  try {
    await updateDoc(doc(db, 'admin_invites', inviteId), { status: 'rejected', respondedAt: serverTimestamp() });
    showToast('Invitation declined');
  } catch (e) { showToast('❌ Failed'); }
}

function startNotifWatcher() {
  stopNotifWatcher();
  checkUnreadNotifications();
  notifIntervalId = setInterval(checkUnreadNotifications, 30000);
}

function stopNotifWatcher() {
  if (notifIntervalId) { clearInterval(notifIntervalId); notifIntervalId = null; }
  updateNotifDot(0);
}

async function checkUnreadNotifications() {
  if (!currentUser) return;
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), where('read', '==', false), limit(20));
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
  if (!searchTerm) { results.innerHTML = `<div class="search-empty">Start typing...</div>`; return; }
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
      results.innerHTML = `<div class="search-empty">No users found</div>`;
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
      row.querySelector('img').addEventListener('click', (e) => { e.stopPropagation(); openUserProfile(u.id); });
      row.querySelector('.info').addEventListener('click', (e) => { e.stopPropagation(); openUserProfile(u.id); });
      row.querySelector('button').addEventListener('click', async (e) => { e.stopPropagation(); await toggleFollow(u.id, e.target); });
      results.appendChild(row);
    });
  } catch (e) {
    results.innerHTML = `<div class="search-empty">Search failed</div>`;
  }
}

/* ============================================================
   SHARE OWN PROFILE
   ============================================================ */
async function shareProfile() {
  if (!currentProfile) return;
  const appUrl = window.location.origin;
  const shareText = `🎬 Check out ${currentProfile.name}'s profile on ReelHub!\n\n@${currentProfile.user}\n\n${appUrl}`;
  if (navigator.share) {
    try { await navigator.share({ title: `${currentProfile.name} on ReelHub`, text: shareText, url: appUrl }); return; } catch (err) { if (err.name === 'AbortError') return; }
  }
  try {
    await navigator.clipboard.writeText(shareText);
    showToast('✅ Link copied!');
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = shareText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); showToast('✅ Link copied!'); } catch (e) { showToast('❌ Failed'); }
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
      <text x="50" y="50" font-size="44" font-family="sans-serif" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${letter}</text>
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