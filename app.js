/* ============================================================
   ReelHub — app.js (PART 1/4) — UPDATED
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

const CLOUDINARY_ACCOUNTS = [
  {
    cloudName: "s3eresx6",
    apiKey:    "349223397331644",
    preset:    "reelhub_video"
  }
];

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
const settingsBtn = document.getElementById('settingsBtn');

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
let shortsSoundEnabled = localStorage.getItem('shortsSound') === 'true';

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

document.querySelectorAll('.eye').forEach(eye => {
  eye.addEventListener('click', () => {
    const inp = document.getElementById(eye.dataset.target);
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
});

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
      isPrivate: false,
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

notifBtn.addEventListener('click', () => { setActiveNav(null); renderPage('notifications'); });
searchBtn.addEventListener('click', () => { setActiveNav(null); renderPage('search'); });

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
      if (typeof currentProfile.isPrivate !== 'boolean') currentProfile.isPrivate = false;
    } else {
      currentProfile = null;
    }
  } catch (e) {}
}

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
   ReelHub — app.js (PART 2/4) — YouTube Style Home Feed
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
    const viewDocId = `${currentUser.uid}_${postId}`;
    const viewRef = doc(db, 'postViews', viewDocId);
    const viewSnap = await getDoc(viewRef);

    if (!viewSnap.exists()) {
      await setDoc(viewRef, {
        userId: currentUser.uid,
        postId: postId,
        viewedAt: serverTimestamp()
      });

      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const currentViews = postSnap.data().views || 0;
        await updateDoc(postRef, { views: currentViews + 1 });
      }
    }
  } catch (e) {
    console.error('Track view error:', e);
  }
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
   HOME FEED — YouTube Style
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

    const blocked = currentProfile?.blockedUsers || [];
    posts = posts.filter(p => !blocked.includes(p.userId));

    // ✅ PRIVATE ACCOUNT FILTER
    const myFollowing = currentProfile?.following || [];
    const filteredPosts = [];
    for (const post of posts) {
      if (post.userId === currentUser.uid) {
        filteredPosts.push(post);
        continue;
      }
      try {
        const userSnap = await getDoc(doc(db, 'users', post.userId));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.isPrivate && !myFollowing.includes(post.userId)) {
            continue;
          }
        }
      } catch (e) {}
      filteredPosts.push(post);
    }
    posts = filteredPosts;

    // ✅ FEED ORDER SETTINGS
    const settings = typeof getSettings === 'function' ? getSettings() : { feedOrder: 'newest' };
    if (settings.feedOrder === 'trending') {
      posts.sort((a, b) => {
        const ta = (a.likes?.length || 0) + (a.views || 0);
        const tb = (b.likes?.length || 0) + (b.views || 0);
        return tb - ta;
      });
    } else if (settings.feedOrder === 'following') {
      posts = posts.filter(p => myFollowing.includes(p.userId) || p.userId === currentUser.uid);
      posts.sort((a, b) => {
        const ta = a.createdAt?.toDate?.()?.getTime() || 0;
        const tb = b.createdAt?.toDate?.()?.getTime() || 0;
        return tb - ta;
      });
    } else {
      posts.sort((a, b) => {
        const ta = a.createdAt?.toDate?.()?.getTime() || 0;
        const tb = b.createdAt?.toDate?.()?.getTime() || 0;
        return tb - ta;
      });
    }

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

/* ============================================================
   FEED POST — Router (Short / Long / Photo)
   ============================================================ */
function makeFeedPost(post) {
  if (post.type === 'short') {
    return makeShortCard(post);
  }
  return makeLongCard(post);
}

/* ============================================================
   SHORT VIDEO CARD (YouTube Shorts style — small)
   ============================================================ */
function makeShortCard(post) {
  const card = document.createElement('div');
  card.className = 'short-card-feed';
  card.dataset.postId = post.id;

  const avatar = post.userPhoto || defaultAvatar(post.userName);
  const thumbUrl = post.thumbnail || post.url;
  const isLiked = (post.likes || []).includes(currentUser.uid);
  const likesCount = (post.likes || []).length;
  const viewsCount = post.views || 0;

  card.innerHTML = `
    <div class="short-card-thumb">
      <img src="${thumbUrl}" alt="" loading="lazy">
      <div class="short-card-badge">SHORT</div>
      <div class="short-card-views">👁 ${viewsCount}</div>
      <div class="short-card-play">▶</div>
    </div>
    <div class="short-card-info">
      <img class="short-card-avatar" src="${avatar}" alt="">
      <div class="short-card-meta">
        <div class="short-card-caption">${escapeHtml(post.caption || post.userName || 'Short video')}</div>
        <div class="short-card-sub">${escapeHtml(post.userName || 'User')} · ${likesCount} ❤️</div>
      </div>
    </div>
  `;

  // Click → Open shorts player
  let lastTap = 0;
  let tapTimer = null;
  card.addEventListener('click', () => {
    const s = typeof getSettings === 'function' ? getSettings() : { doubleTapLike: true };
    if (!s.doubleTapLike) {
      openPostPlayer(post);
      return;
    }
    const now = Date.now();
    if (now - lastTap < 350) {
      clearTimeout(tapTimer);
      lastTap = 0;
      handleDoubleTapLike(post, card);
    } else {
      lastTap = now;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        lastTap = 0;
        openPostPlayer(post);
      }, 350);
    }
  });

  trackPostView(post.id);
  return card;
}

/* ============================================================
   LONG VIDEO / PHOTO CARD (YouTube style — big)
   ============================================================ */
function makeLongCard(post) {
  const card = document.createElement('div');
  card.className = 'long-card-feed';
  card.dataset.postId = post.id;

  const avatar = post.userPhoto || defaultAvatar(post.userName);
  const thumbUrl = post.thumbnail || (post.type === 'photo' ? post.url : '');
  const isLiked = (post.likes || []).includes(currentUser.uid);
  const likesCount = (post.likes || []).length;
  const commentsCount = (post.comments || []).length;
  const viewsCount = post.views || 0;
  const settings = typeof getSettings === 'function' ? getSettings() : { showViews: true };

  card.innerHTML = `
    <div class="long-card-thumb">
      ${post.type === 'photo'
        ? `<img src="${post.url}" alt="" loading="lazy">`
        : `<img src="${thumbUrl}" alt="" loading="lazy">`}
      ${post.type !== 'photo' ? `
        <div class="long-card-badge">${post.type === 'long' ? 'LONG' : 'VIDEO'}</div>
        <div class="long-card-play-icon">
          <svg viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        ${settings.showViews !== false ? `<div class="long-card-duration">👁 ${viewsCount}</div>` : ''}
      ` : ''}
    </div>
    <div class="long-card-info">
      <img class="long-card-avatar" src="${avatar}" alt="">
      <div class="long-card-meta">
        <div class="long-card-title">${escapeHtml(post.caption || 'Untitled')}</div>
        <div class="long-card-channel">${escapeHtml(post.userName || 'User')}</div>
        <div class="long-card-stats">${settings.showViews !== false ? viewsCount + ' views · ' : ''}${likesCount} likes · ${commentsCount} comments</div>
      </div>
    </div>
    <div class="long-card-actions">
      <button class="like-btn ${isLiked ? 'liked' : ''}" data-post="${post.id}" ${isLiked ? 'disabled' : ''}>
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
      ${buildSaveButtonHTML(post.id)}
    </div>
  `;

  card.querySelector('.long-card-thumb').addEventListener('click', () => {
    openPostPlayer(post);
  });

  card.querySelector('.like-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleLike(post.id, e.currentTarget);
  });

  card.querySelector('.comment-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openComments(post.id, post.caption || 'Comments');
  });

  card.querySelector('.share-btn-feed').addEventListener('click', async (e) => {
    e.stopPropagation();
    await sharePost(post);
  });

  const saveBtn = card.querySelector('.save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await toggleSavePost(post.id, e.currentTarget);
    });
  }

  trackPostView(post.id);
  return card;
}

