/* ============================================================
   ReelHub — app.js (PART 1/4) — FULL FINAL
   Imports, Config, DOM, State, Auth, Signup, Login
   ✅ Real-time state variables added
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential
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
  limit,
  writeBatch,
  onSnapshot
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
const CLOUDINARY_ACCOUNTS = {
  videos: {
    cloudName: "s3eresx6",
    apiKey:    "349223397331644",
    preset:    "reelhub_video"
  },
  stories: {
    cloudName: "fepzqr9t",
    apiKey:    "287332161532267",
    preset:    "reelhub_story"
  }
};

/* ============================================================
   DOM SHORTCUTS
   ============================================================ */
function $id(id) { return document.getElementById(id); }

const authScreen     = $id('auth');
const loadingScreen  = $id('loadingScreen');
const appScreen      = $id('app');
const loginForm      = $id('loginForm');
const signupForm     = $id('signupForm');
const loginMsg       = $id('loginMsg');
const signupMsg      = $id('signupMsg');
const loginBtn       = $id('loginBtn');
const signupBtn      = $id('signupBtn');
const content        = $id('content');

const editModal      = $id('editModal');
const editPreviewImg = $id('editPreviewImg');
const editPhotoInput = $id('editPhoto');
const editNameInput  = $id('editName');
const editUserInput  = $id('editUser');
const editBioInput   = $id('editBio');
const saveProfileBtn = $id('saveProfileBtn');
const editMsg        = $id('editMsg');

const listModal = $id('listModal');
const listTitle = $id('listTitle');
const userList  = $id('userList');

const forgotModal  = $id('forgotModal');
const forgotEmail  = $id('forgotEmail');
const forgotMsg    = $id('forgotMsg');
const sendResetBtn = $id('sendResetBtn');

const notifBtn    = $id('notifBtn');
const notifDot    = $id('notifDot');
const searchBtn   = $id('searchBtn');
const chatsDot    = $id('chatsDot');
const settingsBtn = $id('settingsBtn');

const uploadModal            = $id('uploadModal');
const uploadFileInput        = $id('uploadFileInput');
const uploadCaption          = $id('uploadCaption');
const uploadSubmitBtn        = $id('uploadSubmitBtn');
const uploadMsg              = $id('uploadMsg');
const uploadPreview          = $id('uploadPreview');
const uploadPreviewWrap      = $id('uploadPreviewWrap');
const uploadPreviewInfo      = $id('uploadPreviewInfo');
const uploadPhotoPreview     = $id('uploadPhotoPreview');
const uploadPhotoPreviewWrap = $id('uploadPhotoPreviewWrap');
const uploadPickerWrap       = $id('uploadPickerWrap');
const pickerTitle            = $id('pickerTitle');
const pickerSubtitle         = $id('pickerSubtitle');
const pickerLabel            = $id('pickerLabel');
const uploadProgressWrap     = $id('uploadProgressWrap');
const uploadProgressBar      = $id('uploadProgressBar');
const uploadProgressText     = $id('uploadProgressText');

const playerModal   = $id('playerModal');
const playerTitle   = $id('playerTitle');
const playerContent = $id('playerContent');

const commentsModal      = $id('commentsModal');
const commentsTitle      = $id('commentsTitle');
const commentsList       = $id('commentsList');
const commentInput       = $id('commentInput');
const postCommentBtn     = $id('postCommentBtn');
const myAvatarForComment = $id('myAvatarForComment');
const replyIndicator     = $id('replyIndicator');
const replyIndicatorText = $id('replyIndicatorText');
const cancelReplyBtn     = $id('cancelReplyBtn');

const newChatModal      = $id('newChatModal');
const newChatSearch     = $id('newChatSearch');
const newChatResults    = $id('newChatResults');
const chatWindowModal   = $id('chatWindowModal');
const chatHeaderAvatar  = $id('chatHeaderAvatar');
const chatHeaderName    = $id('chatHeaderName');
const chatHeaderHandle  = $id('chatHeaderHandle');
const chatHeaderInfo    = $id('chatHeaderInfo');
const chatMessages      = $id('chatMessages');
const chatMessageInput  = $id('chatMessageInput');
const sendTextBtn       = $id('sendTextBtn');
const micBtn            = $id('micBtn');
const recordingIndicator = $id('recordingIndicator');
const recordingTimer    = $id('recordingTimer');
const cancelRecordingBtn = $id('cancelRecordingBtn');

const storyUploadModal      = $id('storyUploadModal');
const storyFileInput        = $id('storyFileInput');
const storyPickerWrap       = $id('storyPickerWrap');
const storyPickerTitle      = $id('storyPickerTitle');
const storyPickerSubtitle   = $id('storyPickerSubtitle');
const storyPickerLabel      = $id('storyPickerLabel');
const storyPreviewWrap      = $id('storyPreviewWrap');
const storyPreviewImg       = $id('storyPreviewImg');
const storyVideoPreviewWrap = $id('storyVideoPreviewWrap');
const storyPreviewVideo     = $id('storyPreviewVideo');
const storyPreviewInfo      = $id('storyPreviewInfo');
const storySubmitBtn        = $id('storySubmitBtn');
const storyUploadMsg        = $id('storyUploadMsg');
const storyProgressWrap     = $id('storyProgressWrap');
const storyProgressBar      = $id('storyProgressBar');
const storyProgressText     = $id('storyProgressText');

const storyViewer       = $id('storyViewer');
const storyProgressBars = $id('storyProgressBars');
const storyUserAvatar   = $id('storyUserAvatar');
const storyUserName     = $id('storyUserName');
const storyTime         = $id('storyTime');
const storyDeleteBtn    = $id('storyDeleteBtn');
const storyCloseBtn     = $id('storyCloseBtn');
const storyMedia        = $id('storyMedia');
const storyTapLeft      = $id('storyTapLeft');
const storyTapRight     = $id('storyTapRight');

/* ============================================================
   STATE
   ============================================================ */
let currentUser    = null;
let currentProfile = null;
let selectedPhotoBase64 = null;
let isLoggingIn    = false;
let isSigningUp    = false;
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

let activeGroupId = null;
let activeGroupData = null;
let selectedGroupMembers = [];
let currentGroupFile = null;

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

/* ✅ CHAT REPLY + REACTION + TYPING STATE */
let chatReplyTo = null;             // Reply: { msgId, text, senderName, senderUid }
let activeReactionMsg = null;       // Currently long-pressed msg for reaction
let longPressTimer = null;          // Long press detection
let swipeStartX = 0;                // Swipe start X
let swipeCurrentRow = null;         // Currently swiping row
let typingListenerUnsub = null;     // Typing onSnapshot cleanup
let typingTimeout = null;           // Typing timeout
let isCurrentlyTyping = false;      // Am I typing?

/* ✅ Track processed messages to avoid Firestore write spam */
const _readProcessed = new Set();
const _deliveredProcessed = new Set();

/* ✅ REAL-TIME STATE (NEW) */
let chatListUnsub = null;            // DM list onSnapshot unsub
let groupListUnsub = null;           // Group list onSnapshot unsub
let notifUnsub = null;               // Notifications onSnapshot unsub
const _seenMsgIds = new Set();       // Track seen messages (for receive sound)
const _lastChatMsgTime = new Map();  // chatId -> last msg time (for notif sound)
const _lastGroupMsgTime = new Map(); // groupId -> last msg time

/* Auth action flag */
let authActionInProgress = false;

/* Loading timeout */
const LOADING_TIMEOUT_MS = 10000;
let loadingTimeoutId = null;

/* ============================================================
   LOADING SCREEN SAFETY
   ============================================================ */
function startLoadingTimeout() {
  clearTimeout(loadingTimeoutId);
  loadingTimeoutId = setTimeout(() => {
    const ls = $id('loadingScreen');
    if (ls && ls.style.display !== 'none') {
      console.warn('⚠️ Loading timeout — showing auth');
      ls.style.display = 'none';
      const authEl = $id('auth');
      if (authEl) {
        authEl.classList.add('show');
        authEl.style.display = 'block';
      }
    }
  }, LOADING_TIMEOUT_MS);
}

if (loadingScreen) startLoadingTimeout();

/* ============================================================
   SCREEN SWITCHING
   ============================================================ */
function showAuth() {
  clearTimeout(loadingTimeoutId);

  if (loadingScreen) loadingScreen.style.display = 'none';
  if (authScreen) {
    authScreen.classList.add('show');
    authScreen.style.display = 'block';
  }
  if (appScreen) {
    appScreen.classList.remove('show');
    appScreen.style.display = 'none';
  }

  stopNotifWatcher();
  stopShortsObserver();
  stopChatListWatcher();

  if (chatMessagesUnsub) {
    try { chatMessagesUnsub(); } catch (e) {}
    chatMessagesUnsub = null;
  }

  if (typingListenerUnsub) {
    try { typingListenerUnsub(); } catch (e) {}
    typingListenerUnsub = null;
  }

  // ✅ Clear processed sets
  _readProcessed.clear();
  _deliveredProcessed.clear();
  _seenMsgIds.clear();
  _lastChatMsgTime.clear();
  _lastGroupMsgTime.clear();
}

function showApp() {
  clearTimeout(loadingTimeoutId);

  if (loadingScreen) loadingScreen.style.display = 'none';
  if (authScreen) {
    authScreen.classList.remove('show');
    authScreen.style.display = 'none';
  }
  if (appScreen) {
    appScreen.classList.add('show');
    appScreen.style.display = 'flex';
  }

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
   NOTIFICATION PERMISSION
   ============================================================ */
function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

/* ============================================================
   VISIBILITY
   ============================================================ */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentUser) {
    checkUnreadNotifications();
    checkChatsUnread();
  }
});

/* ============================================================
   GLOBAL ERROR
   ============================================================ */
window.addEventListener('error', (e) => {
  console.error('❌ Global error:', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ Unhandled rejection:', e.reason);
});

/* ============================================================
   PASSWORD EYE TOGGLE
   ============================================================ */
document.querySelectorAll('.eye').forEach(eye => {
  eye.addEventListener('click', () => {
    const inp = $id(eye.dataset.target);
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  });
});

/* ============================================================
   LOGIN <-> SIGNUP TOGGLE
   ============================================================ */
$id('goSignup')?.addEventListener('click', () => {
  if (loginForm) loginForm.style.display = 'none';
  if (signupForm) signupForm.style.display = 'block';
  if (loginMsg) loginMsg.textContent = '';
  if (signupMsg) signupMsg.textContent = '';

  const sw = $id('goSignupSwitch');
  const wr = $id('goSignupWrap');
  if (sw) sw.style.display = 'block';
  if (wr) wr.style.display = 'none';
});

$id('goLogin')?.addEventListener('click', () => {
  if (signupForm) signupForm.style.display = 'none';
  if (loginForm) loginForm.style.display = 'block';
  if (loginMsg) loginMsg.textContent = '';
  if (signupMsg) signupMsg.textContent = '';

  const sw = $id('goSignupSwitch');
  const wr = $id('goSignupWrap');
  if (sw) sw.style.display = 'none';
  if (wr) wr.style.display = 'block';
});

/* ============================================================
   SIGNUP — FIXED
   ============================================================ */
signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name  = $id('signupName').value.trim();
  const user  = $id('signupUser').value.trim().toLowerCase();
  const email = $id('signupEmail').value.trim().toLowerCase();
  const pass  = $id('signupPass').value;

  signupMsg.className = 'error-msg';
  signupMsg.textContent = '';

  /* Validation */
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
    signupMsg.textContent = 'Password min 6 characters.';
    return;
  }

  isSigningUp = true;
  authActionInProgress = true;
  signupBtn.disabled = true;
  signupBtn.textContent = 'Creating...';

  let createdAuthUser = null;

  try {
    /* STEP 1 — Create auth user PEHLE */
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid  = cred.user.uid;
    createdAuthUser = cred.user;
    console.log('✅ Auth user created:', uid);

    /* STEP 2 — Wait for auth to settle */
    await new Promise(r => setTimeout(r, 300));

    /* STEP 3 — Check username (now authenticated) */
    const usersRef = collection(db, 'users');
    const uq = query(usersRef, where('user', '==', user));
    const userSnap = await getDocs(uq);

    if (!userSnap.empty) {
      try {
        await createdAuthUser.delete();
      } catch (e) {
        try { await signOut(auth); } catch (e2) {}
      }
      signupMsg.textContent = 'Username already taken. Try another.';
      return;
    }

    /* STEP 4 — Create Firestore profile */
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
      verified: false,
      banned: false,
      createdAt: serverTimestamp()
    });

    /* STEP 5 — Email verification */
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn('Verification email failed:', e);
    }

    /* STEP 6 — Set state */
    currentUser = cred.user;
    await loadProfile(uid);

    signupMsg.className = 'success-msg';
    signupMsg.textContent = 'Account created! Welcome 🎉';
    signupForm.reset();

    authActionInProgress = false;

    setTimeout(() => {
      showApp();
      startNotifWatcher();
      requestNotificationPermission();
    }, 800);

  } catch (err) {
    console.error('Signup error:', err);

    if (createdAuthUser && !currentProfile) {
      try {
        await createdAuthUser.delete();
      } catch (e) {
        try { await signOut(auth); } catch (e2) {}
      }
    }

    signupMsg.className = 'error-msg';

    if (err.code === 'auth/email-already-in-use') {
      signupMsg.textContent = 'Email already registered.';
    } else if (err.code === 'auth/invalid-email') {
      signupMsg.textContent = 'Invalid email.';
    } else if (err.code === 'auth/weak-password') {
      signupMsg.textContent = 'Password too weak.';
    } else if (err.code === 'auth/network-request-failed') {
      signupMsg.textContent = 'Network error. Check your connection.';
    } else if (err.code === 'permission-denied' ||
               (err.message && err.message.toLowerCase().includes('permission'))) {
      signupMsg.textContent = '⚠️ Firestore rules update karo.';
    } else {
      signupMsg.textContent = err.message || 'Signup failed.';
    }
  } finally {
    isSigningUp = false;
    authActionInProgress = false;
    signupBtn.disabled = false;
    signupBtn.textContent = 'Sign Up';
  }
});

/* ============================================================
   LOGIN
   ============================================================ */
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = $id('loginEmail').value.trim().toLowerCase();
  const pass  = $id('loginPass').value;

  loginMsg.className = 'error-msg';
  loginMsg.textContent = '';

  if (!email || !pass) {
    loginMsg.textContent = 'Please enter email and password.';
    return;
  }

  isLoggingIn = true;
  authActionInProgress = true;
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (!result || !result.user) throw new Error('Login failed');

    currentUser = result.user;
    await loadProfile(result.user.uid);

    /* BAN CHECK */
    if (currentProfile?.banned) {
      try { await signOut(auth); } catch (e) {}
      currentUser = null;
      currentProfile = null;
      loginMsg.textContent = '🚫 Your account has been banned.';
      return;
    }

    loginMsg.textContent = '';
    authActionInProgress = false;

    showApp();
    startNotifWatcher();
    requestNotificationPermission();

  } catch (err) {
    console.error('Login error:', err);
    currentUser = null;
    currentProfile = null;
    loginMsg.className = 'error-msg';

    if (err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/invalid-login-credentials') {
      loginMsg.textContent = 'Invalid email or password.';
    } else if (err.code === 'auth/too-many-requests') {
      loginMsg.textContent = 'Too many attempts. Try again later.';
    } else if (err.code === 'auth/network-request-failed') {
      loginMsg.textContent = 'Network error. Check your connection.';
    } else if (err.code === 'auth/invalid-email') {
      loginMsg.textContent = 'Invalid email format.';
    } else {
      loginMsg.textContent = err.message || 'Login failed.';
    }

    if (auth.currentUser) {
      try { await signOut(auth); } catch (e) {}
    }
  } finally {
    isLoggingIn = false;
    authActionInProgress = false;
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
  }
});

/* ============================================================
   FORGOT PASSWORD
   ============================================================ */
$id('forgotLink')?.addEventListener('click', () => {
  const loginEmailVal = $id('loginEmail').value.trim();
  forgotEmail.value = loginEmailVal;
  forgotMsg.textContent = '';
  forgotMsg.className = 'error-msg';
  forgotModal.classList.add('show');
});

$id('closeForgot')?.addEventListener('click', () => {
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
    forgotMsg.textContent = 'Reset link sent! Check your inbox.';

    setTimeout(() => {
      forgotModal.classList.remove('show');
      forgotEmail.value = '';
      forgotMsg.textContent = '';
    }, 3500);
  } catch (err) {
    forgotMsg.className = 'error-msg';

    if (err.code === 'auth/user-not-found') {
      forgotMsg.textContent = 'No account with this email.';
    } else if (err.code === 'auth/invalid-email') {
      forgotMsg.textContent = 'Invalid email.';
    } else if (err.code === 'auth/too-many-requests') {
      forgotMsg.textContent = 'Too many attempts. Try later.';
    } else if (err.code === 'auth/network-request-failed') {
      forgotMsg.textContent = 'Network error.';
    } else {
      forgotMsg.textContent = err.message || 'Failed to send reset link.';
    }
  } finally {
    sendResetBtn.disabled = false;
    sendResetBtn.textContent = 'Send Reset Link';
  }
});

/* ============================================================
   LOGOUT
   ============================================================ */
$id('logoutBtn')?.addEventListener('click', async () => {
  if (!confirm('Log out of ReelHub?')) return;

  stopNotifWatcher();
  stopShortsObserver();
  stopChatListWatcher();

  if (chatMessagesUnsub) {
    try { chatMessagesUnsub(); } catch (e) {}
    chatMessagesUnsub = null;
  }

  if (typingListenerUnsub) {
    try { typingListenerUnsub(); } catch (e) {}
    typingListenerUnsub = null;
  }

  try { closeChatWindow?.(); } catch (e) {}
  if (storyViewer) storyViewer.style.display = 'none';
  document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));

  viewedPostsSession.clear();
  viewingUserId = null;
  pinnedMessage = null;

  // ✅ Clear processed sets
  _readProcessed.clear();
  _deliveredProcessed.clear();
  _seenMsgIds.clear();
  _lastChatMsgTime.clear();
  _lastGroupMsgTime.clear();

  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Signout error:', e);
  }

  currentUser = null;
  currentProfile = null;

  loginForm?.reset();
  signupForm?.reset();
  $id('goLogin')?.click();
});

/* ============================================================
   HEADER BUTTONS
   ============================================================ */
notifBtn?.addEventListener('click', () => {
  setActiveNav(null);
  renderPage('notifications');
});

searchBtn?.addEventListener('click', () => {
  setActiveNav(null);
  renderPage('search');
});

/* ============================================================
   AUTH STATE LISTENER
   ============================================================ */
onAuthStateChanged(auth, async (user) => {
  if (authActionInProgress) return;

  if (user) {
    currentUser = user;

    try {
      await loadProfile(user.uid);
    } catch (e) {
      console.error('Profile load failed:', e);
    }

    /* BAN CHECK */
    if (currentProfile?.banned) {
      try { await signOut(auth); } catch (e) {}
      currentUser = null;
      currentProfile = null;
      return;
    }

    showApp();
    startNotifWatcher();
    requestNotificationPermission();

  } else {
    currentUser = null;
    currentProfile = null;
    stopNotifWatcher();
    stopShortsObserver();
    stopChatListWatcher();

    if (chatMessagesUnsub) {
      try { chatMessagesUnsub(); } catch (e) {}
      chatMessagesUnsub = null;
    }

    if (typingListenerUnsub) {
      try { typingListenerUnsub(); } catch (e) {}
      typingListenerUnsub = null;
    }

    _readProcessed.clear();
    _deliveredProcessed.clear();
    _seenMsgIds.clear();
    _lastChatMsgTime.clear();
    _lastGroupMsgTime.clear();

    loginForm?.reset();
    signupForm?.reset();
    $id('goLogin')?.click();
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
      const data = snap.data();

      if (!Array.isArray(data.followers))    data.followers = [];
      if (!Array.isArray(data.following))    data.following = [];
      if (!Array.isArray(data.savedPosts))   data.savedPosts = [];
      if (!Array.isArray(data.blockedUsers)) data.blockedUsers = [];

      if (typeof data.videoCount !== 'number')  data.videoCount = 0;
      if (typeof data.isPrivate  !== 'boolean') data.isPrivate = false;
      if (typeof data.verified   !== 'boolean') data.verified = false;
      if (typeof data.banned     !== 'boolean') data.banned = false;

      currentProfile = data;
    } else {
      currentProfile = null;
    }
  } catch (e) {
    console.error('loadProfile error:', e);
    currentProfile = null;
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

document.querySelector('.upload-btn')?.addEventListener('click', () => {
  setActiveNav(null);
  openUploadModal();
});

function renderPage(page) {
  if (page === 'profile')            renderProfile();
  else if (page === 'home')          renderHomeFeed();
  else if (page === 'shorts')        renderShortsFeed();
  else if (page === 'messages')      renderChatsPage();
  else if (page === 'notifications') renderNotifications();
  else if (page === 'search')        renderSearch();
  else if (page === 'upload') {
    if (content) {
      content.innerHTML = `<div class="page-placeholder"><div class="page-title">${pages[page]}</div></div>`;
    }
  }
}
/* ============================================================
   ReelHub — app.js (PART 2/4) — Home Feed + Shorts + Stories
   ============================================================ */

let feedAutoplayObserver = null;

/* ============================================================
   HELPERS
   ============================================================ */
function isPostSaved(postId) {
  if (!currentProfile || !postId) return false;
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

/* ✅ Format duration (mm:ss) */
function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}:${mm < 10 ? '0' : ''}${mm}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/* ✅ Format views (1.2M, 850K) */
function formatViews(count) {
  const n = parseInt(count) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}

/* ✅ Verified Badge */
function verifiedBadgeHTML(isVerified, size = 'normal') {
  if (!isVerified) return '';
  const sizeClass = size === 'large' ? 'large' : '';
  return `
    <span class="verified-badge ${sizeClass}" title="Verified">
      <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </span>
  `;
}

/* Save Post */
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
        <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
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

/* Track Post View */
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
  } catch (e) {}
}

