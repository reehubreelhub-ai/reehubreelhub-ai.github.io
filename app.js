/* ============================================================
   ReelHub — app.js (PART 1/4)
   Imports, Config, DOM, State, Auth
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

const commentsModal      = document.getElementById('commentsModal');
const commentsTitle      = document.getElementById('commentsTitle');
const commentsList       = document.getElementById('commentsList');
const commentInput       = document.getElementById('commentInput');
const postCommentBtn     = document.getElementById('postCommentBtn');
const myAvatarForComment = document.getElementById('myAvatarForComment');
const replyIndicator     = document.getElementById('replyIndicator');
const replyIndicatorText = document.getElementById('replyIndicatorText');
const cancelReplyBtn     = document.getElementById('cancelReplyBtn');

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

let activeCommentPostId = null;
let activeReplyTo = null;
let allCommentsForPost = [];

let activeChatId = null;
let activeChatUser = null;
let chatMessagesUnsub = null;
let chatListInterval = null;
let pinnedMessage = null;

let mediaRecorder = null;
let audioChunks = [];
let voiceTimerInterval = null;
let voiceSeconds = 0;
let isRecording = false;
let currentPlayingAudio = null;
let currentPlayingBtn = null;

let currentStoryType = 'photo';
let currentStoryFile = null;
let currentStoryVideoDuration = 0;
let storiesByUser = [];
let currentStoryUserIndex = 0;
let currentStoryIndex = 0;
let storyProgressInterval = null;
let storyAutoAdvanceTimeout = null;
let currentStoryMediaEl = null;

let viewedPostsSession = new Set();

/* ============================================================
   SCREEN SWITCHING
   ============================================================ */
function showAuth() {
  if (loadingScreen) loadingScreen.style.display = 'none';
  authScreen.classList.add('show');
  appScreen.classList.remove('show');
  stopNotifWatcher();
  stopShortsObserver();
  stopChatListWatcher();
}

function showApp() {
  if (loadingScreen) loadingScreen.style.display = 'none';
  authScreen.classList.remove('show');
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

  if (!name || !user || !email || !pass) { signupMsg.textContent = 'Please fill all fields.'; return; }
  if (!/^[a-z0-9._]{3,20}$/.test(user)) { signupMsg.textContent = 'Username: 3-20 chars, a-z, 0-9, . or _'; return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { signupMsg.textContent = 'Please enter a valid email.'; return; }
  if (pass.length < 6) { signupMsg.textContent = 'Password min 6 characters.'; return; }

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
      savedPosts: [],
      blockedUsers: [],
      createdAt: serverTimestamp()
    });

    signupMsg.className = 'success-msg';
    signupMsg.textContent = 'Account created! Welcome 🎉';
  } catch (err) {
    console.error(err);
    signupMsg.className = 'error-msg';
    if (err.code === 'auth/email-already-in-use') signupMsg.textContent = 'Email already registered.';
    else if (err.code === 'auth/invalid-email') signupMsg.textContent = 'Invalid email.';
    else if (err.code === 'auth/weak-password') signupMsg.textContent = 'Password too weak.';
    else signupMsg.textContent = err.message || 'Signup failed.';
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

  if (!email || !pass) { loginMsg.textContent = 'Please enter email and password.'; return; }

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

    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
      loginMsg.textContent = 'Invalid email or password.';
    } else if (err.code === 'auth/too-many-requests') loginMsg.textContent = 'Too many attempts.';
    else if (err.code === 'auth/network-request-failed') loginMsg.textContent = 'Network error.';
    else loginMsg.textContent = err.message || 'Login failed.';

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

  if (!email) { forgotMsg.textContent = 'Enter your email.'; return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { forgotMsg.textContent = 'Invalid email.'; return; }

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
    forgotMsg.className = 'error-msg';
    if (err.code === 'auth/user-not-found') forgotMsg.textContent = 'No account with this email.';
    else if (err.code === 'auth/invalid-email') forgotMsg.textContent = 'Invalid email.';
    else if (err.code === 'auth/too-many-requests') forgotMsg.textContent = 'Too many attempts.';
    else forgotMsg.textContent = err.message || 'Failed.';
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
    viewedPostsSession.clear();
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
notifBtn.addEventListener('click', () => { setActiveNav(null); renderPage('notifications'); });
searchBtn.addEventListener('click', () => { setActiveNav(null); renderPage('search'); });

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
      if (!Array.isArray(currentProfile.savedPosts)) currentProfile.savedPosts = [];
      if (!Array.isArray(currentProfile.blockedUsers)) currentProfile.blockedUsers = [];
      if (typeof currentProfile.videoCount !== 'number') currentProfile.videoCount = 0;
    } else {
      currentProfile = null;
    }
  } catch (e) {}
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
  if (page === 'profile') renderProfile();
  else if (page === 'home') renderHomeFeed();
  else if (page === 'shorts') renderShortsFeed();
  else if (page === 'messages') renderChatsPage();
  else if (page === 'notifications') renderNotifications();
  else if (page === 'search') renderSearch();
  else if (page === 'upload') {
    content.innerHTML = `<div class="page-placeholder"><div class="page-title">${pages[page]}</div></div>`;
  }
}
/* ============================================================
   ReelHub — app.js (PART 2/4)
   Helpers, Home Feed, Stories, Report/Block
   ============================================================ */