/* ============================================================
   Post Player — YouTube style modal
   ============================================================ */
function openPostPlayer(post) {
  playerTitle.textContent = post.caption || (post.type === 'photo' ? 'Photo' : 'Video');

  if (post.type === 'photo') {
    playerContent.innerHTML = `<img src="${post.url}" alt="">`;
  } else if (post.type === 'short') {
    playerContent.innerHTML = `
      <div class="player-short-wrap">
        <video src="${post.url}" controls autoplay playsinline
               style="width:100%;max-height:75vh;background:#000;border-radius:8px;"></video>
      </div>
    `;
  } else {
    playerContent.innerHTML = `
      <div class="player-youtube-wrap">
        <video src="${post.url}" controls autoplay playsinline
               ${post.thumbnail ? `poster="${post.thumbnail}"` : ''}
               style="width:100%;max-height:75vh;background:#000;"></video>
        <div class="player-youtube-info">
          <div class="player-youtube-title">${escapeHtml(post.caption || 'Video')}</div>
          <div class="player-youtube-channel">${escapeHtml(post.userName || 'User')}</div>
        </div>
      </div>
    `;
  }

  playerModal.classList.add('show');
}

/* ============================================================
   Double Tap Like Helper
   ============================================================ */
async function handleDoubleTapLike(post, cardEl) {
  if ((post.likes || []).includes(currentUser.uid)) return;
  const likeBtn = cardEl.querySelector('.like-btn');
  if (likeBtn) await toggleLike(post.id, likeBtn);
  showHeartAnimation(cardEl);
  if (navigator.vibrate) navigator.vibrate(50);
}

function showHeartAnimation(container) {
  const existing = container.querySelector('.heart-animation');
  if (existing) existing.remove();

  const heart = document.createElement('div');
  heart.className = 'heart-animation';
  heart.innerHTML = '❤️';
  heart.style.cssText = `
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 100px;
    pointer-events: none;
    animation: heartPop 0.8s ease forwards;
    z-index: 100;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
  `;
  container.style.position = 'relative';
  container.appendChild(heart);
  setTimeout(() => heart.remove(), 800);
}

/* ============================================================
   POST MENU (Report / Block / Delete)
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

async function deletePost(postId) {
  const settings = typeof getSettings === 'function' ? getSettings() : { confirmDelete: true };
  if (settings.confirmDelete && !confirm('Delete this post permanently?')) return;
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
   Auto Play (Long video only)
   ============================================================ */
function setupFeedAutoplay() {
  const settings = typeof getSettings === 'function' ? getSettings() : { autoPlay: true };
  if (!settings.autoPlay) return;

  const videos = document.querySelectorAll('.long-card-feed video, .feed-post-media video');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        video.muted = !settings.autoplaySound;
        video.loop = settings.videoLoop !== false;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: [0, 0.6, 1] });
  videos.forEach(v => observer.observe(v));
}

/* ============================================================
   STORIES BAR
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
/* ============================================================
   ReelHub — app.js (PART 3/4)
   Story Viewer, Shorts (Auto Sound), Like, Share, Comments
   ============================================================ */

/* ============================================================
   STORY VIEWER
   ============================================================ */
function openStoryViewer(userId) {
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
  if (!userGroup) { closeStoryViewer(); return; }
  const story = userGroup.stories[currentStoryIndex];
  if (!story) {
    if (currentStoryUserIndex < storiesByUser.length - 1) {
      currentStoryUserIndex++;
      currentStoryIndex = 0;
      renderCurrentStory();
    } else closeStoryViewer();
    return;
  }

  storyUserAvatar.src = userGroup.userPhoto || defaultAvatar(userGroup.userName);
  storyUserName.textContent = userGroup.userName || 'User';
  const time = story.createdAt?.toDate?.();
  storyTime.textContent = time ? timeAgo(time) : 'just now';

  const isOwnStory = userGroup.userId === currentUser.uid;
  storyDeleteBtn.style.display = isOwnStory ? 'block' : 'none';

  const viewersBtn = document.getElementById('storyViewersBtn');
  const viewersCountEl = document.getElementById('storyViewersCount');
  if (viewersBtn) {
    if (isOwnStory) {
      viewersBtn.style.display = 'inline-flex';
      if (viewersCountEl) viewersCountEl.textContent = (story.viewers || []).length;
    } else {
      viewersBtn.style.display = 'none';
    }
  }

  storyProgressBars.innerHTML = '';
  userGroup.stories.forEach((s, idx) => {
    const seg = document.createElement('div');
    seg.className = 'story-progress-segment';
    const fill = document.createElement('div');
    fill.className = 'story-progress-fill';
    if (idx < currentStoryIndex) fill.style.width = '100%';
    seg.appendChild(fill);
    storyProgressBars.appendChild(seg);
  });

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
    video.loop = false;
    storyMedia.appendChild(video);
    currentStoryMediaEl = video;
  }

  markStoryViewed(story.id);

  const duration = (story.type === 'photo' ? 5 : (story.duration || 5)) * 1000;
  startStoryProgress(duration);
}

function startStoryProgress(duration) {
  const fills = storyProgressBars.querySelectorAll('.story-progress-fill');
  const currentFill = fills[currentStoryIndex];
  if (!currentFill) return;
  let startTime = Date.now();

  storyProgressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const percent = Math.min((elapsed / duration) * 100, 100);
    currentFill.style.width = percent + '%';
    if (percent >= 100) {
      clearInterval(storyProgressInterval);
      storyProgressInterval = null;
      nextStory();
    }
  }, 50);

  storyAutoAdvanceTimeout = setTimeout(() => nextStory(), duration + 100);
}

function clearStoryTimers() {
  if (storyProgressInterval) { clearInterval(storyProgressInterval); storyProgressInterval = null; }
  if (storyAutoAdvanceTimeout) { clearTimeout(storyAutoAdvanceTimeout); storyAutoAdvanceTimeout = null; }
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
    if (currentStoryUserIndex < storiesByUser.length - 1) {
      currentStoryUserIndex++;
      currentStoryIndex = 0;
      renderCurrentStory();
    } else closeStoryViewer();
  }
}