/* ============================================================
   STORY VIEWERS SHEET
   ============================================================ */
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
        <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
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
        <b>${escapeHtml(u.name || 'User')}${verifiedBadgeHTML(u.verified)}</b>
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
   DOUBLE TAP LIKE
   ============================================================ */
function attachDoubleTapLike(element, post, onSingleTap) {
  if (!element || !post) return;

  let lastTap = 0;
  let tapTimer = null;
  const TAP_DELAY = 300;

  element.addEventListener('click', (e) => {
    if (e.target.closest('button, a, .post-menu-btn, .msg-dots-btn, .yt-menu-btn, .shorts-shelf-more, .editor-btn, .editor-filter-btn, .editor-color-btn')) return;

    const s = typeof getSettings === 'function' ? getSettings() : { doubleTapLike: true };
    if (s.doubleTapLike === false) {
      if (onSingleTap) onSingleTap(e);
      return;
    }

    const now = Date.now();

    if (now - lastTap < TAP_DELAY) {
      clearTimeout(tapTimer);
      lastTap = 0;
      handleDoubleTapLikeUniversal(post, element, e);
    } else {
      lastTap = now;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        lastTap = 0;
        if (onSingleTap) onSingleTap(e);
      }, TAP_DELAY);
    }
  });
}

async function handleDoubleTapLikeUniversal(post, cardEl, event) {
  if (!currentUser || !post) return;

  const alreadyLiked = (post.likes || []).includes(currentUser.uid);

  showHeartAnimation(cardEl, event);
  if (navigator.vibrate) navigator.vibrate(40);

  if (alreadyLiked) return;

  const likeBtn = cardEl.querySelector('.like-btn');
  const countSpan = likeBtn?.querySelector('span');
  if (likeBtn && !likeBtn.classList.contains('liked')) {
    likeBtn.classList.add('liked');
    if (countSpan) {
      const current = parseInt(countSpan.textContent) || 0;
      countSpan.textContent = current + 1;
    }
  }

  try {
    await updateDoc(doc(db, 'posts', post.id), {
      likes: arrayUnion(currentUser.uid)
    });
    if (!post.likes) post.likes = [];
    if (!post.likes.includes(currentUser.uid)) post.likes.push(currentUser.uid);

    const s = typeof getSettings === 'function'
      ? getSettings()
      : { notifLikes: true, pushNotif: true };

    if (post.userId && post.userId !== currentUser.uid && s.pushNotif && s.notifLikes) {
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: post.userId,
          type: 'like',
          title: '❤️ New Like',
          message: `${currentProfile?.name || 'Someone'} liked your post`,
          postId: post.id,
          fromUserId: currentUser.uid,
          read: false,
          createdAt: serverTimestamp()
        });
      } catch (e) {}
    }
  } catch (e) {
    console.error('Double tap like error:', e);
    if (likeBtn) {
      likeBtn.classList.remove('liked');
      if (countSpan) {
        const current = parseInt(countSpan.textContent) || 0;
        countSpan.textContent = Math.max(0, current - 1);
      }
    }
    showToast('❌ Could not like');
  }
}

function showHeartAnimation(container, event) {
  if (!container) return;

  container.querySelectorAll('.heart-pop').forEach(h => h.remove());

  if (!container.style.position || container.style.position === 'static') {
    container.style.position = 'relative';
  }

  const heart = document.createElement('div');
  heart.className = 'heart-pop' + (container.classList.contains('grid-item') ? ' small' : '');
  heart.innerHTML = '❤️';

  if (event && event.clientX !== undefined && container.getBoundingClientRect) {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    heart.style.left = x + 'px';
    heart.style.top  = y + 'px';
    heart.style.transform = 'translate(-50%, -50%) scale(0)';
  }

  container.appendChild(heart);
  setTimeout(() => heart.remove(), 900);
}

/* ============================================================
   🎉 CONGRATULATIONS ANIMATION
   ============================================================ */
function showCongratsAnimation(userName, userEmail) {
  document.querySelectorAll('.congrats-overlay').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay';

  const colors = ['#ff2e63', '#ff8a00', '#4ea8ff', '#4ade80', '#ffd700', '#ff1493'];
  let confettiHTML = '';
  for (let i = 0; i < 50; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 2.5 + Math.random() * 2;
    const size = 6 + Math.random() * 8;
    const shape = Math.random() > 0.5 ? '50%' : '2px';
    confettiHTML += `
      <div class="confetti-piece" style="
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape};
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
      "></div>
    `;
  }

  const sparkleEmojis = ['✨', '⭐', '🌟', '💫', '🎉', '🎊'];
  let sparklesHTML = '';
  for (let i = 0; i < 12; i++) {
    const emoji = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
    const left = Math.random() * 90 + 5;
    const top = Math.random() * 80 + 10;
    const delay = 0.3 + Math.random() * 1.5;
    const duration = 2 + Math.random() * 1.5;
    sparklesHTML += `
      <div class="congrats-sparkle" style="
        left: ${left}%;
        top: ${top}%;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
      ">${emoji}</div>
    `;
  }

  overlay.innerHTML = `
    ${confettiHTML}
    ${sparklesHTML}

    <div class="congrats-icon">👑</div>

    <div class="congrats-check">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35"/>
        <polyline points="35 50 45 60 65 40"/>
      </svg>
    </div>

    <div class="congrats-title">Congratulations!</div>

    <div class="congrats-subtitle">
      You are now an official <b style="color:#ff2e63;">ReelHub Admin</b>! 🎊<br>
      You can manage users, videos, and reports from the admin panel.
    </div>

    <div class="congrats-user">
      Logged in as <b>${escapeHtml(userName || 'Admin')}</b><br>
      <span style="font-size:12px;">${escapeHtml(userEmail || '')}</span>
    </div>

    <button class="congrats-btn" id="congratsContinueBtn">
      <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Awesome! Let's Go
    </button>
  `;

  document.body.appendChild(overlay);

  document.getElementById('congratsContinueBtn').addEventListener('click', () => {
    overlay.classList.add('closing');
    setTimeout(() => {
      overlay.remove();
      showAdminPanelRedirect();
    }, 600);
  });

  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  }
}

function showAdminPanelRedirect() {
  document.querySelectorAll('.admin-redirect-modal').forEach(el => el.remove());

  const modal = document.createElement('div');
  modal.className = 'admin-redirect-modal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    z-index: 99998;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  modal.innerHTML = `
    <div style="
      background: #121212;
      border: 1px solid #1e1e28;
      border-radius: 20px;
      padding: 30px 24px;
      max-width: 400px;
      width: 100%;
      text-align: center;
    ">
      <div style="font-size: 60px; margin-bottom: 16px;">🎯</div>
      <div style="font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 10px;">
        Open Admin Panel
      </div>
      <div style="font-size: 14px; color: #888; line-height: 1.5; margin-bottom: 24px;">
        Open the admin panel and login with your email to start managing ReelHub.
      </div>
      <div style="
        background: #1a1a24;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 20px;
        font-size: 13px;
        color: #ccc;
        word-break: break-all;
      ">
        <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Your admin email</div>
        <b>${escapeHtml(currentUser?.email || '')}</b>
      </div>
      <button id="openAdminPanelBtn" style="
        width: 100%;
        height: 50px;
        background: linear-gradient(90deg, #ff2e63, #ff8a00);
        border: none;
        border-radius: 12px;
        color: #fff;
        font-size: 15px;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        margin-bottom: 10px;
      ">
        Open Admin Panel →
      </button>
      <button id="closeAdminRedirectBtn" style="
        width: 100%;
        height: 44px;
        background: transparent;
        border: 1px solid #333;
        border-radius: 12px;
        color: #888;
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
      ">
        Maybe Later
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('openAdminPanelBtn').addEventListener('click', () => {
    window.open('admin.html', '_blank');
    modal.remove();
  });

  document.getElementById('closeAdminRedirectBtn').addEventListener('click', () => {
    modal.remove();
  });
}

/* ============================================================
   CACHE HELPERS
   ============================================================ */
function saveFeedCache(posts) {
  try {
    const minimal = posts.slice(0, 15).map(p => ({
      id: p.id,
      userId: p.userId,
      userName: p.userName,
      userHandle: p.userHandle,
      userPhoto: p.userPhoto,
      userVerified: p.userVerified,
      type: p.type,
      url: p.url,
      thumbnail: p.thumbnail,
      caption: p.caption,
      duration: p.duration,
      likes: p.likes || [],
      commentsCount: p.commentsCount || 0,
      views: p.views || 0,
      createdAt: p.createdAt?.toDate?.()?.getTime?.() || Date.now()
    }));
    localStorage.setItem('reelhub_feed_cache', JSON.stringify(minimal));
    localStorage.setItem('reelhub_feed_cache_time', Date.now().toString());
  } catch (e) {
    console.warn('Cache save failed:', e);
  }
}

function loadFeedCache() {
  try {
    const cached = localStorage.getItem('reelhub_feed_cache');
    const time = parseInt(localStorage.getItem('reelhub_feed_cache_time') || '0');

    if (Date.now() - time > 30 * 60 * 1000) {
      localStorage.removeItem('reelhub_feed_cache');
      return null;
    }

    if (!cached) return null;
    const parsed = JSON.parse(cached);

    return parsed.map(p => ({
      ...p,
      createdAt: { toDate: () => new Date(p.createdAt) }
    }));
  } catch (e) {
    return null;
  }
}

/* ============================================================
   THUMBNAIL BUILDER (Cloudinary smart frame)
   ============================================================ */
function buildThumbnailUrl(videoUrl, type) {
  if (!videoUrl) return '';

  try {
    if (type === 'photo') {
      if (videoUrl.includes('/image/upload/')) {
        return videoUrl.replace('/image/upload/', '/image/upload/w_400,q_auto,f_auto/');
      }
      return videoUrl;
    }

    if (videoUrl.includes('/video/upload/')) {
      const parts = videoUrl.split('/video/upload/');
      if (parts.length === 2) {
        const afterUpload = parts[1];
        let publicId = afterUpload.replace(/^v\d+\//, '');
        publicId = publicId.replace(/\.[^.]+$/, '');
        return `https://res.cloudinary.com/${CLOUDINARY_ACCOUNTS.videos.cloudName}/video/upload/so_auto,w_400,h_711,c_fill,q_auto/${publicId}.jpg`;
      }
    }
  } catch (e) {
    console.warn('buildThumbnailUrl error:', e);
  }

  return '';
}

/* ============================================================
   HOME FEED
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
      <div id="feedContainer"></div>
    </div>
  `;

  document.getElementById('addStoryBtn')?.addEventListener('click', openStoryUploadModal);

  await loadStoriesBar();
  await loadHomeFeedPosts();
}

async function loadHomeFeedPosts() {
  const container = document.getElementById('feedContainer');
  if (!container) return;

  if (!currentUser) {
    container.innerHTML = '';
    return;
  }

  /* STEP 1: Instant cache */
  const cached = loadFeedCache();
  if (cached && cached.length > 0) {
    container.innerHTML = '';
    renderFeedWithShortsShelf(cached, container);
  } else {
    container.innerHTML = `
      <div class="yt-skeleton">
        <div class="yt-skeleton-thumb"></div>
        <div class="yt-skeleton-info">
          <div class="yt-skeleton-avatar"></div>
          <div class="yt-skeleton-lines">
            <div class="yt-skeleton-line"></div>
            <div class="yt-skeleton-line short"></div>
          </div>
        </div>
      </div>
      <div class="yt-skeleton">
        <div class="yt-skeleton-thumb"></div>
        <div class="yt-skeleton-info">
          <div class="yt-skeleton-avatar"></div>
          <div class="yt-skeleton-lines">
            <div class="yt-skeleton-line"></div>
            <div class="yt-skeleton-line short"></div>
          </div>
        </div>
      </div>
    `;
  }

  /* STEP 2: Fresh fetch */
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, limit(15));
    const snap = await getDocs(q);

    if (snap.empty) {
      if (!cached || cached.length === 0) container.innerHTML = '';
      return;
    }

    let posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const blocked = currentProfile?.blockedUsers || [];
    posts = posts.filter(p => !blocked.includes(p.userId));

    const settings = typeof getSettings === 'function' ? getSettings() : { feedOrder: 'newest' };

    if (settings.feedOrder === 'trending') {
      posts.sort((a, b) =>
        ((b.likes?.length || 0) + (b.views || 0)) -
        ((a.likes?.length || 0) + (a.views || 0))
      );
    } else {
      posts.sort((a, b) =>
        (b.createdAt?.toDate?.()?.getTime() || 0) -
        (a.createdAt?.toDate?.()?.getTime() || 0)
      );
    }

    saveFeedCache(posts);

    const cacheIds = (cached || []).map(p => p.id).join(',');
    const newIds = posts.map(p => p.id).join(',');

    if (cacheIds !== newIds) {
      container.innerHTML = '';
      renderFeedWithShortsShelf(posts, container);
    }
  } catch (e) {
    console.error('Feed error:', e);
    if (!cached || cached.length === 0) container.innerHTML = '';
  }
}

/* ✅ Shorts shelf + Long cards */
function renderFeedWithShortsShelf(posts, container) {
  const shorts = posts.filter(p => p.type === 'short');
  const regular = posts.filter(p => p.type !== 'short');

  container.innerHTML = '';

  /* 1️⃣ Shorts Shelf */
  if (shorts.length > 0) {
    const shelf = document.createElement('div');
    shelf.className = 'shorts-shelf';

    shelf.innerHTML = `
      <div class="shorts-shelf-header">
        <div class="shorts-shelf-title">
          <svg viewBox="0 0 24 24" class="shorts-icon">
            <path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z"/>
          </svg>
          Shorts
        </div>
        <button class="shorts-shelf-more" id="shortsShelfMore">
          View all
          <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="shorts-shelf-scroll" id="shortsShelfScroll"></div>
    `;

    container.appendChild(shelf);

    const scrollWrap = shelf.querySelector('#shortsShelfScroll');
    shorts.forEach(short => scrollWrap.appendChild(makeShortShelfItem(short)));

    shelf.querySelector('#shortsShelfMore')?.addEventListener('click', () => {
      setActiveNav('shorts');
      renderPage('shorts');
    });
  }

  /* 2️⃣ Regular Feed */
  if (regular.length > 0) {
    regular.forEach(post => container.appendChild(makeFeedPost(post)));
    setupFeedAutoplay();
  }

  /* Empty state */
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="feed-empty">
        <svg viewBox="0 0 24 24" style="width:64px;height:64px;stroke:#333;fill:none;stroke-width:1.5;margin-bottom:16px;">
          <rect x="3" y="3" width="18" height="18" rx="4"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
        <h3>No posts yet</h3>
        <p>Be the first to upload!</p>
      </div>`;
  }
}

/* ✅ Short Shelf Item */
function makeShortShelfItem(short) {
  const item = document.createElement('div');
  item.className = 'shorts-shelf-item';
  item.dataset.postId = short.id;

  const thumbUrl = short.thumbnail || short.url;
  const viewsCount = short.views || 0;
  const viewsText = formatViews(viewsCount);

  item.innerHTML = `
    <div class="shorts-shelf-thumb">
      <img src="${thumbUrl}" alt="" loading="lazy">
      <div class="shorts-shelf-play">
        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="#fff"/></svg>
      </div>
    </div>
    <div class="shorts-shelf-title-text">${escapeHtml(short.caption || 'Short video')}</div>
    <div class="shorts-shelf-views">${viewsText} views</div>
  `;

  /* Fallback */
  const img = item.querySelector('img');
  if (img) {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const thumbWrap = item.querySelector('.shorts-shelf-thumb');
      if (thumbWrap && !thumbWrap.querySelector('video')) {
        const vid = document.createElement('video');
        vid.src = short.url;
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = 'metadata';
        vid.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;position:absolute;top:0;left:0;';
        thumbWrap.insertBefore(vid, thumbWrap.firstChild);
        vid.addEventListener('loadedmetadata', () => {
          try { vid.currentTime = 1; } catch (e) {}
        });
        vid.addEventListener('error', () => {
          vid.remove();
          thumbWrap.classList.add('no-thumb');
        });
      }
    }, { once: true });
  }

  item.addEventListener('click', () => {
    setActiveNav('shorts');
    renderShortsFeed();
  });

  return item;
}

/* ✅ YouTube-style Long Card */
function makeFeedPost(post) {
  const card = document.createElement('div');
  card.className = 'yt-card';
  card.dataset.postId = post.id;

  const thumbUrl = post.thumbnail || (post.type === 'photo' ? post.url : '');
  const avatar = post.userPhoto || defaultAvatar(post.userName);
  const viewsCount = post.views || 0;
  const viewsText = formatViews(viewsCount);
  const timeAgoStr = post.createdAt?.toDate?.() ? timeAgoShort(post.createdAt.toDate()) : 'now';
  const duration = post.duration ? formatDuration(post.duration) : '';

  card.innerHTML = `
    <div class="yt-thumb" data-action="play">
      <img src="${thumbUrl}" alt="" loading="lazy">
      ${duration ? `<div class="yt-duration">${duration}</div>` : ''}
      <div class="yt-play-overlay">
        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="#fff"/></svg>
      </div>
    </div>
    <div class="yt-info">
      <img class="yt-avatar" src="${avatar}" alt="" data-action="profile">
      <div class="yt-meta">
        <div class="yt-title">${escapeHtml(post.caption || 'Untitled')}</div>
        <div class="yt-channel">${escapeHtml(post.userName || 'User')}${verifiedBadgeHTML(post.userVerified)}</div>
        <div class="yt-stats">${viewsText} views · ${timeAgoStr}</div>
      </div>
      <button class="yt-menu-btn" data-action="menu">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
        </svg>
      </button>
    </div>
  `;

  card.querySelector('[data-action="play"]').addEventListener('click', () => {
    openPlayer(post);
  });

  card.querySelector('[data-action="profile"]').addEventListener('click', (e) => {
    e.stopPropagation();
    openUserProfile(post.userId);
  });

  card.querySelector('.yt-menu-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    await showPostMenu(e.currentTarget, post);
  });

  attachDoubleTapLike(card.querySelector('.yt-thumb'), post, null);

  trackPostView(post.id);
  return card;
}

/* ============================================================
   POST PLAYER
   ============================================================ */
function openPostPlayer(post) {
  playerTitle.textContent = post.caption || (post.type === 'photo' ? 'Photo' : 'Video');

  if (post.type === 'photo') {
    playerContent.innerHTML = `<img src="${post.url}" alt="">`;
  } else if (post.type === 'short') {
    playerContent.innerHTML = `
      <div class="player-short-wrap" style="position:relative;">
        <video src="${post.url}" controls autoplay playsinline style="width:100%;max-height:75vh;background:#000;border-radius:8px;"></video>
      </div>
    `;
  } else {
    playerContent.innerHTML = `
      <div class="player-youtube-wrap" style="position:relative;">
        <video src="${post.url}" controls autoplay playsinline ${post.thumbnail ? `poster="${post.thumbnail}"` : ''} style="width:100%;max-height:75vh;background:#000;"></video>
        <div class="player-youtube-info">
          <div class="player-youtube-title">${escapeHtml(post.caption || 'Video')}</div>
          <div class="player-youtube-channel">${escapeHtml(post.userName || 'User')}${verifiedBadgeHTML(post.userVerified)}</div>
        </div>
      </div>
    `;
  }

  playerModal.classList.add('show');

  const playerInner = playerContent.firstElementChild;
  if (playerInner && post.type !== 'photo') {
    attachDoubleTapLike(playerInner, post, null);
  }
}

/* ============================================================
   POST MENU
   ============================================================ */
async function showPostMenu(anchorEl, post) {
  document.querySelectorAll('.post-menu-dropdown').forEach(el => el.remove());

  const menu = document.createElement('div');
  menu.className = 'post-menu-dropdown';

  const isOwner = post.userId === currentUser.uid;
  const isBlocked = (currentProfile?.blockedUsers || []).includes(post.userId);

  let menuHTML = '';

  if (isOwner) {
    menuHTML += `
      <button data-action="delete" class="danger">
        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        Delete Post
      </button>
    `;
  } else {
    menuHTML += `
      <button data-action="report">
        <svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
        Report Post
      </button>
      <button data-action="${isBlocked ? 'unblock' : 'block'}" class="${isBlocked ? '' : 'danger'}">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        ${isBlocked ? 'Unblock @' : 'Block @'}${escapeHtml(post.userHandle || 'user')}
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
  if (left + menuRect.width > window.innerWidth - 10) {
    left = window.innerWidth - menuRect.width - 10;
  }
  if (top + menuRect.height > window.innerHeight - 10) {
    top = rect.top - menuRect.height - 5;
  }

  menu.style.top = top + 'px';
  menu.style.left = left + 'px';

  menu.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      menu.remove();

      if (action === 'report')        await reportPost(post);
      else if (action === 'block')    await blockUser(post.userId, post.userHandle);
      else if (action === 'unblock')  await unblockUser(post.userId, post.userHandle);
      else if (action === 'delete')   await deletePost(post.id);
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

async function deletePost(postId) {
  const settings = typeof getSettings === 'function' ? getSettings() : { confirmDelete: true };
  if (settings.confirmDelete && !confirm('Delete this post permanently?')) return;
  try {
    await deleteDoc(doc(db, 'posts', postId));
    await updateDoc(doc(db, 'users', currentUser.uid), {
      videoCount: Math.max(0, (currentProfile.videoCount || 1) - 1)
    });
    currentProfile.videoCount = Math.max(0, (currentProfile.videoCount || 1) - 1);

    localStorage.removeItem('reelhub_feed_cache');

    showToast('🗑️ Post deleted');
    renderHomeFeed();
  } catch (e) {
    showToast('❌ Could not delete');
  }
}

/* ============================================================
   AUTO PLAY
   ============================================================ */
function setupFeedAutoplay() {
  const settings = typeof getSettings === 'function' ? getSettings() : { autoPlay: true };

  stopFeedAutoplay();

  if (!settings.autoPlay || settings.dataSaver) return;

  const videos = document.querySelectorAll('.yt-card video, .feed-post-media video');
  if (videos.length === 0) return;

  feedAutoplayObserver = new IntersectionObserver((entries) => {
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

  videos.forEach(v => feedAutoplayObserver.observe(v));
}

function stopFeedAutoplay() {
  if (feedAutoplayObserver) {
    feedAutoplayObserver.disconnect();
    feedAutoplayObserver = null;
  }
  document.querySelectorAll('.yt-card video, .feed-post-media video').forEach(v => {
    try { v.pause(); } catch (e) {}
  });
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
          userVerified: s.userVerified,
          stories: []
        };
      }
      grouped[s.userId].stories.push(s);
    });

    Object.values(grouped).forEach(u => {
      u.stories.sort((a, b) =>
        (a.createdAt?.toDate?.()?.getTime() || 0) -
        (b.createdAt?.toDate?.()?.getTime() || 0)
      );
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

      const allViewed = userGroup.stories.every(s =>
        (s.viewers || []).includes(currentUser.uid)
      );
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
  } catch (e) {
    console.warn('Stories bar error:', e);
  }
}

