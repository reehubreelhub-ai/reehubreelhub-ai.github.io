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