function prevStory() {
  clearStoryTimers();
  if (currentStoryIndex > 0) {
    currentStoryIndex--;
    renderCurrentStory();
  } else {
    if (currentStoryUserIndex > 0) {
      currentStoryUserIndex--;
      const prevUser = storiesByUser[currentStoryUserIndex];
      currentStoryIndex = prevUser.stories.length - 1;
      renderCurrentStory();
    } else {
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
  document.getElementById('storyViewersSheet')?.remove();
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

storyCloseBtn.addEventListener('click', closeStoryViewer);
storyTapLeft.addEventListener('click', prevStory);
storyTapRight.addEventListener('click', nextStory);

document.getElementById('storyViewersBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const userGroup = storiesByUser[currentStoryUserIndex];
  if (!userGroup) return;
  const story = userGroup.stories[currentStoryIndex];
  if (!story) return;
  showStoryViewers(story);
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
    userGroup.stories.splice(currentStoryIndex, 1);
    if (userGroup.stories.length === 0) {
      storiesByUser.splice(currentStoryUserIndex, 1);
      if (storiesByUser.length === 0) { closeStoryViewer(); renderHomeFeed(); return; }
      if (currentStoryUserIndex >= storiesByUser.length) currentStoryUserIndex = storiesByUser.length - 1;
      currentStoryIndex = 0;
    } else if (currentStoryIndex >= userGroup.stories.length) {
      currentStoryIndex = userGroup.stories.length - 1;
    }
    renderCurrentStory();
  } catch (e) { showToast('❌ Could not delete'); }
});

/* ============================================================
   SHORTS FEED — AUTO SOUND SYSTEM
   ============================================================ */
async function renderShortsFeed() {
  content.innerHTML = `
    <div class="shorts-wrap" id="shortsWrap">
      <div class="shorts-empty"><div class="page-title">Loading shorts...</div></div>
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

    let shorts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const blocked = currentProfile?.blockedUsers || [];
    shorts = shorts.filter(s => !blocked.includes(s.userId));

    shorts.sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });

    shorts.forEach(short => trackPostView(short.id));

    wrap.innerHTML = '';
    shorts.forEach(short => wrap.appendChild(makeShortItem(short)));
    setupShortsAutoplay(wrap);

    if (shortsSoundEnabled) {
      setTimeout(() => {
        const firstVideo = wrap.querySelector('.short-item video');
        if (firstVideo) {
          firstVideo.muted = false;
          firstVideo.play().catch(() => {
            firstVideo.muted = true;
            firstVideo.play().catch(() => {});
          });
        }
      }, 300);
    }

    if (!shortsSoundEnabled) {
      showTapToUnmuteOverlay(wrap);
    }

  } catch (e) {
    wrap.innerHTML = `<div class="shorts-empty"><h3>Could not load shorts</h3></div>`;
  }
}

function showTapToUnmuteOverlay(wrap) {
  wrap.querySelector('.tap-to-unmute-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'tap-to-unmute-overlay';
  overlay.innerHTML = `
    <div class="unmute-content">
      <div class="unmute-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      </div>
      <div class="unmute-text">Tap to Unmute</div>
    </div>
  `;

  wrap.appendChild(overlay);

  overlay.addEventListener('click', () => {
    shortsSoundEnabled = true;
    localStorage.setItem('shortsSound', 'true');

    wrap.querySelectorAll('.short-item video').forEach(v => {
      v.muted = false;
    });

    overlay.remove();

    const currentVideo = getCurrentVisibleVideo(wrap);
    if (currentVideo) currentVideo.play().catch(() => {});

    showToast('🔊 Sound ON');
  });
}

function getCurrentVisibleVideo(wrap) {
  const videos = wrap.querySelectorAll('.short-item video');
  for (let v of videos) {
    const rect = v.getBoundingClientRect();
    if (rect.top >= 0 && rect.bottom <= window.innerHeight) return v;
    if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) return v;
  }
  return videos[0];
}

function makeShortItem(short) {
  const item = document.createElement('div');
  item.className = 'short-item';
  item.dataset.postId = short.id;

  const avatar = short.userPhoto || defaultAvatar(short.userName);
  const isLiked = (short.likes || []).includes(currentUser.uid);
  const likesCount = (short.likes || []).length;
  const commentsCount = (short.comments || []).length;
  const isSaved = isPostSaved(short.id);

  const mutedAttr = shortsSoundEnabled ? '' : 'muted';

  item.innerHTML = `
    <video src="${short.url}" loop ${mutedAttr} playsinline preload="metadata"
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
          <button class="like-btn ${isLiked ? 'liked' : ''}" data-post="${short.id}" ${isLiked ? 'disabled' : ''}>
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
          <button class="save-btn ${isSaved ? 'saved' : ''}" data-post="${short.id}" title="Save">
            <svg viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
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

  const videoEl = item.querySelector('video');
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
  const saveBtn = item.querySelector('.save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await toggleSavePost(short.id, e.currentTarget);
    });
  }
  item.querySelector('.share-btn-short').addEventListener('click', async (e) => {
    e.stopPropagation();
    await sharePost(short);
  });

  // Sound toggle on tap
  videoEl.addEventListener('click', () => {
    videoEl.muted = !videoEl.muted;
    shortsSoundEnabled = !videoEl.muted;
    localStorage.setItem('shortsSound', shortsSoundEnabled ? 'true' : 'false');
    showToast(videoEl.muted ? '🔇 Sound OFF' : '🔊 Sound ON');
    if (!videoEl.muted) videoEl.play().catch(() => {});
  });

  return item;
}

function setupShortsAutoplay(wrap) {
  const settings = typeof getSettings === 'function' ? getSettings() : { autoPlay: true };
  stopShortsObserver();
  const videos = wrap.querySelectorAll('.short-item video');
  shortsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        if (settings.autoPlay) {
          video.muted = !shortsSoundEnabled;
          video.play().catch(() => {
            video.muted = true;
            video.play().catch(() => {});
          });
        }
      } else {
        video.pause();
      }
    });
  }, { threshold: [0, 0.6, 1] });
  videos.forEach(v => shortsObserver.observe(v));
}

function stopShortsObserver() {
  if (shortsObserver) { shortsObserver.disconnect(); shortsObserver = null; }
  document.querySelectorAll('.short-item video').forEach(v => { try { v.pause(); } catch (e) {} });
}

/* ============================================================
   LIKE SYSTEM
   ✅ Ek user ek hi baar like kar sakta hai
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
      showToast('❤️ Already liked');
      return;
    }

    await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
    const countSpan = btnEl.querySelector('span');
    if (countSpan) countSpan.textContent = likes.length + 1;
    btnEl.classList.add('liked');
    btnEl.disabled = true;
    showToast('❤️ Liked');
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
  if (navigator.share) {
    try { await navigator.share({ title: 'ReelHub Post', text: shareText, url: appUrl }); return; }
    catch (err) { if (err.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(shareText); showToast('✅ Link copied!'); }
  catch (err) { showToast('❌ Could not share'); }
}

/* ============================================================
   COMMENTS
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
    commentsList.innerHTML = `<div class="comments-empty">Could not load</div>`;
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
      </div>`;
    return;
  }
  commentsList.innerHTML = '';
  comments.forEach(comment => commentsList.appendChild(makeCommentItem(comment, false)));
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
  if (comment.replyToHandle) replyToHtml = `<span class="mention">@${escapeHtml(comment.replyToHandle)}</span> `;

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
          ${isOwner ? `<button class="comment-delete-btn" data-comment="${comment.id}">🗑️</button>` : ''}
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
    const settings = typeof getSettings === 'function' ? getSettings() : { confirmDelete: true };
    if (settings.confirmDelete && !confirm('Delete?')) return;
    await deleteComment(comment.id);
  });
  const toggleBtn = item.querySelector('.replies-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const repliesList = item.querySelector('.replies-list');
      const isHidden = repliesList.classList.contains('replies-hidden');
      if (isHidden) {
        repliesList.innerHTML = '';
        (comment.replies || []).forEach(reply => repliesList.appendChild(makeCommentItem(reply, true)));
        repliesList.classList.remove('replies-hidden');
        toggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
          <span>Hide ${comment.replies.length}</span>
        `;
      } else {
        repliesList.classList.add('replies-hidden');
        toggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          <span>View ${comment.replies.length}</span>
        `;
      }
    });
  }
  return item;
}

commentInput.addEventListener('input', () => { postCommentBtn.disabled = !commentInput.value.trim(); });

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
    if (isLiked) await updateDoc(ref, { likes: arrayRemove(currentUser.uid) });
    else await updateDoc(ref, { likes: arrayUnion(currentUser.uid) });
    const newCount = isLiked ? likes.length - 1 : likes.length + 1;
    const countEl = btnEl.querySelector('.comment-like-count');
    if (countEl) countEl.textContent = newCount > 0 ? newCount : '';
    btnEl.classList.toggle('liked', !isLiked);
  } catch (e) {}
}

async function deleteComment(commentId) {
  try {
    await deleteDoc(doc(db, 'comments', commentId));
    const repliesQ = query(collection(db, 'comments'), where('parentId', '==', commentId));
    const repliesSnap = await getDocs(repliesQ);
    for (const replyDoc of repliesSnap.docs) await deleteDoc(doc(db, 'comments', replyDoc.id));
    showToast('Comment deleted');
    await loadComments();
  } catch (e) { showToast('❌ Could not delete'); }
}
/* ============================================================
   ReelHub — app.js (PART 4/4) — UPDATED
   Chat, Profile, Upload, Notifications, Search, 30 Settings, Helpers
   ============================================================ */