/* ============================================================
   STORY UPLOAD MODAL
   ============================================================ */
let storyPreviewBlobUrl = null;

function openStoryUploadModal() {
  currentStoryType = 'photo';
  currentStoryFile = null;
  currentStoryVideoDuration = 0;
  storyFileInput.value = '';

  if (storyPreviewBlobUrl) {
    try { URL.revokeObjectURL(storyPreviewBlobUrl); } catch (e) {}
    storyPreviewBlobUrl = null;
  }

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
  document.querySelector('.story-upload-tab[data-type="photo"]')?.classList.add('active');

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

document.getElementById('closeStoryUpload')?.addEventListener('click', () => {
  storyUploadModal.classList.remove('show');
  if (storyPreviewBlobUrl) {
    try { URL.revokeObjectURL(storyPreviewBlobUrl); } catch (e) {}
    storyPreviewBlobUrl = null;
  }
});

storyUploadModal.addEventListener('click', (e) => {
  if (e.target === storyUploadModal) {
    storyUploadModal.classList.remove('show');
    if (storyPreviewBlobUrl) {
      try { URL.revokeObjectURL(storyPreviewBlobUrl); } catch (e) {}
      storyPreviewBlobUrl = null;
    }
  }
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

    if (storyPreviewBlobUrl) {
      try { URL.revokeObjectURL(storyPreviewBlobUrl); } catch (e) {}
      storyPreviewBlobUrl = null;
    }

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
      storyUploadMsg.textContent = 'Choose image file.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      storyUploadMsg.textContent = 'Max 5 MB.';
      return;
    }
    currentStoryFile = file;
    const url = URL.createObjectURL(file);
    storyPreviewBlobUrl = url;
    storyPreviewImg.src = url;
    storyPreviewWrap.style.display = 'block';
    storyPickerWrap.style.display = 'none';
    storySubmitBtn.disabled = false;
    return;
  }

  if (!file.type.startsWith('video/')) {
    storyUploadMsg.textContent = 'Choose video file.';
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    storyUploadMsg.textContent = 'Max 20 MB.';
    return;
  }

  const url = URL.createObjectURL(file);
  const tempVideo = document.createElement('video');
  tempVideo.preload = 'metadata';
  tempVideo.src = url;

  tempVideo.onloadedmetadata = () => {
    const duration = tempVideo.duration;
    if (!isFinite(duration) || duration <= 0) {
      storyUploadMsg.textContent = 'Could not read duration.';
      URL.revokeObjectURL(url);
      return;
    }
    if (duration > 15.5) {
      storyUploadMsg.textContent = `Max 15 sec. Yours ${Math.round(duration)}s.`;
      URL.revokeObjectURL(url);
      return;
    }
    currentStoryFile = file;
    currentStoryVideoDuration = duration;
    storyPreviewBlobUrl = url;
    storyPreviewVideo.src = url;
    storyVideoPreviewWrap.style.display = 'block';
    storyPreviewInfo.textContent =
      `${Math.round(duration)}s · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    storyPickerWrap.style.display = 'none';
    storySubmitBtn.disabled = false;
  };

  tempVideo.onerror = () => {
    storyUploadMsg.textContent = 'Could not load video.';
    URL.revokeObjectURL(url);
  };
});

storySubmitBtn.addEventListener('click', async () => {
  if (!currentUser || !currentProfile) {
    storyUploadMsg.textContent = 'Login required.';
    return;
  }
  if (!currentStoryFile) {
    storyUploadMsg.textContent = 'Select a file.';
    return;
  }

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
      userVerified: currentProfile.verified || false,
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
      if (storyPreviewBlobUrl) {
        try { URL.revokeObjectURL(storyPreviewBlobUrl); } catch (e) {}
        storyPreviewBlobUrl = null;
      }
      if (document.querySelector('.nav-item[data-page="home"]')?.classList.contains('active')) {
        renderHomeFeed();
      }
    }, 1200);
  } catch (err) {
    storyUploadMsg.className = 'error-msg';
    storyUploadMsg.textContent = err.message || 'Upload failed.';
    storySubmitBtn.disabled = false;
    storySubmitBtn.textContent = 'Share to Story';
  }
});

/* ============================================================
   CLOUDINARY UPLOAD — STORY
   ============================================================ */
function uploadToCloudinaryStory(file, onProgress) {
  return new Promise((resolve, reject) => {
    const resourceType = currentStoryType === 'photo' ? 'image' : 'video';
    const acc = CLOUDINARY_ACCOUNTS.stories;
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
        onProgress(Math.round((e.loaded / e.total) * 100));
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
          if (errData.error?.message) errMsg = errData.error.message;
        } catch (e) {
          errMsg = 'HTTP ' + xhr.status;
        }
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));
    xhr.send(formData);
  });
}

/* ============================================================
   CLOUDINARY UPLOAD — GROUP FILES
   ============================================================ */
function uploadToCloudinaryGroupFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    let resourceType = 'raw';
    if (file.type.startsWith('image/')) resourceType = 'image';
    else if (file.type.startsWith('video/')) resourceType = 'video';

    const acc = CLOUDINARY_ACCOUNTS.stories;
    const url = `https://api.cloudinary.com/v1_1/${acc.cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', acc.preset);
    formData.append('api_key', acc.apiKey);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.timeout = 180000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (!res.secure_url) {
            reject(new Error('No URL'));
            return;
          }
          resolve(res);
        } catch (e) {
          reject(new Error('Invalid'));
        }
      } else {
        let errMsg = 'Upload failed';
        try {
          const d = JSON.parse(xhr.responseText);
          if (d.error?.message) errMsg = d.error.message;
        } catch (e) {}
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));
    xhr.send(formData);
  });
}

/* ============================================================
   CLOUDINARY UPLOAD — VOICE
   ============================================================ */
function uploadToCloudinaryVoice(file, onProgress) {
  return new Promise((resolve, reject) => {
    const acc = CLOUDINARY_ACCOUNTS.stories;
    const url = `https://api.cloudinary.com/v1_1/${acc.cloudName}/video/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', acc.preset);
    formData.append('api_key', acc.apiKey);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.timeout = 180000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (!res.secure_url) {
            reject(new Error('No URL'));
            return;
          }
          resolve(res);
        } catch (e) {
          reject(new Error('Invalid'));
        }
      } else {
        let errMsg = 'Upload failed';
        try {
          const d = JSON.parse(xhr.responseText);
          if (d.error?.message) errMsg = d.error.message;
        } catch (e) {}
        reject(new Error(errMsg));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));
    xhr.send(formData);
  });
}
/* ============================================================
   ReelHub — app.js (PART 3/4) — Story Viewer + Shorts + Comments
   ============================================================ */

/* ============================================================
   FORMAT VOICE DURATION
   ============================================================ */
function formatVoiceDuration(seconds) {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' + s : s}`;
}

/* ============================================================
   STORY VIEWER
   ============================================================ */
function openStoryViewer(userId) {
  const userIndex = storiesByUser.findIndex(u => u.userId === userId);
  if (userIndex === -1) return;

  document.querySelectorAll('.short-item video').forEach(v => {
    try { v.pause(); } catch (e) {}
  });

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
  storyUserName.innerHTML =
    `${escapeHtml(userGroup.userName || 'User')}${verifiedBadgeHTML(userGroup.userVerified)}`;

  const time = story.createdAt?.toDate?.();
  storyTime.textContent = time ? timeAgo(time) : 'just now';

  const isOwnStory = userGroup.userId === currentUser.uid;
  storyDeleteBtn.style.display = isOwnStory ? 'block' : 'none';

  const viewersBtn = document.getElementById('storyViewersBtn');
  const viewersCountEl = document.getElementById('storyViewersCount');

  if (viewersBtn) {
    if (isOwnStory) {
      viewersBtn.style.display = 'inline-flex';
      if (viewersCountEl) {
        viewersCountEl.textContent = (story.viewers || []).length;
      }
    } else {
      viewersBtn.style.display = 'none';
    }
  }

  /* Progress bars */
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

  /* Media */
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

  const fills = storyProgressBars.querySelectorAll('.story-progress-fill');
  const currentFill = fills[currentStoryIndex];

  if (story.type === 'photo') {
    const duration = (story.duration || 5) * 1000;
    startPhotoStoryProgress(duration, currentFill);
  } else {
    startVideoStoryProgress(currentStoryMediaEl, currentFill);
  }
}

function startPhotoStoryProgress(duration, currentFill) {
  if (!currentFill) return;
  const startTime = Date.now();

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
}

function startVideoStoryProgress(video, currentFill) {
  if (!video || !currentFill) return;

  const onTimeUpdate = () => {
    if (!video.duration || !isFinite(video.duration)) return;
    const percent = Math.min((video.currentTime / video.duration) * 100, 100);
    currentFill.style.width = percent + '%';
  };

  const onEnded = () => nextStory();
  const onLoaded = () => { video.play().catch(() => {}); };

  video.addEventListener('timeupdate', onTimeUpdate);
  video.addEventListener('ended', onEnded);
  video.addEventListener('loadedmetadata', onLoaded);

  if (video.readyState >= 1) onLoaded();

  video._cleanup = () => {
    video.removeEventListener('timeupdate', onTimeUpdate);
    video.removeEventListener('ended', onEnded);
    video.removeEventListener('loadedmetadata', onLoaded);
  };
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
  if (currentStoryMediaEl) {
    if (currentStoryMediaEl._cleanup) {
      try { currentStoryMediaEl._cleanup(); } catch (e) {}
      currentStoryMediaEl._cleanup = null;
    }
    if (currentStoryMediaEl.tagName === 'VIDEO') {
      try { currentStoryMediaEl.pause(); } catch (e) {}
    }
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
  if (!currentUser || !storyId) return;
  try {
    const storyRef = doc(db, 'stories', storyId);
    const snap = await getDoc(storyRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const viewers = data.viewers || [];

    if (!viewers.includes(currentUser.uid)) {
      await updateDoc(storyRef, { viewers: arrayUnion(currentUser.uid) });

      const s = typeof getSettings === 'function'
        ? getSettings()
        : { pushNotif: true };

      if (data.userId && data.userId !== currentUser.uid && s.pushNotif) {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: data.userId,
            type: 'story_view',
            title: '👁 New Story View',
            message: `${currentProfile?.name || 'Someone'} viewed your story`,
            storyId: storyId,
            fromUserId: currentUser.uid,
            read: false,
            createdAt: serverTimestamp()
          });
        } catch (e) {}
      }
    }
  } catch (e) {
    console.warn('markStoryViewed error:', e);
  }
}

/* Story viewer event bindings */
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
    showToast('❌ Could not delete');
  }
});

/* ============================================================
   SHORTS FEED
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
    console.error('Shorts load error:', e);
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

/* ✅ Short Item */
function makeShortItem(short) {
  const item = document.createElement('div');
  item.className = 'short-item';
  item.dataset.postId = short.id;

  const avatar = short.userPhoto || defaultAvatar(short.userName);
  const isLiked = (short.likes || []).includes(currentUser.uid);
  const likesCount = (short.likes || []).length;
  const commentsCount = short.commentsCount ?? (short.comments || []).length;
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
              <b>${escapeHtml(short.userName || 'User')}${verifiedBadgeHTML(short.userVerified)}</b>
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

  /* Deferred mute toggle */
  let shortTapTimer = null;
  videoEl.addEventListener('click', (e) => {
    if (e.detail >= 2) {
      clearTimeout(shortTapTimer);
      return;
    }
    clearTimeout(shortTapTimer);
    shortTapTimer = setTimeout(() => {
      videoEl.muted = !videoEl.muted;
      shortsSoundEnabled = !videoEl.muted;
      localStorage.setItem('shortsSound', shortsSoundEnabled ? 'true' : 'false');
      showToast(videoEl.muted ? '🔇 Sound OFF' : '🔊 Sound ON');
      if (!videoEl.muted) videoEl.play().catch(() => {});
    }, 280);
  });

  attachDoubleTapLike(item, short, null);

  return item;
}

function setupShortsAutoplay(wrap) {
  const settings = typeof getSettings === 'function'
    ? getSettings()
    : { autoPlay: true };

  stopShortsObserver();

  const videos = wrap.querySelectorAll('.short-item video');
  shortsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        if (settings.autoPlay && !settings.dataSaver) {
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
  if (shortsObserver) {
    shortsObserver.disconnect();
    shortsObserver = null;
  }
  document.querySelectorAll('.short-item video').forEach(v => {
    try { v.pause(); } catch (e) {}
  });
}

/* ============================================================
   LIKE / UNLIKE
   ============================================================ */
async function toggleLike(postId, btnEl) {
  if (!currentUser) return;
  if (!btnEl) return;

  const isCurrentlyLiked = btnEl.classList.contains('liked');
  const countSpan = btnEl.querySelector('span');
  const currentCount = countSpan ? (parseInt(countSpan.textContent) || 0) : 0;

  btnEl.disabled = true;

  if (isCurrentlyLiked) {
    /* 💔 UNLIKE */
    btnEl.classList.remove('liked');
    if (countSpan) countSpan.textContent = Math.max(0, currentCount - 1);

    try {
      await updateDoc(doc(db, 'posts', postId), {
        likes: arrayRemove(currentUser.uid)
      });
      showToast('💔 Unliked');
      if (navigator.vibrate) navigator.vibrate(20);
    } catch (e) {
      console.error('Unlike error:', e);
      btnEl.classList.add('liked');
      if (countSpan) countSpan.textContent = currentCount;
      showToast('❌ Could not unlike');
    }
  } else {
    /* ❤️ LIKE */
    btnEl.classList.add('liked');
    if (countSpan) countSpan.textContent = currentCount + 1;

    btnEl.style.transform = 'scale(1.3)';
    setTimeout(() => { btnEl.style.transform = ''; }, 200);

    const card = btnEl.closest('.yt-card, .short-item, .grid-item');
    if (card) showHeartAnimation(card);

    try {
      await updateDoc(doc(db, 'posts', postId), {
        likes: arrayUnion(currentUser.uid)
      });
      showToast('❤️ Liked');
      if (navigator.vibrate) navigator.vibrate(30);

      try {
        const s = typeof getSettings === 'function'
          ? getSettings()
          : { notifLikes: true, pushNotif: true };

        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists() && s.pushNotif && s.notifLikes) {
          const postData = postSnap.data();
          if (postData.userId && postData.userId !== currentUser.uid) {
            await addDoc(collection(db, 'notifications'), {
              userId: postData.userId,
              type: 'like',
              title: '❤️ New Like',
              message: `${currentProfile?.name || 'Someone'} liked your post`,
              postId: postId,
              fromUserId: currentUser.uid,
              read: false,
              createdAt: serverTimestamp()
            });
          }
        }
      } catch (e) {}
    } catch (e) {
      console.error('Like error:', e);
      btnEl.classList.remove('liked');
      if (countSpan) countSpan.textContent = currentCount;
      showToast('❌ Could not like');
    }
  }

  btnEl.disabled = false;
}

/* ============================================================
   SHARE POST
   ============================================================ */