/* ============================================================
   BATCH 1 HELPERS — Save + Views
   ============================================================ */
function isPostSaved(postId) {
  if (!currentProfile) return false;
  return (currentProfile.savedPosts || []).includes(postId);
}

function buildSaveButtonHTML(postId) {
  const isSaved = isPostSaved(postId);
  return `
    <button class="save-btn ${isSaved ? 'saved' : ''}" data-post="${postId}" title="Save">
      <svg viewBox="0 0 24 24">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  `;
}

function buildViewsHTML(viewsCount) {
  return `
    <div class="feed-views" title="Views">
      <svg viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <span>${viewsCount || 0}</span>
    </div>
  `;
}

async function toggleSavePost(postId, btnEl) {
  if (!currentUser || !currentProfile) return;
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
    const savedPosts = snap.data().savedPosts || [];
    const isSaved = savedPosts.includes(postId);

    if (isSaved) {
      await updateDoc(userRef, { savedPosts: arrayRemove(postId) });
      if (btnEl) btnEl.classList.remove('saved');
      showToast('Removed from saved');
    } else {
      await updateDoc(userRef, { savedPosts: arrayUnion(postId) });
      if (btnEl) btnEl.classList.add('saved');
      showToast('🔖 Saved to profile');
    }

    if (currentProfile) {
      currentProfile.savedPosts = isSaved
        ? (currentProfile.savedPosts || []).filter(id => id !== postId)
        : [...(currentProfile.savedPosts || []), postId];
    }
  } catch (err) {
    console.error('Save post error:', err);
    showToast('❌ Could not save');
  }
}

async function renderSavedPosts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const savedIds = currentProfile?.savedPosts || [];

  if (savedIds.length === 0) {
    container.innerHTML = `
      <div class="saved-empty">
        <svg viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <h3>No saved posts yet</h3>
        <p>Tap 🔖 on any post to save it here</p>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="grid-empty">Loading saved...</div>`;

  try {
    const posts = [];
    for (const id of savedIds) {
      try {
        const snap = await getDoc(doc(db, 'posts', id));
        if (snap.exists()) posts.push({ id: snap.id, ...snap.data() });
      } catch (e) {}
    }

    if (posts.length === 0) {
      container.innerHTML = `<div class="saved-empty"><h3>No saved posts available</h3></div>`;
      return;
    }

    posts.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });

    container.innerHTML = '';
    posts.forEach(post => container.appendChild(makeGridItem(post)));
  } catch (e) {
    container.innerHTML = `<div class="grid-empty">Could not load saved posts.</div>`;
  }
}