/* ============================================================
   CHATS PAGE
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
      <div class="chats-list" id="chatsList"><div class="empty-msg">Loading chats...</div></div>
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
          <p>Start a conversation</p>
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
    if (validChats.length === 0) { wrap.innerHTML = `<div class="empty-msg">No valid chats</div>`; return; }
    wrap.innerHTML = '';
    validChats.forEach(chat => wrap.appendChild(makeChatItem(chat)));
  } catch (e) { wrap.innerHTML = `<div class="empty-msg">Could not load</div>`; }
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
    lastMsgHtml = `<div class="last-msg voice ${hasUnread ? 'unread' : ''}">🎤 Voice message</div>`;
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

function openNewChatModal() {
  newChatSearch.value = '';
  newChatResults.innerHTML = `<div class="search-empty">Start typing...</div>`;
  newChatModal.classList.add('show');
  newChatSearch.focus();
}

document.getElementById('closeNewChat').addEventListener('click', () => newChatModal.classList.remove('show'));
newChatModal.addEventListener('click', (e) => { if (e.target === newChatModal) newChatModal.classList.remove('show'); });

let newChatDebounce = null;
newChatSearch.addEventListener('input', (e) => {
  clearTimeout(newChatDebounce);
  newChatDebounce = setTimeout(() => searchUsersForChat(e.target.value.trim()), 300);
});

async function searchUsersForChat(term) {
  if (!term) { newChatResults.innerHTML = `<div class="search-empty">Start typing...</div>`; return; }
  newChatResults.innerHTML = `<div class="search-empty">Searching...</div>`;
  try {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    const lowerTerm = term.toLowerCase();
    const blocked = currentProfile?.blockedUsers || [];
    const matches = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.id !== currentUser.uid && !blocked.includes(u.id))
      .filter(u => (u.name || '').toLowerCase().includes(lowerTerm) || (u.user || '').toLowerCase().includes(lowerTerm))
      .slice(0, 20);
    if (matches.length === 0) { newChatResults.innerHTML = `<div class="search-empty">No users found</div>`; return; }
    newChatResults.innerHTML = '';
    matches.forEach(u => {
      const row = document.createElement('div');
      row.className = 'search-user';
      row.innerHTML = `
        <img src="${u.photo || defaultAvatar(u.name)}" alt="">
        <div class="info"><b>${escapeHtml(u.name)}</b><span>@${escapeHtml(u.user)}</span></div>
        <button class="follow">Chat</button>
      `;
      row.addEventListener('click', () => { newChatModal.classList.remove('show'); openChatWindow(u); });
      newChatResults.appendChild(row);
    });
  } catch (e) { newChatResults.innerHTML = `<div class="search-empty">Search failed</div>`; }
}

/* ============================================================
   CHAT WINDOW
   ============================================================ */
function getChatId(uid1, uid2) { return [uid1, uid2].sort().join('_'); }

async function openChatWindow(otherUser) {
  if (!otherUser || otherUser.uid === currentUser.uid) return;
  activeChatId = getChatId(currentUser.uid, otherUser.uid);
  activeChatUser = otherUser;
  chatHeaderAvatar.src = otherUser.photo || defaultAvatar(otherUser.name);
  chatHeaderName.textContent = otherUser.name || 'User';
  chatHeaderHandle.textContent = '@' + (otherUser.user || '');
  chatHeaderInfo.onclick = () => { closeChatWindow(); openUserProfile(otherUser.uid); };
  chatMessages.innerHTML = `<div class="empty-msg">Loading messages...</div>`;
  chatMessageInput.value = '';
  updateSendTextBtn();
  chatWindowModal.classList.add('show');
  await loadChatMessages();
  await markChatRead();
}

function closeChatWindow() {
  chatWindowModal.classList.remove('show');
  if (chatMessagesUnsub) { clearInterval(chatMessagesUnsub); chatMessagesUnsub = null; }
  removePinnedBanner();
  document.querySelectorAll('.msg-actions-menu, .edit-msg-modal').forEach(el => el.remove());
  activeChatId = null;
  activeChatUser = null;
  pinnedMessage = null;
  stopVoicePlayback();
}

document.getElementById('closeChatWindow').addEventListener('click', closeChatWindow);

async function loadChatMessages() {
  if (!activeChatId) return;

  try {
    await fetchAndPaintMessages();
    await loadPinnedMessage();

    if (chatMessagesUnsub) clearInterval(chatMessagesUnsub);
    chatMessagesUnsub = setInterval(async () => {
      if (!activeChatId) return;
      await fetchAndPaintMessages();
    }, 3000);

  } catch (e) {
    chatMessages.innerHTML = `<div class="chat-empty">Could not load</div>`;
  }
}

async function fetchAndPaintMessages() {
  if (!activeChatId) return;
  try {
    const msgsRef = collection(db, 'chats', activeChatId, 'messages');
    const snap = await getDocs(msgsRef);
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    messages.sort((a, b) => {
      let ta = 0, tb = 0;
      if (a.time?.toDate) ta = a.time.toDate().getTime();
      else if (a.time?.seconds) ta = a.time.seconds * 1000;
      if (b.time?.toDate) tb = b.time.toDate().getTime();
      else if (b.time?.seconds) tb = b.time.seconds * 1000;
      return ta - tb;
    });

    paintChatMessages(messages);
    await markMessagesAsRead(messages);
  } catch (e) {
    console.error('fetchAndPaintMessages error:', e);
  }
}

function paintChatMessages(messages) {
  if (messages.length === 0) {
    chatMessages.innerHTML = `<div class="chat-empty">No messages yet<br>Say hi! 👋</div>`;
    return;
  }

  const currentIds = Array.from(chatMessages.querySelectorAll('.msg-row'))
    .map(el => el.dataset.msgId).join(',');
  const newIds = messages.map(m => m.id).join(',');

  if (currentIds === newIds) return;

  const wasAtBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 150;
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

  if (wasAtBottom) {
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
  }
}

function makeMessageBubble(msg) {
  const row = document.createElement('div');
  const isMe = msg.from === currentUser.uid;
  row.className = 'msg-row ' + (isMe ? 'me' : 'other');
  row.dataset.msgId = msg.id;

  const time = msg.time?.toDate?.();
  const timeStr = time ? formatTime(time) : '';

  if (msg.deleted) {
    row.innerHTML = `
      <div class="msg-bubble deleted">
        <div class="deleted-text">🚫 This message was deleted</div>
      </div>
      ${isMe ? buildDotsButton(msg) : ''}
    `;
    if (isMe) attachDotsButton(row, msg);
    return row;
  }

  if (msg.type === 'voice') {
    const duration = msg.voiceDuration || 0;
    const bars = [];
    for (let i = 0; i < 22; i++) bars.push(30 + Math.floor(Math.random() * 70));

    row.innerHTML = `
      ${isMe ? buildDotsButton(msg) : ''}
      <div class="msg-bubble voice-bubble" data-msg="${msg.id}">
        <button class="voice-play-btn" data-play="${msg.id}">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>
        </button>
        <div class="voice-waveform">
          ${bars.map(h => `<div class="bar" style="height:${h}%"></div>`).join('')}
        </div>
        <div class="voice-duration">${formatVoiceDuration(duration)}</div>
        <div class="msg-time" style="position:absolute;bottom:-14px;right:0;">${timeStr}${isMe ? buildTicksHTML(msg) : ''}</div>
      </div>
      ${!isMe ? buildDotsButton(msg) : ''}
    `;

    const playBtn = row.querySelector('.voice-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await playVoiceMessage(msg, row.querySelector('.voice-waveform'), playBtn);
      });
    }

  } else {
    const editedLabel = msg.edited ? '<span class="edited-label">(edited)</span>' : '';

    row.innerHTML = `
      ${isMe ? buildDotsButton(msg) : ''}
      <div class="msg-bubble" data-msg="${msg.id}">
        ${escapeHtml(msg.text || '')}${editedLabel}
        <div class="msg-time">${timeStr}${isMe ? buildTicksHTML(msg) : ''}</div>
      </div>
      ${!isMe ? buildDotsButton(msg) : ''}
    `;
  }

  if (isMe) attachDotsButton(row, msg);
  return row;
}