async function sharePost(post) {
  const appUrl = window.location.origin;
  const shareText = `🎬 Check out this post on ReelHub!\n\n@${post.userHandle || 'user'}\n\n${appUrl}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'ReelHub Post', text: shareText, url: appUrl });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    showToast('✅ Link copied!');
  } catch (err) {
    showToast('❌ Could not share');
  }
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

document.getElementById('closeComments')?.addEventListener('click', () => {
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
          <span class="comment-name" data-uid="${comment.userId}">${escapeHtml(comment.userName || 'User')}${verifiedBadgeHTML(comment.userVerified)}</span>
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
  if (replyBtn) {
    replyBtn.addEventListener('click', () =>
      showReplyIndicator(comment.id, comment.userName, comment.userHandle)
    );
  }

  const deleteBtn = item.querySelector('.comment-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const settings = typeof getSettings === 'function' ? getSettings() : { confirmDelete: true };
      if (settings.confirmDelete && !confirm('Delete this comment?')) return;
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
        (comment.replies || []).forEach(reply =>
          repliesList.appendChild(makeCommentItem(reply, true))
        );
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

commentInput.addEventListener('input', () => {
  postCommentBtn.disabled = !commentInput.value.trim();
});

postCommentBtn.addEventListener('click', async () => {
  const text = commentInput.value.trim();
  if (!text || !activeCommentPostId || !currentUser) return;

  postCommentBtn.disabled = true;
  postCommentBtn.textContent = '...';

  // ✅ Snapshot reply so async failures don't lose it
  const replySnapshot = activeReplyTo;

  try {
    const commentData = {
      postId: activeCommentPostId,
      userId: currentUser.uid,
      userName: currentProfile?.name || 'User',
      userHandle: currentProfile?.user || '',
      userPhoto: currentProfile?.photo || '',
      userVerified: currentProfile?.verified || false,
      text: text,
      likes: [],
      parentId: replySnapshot ? replySnapshot.commentId : null,
      replyToUser: replySnapshot ? replySnapshot.userName : null,
      replyToHandle: replySnapshot ? replySnapshot.userHandle : null,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'comments'), commentData);

    try {
      const postRef = doc(db, 'posts', activeCommentPostId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const currentCount = postSnap.data().commentsCount || 0;
        await updateDoc(postRef, { commentsCount: currentCount + 1 });

        document.querySelectorAll(`.comment-btn[data-post="${activeCommentPostId}"] span`)
          .forEach(el => { el.textContent = currentCount + 1; });

        const s = typeof getSettings === 'function'
          ? getSettings()
          : { notifComments: true, pushNotif: true };

        const postData = postSnap.data();
        const shouldNotify = s.pushNotif && s.notifComments;

        if (postData.userId && postData.userId !== currentUser.uid && shouldNotify) {
          try {
            await addDoc(collection(db, 'notifications'), {
              userId: postData.userId,
              type: 'comment',
              title: '💬 New Comment',
              message: `${currentProfile?.name || 'Someone'} commented: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
              postId: activeCommentPostId,
              fromUserId: currentUser.uid,
              read: false,
              createdAt: serverTimestamp()
            });
          } catch (e) {}
        }

        if (replySnapshot && replySnapshot.commentId && shouldNotify) {
          try {
            const parentRef = doc(db, 'comments', replySnapshot.commentId);
            const parentSnap = await getDoc(parentRef);

            if (parentSnap.exists()) {
              const parentData = parentSnap.data();
              if (parentData.userId &&
                  parentData.userId !== currentUser.uid &&
                  parentData.userId !== postData.userId) {
                await addDoc(collection(db, 'notifications'), {
                  userId: parentData.userId,
                  type: 'reply',
                  title: '↩️ New Reply',
                  message: `${currentProfile?.name || 'Someone'} replied: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
                  postId: activeCommentPostId,
                  fromUserId: currentUser.uid,
                  read: false,
                  createdAt: serverTimestamp()
                });
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Comment count / notif failed:', e);
    }

    commentInput.value = '';
    hideReplyIndicator();
    postCommentBtn.textContent = 'Post';
    postCommentBtn.disabled = true;

    await loadComments();

    setTimeout(() => {
      commentInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  } catch (e) {
    console.error('Post comment error:', e);
    postCommentBtn.textContent = 'Post';
    postCommentBtn.disabled = false;
    showToast('❌ Could not post comment');
  }
});

function showReplyIndicator(commentId, userName, userHandle) {
  activeReplyTo = { commentId, userName, userHandle };

  replyIndicatorText.textContent = `Replying to @${userHandle}`;
  replyIndicator.classList.add('show');
  replyIndicator.style.display = 'flex';

  commentInput.focus();
  commentInput.placeholder = `Reply to @${userHandle}...`;

  setTimeout(() => {
    commentInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
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
  } catch (e) {
    console.error('Comment like error:', e);
  }
}

async function deleteComment(commentId) {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentSnap = await getDoc(commentRef);
    const isReply = commentSnap.exists() && commentSnap.data().parentId;

    await deleteDoc(commentRef);

    const repliesQ = query(collection(db, 'comments'), where('parentId', '==', commentId));
    const repliesSnap = await getDocs(repliesQ);
    const repliesCount = repliesSnap.size;

    for (const replyDoc of repliesSnap.docs) {
      await deleteDoc(doc(db, 'comments', replyDoc.id));
    }

    const totalDeleted = 1 + repliesCount;

    if (activeCommentPostId) {
      try {
        const postRef = doc(db, 'posts', activeCommentPostId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const currentCount = postSnap.data().commentsCount || 0;
          const newCount = Math.max(0, currentCount - totalDeleted);

          await updateDoc(postRef, { commentsCount: newCount });

          document.querySelectorAll(`.comment-btn[data-post="${activeCommentPostId}"] span`)
            .forEach(el => { el.textContent = newCount; });
        }
      } catch (e) {
        console.warn('Count decrement failed:', e);
      }
    }

    showToast('Comment deleted');
    await loadComments();
  } catch (e) {
    console.error('Delete comment error:', e);
    showToast('❌ Could not delete comment');
  }
}
/* ============================================================
   ReelHub — app.js (PART 4/4) — FULL FINAL
   Chat, Groups, Profile, Upload, Notifications, Search,
   Settings, Delete Account + IG/WA Chat Upgrade
   ⚡ All chat bugs FIXED (#1-#8)
   🔊 Sound system added
   🔥 Real-time chat list + notifications
   ============================================================ */

/* ============================================================
   🔊 SOUND SYSTEM (Web Audio API — no files needed)
   ============================================================ */
let _audioCtx = null;

function _getAudioCtx() {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }
  return _audioCtx;
}

/* Unlock audio on first user interaction (Chrome policy) */
function _unlockAudio() {
  const ctx = _getAudioCtx();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}
document.addEventListener('click', _unlockAudio, { once: true });
document.addEventListener('touchstart', _unlockAudio, { once: true });

/* ✅ Send sound — short "swoosh up" blip */
function playSendSound() {
  const s = typeof getSettings === 'function' ? getSettings() : {};
  if (s.soundEffects === false) return;
  try {
    const ctx = _getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(700, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.09);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    o.start();
    o.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

/* ✅ Receive sound — "ta-da" double blip (when chat window is open) */
function playReceiveSound() {
  const s = typeof getSettings === 'function' ? getSettings() : {};
  if (s.soundEffects === false) return;
  try {
    const ctx = _getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const tones = [
      { freq: 660, delay: 0 },
      { freq: 880, delay: 0.12 }
    ];
    tones.forEach(({ freq, delay }) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      g.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.16);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + 0.17);
    });
    if (navigator.vibrate) navigator.vibrate(60);
  } catch (e) {}
}

/* ✅ Notification sound — triple blip (new message when chat closed) */
function playNotificationSound() {
  const s = typeof getSettings === 'function' ? getSettings() : {};
  if (s.soundEffects === false) return;
  try {
    const ctx = _getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const tones = [
      { freq: 900, delay: 0 },
      { freq: 1000, delay: 0.1 },
      { freq: 1100, delay: 0.2 }
    ];
    tones.forEach(({ freq, delay }) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      g.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + 0.11);
    });
  } catch (e) {}
}

/* ============================================================
   CHATS PAGE
   ============================================================ */
async function renderChatsPage() {
  content.innerHTML = `
    <div class="chats-page">
      <div class="chats-header">
        <div class="chats-title">Chats</div>
        <div style="display:flex;gap:6px;">
          <button class="new-chat-btn" id="openNewGroupBtn" title="New Group">
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </button>
          <button class="new-chat-btn" id="openNewChatBtn" title="New Chat">
            <svg viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="chats-tabs">
        <button class="chats-tab active" data-tab="all">All</button>
        <button class="chats-tab" data-tab="dm">Direct</button>
        <button class="chats-tab" data-tab="group">Groups</button>
      </div>

      <div class="chats-list" id="chatsList"><div class="empty-msg">Loading chats...</div></div>
    </div>
  `;

  document.getElementById('openNewChatBtn')?.addEventListener('click', openNewChatModal);
  document.getElementById('openNewGroupBtn')?.addEventListener('click', openNewGroupModal);

  document.querySelectorAll('.chats-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.chats-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadChatsList(tab.dataset.tab);
    });
  });

  await loadChatsList('all');
}

async function loadChatsList(filter = 'all') {
  const wrap = document.getElementById('chatsList');
  if (!wrap) return;
  wrap.innerHTML = `<div class="empty-msg">Loading chats...</div>`;

  try {
    let dms = [];
    if (filter === 'all' || filter === 'dm') {
      const q = query(collection(db, 'chats'), where('members', 'array-contains', currentUser.uid));
      const snap = await getDocs(q);

      for (const docSnap of snap.docs) {
        const chat = { id: docSnap.id, ...docSnap.data() };
        if (chat.type === 'group') continue;
        const otherUid = chat.members.find(m => m !== currentUser.uid);
        if (!otherUid) continue;
        try {
          const userSnap = await getDoc(doc(db, 'users', otherUid));
          if (userSnap.exists()) dms.push({ ...chat, otherUser: { uid: otherUid, ...userSnap.data() } });
        } catch (e) {}
      }
    }

    let groups = [];
    if (filter === 'all' || filter === 'group') {
      const gq = query(collection(db, 'groups'), where('members', 'array-contains', currentUser.uid));
      const gsnap = await getDocs(gq);
      gsnap.forEach(d => groups.push({ id: d.id, ...d.data() }));
    }

    const all = [...dms, ...groups];
    all.sort((a, b) =>
      (b.lastMessageTime?.toDate?.()?.getTime() || 0) -
      (a.lastMessageTime?.toDate?.()?.getTime() || 0)
    );

    if (all.length === 0) {
      wrap.innerHTML = `
        <div class="chats-empty">
          <svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <h3>No chats yet</h3>
          <p>Start a conversation or create a group</p>
        </div>`;
      return;
    }

    wrap.innerHTML = '';
    all.forEach(chat => {
      if (chat.type === 'group') wrap.appendChild(makeGroupChatItem(chat));
      else wrap.appendChild(makeChatItem(chat));
    });
  } catch (e) {
    console.error('Chats load error:', e);
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
    lastMsgHtml = `<div class="last-msg voice ${hasUnread ? 'unread' : ''}">🎤 Voice message</div>`;
  } else if (chat.lastMessageType === 'file') {
    lastMsgHtml = `<div class="last-msg ${hasUnread ? 'unread' : ''}">📎 File</div>`;
  } else {
    const preview = (chat.lastMessage || '').substring(0, 40);
    lastMsgHtml = `<div class="last-msg ${hasUnread ? 'unread' : ''}">${escapeHtml(preview)}${chat.lastMessage && chat.lastMessage.length > 40 ? '...' : ''}</div>`;
  }

  item.innerHTML = `
    <img src="${avatar}" alt="">
    <div class="meta">
      <b>${escapeHtml(otherUser.name || 'User')}${verifiedBadgeHTML(otherUser.verified)}${otherUser.isPrivate ? ' 🔒' : ''}</b>
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

function makeGroupChatItem(group) {
  const item = document.createElement('div');
  item.className = 'chat-item';

  const avatar = group.photo || defaultGroupAvatar(group.name);
  const time = group.lastMessageTime?.toDate?.();
  const timeStr = time ? timeAgoShort(time) : '';
  const hasUnread = group.lastMessageBy !== currentUser.uid &&
                    (group.unreadBy || []).includes(currentUser.uid);

  let lastMsgHtml = '';
  if (group.lastMessageType === 'voice') {
    lastMsgHtml = `<div class="last-msg voice ${hasUnread ? 'unread' : ''}">🎤 Voice message</div>`;
  } else if (group.lastMessageType === 'file') {
    lastMsgHtml = `<div class="last-msg ${hasUnread ? 'unread' : ''}">📎 ${escapeHtml(group.lastFileName || 'File')}</div>`;
  } else {
    const preview = (group.lastMessage || '').substring(0, 40);
    lastMsgHtml = `<div class="last-msg ${hasUnread ? 'unread' : ''}">${escapeHtml(preview)}</div>`;
  }

  item.innerHTML = `
    <img src="${avatar}" alt="">
    <div class="meta">
      <b>${escapeHtml(group.name || 'Group')} 👥</b>
      ${lastMsgHtml}
    </div>
    <div class="info">
      <div class="time">${timeStr}</div>
      ${hasUnread ? `<div class="unread-badge">●</div>` : ''}
    </div>
  `;

  item.addEventListener('click', () => openGroupChatWindow(group));
  return item;
}

function defaultGroupAvatar(name) {
  const raw = (name || 'G').trim().charAt(0).toUpperCase() || 'G';
  const letter = raw.replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#4ea8ff"/><text x="50" y="50" font-size="44" font-family="sans-serif" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${letter}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* ============================================================
   NEW CHAT MODAL
   ============================================================ */
function openNewChatModal() {
  newChatSearch.value = '';
  newChatResults.innerHTML = `<div class="search-empty">Start typing...</div>`;
  newChatModal.classList.add('show');
  newChatSearch.focus();
}

document.getElementById('closeNewChat')?.addEventListener('click', () =>
  newChatModal.classList.remove('show')
);

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
    const blocked = currentProfile?.blockedUsers || [];

    const matches = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.id !== currentUser.uid && !blocked.includes(u.id))
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
        <div class="info"><b>${escapeHtml(u.name)}${verifiedBadgeHTML(u.verified)}${u.isPrivate ? ' 🔒' : ''}</b><span>@${escapeHtml(u.user)}</span></div>
        <button class="follow">Chat</button>
      `;
      row.addEventListener('click', () => {
        newChatModal.classList.remove('show');
        openChatWindow(u);
      });
      newChatResults.appendChild(row);
    });
  } catch (e) {
    newChatResults.innerHTML = `<div class="search-empty">Search failed</div>`;
  }
}

/* ============================================================
   NEW GROUP MODAL
   ============================================================ */
function openNewGroupModal() {
  selectedGroupMembers = [];
  currentGroupFile = null;

  const modal = document.getElementById('newGroupModal');
  modal.classList.add('show');
  document.getElementById('groupNameInput').value = '';
  document.getElementById('groupSearchInput').value = '';
  document.getElementById('groupSearchResults').innerHTML =
    `<div class="search-empty">Start typing to add members...</div>`;
  document.getElementById('selectedMembersList').innerHTML =
    `<div class="empty-msg" style="padding:8px;font-size:12px;">No members selected</div>`;
  document.getElementById('createGroupBtn').disabled = true;
}

document.getElementById('closeNewGroup')?.addEventListener('click', () =>
  document.getElementById('newGroupModal').classList.remove('show')
);

document.getElementById('newGroupModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'newGroupModal') e.target.classList.remove('show');
});

let groupSearchDebounce = null;
document.getElementById('groupSearchInput')?.addEventListener('input', (e) => {
  clearTimeout(groupSearchDebounce);
  groupSearchDebounce = setTimeout(() => searchUsersForGroup(e.target.value.trim()), 300);
});

document.getElementById('groupNameInput')?.addEventListener('input', checkCreateGroupBtn);

document.getElementById('groupPhotoInput')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 500 * 1024) { showToast('❌ Max 500 KB'); return; }
  currentGroupFile = file;
  const preview = document.getElementById('groupPhotoPreview');
  if (preview) preview.src = URL.createObjectURL(file);
});

function checkCreateGroupBtn() {
  const name = document.getElementById('groupNameInput').value.trim();
  const btn = document.getElementById('createGroupBtn');
  if (btn) btn.disabled = !(name && selectedGroupMembers.length > 0);
}

async function searchUsersForGroup(term) {
  const results = document.getElementById('groupSearchResults');
  if (!term) {
    results.innerHTML = `<div class="search-empty">Start typing...</div>`;
    return;
  }

  results.innerHTML = `<div class="search-empty">Searching...</div>`;

  try {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    const lowerTerm = term.toLowerCase();
    const blocked = currentProfile?.blockedUsers || [];

    const matches = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.id !== currentUser.uid && !blocked.includes(u.id))
      .filter(u => !selectedGroupMembers.includes(u.id))
      .filter(u =>
        (u.name || '').toLowerCase().includes(lowerTerm) ||
        (u.user || '').toLowerCase().includes(lowerTerm)
      )
      .slice(0, 20);

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-empty">No users found</div>`;
      return;
    }

    results.innerHTML = '';
    matches.forEach(u => {
      const row = document.createElement('div');
      row.className = 'search-user';
      row.innerHTML = `
        <img src="${u.photo || defaultAvatar(u.name)}" alt="">
        <div class="info"><b>${escapeHtml(u.name)}${verifiedBadgeHTML(u.verified)}</b><span>@${escapeHtml(u.user)}</span></div>
        <button class="follow">Add</button>
      `;
      row.addEventListener('click', () => {
        selectedGroupMembers.push(u.id);
        addSelectedMemberChip(u);
        results.innerHTML = '';
        document.getElementById('groupSearchInput').value = '';
        checkCreateGroupBtn();
      });
      results.appendChild(row);
    });
  } catch (e) {
    results.innerHTML = `<div class="search-empty">Search failed</div>`;
  }
}

function addSelectedMemberChip(user) {
  const list = document.getElementById('selectedMembersList');
  if (list.querySelector('.empty-msg')) list.innerHTML = '';

  const chip = document.createElement('div');
  chip.className = 'member-chip';
  chip.dataset.uid = user.id;
  chip.innerHTML = `
    <img src="${user.photo || defaultAvatar(user.name)}" alt="">
    <span>${escapeHtml(user.name)}</span>
    <button class="chip-remove">✕</button>
  `;

  chip.querySelector('.chip-remove').addEventListener('click', () => {
    selectedGroupMembers = selectedGroupMembers.filter(id => id !== user.id);
    chip.remove();
    if (selectedGroupMembers.length === 0) {
      list.innerHTML = `<div class="empty-msg" style="padding:8px;font-size:12px;">No members selected</div>`;
    }
    checkCreateGroupBtn();
  });

  list.appendChild(chip);
}

document.getElementById('createGroupBtn')?.addEventListener('click', async () => {
  const name = document.getElementById('groupNameInput').value.trim();

  if (!name) { showToast('❌ Enter group name'); return; }
  if (selectedGroupMembers.length === 0) { showToast('❌ Add at least 1 member'); return; }

  const btn = document.getElementById('createGroupBtn');
  btn.disabled = true;
  btn.textContent = 'Creating...';

  try {
    let photoUrl = '';
    if (currentGroupFile) {
      try {
        const uploadRes = await uploadToCloudinaryGroupFile(currentGroupFile, () => {});
        photoUrl = uploadRes.secure_url;
      } catch (e) { console.warn('Group photo upload failed:', e); }
    }

    await addDoc(collection(db, 'groups'), {
      name: name,
      photo: photoUrl,
      createdBy: currentUser.uid,
      createdByName: currentProfile.name,
      members: [currentUser.uid, ...selectedGroupMembers],
      admins: [currentUser.uid],
      type: 'group',
      lastMessage: 'Group created',
      lastMessageBy: currentUser.uid,
      lastMessageTime: serverTimestamp(),
      unreadBy: selectedGroupMembers,
      createdAt: serverTimestamp()
    });

    showToast('✅ Group created!');
    document.getElementById('newGroupModal').classList.remove('show');
    await loadChatsList('group');
  } catch (e) {
    console.error(e);
    showToast('❌ Could not create group');
    btn.disabled = false;
    btn.textContent = 'Create Group';
  }
});

/* ============================================================
   ⌨️ TYPING INDICATOR  —  ✅ BUG FIX #2
   ============================================================ */
async function sendTypingSignal(isTyping) {
  if (!activeChatId || !currentUser) return;
  try {
    const col = activeGroupId ? 'groups' : 'chats';
    const ref = doc(db, col, activeChatId);
    const data = {};
    data[`typing.${currentUser.uid}`] = isTyping ? Date.now() : null;

    // ✅ FIX #2: setDoc+merge instead of updateDoc (works on non-existent doc)
    await setDoc(ref, data, { merge: true });
  } catch (e) {
    // Silent fail — typing is non-critical
  }
}

function setupTypingListener() {
  if (typingListenerUnsub) {
    try { typingListenerUnsub(); } catch (e) {}
    typingListenerUnsub = null;
  }

  if (!activeChatId || !currentUser) return;

  const col = activeGroupId ? 'groups' : 'chats';
  const ref = doc(db, col, activeChatId);

  typingListenerUnsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    const typingData = data.typing || {};

    const now = Date.now();
    const activeTypers = Object.keys(typingData).filter(uid => {
      if (uid === currentUser.uid) return false;
      const t = typingData[uid];
      return t && typeof t === 'number' && (now - t) < 4000;
    });

    updateTypingIndicatorUI(activeTypers);
  });
}

function updateTypingIndicatorUI(uids) {
  const el = document.getElementById('typingIndicator');
  if (!el) return;

  if (uids.length === 0) {
    el.style.display = 'none';
    return;
  }

  el.style.display = 'flex';

  let text = 'typing...';
  if (activeGroupId) {
    if (uids.length === 1) text = 'Someone is typing...';
    else if (uids.length === 2) text = '2 people typing...';
    else text = `${uids.length} people typing...`;
  }

  const textEl = el.querySelector('.typing-text');
  if (textEl) textEl.textContent = text;
}

async function clearTypingSignal() {
  if (!isCurrentlyTyping) return;
  isCurrentlyTyping = false;
  clearTimeout(typingTimeout);
  await sendTypingSignal(false);
}

/* ============================================================
   💬 REPLY SYSTEM
   ============================================================ */
function setChatReply(msg) {
  chatReplyTo = {
    msgId: msg.id,
    text: msg.text || (msg.type === 'voice' ? '🎤 Voice message' : (msg.type === 'file' ? '📎 File' : 'Message')),
    senderName: msg.from === currentUser.uid ? 'You' : (msg.fromName || 'User'),
    senderUid: msg.from
  };

  const preview = document.getElementById('chatReplyPreview');
  const nameEl = document.getElementById('chatReplyName');
  const textEl = document.getElementById('chatReplyText');
  if (preview) preview.classList.add('show');
  if (nameEl) nameEl.textContent = chatReplyTo.senderName;
  if (textEl) textEl.textContent = chatReplyTo.text.substring(0, 80);
  chatMessageInput.focus();
}

function clearChatReply() {
  chatReplyTo = null;
  const preview = document.getElementById('chatReplyPreview');
  if (preview) preview.classList.remove('show');
}

document.getElementById('chatReplyClose')?.addEventListener('click', clearChatReply);

/* ============================================================
   😍 REACTION SYSTEM
   ============================================================ */
function showReactionPicker(msg, anchorEl) {
  const picker = document.getElementById('reactionPicker');
  if (!picker) return;

  activeReactionMsg = msg;
  picker.style.display = 'flex';

  const rect = anchorEl.getBoundingClientRect();
  const pickerRect = picker.getBoundingClientRect();

  let top = rect.top - pickerRect.height - 8;
  let left = rect.left + rect.width / 2 - pickerRect.width / 2;

  if (top < 60) top = rect.bottom + 8;
  if (left < 10) left = 10;
  if (left + pickerRect.width > window.innerWidth - 10) {
    left = window.innerWidth - pickerRect.width - 10;
  }

  picker.style.top = top + 'px';
  picker.style.left = left + 'px';
}

async function addReaction(msgId, emoji) {
  if (!activeChatId || !currentUser) return;

  try {
    const col = activeGroupId ? 'groups' : 'chats';
    const msgRef = doc(db, col, activeChatId, 'messages', msgId);
    const msgSnap = await getDoc(msgRef);
    if (!msgSnap.exists()) return;

    const data = msgSnap.data();
    const reactions = data.reactions || {};
    const myReaction = reactions[currentUser.uid];

    if (myReaction === emoji) {
      delete reactions[currentUser.uid];
    } else {
      reactions[currentUser.uid] = emoji;
    }

    await updateDoc(msgRef, { reactions });
    if (navigator.vibrate) navigator.vibrate(20);
  } catch (e) {
    console.error('Reaction error:', e);
  }
}

/* Reaction picker button clicks */
document.querySelectorAll('#reactionPicker button').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const emoji = btn.dataset.emoji;
    if (activeReactionMsg) await addReaction(activeReactionMsg.id, emoji);
    document.getElementById('reactionPicker').style.display = 'none';
    activeReactionMsg = null;
  });
});

/* Close picker on outside click */
document.addEventListener('click', (e) => {
  const picker = document.getElementById('reactionPicker');
  if (picker && picker.style.display !== 'none') {
    if (!picker.contains(e.target) && !e.target.closest('.msg-bubble')) {
      picker.style.display = 'none';
      activeReactionMsg = null;
    }
  }
});

/* Reaction pill click (delegated) */
document.addEventListener('click', async (e) => {
  const pill = e.target.closest('.msg-reaction-pill');
  if (!pill) return;
  const row = pill.closest('.msg-row');
  if (!row) return;
  const msgId = row.dataset.msgId;
  const emoji = pill.dataset.emoji;
  if (msgId && emoji) await addReaction(msgId, emoji);
});

/* ============================================================
   ↔️ SWIPE TO REPLY
   ============================================================ */