async function trackPostView(postId) {
  if (!currentUser || !postId) return;
  if (viewedPostsSession.has(postId)) return;
  viewedPostsSession.add(postId);

  try {
    const postRef = doc(db, 'posts', postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return;
    const currentViews = snap.data().views || 0;
    await updateDoc(postRef, { views: currentViews + 1 });
  } catch (e) {}
}

async function showStoryViewers(story) {
  if (!story) return;
  const viewers = story.viewers || [];

  document.getElementById('storyViewersSheet')?.remove();

  const sheet = document.createElement('div');
  sheet.id = 'storyViewersSheet';
  sheet.className = 'story-viewers-sheet';

  sheet.innerHTML = `
    <div class="story-viewers-header">
      <h3>
        <svg viewBox="0 0 24 24">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        ${viewers.length} ${viewers.length === 1 ? 'view' : 'views'}
      </h3>
      <button class="story-viewers-close">✕</button>
    </div>
    <div class="story-viewers-list" id="storyViewersList">
      ${viewers.length === 0 ? '<div class="story-viewers-empty">No views yet</div>' : '<div class="story-viewers-empty">Loading...</div>'}
    </div>
  `;

  document.body.appendChild(sheet);

  sheet.querySelector('.story-viewers-close').addEventListener('click', () => sheet.remove());
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.remove(); });

  if (viewers.length > 0) await loadStoryViewersList(viewers, 'storyViewersList');
}

async function loadStoryViewersList(uids, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const users = [];
  for (const uid of uids) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) users.push({ uid, ...snap.data() });
    } catch (e) {}
  }

  if (users.length === 0) {
    container.innerHTML = `<div class="story-viewers-empty">Users not found</div>`;
    return;
  }

  container.innerHTML = '';
  users.forEach(u => {
    const row = document.createElement('div');
    row.className = 'story-viewer-row';
    row.innerHTML = `
      <img src="${u.photo || defaultAvatar(u.name)}" alt="">
      <div class="info">
        <b>${escapeHtml(u.name || 'User')}</b>
        <span>@${escapeHtml(u.user || '')}</span>
      </div>
    `;
    row.addEventListener('click', () => {
      document.getElementById('storyViewersSheet')?.remove();
      openUserProfile(u.uid);
    });
    container.appendChild(row);
  });
}

/* ============================================================
   HOME FEED (with Stories Bar + Save + Views)
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

    let posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Filter blocked users
    const blocked = currentProfile?.blockedUsers || [];
    posts = posts.filter(p => !blocked.includes(p.userId));

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
  const viewsCount = post.views || 0;

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
      <button class="post-menu-btn" data-post="${post.id}" data-uid="${post.userId}" title="More">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      </button>
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

      ${buildViewsHTML(viewsCount)}

      ${buildSaveButtonHTML(post.id)}
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

  postEl.querySelector('.post-menu-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    await showPostMenu(e.currentTarget, post);
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

  const saveBtn = postEl.querySelector('.save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await toggleSavePost(post.id, e.currentTarget);
    });
  }

  trackPostView(post.id);

  return postEl;
}

/* ============================================================
   POST MENU (for Report/Block)
   ============================================================ */