function buildDotsButton(msg) {
  return `
    <button class="msg-dots-btn" data-msg="${msg.id}" title="Options">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    </button>
  `;
}

function attachDotsButton(row, msg) {
  const dotsBtn = row.querySelector('.msg-dots-btn');
  if (!dotsBtn) return;
  dotsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showMessageActionsMenu(dotsBtn, msg);
  });
}

function showMessageActionsMenu(anchorEl, msg) {
  document.querySelectorAll('.msg-actions-menu').forEach(el => el.remove());

  const menu = document.createElement('div');
  menu.className = 'msg-actions-menu';

  const isPinned = pinnedMessage?.id === msg.id;
  let menuHTML = '';

  if (msg.type === 'text' && !msg.deleted) {
    menuHTML += `
      <button data-action="edit">
        <svg viewBox="0 0 24 24">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit
      </button>
    `;
  }

  if (msg.type === 'text' && !msg.deleted && msg.text) {
    menuHTML += `
      <button data-action="copy">
        <svg viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy
      </button>
    `;
  }

  if (!msg.deleted) {
    menuHTML += `
      <button data-action="pin">
        <svg viewBox="0 0 24 24">
          <line x1="12" y1="17" x2="12" y2="22"/>
          <path d="M5 17h14l-1.5-7.5L19 5l-7 1-7-1 1.5 4.5z"/>
        </svg>
        ${isPinned ? 'Unpin' : 'Pin'}
      </button>
    `;
  }

  menuHTML += `
    <div class="menu-divider"></div>
    <button data-action="delete" class="danger">
      <svg viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
      </svg>
      Delete
    </button>
  `;

  menu.innerHTML = menuHTML;
  document.body.appendChild(menu);

  const rect = anchorEl.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();

  let top = rect.bottom + 5;
  let left = rect.left - menuRect.width + rect.width;

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

      if (action === 'edit') await openEditMessageModal(msg);
      else if (action === 'copy') await copyMessageText(msg);
      else if (action === 'pin') await togglePinMessage(msg);
      else if (action === 'delete') {
        const settings = typeof getSettings === 'function' ? getSettings() : { confirmDelete: true };
        if (!settings.confirmDelete || confirm('Delete this message?')) await deleteMessage(msg.id);
      }
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

async function openEditMessageModal(msg) {
  document.querySelectorAll('.edit-msg-modal').forEach(el => el.remove());

  const modal = document.createElement('div');
  modal.className = 'edit-msg-modal';
  modal.innerHTML = `
    <div class="edit-msg-box">
      <h3>✏️ Edit Message</h3>
      <textarea id="editMsgText" maxlength="1000">${escapeHtml(msg.text || '')}</textarea>
      <div class="edit-msg-actions">
        <button class="cancel-btn" id="cancelEditBtn">Cancel</button>
        <button class="save-btn" id="saveEditBtn">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const textarea = modal.querySelector('#editMsgText');
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);

  modal.querySelector('#cancelEditBtn').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  modal.querySelector('#saveEditBtn').addEventListener('click', async () => {
    const newText = textarea.value.trim();
    if (!newText) { showToast('❌ Cannot be empty'); return; }
    if (newText === msg.text) { modal.remove(); return; }
    await editMessage(msg.id, newText);
    modal.remove();
  });
}

async function editMessage(msgId, newText) {
  if (!activeChatId || !currentUser) return;
  try {
    await updateDoc(doc(db, 'chats', activeChatId, 'messages', msgId), {
      text: newText,
      edited: true,
      editedAt: serverTimestamp()
    });
    showToast('✏️ Message edited');
    await fetchAndPaintMessages();
  } catch (e) { showToast('❌ Could not edit'); }
}

async function copyMessageText(msg) {
  if (!msg.text) return;
  try {
    await navigator.clipboard.writeText(msg.text);
    showToast('📋 Copied');
  } catch (e) {
    const textarea = document.createElement('textarea');
    textarea.value = msg.text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); showToast('📋 Copied'); }
    catch (err) { showToast('❌ Could not copy'); }
    document.body.removeChild(textarea);
  }
}

function buildTicksHTML(msg) {
  if (msg.from !== currentUser.uid) return '';
  const settings = typeof getSettings === 'function' ? getSettings() : { readReceipts: true };
  if (settings.readReceipts === false) return '';

  if (msg.read) {
    return `<span class="msg-ticks read">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
    </span>`;
  } else if (msg.delivered) {
    return `<span class="msg-ticks delivered">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
    </span>`;
  } else {
    return `<span class="msg-ticks sent">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
    </span>`;
  }
}

async function markMessagesAsRead(messages) {
  if (!currentUser || !activeChatId) return;
  try {
    for (const msg of messages) {
      if (msg.to === currentUser.uid && !msg.read) {
        await updateDoc(doc(db, 'chats', activeChatId, 'messages', msg.id), {
          read: true,
          readAt: serverTimestamp()
        });
      }
      if (msg.from === currentUser.uid && !msg.delivered) {
        await updateDoc(doc(db, 'chats', activeChatId, 'messages', msg.id), {
          delivered: true
        });
      }
    }
  } catch (e) {}
}

async function deleteMessage(msgId) {
  if (!activeChatId || !currentUser) return;
  try {
    await updateDoc(doc(db, 'chats', activeChatId, 'messages', msgId), {
      deleted: true,
      deletedAt: serverTimestamp(),
      text: null,
      voiceData: null
    });
    showToast('🗑️ Message deleted');
    await fetchAndPaintMessages();
  } catch (e) { showToast('❌ Could not delete'); }
}

async function togglePinMessage(msg) {
  if (!activeChatId || !currentUser) return;
  try {
    const chatRef = doc(db, 'chats', activeChatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) return;

    const currentPin = chatSnap.data().pinnedMessage || null;

    if (currentPin === msg.id) {
      await updateDoc(chatRef, { pinnedMessage: null });
      pinnedMessage = null;
      showToast('Unpinned');
    } else {
      await updateDoc(chatRef, { pinnedMessage: msg.id });
      pinnedMessage = msg;
      showToast('📌 Pinned');
    }
    await loadPinnedMessage();
  } catch (e) { showToast('❌ Could not pin'); }
}

async function loadPinnedMessage() {
  if (!activeChatId) return;
  try {
    const chatRef = doc(db, 'chats', activeChatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) { pinnedMessage = null; removePinnedBanner(); return; }

    const pinId = chatSnap.data().pinnedMessage;
    if (!pinId) { pinnedMessage = null; removePinnedBanner(); return; }

    const msgSnap = await getDoc(doc(db, 'chats', activeChatId, 'messages', pinId));
    if (!msgSnap.exists()) { pinnedMessage = null; removePinnedBanner(); return; }

    pinnedMessage = { id: pinId, ...msgSnap.data() };
    renderPinnedBanner(pinnedMessage);
  } catch (e) {}
}

function renderPinnedBanner(msg) {
  removePinnedBanner();
  const chatWindow = document.getElementById('chatWindow');
  if (!chatWindow) return;

  const banner = document.createElement('div');
  banner.className = 'pinned-banner';
  banner.id = 'pinnedBanner';

  const previewText = msg.deleted
    ? '🚫 Deleted message'
    : (msg.type === 'voice' ? '🎤 Voice message' : (msg.text || ''));

  banner.innerHTML = `
    <svg viewBox="0 0 24 24">
      <line x1="12" y1="17" x2="12" y2="22"/>
      <path d="M5 17h14l-1.5-7.5L19 5l-7 1-7-1 1.5 4.5z"/>
    </svg>
    <div class="pin-text">
      <b>📌 Pinned</b>
      ${escapeHtml(previewText).substring(0, 60)}${previewText.length > 60 ? '...' : ''}
    </div>
    <button class="pin-close" id="unpinBtn">✕</button>
  `;

  const chatHeader = chatWindow.querySelector('.chat-header');
  if (chatHeader) chatHeader.insertAdjacentElement('afterend', banner);
  chatMessages.classList.add('has-pinned');

  banner.querySelector('#unpinBtn').addEventListener('click', async () => {
    if (!activeChatId) return;
    try {
      await updateDoc(doc(db, 'chats', activeChatId), { pinnedMessage: null });
      pinnedMessage = null;
      removePinnedBanner();
      showToast('Unpinned');
    } catch (e) {}
  });
}

function removePinnedBanner() {
  document.getElementById('pinnedBanner')?.remove();
  chatMessages.classList.remove('has-pinned');
}

async function sendMessage(msgData) {
  if (!activeChatId || !activeChatUser) return;

  const message = {
    from: currentUser.uid,
    to: activeChatUser.uid,
    type: msgData.type || 'text',
    text: msgData.text || null,
    voiceData: msgData.voiceData || null,
    voiceDuration: msgData.voiceDuration || null,
    delivered: false,
    read: false,
    deleted: false,
    edited: false,
    time: serverTimestamp()
  };

  try {
    const tempId = 'temp_' + Date.now();
    const tempMsg = {
      id: tempId,
      ...message,
      time: { toDate: () => new Date() }
    };

    if (chatMessages.querySelector('.chat-empty')) chatMessages.innerHTML = '';
    chatMessages.appendChild(makeMessageBubble(tempMsg));
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const settings = typeof getSettings === 'function' ? getSettings() : { vibration: true };
    if (settings.vibration && navigator.vibrate) navigator.vibrate(30);

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

    setTimeout(() => fetchAndPaintMessages(), 800);

  } catch (e) {
    console.error('Send error:', e);
    showToast('❌ Could not send');
    await fetchAndPaintMessages();
  }
}

async function markChatRead() {
  if (!activeChatId) return;
  try {
    await updateDoc(doc(db, 'chats', activeChatId), { unreadBy: arrayRemove(currentUser.uid) });
    checkChatsUnread();
  } catch (e) {}
}

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
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextBtn.click(); }
});

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
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
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
      if (finalSeconds < 1) { showToast('Too short'); resolve(); return; }
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      if (audioBlob.size > 500 * 1024) { showToast('Voice too large'); resolve(); return; }
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

async function playVoiceMessage(msg, waveformEl, btnEl) {
  if (currentPlayingAudio && currentPlayingBtn === btnEl) { stopVoicePlayback(); return; }
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
  } catch (e) { stopVoicePlayback(); }
}

function stopVoicePlayback() {
  if (currentPlayingAudio) { try { currentPlayingAudio.pause(); } catch (e) {} currentPlayingAudio = null; }
  if (currentPlayingBtn) {
    currentPlayingBtn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>`;
    currentPlayingBtn = null;
  }
  document.querySelectorAll('.voice-waveform.playing').forEach(el => el.classList.remove('playing'));
}