function setupSwipeReply(row, msg) {
  if (msg.deleted) return;

  let startX = 0, startY = 0, isDragging = false, currentX = 0;

  const onStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    isDragging = false;
    currentX = 0;
  };

  const onMove = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (!isDragging) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.5 && dx > 0) {
        isDragging = true;
        row.classList.add('swiping');
      } else return;
    }

    if (isDragging) {
      if (e.cancelable) e.preventDefault();
      currentX = Math.min(dx, 80);
      row.style.transform = `translateX(${currentX}px)`;
      const icon = row.querySelector('.swipe-reply-icon');
      if (icon) icon.style.opacity = currentX > 30 ? '1' : '0';
    }
  };

  const onEnd = () => {
    if (!isDragging) return;
    row.classList.remove('swiping');
    row.style.transition = 'transform 0.2s ease';

    if (currentX > 50) {
      setChatReply(msg);
      if (navigator.vibrate) navigator.vibrate(15);
    }

    row.style.transform = 'translateX(0)';
    currentX = 0;
    isDragging = false;
    const icon = row.querySelector('.swipe-reply-icon');
    if (icon) icon.style.opacity = '0';
    setTimeout(() => row.style.transition = '', 250);
  };

  /* Long press for reaction */
  let pressTimer = null;
  const onLongPress = (e) => {
    pressTimer = setTimeout(() => {
      showReactionPicker(msg, row.querySelector('.msg-bubble'));
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  };
  const cancelPress = () => clearTimeout(pressTimer);

  row.addEventListener('touchstart', onStart, { passive: true });
  row.addEventListener('touchmove', onMove, { passive: false });
  row.addEventListener('touchend', onEnd);
  row.addEventListener('touchcancel', onEnd);
  row.addEventListener('mousedown', onStart);
  row.addEventListener('mousemove', (e) => { if (isDragging || e.buttons === 1) onMove(e); });
  row.addEventListener('mouseup', onEnd);
  row.addEventListener('mouseleave', onEnd);

  row.addEventListener('touchstart', onLongPress, { passive: true });
  row.addEventListener('touchend', cancelPress);
  row.addEventListener('touchmove', cancelPress);
  row.addEventListener('touchcancel', cancelPress);
  row.addEventListener('mousedown', onLongPress);
  row.addEventListener('mouseup', cancelPress);
  row.addEventListener('mouseleave', cancelPress);
}

/* ============================================================
   RENDER QUOTED + REACTIONS
   ============================================================ */
function renderQuotedBlock(msg) {
  if (!msg.replyTo) return '';

  return `
    <div class="msg-quoted" data-jump="${msg.replyTo.msgId || ''}">
      <div class="msg-quoted-content">
        <div class="msg-quoted-name">${escapeHtml(msg.replyTo.senderName || 'User')}</div>
        <div class="msg-quoted-text">${escapeHtml((msg.replyTo.text || '').substring(0, 80))}</div>
      </div>
    </div>
  `;
}

function renderReactions(msg) {
  const reactions = msg.reactions || {};
  const uids = Object.keys(reactions);
  if (uids.length === 0) return '';

  const grouped = {};
  uids.forEach(uid => {
    const emoji = reactions[uid];
    if (!grouped[emoji]) grouped[emoji] = [];
    grouped[emoji].push(uid);
  });

  const pills = Object.keys(grouped).map(emoji => {
    const users = grouped[emoji];
    const isMine = users.includes(currentUser.uid);
    return `
      <div class="msg-reaction-pill ${isMine ? 'mine' : ''}" data-emoji="${emoji}">
        <span class="emoji">${emoji}</span>
        ${users.length > 1 ? `<span class="count">${users.length}</span>` : ''}
      </div>
    `;
  }).join('');

  return `<div class="msg-reactions">${pills}</div>`;
}

function jumpToMessage(msgId) {
  const target = chatMessages.querySelector(`[data-msg-id="${msgId}"]`);
  if (!target) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.classList.add('highlight');
  setTimeout(() => target.classList.remove('highlight'), 1200);
}

/* ============================================================
   DM CHAT WINDOW
   ============================================================ */
function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

async function openChatWindow(otherUser) {
  if (!otherUser || otherUser.uid === currentUser.uid) return;

  if ((currentProfile?.blockedUsers || []).includes(otherUser.uid)) {
    showToast('🚫 You blocked this user');
    return;
  }

  if (otherUser.isPrivate) {
    const iFollowThem = currentProfile?.following?.includes(otherUser.uid);
    if (!iFollowThem) {
      showToast('🔒 This user is private. Follow to chat.');
      return;
    }
  }

  if (chatMessagesUnsub) {
    try { chatMessagesUnsub(); } catch (e) {}
    chatMessagesUnsub = null;
  }

  removePinnedBanner();
  stopVoicePlayback();

  activeChatId = getChatId(currentUser.uid, otherUser.uid);
  activeChatUser = otherUser;
  activeGroupId = null;
  activeGroupData = null;

  chatHeaderAvatar.src = otherUser.photo || defaultAvatar(otherUser.name);
  chatHeaderName.innerHTML = `${escapeHtml(otherUser.name || 'User')}${verifiedBadgeHTML(otherUser.verified)}`;
  chatHeaderHandle.textContent = '@' + (otherUser.user || '');
  chatHeaderInfo.onclick = () => {
    closeChatWindow();
    openUserProfile(otherUser.uid);
  };

  chatMessages.innerHTML = `<div class="empty-msg">Loading messages...</div>`;
  chatMessageInput.value = '';
  updateSendTextBtn();
  chatWindowModal.classList.add('show');

  chatMessages.classList.add('wallpaper-1');
  clearChatReply();

  await loadChatMessages();
  setupTypingListener();
}

function closeChatWindow() {
  chatWindowModal.classList.remove('show');

  clearChatReply();
  clearTypingSignal();

  if (typingListenerUnsub) {
    try { typingListenerUnsub(); } catch (e) {}
    typingListenerUnsub = null;
  }

  const picker = document.getElementById('reactionPicker');
  if (picker) picker.style.display = 'none';
  activeReactionMsg = null;

  if (chatMessagesUnsub) {
    try { chatMessagesUnsub(); } catch (e) {}
    chatMessagesUnsub = null;
  }

  removePinnedBanner();
  document.querySelectorAll('.msg-actions-menu, .edit-msg-modal').forEach(el => el.remove());

  activeChatId = null;
  activeChatUser = null;
  activeGroupId = null;
  activeGroupData = null;
  pinnedMessage = null;

  // ✅ FIX #4: clear the dedup sets on close
  _readProcessed.clear();
  _deliveredProcessed.clear();

  stopVoicePlayback();
}

document.getElementById('closeChatWindow')?.addEventListener('click', closeChatWindow);

/* ============================================================
   GROUP CHAT WINDOW
   ============================================================ */
async function openGroupChatWindow(group) {
  if (!group || !group.members.includes(currentUser.uid)) return;

  if (chatMessagesUnsub) {
    try { chatMessagesUnsub(); } catch (e) {}
    chatMessagesUnsub = null;
  }

  removePinnedBanner();
  stopVoicePlayback();

  activeGroupId = group.id;
  activeGroupData = group;
  activeChatId = group.id;
  activeChatUser = null;

  chatHeaderAvatar.src = group.photo || defaultGroupAvatar(group.name);
  chatHeaderName.textContent = group.name || 'Group';
  chatHeaderHandle.textContent = group.members.length + ' members';
  chatHeaderInfo.onclick = () => showGroupInfo(group);

  chatMessages.innerHTML = `<div class="empty-msg">Loading messages...</div>`;
  chatMessageInput.value = '';
  updateSendTextBtn();
  chatWindowModal.classList.add('show');

  chatMessages.classList.add('wallpaper-1');
  clearChatReply();

  await loadGroupMessages();
  await markGroupRead();
  setupTypingListener();
}

async function loadGroupMessages() {
  if (!activeGroupId) return;

  if (chatMessagesUnsub) {
    try { chatMessagesUnsub(); } catch (e) {}
    chatMessagesUnsub = null;
  }

  let isFirstSnapshot = true;

  try {
    const msgsRef = collection(db, 'groups', activeGroupId, 'messages');

    chatMessagesUnsub = onSnapshot(msgsRef, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      messages.sort((a, b) => {
        const ta = a.time?.toDate?.()?.getTime?.() || (a.time?.seconds ? a.time.seconds * 1000 : 0);
        const tb = b.time?.toDate?.()?.getTime?.() || (b.time?.seconds ? b.time.seconds * 1000 : 0);
        return ta - tb;
      });

      // ✅ NEW: Play receive sound if new message from other user
      if (!isFirstSnapshot && currentUser) {
        const newFromOther = messages.some(m =>
          !_seenMsgIds.has(m.id) &&
          m.from !== currentUser.uid &&
          !m.deleted
        );
        if (newFromOther) playReceiveSound();
      }

      messages.forEach(m => _seenMsgIds.add(m.id));
      isFirstSnapshot = false;

      paintGroupMessages(messages);
      markGroupMessagesAsRead();
    }, (err) => console.warn('Group listener error:', err));

    await loadPinnedMessage();
  } catch (e) {
    console.error('loadGroupMessages error:', e);
  }
}

/* ✅ FIX #3: Scroll position preserved */
function paintGroupMessages(messages) {
  if (messages.length === 0) {
    chatMessages.innerHTML = `<div class="chat-empty">No messages yet<br>Say hi! 👋</div>`;
    return;
  }

  const prevScrollTop = chatMessages.scrollTop;
  const prevScrollHeight = chatMessages.scrollHeight;
  const wasAtBottom = prevScrollHeight - prevScrollTop - chatMessages.clientHeight < 150;

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
    chatMessages.appendChild(makeGroupMessageBubble(msg));
  });

  requestAnimationFrame(() => {
    if (wasAtBottom) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      const newScrollHeight = chatMessages.scrollHeight;
      const diff = newScrollHeight - prevScrollHeight;
      chatMessages.scrollTop = prevScrollTop + diff;
    }
  });
}

function makeGroupMessageBubble(msg) {
  const row = document.createElement('div');
  const isMe = msg.from === currentUser.uid;
  row.className = 'msg-row ' + (isMe ? 'me' : 'other');
  row.dataset.msgId = msg.id;

  const time = msg.time?.toDate?.();
  const timeStr = time ? formatTime(time) : '';
  const senderName = !isMe
    ? `<div class="msg-sender-name">${escapeHtml(msg.fromName || 'User')}${verifiedBadgeHTML(msg.fromVerified)}</div>`
    : '';

  const swipeIcon = !isMe ? `
    <div class="swipe-reply-icon">
      <svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
    </div>` : '';

  if (msg.deleted) {
    row.innerHTML = `
      ${swipeIcon}
      <div class="msg-bubble deleted"><div class="deleted-text">🚫 This message was deleted</div></div>
      ${isMe ? buildDotsButton(msg) : ''}
    `;
    if (isMe) attachDotsButton(row, msg);
    return row;
  }

  if (msg.type === 'file') {
    const fileName = msg.fileName || 'File';
    const fileType = msg.fileType || '';
    let fileIcon = '📎';
    if (fileType.startsWith('image/')) fileIcon = '🖼️';
    else if (fileType.startsWith('video/')) fileIcon = '🎬';
    else if (fileType === 'application/pdf') fileIcon = '📄';

    row.innerHTML = `
      ${swipeIcon}
      ${isMe ? buildDotsButton(msg) : ''}
      <div class="msg-bubble file-bubble" data-msg="${msg.id}">
        ${senderName}
        ${renderQuotedBlock(msg)}
        <a href="${msg.fileUrl}" target="_blank" rel="noopener" class="file-download-wrap" download="${escapeHtml(fileName)}">
          <div class="file-icon">${fileIcon}</div>
          <div class="file-info">
            <div class="file-name">${escapeHtml(fileName)}</div>
            <div class="file-size">${formatFileSize(msg.fileSize || 0)} · Tap to open</div>
          </div>
        </a>
        <div class="msg-time">${timeStr}</div>
      </div>
      ${!isMe ? buildDotsButton(msg) : ''}
      ${renderReactions(msg)}
    `;
    if (isMe) attachDotsButton(row, msg);
    attachMsgEvents(row, msg);
    return row;
  }

  if (msg.type === 'voice') {
    const duration = msg.voiceDuration || 0;
    const bars = [];
    for (let i = 0; i < 22; i++) bars.push(30 + Math.floor(Math.random() * 70));
    const voiceSrc = msg.voiceUrl || msg.voiceData;

    row.innerHTML = `
      ${swipeIcon}
      ${isMe ? buildDotsButton(msg) : ''}
      <div class="msg-bubble voice-bubble" data-msg="${msg.id}">
        ${senderName}
        ${renderQuotedBlock(msg)}
        <button class="voice-play-btn" data-play="${msg.id}">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>
        </button>
        <div class="voice-waveform">${bars.map(h => `<div class="bar" style="height:${h}%"></div>`).join('')}</div>
        <div class="voice-duration">${formatVoiceDuration(duration)}</div>
        <div class="msg-time">${timeStr}</div>
      </div>
      ${!isMe ? buildDotsButton(msg) : ''}
      ${renderReactions(msg)}
    `;
    const playBtn = row.querySelector('.voice-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await playVoiceMessage({ ...msg, voiceData: voiceSrc }, row.querySelector('.voice-waveform'), playBtn);
      });
    }
    if (isMe) attachDotsButton(row, msg);
    attachMsgEvents(row, msg);
    return row;
  }

  const editedLabel = msg.edited ? '<span class="edited-label">(edited)</span>' : '';
  row.innerHTML = `
    ${swipeIcon}
    ${isMe ? buildDotsButton(msg) : ''}
    <div class="msg-bubble" data-msg="${msg.id}">
      ${senderName}
      ${renderQuotedBlock(msg)}
      <div class="msg-text">${escapeHtml(msg.text || '')}${editedLabel}</div>
      <div class="msg-time">${timeStr}</div>
    </div>
    ${!isMe ? buildDotsButton(msg) : ''}
    ${renderReactions(msg)}
  `;
  if (isMe) attachDotsButton(row, msg);
  attachMsgEvents(row, msg);
  return row;
}

async function markGroupMessagesAsRead() {
  if (!currentUser || !activeGroupId) return;
  try {
    await updateDoc(doc(db, 'groups', activeGroupId), { unreadBy: arrayRemove(currentUser.uid) });
  } catch (e) {}
}

async function markGroupRead() {
  if (!activeGroupId) return;
  try {
    await updateDoc(doc(db, 'groups', activeGroupId), { unreadBy: arrayRemove(currentUser.uid) });
    checkChatsUnread();
  } catch (e) {}
}

/* ============================================================
   SEND MESSAGE
   ============================================================ */

/* ✅ FIX #1 + SOUND: accept replyTo from payload, play send sound */
async function sendGroupMessage(msgData) {
  if (!activeGroupId) return;

  const message = {
    from: currentUser.uid,
    fromName: currentProfile?.name || 'User',
    fromPhoto: currentProfile?.photo || '',
    fromVerified: currentProfile?.verified || false,
    type: msgData.type || 'text',
    text: msgData.text || null,
    voiceData: msgData.voiceData || null,
    voiceUrl: msgData.voiceUrl || null,
    voiceDuration: msgData.voiceDuration || null,
    fileName: msgData.fileName || null,
    fileUrl: msgData.fileUrl || null,
    fileType: msgData.fileType || null,
    fileSize: msgData.fileSize || null,
    replyTo: msgData.replyTo ?? chatReplyTo,
    time: serverTimestamp()
  };

  try {
    await addDoc(collection(db, 'groups', activeGroupId, 'messages'), message);

    // 🔊 Send sound
    playSendSound();

    const otherMembers = (activeGroupData?.members || []).filter(m => m !== currentUser.uid);
    const groupRef = doc(db, 'groups', activeGroupId);

    await updateDoc(groupRef, {
      lastMessage: msgData.type === 'voice'
        ? '🎤 Voice message'
        : (msgData.type === 'file'
            ? '📎 ' + (msgData.fileName || 'File')
            : (msgData.text || '')),
      lastMessageType: msgData.type || 'text',
      lastFileName: msgData.fileName || '',
      lastMessageTime: serverTimestamp(),
      lastMessageBy: currentUser.uid,
      unreadBy: otherMembers
    });

    // ✅ FIX #8
    if (!typingListenerUnsub) setupTypingListener();
  } catch (e) {
    console.error('Group send error:', e);
    showToast('❌ Could not send');
  }
}

/* ✅ FIX #1 + SOUND: reply snapshot + send sound */
async function sendMessage(msgData) {
  if (!activeChatId || !activeChatUser) return;

  const message = {
    from: currentUser.uid,
    to: activeChatUser.uid,
    type: msgData.type || 'text',
    text: msgData.text || null,
    voiceData: msgData.voiceData || null,
    voiceUrl: msgData.voiceUrl || null,
    voiceDuration: msgData.voiceDuration || null,
    fileName: msgData.fileName || null,
    fileUrl: msgData.fileUrl || null,
    fileType: msgData.fileType || null,
    fileSize: msgData.fileSize || null,
    replyTo: msgData.replyTo ?? chatReplyTo,
    delivered: false,
    read: false,
    deleted: false,
    edited: false,
    time: serverTimestamp()
  };

  try {
    const settings = typeof getSettings === 'function' ? getSettings() : { vibration: true };
    if (settings.vibration && navigator.vibrate) navigator.vibrate(30);

    await addDoc(collection(db, 'chats', activeChatId, 'messages'), message);

    // 🔊 Send sound
    playSendSound();

    const chatRef = doc(db, 'chats', activeChatId);
    const chatSnap = await getDoc(chatRef);

    const chatData = {
      members: [currentUser.uid, activeChatUser.uid],
      lastMessage: msgData.type === 'voice'
        ? '🎤 Voice message'
        : (msgData.type === 'file'
            ? '📎 ' + (msgData.fileName || 'File')
            : (msgData.text || '')),
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

    if (!typingListenerUnsub) setupTypingListener();

    const s = typeof getSettings === 'function' ? getSettings() : { notifMessages: true, pushNotif: true };
    if (s.pushNotif && s.notifMessages) {
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: activeChatUser.uid,
          type: 'message',
          title: '💬 New Message',
          message: `${currentProfile?.name || 'Someone'}: ${(msgData.text || 'Sent you a message').substring(0, 50)}`,
          fromUserId: currentUser.uid,
          chatId: activeChatId,
          read: false,
          createdAt: serverTimestamp()
        });
      } catch (e) {}
    }
  } catch (e) {
    console.error('Send error:', e);
    showToast('❌ Could not send');
  }
}

/* ============================================================
   DM MESSAGES — REAL-TIME + Receive Sound
   ============================================================ */
async function loadChatMessages() {
  if (!activeChatId) return;

  if (chatMessagesUnsub) {
    try { chatMessagesUnsub(); } catch (e) {}
    chatMessagesUnsub = null;
  }

  let isFirstSnapshot = true;

  try {
    const msgsRef = collection(db, 'chats', activeChatId, 'messages');

    chatMessagesUnsub = onSnapshot(msgsRef, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      messages.sort((a, b) => {
        const ta = a.time?.toDate?.()?.getTime?.() || (a.time?.seconds ? a.time.seconds * 1000 : 0);
        const tb = b.time?.toDate?.()?.getTime?.() || (b.time?.seconds ? b.time.seconds * 1000 : 0);
        return ta - tb;
      });

      // 🔊 Receive sound if new message from other user
      if (!isFirstSnapshot && currentUser) {
        const newFromOther = messages.some(m =>
          !_seenMsgIds.has(m.id) &&
          m.from !== currentUser.uid &&
          !m.deleted
        );
        if (newFromOther) playReceiveSound();
      }

      messages.forEach(m => _seenMsgIds.add(m.id));
      isFirstSnapshot = false;

      paintChatMessages(messages);
      markMessagesAsRead(messages);
    }, (err) => console.warn('Chat listener error:', err));

    await loadPinnedMessage();
  } catch (e) {
    console.error('loadChatMessages error:', e);
    chatMessages.innerHTML = `<div class="chat-empty">Could not load messages</div>`;
  }
}

/* ✅ FIX #3: Scroll position preserved */
function paintChatMessages(messages) {
  if (messages.length === 0) {
    chatMessages.innerHTML = `<div class="chat-empty">No messages yet<br>Say hi! 👋</div>`;
    return;
  }

  const prevScrollTop = chatMessages.scrollTop;
  const prevScrollHeight = chatMessages.scrollHeight;
  const wasAtBottom = prevScrollHeight - prevScrollTop - chatMessages.clientHeight < 150;

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

  requestAnimationFrame(() => {
    if (wasAtBottom) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      const newScrollHeight = chatMessages.scrollHeight;
      const diff = newScrollHeight - prevScrollHeight;
      chatMessages.scrollTop = prevScrollTop + diff;
    }
  });
}

function makeMessageBubble(msg) {
  const row = document.createElement('div');
  const isMe = msg.from === currentUser.uid;
  row.className = 'msg-row ' + (isMe ? 'me' : 'other');
  row.dataset.msgId = msg.id;

  const time = msg.time?.toDate?.();
  const timeStr = time ? formatTime(time) : '';

  const swipeIcon = !isMe ? `
    <div class="swipe-reply-icon">
      <svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
    </div>` : '';

  if (msg.deleted) {
    row.innerHTML = `
      ${swipeIcon}
      <div class="msg-bubble deleted"><div class="deleted-text">🚫 This message was deleted</div></div>
      ${isMe ? buildDotsButton(msg) : ''}
    `;
    if (isMe) attachDotsButton(row, msg);
    return row;
  }

  if (msg.type === 'file') {
    const fileName = msg.fileName || 'File';
    const fileType = msg.fileType || '';
    let fileIcon = '📎';
    if (fileType.startsWith('image/')) fileIcon = '🖼️';
    else if (fileType.startsWith('video/')) fileIcon = '🎬';
    else if (fileType === 'application/pdf') fileIcon = '📄';

    row.innerHTML = `
      ${swipeIcon}
      ${isMe ? buildDotsButton(msg) : ''}
      <div class="msg-bubble file-bubble" data-msg="${msg.id}">
        ${renderQuotedBlock(msg)}
        <a href="${msg.fileUrl}" target="_blank" rel="noopener" class="file-download-wrap" download="${escapeHtml(fileName)}">
          <div class="file-icon">${fileIcon}</div>
          <div class="file-info">
            <div class="file-name">${escapeHtml(fileName)}</div>
            <div class="file-size">${formatFileSize(msg.fileSize || 0)} · Tap to open</div>
          </div>
        </a>
        <div class="msg-time">${timeStr}${isMe ? buildTicksHTML(msg) : ''}</div>
      </div>
      ${!isMe ? buildDotsButton(msg) : ''}
      ${renderReactions(msg)}
    `;
    if (isMe) attachDotsButton(row, msg);
    attachMsgEvents(row, msg);
    return row;
  }

  if (msg.type === 'voice') {
    const duration = msg.voiceDuration || 0;
    const bars = [];
    for (let i = 0; i < 22; i++) bars.push(30 + Math.floor(Math.random() * 70));
    const voiceSrc = msg.voiceUrl || msg.voiceData;

    row.innerHTML = `
      ${swipeIcon}
      ${isMe ? buildDotsButton(msg) : ''}
      <div class="msg-bubble voice-bubble" data-msg="${msg.id}">
        ${renderQuotedBlock(msg)}
        <button class="voice-play-btn" data-play="${msg.id}">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>
        </button>
        <div class="voice-waveform">${bars.map(h => `<div class="bar" style="height:${h}%"></div>`).join('')}</div>
        <div class="voice-duration">${formatVoiceDuration(duration)}</div>
        <div class="msg-time">${timeStr}${isMe ? buildTicksHTML(msg) : ''}</div>
      </div>
      ${!isMe ? buildDotsButton(msg) : ''}
      ${renderReactions(msg)}
    `;
    const playBtn = row.querySelector('.voice-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await playVoiceMessage({ ...msg, voiceData: voiceSrc }, row.querySelector('.voice-waveform'), playBtn);
      });
    }
    if (isMe) attachDotsButton(row, msg);
    attachMsgEvents(row, msg);
    return row;
  }

  const editedLabel = msg.edited ? '<span class="edited-label">(edited)</span>' : '';
  row.innerHTML = `
    ${swipeIcon}
    ${isMe ? buildDotsButton(msg) : ''}
    <div class="msg-bubble" data-msg="${msg.id}">
      ${renderQuotedBlock(msg)}
      <div class="msg-text">${escapeHtml(msg.text || '')}${editedLabel}</div>
      <div class="msg-time">${timeStr}${isMe ? buildTicksHTML(msg) : ''}</div>
    </div>
    ${!isMe ? buildDotsButton(msg) : ''}
    ${renderReactions(msg)}
  `;
  if (isMe) attachDotsButton(row, msg);
  attachMsgEvents(row, msg);
  return row;
}