async function showPostMenu(anchorEl, post) {
  document.querySelectorAll('.post-menu-dropdown').forEach(el => el.remove());

  const menu = document.createElement('div');
  menu.className = 'post-menu-dropdown';

  const isOwner = post.userId === currentUser.uid;

  let menuHTML = '';
  if (isOwner) {
    menuHTML += `
      <button data-action="delete" class="danger">
        <svg viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
        Delete Post
      </button>
    `;
  } else {
    menuHTML += `
      <button data-action="report">
        <svg viewBox="0 0 24 24">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
        Report Post
      </button>
      <button data-action="block" class="danger">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        Block @${escapeHtml(post.userHandle || '')}
      </button>
    `;
  }

  menu.innerHTML = menuHTML;
  document.body.appendChild(menu);

  const rect = anchorEl.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();

  let top = rect.bottom + 5;
  let left = rect.right - menuRect.width;

  if (left < 10) left = 10;
  if (left + menuRect.width > window.innerWidth - 10) left = window.innerWidth - menuRect.width - 10;
  if (top + menuRect.height > window.innerHeight - 10) top = rect.top - menuRect.height - 5;

  menu.style.top = top + 'px';
  menu.style.left = left + 'px';

  menu.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      menu.remove();

      if (action === 'report') await reportPost(post);
      else if (action === 'block') await blockUser(post.userId, post.userHandle);
      else if (action === 'delete') await deletePost(post.id);
    });
  });

  setTimeout(() => {
    const closeMenu = (ev) => {
      if (!menu.contains(ev.target) && ev.target !== anchorEl) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
        document.removeEventListener('touchstart', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
    document.addEventListener('touchstart', closeMenu);
  }, 100);
}

/* ============================================================
   REPORT POST
   ============================================================ */
async function reportPost(post) {
  const reasons = [
    'Spam or misleading',
    'Nudity or sexual content',
    'Hate speech or symbols',
    'Violence or dangerous',
    'Harassment or bullying',
    'False information',
    'Other'
  ];

  const reasonStr = prompt(
    '🚨 Report this post\n\nChoose a reason:\n' + reasons.map((r, i) => `${i + 1}. ${r}`).join('\n') + '\n\nType number (1-7):'
  );

  if (!reasonStr) return;
  const idx = parseInt(reasonStr) - 1;
  if (idx < 0 || idx >= reasons.length) {
    showToast('❌ Invalid choice');
    return;
  }

  try {
    await addDoc(collection(db, 'reports'), {
      type: 'post',
      postId: post.id,
      postUserId: post.userId,
      reportedBy: currentUser.uid,
      reportedByHandle: currentProfile?.user || '',
      reason: reasons[idx],
      status: 'pending',
      createdAt: serverTimestamp()
    });
    showToast('✅ Report submitted');
  } catch (e) {
    console.error('Report error:', e);
    showToast('❌ Could not report');
  }
}

/* ============================================================
   DELETE POST
   ============================================================ */
async function deletePost(postId) {
  if (!confirm('Delete this post permanently?')) return;
  try {
    await deleteDoc(doc(db, 'posts', postId));
    await updateDoc(doc(db, 'users', currentUser.uid), {
      videoCount: Math.max(0, (currentProfile.videoCount || 1) - 1)
    });
    currentProfile.videoCount = Math.max(0, (currentProfile.videoCount || 1) - 1);
    showToast('🗑️ Post deleted');
    renderHomeFeed();
  } catch (e) {
    console.error('Delete error:', e);
    showToast('❌ Could not delete');
  }
}

/* ============================================================
   BLOCK USER
   ============================================================ */
async function blockUser(userId, userHandle) {
  if (userId === currentUser.uid) {
    showToast('❌ Cannot block yourself');
    return;
  }
  if (!confirm(`Block @${userHandle}?\n\nThey won't be able to message you or see your profile.`)) return;

  try {
    await updateDoc(doc(db, 'users', currentUser.uid), {
      blockedUsers: arrayUnion(userId)
    });
    if (!currentProfile.blockedUsers) currentProfile.blockedUsers = [];
    if (!currentProfile.blockedUsers.includes(userId)) currentProfile.blockedUsers.push(userId);

    // Also unfollow if following
    if (currentProfile.following.includes(userId)) {
      await toggleFollow(userId, null);
    }

    showToast(`🚫 Blocked @${userHandle}`);
    renderHomeFeed();
  } catch (e) {
    console.error('Block error:', e);
    showToast('❌ Could not block');
  }
}

/* ============================================================
   FEED AUTOPLAY
   ============================================================ */
function setupFeedAutoplay() {
  const videos = document.querySelectorAll('.feed-post-media video');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) video.play().catch(() => {});
      else video.pause();
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
  bar.querySelectorAll('.story-item:not(#addStoryBtn)').forEach(el => el.remove());

  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, limit(100));
    const snap = await getDocs(q);
    const allStories = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const blocked = currentProfile?.blockedUsers || [];

    const validStories = allStories.filter(s => {
      const t = s.createdAt?.toDate?.();
      return t && t.getTime() > cutoffTime.getTime() && !blocked.includes(s.userId);
    });
    if (validStories.length === 0) return;

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

    Object.values(grouped).forEach(u => {
      u.stories.sort((a, b) => {
        const ta = a.createdAt?.toDate?.()?.getTime() || 0;
        const tb = b.createdAt?.toDate?.()?.getTime() || 0;
        return ta - tb;
      });
    });

    const userArray = Object.values(grouped);
    userArray.sort((a, b) => {
      if (a.userId === currentUser.uid) return -1;
      if (b.userId === currentUser.uid) return 1;
      const ta = a.stories[a.stories.length - 1].createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.stories[b.stories.length - 1].createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });

    storiesByUser = userArray;

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
      item.addEventListener('click', () => openStoryViewer(userGroup.userId));
      bar.appendChild(item);
    });
  } catch (e) {}
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
    if (!file.type.startsWith('image/')) { storyUploadMsg.textContent = 'Choose image file.'; return; }
    if (file.size > 5 * 1024 * 1024) { storyUploadMsg.textContent = 'Max 5 MB.'; return; }
    currentStoryFile = file;
    const url = URL.createObjectURL(file);
    storyPreviewImg.src = url;
    storyPreviewWrap.style.display = 'block';
    storyPickerWrap.style.display = 'none';
    storySubmitBtn.disabled = false;
    return;
  }

  if (!file.type.startsWith('video/')) { storyUploadMsg.textContent = 'Choose video file.'; return; }
  if (file.size > 20 * 1024 * 1024) { storyUploadMsg.textContent = 'Max 20 MB.'; return; }

  const url = URL.createObjectURL(file);
  const tempVideo = document.createElement('video');
  tempVideo.preload = 'metadata';
  tempVideo.src = url;

  tempVideo.onloadedmetadata = () => {
    const duration = tempVideo.duration;
    if (!isFinite(duration) || duration <= 0) { storyUploadMsg.textContent = 'Could not read duration.'; return; }
    if (duration > 15.5) { storyUploadMsg.textContent = `Max 15 sec. Yours ${Math.round(duration)}s.`; return; }
    currentStoryFile = file;
    currentStoryVideoDuration = duration;
    storyPreviewVideo.src = url;
    storyVideoPreviewWrap.style.display = 'block';
    storyPreviewInfo.textContent = `${Math.round(duration)}s · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    storyPickerWrap.style.display = 'none';
    storySubmitBtn.disabled = false;
  };
  tempVideo.onerror = () => { storyUploadMsg.textContent = 'Could not load video.'; };
});

storySubmitBtn.addEventListener('click', async () => {
  if (!currentUser || !currentProfile) { storyUploadMsg.textContent = 'Login required.'; return; }
  if (!currentStoryFile) { storyUploadMsg.textContent = 'Select a file.'; return; }

  storySubmitBtn.disabled = true;
  storySubmitBtn.textContent = 'Uploading...';
  storyUploadMsg.textContent = '';
  storyProgressWrap.style.display = 'block';

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
      thumbnail: currentStoryType === 'video' ? buildThumbnailUrl(result.secure_url, 'video') : result.secure_url,
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
    storyUploadMsg.textContent = err.message || 'Upload failed.';
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
        try { const errData = JSON.parse(xhr.responseText); if (errData.error?.message) errMsg = errData.error.message; }
        catch (e) { errMsg = 'HTTP ' + xhr.status; }
        reject(new Error(errMsg));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));
    xhr.send(formData);
  });
}