function startChatListWatcher() {
  stopChatListWatcher();
  checkChatsUnread();
  chatListInterval = setInterval(checkChatsUnread, 15000);
}

function stopChatListWatcher() {
  if (chatListInterval) { clearInterval(chatListInterval); chatListInterval = null; }
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
      if (data.lastMessageBy !== currentUser.uid && (data.unreadBy || []).includes(currentUser.uid)) hasUnread = true;
    });
    if (chatsDot) chatsDot.style.display = hasUnread ? 'block' : 'none';
  } catch (e) {}
}

/* ============================================================
   PROFILE (OWN)
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

      <div class="profile-tabs two-tabs">
        <button class="profile-tab active" data-tab="posts">Posts</button>
        <button class="profile-tab" data-tab="saved">🔖 Saved</button>
      </div>
      <div class="profile-grid" id="myPostsGrid"><div class="grid-empty">Loading posts...</div></div>
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

  const profileTabs = document.querySelectorAll('.profile-tabs .profile-tab');
  profileTabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      profileTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      const grid = document.getElementById('myPostsGrid');
      if (!grid) return;
      if (tabName === 'saved') {
        await renderSavedPosts('myPostsGrid');
      } else {
        grid.innerHTML = `<div class="grid-empty">Loading posts...</div>`;
        await renderUserPosts(currentUser.uid, 'myPostsGrid');
      }
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
  if (post.type === 'photo') inner = `<img src="${post.url}" alt="">`;
  else inner = `<video src="${post.url}" muted playsinline preload="metadata" ${thumbUrl ? `poster="${thumbUrl}"` : ''}></video>`;

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
   PUBLIC USER PROFILE — With Private Account Check
   ============================================================ */