/* Attach swipe/reaction/quote events */
function attachMsgEvents(row, msg) {
  setupSwipeReply(row, msg);

  /* ✅ FIX #7: Double-tap to react ❤️ */
  const bubble = row.querySelector('.msg-bubble');
  if (bubble) {
    let lastTap = 0;
    bubble.addEventListener('click', (e) => {
      if (e.target.closest('.msg-quoted')) return;
      if (e.target.closest('.file-download-wrap')) return;
      if (e.target.closest('.voice-play-btn')) return;
      if (e.target.closest('.msg-reaction-pill')) return;
      if (e.target.closest('.msg-dots-btn')) return;

      const now = Date.now();
      if (now - lastTap < 300) {
        lastTap = 0;
        addReaction(msg.id, '❤️');
        if (navigator.vibrate) navigator.vibrate(30);
      } else {
        lastTap = now;
      }
    });
  }

  const quoted = row.querySelector('.msg-quoted');
  if (quoted) {
    quoted.addEventListener('click', (e) => {
      e.stopPropagation();
      const jumpId = quoted.dataset.jump;
      if (jumpId) jumpToMessage(jumpId);
    });
  }
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
    menuHTML += `<button data-action="edit"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>`;
  }
  if (msg.type === 'text' && !msg.deleted && msg.text) {
    menuHTML += `<button data-action="reply"><svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>Reply</button>`;
  }
  if (msg.type === 'text' && !msg.deleted && msg.text) {
    menuHTML += `<button data-action="copy"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</button>`;
  }
  if (!msg.deleted) {
    menuHTML += `<button data-action="pin"><svg viewBox="0 0 24 24"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-1.5-7.5L19 5l-7 1-7-1 1.5 4.5z"/></svg>${isPinned ? 'Unpin' : 'Pin'}</button>`;
  }
  menuHTML += `<div class="menu-divider"></div><button data-action="delete" class="danger"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>Delete</button>`;

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
      if (action === 'edit')        await openEditMessageModal(msg);
      else if (action === 'reply')  setChatReply(msg);
      else if (action === 'copy')   await copyMessageText(msg);
      else if (action === 'pin')    await togglePinMessage(msg);
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

/* ✅ FIX #6: XSS-safe + DOM leak prevention */
async function openEditMessageModal(msg) {
  document.querySelectorAll('.edit-msg-modal').forEach(el => el.remove());

  const modal = document.createElement('div');
  modal.className = 'edit-msg-modal';
  modal.innerHTML = `
    <div class="edit-msg-box">
      <h3>✏️ Edit Message</h3>
      <textarea id="editMsgText" maxlength="1000">${escapeHtml((msg.text || '').substring(0, 1000))}</textarea>
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
    const col = activeGroupId ? 'groups' : 'chats';
    await updateDoc(doc(db, col, activeChatId, 'messages', msgId), {
      text: newText, edited: true, editedAt: serverTimestamp()
    });
    showToast('✏️ Edited');
  } catch (e) { showToast('❌ Could not edit'); }
}

async function copyMessageText(msg) {
  if (!msg.text) return;
  try {
    await navigator.clipboard.writeText(msg.text);
    showToast('📋 Copied');
  } catch (e) { showToast('❌ Failed to copy'); }
}

function buildTicksHTML(msg) {
  if (msg.from !== currentUser.uid) return '';
  const settings = typeof getSettings === 'function' ? getSettings() : { readReceipts: true };
  if (settings.readReceipts === false) return '';
  if (msg.read) return `<span class="msg-ticks read"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>`;
  if (msg.delivered) return `<span class="msg-ticks delivered"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>`;
  return `<span class="msg-ticks sent"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>`;
}

/* ✅ FIX #4: Dedup writes to save Firestore quota */
async function markMessagesAsRead(messages) {
  if (!currentUser || !activeChatId || activeGroupId) return;
  try {
    const unreadFromOther = messages.filter(m =>
      m.to === currentUser.uid && !m.read && !m.deleted && !_readProcessed.has(m.id)
    ).slice(0, 20);

    const undeliveredFromMe = messages.filter(m =>
      m.from === currentUser.uid && !m.delivered && !m.deleted && !_deliveredProcessed.has(m.id)
    ).slice(0, 20);

    if (unreadFromOther.length === 0 && undeliveredFromMe.length === 0) return;

    const updates = [];
    for (const msg of unreadFromOther) {
      _readProcessed.add(msg.id);
      updates.push(
        updateDoc(doc(db, 'chats', activeChatId, 'messages', msg.id),
          { read: true, readAt: serverTimestamp() }
        ).catch(() => { _readProcessed.delete(msg.id); })
      );
    }
    for (const msg of undeliveredFromMe) {
      _deliveredProcessed.add(msg.id);
      updates.push(
        updateDoc(doc(db, 'chats', activeChatId, 'messages', msg.id),
          { delivered: true }
        ).catch(() => { _deliveredProcessed.delete(msg.id); })
      );
    }

    await Promise.all(updates);
  } catch (e) {
    console.warn('markMessagesAsRead:', e);
  }
}

async function deleteMessage(msgId) {
  if (!activeChatId) return;
  try {
    const col = activeGroupId ? 'groups' : 'chats';
    await updateDoc(doc(db, col, activeChatId, 'messages', msgId), {
      deleted: true, deletedAt: serverTimestamp(),
      text: null, voiceData: null, voiceUrl: null, fileUrl: null
    });
    showToast('🗑️ Deleted');
  } catch (e) { showToast('❌ Failed to delete'); }
}

/* ============================================================
   PIN MESSAGE
   ============================================================ */
async function togglePinMessage(msg) {
  if (!activeChatId) return;
  try {
    const col = activeGroupId ? 'groups' : 'chats';
    const ref = doc(db, col, activeChatId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const currentPin = snap.data().pinnedMessage || null;
    if (currentPin === msg.id) {
      await updateDoc(ref, { pinnedMessage: null });
      pinnedMessage = null;
      showToast('Unpinned');
    } else {
      await updateDoc(ref, { pinnedMessage: msg.id });
      pinnedMessage = msg;
      showToast('📌 Pinned');
    }
    await loadPinnedMessage();
  } catch (e) {}
}

async function loadPinnedMessage() {
  if (!activeChatId) return;
  try {
    const col = activeGroupId ? 'groups' : 'chats';
    const ref = doc(db, col, activeChatId);
    const snap = await getDoc(ref);
    if (!snap.exists()) { pinnedMessage = null; removePinnedBanner(); return; }
    const pinId = snap.data().pinnedMessage;
    if (!pinId) { pinnedMessage = null; removePinnedBanner(); return; }
    const msgSnap = await getDoc(doc(db, col, activeChatId, 'messages', pinId));
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

  const previewText = msg.deleted ? '🚫 Deleted'
    : (msg.type === 'voice' ? '🎤 Voice'
    : (msg.type === 'file' ? '📎 ' + (msg.fileName || 'File')
    : (msg.text || '')));

  banner.innerHTML = `
    <svg viewBox="0 0 24 24"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-1.5-7.5L19 5l-7 1-7-1 1.5 4.5z"/></svg>
    <div class="pin-text"><b>📌 Pinned</b>${escapeHtml(previewText).substring(0, 60)}</div>
    <button class="pin-close" id="unpinBtn">✕</button>
  `;

  const chatHeader = chatWindow.querySelector('.chat-header');
  if (chatHeader) chatHeader.insertAdjacentElement('afterend', banner);
  chatMessages.classList.add('has-pinned');

  banner.querySelector('#unpinBtn').addEventListener('click', async () => {
    const col = activeGroupId ? 'groups' : 'chats';
    try {
      await updateDoc(doc(db, col, activeChatId), { pinnedMessage: null });
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

/* ============================================================
   INPUT BAR — Auto-resize + Typing + Enter
   ============================================================ */
function updateSendTextBtn() {
  const hasText = chatMessageInput.value.trim().length > 0;
  sendTextBtn.style.display = hasText ? 'flex' : 'none';
  micBtn.style.display = hasText ? 'none' : 'flex';
}

chatMessageInput.addEventListener('input', () => {
  updateSendTextBtn();

  chatMessageInput.style.height = 'auto';
  chatMessageInput.style.height = Math.min(chatMessageInput.scrollHeight, 120) + 'px';

  if (!activeChatId || !currentUser) return;
  if (!isCurrentlyTyping) {
    isCurrentlyTyping = true;
    sendTypingSignal(true);
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    if (isCurrentlyTyping) {
      isCurrentlyTyping = false;
      sendTypingSignal(false);
    }
  }, 2500);
});

chatMessageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendTextBtn.click();
  }
});

/* ✅ FIX #1: Reply snapshot BEFORE clearing */
sendTextBtn.addEventListener('click', async () => {
  const text = chatMessageInput.value.trim();
  if (!text) return;

  const replySnapshot = chatReplyTo;

  chatMessageInput.value = '';
  chatMessageInput.style.height = 'auto';
  updateSendTextBtn();
  clearTypingSignal();

  try {
    if (activeGroupId) {
      await sendGroupMessage({ type: 'text', text, replyTo: replySnapshot });
    } else {
      await sendMessage({ type: 'text', text, replyTo: replySnapshot });
    }
  } finally {
    clearChatReply();
  }
});

document.getElementById('chatAttachBtn')?.addEventListener('click', () => {
  if (!activeChatId) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*,application/pdf';
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await sendFileMessage(file);
  });
  input.click();
});

/* ✅ FIX #5: File reply chip cleared properly */
async function sendFileMessage(file) {
  if (file.size > 25 * 1024 * 1024) { showToast('❌ Max 25 MB'); return; }
  showToast('📤 Uploading file...');

  const replySnapshot = chatReplyTo;

  try {
    const res = await uploadToCloudinaryGroupFile(file, () => {});
    const payload = {
      type: 'file', fileName: file.name, fileUrl: res.secure_url,
      fileType: file.type || 'application/octet-stream', fileSize: file.size,
      replyTo: replySnapshot
    };
    try {
      if (activeGroupId) await sendGroupMessage(payload);
      else await sendMessage(payload);
    } finally {
      clearChatReply();
    }
  } catch (e) {
    console.error(e);
    showToast('❌ Upload failed');
  }
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
      if (voiceSeconds >= 60) stopVoiceRecordingAndSend();
    }, 1000);
  } catch (e) {
    showToast('❌ Mic permission needed');
    isRecording = false;
  }
}

/* ✅ FIX #5: Voice reply chip cleared properly */
async function stopVoiceRecordingAndSend() {
  if (!isRecording || !mediaRecorder) return;
  isRecording = false;
  clearInterval(voiceTimerInterval);
  recordingIndicator.classList.remove('show');
  recordingIndicator.style.display = 'none';
  const finalSeconds = voiceSeconds;

  const replySnapshot = chatReplyTo;

  return new Promise((resolve) => {
    mediaRecorder.onstop = async () => {
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
      if (finalSeconds < 1) { showToast('Too short'); resolve(); return; }
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      if (audioBlob.size > 5 * 1024 * 1024) { showToast('❌ Recording too large'); resolve(); return; }
      try {
        showToast('📤 Uploading voice...');
        const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: audioBlob.type });
        const res = await uploadToCloudinaryVoice(file, () => {});
        const payload = {
          type: 'voice', voiceUrl: res.secure_url, voiceDuration: finalSeconds,
          replyTo: replySnapshot
        };
        try {
          if (activeGroupId) await sendGroupMessage(payload);
          else await sendMessage(payload);
        } finally {
          clearChatReply();
        }
      } catch (e) {
        console.error('Voice upload failed:', e);
        showToast('❌ Voice upload failed');
      }
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

async function playVoiceMessage(msg, waveformEl, btnEl) {
  if (currentPlayingAudio && currentPlayingBtn === btnEl) { stopVoicePlayback(); return; }
  stopVoicePlayback();
  const src = msg.voiceUrl || msg.voiceData;
  if (!src) return;
  try {
    const audio = new Audio(src);
    currentPlayingAudio = audio;
    currentPlayingBtn = btnEl;
    waveformEl.classList.add('playing');
    btnEl.innerHTML = `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"/></svg>`;
    audio.onended = () => stopVoicePlayback();
    audio.onerror = () => { stopVoicePlayback(); showToast('❌ Play failed'); };
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

/* ============================================================
   🔥 REAL-TIME CHAT LIST WATCHER (DM + Group)
   ============================================================ */
function startChatListWatcher() {
  stopChatListWatcher();

  // ✅ DM chats real-time
  try {
    const dmQuery = query(
      collection(db, 'chats'),
      where('members', 'array-contains', currentUser.uid)
    );

    chatListUnsub = onSnapshot(dmQuery, (snap) => {
      let hasUnread = false;

      snap.forEach(d => {
        const data = d.data();
        if (data.type === 'group') return;

        if (data.lastMessageBy !== currentUser.uid &&
            (data.unreadBy || []).includes(currentUser.uid)) {
          hasUnread = true;
        }

        // 🔊 Notification sound if new msg & chat window not open
        const chatId = d.id;
        const lastTime = data.lastMessageTime?.toDate?.()?.getTime?.() || 0;
        const prevTime = _lastChatMsgTime.get(chatId) || 0;

        if (prevTime && lastTime > prevTime &&
            data.lastMessageBy !== currentUser.uid &&
            activeChatId !== chatId) {
          playNotificationSound();
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
        _lastChatMsgTime.set(chatId, lastTime);
      });

      updateChatsDot(hasUnread);

      // ✅ Auto-refresh chat list if page open
      if (document.getElementById('chatsList') && !activeChatId) {
        const activeTab = document.querySelector('.chats-tab.active')?.dataset.tab || 'all';
        _debouncedLoadChatsList(activeTab);
      }
    }, (err) => console.warn('DM list watcher:', err));
  } catch (e) { console.warn(e); }

  // ✅ Group chats real-time
  try {
    const groupQuery = query(
      collection(db, 'groups'),
      where('members', 'array-contains', currentUser.uid)
    );

    groupListUnsub = onSnapshot(groupQuery, (snap) => {
      let hasUnread = false;

      snap.forEach(d => {
        const data = d.data();

        if (data.lastMessageBy !== currentUser.uid &&
            (data.unreadBy || []).includes(currentUser.uid)) {
          hasUnread = true;
        }

        const groupId = d.id;
        const lastTime = data.lastMessageTime?.toDate?.()?.getTime?.() || 0;
        const prevTime = _lastGroupMsgTime.get(groupId) || 0;

        if (prevTime && lastTime > prevTime &&
            data.lastMessageBy !== currentUser.uid &&
            activeChatId !== groupId) {
          playNotificationSound();
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
        _lastGroupMsgTime.set(groupId, lastTime);
      });

      if (hasUnread) updateChatsDot(true);

      if (document.getElementById('chatsList') && !activeChatId) {
        const activeTab = document.querySelector('.chats-tab.active')?.dataset.tab || 'all';
        _debouncedLoadChatsList(activeTab);
      }
    }, (err) => console.warn('Group list watcher:', err));
  } catch (e) { console.warn(e); }
}

function stopChatListWatcher() {
  if (chatListInterval) { clearInterval(chatListInterval); chatListInterval = null; }
  if (chatListUnsub) { try { chatListUnsub(); } catch (e) {} chatListUnsub = null; }
  if (groupListUnsub) { try { groupListUnsub(); } catch (e) {} groupListUnsub = null; }
  if (chatsDot) chatsDot.style.display = 'none';
}

function updateChatsDot(show) {
  if (chatsDot) chatsDot.style.display = show ? 'block' : 'none';
}

/* ✅ Debounced list loader to avoid spam */
let _chatListLoadTimer = null;
function _debouncedLoadChatsList(filter) {
  clearTimeout(_chatListLoadTimer);
  _chatListLoadTimer = setTimeout(() => {
    loadChatsList(filter);
  }, 200);
}

/* Legacy — still called by visibility handler */
async function checkChatsUnread() {
  if (!currentUser) return;
  try {
    let hasUnread = false;
    const q = query(collection(db, 'chats'), where('members', 'array-contains', currentUser.uid));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const data = d.data();
      if (data.type === 'group') return;
      if (data.lastMessageBy !== currentUser.uid && (data.unreadBy || []).includes(currentUser.uid)) hasUnread = true;
    });
    const gq = query(collection(db, 'groups'), where('members', 'array-contains', currentUser.uid));
    const gsnap = await getDocs(gq);
    gsnap.forEach(d => {
      const data = d.data();
      if (data.lastMessageBy !== currentUser.uid && (data.unreadBy || []).includes(currentUser.uid)) hasUnread = true;
    });
    updateChatsDot(hasUnread);
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
          <div class="profile-stat" data-action="videos"><b>${p.videoCount || 0}</b><span>Videos</span></div>
          <div class="profile-stat" data-action="followers"><b>${p.followers.length}</b><span>Followers</span></div>
          <div class="profile-stat" data-action="following"><b>${p.following.length}</b><span>Following</span></div>
        </div>
      </div>
      <div class="profile-info">
        <div class="profile-name">${escapeHtml(p.name)}${verifiedBadgeHTML(p.verified, 'large')}${p.isPrivate ? ' 🔒' : ''}</div>
        <div class="profile-username">@${escapeHtml(p.user)}</div>
        <div class="profile-bio">${p.bio ? escapeHtml(p.bio) : '<span style="color:#555">No bio yet.</span>'}</div>
      </div>
      <div class="profile-actions">
        <button class="btn-outline" id="editProfileBtn">Edit Profile</button>
        <button class="btn-outline share-btn" id="shareProfileBtn">
          <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
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

  document.getElementById('editProfileBtn')?.addEventListener('click', openEditModal);
  document.getElementById('avatarWrap')?.addEventListener('click', openEditModal);
  document.getElementById('shareProfileBtn')?.addEventListener('click', () => shareProfile());

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
      const grid = document.getElementById('myPostsGrid');
      if (tab.dataset.tab === 'saved') await renderSavedPosts('myPostsGrid');
      else { grid.innerHTML = `<div class="grid-empty">Loading...</div>`; await renderUserPosts(currentUser.uid, 'myPostsGrid'); }
    });
  });

  await renderUserPosts(currentUser.uid, 'myPostsGrid');
}

async function renderUserPosts(uid, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const q = query(collection(db, 'posts'), where('userId', '==', uid), limit(60));
    const snap = await getDocs(q);
    if (snap.empty) {
      container.innerHTML = `<div class="grid-empty"><div>No posts yet</div></div>`;
      return;
    }
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    posts.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));
    container.innerHTML = '';
    posts.forEach(post => container.appendChild(makeGridItem(post)));
  } catch (e) { console.error('renderUserPosts error:', e); }
}

function makeGridItem(post) {
  const item = document.createElement('div');
  item.className = 'grid-item';
  item.style.aspectRatio = post.type === 'long' ? '16 / 9' : '9 / 16';

  const thumbUrl = post.thumbnail || (post.type === 'photo' ? post.url : '');
  let inner = '';
  if (post.type === 'photo') {
    inner = `<img src="${post.url}" alt="" loading="lazy">`;
  } else {
    inner = `<img src="${thumbUrl}" alt="" loading="lazy"><video src="${post.url}" muted playsinline preload="metadata" style="display:none;width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;"></video>`;
  }
  const badgeText = post.type === 'photo' ? 'PHOTO' : (post.type === 'long' ? 'LONG' : 'SHORT');
  item.innerHTML = `${inner}<div class="type-badge">${badgeText}</div>${post.type !== 'photo' ? `<div class="play-icon">▶</div>` : ''}`;

  const img = item.querySelector('img');
  const vid = item.querySelector('video');
  if (img && vid) {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      vid.style.display = 'block';
      vid.addEventListener('loadedmetadata', () => { try { vid.currentTime = 1; } catch (e) {} });
      vid.addEventListener('error', () => { vid.style.display = 'none'; item.classList.add('no-thumb'); }, { once: true });
    }, { once: true });
  }
  attachDoubleTapLike(item, post, () => openPlayer(post));
  return item;
}

/* ============================================================
   PUBLIC PROFILE
   ============================================================ */
async function openUserProfile(userId) {
  if (!userId) return;
  if (userId === currentUser.uid) { setActiveNav('profile'); renderPage('profile'); return; }

  const blocked = currentProfile?.blockedUsers || [];
  if (blocked.includes(userId)) { showToast('🚫 You blocked this user'); return; }

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
      <div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
        <button id="backFromProfileBtn"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>Back</button>
        <button id="profileMenuBtn" style="background:none;border:none;color:#fff;cursor:pointer;padding:6px;border-radius:50%;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
        </button>
      </div>
      <div class="profile-page" style="padding-top:0;">
        <div class="profile-top">
          <div class="profile-avatar-wrap"><img class="profile-avatar" src="${avatarSrc}" alt=""></div>
          <div class="profile-stats">
            <div class="profile-stat"><b>${videoCount}</b><span>Videos</span></div>
            <div class="profile-stat"><b>${followers.length}</b><span>Followers</span></div>
            <div class="profile-stat"><b>${following.length}</b><span>Following</span></div>
          </div>
        </div>
        <div class="profile-info">
          <div class="profile-name">${escapeHtml(user.name)}${verifiedBadgeHTML(user.verified, 'large')}${user.isPrivate ? ' 🔒' : ''}</div>
          <div class="profile-username">@${escapeHtml(user.user)}</div>
          <div class="profile-bio">${user.bio ? escapeHtml(user.bio) : '<span style="color:#555">No bio yet.</span>'}</div>
        </div>
        <div class="profile-actions">
          <button id="pubFollowBtn" class="${isFollowing ? 'following' : ''}">
            <svg viewBox="0 0 24 24">${isFollowing ? '<polyline points="20 6 9 17 4 12"/>' : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}</svg>
            ${isFollowing ? 'Following' : 'Follow'}
          </button>
          <button id="pubMessageBtn">
            <svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            Messages
          </button>
          <button id="pubShareBtn">
            <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
        </div>
        <div class="profile-tabs"><button class="profile-tab active">Posts</button></div>
        <div class="profile-grid" id="pubPostsGrid"><div class="grid-empty">Loading posts...</div></div>
      </div>
    `;

    document.getElementById('backFromProfileBtn').addEventListener('click', () => { viewingUserId = null; setActiveNav(null); renderPage('home'); });
    document.getElementById('profileMenuBtn').addEventListener('click', async (e) => { e.stopPropagation(); await showProfileMenu(e.currentTarget, userId, user.user); });

    const followBtn = document.getElementById('pubFollowBtn');
    followBtn.addEventListener('click', async () => {
      await toggleFollow(userId, null);
      const isNowFollowing = currentProfile.following.includes(userId);
      if (isNowFollowing) {
        followBtn.classList.add('following');
        followBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Following`;
      } else {
        followBtn.classList.remove('following');
        followBtn.innerHTML = `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Follow`;
      }
    });

    document.getElementById('pubMessageBtn')?.addEventListener('click', () => openChatWindow(user));
    document.getElementById('pubShareBtn')?.addEventListener('click', () => shareUser(user));

    await renderUserPosts(userId, 'pubPostsGrid');
  } catch (e) {
    console.error('openUserProfile error:', e);
    content.innerHTML = `<div class="page-placeholder"><div class="page-title">Could not load profile</div></div>`;
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
   BLOCK + REPORT
   ============================================================ */
async function showProfileMenu(anchorEl, userId, userHandle) {
  document.querySelectorAll('.post-menu-dropdown').forEach(el => el.remove());
  const menu = document.createElement('div');
  menu.className = 'post-menu-dropdown';
  const isBlocked = (currentProfile?.blockedUsers || []).includes(userId);

  menu.innerHTML = `
    <button data-action="${isBlocked ? 'unblock' : 'block'}" class="${isBlocked ? '' : 'danger'}">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
      ${isBlocked ? 'Unblock User' : 'Block User'}
    </button>
    <button data-action="report-user">
      <svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
      Report User
    </button>
  `;
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
      if (action === 'block')           await blockUser(userId, userHandle);
      else if (action === 'unblock')    await unblockUser(userId, userHandle);
      else if (action === 'report-user') await reportUser(userId, userHandle);
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

async function blockUser(userId, userHandle) {
  if (userId === currentUser.uid) { showToast('❌ Cannot block yourself'); return; }
  if (!confirm(`Block @${userHandle}?`)) return;
  try {
    await updateDoc(doc(db, 'users', currentUser.uid), { blockedUsers: arrayUnion(userId) });
    if (!currentProfile.blockedUsers) currentProfile.blockedUsers = [];
    if (!currentProfile.blockedUsers.includes(userId)) currentProfile.blockedUsers.push(userId);
    if (currentProfile.following.includes(userId)) await toggleFollow(userId, null);
    showToast(`🚫 Blocked @${userHandle}`);
    renderHomeFeed();
  } catch (e) { showToast('❌ Could not block user'); }
}

async function unblockUser(userId, userHandle) {
  if (!confirm(`Unblock @${userHandle}?`)) return;
  try {
    await updateDoc(doc(db, 'users', currentUser.uid), { blockedUsers: arrayRemove(userId) });
    if (currentProfile) currentProfile.blockedUsers = (currentProfile.blockedUsers || []).filter(id => id !== userId);
    showToast(`✅ Unblocked @${userHandle}`);
    closeBlockedUsersModal();
    if (viewingUserId === userId) openUserProfile(userId);
  } catch (e) { showToast('❌ Could not unblock user'); }
}

async function reportPost(post) {
  const reasons = ['Spam or misleading','Nudity or sexual content','Hate speech or symbols','Violence or dangerous','Harassment or bullying','False information','Other'];
  const reasonStr = prompt('🚨 Report this post\n\n' + reasons.map((r, i) => `${i + 1}. ${r}`).join('\n') + '\n\nType number (1-7):');
  if (!reasonStr) return;
  const idx = parseInt(reasonStr) - 1;
  if (idx < 0 || idx >= reasons.length) { showToast('❌ Invalid choice'); return; }
  try {
    await addDoc(collection(db, 'reports'), {
      type: 'post', postId: post.id, postUserId: post.userId,
      reportedBy: currentUser.uid, reportedByHandle: currentProfile?.user || '',
      reason: reasons[idx], status: 'pending', createdAt: serverTimestamp()
    });
    showToast('✅ Report submitted');
  } catch (e) { showToast('❌ Could not submit report'); }
}

async function reportUser(userId, userHandle) {
  const reasons = ['Fake account','Impersonation','Harassment','Spam','Inappropriate content','Other'];
  const reasonStr = prompt('🚨 Report @' + userHandle + '\n\n' + reasons.map((r, i) => `${i + 1}. ${r}`).join('\n') + '\n\nType number (1-6):');
  if (!reasonStr) return;
  const idx = parseInt(reasonStr) - 1;
  if (idx < 0 || idx >= reasons.length) { showToast('❌ Invalid choice'); return; }
  try {
    await addDoc(collection(db, 'reports'), {
      type: 'user', reportedUserId: userId, reportedUserHandle: userHandle,
      reportedBy: currentUser.uid, reportedByHandle: currentProfile?.user || '',
      reason: reasons[idx], status: 'pending', createdAt: serverTimestamp()
    });
    showToast('✅ Report submitted');
  } catch (e) { showToast('❌ Could not submit report'); }
}

async function openBlockedUsersModal() {
  const modal = document.getElementById('blockedUsersModal');
  const list = document.getElementById('blockedUsersList');
  modal.classList.add('show');
  list.innerHTML = '<div class="empty-msg">Loading...</div>';
  const blockedIds = currentProfile?.blockedUsers || [];
  if (blockedIds.length === 0) { list.innerHTML = '<div class="empty-msg">No blocked users</div>'; return; }
  try {
    const users = [];
    for (const uid of blockedIds) {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) users.push({ uid, ...snap.data() });
    }
    if (users.length === 0) { list.innerHTML = '<div class="empty-msg">No blocked users</div>'; return; }
    list.innerHTML = '';
    users.forEach(u => {
      const row = document.createElement('div');
      row.className = 'user-row';
      row.innerHTML = `<img src="${u.photo || defaultAvatar(u.name)}" alt=""><div class="meta"><b>${escapeHtml(u.name)}${verifiedBadgeHTML(u.verified)}</b><span>@${escapeHtml(u.user)}</span></div><button class="unblock" data-uid="${u.uid}" style="background:#ff4d4d;color:#fff;">Unblock</button>`;
      row.querySelector('button').addEventListener('click', async (e) => {
        e.stopPropagation();
        await unblockUser(u.uid, u.user);
        row.remove();
        if (!list.querySelector('.user-row')) list.innerHTML = '<div class="empty-msg">No blocked users</div>';
      });
      list.appendChild(row);
    });
  } catch (e) { list.innerHTML = '<div class="empty-msg">Could not load blocked users</div>'; }
}

function closeBlockedUsersModal() {
  document.getElementById('blockedUsersModal')?.classList.remove('show');
  updateBlockedUsersCount();
}

function updateBlockedUsersCount() {
  const count = (currentProfile?.blockedUsers || []).length;
  const el = document.getElementById('blockedUsersCount');
  if (el) el.textContent = count === 0 ? 'No users blocked' : count === 1 ? '1 user blocked' : `${count} users blocked`;
}

document.getElementById('closeBlockedUsers')?.addEventListener('click', closeBlockedUsersModal);
document.getElementById('blockedUsersModal')?.addEventListener('click', (e) => { if (e.target.id === 'blockedUsersModal') closeBlockedUsersModal(); });

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
  document.querySelector('.upload-tab[data-type="short"]')?.classList.add('active');

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

document.getElementById('closeUpload')?.addEventListener('click', () => uploadModal.classList.remove('show'));
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
    uploadPhotoPreview.src = URL.createObjectURL(file);
    uploadPhotoPreviewWrap.style.display = 'block';
    uploadPickerWrap.style.display = 'none';
    uploadSubmitBtn.disabled = false;
    return;
  }

  if (!file.type.startsWith('video/')) { uploadMsg.textContent = 'Choose a video.'; return; }
  if (file.size > 500 * 1024 * 1024) { uploadMsg.textContent = 'Max 500 MB.'; return; }

  const url = URL.createObjectURL(file);
  const tempVideo = document.createElement('video');
  tempVideo.preload = 'metadata';
  tempVideo.src = url;

  tempVideo.onloadedmetadata = () => {
    const duration = tempVideo.duration;
    if (!isFinite(duration) || duration <= 0) { uploadMsg.textContent = 'Could not read duration.'; return; }
    selectedFile = file;
    selectedFileDuration = duration;

    if (currentUploadType === 'short' && duration > 60.5) {
      uploadMsg.textContent = `⚠️ Switching to Long...`;
      setTimeout(() => {
        switchUploadType('long');
        uploadFileInput.value = '';
        selectedFile = null;
        uploadMsg.textContent = 'Select again as Long.';
      }, 1500);
      return;
    }
    if (currentUploadType === 'long' && duration <= 30.5) {
      uploadMsg.textContent = `⚠️ Switching to Short...`;
      setTimeout(() => {
        switchUploadType('short');
        uploadFileInput.value = '';
        selectedFile = null;
        uploadMsg.textContent = 'Select again as Short.';
      }, 1500);
      return;
    }

    uploadPreview.src = url;
    uploadPreviewWrap.style.display = 'block';
    uploadPickerWrap.style.display = 'none';
    uploadPreviewInfo.textContent = `${Math.round(duration)}s · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
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
      userVerified: currentProfile.verified || false,
      type: currentUploadType,
      url: result.secure_url,
      thumbnail: buildThumbnailUrl(result.secure_url, currentUploadType),
      caption: caption,
      duration: selectedFileDuration || 0,
      aspectRatio: currentUploadType === 'long' ? '16:9' : (currentUploadType === 'short' ? '9:16' : '1:1'),
      likes: [],
      commentsCount: 0,
      views: 0,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'posts'), postData);
    await updateDoc(doc(db, 'users', currentUser.uid), { videoCount: (currentProfile.videoCount || 0) + 1 });
    currentProfile.videoCount = (currentProfile.videoCount || 0) + 1;

    localStorage.removeItem('reelhub_feed_cache');
    uploadMsg.className = 'success-msg';
    uploadMsg.textContent = '✅ Uploaded!';

    setTimeout(() => {
      uploadModal.classList.remove('show');
      if (document.querySelector('.nav-item[data-page="profile"]')?.classList.contains('active')) renderProfile();
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
    const acc = CLOUDINARY_ACCOUNTS.videos;
    const url = `https://api.cloudinary.com/v1_1/${acc.cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', acc.preset);
    formData.append('api_key', acc.apiKey);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.timeout = 120000;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { const res = JSON.parse(xhr.responseText); if (!res.secure_url) { reject(new Error('No URL returned')); return; } resolve(res); }
        catch (e) { reject(new Error('Invalid response')); }
      } else {
        let errMsg = 'Upload failed';
        try { const d = JSON.parse(xhr.responseText); if (d.error?.message) errMsg = d.error.message; } catch (e) {}
        reject(new Error(errMsg));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));
    xhr.send(formData);
  });
}

function openPlayer(post) {
  playerTitle.textContent = post.caption || (post.type === 'photo' ? 'Photo' : 'Video');
  if (post.type === 'photo') playerContent.innerHTML = `<img src="${post.url}" alt="">`;
  else playerContent.innerHTML = `<video src="${post.url}" controls playsinline autoplay class="aspect-${post.type === 'long' ? '16-9' : '9-16'}" style="background:#000;"></video>`;
  playerModal.classList.add('show');
}

document.getElementById('closePlayer')?.addEventListener('click', () => { playerModal.classList.remove('show'); playerContent.innerHTML = ''; });
playerModal.addEventListener('click', (e) => { if (e.target === playerModal) { playerModal.classList.remove('show'); playerContent.innerHTML = ''; } });

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

document.getElementById('closeEdit')?.addEventListener('click', () => editModal.classList.remove('show'));
editModal.addEventListener('click', (e) => { if (e.target === editModal) editModal.classList.remove('show'); });

editPhotoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 500 * 1024) { editMsg.className = 'error-msg'; editMsg.textContent = 'Max 500 KB.'; return; }
  const base64 = await fileToBase64(file);
  selectedPhotoBase64 = base64;
  editPreviewImg.src = base64;
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
  if (newBio.length > 150) { editMsg.textContent = 'Bio max 150 characters.'; return; }

  saveProfileBtn.disabled = true;
  saveProfileBtn.textContent = 'Saving...';

  try {
    if (newUser !== currentProfile.user) {
      const q = query(collection(db, 'users'), where('user', '==', newUser));
      const snap = await getDocs(q);
      if (!snap.empty) { editMsg.textContent = 'Username already taken.'; saveProfileBtn.disabled = false; saveProfileBtn.textContent = 'Save Changes'; return; }
    }
    const updateData = { name: newName, user: newUser, bio: newBio };
    if (selectedPhotoBase64) updateData.photo = selectedPhotoBase64;
    await updateDoc(doc(db, 'users', currentUser.uid), updateData);
    Object.assign(currentProfile, updateData);
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
      const isFollowing = currentProfile.following.includes(u.uid);
      row.innerHTML = `
        <img src="${u.photo || defaultAvatar(u.name)}" alt="">
        <div class="meta"><b>${escapeHtml(u.name)}${verifiedBadgeHTML(u.verified)}${u.isPrivate ? ' 🔒' : ''}</b><span>@${escapeHtml(u.user)}</span></div>
        <button class="${isFollowing ? 'unfollow' : 'follow'}">${isFollowing ? 'Following' : 'Follow'}</button>
      `;
      row.querySelector('img').addEventListener('click', () => { listModal.classList.remove('show'); openUserProfile(u.uid); });
      row.querySelector('.meta').addEventListener('click', () => { listModal.classList.remove('show'); openUserProfile(u.uid); });
      row.querySelector('button').addEventListener('click', async (e) => { e.stopPropagation(); await toggleFollow(u.uid, e.target); });
      userList.appendChild(row);
    });
  });
}

document.getElementById('closeList')?.addEventListener('click', () => listModal.classList.remove('show'));
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

      const s = typeof getSettings === 'function' ? getSettings() : { notifFollows: true, pushNotif: true };
      if (s.pushNotif && s.notifFollows) {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: targetUid, type: 'follow', title: '👤 New Follower',
            message: `${currentProfile.name || 'Someone'} started following you`,
            fromUserId: currentUser.uid, read: false, createdAt: serverTimestamp()
          });
        } catch (e) {}
      }
    }
  } catch (err) { console.error('toggleFollow error:', err); showToast('Could not update follow.'); }
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
async function renderNotifications() {
  if (!currentUser) return;
  content.innerHTML = `<div class="notif-page"><div class="page-title" style="margin-bottom:16px;text-align:left;padding:0 4px;">Notifications</div><div id="notifList"><div class="empty-notif">Loading...</div></div></div>`;
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), limit(50));
    const snap = await getDocs(q);
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    notifications.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));
    paintNotifications(notifications);

    for (const n of notifications) {
      if (!n.read && n.type !== 'admin_invite') {
        try { await updateDoc(doc(db, 'notifications', n.id), { read: true }); } catch (e) {}
      }
    }
    updateNotifDot(0);
  } catch (e) {
    const el = document.getElementById('notifList');
    if (el) el.innerHTML = `<div class="empty-notif">Could not load notifications.</div>`;
  }
}

function paintNotifications(list) {
  const wrap = document.getElementById('notifList');
  if (!wrap) return;
  if (list.length === 0) {
    wrap.innerHTML = `<div class="empty-notif"><div>No notifications yet</div></div>`;
    return;
  }
  wrap.innerHTML = '';
  list.forEach(n => {
    const item = document.createElement('div');
    item.className = 'notif-item' + (n.read ? '' : ' unread');
    const time = n.createdAt?.toDate?.();
    const isInvite = n.type === 'admin_invite';
    const isHandled = n.handled === true;

    const inviteActions = (isInvite && !isHandled) ? `
      <div class="notif-actions">
        <button class="accept" data-invite-action="accept" data-invite-id="${n.inviteId || ''}" data-notif-id="${n.id}">✓ Accept</button>
        <button class="reject" data-invite-action="reject" data-invite-id="${n.inviteId || ''}" data-notif-id="${n.id}">✕ Decline</button>
      </div>` : (isInvite && isHandled ? `<div style="font-size:11px;color:#888;margin-top:8px;">✅ Handled</div>` : '');

    item.innerHTML = `
      <div class="notif-header">
        <div class="notif-title">${escapeHtml(n.title || 'Notification')}</div>
        <div class="notif-time">${time ? timeAgo(time) : 'now'}</div>
      </div>
      <div class="notif-message">${escapeHtml(n.message || '')}</div>
      ${inviteActions}
    `;

    if (isInvite && !isHandled) {
      item.querySelectorAll('[data-invite-action]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await handleAdminInviteAction(btn.dataset.inviteAction, btn.dataset.inviteId, btn.dataset.notifId, item);
        });
      });
    }
    wrap.appendChild(item);
  });
}

async function handleAdminInviteAction(action, inviteId, notifId, itemEl) {
  if (!currentUser || !currentUser.email) { showToast('❌ Please login first'); return; }
  if (!inviteId) { showToast('❌ Invalid invitation'); return; }
  try {
    const inviteRef = doc(db, 'admin_invites', inviteId);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists()) { showToast('❌ Invitation not found'); return; }
    const inviteData = inviteSnap.data();
    if (inviteData.status !== 'pending') {
      showToast('⚠️ Invitation already ' + inviteData.status);
      if (notifId) { try { await updateDoc(doc(db, 'notifications', notifId), { handled: true, read: true }); } catch (e) {} }
      return;
    }
    if (action === 'accept') {
      if (!confirm('🎉 Accept admin invitation?')) return;
      await updateDoc(inviteRef, { status: 'accepted', respondedAt: serverTimestamp() });
      const configRef = doc(db, 'admin_config', 'emails');
      const configSnap = await getDoc(configRef);
      const currentList = configSnap.exists() ? (configSnap.data().list || []) : [];
      const myEmail = currentUser.email.toLowerCase().trim();
      if (!currentList.map(e => e.toLowerCase()).includes(myEmail)) {
        currentList.push(myEmail);
        if (configSnap.exists()) await updateDoc(configRef, { list: currentList });
        else await setDoc(configRef, { list: currentList });
      }
      if (notifId) { try { await updateDoc(doc(db, 'notifications', notifId), { read: true, handled: true }); } catch (e) {} }
      if (itemEl) itemEl.innerHTML = `<div class="notif-header"><div class="notif-title">🎉 Admin Accepted</div><div class="notif-time">now</div></div><div class="notif-message">You are now a ReelHub Admin.</div>`;
      showToast('✅ You are now an admin!');
      setTimeout(() => showCongratsAnimation(currentProfile?.name || 'User', currentUser.email), 500);
    } else if (action === 'reject') {
      if (!confirm('Decline admin invitation?')) return;
      await updateDoc(inviteRef, { status: 'rejected', respondedAt: serverTimestamp() });
      if (notifId) { try { await updateDoc(doc(db, 'notifications', notifId), { read: true, handled: true }); } catch (e) {} }
      showToast('Invitation declined');
    }
  } catch (err) { console.error('Admin invite error:', err); showToast('❌ ' + (err.message || 'Failed')); }
}

/* ============================================================
   🔥 REAL-TIME NOTIFICATIONS WATCHER
   ============================================================ */
function startNotifWatcher() {
  stopNotifWatcher();

  let firstLoad = true;

  try {
    const nQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false),
      limit(50)
    );

    notifUnsub = onSnapshot(nQuery, (snap) => {
      const count = snap.size;
      updateNotifDot(count);

      // 🔊 Sound on new notification (skip first load)
      if (!firstLoad && count > 0) {
        playNotificationSound();
        if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
      }
      firstLoad = false;
    }, (err) => console.warn('Notif watcher:', err));
  } catch (e) { console.warn(e); }
}

function stopNotifWatcher() {
  if (notifIntervalId) { clearInterval(notifIntervalId); notifIntervalId = null; }
  if (notifUnsub) { try { notifUnsub(); } catch (e) {} notifUnsub = null; }
  updateNotifDot(0);
}

/* Legacy — keep for visibility handler */
async function checkUnreadNotifications() {
  if (!currentUser) return;
  try {
    const settings = typeof getSettings === 'function' ? getSettings() : { pushNotif: true };
    if (settings.pushNotif === false) { updateNotifDot(0); return; }
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), where('read', '==', false), limit(100));
    const snap = await getDocs(q);
    updateNotifDot(snap.size);
  } catch (e) {}
}