async function openUserProfile(userId) {
  if (!userId) return;
  if (userId === currentUser.uid) {
    setActiveNav('profile');
    renderPage('profile');
    return;
  }

  const blocked = currentProfile?.blockedUsers || [];
  if (blocked.includes(userId)) {
    showToast('🚫 You blocked this user');
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

    // ✅ PRIVATE ACCOUNT CHECK
    if (user.isPrivate && !isFollowing) {
      content.innerHTML = `
        <div style="padding: 12px 16px;">
          <button id="backFromProfileBtn">
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
        </div>
        <div class="profile-page" style="padding-top:0;text-align:center;">
          <div class="profile-top" style="justify-content:center;">
            <div class="profile-avatar-wrap">
              <img class="profile-avatar" src="${avatarSrc}" alt="${escapeHtml(user.name)}">
            </div>
          </div>
          <div class="profile-info">
            <div class="profile-name">${escapeHtml(user.name)}</div>
            <div class="profile-username">@${escapeHtml(user.user)}</div>
          </div>
          <div style="padding:30px 20px;">
            <svg viewBox="0 0 24 24" style="width:70px;height:70px;stroke:#666;fill:none;stroke-width:1.5;margin-bottom:16px;">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <div style="font-size:18px;font-weight:700;margin-bottom:8px;">This Account is Private</div>
            <div style="color:#888;font-size:14px;margin-bottom:20px;">
              Follow @${escapeHtml(user.user)} to see their posts and videos
            </div>
          </div>
          <div class="profile-actions" style="justify-content:center;">
            <button id="pubFollowBtn">
              <svg viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Follow
            </button>
          </div>
        </div>
      `;

      document.getElementById('backFromProfileBtn').addEventListener('click', () => {
        viewingUserId = null;
        setActiveNav(null);
        renderPage('home');
      });

      document.getElementById('pubFollowBtn').addEventListener('click', async (e) => {
        await toggleFollow(userId, e.currentTarget);
        if (currentProfile.following.includes(userId)) {
          showToast('✅ Followed! Loading profile...');
          setTimeout(() => openUserProfile(userId), 500);
        }
      });
      return;
    }

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
          <button id="pubFollowBtn" class="${isFollowing ? 'following' : ''}">
            <svg viewBox="0 0 24 24">
              ${isFollowing
                ? '<polyline points="20 6 9 17 4 12"/>'
                : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}
            </svg>
            ${isFollowing ? 'Following' : 'Follow'}
          </button>

          <button id="pubMessageBtn">
            <svg viewBox="0 0 24 24">
              <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            Messages
          </button>

          <button id="pubShareBtn">
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
      await toggleFollow(userId, null);
      const isNowFollowing = currentProfile.following.includes(userId);
      if (isNowFollowing) {
        followBtn.classList.add('following');
        followBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Following
        `;
      } else {
        followBtn.classList.remove('following');
        followBtn.innerHTML = `
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Follow
        `;
      }
    });

    const messageBtn = document.getElementById('pubMessageBtn');
    if (messageBtn) {
      messageBtn.addEventListener('click', () => openChatWindow(user));
    }

    document.getElementById('pubShareBtn').addEventListener('click', () => shareUser(user));
    await renderUserPosts(userId, 'pubPostsGrid');
  } catch (e) {
    content.innerHTML = `<div class="page-placeholder"><div class="page-title">Could not load</div></div>`;
  }
}

async function shareUser(user) {
  const appUrl = window.location.origin;
  const shareText = `🎬 Check out ${user.name}'s profile on ReelHub!\n\n@${user.user}\n\n${appUrl}`;
  if (navigator.share) {
    try { await navigator.share({ title: `${user.name} on ReelHub`, text: shareText, url: appUrl }); return; }
    catch (err) { if (err.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(shareText); showToast('✅ Link copied!'); }
  catch (err) { showToast('❌ Could not share'); }
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

document.getElementById('closeUpload').addEventListener('click', () => uploadModal.classList.remove('show'));
uploadModal.addEventListener('click', (e) => { if (e.target === uploadModal) uploadModal.classList.remove('show'); });

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
    if (!file.type.startsWith('image/')) { uploadMsg.textContent = 'Choose an image.'; return; }
    if (file.size > 5 * 1024 * 1024) { uploadMsg.textContent = 'Max 5 MB.'; return; }
    selectedFile = file;
    const url = URL.createObjectURL(file);
    uploadPhotoPreview.src = url;
    uploadPhotoPreviewWrap.style.display = 'block';
    uploadPickerWrap.style.display = 'none';
    uploadSubmitBtn.disabled = false;
    return;
  }

  if (!file.type.startsWith('video/')) { uploadMsg.textContent = 'Choose a video.'; return; }
  if (file.size > 100 * 1024 * 1024) { uploadMsg.textContent = 'Max 100 MB.'; return; }

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
      uploadMsg.textContent = `⚠️ Max 1 minute.`;
      return;
    }

    uploadPreview.src = url;
    uploadPreviewWrap.style.display = 'block';
    uploadPickerWrap.style.display = 'none';
    uploadPreviewInfo.textContent = `${Math.round(duration)}s · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    uploadSubmitBtn.disabled = false;
  };
  tempVideo.onerror = () => { uploadMsg.textContent = 'Could not load.'; };
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
  if (!selectedFile) { uploadMsg.textContent = 'Select a file.'; return; }
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
    uploadMsg.className = 'error-msg';
    uploadMsg.textContent = err.message || 'Upload failed.';
    uploadSubmitBtn.disabled = false;
    uploadSubmitBtn.textContent = 'Upload';
  }
});

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
          if (!res.secure_url) { reject(new Error('No URL')); return; }
          resolve(res);
        } catch (e) { reject(new Error('Invalid response')); }
      } else {
        let errMsg = 'Upload failed';
        try { const d = JSON.parse(xhr.responseText); if (d.error?.message) errMsg = d.error.message; }
        catch (e) { errMsg = 'HTTP ' + xhr.status; }
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

document.getElementById('closeEdit').addEventListener('click', () => editModal.classList.remove('show'));
editModal.addEventListener('click', (e) => { if (e.target === editModal) editModal.classList.remove('show'); });

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
  if (newBio.length > 150) { editMsg.textContent = 'Bio max 150.'; return; }

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
  } catch (err) { showToast('Could not update follow.'); }
}

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
    const settings = typeof getSettings === 'function' ? getSettings() : { pushNotif: true };
    if (settings.pushNotif === false) { updateNotifDot(0); return; }

    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), where('read', '==', false), limit(20));
    const snap = await getDocs(q);
    updateNotifDot(snap.size);
  } catch (e) {}
}

function updateNotifDot(count) {
  if (!notifDot) return;
  notifDot.style.display = count > 0 ? 'block' : 'none';
}

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
    const blocked = currentProfile?.blockedUsers || [];
    const matches = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.id !== currentUser.uid && !blocked.includes(u.id))
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
  } catch (e) { results.innerHTML = `<div class="search-empty">Search failed</div>`; }
}

async function shareProfile() {
  if (!currentProfile) return;
  const appUrl = window.location.origin;
  const shareText = `🎬 Check out ${currentProfile.name}'s profile on ReelHub!\n\n@${currentProfile.user}\n\n${appUrl}`;
  if (navigator.share) {
    try { await navigator.share({ title: `${currentProfile.name} on ReelHub`, text: shareText, url: appUrl }); return; }
    catch (err) { if (err.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(shareText); showToast('✅ Link copied!'); }
  catch (err) {
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

function showToast(message) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 90px; left: 50%;
    transform: translateX(-50%);
    background: #1e1e28; color: #fff;
    padding: 12px 20px; border-radius: 10px;
    font-size: 14px; font-weight: 500;
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
  return Math.floor(days / 7) + 'w';
}

function formatTime(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${m < 10 ? '0' + m : m} ${ampm}`;
}

function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatVoiceDuration(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' + s : s}`;
}

/* ============================================================
   SETTINGS — 30 Settings (localStorage based)
   ============================================================ */

const DEFAULT_SETTINGS = {
  // App Preferences (5)
  darkMode: true,
  autoPlay: true,
  dataSaver: false,
  videoQuality: 'auto',
  language: 'en',
  // Notifications (5)
  pushNotif: true,
  notifLikes: true,
  notifComments: true,
  notifFollows: true,
  notifMessages: true,
  // Privacy (6)
  privateAccount: false,
  readReceipts: true,
  showActivity: true,
  showOnline: true,
  allowTagging: true,
  allowStorySharing: true,
  // More Settings (4)
  autoDownload: false,
  vibration: true,
  soundEffects: true,
  fontSize: 'medium',
  // Video & Playback (4)
  autoplaySound: false,
  videoLoop: true,
  showCaptions: true,
  videoPreload: 'metadata',
  // Feed & Display (3)
  showViews: true,
  infiniteScroll: true,
  feedOrder: 'newest',
  // Interactions (3)
  doubleTapLike: true,
  confirmDelete: true,
  compactMode: false
};

function getSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('reelhubSettings') || '{}');
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSetting(key, value) {
  const current = getSettings();
  current[key] = value;
  localStorage.setItem('reelhubSettings', JSON.stringify(current));
  applySetting(key, value);
}

function applySetting(key, value) {
  switch (key) {
    case 'darkMode':
      document.body.classList.toggle('light-mode', !value);
      break;
    case 'pushNotif': {
      const subIds = ['settingNotifLikes', 'settingNotifComments', 'settingNotifFollows', 'settingNotifMessages'];
      subIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !value;
      });
      break;
    }
    case 'compactMode':
      document.body.classList.toggle('compact-mode', value);
      break;
    case 'fontSize':
      applyFontSize(value);
      break;
    case 'privateAccount': {
      const descEl = document.getElementById('privateAccountDesc');
      if (descEl) {
        descEl.textContent = value ? 'Private — Sirf followers dekh sakte hain' : 'Public — Sab dekh sakte hain';
      }
      break;
    }
  }
}

function applyFontSize(size) {
  const html = document.documentElement;
  if (size === 'small') html.style.fontSize = '13px';
  else if (size === 'large') html.style.fontSize = '17px';
  else html.style.fontSize = '15px';
}

function loadSettingsToUI() {
  const s = getSettings();

  const checkboxes = {
    settingDarkMode: s.darkMode,
    settingAutoPlay: s.autoPlay,
    settingDataSaver: s.dataSaver,
    settingPushNotif: s.pushNotif,
    settingNotifLikes: s.notifLikes,
    settingNotifComments: s.notifComments,
    settingNotifFollows: s.notifFollows,
    settingNotifMessages: s.notifMessages,
    settingPrivateAccount: s.privateAccount,
    settingReadReceipts: s.readReceipts,
    settingShowActivity: s.showActivity,
    settingShowOnline: s.showOnline,
    settingAllowTagging: s.allowTagging,
    settingAllowStorySharing: s.allowStorySharing,
    settingAutoDownload: s.autoDownload,
    settingVibration: s.vibration,
    settingSoundEffects: s.soundEffects,
    settingAutoplaySound: s.autoplaySound,
    settingVideoLoop: s.videoLoop,
    settingShowCaptions: s.showCaptions,
    settingShowViews: s.showViews,
    settingInfiniteScroll: s.infiniteScroll,
    settingDoubleTapLike: s.doubleTapLike,
    settingConfirmDelete: s.confirmDelete,
    settingCompactMode: s.compactMode
  };

  Object.keys(checkboxes).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = checkboxes[id];
  });

  const selects = {
    settingVideoQuality: s.videoQuality,
    settingLanguage: s.language,
    settingFontSize: s.fontSize,
    settingVideoPreload: s.videoPreload,
    settingFeedOrder: s.feedOrder
  };

  Object.keys(selects).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = selects[id];
  });

  const descEl = document.getElementById('privateAccountDesc');
  if (descEl) {
    descEl.textContent = s.privateAccount ? 'Private — Sirf followers dekh sakte hain' : 'Public — Sab dekh sakte hain';
  }

  const subIds = ['settingNotifLikes', 'settingNotifComments', 'settingNotifFollows', 'settingNotifMessages'];
  subIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !s.pushNotif;
  });
}