function updateNotifDot(count) {
  if (!notifDot) return;
  if (count > 0) {
    notifDot.style.display = 'block';
    notifDot.textContent = count > 20 ? '20+' : '';
  } else {
    notifDot.style.display = 'none';
  }
}

/* ============================================================
   SEARCH
   ============================================================ */
async function renderSearch() {
  content.innerHTML = `
    <div class="search-page">
      <div class="search-bar-wrap">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" class="search-bar" id="searchInput" placeholder="Search users...">
      </div>
      <div class="search-results" id="searchResults"><div class="search-empty">Start typing...</div></div>
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
      .filter(u => (u.name || '').toLowerCase().includes(term) || (u.user || '').toLowerCase().includes(term))
      .slice(0, 30);

    if (matches.length === 0) { results.innerHTML = `<div class="search-empty">No users found</div>`; return; }
    results.innerHTML = '';
    matches.forEach(u => {
      const row = document.createElement('div');
      row.className = 'search-user';
      const isFollowing = currentProfile?.following?.includes(u.id);
      row.innerHTML = `
        <img src="${u.photo || defaultAvatar(u.name)}" alt="">
        <div class="info"><b>${escapeHtml(u.name)}${verifiedBadgeHTML(u.verified)}${u.isPrivate ? ' 🔒' : ''}</b><span>@${escapeHtml(u.user)}</span></div>
        <button class="${isFollowing ? 'unfollow' : 'follow'}">${isFollowing ? 'Following' : 'Follow'}</button>
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
  catch (err) { showToast('❌ Could not share'); }
}

/* ============================================================
   HELPERS
   ============================================================ */
function showToast(message) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  toast.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1e1e28;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;z-index:10000;box-shadow:0 8px 20px rgba(0,0,0,0.6);border:1px solid #333;max-width:90%;`;
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
  const raw = (name || '?').trim().charAt(0).toUpperCase();
  const letter = raw.replace(/[<>&"']/g, '') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1e1e28"/><text x="50" y="50" font-size="44" font-family="sans-serif" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${letter}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function loadUsersByIds(uids) {
  const results = [];
  for (const uid of uids) {
    try { const snap = await getDoc(doc(db, 'users', uid)); if (snap.exists()) results.push(snap.data()); } catch (e) {}
  }
  return results;
}

function formatFileSize(bytes) {
  if (!bytes || bytes < 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
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
  const h = date.getHours(); const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${m < 10 ? '0' + m : m} ${ampm}`;
}

function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ============================================================
   DELETE ACCOUNT
   ============================================================ */
function openDeleteAccountModal() {
  document.querySelectorAll('.delete-modal-overlay').forEach(el => el.remove());
  const overlay = document.createElement('div');
  overlay.className = 'delete-modal-overlay show';
  overlay.id = 'deleteAccountModal';
  overlay.innerHTML = `
    <div class="delete-modal">
      <div class="delete-modal-icon">⚠️</div>
      <h3>Delete Your Account?</h3>
      <p>This action is <strong style="color:#ff4d4d;">permanent and cannot be undone</strong>.</p>
      <div class="warning-list"><ul>
        <li>Your profile will be removed</li>
        <li>All your posts and videos will be deleted</li>
        <li>Your stories will be deleted</li>
        <li>Your comments and replies will be removed</li>
        <li>Your messages in DMs and groups will be deleted</li>
        <li>You'll be removed from all groups</li>
        <li>You'll lose all followers</li>
      </ul></div>
      <div class="confirm-input-wrap"><label>Type <strong>DELETE</strong> to confirm:</label><input type="text" id="deleteConfirmInput" placeholder="Type DELETE" autocomplete="off"></div>
      <div class="confirm-input-wrap"><label>Enter your password:</label><input type="password" id="deletePasswordInput" placeholder="Your password" autocomplete="current-password"></div>
      <div class="delete-modal-actions">
        <button class="cancel-btn" id="cancelDeleteBtn">Cancel</button>
        <button class="confirm-btn" id="confirmDeleteBtn" disabled>Delete Account</button>
      </div>
      <div class="error-text" id="deleteErrorMsg"></div>
      <div class="delete-progress" id="deleteProgress"><div class="spinner-small"></div><div class="progress-text" id="deleteProgressText">Deleting your account...</div></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const confirmInput = document.getElementById('deleteConfirmInput');
  const passwordInput = document.getElementById('deletePasswordInput');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const cancelBtn = document.getElementById('cancelDeleteBtn');
  const errorMsg = document.getElementById('deleteErrorMsg');

  function checkInputs() {
    const confirmOk = confirmInput.value.trim() === 'DELETE';
    const passOk = passwordInput.value.length >= 6;
    confirmBtn.disabled = !(confirmOk && passOk);
  }
  confirmInput.addEventListener('input', checkInputs);
  passwordInput.addEventListener('input', checkInputs);
  cancelBtn.addEventListener('click', closeDeleteModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDeleteModal(); });

  confirmBtn.addEventListener('click', async () => {
    errorMsg.textContent = '';
    confirmBtn.disabled = true;
    cancelBtn.disabled = true;
    document.getElementById('deleteProgress').classList.add('show');
    document.getElementById('deleteProgressText').textContent = 'Verifying password...';
    try { await deleteUserAccount(passwordInput.value); }
    catch (err) {
      errorMsg.textContent = err.message || 'Failed to delete account.';
      confirmBtn.disabled = false;
      cancelBtn.disabled = false;
      document.getElementById('deleteProgress').classList.remove('show');
    }
  });
  setTimeout(() => confirmInput.focus(), 100);
}

function closeDeleteModal() {
  document.querySelectorAll('.delete-modal-overlay').forEach(el => el.remove());
}

async function deleteUserAccount(password) {
  if (!currentUser || !currentUser.email) throw new Error('You are not logged in.');
  const uid = currentUser.uid;
  const progressText = document.getElementById('deleteProgressText');

  try {
    progressText.textContent = 'Verifying your password...';
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);

    progressText.textContent = 'Deleting your posts...';
    try {
      const postsQ = query(collection(db, 'posts'), where('userId', '==', uid));
      const postsSnap = await getDocs(postsQ);
      for (const postDoc of postsSnap.docs) {
        try {
          const commentsQ = query(collection(db, 'comments'), where('postId', '==', postDoc.id));
          const commentsSnap = await getDocs(commentsQ);
          if (commentsSnap.size > 0) await batchDeleteDocs(commentsSnap.docs.map(d => d.ref));
        } catch (e) {}
      }
      if (postsSnap.size > 0) await batchDeleteDocs(postsSnap.docs.map(d => d.ref));
    } catch (e) {}

    progressText.textContent = 'Deleting your comments...';
    try {
      const myCommentsQ = query(collection(db, 'comments'), where('userId', '==', uid));
      const myCommentsSnap = await getDocs(myCommentsQ);
      const myCommentIds = myCommentsSnap.docs.map(d => d.id);
      for (const cid of myCommentIds) {
        try {
          const repliesQ = query(collection(db, 'comments'), where('parentId', '==', cid));
          const repliesSnap = await getDocs(repliesQ);
          if (repliesSnap.size > 0) await batchDeleteDocs(repliesSnap.docs.map(d => d.ref));
        } catch (e) {}
      }
      if (myCommentsSnap.size > 0) await batchDeleteDocs(myCommentsSnap.docs.map(d => d.ref));
    } catch (e) {}

    progressText.textContent = 'Deleting your stories...';
    try {
      const storiesQ = query(collection(db, 'stories'), where('userId', '==', uid));
      const storiesSnap = await getDocs(storiesQ);
      if (storiesSnap.size > 0) await batchDeleteDocs(storiesSnap.docs.map(d => d.ref));
    } catch (e) {}

    progressText.textContent = 'Deleting notifications...';
    try {
      const notifQ = query(collection(db, 'notifications'), where('userId', '==', uid));
      const notifSnap = await getDocs(notifQ);
      if (notifSnap.size > 0) await batchDeleteDocs(notifSnap.docs.map(d => d.ref));
    } catch (e) {}

    progressText.textContent = 'Deleting group messages...';
    try {
      const myGroupsQ = query(collection(db, 'groups'), where('members', 'array-contains', uid));
      const myGroupsSnap = await getDocs(myGroupsQ);
      for (const gDoc of myGroupsSnap.docs) {
        try {
          const msgsSnap = await getDocs(collection(db, 'groups', gDoc.id, 'messages'));
          const myMsgs = msgsSnap.docs.filter(d => d.data().from === uid);
          if (myMsgs.length > 0) await batchDeleteDocs(myMsgs.map(d => d.ref));
        } catch (e) {}
      }
    } catch (e) {}

    progressText.textContent = 'Leaving groups...';
    try {
      const groupsQ = query(collection(db, 'groups'), where('members', 'array-contains', uid));
      const groupsSnap = await getDocs(groupsQ);
      for (const groupDoc of groupsSnap.docs) {
        await updateDoc(groupDoc.ref, { members: arrayRemove(uid), admins: arrayRemove(uid), unreadBy: arrayRemove(uid) });
      }
    } catch (e) {}

    progressText.textContent = 'Deleting messages...';
    try {
      const chatsQ = query(collection(db, 'chats'), where('members', 'array-contains', uid));
      const chatsSnap = await getDocs(chatsQ);
      for (const chatDoc of chatsSnap.docs) {
        try {
          const msgsSnap = await getDocs(collection(db, 'chats', chatDoc.id, 'messages'));
          if (msgsSnap.size > 0) await batchDeleteDocs(msgsSnap.docs.map(d => d.ref));
        } catch (e) {}
        await deleteDoc(chatDoc.ref);
      }
    } catch (e) {}

    progressText.textContent = 'Updating followers...';
    try {
      const myProfileSnap = await getDoc(doc(db, 'users', uid));
      const myProfile = myProfileSnap.exists() ? myProfileSnap.data() : {};
      const affectedUids = [...new Set([...(myProfile.followers || []), ...(myProfile.following || [])])];
      const updates = [];
      for (const otherUid of affectedUids) {
        if (otherUid === uid) continue;
        updates.push(updateDoc(doc(db, 'users', otherUid), { followers: arrayRemove(uid), following: arrayRemove(uid) }).catch(() => {}));
      }
      if (updates.length > 0) await Promise.all(updates);
    } catch (e) {}

    progressText.textContent = 'Deleting profile...';
    try { await deleteDoc(doc(db, 'users', uid)); } catch (e) {}

    progressText.textContent = 'Finalizing...';
    await currentUser.delete();

    progressText.textContent = '✅ Account deleted successfully!';

    setTimeout(() => {
      stopNotifWatcher(); stopShortsObserver(); stopChatListWatcher();
      if (chatMessagesUnsub) { try { chatMessagesUnsub(); } catch (e) {} chatMessagesUnsub = null; }
      if (typingListenerUnsub) { try { typingListenerUnsub(); } catch (e) {} typingListenerUnsub = null; }

      currentUser = null; currentProfile = null;
      viewedPostsSession.clear();
      _readProcessed.clear();
      _deliveredProcessed.clear();
      _seenMsgIds.clear();
      _lastChatMsgTime.clear();
      _lastGroupMsgTime.clear();
      localStorage.removeItem('reelhub_feed_cache');
      closeDeleteModal();
      showToast('✅ Account deleted. Goodbye! 👋');
      setTimeout(() => {
        loginForm.reset(); signupForm.reset();
        document.getElementById('goLogin')?.click();
        showAuth();
      }, 800);
    }, 1200);
  } catch (err) {
    console.error('Delete account failed:', err);
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') throw new Error('Incorrect password.');
    else if (err.code === 'auth/requires-recent-login') throw new Error('Session expired. Logout and login again.');
    else if (err.code === 'auth/too-many-requests') throw new Error('Too many attempts. Try later.');
    else if (err.code === 'auth/network-request-failed') throw new Error('Network error.');
    else throw new Error(err.message || 'Failed to delete account.');
  }
}

async function batchDeleteDocs(refs) {
  for (let i = 0; i < refs.length; i += 450) {
    const chunk = refs.slice(i, i + 450);
    const batch = writeBatch(db);
    chunk.forEach(ref => batch.delete(ref));
    await batch.commit();
  }
}

/* ============================================================
   SETTINGS
   ============================================================ */
const DEFAULT_SETTINGS = {
  darkMode: true, autoPlay: true, dataSaver: false, videoQuality: 'auto', language: 'en',
  pushNotif: true, notifLikes: true, notifComments: true, notifFollows: true, notifMessages: true,
  privateAccount: false, readReceipts: true, showActivity: true, showOnline: true, allowTagging: true, allowStorySharing: true,
  autoDownload: false, vibration: true, soundEffects: true, fontSize: 'medium',
  autoplaySound: false, videoLoop: true, showCaptions: true, videoPreload: 'metadata',
  showViews: true, infiniteScroll: true, feedOrder: 'newest',
  doubleTapLike: true, confirmDelete: true, compactMode: false
};

function getSettings() {
  try { const saved = JSON.parse(localStorage.getItem('reelhubSettings') || '{}'); return { ...DEFAULT_SETTINGS, ...saved }; }
  catch (e) { return { ...DEFAULT_SETTINGS }; }
}

function saveSetting(key, value) {
  const current = getSettings(); current[key] = value;
  localStorage.setItem('reelhubSettings', JSON.stringify(current));
  applySetting(key, value);
}

function applySetting(key, value) {
  switch (key) {
    case 'darkMode': document.body.classList.toggle('light-mode', !value); break;
    case 'pushNotif': {
      const subIds = ['settingNotifLikes', 'settingNotifComments', 'settingNotifFollows', 'settingNotifMessages'];
      subIds.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = !value; });
      break;
    }
    case 'compactMode': document.body.classList.toggle('compact-mode', value); break;
    case 'fontSize': applyFontSize(value); break;
    case 'privateAccount': {
      const d = document.getElementById('privateAccountDesc');
      if (d) d.textContent = value ? 'Private — Sirf followers dekh sakte hain' : 'Public — Sab dekh sakte hain';
      break;
    }
    case 'dataSaver': {
      document.body.classList.toggle('data-saver', value);
      if (value) {
        const s = getSettings();
        if (s.autoPlay) { saveSetting('autoPlay', false); const el = document.getElementById('settingAutoPlay'); if (el) el.checked = false; }
      }
      break;
    }
    case 'videoQuality': {
      document.querySelectorAll('video').forEach(v => {
        if (value === 'low') v.setAttribute('data-quality', '360');
        else if (value === 'medium') v.setAttribute('data-quality', '720');
        else if (value === 'high') v.setAttribute('data-quality', '1080');
        else v.removeAttribute('data-quality');
      });
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
    settingDarkMode: s.darkMode, settingAutoPlay: s.autoPlay, settingDataSaver: s.dataSaver,
    settingPushNotif: s.pushNotif, settingNotifLikes: s.notifLikes, settingNotifComments: s.notifComments,
    settingNotifFollows: s.notifFollows, settingNotifMessages: s.notifMessages,
    settingPrivateAccount: s.privateAccount, settingReadReceipts: s.readReceipts, settingShowActivity: s.showActivity,
    settingShowOnline: s.showOnline, settingAllowTagging: s.allowTagging, settingAllowStorySharing: s.allowStorySharing,
    settingAutoDownload: s.autoDownload, settingVibration: s.vibration, settingSoundEffects: s.soundEffects,
    settingAutoplaySound: s.autoplaySound, settingVideoLoop: s.videoLoop, settingShowCaptions: s.showCaptions,
    settingShowViews: s.showViews, settingInfiniteScroll: s.infiniteScroll,
    settingDoubleTapLike: s.doubleTapLike, settingConfirmDelete: s.confirmDelete, settingCompactMode: s.compactMode
  };
  Object.keys(checkboxes).forEach(id => { const el = document.getElementById(id); if (el) el.checked = checkboxes[id]; });

  const selects = {
    settingVideoQuality: s.videoQuality, settingLanguage: s.language, settingFontSize: s.fontSize,
    settingVideoPreload: s.videoPreload, settingFeedOrder: s.feedOrder
  };
  Object.keys(selects).forEach(id => { const el = document.getElementById(id); if (el) el.value = selects[id]; });

  const d = document.getElementById('privateAccountDesc');
  if (d) d.textContent = s.privateAccount ? 'Private — Sirf followers dekh sakte hain' : 'Public — Sab dekh sakte hain';

  const subIds = ['settingNotifLikes', 'settingNotifComments', 'settingNotifFollows', 'settingNotifMessages'];
  subIds.forEach(id => { const el = document.getElementById(id); if (el) el.disabled = !s.pushNotif; });

  updateBlockedUsersCount();
}

function openSettingsModal() {
  loadSettingsToUI();
  document.getElementById('settingsModal')?.classList.add('show');
}

function initSettingsListeners() {
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => { setActiveNav(null); openSettingsModal(); });
  }
  document.getElementById('closeSettings')?.addEventListener('click', () => document.getElementById('settingsModal').classList.remove('show'));
  document.getElementById('settingsModal')?.addEventListener('click', (e) => { if (e.target.id === 'settingsModal') e.target.classList.remove('show'); });

  function wireToggle(id, key, onMsg, offMsg) {
    const el = document.getElementById(id); if (!el) return;
    el.addEventListener('change', (e) => { saveSetting(key, e.target.checked); if (onMsg || offMsg) showToast(e.target.checked ? onMsg : offMsg); });
  }
  function wireSelect(id, key, prefix) {
    const el = document.getElementById(id); if (!el) return;
    el.addEventListener('change', (e) => { saveSetting(key, e.target.value); showToast(prefix + e.target.value); });
  }

  wireToggle('settingDarkMode', 'darkMode', '🌙 Dark ON', '☀️ Light ON');
  wireToggle('settingAutoPlay', 'autoPlay', '▶️ Auto ON', '⏸️ Auto OFF');
  wireToggle('settingDataSaver', 'dataSaver', '📉 Saver ON', '📈 Saver OFF');
  wireSelect('settingVideoQuality', 'videoQuality', '🎬 Quality: ');
  wireSelect('settingLanguage', 'language', '🌐 Lang: ');
  wireToggle('settingPushNotif', 'pushNotif', '🔔 ON', '🔕 OFF');
  wireToggle('settingNotifLikes', 'notifLikes', '', '');
  wireToggle('settingNotifComments', 'notifComments', '', '');
  wireToggle('settingNotifFollows', 'notifFollows', '', '');
  wireToggle('settingNotifMessages', 'notifMessages', '', '');

  document.getElementById('settingPrivateAccount')?.addEventListener('change', async (e) => {
    const isPrivate = e.target.checked;
    saveSetting('privateAccount', isPrivate);
    showToast(isPrivate ? '🔐 Private ON' : '🌐 Public ON');
    try { await updateDoc(doc(db, 'users', currentUser.uid), { isPrivate: isPrivate }); if (currentProfile) currentProfile.isPrivate = isPrivate; }
    catch (err) { showToast('❌ Save failed'); }
  });

  wireToggle('settingReadReceipts', 'readReceipts', '✓✓ ON', '✓✓ OFF');
  wireToggle('settingShowActivity', 'showActivity', '🟢 ON', '⚫ OFF');
  wireToggle('settingShowOnline', 'showOnline', '📶 ON', '📴 OFF');
  wireToggle('settingAllowTagging', 'allowTagging', '🏷️ ON', '🚫 OFF');
  wireToggle('settingAllowStorySharing', 'allowStorySharing', '📤 ON', '📥 OFF');
  wireToggle('settingAutoDownload', 'autoDownload', '📥 ON', '📥 OFF');
  wireToggle('settingVibration', 'vibration', '📳 ON', '📳 OFF');
  wireToggle('settingSoundEffects', 'soundEffects', '🔊 ON', '🔇 OFF');
  wireSelect('settingFontSize', 'fontSize', '🔤 ');
  wireToggle('settingAutoplaySound', 'autoplaySound', '🔊 ON', '🔇 OFF');
  wireToggle('settingVideoLoop', 'videoLoop', '🔁 ON', '🔁 OFF');
  wireToggle('settingShowCaptions', 'showCaptions', '📝 ON', '📝 OFF');
  wireSelect('settingVideoPreload', 'videoPreload', '⚡ ');
  wireToggle('settingShowViews', 'showViews', '📊 ON', '📊 OFF');
  wireToggle('settingInfiniteScroll', 'infiniteScroll', '♾️ ON', '♾️ OFF');
  wireSelect('settingFeedOrder', 'feedOrder', '📋 ');
  wireToggle('settingDoubleTapLike', 'doubleTapLike', '👆 ON', '👆 OFF');
  wireToggle('settingConfirmDelete', 'confirmDelete', '🗑️ ON', '🗑️ OFF');
  wireToggle('settingCompactMode', 'compactMode', '📐 ON', '📐 OFF');

  document.getElementById('settingAboutBtn')?.addEventListener('click', () => showToast('📱 ReelHub v1.0.0'));
  document.getElementById('settingPrivacyBtn')?.addEventListener('click', () => window.open('privacy.html', '_blank'));
  document.getElementById('settingTermsBtn')?.addEventListener('click', () => window.open('terms.html', '_blank'));
  document.getElementById('deleteAccountBtn')?.addEventListener('click', () => openDeleteAccountModal());
  document.getElementById('settingBlockedUsersBtn')?.addEventListener('click', () => {
    document.getElementById('settingsModal')?.classList.remove('show');
    openBlockedUsersModal();
  });
}

initSettingsListeners();

(function applyInitialSettings() {
  const s = getSettings();
  applySetting('darkMode', s.darkMode);
  applySetting('fontSize', s.fontSize);
  applySetting('compactMode', s.compactMode);
  applySetting('privateAccount', s.privateAccount);
  applySetting('dataSaver', s.dataSaver);
  applySetting('videoQuality', s.videoQuality);
})();

window.handleDeleteClick = function(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  if (typeof openDeleteAccountModal === 'function') openDeleteAccountModal();
};

console.log('✅ app.js loaded — PART 4 with ALL Chat Bugs FIXED + Real-Time + Sound');