function openSettingsModal() {
  loadSettingsToUI();
  document.getElementById('settingsModal')?.classList.add('show');
}

function initSettingsListeners() {
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      setActiveNav(null);
      openSettingsModal();
    });
  }

  document.getElementById('closeSettings')?.addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('show');
  });
  document.getElementById('settingsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'settingsModal') {
      e.target.classList.remove('show');
    }
  });

  function wireToggle(id, key, onMsg, offMsg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', (e) => {
      saveSetting(key, e.target.checked);
      if (onMsg || offMsg) showToast(e.target.checked ? onMsg : offMsg);
    });
  }

  function wireSelect(id, key, prefix) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', (e) => {
      saveSetting(key, e.target.value);
      showToast(prefix + e.target.value);
    });
  }

  // App Preferences
  wireToggle('settingDarkMode', 'darkMode', '🌙 Dark mode ON', '☀️ Light mode ON');
  wireToggle('settingAutoPlay', 'autoPlay', '▶️ Auto play ON', '⏸️ Auto play OFF');
  wireToggle('settingDataSaver', 'dataSaver', '📉 Data saver ON', '📈 Data saver OFF');
  wireSelect('settingVideoQuality', 'videoQuality', '🎬 Quality: ');
  wireSelect('settingLanguage', 'language', '🌐 Language: ');

  // Notifications
  wireToggle('settingPushNotif', 'pushNotif', '🔔 Notifications ON', '🔕 Notifications OFF');
  wireToggle('settingNotifLikes', 'notifLikes', '', '');
  wireToggle('settingNotifComments', 'notifComments', '', '');
  wireToggle('settingNotifFollows', 'notifFollows', '', '');
  wireToggle('settingNotifMessages', 'notifMessages', '', '');

  // ✅ PRIVATE ACCOUNT — with Firestore sync
  document.getElementById('settingPrivateAccount')?.addEventListener('change', async (e) => {
    const isPrivate = e.target.checked;
    saveSetting('privateAccount', isPrivate);
    showToast(isPrivate ? '🔐 Private account ON' : '🌐 Public account ON');

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { isPrivate: isPrivate });
      if (currentProfile) currentProfile.isPrivate = isPrivate;
      console.log('✅ Private setting saved:', isPrivate);
    } catch (err) {
      console.error('❌ Failed:', err);
      showToast('❌ Could not save');
    }
  });

  wireToggle('settingReadReceipts', 'readReceipts', '✓✓ Read receipts ON', '✓✓ Read receipts OFF');
  wireToggle('settingShowActivity', 'showActivity', '🟢 Activity status ON', '⚫ Activity status OFF');
  wireToggle('settingShowOnline', 'showOnline', '📶 Online status ON', '📴 Online status OFF');
  wireToggle('settingAllowTagging', 'allowTagging', '🏷️ Tagging allowed', '🚫 Tagging blocked');
  wireToggle('settingAllowStorySharing', 'allowStorySharing', '📤 Story sharing ON', '📥 Story sharing OFF');

  // More Settings
  wireToggle('settingAutoDownload', 'autoDownload', '📥 Auto download ON', '📥 Auto download OFF');
  wireToggle('settingVibration', 'vibration', '📳 Vibration ON', '📳 Vibration OFF');
  wireToggle('settingSoundEffects', 'soundEffects', '🔊 Sound effects ON', '🔇 Sound effects OFF');
  wireSelect('settingFontSize', 'fontSize', '🔤 Font: ');

  // Video & Playback
  wireToggle('settingAutoplaySound', 'autoplaySound', '🔊 Autoplay sound ON', '🔇 Autoplay sound OFF');
  wireToggle('settingVideoLoop', 'videoLoop', '🔁 Video loop ON', '🔁 Video loop OFF');
  wireToggle('settingShowCaptions', 'showCaptions', '📝 Captions ON', '📝 Captions OFF');
  wireSelect('settingVideoPreload', 'videoPreload', '⚡ Preload: ');

  // Feed & Display
  wireToggle('settingShowViews', 'showViews', '📊 Views ON', '📊 Views OFF');
  wireToggle('settingInfiniteScroll', 'infiniteScroll', '♾️ Infinite scroll ON', '♾️ Infinite scroll OFF');
  wireSelect('settingFeedOrder', 'feedOrder', '📋 Feed: ');

  // Interactions
  wireToggle('settingDoubleTapLike', 'doubleTapLike', '👆 Double tap ON', '👆 Double tap OFF');
  wireToggle('settingConfirmDelete', 'confirmDelete', '🗑️ Confirm delete ON', '🗑️ Confirm delete OFF');
  wireToggle('settingCompactMode', 'compactMode', '📐 Compact mode ON', '📐 Compact mode OFF');

  // About
  document.getElementById('settingAboutBtn')?.addEventListener('click', () => {
    showToast('📱 ReelHub v1.0.0 — Made with ❤️');
  });
}

initSettingsListeners();

(function applyInitialSettings() {
  const s = getSettings();
  applySetting('darkMode', s.darkMode);
  applySetting('fontSize', s.fontSize);
  applySetting('compactMode', s.compactMode);
  applySetting('privateAccount', s.privateAccount);
})();

console.log('✅ app.js loaded — Complete with 30 Settings');