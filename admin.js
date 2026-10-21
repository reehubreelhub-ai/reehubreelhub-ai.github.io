/* ============================================================
   ReelHub — app.js (COMPLETE FIXED + TIME-BASED BLUE TICK)
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
const db = getFirestore(firebaseApp);

const CLOUDINARY_ACCOUNTS = {
  videos: { cloudName: "s3eresx6", apiKey: "349223397331644", preset: "reelhub_video" },
  stories: { cloudName: "fepzqr9t", apiKey: "287332161532267", preset: "reelhub_story" }
};

/* ============================================================
   DOM SHORTCUTS
   ============================================================ */
function $id(id) { return document.getElementById(id); }

const authScreen = $id('auth'), loadingScreen = $id('loadingScreen'), appScreen = $id('app');
const loginForm = $id('loginForm'), signupForm = $id('signupForm'), loginMsg = $id('loginMsg'), signupMsg = $id('signupMsg');
const loginBtn = $id('loginBtn'), signupBtn = $id('signupBtn'), content = $id('content');

const editModal = $id('editModal'), editPreviewImg = $id('editPreviewImg'), editPhotoInput = $id('editPhoto');
const editNameInput = $id('editName'), editUserInput = $id('editUser'), editBioInput = $id('editBio');
const saveProfileBtn = $id('saveProfileBtn'), editMsg = $id('editMsg');

const listModal = $id('listModal'), listTitle = $id('listTitle'), userList = $id('userList');
const forgotModal = $id('forgotModal'), forgotEmail = $id('forgotEmail'), forgotMsg = $id('forgotMsg'), sendResetBtn = $id('sendResetBtn');

const notifBtn = $id('notifBtn'), notifDot = $id('notifDot'), searchBtn = $id('searchBtn'), chatsDot = $id('chatsDot'), settingsBtn = $id('settingsBtn');

const uploadModal = $id('uploadModal'), uploadFileInput = $id('uploadFileInput'), uploadCaption = $id('uploadCaption');
const uploadSubmitBtn = $id('uploadSubmitBtn'), uploadMsg = $id('uploadMsg'), uploadPreview = $id('uploadPreview');
const uploadPreviewWrap = $id('uploadPreviewWrap'), uploadPreviewInfo = $id('uploadPreviewInfo');
const uploadPhotoPreview = $id('uploadPhotoPreview'), uploadPhotoPreviewWrap = $id('uploadPhotoPreviewWrap');
const uploadPickerWrap = $id('uploadPickerWrap'), pickerTitle = $id('pickerTitle'), pickerSubtitle = $id('pickerSubtitle');
const pickerLabel = $id('pickerLabel'), uploadProgressWrap = $id('uploadProgressWrap'), uploadProgressBar = $id('uploadProgressBar'), uploadProgressText = $id('uploadProgressText');

const playerModal = $id('playerModal'), playerTitle = $id('playerTitle'), playerContent = $id('playerContent');

const commentsModal = $id('commentsModal'), commentsTitle = $id('commentsTitle'), commentsList = $id('commentsList');
const commentInput = $id('commentInput'), postCommentBtn = $id('postCommentBtn'), myAvatarForComment = $id('myAvatarForComment');
const replyIndicator = $id('replyIndicator'), replyIndicatorText = $id('replyIndicatorText'), cancelReplyBtn = $id('cancelReplyBtn');

const newChatModal = $id('newChatModal'), newChatSearch = $id('newChatSearch'), newChatResults = $id('newChatResults');
const chatWindowModal = $id('chatWindowModal'), chatHeaderAvatar = $id('chatHeaderAvatar'), chatHeaderName = $id('chatHeaderName');
const chatHeaderHandle = $id('chatHeaderHandle'), chatHeaderInfo = $id('chatHeaderInfo'), chatMessages = $id('chatMessages');
const chatMessageInput = $id('chatMessageInput'), sendTextBtn = $id('sendTextBtn'), micBtn = $id('micBtn');
const recordingIndicator = $id('recordingIndicator'), recordingTimer = $id('recordingTimer'), cancelRecordingBtn = $id('cancelRecordingBtn');

const storyUploadModal = $id('storyUploadModal'), storyFileInput = $id('storyFileInput'), storyPickerWrap = $id('storyPickerWrap');
const storyPickerTitle = $id('storyPickerTitle'), storyPickerSubtitle = $id('storyPickerSubtitle'), storyPickerLabel = $id('storyPickerLabel');
const storyPreviewWrap = $id('storyPreviewWrap'), storyPreviewImg = $id('storyPreviewImg'), storyVideoPreviewWrap = $id('storyVideoPreviewWrap');
const storyPreviewVideo = $id('storyPreviewVideo'), storyPreviewInfo = $id('storyPreviewInfo'), storySubmitBtn = $id('storySubmitBtn');
const storyUploadMsg = $id('storyUploadMsg'), storyProgressWrap = $id('storyProgressWrap'), storyProgressBar = $id('storyProgressBar'), storyProgressText = $id('storyProgressText');

const storyViewer = $id('storyViewer'), storyProgressBars = $id('storyProgressBars'), storyUserAvatar = $id('storyUserAvatar');
const storyUserName = $id('storyUserName'), storyTime = $id('storyTime'), storyDeleteBtn = $id('storyDeleteBtn');
const storyCloseBtn = $id('storyCloseBtn'), storyMedia = $id('storyMedia'), storyTapLeft = $id('storyTapLeft'), storyTapRight = $id('storyTapRight');

/* ============================================================
   STATE
   ============================================================ */
let currentUser = null, currentProfile = null;
let selectedPhotoBase64 = null, isLoggingIn = false, isSigningUp = false;
let notifIntervalId = null, viewingUserId = null;

let currentUploadType = 'short', selectedFile = null, selectedFileDuration = 0, shortsObserver = null;
let activeCommentPostId = null, activeReplyTo = null, allCommentsForPost = [];

let activeChatId = null, activeChatUser = null, chatMessagesUnsub = null, chatListInterval = null, pinnedMessage = null;
let activeGroupId = null, activeGroupData = null, selectedGroupMembers = [], currentGroupFile = null;

let mediaRecorder = null, audioChunks = [], voiceTimerInterval = null, voiceSeconds = 0, isRecording = false;
let currentPlayingAudio = null, currentPlayingBtn = null;

let currentStoryType = 'photo', currentStoryFile = null, currentStoryVideoDuration = 0;
let storiesByUser = [], currentStoryUserIndex = 0, currentStoryIndex = 0;
let storyProgressInterval = null, storyAutoAdvanceTimeout = null, currentStoryMediaEl = null;

let viewedPostsSession = new Set();
let shortsSoundEnabled = localStorage.getItem('shortsSound') === 'true';

let chatReplyTo = null, activeReactionMsg = null, longPressTimer = null, swipeStartX = 0, swipeCurrentRow = null;
let typingListenerUnsub = null, typingTimeout = null, isCurrentlyTyping = false;

const _readProcessed = new Set(), _deliveredProcessed = new Set();
const _seenDmMsgIds = new Set(), _seenGroupMsgIds = new Set();
const SET_CAP = 1000;

function _trimSet(set) {
  if (set.size <= SET_CAP) return;
  const toDelete = set.size - SET_CAP, iter = set.values();
  for (let i = 0; i < toDelete; i++) { const v = iter.next().value; if (v !== undefined) set.delete(v); }
}

let chatListUnsub = null, groupListUnsub = null, notifUnsub = null;
const _lastChatMsgTime = new Map(), _lastGroupMsgTime = new Map();
let authActionInProgress = false;
const LOADING_TIMEOUT_MS = 8000, TRANSITION_DELAY_MS = 1000;
let loadingTimeoutId = null;

function startLoadingTimeout() {
  clearTimeout(loadingTimeoutId);
  loadingTimeoutId = setTimeout(() => {
    const ls = $id('loadingScreen'), authEl = $id('auth');
    if (ls && ls.style.display !== 'none' && authEl && !authEl.classList.contains('show')) {
      ls.style.display = 'none'; authEl.classList.add('show'); authEl.style.display = 'block';
    }
  }, LOADING_TIMEOUT_MS);
}
if (loadingScreen) startLoadingTimeout();

function showAuth() {
  clearTimeout(loadingTimeoutId);
  if (loadingScreen) loadingScreen.style.display = 'none';
  if (authScreen) { authScreen.classList.add('show'); authScreen.style.display = 'block'; }
  if (appScreen) { appScreen.classList.remove('show'); appScreen.style.display = 'none'; }
  stopNotifWatcher(); stopShortsObserver(); stopChatListWatcher();
  if (chatMessagesUnsub) { try { chatMessagesUnsub(); } catch (e) {} chatMessagesUnsub = null; }
  if (typingListenerUnsub) { try { typingListenerUnsub(); } catch (e) {} typingListenerUnsub = null; }
  _readProcessed.clear(); _deliveredProcessed.clear(); _seenDmMsgIds.clear(); _seenGroupMsgIds.clear();
  _lastChatMsgTime.clear(); _lastGroupMsgTime.clear();
}

function showApp() {
  clearTimeout(loadingTimeoutId);
  if (loadingScreen) loadingScreen.style.display = 'none';
  if (authScreen) { authScreen.classList.remove('show'); authScreen.style.display = 'none'; }
  if (appScreen) { appScreen.classList.add('show'); appScreen.style.display = 'flex'; }
  setActiveNav('home'); renderPage('home'); startChatListWatcher();
}

function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
}

function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') Notification.requestPermission().catch(() => {});
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentUser) { checkUnreadNotifications(); checkChatsUnread(); }
});

window.addEventListener('error', (e) => console.error('❌ Global error:', e.error || e.message));
window.addEventListener('unhandledrejection', (e) => console.error('❌ Unhandled rejection:', e.reason));

document.querySelectorAll('.eye').forEach(eye => {
  eye.addEventListener('click', () => {
    const inp = $id(eye.dataset.target);
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  });
});

$id('goSignup')?.addEventListener('click', () => {
  if (loginForm) loginForm.style.display = 'none';
  if (signupForm) signupForm.style.display = 'block';
  if (loginMsg) loginMsg.textContent = ''; if (signupMsg) signupMsg.textContent = '';
  if ($id('goSignupSwitch')) $id('goSignupSwitch').style.display = 'block';
  if ($id('goSignupWrap')) $id('goSignupWrap').style.display = 'none';
});

$id('goLogin')?.addEventListener('click', () => {
  if (signupForm) signupForm.style.display = 'none';
  if (loginForm) loginForm.style.display = 'block';
  if (loginMsg) loginMsg.textContent = ''; if (signupMsg) signupMsg.textContent = '';
  if ($id('goSignupSwitch')) $id('goSignupSwitch').style.display = 'none';
  if ($id('goSignupWrap')) $id('goSignupWrap').style.display = 'block';
});

signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault(); e.stopPropagation();
  if (isSigningUp) return;
  const name = $id('signupName').value.trim(), user = $id('signupUser').value.trim().toLowerCase();
  const email = $id('signupEmail').value.trim().toLowerCase(), pass = $id('signupPass').value;
  signupMsg.className = 'error-msg'; signupMsg.textContent = '';
  if (!name || !user || !email || !pass) { signupMsg.textContent = 'Please fill all fields.'; return; }
  if (!/^[a-z0-9._]{3,20}$/.test(user)) { signupMsg.textContent = 'Username: 3-20 chars, a-z, 0-9, . or _'; return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { signupMsg.textContent = 'Please enter a valid email.'; return; }
  if (pass.length < 6) { signupMsg.textContent = 'Password min 6 characters.'; return; }
  isSigningUp = true; authActionInProgress = true; signupBtn.disabled = true; signupBtn.textContent = 'Creating...';
  let createdAuthUser = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid; createdAuthUser = cred.user;
    await new Promise(r => setTimeout(r, 300));
    const userSnap = await getDocs(query(collection(db, 'users'), where('user', '==', user)));
    if (!userSnap.empty) {
      try { await createdAuthUser.delete(); } catch (delErr) { try { await signOut(auth); } catch (e2) {} }
      signupMsg.textContent = 'Username already taken. Try another.'; return;
    }
    await setDoc(doc(db, 'users', uid), {
      uid, name, user, email, bio: '', photo: '', followers: [], following: [], videoCount: 0, savedPosts: [], blockedUsers: [], isPrivate: false, verified: false, verifiedUntil: null, banned: false, createdAt: serverTimestamp()
    });
    try { await sendEmailVerification(cred.user); } catch (e) {}
    currentUser = cred.user; await loadProfile(uid);
    signupMsg.className = 'success-msg'; signupMsg.textContent = 'Account created! Welcome 🎉'; signupForm.reset(); authActionInProgress = false;
    setTimeout(() => { showApp(); startNotifWatcher(); requestNotificationPermission(); }, TRANSITION_DELAY_MS);
  } catch (err) {
    if (createdAuthUser && !currentProfile) { try { await createdAuthUser.delete(); } catch (delErr) { try { await signOut(auth); } catch (e2) {} } }
    signupMsg.className = 'error-msg';
    if (err.code === 'auth/email-already-in-use') signupMsg.textContent = 'Email already registered.';
    else if (err.code === 'auth/invalid-email') signupMsg.textContent = 'Invalid email.';
    else if (err.code === 'auth/weak-password') signupMsg.textContent = 'Password too weak.';
    else if (err.code === 'auth/network-request-failed') signupMsg.textContent = 'Network error.';
    else signupMsg.textContent = err.message || 'Signup failed.';
  } finally {
    isSigningUp = false; authActionInProgress = false; signupBtn.disabled = false; signupBtn.textContent = 'Sign Up';
  }
});

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault(); e.stopPropagation();
  if (isLoggingIn) return;
  const email = $id('loginEmail').value.trim().toLowerCase(), pass = $id('loginPass').value;
  loginMsg.className = 'error-msg'; loginMsg.textContent = '';
  if (!email || !pass) { loginMsg.textContent = 'Please enter email and password.'; return; }
  isLoggingIn = true; authActionInProgress = true; loginBtn.disabled = true; loginBtn.textContent = 'Logging in...';
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (!result || !result.user) throw new Error('Login failed');
    currentUser = result.user; await loadProfile(result.user.uid);
    if (currentProfile?.banned) {
      try { await signOut(auth); } catch (e) {}
      currentUser = null; currentProfile = null; loginMsg.textContent = '🚫 Your account has been banned.'; return;
    }
    loginMsg.className = 'success-msg'; loginMsg.textContent = 'Welcome back! 🎉'; authActionInProgress = false;
    setTimeout(() => { loginMsg.textContent = ''; showApp(); startNotifWatcher(); requestNotificationPermission(); }, TRANSITION_DELAY_MS);
  } catch (err) {
    currentUser = null; currentProfile = null; loginMsg.className = 'error-msg';
    const code = err.code || '';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') loginMsg.textContent = 'Invalid email or password.';
    else if (code === 'auth/too-many-requests') loginMsg.textContent = 'Too many attempts. Try again later.';
    else if (code === 'auth/network-request-failed') loginMsg.textContent = 'Network error. Check your connection.';
    else loginMsg.textContent = err.message || 'Login failed.';
    if (auth.currentUser) { try { await signOut(auth); } catch (e) {} }
  } finally {
    isLoggingIn = false; authActionInProgress = false; loginBtn.disabled = false; loginBtn.textContent = 'Log In';
  }
});

$id('forgotLink')?.addEventListener('click', () => {
  forgotEmail.value = $id('loginEmail').value.trim(); forgotMsg.textContent = ''; forgotMsg.className = 'error-msg'; forgotModal.classList.add('show');
});
$id('closeForgot')?.addEventListener('click', () => forgotModal.classList.remove('show'));
forgotModal.addEventListener('click', (e) => { if (e.target === forgotModal) forgotModal.classList.remove('show'); });

sendResetBtn.addEventListener('click', async () => {
  const email = forgotEmail.value.trim().toLowerCase(); forgotMsg.className = 'error-msg'; forgotMsg.textContent = '';
  if (!email) { forgotMsg.textContent = 'Enter your email.'; return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { forgotMsg.textContent = 'Invalid email.'; return; }
  sendResetBtn.disabled = true; sendResetBtn.textContent = 'Sending...';
  try {
    await sendPasswordResetEmail(auth, email);
    forgotMsg.className = 'success-msg'; forgotMsg.textContent = 'Reset link sent! Check your inbox.';
    setTimeout(() => { forgotModal.classList.remove('show'); forgotEmail.value = ''; forgotMsg.textContent = ''; }, 3500);
  } catch (err) {
    forgotMsg.className = 'error-msg';
    if (err.code === 'auth/user-not-found') forgotMsg.textContent = 'No account with this email.';
    else if (err.code === 'auth/invalid-email') forgotMsg.textContent = 'Invalid email.';
    else forgotMsg.textContent = err.message || 'Failed to send reset link.';
  } finally {
    sendResetBtn.disabled = false; sendResetBtn.textContent = 'Send Reset Link';
  }
});

$id('logoutBtn')?.addEventListener('click', async () => {
  if (!confirm('Log out of ReelHub?')) return;
  stopNotifWatcher(); stopShortsObserver(); stopChatListWatcher();
  if (chatMessagesUnsub) { try { chatMessagesUnsub(); } catch (e) {} chatMessagesUnsub = null; }
  if (typingListenerUnsub) { try { typingListenerUnsub(); } catch (e) {} typingListenerUnsub = null; }
  try { closeChatWindow?.(); } catch (e) {}
  if (storyViewer) storyViewer.style.display = 'none';
  document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
  viewedPostsSession.clear(); viewingUserId = null; pinnedMessage = null;
  _readProcessed.clear(); _deliveredProcessed.clear(); _seenDmMsgIds.clear(); _seenGroupMsgIds.clear(); _lastChatMsgTime.clear(); _lastGroupMsgTime.clear();
  try { await signOut(auth); } catch (e) {}
  currentUser = null; currentProfile = null;
  loginForm?.reset(); signupForm?.reset(); $id('goLogin')?.click();
});

notifBtn?.addEventListener('click', () => { setActiveNav(null); renderPage('notifications'); });
searchBtn?.addEventListener('click', () => { setActiveNav(null); renderPage('search'); });

onAuthStateChanged(auth, async (user) => {
  if (authActionInProgress) return;
  if (user) {
    currentUser = user;
    try { await loadProfile(user.uid); } catch (e) {}
    if (currentProfile?.banned) { try { await signOut(auth); } catch (e) {} currentUser = null; currentProfile = null; return; }
    const appEl = $id('app');
    if (!appEl || !appEl.classList.contains('show')) { showApp(); startNotifWatcher(); requestNotificationPermission(); }
  } else {
    currentUser = null; currentProfile = null;
    stopNotifWatcher(); stopShortsObserver(); stopChatListWatcher();
    if (chatMessagesUnsub) { try { chatMessagesUnsub(); } catch (e) {} chatMessagesUnsub = null; }
    if (typingListenerUnsub) { try { typingListenerUnsub(); } catch (e) {} typingListenerUnsub = null; }
    _readProcessed.clear(); _deliveredProcessed.clear(); _seenDmMsgIds.clear(); _seenGroupMsgIds.clear(); _lastChatMsgTime.clear(); _lastGroupMsgTime.clear();
    loginForm?.reset(); signupForm?.reset(); $id('goLogin')?.click(); showAuth();
  }
});

async function loadProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      if (!Array.isArray(data.followers)) data.followers = [];
      if (!Array.isArray(data.following)) data.following = [];
      if (!Array.isArray(data.savedPosts)) data.savedPosts = [];
      if (!Array.isArray(data.blockedUsers)) data.blockedUsers = [];
      if (typeof data.videoCount !== 'number') data.videoCount = 0;
      if (typeof data.isPrivate !== 'boolean') data.isPrivate = false;
      if (typeof data.verified !== 'boolean') data.verified = false;
      if (typeof data.banned !== 'boolean') data.banned = false;
      currentProfile = data;
    } else { currentProfile = null; }
  } catch (e) { currentProfile = null; }
}

const pages = { home: 'Home Feed', shorts: 'Shorts', upload: 'Upload', messages: 'Chats', profile: 'Profile' };

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    viewingUserId = null; stopShortsObserver(); setActiveNav(page); renderPage(page);
  });
});

document.querySelector('.upload-btn')?.addEventListener('click', () => { setActiveNav(null); openUploadModal(); });

function renderPage(page) {
  if (page === 'profile') renderProfile();
  else if (page === 'home') renderHomeFeed();
  else if (page === 'shorts') renderShortsFeed();
  else if (page === 'messages') renderChatsPage();
  else if (page === 'notifications') renderNotifications();
  else if (page === 'search') renderSearch();
  else if (page === 'upload') { if (content) content.innerHTML = `<div class="page-placeholder"><div class="page-title">${pages[page]}</div></div>`; }
}

/* ============================================================
   HELPERS (TIME-BASED VERIFIED BADGE FIX)
   ============================================================ */
function isPostSaved(postId) {
  if (!currentProfile || !postId) return false;
  return (currentProfile.savedPosts || []).includes(postId);
}

function buildSaveButtonHTML(postId) {
  const isSaved = isPostSaved(postId);
  return `<button class="save-btn ${isSaved ? 'saved' : ''}" data-post="${postId}" title="Save"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>`;
}

// ✅ NAYA FUNCTION: Expiry Date Check ke saath
function verifiedBadgeHTML(isVerified, verifiedUntil, size = 'normal') {
  if (!isVerified) return '';
  
  // Agar expire date set hai, toh check karo
  if (verifiedUntil) {
    let expiryDate;
    if (verifiedUntil.toDate) expiryDate = verifiedUntil.toDate(); // Firestore Timestamp
    else expiryDate = new Date(verifiedUntil); // String ya normal Date
    
    // Agar aaj ki date expiry se badi hai (matlab expire ho gaya)
    if (new Date() > expiryDate) {
      return ''; // Tick hide kar do
    }
  }
  
  const sizeClass = size === 'large' ? 'large' : '';
  return `
    <span class="verified-badge ${sizeClass}" title="Verified">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
  `;
}

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '';
  const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
  if (m >= 60) { const h = Math.floor(m / 60), mm = m % 60; return `${h}:${mm < 10 ? '0' : ''}${mm}:${s < 10 ? '0' : ''}${s}`; }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function formatViews(count) {
  const n = parseInt(count) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
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
      currentProfile.savedPosts = isSaved ? (currentProfile.savedPosts || []).filter(id => id !== postId) : [...(currentProfile.savedPosts || []), postId];
    }
  } catch (err) { showToast('❌ Could not save'); }
}

async function renderSavedPosts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const savedIds = currentProfile?.savedPosts || [];
  if (savedIds.length === 0) { container.innerHTML = `<div class="saved-empty"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg><h3>No saved posts yet</h3><p>Tap 🔖 on any post to save it here</p></div>`; return; }
  container.innerHTML = `<div class="grid-empty">Loading saved...</div>`;
  try {
    const posts = [];
    for (const id of savedIds) {
      try { const snap = await getDoc(doc(db, 'posts', id)); if (snap.exists()) posts.push({ id: snap.id, ...snap.data() }); } catch (e) {}
    }
    if (posts.length === 0) { container.innerHTML = `<div class="saved-empty"><h3>No saved posts available</h3></div>`; return; }
    posts.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));
    container.innerHTML = ''; posts.forEach(post => container.appendChild(makeGridItem(post)));
  } catch (e) { container.innerHTML = `<div class="grid-empty">Could not load saved posts.</div>`; }
}

async function trackPostView(postId) {
  if (!currentUser || !postId || viewedPostsSession.has(postId)) return;
  viewedPostsSession.add(postId);
  try {
    const viewDocId = `${currentUser.uid}_${postId}`;
    const viewRef = doc(db, 'postViews', viewDocId);
    const viewSnap = await getDoc(viewRef);
    if (!viewSnap.exists()) {
      await setDoc(viewRef, { userId: currentUser.uid, postId: postId, viewedAt: serverTimestamp() });
      const postRef = doc(db, 'posts', postId), postSnap = await getDoc(postRef);
      if (postSnap.exists()) await updateDoc(postRef, { views: (postSnap.data().views || 0) + 1 });
    }
  } catch (e) {}
}

async function showStoryViewers(story) {
  if (!story) return;
  const viewers = story.viewers || [];
  document.getElementById('storyViewersSheet')?.remove();
  const sheet = document.createElement('div');
  sheet.id = 'storyViewersSheet'; sheet.className = 'story-viewers-sheet';
  sheet.innerHTML = `<div class="story-viewers-header"><h3><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> ${viewers.length} ${viewers.length === 1 ? 'view' : 'views'}</h3><button class="story-viewers-close">✕</button></div><div class="story-viewers-list" id="storyViewersList">${viewers.length === 0 ? '<div class="story-viewers-empty">No views yet</div>' : '<div class="story-viewers-empty">Loading...</div>'}</div>`;
  document.body.appendChild(sheet);
  sheet.querySelector('.story-viewers-close').addEventListener('click', () => sheet.remove());
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.remove(); });
  if (viewers.length > 0) await loadStoryViewersList(viewers, 'storyViewersList');
}

async function loadStoryViewersList(uids, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const users = [];
  for (const uid of uids) { try { const snap = await getDoc(doc(db, 'users', uid)); if (snap.exists()) users.push({ uid, ...snap.data() }); } catch (e) {} }
  if (users.length === 0) { container.innerHTML = `<div class="story-viewers-empty">Users not found</div>`; return; }
  container.innerHTML = '';
  users.forEach(u => {
    const row = document.createElement('div'); row.className = 'story-viewer-row';
    row.innerHTML = `<img src="${u.photo || defaultAvatar(u.name)}" alt=""><div class="info"><b>${escapeHtml(u.name || 'User')}${verifiedBadgeHTML(u.verified, u.verifiedUntil)}</b><span>@${escapeHtml(u.user || '')}</span></div>`;
    row.addEventListener('click', () => { document.getElementById('storyViewersSheet')?.remove(); openUserProfile(u.uid); });
    container.appendChild(row);
  });
}

function attachDoubleTapLike(element, post, onSingleTap) {
  if (!element || !post) return;
  let lastTap = 0, tapTimer = null; const TAP_DELAY = 300;
  element.addEventListener('click', (e) => {
    if (e.target.closest('button, a, .post-menu-btn, .msg-dots-btn, .yt-menu-btn, .shorts-shelf-more, .editor-btn, .editor-filter-btn, .editor-color-btn')) return;
    const s = typeof getSettings === 'function' ? getSettings() : { doubleTapLike: true };
    if (s.doubleTapLike === false) { if (onSingleTap) onSingleTap(e); return; }
    const now = Date.now();
    if (now - lastTap < TAP_DELAY) { clearTimeout(tapTimer); lastTap = 0; handleDoubleTapLikeUniversal(post, element, e); }
    else { lastTap = now; clearTimeout(tapTimer); tapTimer = setTimeout(() => { lastTap = 0; if (onSingleTap) onSingleTap(e); }, TAP_DELAY); }
  });
}

async function handleDoubleTapLikeUniversal(post, cardEl, event) {
  if (!currentUser || !post) return;
  const alreadyLiked = (post.likes || []).includes(currentUser.uid);
  showHeartAnimation(cardEl, event);
  if (navigator.vibrate) navigator.vibrate(40);
  if (alreadyLiked) return;
  const likeBtn = cardEl.querySelector('.like-btn'), countSpan = likeBtn?.querySelector('span');
  if (likeBtn && !likeBtn.classList.contains('liked')) {
    likeBtn.classList.add('liked');
    if (countSpan) countSpan.textContent = (parseInt(countSpan.textContent) || 0) + 1;
  }
  try {
    await updateDoc(doc(db, 'posts', post.id), { likes: arrayUnion(currentUser.uid) });
    if (!post.likes) post.likes = [];
    if (!post.likes.includes(currentUser.uid)) post.likes.push(currentUser.uid);
    const s = typeof getSettings === 'function' ? getSettings() : { notifLikes: true, pushNotif: true };
    if (post.userId && post.userId !== currentUser.uid && s.pushNotif && s.notifLikes) {
      try { await addDoc(collection(db, 'notifications'), { userId: post.userId, type: 'like', title: '❤️ New Like', message: `${currentProfile?.name || 'Someone'} liked your post`, postId: post.id, fromUserId: currentUser.uid, read: false, createdAt: serverTimestamp() }); } catch (e) {}
    }
  } catch (e) {
    if (likeBtn) {
      likeBtn.classList.remove('liked');
      if (countSpan) countSpan.textContent = Math.max(0, (parseInt(countSpan.textContent) || 0) - 1);
    }
    showToast('❌ Could not like');
  }
}

function showHeartAnimation(container, event) {
  if (!container) return;
  container.querySelectorAll('.heart-pop').forEach(h => h.remove());
  if (!container.style.position || container.style.position === 'static') container.style.position = 'relative';
  const heart = document.createElement('div');
  heart.className = 'heart-pop' + (container.classList.contains('grid-item') ? ' small' : '');
  heart.innerHTML = '❤️';
  if (event && event.clientX !== undefined && container.getBoundingClientRect) {
    const rect = container.getBoundingClientRect();
    heart.style.left = (event.clientX - rect.left) + 'px';
    heart.style.top = (event.clientY - rect.top) + 'px';
    heart.style.transform = 'translate(-50%, -50%) scale(0)';
  }
  container.appendChild(heart); setTimeout(() => heart.remove(), 900);
}

function saveFeedCache(posts) {
  try {
    const minimal = posts.slice(0, 15).map(p => ({ id: p.id, userId: p.userId, userName: p.userName, userHandle: p.userHandle, userPhoto: p.userPhoto, userVerified: p.userVerified, userVerifiedUntil: p.userVerifiedUntil, type: p.type, url: p.url, thumbnail: p.thumbnail, caption: p.caption, duration: p.duration, likes: p.likes || [], commentsCount: p.commentsCount || 0, views: p.views || 0, shares: p.shares || 0, createdAt: p.createdAt?.toDate?.()?.getTime?.() || Date.now() }));
    localStorage.setItem('reelhub_feed_cache', JSON.stringify(minimal)); localStorage.setItem('reelhub_feed_cache_time', Date.now().toString());
  } catch (e) {}
}

function loadFeedCache() {
  try {
    const cached = localStorage.getItem('reelhub_feed_cache'), time = parseInt(localStorage.getItem('reelhub_feed_cache_time') || '0');
    if (Date.now() - time > 30 * 60 * 1000) { localStorage.removeItem('reelhub_feed_cache'); return null; }
    if (!cached) return null;
    return JSON.parse(cached).map(p => ({ ...p, createdAt: { toDate: () => new Date(p.createdAt) } }));
  } catch (e) { return null; }
}

function buildThumbnailUrl(videoUrl, type) {
  if (!videoUrl) return '';
  try {
    if (type === 'photo') { if (videoUrl.includes('/image/upload/')) return videoUrl.replace('/image/upload/', '/image/upload/w_400,q_auto,f_auto/'); return videoUrl; }
    if (videoUrl.includes('/video/upload/')) {
      const parts = videoUrl.split('/video/upload/');
      if (parts.length === 2) {
        let publicId = parts[1].replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
        return `https://res.cloudinary.com/${CLOUDINARY_ACCOUNTS.videos.cloudName}/video/upload/so_auto,w_400,h_711,c_fill,q_auto/${publicId}.jpg`;
      }
    }
  } catch (e) {}
  return '';
}

/* ============================================================
   GAMES SHELF
   ============================================================ */
function buildGamesShelf() {
  const shelf = document.createElement('div'); shelf.className = 'games-shelf';
  const games = [
    { name: 'Breaker', icon: '🧱', file: 'breaker.html', c1: '#4ea8ff', c2: '#2a6fb8' },
    { name: 'Memory', icon: '🎴', file: 'memory.html', c1: '#fbbf24', c2: '#c9970d' },
    { name: 'Shooter', icon: '🚀', file: 'shooter.html', c1: '#a78bfa', c2: '#7c5dd6' },
    { name: 'Brick Style', icon: '🎯', file: 'brickstyle.html', c1: '#22d3ee', c2: '#0891b2' },
    { name: 'Bubble', icon: '🫧', file: 'bubble.html', c1: '#4ade80', c2: '#2a9d5c' },
    { name: 'Fruit Slice', icon: '🍉', file: 'fruitslice.html', c1: '#ef4444', c2: '#991b1b' },
    { name: '3D Car', icon: '🚗', file: 'car3d.html', c1: '#ff2e63', c2: '#b81e45' },
    { name: 'Blocks', icon: '🧩', file: 'blocks.html', c1: '#ff8a00', c2: '#c96800' },
    { name: 'Tile Trip', icon: '🀄', file: 'tiletrip.html', c1: '#f472b6', c2: '#c94a8a' },
    { name: 'Arrows', icon: '🎯', file: 'arrows.html', c1: '#4ea8ff', c2: '#2a6fb8' }
  ];
  shelf.innerHTML = `<div class="games-shelf-header"><div class="games-shelf-title"><svg viewBox="0 0 24 24" class="games-icon" width="22" height="22"><rect x="2" y="6" width="20" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/></svg> Games</div><button class="games-shelf-more" id="gamesShelfMore">View all <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button></div><div class="games-shelf-scroll" id="gamesShelfScroll"></div>`;
  const scrollWrap = shelf.querySelector('#gamesShelfScroll');
  games.forEach(game => {
    const item = document.createElement('div'); item.className = 'game-shelf-item'; item.style.setProperty('--c1', game.c1); item.style.setProperty('--c2', game.c2);
    item.innerHTML = `<div class="game-shelf-icon">${game.icon}</div><div class="game-shelf-name">${game.name}</div>`;
    item.addEventListener('click', () => { if (navigator.vibrate) navigator.vibrate(10); window.location.href = game.file; });
    scrollWrap.appendChild(item);
  });
  shelf.querySelector('#gamesShelfMore').addEventListener('click', () => { window.location.href = 'games.html'; });
  return shelf;
}

/* ============================================================
   HOME FEED
   ============================================================ */
async function renderHomeFeed() {
  content.innerHTML = `<div class="home-feed"><div class="stories-bar" id="storiesBar"><div class="story-item" id="addStoryBtn"><div class="story-ring add"><div class="plus-icon"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div></div><div class="story-name you">Your story</div></div></div><div id="feedContainer"></div></div>`;
  document.getElementById('addStoryBtn')?.addEventListener('click', openStoryUploadModal);
  await loadStoriesBar(); await loadHomeFeedPosts();
}

async function loadHomeFeedPosts() {
  const container = document.getElementById('feedContainer'); if (!container || !currentUser) { if (container) container.innerHTML = ''; return; }
  const cached = loadFeedCache();
  if (cached && cached.length > 0) { container.innerHTML = ''; renderFeedWithShortsShelf(cached, container); }
  else { container.innerHTML = `<div class="yt-skeleton"><div class="yt-skeleton-thumb"></div><div class="yt-skeleton-info"><div class="yt-skeleton-avatar"></div><div class="yt-skeleton-lines"><div class="yt-skeleton-line"></div><div class="yt-skeleton-line short"></div></div></div></div>`; }
  try {
    const snap = await getDocs(query(collection(db, 'posts'), limit(15)));
    if (snap.empty) { if (!cached || cached.length === 0) container.innerHTML = ''; return; }
    let posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const blocked = currentProfile?.blockedUsers || [];
    posts = posts.filter(p => !blocked.includes(p.userId));
    const settings = typeof getSettings === 'function' ? getSettings() : { feedOrder: 'newest' };
    if (settings.feedOrder === 'trending') posts.sort((a, b) => ((b.likes?.length || 0) + (b.views || 0)) - ((a.likes?.length || 0) + (a.views || 0)));
    else posts.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));
    saveFeedCache(posts);
    const cacheIds = (cached || []).map(p => p.id).join(','), newIds = posts.map(p => p.id).join(',');
    if (cacheIds !== newIds) { container.innerHTML = ''; renderFeedWithShortsShelf(posts, container); }
  } catch (e) { if (!cached || cached.length === 0) container.innerHTML = ''; }
}

function renderFeedWithShortsShelf(posts, container) {
  const shorts = posts.filter(p => p.type === 'short'), regular = posts.filter(p => p.type !== 'short');
  container.innerHTML = ''; container.appendChild(buildGamesShelf());
  if (shorts.length > 0) {
    const shelf = document.createElement('div'); shelf.className = 'shorts-shelf';
    shelf.innerHTML = `<div class="shorts-shelf-header"><div class="shorts-shelf-title"><svg viewBox="0 0 24 24" class="shorts-icon"><path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z"/></svg> Shorts</div><button class="shorts-shelf-more" id="shortsShelfMore">View all <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button></div><div class="shorts-shelf-scroll" id="shortsShelfScroll"></div>`;
    container.appendChild(shelf);
    const scrollWrap = shelf.querySelector('#shortsShelfScroll'); shorts.forEach(short => scrollWrap.appendChild(makeShortShelfItem(short)));
    shelf.querySelector('#shortsShelfMore')?.addEventListener('click', () => { setActiveNav('shorts'); renderPage('shorts'); });
  }
  if (regular.length > 0) { regular.forEach(post => container.appendChild(makeFeedPost(post))); setupFeedAutoplay(); }
  if (posts.length === 0) container.innerHTML = `<div class="feed-empty"><svg viewBox="0 0 24 24" style="width:64px;height:64px;stroke:#333;fill:none;stroke-width:1.5;margin-bottom:16px;"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg><h3>No posts yet</h3><p>Be the first to upload!</p></div>`;
}

function makeShortShelfItem(short) {
  const item = document.createElement('div'); item.className = 'shorts-shelf-item'; item.dataset.postId = short.id;
  item.innerHTML = `<div class="shorts-shelf-thumb"><img src="${short.thumbnail || short.url}" alt="" loading="lazy"><div class="shorts-shelf-play"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="#fff"/></svg></div></div><div class="shorts-shelf-title-text">${escapeHtml(short.caption || 'Short video')}</div><div class="shorts-shelf-views">${formatViews(short.views || 0)} views</div>`;
  const img = item.querySelector('img');
  if (img) {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const thumbWrap = item.querySelector('.shorts-shelf-thumb');
      if (thumbWrap && !thumbWrap.querySelector('video')) {
        const vid = document.createElement('video'); vid.src = short.url; vid.muted = true; vid.playsInline = true; vid.preload = 'metadata';
        vid.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;position:absolute;top:0;left:0;';
        thumbWrap.insertBefore(vid, thumbWrap.firstChild);
        vid.addEventListener('loadedmetadata', () => { try { vid.currentTime = 1; } catch (e) {} });
        vid.addEventListener('error', () => { vid.remove(); thumbWrap.classList.add('no-thumb'); }, { once: true });
      }
    }, { once: true });
  }
  item.addEventListener('click', () => { setActiveNav('shorts'); renderShortsFeed(); }); return item;
}

function makeFeedPost(post) {
  const card = document.createElement('div'); card.className = 'yt-card'; card.dataset.postId = post.id;
  card.innerHTML = `<div class="yt-thumb" data-action="play"><img src="${post.thumbnail || (post.type === 'photo' ? post.url : '')}" alt="" loading="lazy">${post.duration ? `<div class="yt-duration">${formatDuration(post.duration)}</div>` : ''}<div class="yt-play-overlay"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="#fff"/></svg></div></div><div class="yt-info"><img class="yt-avatar" src="${post.userPhoto || defaultAvatar(post.userName)}" alt="" data-action="profile"><div class="yt-meta"><div class="yt-title">${escapeHtml(post.caption || 'Untitled')}</div><div class="yt-channel">${escapeHtml(post.userName || 'User')}${verifiedBadgeHTML(post.userVerified, post.userVerifiedUntil)}</div><div class="yt-stats">${formatViews(post.views || 0)} views · ${post.createdAt?.toDate?.() ? timeAgoShort(post.createdAt.toDate()) : 'now'}</div></div><button class="yt-menu-btn" data-action="menu"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg></button></div>`;
  card.querySelector('[data-action="play"]').addEventListener('click', () => openPlayer(post));
  card.querySelector('[data-action="profile"]').addEventListener('click', (e) => { e.stopPropagation(); openUserProfile(post.userId); });
  card.querySelector('.yt-menu-btn').addEventListener('click', async (e) => { e.stopPropagation(); await showPostMenu(e.currentTarget, post); });
  attachDoubleTapLike(card.querySelector('.yt-thumb'), post, null); trackPostView(post.id); return card;
}

function openPostPlayer(post) { openPlayer(post); }

function openPlayer(post) {
  playerTitle.textContent = post.caption || (post.type === 'photo' ? 'Photo' : 'Video');
  if (post.type === 'photo') playerContent.innerHTML = `<img src="${post.url}" alt="">`;
  else playerContent.innerHTML = `<video src="${post.url}" controls playsinline autoplay class="aspect-${post.type === 'long' ? '16-9' : '9-16'}" style="background:#000;width:100%;max-height:75vh;"></video>`;
  playerModal.classList.add('show');
  const playerInner = playerContent.firstElementChild;
  if (playerInner && post.type !== 'photo') attachDoubleTapLike(playerInner, post, null);
}

async function showPostMenu(anchorEl, post) {
  document.querySelectorAll('.post-menu-dropdown').forEach(el => el.remove());
  const menu = document.createElement('div'); menu.className = 'post-menu-dropdown';
  const isOwner = post.userId === currentUser.uid, isBlocked = (currentProfile?.blockedUsers || []).includes(post.userId);
  menu.innerHTML = isOwner ? `<button data-action="delete" class="danger"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>Delete Post</button>` : `<button data-action="report"><svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>Report Post</button><button data-action="${isBlocked ? 'unblock' : 'block'}" class="${isBlocked ? '' : 'danger'}"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>${isBlocked ? 'Unblock' : 'Block'} @${escapeHtml(post.userHandle || 'user')}</button>`;
  document.body.appendChild(menu);
  const rect = anchorEl.getBoundingClientRect(), menuRect = menu.getBoundingClientRect();
  let top = rect.bottom + 5, left = rect.right - menuRect.width;
  if (left < 10) left = 10; if (left + menuRect.width > window.innerWidth - 10) left = window.innerWidth - menuRect.width - 10;
  if (top + menuRect.height > window.innerHeight - 10) top = rect.top - menuRect.height - 5;
  menu.style.top = top + 'px'; menu.style.left = left + 'px';
  menu.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); const action = btn.dataset.action; menu.remove();
      if (action === 'report') await reportPost(post);
      else if (action === 'block') await blockUser(post.userId, post.userHandle);
      else if (action === 'unblock') await unblockUser(post.userId, post.userHandle);
      else if (action === 'delete') await deletePost(post.id);
    });
  });
  setTimeout(() => {
    const closeMenu = (ev) => { if (!menu.contains(ev.target) && ev.target !== anchorEl) { menu.remove(); document.removeEventListener('click', closeMenu); document.removeEventListener('touchstart', closeMenu); } };
    document.addEventListener('click', closeMenu); document.addEventListener('touchstart', closeMenu);
  }, 100);
}

async function deletePost(postId) {
  if (typeof getSettings === 'function' && getSettings().confirmDelete && !confirm('Delete this post permanently?')) return;
  try {
    await deleteDoc(doc(db, 'posts', postId));
    await updateDoc(doc(db, 'users', currentUser.uid), { videoCount: Math.max(0, (currentProfile.videoCount || 1) - 1) });
    currentProfile.videoCount = Math.max(0, (currentProfile.videoCount || 1) - 1);
    localStorage.removeItem('reelhub_feed_cache'); localStorage.removeItem('reelhub_feed_cache_time');
    showToast('🗑️ Post deleted'); renderHomeFeed();
  } catch (e) { showToast('❌ Could not delete'); }
}

function setupFeedAutoplay() {
  const settings = typeof getSettings === 'function' ? getSettings() : { autoPlay: true };
  stopFeedAutoplay(); if (!settings.autoPlay || settings.dataSaver) return;
  const videos = document.querySelectorAll('.yt-card video, .feed-post-media video'); if (videos.length === 0) return;
  feedAutoplayObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) { video.muted = !settings.autoplaySound; video.loop = settings.videoLoop !== false; video.play().catch(() => {}); }
      else video.pause();
    });
  }, { threshold: [0, 0.6, 1] });
  videos.forEach(v => feedAutoplayObserver.observe(v));
}
function stopFeedAutoplay() { if (feedAutoplayObserver) { feedAutoplayObserver.disconnect(); feedAutoplayObserver = null; } document.querySelectorAll('.yt-card video, .feed-post-media video').forEach(v => { try { v.pause(); } catch (e) {} }); }

async function loadStoriesBar() {
  const bar = document.getElementById('storiesBar'); if (!bar) return;
  bar.querySelectorAll('.story-item:not(#addStoryBtn)').forEach(el => el.remove());
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const snap = await getDocs(query(collection(db, 'stories'), limit(100)));
    const allStories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const blocked = currentProfile?.blockedUsers || [];
    const validStories = allStories.filter(s => { const t = s.createdAt?.toDate?.(); return t && t.getTime() > cutoffTime.getTime() && !blocked.includes(s.userId); });
    if (validStories.length === 0) return;
    const grouped = {};
    validStories.forEach(s => {
      if (!grouped[s.userId]) grouped[s.userId] = { userId: s.userId, userName: s.userName, userHandle: s.userHandle, userPhoto: s.userPhoto, userVerified: s.userVerified, userVerifiedUntil: s.userVerifiedUntil, stories: [] };
      grouped[s.userId].stories.push(s);
    });
    Object.values(grouped).forEach(u => u.stories.sort((a, b) => (a.createdAt?.toDate?.()?.getTime() || 0) - (b.createdAt?.toDate?.()?.getTime() || 0)));
    const userArray = Object.values(grouped);
    userArray.sort((a, b) => { if (a.userId === currentUser.uid) return -1; if (b.userId === currentUser.uid) return 1; const ta = a.stories[a.stories.length - 1].createdAt?.toDate?.()?.getTime() || 0; const tb = b.stories[b.stories.length - 1].createdAt?.toDate?.()?.getTime() || 0; return tb - ta; });
    storiesByUser = userArray;
    userArray.forEach(userGroup => {
      const item = document.createElement('div'); item.className = 'story-item';
      const allViewed = userGroup.stories.every(s => (s.viewers || []).includes(currentUser.uid));
      item.innerHTML = `<div class="story-ring ${allViewed ? 'viewed' : ''}"><img src="${userGroup.userPhoto || defaultAvatar(userGroup.userName)}" alt=""></div><div class="story-name ${userGroup.userId === currentUser.uid ? 'you' : ''}">${userGroup.userId === currentUser.uid ? 'Your story' : escapeHtml(userGroup.userName)}</div>`;
      item.addEventListener('click', () => openStoryViewer(userGroup.userId)); bar.appendChild(item);
    });
  } catch (e) {}
}

/* ============================================================
   STORY UPLOAD
   ============================================================ */
let storyPreviewBlobUrl = null;
function openStoryUploadModal() {
  currentStoryType = 'photo'; currentStoryFile = null; currentStoryVideoDuration = 0; storyFileInput.value = '';
  if (storyPreviewBlobUrl) { try { URL.revokeObjectURL(storyPreviewBlobUrl); } catch (e) {} storyPreviewBlobUrl = null; }
  storyPreviewImg.src = ''; storyPreviewVideo.src = ''; storyPreviewWrap.style.display = 'none'; storyVideoPreviewWrap.style.display = 'none'; storyPickerWrap.style.display = 'flex'; storySubmitBtn.disabled = true; storyUploadMsg.textContent = ''; storyProgressWrap.style.display = 'none'; storyProgressBar.style.width = '0%'; storyProgressText.textContent = '0%';
  document.querySelectorAll('.story-upload-tab').forEach(t => t.classList.remove('active')); document.querySelector('.story-upload-tab[data-type="photo"]')?.classList.add('active');
  updateStoryPickerText(); storyUploadModal.classList.add('show');
}
function updateStoryPickerText() {
  if (currentStoryType === 'photo') { storyPickerTitle.textContent = 'Choose a photo'; storyPickerSubtitle.textContent = 'JPG / PNG · Max 5 MB'; storyPickerLabel.textContent = 'Select photo'; storyFileInput.accept = 'image/*'; }
  else { storyPickerTitle.textContent = 'Choose a video'; storyPickerSubtitle.textContent = 'Max 15 sec · Up to 20 MB'; storyPickerLabel.textContent = 'Select video'; storyFileInput.accept = 'video/*'; }
}
document.getElementById('closeStoryUpload')?.addEventListener('click', () => { storyUploadModal.classList.remove('show'); if (storyPreviewBlobUrl) { try { URL.revokeObjectURL(storyPreviewBlobUrl); } catch (e) {} storyPreviewBlobUrl = null; } });
storyUploadModal.addEventListener('click', (e) => { if (e.target === storyUploadModal) { storyUploadModal.classList.remove('show'); if (storyPreviewBlobUrl) { try { URL.revokeObjectURL(storyPreviewBlobUrl); } catch (e) {} storyPreviewBlobUrl = null; } } });
document.querySelectorAll('.story-upload-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.story-upload-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); currentStoryType = tab.dataset.type; currentStoryFile = null; currentStoryVideoDuration = 0; storyFileInput.value = ''; storyPreviewImg.src = ''; storyPreviewVideo.src = ''; storyPreviewWrap.style.display = 'none'; storyVideoPreviewWrap.style.display = 'none'; storyPickerWrap.style.display = 'flex'; storySubmitBtn.disabled = true; storyUploadMsg.textContent = '';
    if (storyPreviewBlobUrl) { try { URL.revokeObjectURL(storyPreviewBlobUrl); } catch (e) {} storyPreviewBlobUrl = null; } updateStoryPickerText();
  });
});
storyFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]; if (!file) return; storyUploadMsg.className = 'error-msg'; storyUploadMsg.textContent = '';
  if (currentStoryType === 'photo') {
    if (!file.type.startsWith('image/')) { storyUploadMsg.textContent = 'Choose image file.'; return; }
    if (file.size > 5 * 1024 * 1024) { storyUploadMsg.textContent = 'Max 5 MB.'; return; }
    currentStoryFile = file; const url = URL.createObjectURL(file); storyPreviewBlobUrl = url; storyPreviewImg.src = url; storyPreviewWrap.style.display = 'block'; storyPickerWrap.style.display = 'none'; storySubmitBtn.disabled = false; return;
  }
  if (!file.type.startsWith('video/')) { storyUploadMsg.textContent = 'Choose video file.'; return; }
  if (file.size > 20 * 1024 * 1024) { storyUploadMsg.textContent = 'Max 20 MB.'; return; }
  const url = URL.createObjectURL(file); const tempVideo = document.createElement('video'); tempVideo.preload = 'metadata'; tempVideo.src = url;
  tempVideo.onloadedmetadata = () => {
    const duration = tempVideo.duration;
    if (!isFinite(duration) || duration <= 0) { storyUploadMsg.textContent = 'Could not read duration.'; URL.revokeObjectURL(url); return; }
    if (duration > 15.5) { storyUploadMsg.textContent = `Max 15 sec. Yours ${Math.round(duration)}s.`; URL.revokeObjectURL(url); return; }
    currentStoryFile = file; currentStoryVideoDuration = duration; storyPreviewBlobUrl = url; storyPreviewVideo.src = url; storyVideoPreviewWrap.style.display = 'block'; storyPreviewInfo.textContent = `${Math.round(duration)}s · ${(file.size / 1024 / 1024).toFixed(2)} MB`; storyPickerWrap.style.display = 'none'; storySubmitBtn.disabled = false;
  };
  tempVideo.onerror = () => { storyUploadMsg.textContent = 'Could not load video.'; URL.revokeObjectURL(url); };
});
storySubmitBtn.addEventListener('click', async () => {
  if (!currentUser || !currentProfile) { storyUploadMsg.textContent = 'Login required.'; return; }
  if (!currentStoryFile) { storyUploadMsg.textContent = 'Select a file.'; return; }
  storySubmitBtn.disabled = true; storySubmitBtn.textContent = 'Uploading...'; storyUploadMsg.textContent = ''; storyProgressWrap.style.display = 'block';
  try {
    const result = await uploadToCloudinaryStory(currentStoryFile, (percent) => { storyProgressBar.style.width = percent + '%'; storyProgressText.textContent = percent + '%'; });
    const storyData = { userId: currentUser.uid, userName: currentProfile.name, userHandle: currentProfile.user, userPhoto: currentProfile.photo || '', userVerified: currentProfile.verified || false, userVerifiedUntil: currentProfile.verifiedUntil || null, type: currentStoryType, url: result.secure_url, thumbnail: currentStoryType === 'video' ? buildThumbnailUrl(result.secure_url, 'video') : result.secure_url, duration: currentStoryType === 'photo' ? 5 : currentStoryVideoDuration, viewers: [], createdAt: serverTimestamp() };
    await addDoc(collection(db, 'stories'), storyData);
    storyUploadMsg.className = 'success-msg'; storyUploadMsg.textContent = '✅ Story posted!';
    setTimeout(() => { storyUploadModal.classList.remove('show'); if (storyPreviewBlobUrl) { try { URL.revokeObjectURL(storyPreviewBlobUrl); } catch (e) {} storyPreviewBlobUrl = null; } if (document.querySelector('.nav-item[data-page="home"]')?.classList.contains('active')) renderHomeFeed(); }, 1200);
  } catch (err) { storyUploadMsg.className = 'error-msg'; storyUploadMsg.textContent = err.message || 'Upload failed.'; storySubmitBtn.disabled = false; storySubmitBtn.textContent = 'Share to Story'; }
});

function uploadToCloudinaryStory(file, onProgress) {
  return new Promise((resolve, reject) => {
    const resourceType = currentStoryType === 'photo' ? 'image' : 'video', acc = CLOUDINARY_ACCOUNTS.stories;
    const url = `https://api.cloudinary.com/v1_1/${acc.cloudName}/${resourceType}/upload`;
    const formData = new FormData(); formData.append('file', file); formData.append('upload_preset', acc.preset); formData.append('api_key', acc.apiKey);
    const xhr = new XMLHttpRequest(); xhr.open('POST', url, true); xhr.timeout = 120000;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { try { const res = JSON.parse(xhr.responseText); if (!res.secure_url) { reject(new Error('No URL returned')); return; } resolve(res); } catch (e) { reject(new Error('Invalid response')); } } else { let errMsg = 'Upload failed'; try { const errData = JSON.parse(xhr.responseText); if (errData.error?.message) errMsg = errData.error.message; } catch (e) { errMsg = 'HTTP ' + xhr.status; } reject(new Error(errMsg)); } };
    xhr.onerror = () => reject(new Error('Network error')); xhr.ontimeout = () => reject(new Error('Timeout')); xhr.send(formData);
  });
}

function uploadToCloudinaryGroupFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    let resourceType = 'raw'; if (file.type.startsWith('image/')) resourceType = 'image'; else if (file.type.startsWith('video/')) resourceType = 'video';
    const acc = CLOUDINARY_ACCOUNTS.stories, url = `https://api.cloudinary.com/v1_1/${acc.cloudName}/${resourceType}/upload`;
    const formData = new FormData(); formData.append('file', file); formData.append('upload_preset', acc.preset); formData.append('api_key', acc.apiKey);
    const xhr = new XMLHttpRequest(); xhr.open('POST', url, true); xhr.timeout = 180000;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { try { const res = JSON.parse(xhr.responseText); if (!res.secure_url) { reject(new Error('No URL')); return; } resolve(res); } catch (e) { reject(new Error('Invalid')); } } else { let errMsg = 'Upload failed'; try { const d = JSON.parse(xhr.responseText); if (d.error?.message) errMsg = d.error.message; } catch (e) {} reject(new Error(errMsg)); } };
    xhr.onerror = () => reject(new Error('Network error')); xhr.ontimeout = () => reject(new Error('Timeout')); xhr.send(formData);
  });
}

function uploadToCloudinaryVoice(file, onProgress) {
  return new Promise((resolve, reject) => {
    const acc = CLOUDINARY_ACCOUNTS.stories, url = `https://api.cloudinary.com/v1_1/${acc.cloudName}/video/upload`;
    const formData = new FormData(); formData.append('file', file); formData.append('upload_preset', acc.preset); formData.append('api_key', acc.apiKey);
    const xhr = new XMLHttpRequest(); xhr.open('POST', url, true); xhr.timeout = 180000;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { try { const res = JSON.parse(xhr.responseText); if (!res.secure_url) { reject(new Error('No URL')); return; } resolve(res); } catch (e) { reject(new Error('Invalid')); } } else { let errMsg = 'Upload failed'; try { const d = JSON.parse(xhr.responseText); if (d.error?.message) errMsg = d.error.message; } catch (e) {} reject(new Error(errMsg)); } };
    xhr.onerror = () => reject(new Error('Network error')); xhr.ontimeout = () => reject(new Error('Timeout')); xhr.send(formData);
  });
}

/* ============================================================
   SHORTS & COMMENTS
   ============================================================ */
function formatVoiceDuration(seconds) {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds), m = Math.floor(total / 60), s = total % 60; return `${m}:${s < 10 ? '0' + s : s}`;
}
async function incrementPostShare(postId) {
  if (!postId) return;
  try {
    const postRef = doc(db, 'posts', postId), snap = await getDoc(postRef);
    if (snap.exists()) await updateDoc(postRef, { shares: (snap.data().shares || 0) + 1 });
  } catch (e) {}
}
async function sharePost(post) {
  if (!post) return;
  const appUrl = window.location.origin, shareText = `🎬 Check out this post on ReelHub!\n\n@${post.userHandle || 'user'}\n\n${appUrl}`;
  if (navigator.share) { try { await navigator.share({ title: 'ReelHub Post', text: shareText, url: appUrl }); await incrementPostShare(post.id); return; } catch (err) { if (err.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(shareText); await incrementPostShare(post.id); showToast('✅ Link copied!'); } catch (err) { showToast('❌ Could not share'); }
}
async function shareUser(user) {
  if (!user) return;
  const appUrl = window.location.origin, shareText = `🎬 Check out ${user.name}'s profile on ReelHub!\n\n@${user.user}\n\n${appUrl}`;
  if (navigator.share) { try { await navigator.share({ title: `${user.name} on ReelHub`, text: shareText, url: appUrl }); return; } catch (err) { if (err.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(shareText); showToast('✅ Link copied!'); } catch (err) { showToast('❌ Could not share'); }
}

function openStoryViewer(userId) {
  const userIndex = storiesByUser.findIndex(u => u.userId === userId); if (userIndex === -1) return;
  document.querySelectorAll('.short-item video').forEach(v => { try { v.pause(); } catch (e) {} });
  currentStoryUserIndex = userIndex; currentStoryIndex = 0; storyViewer.style.display = 'block'; document.body.style.overflow = 'hidden'; renderCurrentStory();
}
function renderCurrentStory() {
  clearStoryTimers(); const userGroup = storiesByUser[currentStoryUserIndex]; if (!userGroup) { closeStoryViewer(); return; }
  const story = userGroup.stories[currentStoryIndex];
  if (!story) { if (currentStoryUserIndex < storiesByUser.length - 1) { currentStoryUserIndex++; currentStoryIndex = 0; renderCurrentStory(); } else closeStoryViewer(); return; }
  storyUserAvatar.src = userGroup.userPhoto || defaultAvatar(userGroup.userName);
  storyUserName.innerHTML = `${escapeHtml(userGroup.userName || 'User')}${verifiedBadgeHTML(userGroup.userVerified, userGroup.userVerifiedUntil)}`;
  const time = story.createdAt?.toDate?.(); storyTime.textContent = time ? timeAgo(time) : 'just now';
  const isOwnStory = userGroup.userId === currentUser.uid; storyDeleteBtn.style.display = isOwnStory ? 'block' : 'none';
  const viewersBtn = document.getElementById('storyViewersBtn'), viewersCountEl = document.getElementById('storyViewersCount');
  if (viewersBtn) { if (isOwnStory) { viewersBtn.style.display = 'inline-flex'; if (viewersCountEl) viewersCountEl.textContent = (story.viewers || []).length; } else viewersBtn.style.display = 'none'; }
  storyProgressBars.innerHTML = ''; userGroup.stories.forEach((s, idx) => { const seg = document.createElement('div'); seg.className = 'story-progress-segment'; const fill = document.createElement('div'); fill.className = 'story-progress-fill'; if (idx < currentStoryIndex) fill.style.width = '100%'; seg.appendChild(fill); storyProgressBars.appendChild(seg); });
  storyMedia.innerHTML = '';
  if (story.type === 'photo') { const img = document.createElement('img'); img.src = story.url; img.className = 'story-content'; img.alt = ''; storyMedia.appendChild(img); currentStoryMediaEl = img; }
  else { const video = document.createElement('video'); video.src = story.url; video.className = 'story-content'; video.autoplay = true; video.playsInline = true; video.loop = false; storyMedia.appendChild(video); currentStoryMediaEl = video; }
  markStoryViewed(story.id);
  const fills = storyProgressBars.querySelectorAll('.story-progress-fill'), currentFill = fills[currentStoryIndex];
  if (story.type === 'photo') startPhotoStoryProgress((story.duration || 5) * 1000, currentFill);
  else startVideoStoryProgress(currentStoryMediaEl, currentFill);
}
function startPhotoStoryProgress(duration, currentFill) {
  if (!currentFill) return; const startTime = Date.now();
  storyProgressInterval = setInterval(() => { const percent = Math.min(((Date.now() - startTime) / duration) * 100, 100); currentFill.style.width = percent + '%'; if (percent >= 100) { clearInterval(storyProgressInterval); storyProgressInterval = null; nextStory(); } }, 50);
}
function startVideoStoryProgress(video, currentFill) {
  if (!video || !currentFill) return;
  const onTimeUpdate = () => { if (video.duration && isFinite(video.duration)) currentFill.style.width = Math.min((video.currentTime / video.duration) * 100, 100) + '%'; };
  const onEnded = () => nextStory(); const onLoaded = () => { video.play().catch(() => {}); };
  video.addEventListener('timeupdate', onTimeUpdate); video.addEventListener('ended', onEnded); video.addEventListener('loadedmetadata', onLoaded);
  if (video.readyState >= 1) onLoaded();
  video._cleanup = () => { video.removeEventListener('timeupdate', onTimeUpdate); video.removeEventListener('ended', onEnded); video.removeEventListener('loadedmetadata', onLoaded); };
}
function clearStoryTimers() {
  if (storyProgressInterval) { clearInterval(storyProgressInterval); storyProgressInterval = null; }
  if (storyAutoAdvanceTimeout) { clearTimeout(storyAutoAdvanceTimeout); storyAutoAdvanceTimeout = null; }
  if (currentStoryMediaEl) { if (currentStoryMediaEl._cleanup) { try { currentStoryMediaEl._cleanup(); } catch (e) {} currentStoryMediaEl._cleanup = null; } if (currentStoryMediaEl.tagName === 'VIDEO') { try { currentStoryMediaEl.pause(); } catch (e) {} } }
}
function nextStory() {
  clearStoryTimers(); const userGroup = storiesByUser[currentStoryUserIndex]; if (!userGroup) { closeStoryViewer(); return; }
  if (currentStoryIndex < userGroup.stories.length - 1) { currentStoryIndex++; renderCurrentStory(); }
  else { if (currentStoryUserIndex < storiesByUser.length - 1) { currentStoryUserIndex++; currentStoryIndex = 0; renderCurrentStory(); } else closeStoryViewer(); }
}
function prevStory() {
  clearStoryTimers();
  if (currentStoryIndex > 0) { currentStoryIndex--; renderCurrentStory(); }
  else { if (currentStoryUserIndex > 0) { currentStoryUserIndex--; currentStoryIndex = storiesByUser[currentStoryUserIndex].stories.length - 1; renderCurrentStory(); } else { currentStoryIndex = 0; renderCurrentStory(); } }
}
function closeStoryViewer() {
  clearStoryTimers(); storyViewer.style.display = 'none'; storyMedia.innerHTML = ''; document.body.style.overflow = ''; currentStoryMediaEl = null;
  document.getElementById('storyViewersSheet')?.remove(); document.querySelectorAll('.short-item video').forEach(v => { try { v.pause(); } catch (e) {} });
}
async function markStoryViewed(storyId) {
  if (!currentUser || !storyId) return;
  try {
    const storyRef = doc(db, 'stories', storyId), snap = await getDoc(storyRef); if (!snap.exists()) return;
    const data = snap.data(), viewers = data.viewers || [];
    if (!viewers.includes(currentUser.uid)) {
      await updateDoc(storyRef, { viewers: arrayUnion(currentUser.uid) });
      const s = typeof getSettings === 'function' ? getSettings() : { pushNotif: true };
      if (data.userId && data.userId !== currentUser.uid && s.pushNotif) { try { await addDoc(collection(db, 'notifications'), { userId: data.userId, type: 'story_view', title: '👁 New Story View', message: `${currentProfile?.name || 'Someone'} viewed your story`, storyId: storyId, fromUserId: currentUser.uid, read: false, createdAt: serverTimestamp() }); } catch (e) {} }
    }
  } catch (e) {}
}
storyCloseBtn.addEventListener('click', closeStoryViewer); storyTapLeft.addEventListener('click', prevStory); storyTapRight.addEventListener('click', nextStory);
document.getElementById('storyViewersBtn')?.addEventListener('click', (e) => { e.stopPropagation(); const userGroup = storiesByUser[currentStoryUserIndex]; if (!userGroup) return; const story = userGroup.stories[currentStoryIndex]; if (!story) return; showStoryViewers(story); });
storyDeleteBtn.addEventListener('click', async () => {
  if (!confirm('Delete this story?')) return;
  const userGroup = storiesByUser[currentStoryUserIndex]; if (!userGroup) return; const story = userGroup.stories[currentStoryIndex]; if (!story) return;
  try {
    await deleteDoc(doc(db, 'stories', story.id)); showToast('Story deleted'); userGroup.stories.splice(currentStoryIndex, 1);
    if (userGroup.stories.length === 0) { storiesByUser.splice(currentStoryUserIndex, 1); if (storiesByUser.length === 0) { closeStoryViewer(); renderHomeFeed(); return; } if (currentStoryUserIndex >= storiesByUser.length) currentStoryUserIndex = storiesByUser.length - 1; currentStoryIndex = 0; }
    else if (currentStoryIndex >= userGroup.stories.length) currentStoryIndex = userGroup.stories.length - 1;
    renderCurrentStory();
  } catch (e) { showToast('❌ Could not delete'); }
});

async function renderShortsFeed() {
  content.innerHTML = `<div class="shorts-wrap" id="shortsWrap"><div class="shorts-empty"><div class="page-title">Loading shorts...</div></div></div>`;
  const wrap = document.getElementById('shortsWrap'); if (!wrap) return;
  try {
    const snap = await getDocs(query(collection(db, 'posts'), where('type', '==', 'short'), limit(30)));
    if (snap.empty) { wrap.innerHTML = `<div class="shorts-empty"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M3 8h6M15 8h6"/><path d="M10 12l5 3-5 3z" fill="currentColor" stroke="none"/></svg><h3>No shorts yet</h3><p>Upload a short video to see it here</p></div>`; return; }
    let shorts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const blocked = currentProfile?.blockedUsers || []; shorts = shorts.filter(s => !blocked.includes(s.userId));
    shorts.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));
    shorts.forEach(short => trackPostView(short.id)); wrap.innerHTML = ''; shorts.forEach(short => wrap.appendChild(makeShortItem(short)));
    setupShortsAutoplay(wrap);
    if (shortsSoundEnabled) setTimeout(() => { const firstVideo = wrap.querySelector('.short-item video'); if (firstVideo) { firstVideo.muted = false; firstVideo.play().catch(() => { firstVideo.muted = true; firstVideo.play().catch(() => {}); }); } }, 300);
    if (!shortsSoundEnabled) showTapToUnmuteOverlay(wrap);
  } catch (e) { wrap.innerHTML = `<div class="shorts-empty"><h3>Could not load shorts</h3></div>`; }
}
function showTapToUnmuteOverlay(wrap) {
  wrap.querySelector('.tap-to-unmute-overlay')?.remove();
  const overlay = document.createElement('div'); overlay.className = 'tap-to-unmute-overlay';
  overlay.innerHTML = `<div class="unmute-content"><div class="unmute-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg></div><div class="unmute-text">Tap to Unmute</div></div>`;
  wrap.appendChild(overlay);
  overlay.addEventListener('click', () => {
    shortsSoundEnabled = true; localStorage.setItem('shortsSound', 'true');
    wrap.querySelectorAll('.short-item video').forEach(v => v.muted = false); overlay.remove();
    const currentVideo = getCurrentVisibleVideo(wrap); if (currentVideo) currentVideo.play().catch(() => {}); showToast('🔊 Sound ON');
  });
}
function getCurrentVisibleVideo(wrap) {
  const videos = wrap.querySelectorAll('.short-item video');
  for (let v of videos) { const rect = v.getBoundingClientRect(); if (rect.top >= 0 && rect.bottom <= window.innerHeight) return v; if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) return v; }
  return videos[0];
}
function makeShortItem(short) {
  const item = document.createElement('div'); item.className = 'short-item'; item.dataset.postId = short.id;
  item.innerHTML = `<video src="${short.url}" loop ${shortsSoundEnabled ? '' : 'muted'} playsinline preload="metadata" style="width:100%;height:100%;object-fit:contain;background:#000;"></video><div class="short-overlay"><div class="short-bottom-info"><div class="short-user-block"><div class="short-user-row"><img src="${short.userPhoto || defaultAvatar(short.userName)}" alt="" data-uid="${short.userId}"><div><b>${escapeHtml(short.userName || 'User')}${verifiedBadgeHTML(short.userVerified, short.userVerifiedUntil)}</b><span>@${escapeHtml(short.userHandle || '')}</span></div></div>${short.caption ? `<div class="short-caption">${escapeHtml(short.caption)}</div>` : ''}</div><div class="short-side-actions"><button class="like-btn ${(short.likes || []).includes(currentUser.uid) ? 'liked' : ''}" data-post="${short.id}"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>${(short.likes || []).length}</span></button><button class="comment-btn" data-post="${short.id}"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span>${short.commentsCount ?? (short.comments || []).length}</span></button><button class="save-btn ${isPostSaved(short.id) ? 'saved' : ''}" data-post="${short.id}" title="Save"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button><button class="share-btn-short" data-post="${short.id}"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button></div></div></div>`;
  const videoEl = item.querySelector('video'), userImg = item.querySelector('.short-user-row img');
  if (userImg) userImg.addEventListener('click', () => openUserProfile(short.userId));
  item.querySelector('.like-btn').addEventListener('click', async (e) => { e.stopPropagation(); await toggleLike(short.id, e.currentTarget); });
  item.querySelector('.comment-btn').addEventListener('click', (e) => { e.stopPropagation(); openComments(short.id, short.caption || 'Comments'); });
  const saveBtn = item.querySelector('.save-btn'); if (saveBtn) saveBtn.addEventListener('click', async (e) => { e.stopPropagation(); await toggleSavePost(short.id, e.currentTarget); });
  item.querySelector('.share-btn-short').addEventListener('click', async (e) => { e.stopPropagation(); await sharePost(short); });
  let shortTapTimer = null;
  videoEl.addEventListener('click', (e) => { if (e.detail >= 2) { clearTimeout(shortTapTimer); return; } clearTimeout(shortTapTimer); shortTapTimer = setTimeout(() => { videoEl.muted = !videoEl.muted; shortsSoundEnabled = !videoEl.muted; localStorage.setItem('shortsSound', shortsSoundEnabled ? 'true' : 'false'); showToast(videoEl.muted ? '🔇 Sound OFF' : '🔊 Sound ON'); if (!videoEl.muted) videoEl.play().catch(() => {}); }, 280); });
  attachDoubleTapLike(item, short, null); return item;
}
function setupShortsAutoplay(wrap) {
  const settings = typeof getSettings === 'function' ? getSettings() : { autoPlay: true }; stopShortsObserver();
  shortsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) { if (settings.autoPlay && !settings.dataSaver) { video.muted = !shortsSoundEnabled; video.play().catch(() => { video.muted = true; video.play().catch(() => {}); }); } }
      else video.pause();
    });
  }, { threshold: [0, 0.6, 1] });
  wrap.querySelectorAll('.short-item video').forEach(v => shortsObserver.observe(v));
}
function stopShortsObserver() { if (shortsObserver) { shortsObserver.disconnect(); shortsObserver = null; } document.querySelectorAll('.short-item video').forEach(v => { try { v.pause(); } catch (e) {} }); }

async function toggleLike(postId, btnEl) {
  if (!currentUser || !btnEl) return;
  const isCurrentlyLiked = btnEl.classList.contains('liked'), countSpan = btnEl.querySelector('span'), currentCount = countSpan ? (parseInt(countSpan.textContent) || 0) : 0;
  btnEl.disabled = true;
  if (isCurrentlyLiked) {
    btnEl.classList.remove('liked'); if (countSpan) countSpan.textContent = Math.max(0, currentCount - 1);
    try { await updateDoc(doc(db, 'posts', postId), { likes: arrayRemove(currentUser.uid) }); showToast('💔 Unliked'); if (navigator.vibrate) navigator.vibrate(20); } catch (e) { btnEl.classList.add('liked'); if (countSpan) countSpan.textContent = currentCount; showToast('❌ Could not unlike'); }
  } else {
    btnEl.classList.add('liked'); if (countSpan) countSpan.textContent = currentCount + 1;
    btnEl.style.transform = 'scale(1.3)'; setTimeout(() => { btnEl.style.transform = ''; }, 200);
    const card = btnEl.closest('.yt-card, .short-item, .grid-item'); if (card) showHeartAnimation(card);
    try {
      await updateDoc(doc(db, 'posts', postId), { likes: arrayUnion(currentUser.uid) }); showToast('❤️ Liked'); if (navigator.vibrate) navigator.vibrate(30);
      try {
        const s = typeof getSettings === 'function' ? getSettings() : { notifLikes: true, pushNotif: true };
        const postSnap = await getDoc(doc(db, 'posts', postId));
        if (postSnap.exists() && s.pushNotif && s.notifLikes) { const postData = postSnap.data(); if (postData.userId && postData.userId !== currentUser.uid) await addDoc(collection(db, 'notifications'), { userId: postData.userId, type: 'like', title: '❤️ New Like', message: `${currentProfile?.name || 'Someone'} liked your post`, postId: postId, fromUserId: currentUser.uid, read: false, createdAt: serverTimestamp() }); }
      } catch (e) {}
    } catch (e) { btnEl.classList.remove('liked'); if (countSpan) countSpan.textContent = currentCount; showToast('❌ Could not like'); }
  }
  btnEl.disabled = false;
}

async function openComments(postId, title) {
  if (!currentUser) return;
  activeCommentPostId = postId; activeReplyTo = null; allCommentsForPost = []; commentsTitle.textContent = title || 'Comments';
  myAvatarForComment.src = currentProfile?.photo || defaultAvatar(currentProfile?.name || '?');
  commentInput.value = ''; postCommentBtn.disabled = true; hideReplyIndicator();
  commentsList.innerHTML = `<div class="empty-msg">Loading comments...</div>`; commentsModal.classList.add('show'); await loadComments();
}
document.getElementById('closeComments')?.addEventListener('click', () => { commentsModal.classList.remove('show'); activeCommentPostId = null; activeReplyTo = null; });
commentsModal.addEventListener('click', (e) => { if (e.target === commentsModal) { commentsModal.classList.remove('show'); activeCommentPostId = null; activeReplyTo = null; } });
async function loadComments() {
  if (!activeCommentPostId) return;
  try {
    const snap = await getDocs(query(collection(db, 'comments'), where('postId', '==', activeCommentPostId)));
    const allComments = snap.docs.map(d => ({ id: d.id, ...d.data() })), topLevel = allComments.filter(c => !c.parentId), replies = allComments.filter(c => c.parentId);
    topLevel.sort((a, b) => (a.createdAt?.toDate?.()?.getTime() || 0) - (b.createdAt?.toDate?.()?.getTime() || 0));
    topLevel.forEach(c => { c.replies = replies.filter(r => r.parentId === c.id).sort((a, b) => (a.createdAt?.toDate?.()?.getTime() || 0) - (b.createdAt?.toDate?.()?.getTime() || 0)); });
    allCommentsForPost = topLevel; paintComments(topLevel);
  } catch (e) { commentsList.innerHTML = `<div class="comments-empty">Could not load comments</div>`; }
}
function paintComments(comments) {
  if (comments.length === 0) { commentsList.innerHTML = `<div class="comments-empty"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><div>No comments yet</div></div>`; return; }
  commentsList.innerHTML = ''; comments.forEach(comment => commentsList.appendChild(makeCommentItem(comment, false)));
}
function makeCommentItem(comment, isReply) {
  const item = document.createElement('div'); item.className = isReply ? 'comment-item reply-item' : 'comment-item'; item.dataset.commentId = comment.id;
  const isOwner = comment.userId === currentUser.uid, time = comment.createdAt?.toDate?.(), timeStr = time ? timeAgo(time) : 'just now';
  let replyToHtml = comment.replyToHandle ? `<span class="mention">@${escapeHtml(comment.replyToHandle)}</span> ` : '';
  let repliesHtml = (!isReply && comment.replies && comment.replies.length > 0) ? `<div class="replies-wrap"><button class="replies-toggle" data-toggle="${comment.id}"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg><span>View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}</span></button><div class="replies-list replies-hidden" data-replies="${comment.id}"></div></div>` : '';
  item.innerHTML = `<div class="comment-main"><img class="comment-avatar" src="${comment.userPhoto || defaultAvatar(comment.userName)}" alt="" data-uid="${comment.userId}"><div class="comment-content"><div class="comment-top"><span class="comment-name" data-uid="${comment.userId}">${escapeHtml(comment.userName || 'User')}${verifiedBadgeHTML(comment.userVerified, comment.userVerifiedUntil)}</span><span class="comment-time">${timeStr}</span></div><div class="comment-text">${replyToHtml}${escapeHtml(comment.text || '')}</div><div class="comment-actions-row"><button class="comment-action-btn like-btn ${(comment.likes || []).includes(currentUser.uid) ? 'liked' : ''}" data-comment="${comment.id}"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="comment-like-count">${(comment.likes || []).length > 0 ? (comment.likes || []).length : ''}</span></button>${!isReply ? `<button class="comment-action-btn reply-btn" data-comment="${comment.id}" data-user="${escapeHtml(comment.userName)}" data-handle="${escapeHtml(comment.userHandle)}"><svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg> Reply</button>` : ''}${isOwner ? `<button class="comment-delete-btn" data-comment="${comment.id}">🗑️</button>` : ''}</div></div></div>${repliesHtml}`;
  item.querySelector('.comment-avatar')?.addEventListener('click', () => openUserProfile(comment.userId));
  item.querySelector('.comment-name')?.addEventListener('click', () => openUserProfile(comment.userId));
  item.querySelector('.like-btn').addEventListener('click', async (e) => { e.stopPropagation(); await toggleCommentLike(comment.id, e.currentTarget); });
  const replyBtn = item.querySelector('.reply-btn'); if (replyBtn) replyBtn.addEventListener('click', () => showReplyIndicator(comment.id, comment.userName, comment.userHandle));
  const deleteBtn = item.querySelector('.comment-delete-btn'); if (deleteBtn) deleteBtn.addEventListener('click', async () => { const settings = typeof getSettings === 'function' ? getSettings() : { confirmDelete: true }; if (settings.confirmDelete && !confirm('Delete this comment?')) return; await deleteComment(comment.id); });
  const toggleBtn = item.querySelector('.replies-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const repliesList = item.querySelector('.replies-list'), isHidden = repliesList.classList.contains('replies-hidden');
      if (isHidden) { repliesList.innerHTML = ''; (comment.replies || []).forEach(reply => repliesList.appendChild(makeCommentItem(reply, true))); repliesList.classList.remove('replies-hidden'); toggleBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg><span>Hide ${comment.replies.length}</span>`; }
      else { repliesList.classList.add('replies-hidden'); toggleBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg><span>View ${comment.replies.length}</span>`; }
    });
  }
  return item;
}
commentInput.addEventListener('input', () => { postCommentBtn.disabled = !commentInput.value.trim(); });
postCommentBtn.addEventListener('click', async () => {
  const text = commentInput.value.trim(); if (!text || !activeCommentPostId || !currentUser) return;
  postCommentBtn.disabled = true; postCommentBtn.textContent = '...'; const replySnapshot = activeReplyTo;
  try {
    const commentData = { postId: activeCommentPostId, userId: currentUser.uid, userName: currentProfile?.name || 'User', userHandle: currentProfile?.user || '', userPhoto: currentProfile?.photo || '', userVerified: currentProfile?.verified || false, userVerifiedUntil: currentProfile?.verifiedUntil || null, text: text, likes: [], parentId: replySnapshot ? replySnapshot.commentId : null, replyToUser: replySnapshot ? replySnapshot.userName : null, replyToHandle: replySnapshot ? replySnapshot.userHandle : null, createdAt: serverTimestamp() };
    await addDoc(collection(db, 'comments'), commentData);
    try {
      const postRef = doc(db, 'posts', activeCommentPostId), postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const currentCount = postSnap.data().commentsCount || 0; await updateDoc(postRef, { commentsCount: currentCount + 1 });
        document.querySelectorAll(`.comment-btn[data-post="${activeCommentPostId}"] span`).forEach(el => { el.textContent = currentCount + 1; });
        const s = typeof getSettings === 'function' ? getSettings() : { notifComments: true, pushNotif: true }, postData = postSnap.data(), shouldNotify = s.pushNotif && s.notifComments;
        if (postData.userId && postData.userId !== currentUser.uid && shouldNotify) { try { await addDoc(collection(db, 'notifications'), { userId: postData.userId, type: 'comment', title: '💬 New Comment', message: `${currentProfile?.name || 'Someone'} commented: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`, postId: activeCommentPostId, fromUserId: currentUser.uid, read: false, createdAt: serverTimestamp() }); } catch (e) {} }
        if (replySnapshot && replySnapshot.commentId && shouldNotify) { try { const parentSnap = await getDoc(doc(db, 'comments', replySnapshot.commentId)); if (parentSnap.exists()) { const parentData = parentSnap.data(); if (parentData.userId && parentData.userId !== currentUser.uid && parentData.userId !== postData.userId) await addDoc(collection(db, 'notifications'), { userId: parentData.userId, type: 'reply', title: '↩️ New Reply', message: `${currentProfile?.name || 'Someone'} replied: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`, postId: activeCommentPostId, fromUserId: currentUser.uid, read: false, createdAt: serverTimestamp() }); } } catch (e) {} }
      }
    } catch (e) {}
    commentInput.value = ''; hideReplyIndicator(); postCommentBtn.textContent = 'Post'; postCommentBtn.disabled = true; await loadComments();
    setTimeout(() => { commentInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);
  } catch (e) { postCommentBtn.textContent = 'Post'; postCommentBtn.disabled = false; showToast('❌ Could not post comment'); }
});
function showReplyIndicator(commentId, userName, userHandle) { activeReplyTo = { commentId, userName, userHandle }; replyIndicatorText.textContent = `Replying to @${userHandle}`; replyIndicator.classList.add('show'); replyIndicator.style.display = 'flex'; commentInput.focus(); commentInput.placeholder = `Reply to @${userHandle}...`; setTimeout(() => { commentInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100); }
function hideReplyIndicator() { activeReplyTo = null; replyIndicator.classList.remove('show'); replyIndicator.style.display = 'none'; commentInput.placeholder = 'Add a comment...'; }
cancelReplyBtn.addEventListener('click', hideReplyIndicator);
async function toggleCommentLike(commentId, btnEl) {
  if (!currentUser) return;
  try {
    const ref = doc(db, 'comments', commentId), snap = await getDoc(ref); if (!snap.exists()) return;
    const data = snap.data(), likes = data.likes || [], isLiked = likes.includes(currentUser.uid);
    if (isLiked) await updateDoc(ref, { likes: arrayRemove(currentUser.uid) }); else await updateDoc(ref, { likes: arrayUnion(currentUser.uid) });
    const newCount = isLiked ? likes.length - 1 : likes.length + 1, countEl = btnEl.querySelector('.comment-like-count');
    if (countEl) countEl.textContent = newCount > 0 ? newCount : ''; btnEl.classList.toggle('liked', !isLiked);
  } catch (e) {}
}
async function deleteComment(commentId) {
  try {
    const commentRef = doc(db, 'comments', commentId); await getDoc(commentRef); await deleteDoc(commentRef);
    const repliesQ = query(collection(db, 'comments'), where('parentId', '==', commentId)), repliesSnap = await getDocs(repliesQ), repliesCount = repliesSnap.size;
    for (const replyDoc of repliesSnap.docs) await deleteDoc(doc(db, 'comments', replyDoc.id));
    const totalDeleted = 1 + repliesCount;
    if (activeCommentPostId) { try { const postRef = doc(db, 'posts', activeCommentPostId), postSnap = await getDoc(postRef); if (postSnap.exists()) { const newCount = Math.max(0, (postSnap.data().commentsCount || 0) - totalDeleted); await updateDoc(postRef, { commentsCount: newCount }); document.querySelectorAll(`.comment-btn[data-post="${activeCommentPostId}"] span`).forEach(el => { el.textContent = newCount; }); } } catch (e) {} }
    showToast('Comment deleted'); await loadComments();
  } catch (e) { showToast('❌ Could not delete comment'); }
}

/* ============================================================
   SOUND, CHATS & GROUPS
   ============================================================ */
let _audioCtx = null;
function _getAudioCtx() { if (!_audioCtx) { try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return _audioCtx; }
function _unlockAudio() { const ctx = _getAudioCtx(); if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); }
document.addEventListener('click', _unlockAudio, { once: true }); document.addEventListener('touchstart', _unlockAudio, { once: true });
function playSendSound() { const s = typeof getSettings === 'function' ? getSettings() : {}; if (s.soundEffects === false) return; try { const ctx = _getAudioCtx(); if (!ctx) return; if (ctx.state === 'suspended') ctx.resume(); const o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type = 'sine'; o.frequency.setValueAtTime(700, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.09); g.gain.setValueAtTime(0.001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14); o.start(); o.stop(ctx.currentTime + 0.15); } catch (e) {} }
function playReceiveSound() { const s = typeof getSettings === 'function' ? getSettings() : {}; if (s.soundEffects === false) return; try { const ctx = _getAudioCtx(); if (!ctx) return; if (ctx.state === 'suspended') ctx.resume(); [{ freq: 660, delay: 0 }, { freq: 880, delay: 0.12 }].forEach(({ freq, delay }) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type = 'sine'; o.frequency.setValueAtTime(freq, ctx.currentTime + delay); g.gain.setValueAtTime(0.001, ctx.currentTime + delay); g.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + delay + 0.02); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.16); o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + 0.17); }); if (navigator.vibrate) navigator.vibrate(60); } catch (e) {} }
function playNotificationSound() { const s = typeof getSettings === 'function' ? getSettings() : {}; if (s.soundEffects === false) return; try { const ctx = _getAudioCtx(); if (!ctx) return; if (ctx.state === 'suspended') ctx.resume(); [{ freq: 900, delay: 0 }, { freq: 1000, delay: 0.1 }, { freq: 1100, delay: 0.2 }].forEach(({ freq, delay }) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type = 'triangle'; o.frequency.setValueAtTime(freq, ctx.currentTime + delay); g.gain.setValueAtTime(0.001, ctx.currentTime + delay); g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + delay + 0.02); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1); o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + 0.11); }); } catch (e) {} }

async function renderChatsPage() {
  content.innerHTML = `<div class="chats-page"><div class="chats-header"><div class="chats-title">Chats</div><div style="display:flex;gap:6px;"><button class="new-chat-btn" id="openNewGroupBtn" title="New Group"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></button><button class="new-chat-btn" id="openNewChatBtn" title="New Chat"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div></div><div class="chats-tabs"><button class="chats-tab active" data-tab="all">All</button><button class="chats-tab" data-tab="dm">Direct</button><button class="chats-tab" data-tab="group">Groups</button></div><div class="chats-list" id="chatsList"><div class="empty-msg">Loading chats...</div></div></div>`;
  document.getElementById('openNewChatBtn')?.addEventListener('click', openNewChatModal);
  document.getElementById('openNewGroupBtn')?.addEventListener('click', openNewGroupModal);
  document.querySelectorAll('.chats-tab').forEach(tab => { tab.addEventListener('click', () => { document.querySelectorAll('.chats-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); loadChatsList(tab.dataset.tab); }); });
  await loadChatsList('all');
}
async function loadChatsList(filter = 'all') {
  const wrap = document.getElementById('chatsList'); if (!wrap) return; wrap.innerHTML = `<div class="empty-msg">Loading chats...</div>`;
  try {
    let dms = [];
    if (filter === 'all' || filter === 'dm') {
      const snap = await getDocs(query(collection(db, 'chats'), where('members', 'array-contains', currentUser.uid)));
      for (const docSnap of snap.docs) { const chat = { id: docSnap.id, ...docSnap.data() }; if (chat.type === 'group') continue; const otherUid = chat.members.find(m => m !== currentUser.uid); if (!otherUid) continue; try { const userSnap = await getDoc(doc(db, 'users', otherUid)); if (userSnap.exists()) dms.push({ ...chat, otherUser: { uid: otherUid, ...userSnap.data() } }); } catch (e) {} }
    }
    let groups = [];
    if (filter === 'all' || filter === 'group') { const gsnap = await getDocs(query(collection(db, 'groups'), where('members', 'array-contains', currentUser.uid))); gsnap.forEach(d => groups.push({ id: d.id, ...d.data() })); }
    const all = [...dms, ...groups]; all.sort((a, b) => (b.lastMessageTime?.toDate?.()?.getTime() || 0) - (a.lastMessageTime?.toDate?.()?.getTime() || 0));
    if (all.length === 0) { wrap.innerHTML = `<div class="chats-empty"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><h3>No chats yet</h3><p>Start a conversation or create a group</p></div>`; return; }
    wrap.innerHTML = ''; all.forEach(chat => { if (chat.type === 'group') wrap.appendChild(makeGroupChatItem(chat)); else wrap.appendChild(makeChatItem(chat)); });
  } catch (e) { wrap.innerHTML = `<div class="empty-msg">Could not load chats</div>`; }
}
function makeChatItem(chat) {
  const item = document.createElement('div'); item.className = 'chat-item'; const otherUser = chat.otherUser, time = chat.lastMessageTime?.toDate?.(), hasUnread = chat.lastMessageBy !== currentUser.uid && (chat.unreadBy || []).includes(currentUser.uid);
  let lastMsgHtml = chat.lastMessageType === 'voice' ? `<div class="last-msg voice ${hasUnread ? 'unread' : ''}">🎤 Voice message</div>` : chat.lastMessageType === 'file' ? `<div class="last-msg ${hasUnread ? 'unread' : ''}">📎 File</div>` : `<div class="last-msg ${hasUnread ? 'unread' : ''}">${escapeHtml((chat.lastMessage || '').substring(0, 40))}${chat.lastMessage && chat.lastMessage.length > 40 ? '...' : ''}</div>`;
  item.innerHTML = `<img src="${otherUser.photo || defaultAvatar(otherUser.name)}" alt=""><div class="meta"><b>${escapeHtml(otherUser.name || 'User')}${verifiedBadgeHTML(otherUser.verified, otherUser.verifiedUntil)}${otherUser.isPrivate ? ' 🔒' : ''}</b>${lastMsgHtml}</div><div class="info"><div class="time">${time ? timeAgoShort(time) : ''}</div>${hasUnread ? `<div class="unread-badge">●</div>` : ''}</div>`;
  item.addEventListener('click', () => openChatWindow(otherUser)); return item;
}
function makeGroupChatItem(group) {
  const item = document.createElement('div'); item.className = 'chat-item'; const time = group.lastMessageTime?.toDate?.(), hasUnread = group.lastMessageBy !== currentUser.uid && (group.unreadBy || []).includes(currentUser.uid);
  let lastMsgHtml = group.lastMessageType === 'voice' ? `<div class="last-msg voice ${hasUnread ? 'unread' : ''}">🎤 Voice message</div>` : group.lastMessageType === 'file' ? `<div class="last-msg ${hasUnread ? 'unread' : ''}">📎 ${escapeHtml(group.lastFileName || 'File')}</div>` : `<div class="last-msg ${hasUnread ? 'unread' : ''}">${escapeHtml((group.lastMessage || '').substring(0, 40))}</div>`;
  item.innerHTML = `<img src="${group.photo || defaultGroupAvatar(group.name)}" alt=""><div class="meta"><b>${escapeHtml(group.name || 'Group')} 👥</b>${lastMsgHtml}</div><div class="info"><div class="time">${time ? timeAgoShort(time) : ''}</div>${hasUnread ? `<div class="unread-badge">●</div>` : ''}</div>`;
  item.addEventListener('click', () => openGroupChatWindow(group)); return item;
}
function defaultGroupAvatar(name) { const letter = (name || 'G').trim().charAt(0).toUpperCase() || 'G'; return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#4ea8ff"/><text x="50" y="50" font-size="44" font-family="sans-serif" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${letter}</text></svg>`); }

function openNewChatModal() { newChatSearch.value = ''; newChatResults.innerHTML = `<div class="search-empty">Start typing...</div>`; newChatModal.classList.add('show'); newChatSearch.focus(); }
document.getElementById('closeNewChat')?.addEventListener('click', () => newChatModal.classList.remove('show'));
newChatModal.addEventListener('click', (e) => { if (e.target === newChatModal) newChatModal.classList.remove('show'); });
let newChatDebounce = null;
newChatSearch.addEventListener('input', (e) => { clearTimeout(newChatDebounce); newChatDebounce = setTimeout(() => searchUsersForChat(e.target.value.trim()), 300); });
async function searchUsersForChat(term) {
  if (!term) { newChatResults.innerHTML = `<div class="search-empty">Start typing...</div>`; return; } newChatResults.innerHTML = `<div class="search-empty">Searching...</div>`;
  try {
    const snap = await getDocs(collection(db, 'users')), lowerTerm = term.toLowerCase(), blocked = currentProfile?.blockedUsers || [];
    const matches = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== currentUser.uid && !blocked.includes(u.id)).filter(u => (u.name || '').toLowerCase().includes(lowerTerm) || (u.user || '').toLowerCase().includes(lowerTerm)).slice(0, 20);
    if (matches.length === 0) { newChatResults.innerHTML = `<div class="search-empty">No users found</div>`; return; }
    newChatResults.innerHTML = ''; matches.forEach(u => { const row = document.createElement('div'); row.className = 'search-user'; row.innerHTML = `<img src="${u.photo || defaultAvatar(u.name)}" alt=""><div class="info"><b>${escapeHtml(u.name)}${verifiedBadgeHTML(u.verified, u.verifiedUntil)}${u.isPrivate ? ' 🔒' : ''}</b><span>@${escapeHtml(u.user)}</span></div><button class="follow">Chat</button>`; row.addEventListener('click', () => { newChatModal.classList.remove('show'); openChatWindow(u); }); newChatResults.appendChild(row); });
  } catch (e) { newChatResults.innerHTML = `<div class="search-empty">Search failed</div>`; }
}

function openNewGroupModal() {
  selectedGroupMembers = []; currentGroupFile = null; const modal = document.getElementById('newGroupModal'); modal.classList.add('show');
  document.getElementById('groupNameInput').value = ''; document.getElementById('groupSearchInput').value = '';
  document.getElementById('groupSearchResults').innerHTML = `<div class="search-empty">Start typing to add members...</div>`;
  document.getElementById('selectedMembersList').innerHTML = `<div class="empty-msg" style="padding:8px;font-size:12px;">No members selected</div>`;
  document.getElementById('createGroupBtn').disabled = true;
}
document.getElementById('closeNewGroup')?.addEventListener('click', () => document.getElementById('newGroupModal').classList.remove('show'));
document.getElementById('newGroupModal')?.addEventListener('click', (e) => { if (e.target.id === 'newGroupModal') e.target.classList.remove('show'); });
let groupSearchDebounce = null;
document.getElementById('groupSearchInput')?.addEventListener('input', (e) => { clearTimeout(groupSearchDebounce); groupSearchDebounce = setTimeout(() => searchUsersForGroup(e.target.value.trim()), 300); });
document.getElementById('groupNameInput')?.addEventListener('input', checkCreateGroupBtn);
document.getElementById('groupPhotoInput')?.addEventListener('change', async (e) => { const file = e.target.files[0]; if (!file) return; if (file.size > 500 * 1024) { showToast('❌ Max 500 KB'); return; } currentGroupFile = file; const preview = document.getElementById('groupPhotoPreview'); if (preview) preview.src = URL.createObjectURL(file); });
function checkCreateGroupBtn() { const name = document.getElementById('groupNameInput').value.trim(), btn = document.getElementById('createGroupBtn'); if (btn) btn.disabled = !(name && selectedGroupMembers.length > 0); }
async function searchUsersForGroup(term) {
  const results = document.getElementById('groupSearchResults'); if (!term) { results.innerHTML = `<div class="search-empty">Start typing...</div>`; return; } results.innerHTML = `<div class="search-empty">Searching...</div>`;
  try {
    const snap = await getDocs(collection(db, 'users')), lowerTerm = term.toLowerCase(), blocked = currentProfile?.blockedUsers || [];
    const matches = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== currentUser.uid && !blocked.includes(u.id) && !selectedGroupMembers.includes(u.id)).filter(u => (u.name || '').toLowerCase().includes(lowerTerm) || (u.user || '').toLowerCase().includes(lowerTerm)).slice(0, 20);
    if (matches.length === 0) { results.innerHTML = `<div class="search-empty">No users found</div>`; return; }
    results.innerHTML = ''; matches.forEach(u => { const row = document.createElement('div'); row.className = 'search-user'; row.innerHTML = `<img src="${u.photo || defaultAvatar(u.name)}" alt=""><div class="info"><b>${escapeHtml(u.name)}${verifiedBadgeHTML(u.verified, u.verifiedUntil)}</b><span>@${escapeHtml(u.user)}</span></div><button class="follow">Add</button>`; row.addEventListener('click', () => { selectedGroupMembers.push(u.id); addSelectedMemberChip(u); results.innerHTML = ''; document.getElementById('groupSearchInput').value = ''; checkCreateGroupBtn(); }); results.appendChild(row); });
  } catch (e) { results.innerHTML = `<div class="search-empty">Search failed</div>`; }
}
function addSelectedMemberChip(user) {
  const list = document.getElementById('selectedMembersList'); if (list.querySelector('.empty-msg')) list.innerHTML = '';
  const chip = document.createElement('div'); chip.className = 'member-chip'; chip.dataset.uid = user.id;
  chip.innerHTML = `<img src="${user.photo || defaultAvatar(user.name)}" alt=""><span>${escapeHtml(user.name)}</span><button class="chip-remove">✕</button>`;
  chip.querySelector('.chip-remove').addEventListener('click', () => { selectedGroupMembers = selectedGroupMembers.filter(id => id !== user.id); chip.remove(); if (selectedGroupMembers.length === 0) list.innerHTML = `<div class="empty-msg" style="padding:8px;font-size:12px;">No members selected</div>`; checkCreateGroupBtn(); });
  list.appendChild(chip);
}
document.getElementById('createGroupBtn')?.addEventListener('click', async () => {
  const name = document.getElementById('groupNameInput').value.trim(); if (!name) { showToast('❌ Enter group name'); return; } if (selectedGroupMembers.length === 0) { showToast('❌ Add at least 1 member'); return; }
  const btn = document.getElementById('createGroupBtn'); btn.disabled = true; btn.textContent = 'Creating...';
  try {
    let photoUrl = ''; if (currentGroupFile) { try { const uploadRes = await uploadToCloudinaryGroupFile(currentGroupFile, () => {}); photoUrl = uploadRes.secure_url; } catch (e) {} }
    await addDoc(collection(db, 'groups'), { name: name, photo: photoUrl, createdBy: currentUser.uid, createdByName: currentProfile.name, members: [currentUser.uid, ...selectedGroupMembers], admins: [currentUser.uid], type: 'group', lastMessage: 'Group created', lastMessageBy: currentUser.uid, lastMessageTime: serverTimestamp(), unreadBy: selectedGroupMembers, createdAt: serverTimestamp() });
    showToast('✅ Group created!'); document.getElementById('newGroupModal').classList.remove('show'); await loadChatsList('group');
  } catch (e) { showToast('❌ Could not create group'); btn.disabled = false; btn.textContent = 'Create Group'; }
});

async function sendTypingSignal(isTyping) { if (!activeChatId || !currentUser) return; try { const col = activeGroupId ? 'groups' : 'chats', ref = doc(db, col, activeChatId), data = {}; data[`typing.${currentUser.uid}`] = isTyping ? Date.now() : null; await setDoc(ref, data, { merge: true }); } catch (e) {} }
function setupTypingListener() {
  if (typingListenerUnsub) { try { typingListenerUnsub(); } catch (e) {} typingListenerUnsub = null; } if (!activeChatId || !currentUser) return;
  const col = activeGroupId ? 'groups' : 'chats', ref = doc(db, col, activeChatId);
  typingListenerUnsub = onSnapshot(ref, (snap) => { if (!snap.exists()) return; const data = snap.data(), typingData = data.typing || {}, now = Date.now(); const activeTypers = Object.keys(typingData).filter(uid => { if (uid === currentUser.uid) return false; const t = typingData[uid]; return t && typeof t === 'number' && (now - t) < 4000; }); updateTypingIndicatorUI(activeTypers); });
}
function updateTypingIndicatorUI(uids) {
  const el = document.getElementById('typingIndicator'); if (!el) return; if (uids.length === 0) { el.style.display = 'none'; return; }
  el.style.display = 'flex'; let text = 'typing...'; if (activeGroupId) { if (uids.length === 1) text = 'Someone is typing...'; else if (uids.length === 2) text = '2 people typing...'; else text = `${uids.length} people typing...`; }
  const textEl = el.querySelector('.typing-text'); if (textEl) textEl.textContent = text;
}
async function clearTypingSignal() { if (!isCurrentlyTyping) return; isCurrentlyTyping = false; clearTimeout(typingTimeout); await sendTypingSignal(false); }

function setChatReply(msg) {
  chatReplyTo = { msgId: msg.id, text: msg.text || (msg.type === 'voice' ? '🎤 Voice message' : (msg.type === 'file' ? '📎 File' : 'Message')), senderName: msg.from === currentUser.uid ? 'You' : (msg.fromName || 'User'), senderUid: msg.from };
  const preview = document.getElementById('chatReplyPreview'), nameEl = document.getElementById('chatReplyName'), textEl = document.getElementById('chatReplyText');
  if (preview) preview.classList.add('show'); if (nameEl) nameEl.textContent = chatReplyTo.senderName; if (textEl) textEl.textContent = chatReplyTo.text.substring(0, 80); chatMessageInput.focus();
}
function clearChatReply() { chatReplyTo = null; const preview = document.getElementById('chatReplyPreview'); if (preview) preview.classList.remove('show'); }
document.getElementById('chatReplyClose')?.addEventListener('click', clearChatReply);

function showReactionPicker(msg, anchorEl) {
  const picker = document.getElementById('reactionPicker'); if (!picker) return; activeReactionMsg = msg; picker.style.display = 'flex';
  const rect = anchorEl.getBoundingClientRect(), pickerRect = picker.getBoundingClientRect(); let top = rect.top - pickerRect.height - 8, left = rect.left + rect.width / 2 - pickerRect.width / 2;
  if (top < 60) top = rect.bottom + 8; if (left < 10) left = 10; if (left + pickerRect.width > window.innerWidth - 10) left = window.innerWidth - pickerRect.width - 10;
  picker.style.top = top + 'px'; picker.style.left = left + 'px';
}
async function addReaction(msgId, emoji) {
  if (!activeChatId || !currentUser) return;
  try {
    const col = activeGroupId ? 'groups' : 'chats', msgRef = doc(db, col, activeChatId, 'messages', msgId), msgSnap = await getDoc(msgRef); if (!msgSnap.exists()) return;
    const data = msgSnap.data(), reactions = data.reactions || {}, myReaction = reactions[currentUser.uid];
    if (myReaction === emoji) delete reactions[currentUser.uid]; else reactions[currentUser.uid] = emoji;
    await updateDoc(msgRef, { reactions }); if (navigator.vibrate) navigator.vibrate(20);
  } catch (e) {}
}
document.querySelectorAll('#reactionPicker button').forEach(btn => { btn.addEventListener('click', async (e) => { e.stopPropagation(); const emoji = btn.dataset.emoji; if (activeReactionMsg) await addReaction(activeReactionMsg.id, emoji); document.getElementById('reactionPicker').style.display = 'none'; activeReactionMsg = null; }); });
document.addEventListener('click', (e) => { const picker = document.getElementById('reactionPicker'); if (picker && picker.style.display !== 'none') { if (!picker.contains(e.target) && !e.target.closest('.msg-bubble')) { picker.style.display = 'none'; activeReactionMsg = null; } } });
document.addEventListener('click', async (e) => { const pill = e.target.closest('.msg-reaction-pill'); if (!pill) return; const row = pill.closest('.msg-row'); if (!row) return; const msgId = row.dataset.msgId, emoji = pill.dataset.emoji; if (msgId && emoji) await addReaction(msgId, emoji); });

function setupSwipeReply(row, msg) {
  if (msg.deleted) return; let startX = 0, startY = 0, isDragging = false, currentX = 0;
  const onStart = (e) => { const touch = e.touches ? e.touches[0] : e; startX = touch.clientX; startY = touch.clientY; isDragging = false; currentX = 0; };
  const onMove = (e) => { const touch = e.touches ? e.touches[0] : e, dx = touch.clientX - startX, dy = touch.clientY - startY; if (!isDragging) { if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.5 && dx > 0) { isDragging = true; row.classList.add('swiping'); } else return; } if (isDragging) { if (e.cancelable) e.preventDefault(); currentX = Math.min(dx, 80); row.style.transform = `translateX(${currentX}px)`; const icon = row.querySelector('.swipe-reply-icon'); if (icon) icon.style.opacity = currentX > 30 ? '1' : '0'; } };
  const onEnd = () => { if (!isDragging) return; row.classList.remove('swiping'); row.style.transition = 'transform 0.2s ease'; if (currentX > 50) { setChatReply(msg); if (navigator.vibrate) navigator.vibrate(15); } row.style.transform = 'translateX(0)'; currentX = 0; isDragging = false; const icon = row.querySelector('.swipe-reply-icon'); if (icon) icon.style.opacity = '0'; setTimeout(() => row.style.transition = '', 250); };
  let pressTimer = null; const onLongPress = (e) => { pressTimer = setTimeout(() => { showReactionPicker(msg, row.querySelector('.msg-bubble')); if (navigator.vibrate) navigator.vibrate(30); }, 500); }; const cancelPress = () => clearTimeout(pressTimer);
  row.addEventListener('touchstart', onStart, { passive: true }); row.addEventListener('touchmove', onMove, { passive: false }); row.addEventListener('touchend', onEnd); row.addEventListener('touchcancel', onEnd);
  row.addEventListener('mousedown', onStart); row.addEventListener('mousemove', (e) => { if (isDragging || e.buttons === 1) onMove(e); }); row.addEventListener('mouseup', onEnd); row.addEventListener('mouseleave', onEnd);
  row.addEventListener('touchstart', onLongPress, { passive: true }); row.addEventListener('touchend', cancelPress); row.addEventListener('touchmove', cancelPress); row.addEventListener('touchcancel', cancelPress);
  row.addEventListener('mousedown', onLongPress); row.addEventListener('mouseup', cancelPress); row.addEventListener('mouseleave', cancelPress);
}

function renderQuotedBlock(msg) { if (!msg.replyTo) return ''; return `<div class="msg-quoted" data-jump="${msg.replyTo.msgId || ''}"><div class="msg-quoted-content"><div class="msg-quoted-name">${escapeHtml(msg.replyTo.senderName || 'User')}</div><div class="msg-quoted-text">${escapeHtml((msg.replyTo.text || '').substring(0, 80))}</div></div></div>`; }
function renderReactions(msg) {
  const reactions = msg.reactions || {}, uids = Object.keys(reactions); if (uids.length === 0) return '';
  const grouped = {}; uids.forEach(uid => { const emoji = reactions[uid]; if (!grouped[emoji]) grouped[emoji] = []; grouped[emoji].push(uid); });
  const pills = Object.keys(grouped).map(emoji => { const users = grouped[emoji], isMine = users.includes(currentUser.uid); return `<div class="msg-reaction-pill ${isMine ? 'mine' : ''}" data-emoji="${emoji}"><span class="emoji">${emoji}</span>${users.length > 1 ? `<span class="count">${users.length}</span>` : ''}</div>`; }).join('');
  return `<div class="msg-reactions">${pills}</div>`;
}
function jumpToMessage(msgId) { const target = chatMessages.querySelector(`[data-msg-id="${msgId}"]`); if (!target) return; target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.classList.add('highlight'); setTimeout(() => target.classList.remove('highlight'), 1200); }

function getChatId(uid1, uid2) { return [uid1, uid2].sort().join('_'); }
async function openChatWindow(otherUser) {
  if (!otherUser || otherUser.uid === currentUser.uid) return;
  if ((currentProfile?.blockedUsers || []).includes(otherUser.uid)) { showToast('🚫 You blocked this user'); return; }
  if (otherUser.isPrivate) { const iFollowThem = currentProfile?.following?.includes(otherUser.uid); if (!iFollowThem) { showToast('🔒 This user is private. Follow to chat.'); return; } }
  if (chatMessagesUnsub) { try { chatMessagesUnsub(); } catch (e) {} chatMessagesUnsub = null; }
  removePinnedBanner(); stopVoicePlayback();
  activeChatId = getChatId(currentUser.uid, otherUser.uid); activeChatUser = otherUser; activeGroupId = null; activeGroupData = null;
  chatHeaderAvatar.src = otherUser.photo || defaultAvatar(otherUser.name); chatHeaderName.innerHTML = `${escapeHtml(otherUser.name || 'User')}${verifiedBadgeHTML(otherUser.verified, otherUser.verifiedUntil)}`; chatHeaderHandle.textContent = '@' + (otherUser.user || '');
  chatHeaderInfo.onclick = () => { closeChatWindow(); openUserProfile(otherUser.uid); };
  chatMessages.innerHTML = `<div class="empty-msg">Loading messages...</div>`; chatMessageInput.value = ''; updateSendTextBtn(); chatWindowModal.classList.add('show'); chatMessages.classList.add('wallpaper-1'); clearChatReply();
  await loadChatMessages(); setupTypingListener();
}
function closeChatWindow() {
  chatWindowModal.classList.remove('show'); clearChatReply(); clearTypingSignal();
  if (typingListenerUnsub) { try { typingListenerUnsub(); } catch (e) {} typingListenerUnsub = null; }
  const picker = document.getElementById('reactionPicker'); if (picker) picker.style.display = 'none'; activeReactionMsg = null;
  if (chatMessagesUnsub) { try { chatMessagesUnsub(); } catch (e) {} chatMessagesUnsub = null; }
  removePinnedBanner(); document.querySelectorAll('.msg-actions-menu, .edit-msg-modal').forEach(el => el.remove());
  activeChatId = null; activeChatUser = null; activeGroupId = null; activeGroupData = null; pinnedMessage = null;
  _readProcessed.clear(); _deliveredProcessed.clear(); stopVoicePlayback();
}
document.getElementById('closeChatWindow')?.addEventListener('click', closeChatWindow);

async function openGroupChatWindow(group) {
  if (!group || !group.members.includes(currentUser.uid)) return;
  if (chatMessagesUnsub) { try { chatMessagesUnsub(); } catch (e) {} chatMessagesUnsub = null; }
  removePinnedBanner(); stopVoicePlayback();
  activeGroupId = group.id; activeGroupData = group; activeChatId = group.id; activeChatUser = null;
  chatHeaderAvatar.src = group.photo || defaultGroupAvatar(group.name); chatHeaderName.textContent = group.name || 'Group'; chatHeaderHandle.textContent = group.members.length + ' members';
  chatHeaderInfo.onclick = () => showGroupInfo(group);
  chatMessages.innerHTML = `<div class="empty-msg">Loading messages...</div>`; chatMessageInput.value = ''; updateSendTextBtn(); chatWindowModal.classList.add('show'); chatMessages.classList.add('wallpaper-1'); clearChatReply();
  await loadGroupMessages(); await markGroupRead(); setupTypingListener();
}
async function loadGroupMessages() {
  if (!activeGroupId) return; if (chatMessagesUnsub) { try { chatMessagesUnsub(); } catch (e) {} chatMessagesUnsub = null; }
  let isFirstSnapshot = true;
  try {
    const msgsRef = collection(db, 'groups', activeGroupId, 'messages');
    chatMessagesUnsub = onSnapshot(msgsRef, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      messages.sort((a, b) => { const ta = a.time?.toDate?.()?.getTime?.() || (a.time?.seconds ? a.time.seconds * 1000 : 0), tb = b.time?.toDate?.()?.getTime?.() || (b.time?.seconds ? b.time.seconds * 1000 : 0); return ta - tb; });
      if (!isFirstSnapshot && currentUser) { const newFromOther = messages.some(m => !_seenGroupMsgIds.has(m.id) && m.from !== currentUser.uid && !m.deleted); if (newFromOther) playReceiveSound(); }
      messages.forEach(m => _seenGroupMsgIds.add(m.id)); _trimSet(_seenGroupMsgIds); isFirstSnapshot = false;
      paintGroupMessages(messages); markGroupMessagesAsRead();
    }, (err) => console.warn('Group listener error:', err));
    await loadPinnedMessage();
  } catch (e) {}
}
function paintGroupMessages(messages) {
  if (messages.length === 0) { chatMessages.innerHTML = `<div class="chat-empty">No messages yet<br>Say hi! 👋</div>`; return; }
  const prevScrollTop = chatMessages.scrollTop, prevScrollHeight = chatMessages.scrollHeight, wasAtBottom = prevScrollHeight - prevScrollTop - chatMessages.clientHeight < 150;
  chatMessages.innerHTML = ''; let lastDateStr = '';
  messages.forEach(msg => { const msgDate = msg.time?.toDate?.(), dateStr = msgDate ? formatDate(msgDate) : ''; if (dateStr && dateStr !== lastDateStr) { const sep = document.createElement('div'); sep.className = 'msg-date-sep'; sep.textContent = dateStr; chatMessages.appendChild(sep); lastDateStr = dateStr; } chatMessages.appendChild(makeGroupMessageBubble(msg)); });
  requestAnimationFrame(() => { if (wasAtBottom) chatMessages.scrollTop = chatMessages.scrollHeight; else { const newScrollHeight = chatMessages.scrollHeight, diff = newScrollHeight - prevScrollHeight; chatMessages.scrollTop = prevScrollTop + diff; } });
}
function makeGroupMessageBubble(msg) {
  const row = document.createElement('div'), isMe = msg.from === currentUser.uid; row.className = 'msg-row ' + (isMe ? 'me' : 'other'); row.dataset.msgId = msg.id;
  const time = msg.time?.toDate?.(), timeStr = time ? formatTime(time) : '', senderName = !isMe ? `<div class="msg-sender-name">${escapeHtml(msg.fromName || 'User')}${verifiedBadgeHTML(msg.fromVerified, msg.fromVerifiedUntil)}</div>` : '';
  const swipeIcon = !isMe ? `<div class="swipe-reply-icon"><svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg></div>` : '';
  if (msg.deleted) { row.innerHTML = `${swipeIcon}<div class="msg-bubble deleted"><div class="deleted-text">🚫 This message was deleted</div></div>${isMe ? buildDotsButton(msg) : ''}`; if (isMe) attachDotsButton(row, msg); return row; }
  if (msg.type === 'file') {
    const fileName = msg.fileName || 'File', fileType = msg.fileType || ''; let fileIcon = '📎'; if (fileType.startsWith('image/')) fileIcon = '🖼️'; else if (fileType.startsWith('video/')) fileIcon = '🎬'; else if (fileType === 'application/pdf') fileIcon = '📄';
    row.innerHTML = `${swipeIcon}${isMe ? buildDotsButton(msg) : ''}<div class="msg-bubble file-bubble" data-msg="${msg.id}">${senderName}${renderQuotedBlock(msg)}<a href="${msg.fileUrl}" target="_blank" rel="noopener" class="file-download-wrap" download="${escapeHtml(fileName)}"><div class="file-icon">${fileIcon}</div><div class="file-info"><div class="file-name">${escapeHtml(fileName)}</div><div class="file-size">${formatFileSize(msg.fileSize || 0)} · Tap to open</div></div></a><div class="msg-time">${timeStr}</div></div>${!isMe ? buildDotsButton(msg) : ''}${renderReactions(msg)}`;
    if (isMe) attachDotsButton(row, msg); attachMsgEvents(row, msg); return row;
  }
  if (msg.type === 'voice') {
    const duration = msg.voiceDuration || 0, bars = [], voiceSrc = msg.voiceUrl || msg.voiceData; for (let i = 0; i < 22; i++) bars.push(30 + Math.floor(Math.random() * 70));
    row.innerHTML = `${swipeIcon}${isMe ? buildDotsButton(msg) : ''}<div class="msg-bubble voice-bubble" data-msg="${msg.id}">${senderName}${renderQuotedBlock(msg)}<button class="voice-play-btn" data-play="${msg.id}"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg></button><div class="voice-waveform">${bars.map(h => `<div class="bar" style="height:${h}%"></div>`).join('')}</div><div class="voice-duration">${formatVoiceDuration(duration)}</div><div class="msg-time">${timeStr}</div></div>${!isMe ? buildDotsButton(msg) : ''}${renderReactions(msg)}`;
    const playBtn = row.querySelector('.voice-play-btn'); if (playBtn) playBtn.addEventListener('click', async (e) => { e.stopPropagation(); await playVoiceMessage({ ...msg, voiceData: voiceSrc }, row.querySelector('.voice-waveform'), playBtn); });
    if (isMe) attachDotsButton(row, msg); attachMsgEvents(row, msg); return row;
  }
  const editedLabel = msg.edited ? '<span class="edited-label">(edited)</span>' : '';
  row.innerHTML = `${swipeIcon}${isMe ? buildDotsButton(msg) : ''}<div class="msg-bubble" data-msg="${msg.id}">${senderName}${renderQuotedBlock(msg)}<div class="msg-text">${escapeHtml(msg.text || '')}${editedLabel}</div><div class="msg-time">${timeStr}</div></div>${!isMe ? buildDotsButton(msg) : ''}${renderReactions(msg)}`;
  if (isMe) attachDotsButton(row, msg); attachMsgEvents(row, msg); return row;
}
async function markGroupMessagesAsRead() { if (!currentUser || !activeGroupId) return; try { await updateDoc(doc(db, 'groups', activeGroupId), { unreadBy: arrayRemove(currentUser.uid) }); } catch (e) {} }
async function markGroupRead() { if (!activeGroupId) return; try { await updateDoc(doc(db, 'groups', activeGroupId), { unreadBy: arrayRemove(currentUser.uid) }); checkChatsUnread(); } catch (e) {} }

async function sendGroupMessage(msgData) {
  if (!activeGroupId) return;
  const message = { from: currentUser.uid, fromName: currentProfile?.name || 'User', fromPhoto: currentProfile?.photo || '', fromVerified: currentProfile?.verified || false, fromVerifiedUntil: currentProfile?.verifiedUntil || null, type: msgData.type || 'text', text: msgData.text || null, voiceData: msgData.voiceData || null, voiceUrl: msgData.voiceUrl || null, voiceDuration: msgData.voiceDuration || null, fileName: msgData.fileName || null, fileUrl: msgData.fileUrl || null, fileType: msgData.fileType || null, fileSize: msgData.fileSize || null, replyTo: msgData.replyTo ?? chatReplyTo, time: serverTimestamp() };
  try {
    await addDoc(collection(db, 'groups', activeGroupId, 'messages'), message); playSendSound();
    const otherMembers = (activeGroupData?.members || []).filter(m => m !== currentUser.uid);
    await updateDoc(doc(db, 'groups', activeGroupId), { lastMessage: msgData.type === 'voice' ? '🎤 Voice message' : (msgData.type === 'file' ? '📎 ' + (msgData.fileName || 'File') : (msgData.text || '')), lastMessageType: msgData.type || 'text', lastFileName: msgData.fileName || '', lastMessageTime: serverTimestamp(), lastMessageBy: currentUser.uid, unreadBy: otherMembers });
    if (!typingListenerUnsub) setupTypingListener();
  } catch (e) { showToast('❌ Could not send'); }
}
async function sendMessage(msgData) {
  if (!activeChatId || !activeChatUser) return;
  const message = { from: currentUser.uid, to: activeChatUser.uid, type: msgData.type || 'text', text: msgData.text || null, voiceData: msgData.voiceData || null, voiceUrl: msgData.voiceUrl || null, voiceDuration: msgData.voiceDuration || null, fileName: msgData.fileName || null, fileUrl: msgData.fileUrl || null, fileType: msgData.fileType || null, fileSize: msgData.fileSize || null, replyTo: msgData.replyTo ?? chatReplyTo, delivered: false, read: false, deleted: false, edited: false, time: serverTimestamp() };
  try {
    const settings = typeof getSettings === 'function' ? getSettings() : { vibration: true }; if (settings.vibration && navigator.vibrate) navigator.vibrate(30);
    await addDoc(collection(db, 'chats', activeChatId, 'messages'), message); playSendSound();
    const chatRef = doc(db, 'chats', activeChatId), chatSnap = await getDoc(chatRef);
    const chatData = { members: [currentUser.uid, activeChatUser.uid], lastMessage: msgData.type === 'voice' ? '🎤 Voice message' : (msgData.type === 'file' ? '📎 ' + (msgData.fileName || 'File') : (msgData.text || '')), lastMessageType: msgData.type || 'text', lastMessageTime: serverTimestamp(), lastMessageBy: currentUser.uid, unreadBy: [activeChatUser.uid] };
    if (!chatSnap.exists()) { chatData.createdAt = serverTimestamp(); await setDoc(chatRef, chatData); } else await updateDoc(chatRef, chatData);
    if (!typingListenerUnsub) setupTypingListener();
    const s = typeof getSettings === 'function' ? getSettings() : { notifMessages: true, pushNotif: true };
    if (s.pushNotif && s.notifMessages) { try { await addDoc(collection(db, 'notifications'), { userId: activeChatUser.uid, type: 'message', title: '💬 New Message', message: `${currentProfile?.name || 'Someone'}: ${(msgData.text || 'Sent you a message').substring(0, 50)}`, fromUserId: currentUser.uid, chatId: activeChatId, read: false, createdAt: serverTimestamp() }); } catch (e) {} }
  } catch (e) { showToast('❌ Could not send'); }
}

async function loadChatMessages() {
  if (!activeChatId) return; if (chatMessagesUnsub) { try { chatMessagesUnsub(); } catch (e) {} chatMessagesUnsub = null; }
  let isFirstSnapshot = true;
  try {
    const msgsRef = collection(db, 'chats', activeChatId, 'messages');
    chatMessagesUnsub = onSnapshot(msgsRef, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      messages.sort((a, b) => { const ta = a.time?.toDate?.()?.getTime?.() || (a.time?.seconds ? a.time.seconds * 1000 : 0), tb = b.time?.toDate?.()?.getTime?.() || (b.time?.seconds ? b.time.seconds * 1000 : 0); return ta - tb; });
      if (!isFirstSnapshot && currentUser) { const newFromOther = messages.some(m => !_seenDmMsgIds.has(m.id) && m.from !== currentUser.uid && !m.deleted); if (newFromOther) playReceiveSound(); }
      messages.forEach(m => _seenDmMsgIds.add(m.id)); _trimSet(_seenDmMsgIds); isFirstSnapshot = false;
      paintChatMessages(messages); markMessagesAsRead(messages);
    }, (err) => console.warn('Chat listener error:', err));
    await loadPinnedMessage();
  } catch (e) { chatMessages.innerHTML = `<div class="chat-empty">Could not load messages</div>`; }
}
function paintChatMessages(messages) {
  if (messages.length === 0) { chatMessages.innerHTML = `<div class="chat-empty">No messages yet<br>Say hi! 👋</div>`; return; }
  const prevScrollTop = chatMessages.scrollTop, prevScrollHeight = chatMessages.scrollHeight, wasAtBottom = prevScrollHeight - prevScrollTop - chatMessages.clientHeight < 150;
  chatMessages.innerHTML = ''; let lastDateStr = '';
  messages.forEach(msg => { const msgDate = msg.time?.toDate?.(), dateStr = msgDate ? formatDate(msgDate) : ''; if (dateStr && dateStr !== lastDateStr) { const sep = document.createElement('div'); sep.className = 'msg-date-sep'; sep.textContent = dateStr; chatMessages.appendChild(sep); lastDateStr = dateStr; } chatMessages.appendChild(makeMessageBubble(msg)); });
  requestAnimationFrame(() => { if (wasAtBottom) chatMessages.scrollTop = chatMessages.scrollHeight; else { const newScrollHeight = chatMessages.scrollHeight, diff = newScrollHeight - prevScrollHeight; chatMessages.scrollTop = prevScrollTop + diff; } });
}
function makeMessageBubble(msg) {
  const row = document.createElement('div'), isMe = msg.from === currentUser.uid; row.className = 'msg-row ' + (isMe ? 'me' : 'other'); row.dataset.msgId = msg.id;
  const time = msg.time?.toDate?.(), timeStr = time ? formatTime(time) : '', swipeIcon = !isMe ? `<div class="swipe-reply-icon"><svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg></div>` : '';
  if (msg.deleted) { row.innerHTML = `${swipeIcon}<div class="msg-bubble deleted"><div class="deleted-text">🚫 This message was deleted</div></div>${isMe ? buildDotsButton(msg) : ''}`; if (isMe) attachDotsButton(row, msg); return row; }
  if (msg.type === 'file') {
    const fileName = msg.fileName || 'File', fileType = msg.fileType || ''; let fileIcon = '📎'; if (fileType.startsWith('image/')) fileIcon = '🖼️'; else if (fileType.startsWith('video/')) fileIcon = '🎬'; else if (fileType === 'application/pdf') fileIcon = '📄';
    row.innerHTML = `${swipeIcon}${isMe ? buildDotsButton(msg) : ''}<div class="msg-bubble file-bubble" data-msg="${msg.id}">${renderQuotedBlock(msg)}<a href="${msg.fileUrl}" target="_blank" rel="noopener" class="file-download-wrap" download="${escapeHtml(fileName)}"><div class="file-icon">${fileIcon}</div><div class="file-info"><div class="file-name">${escapeHtml(fileName)}</div><div class="file-size">${formatFileSize(msg.fileSize || 0)} · Tap to open</div></div></a><div class="msg-time">${timeStr}${isMe ? buildTicksHTML(msg) : ''}</div></div>${!isMe ? buildDotsButton(msg) : ''}${renderReactions(msg)}`;
    if (isMe) attachDotsButton(row, msg); attachMsgEvents(row, msg); return row;
  }
  if (msg.type === 'voice') {
    const duration = msg.voiceDuration || 0, bars = [], voiceSrc = msg.voiceUrl || msg.voiceData; for (let i = 0; i < 22; i++) bars.push(30 + Math.floor(Math.random() * 70));
    row.innerHTML = `${swipeIcon}${isMe ? buildDotsButton(msg) : ''}<div class="msg-bubble voice-bubble" data-msg="${msg.id}">${renderQuotedBlock(msg)}<button class="voice-play-btn" data-play="${msg.id}"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg></button><div class="voice-waveform">${bars.map(h => `<div class="bar" style="height:${h}%"></div>`).join('')}</div><div class="voice-duration">${formatVoiceDuration(duration)}</div><div class="msg-time">${timeStr}${isMe ? buildTicksHTML(msg) : ''}</div></div>${!isMe ? buildDotsButton(msg) : ''}${renderReactions(msg)}`;
    const playBtn = row.querySelector('.voice-play-btn'); if (playBtn) playBtn.addEventListener('click', async (e) => { e.stopPropagation(); await playVoiceMessage({ ...msg, voiceData: voiceSrc }, row.querySelector('.voice-waveform'), playBtn); });
    if (isMe) attachDotsButton(row, msg); attachMsgEvents(row, msg); return row;
  }
  const editedLabel = msg.edited ? '<span class="edited-label">(edited)</span>' : '';
  row.innerHTML = `${swipeIcon}${isMe ? buildDotsButton(msg) : ''}<div class="msg-bubble" data-msg="${msg.id}">${renderQuotedBlock(msg)}<div class="msg-text">${escapeHtml(msg.text || '')}${editedLabel}</div><div class="msg-time">${timeStr}${isMe ? buildTicksHTML(msg) : ''}</div></div>${!isMe ? buildDotsButton(msg) : ''}${renderReactions(msg)}`;
  if (isMe) attachDotsButton(row, msg); attachMsgEvents(row, msg); return row;
}
function attachMsgEvents(row, msg) {
  setupSwipeReply(row, msg);
  const bubble = row.querySelector('.msg-bubble');
  if (bubble) {
    let lastTap = 0;
    bubble.addEventListener('click', (e) => { if (e.target.closest('.msg-quoted') || e.target.closest('.file-download-wrap') || e.target.closest('.voice-play-btn') || e.target.closest('.msg-reaction-pill') || e.target.closest('.msg-dots-btn')) return; const now = Date.now(); if (now - lastTap < 300) { lastTap = 0; addReaction(msg.id, '❤️'); if (navigator.vibrate) navigator.vibrate(30); } else lastTap = now; });
  }
  const quoted = row.querySelector('.msg-quoted'); if (quoted) quoted.addEventListener('click', (e) => { e.stopPropagation(); const jumpId = quoted.dataset.jump; if (jumpId) jumpToMessage(jumpId); });
}
function buildDotsButton(msg) { return `<button class="msg-dots-btn" data-msg="${msg.id}" title="Options"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg></button>`; }
function attachDotsButton(row, msg) { const dotsBtn = row.querySelector('.msg-dots-btn'); if (!dotsBtn) return; dotsBtn.addEventListener('click', (e) => { e.stopPropagation(); showMessageActionsMenu(dotsBtn, msg); }); }
function showMessageActionsMenu(anchorEl, msg) {
  document.querySelectorAll('.msg-actions-menu').forEach(el => el.remove()); const menu = document.createElement('div'); menu.className = 'msg-actions-menu'; const isPinned = pinnedMessage?.id === msg.id;
  let menuHTML = '';
  if (msg.type === 'text' && !msg.deleted) menuHTML += `<button data-action="edit"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>`;
  if (msg.type === 'text' && !msg.deleted && msg.text) menuHTML += `<button data-action="reply"><svg viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>Reply</button><button data-action="copy"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</button>`;
  if (!msg.deleted) menuHTML += `<button data-action="pin"><svg viewBox="0 0 24 24"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-1.5-7.5L19 5l-7 1-7-1 1.5 4.5z"/></svg>${isPinned ? 'Unpin' : 'Pin'}</button>`;
  menuHTML += `<div class="menu-divider"></div><button data-action="delete" class="danger"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>Delete</button>`;
  menu.innerHTML = menuHTML; document.body.appendChild(menu);
  const rect = anchorEl.getBoundingClientRect(), menuRect = menu.getBoundingClientRect(); let top = rect.bottom + 5, left = rect.left - menuRect.width + rect.width; if (left < 10) left = 10; if (left + menuRect.width > window.innerWidth - 10) left = window.innerWidth - menuRect.width - 10; if (top + menuRect.height > window.innerHeight - 10) top = rect.top - menuRect.height - 5; menu.style.top = top + 'px'; menu.style.left = left + 'px';
  menu.querySelectorAll('button[data-action]').forEach(btn => { btn.addEventListener('click', async (e) => { e.stopPropagation(); const action = btn.dataset.action; menu.remove(); if (action === 'edit') await openEditMessageModal(msg); else if (action === 'reply') setChatReply(msg); else if (action === 'copy') await copyMessageText(msg); else if (action === 'pin') await togglePinMessage(msg); else if (action === 'delete') { const settings = typeof getSettings === 'function' ? getSettings() : { confirmDelete: true }; if (!settings.confirmDelete || confirm('Delete this message?')) await deleteMessage(msg.id); } }); });
  setTimeout(() => { const closeMenu = (ev) => { if (!menu.contains(ev.target) && ev.target !== anchorEl) { menu.remove(); document.removeEventListener('click', closeMenu); document.removeEventListener('touchstart', closeMenu); } }; document.addEventListener('click', closeMenu); document.addEventListener('touchstart', closeMenu); }, 100);
}
async function openEditMessageModal(msg) {
  document.querySelectorAll('.edit-msg-modal').forEach(el => el.remove());
  const modal = document.createElement('div'); modal.className = 'edit-msg-modal';
  modal.innerHTML = `<div class="edit-msg-box"><h3>✏️ Edit Message</h3><textarea id="editMsgText" maxlength="1000">${escapeHtml((msg.text || '').substring(0, 1000))}</textarea><div class="edit-msg-actions"><button class="cancel-btn" id="cancelEditBtn">Cancel</button><button class="save-btn" id="saveEditBtn">Save</button></div></div>`;
  document.body.appendChild(modal); const textarea = modal.querySelector('#editMsgText'); textarea.focus(); textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  modal.querySelector('#cancelEditBtn').addEventListener('click', () => modal.remove()); modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  modal.querySelector('#saveEditBtn').addEventListener('click', async () => { const newText = textarea.value.trim(); if (!newText) { showToast('❌ Cannot be empty'); return; } if (newText === msg.text) { modal.remove(); return; } await editMessage(msg.id, newText); modal.remove(); });
}
async function editMessage(msgId, newText) { if (!activeChatId || !currentUser) return; try { const col = activeGroupId ? 'groups' : 'chats'; await updateDoc(doc(db, col, activeChatId, 'messages', msgId), { text: newText, edited: true, editedAt: serverTimestamp() }); showToast('✏️ Edited'); } catch (e) { showToast('❌ Could not edit'); } }
async function copyMessageText(msg) { if (!msg.text) return; try { await navigator.clipboard.writeText(msg.text); showToast('📋 Copied'); } catch (e) { showToast('❌ Failed to copy'); } }
function buildTicksHTML(msg) { if (msg.from !== currentUser.uid) return ''; const settings = typeof getSettings === 'function' ? getSettings() : { readReceipts: true }; if (settings.readReceipts === false) return ''; if (msg.read) return `<span class="msg-ticks read"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>`; if (msg.delivered) return `<span class="msg-ticks delivered"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>`; return `<span class="msg-ticks sent"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>`; }
async function markMessagesAsRead(messages) {
  if (!currentUser || !activeChatId || activeGroupId) return;
  try {
    const unreadFromOther = messages.filter(m => m.to === currentUser.uid && !m.read && !m.deleted && !_readProcessed.has(m.id)).slice(0, 20);
    const undeliveredFromMe = messages.filter(m => m.from === currentUser.uid && !m.delivered && !m.deleted && !_deliveredProcessed.has(m.id)).slice(0, 20);
    if (unreadFromOther.length === 0 && undeliveredFromMe.length === 0) return;
    const updates = [];
    for (const msg of unreadFromOther) { _readProcessed.add(msg.id); updates.push(updateDoc(doc(db, 'chats', activeChatId, 'messages', msg.id), { read: true, readAt: serverTimestamp() }).catch(() => { _readProcessed.delete(msg.id); })); }
    for (const msg of undeliveredFromMe) { _deliveredProcessed.add(msg.id); updates.push(updateDoc(doc(db, 'chats', activeChatId, 'messages', msg.id), { delivered: true }).catch(() => { _deliveredProcessed.delete(msg.id); })); }
    await Promise.all(updates);
  } catch (e) {}
}
async function deleteMessage(msgId) { if (!activeChatId) return; try { const col = activeGroupId ? 'groups' : 'chats'; await updateDoc(doc(db, col, activeChatId, 'messages', msgId), { deleted: true, deletedAt: serverTimestamp(), text: null, voiceData: null, voiceUrl: null, fileUrl: null }); showToast('🗑️ Deleted'); } catch (e) { showToast('❌ Failed to delete'); } }

async function togglePinMessage(msg) {
  if (!activeChatId) return;
  try {
    const col = activeGroupId ? 'groups' : 'chats', ref = doc(db, col, activeChatId), snap = await getDoc(ref); if (!snap.exists()) return;
    const currentPin = snap.data().pinnedMessage || null;
    if (currentPin === msg.id) { await updateDoc(ref, { pinnedMessage: null }); pinnedMessage = null; showToast('Unpinned'); } else { await updateDoc(ref, { pinnedMessage: msg.id }); pinnedMessage = msg; showToast('📌 Pinned'); }
    await loadPinnedMessage();
  } catch (e) {}
}
async function loadPinnedMessage() {
  if (!activeChatId) return;
  try { const col = activeGroupId ? 'groups' : 'chats', ref = doc(db, col, activeChatId), snap = await getDoc(ref); if (!snap.exists()) { pinnedMessage = null; removePinnedBanner(); return; } const pinId = snap.data().pinnedMessage; if (!pinId) { pinnedMessage = null; removePinnedBanner(); return; } const msgSnap = await getDoc(doc(db, col, activeChatId, 'messages', pinId)); if (!msgSnap.exists()) { pinnedMessage = null; removePinnedBanner(); return; } pinnedMessage = { id: pinId, ...msgSnap.data() }; renderPinnedBanner(pinnedMessage); } catch (e) {}
}
function renderPinnedBanner(msg) {
  removePinnedBanner(); const chatWindow = document.getElementById('chatWindow'); if (!chatWindow) return;
  const banner = document.createElement('div'); banner.className = 'pinned-banner'; banner.id = 'pinnedBanner';
  const previewText = msg.deleted ? '🚫 Deleted' : (msg.type === 'voice' ? '🎤 Voice' : (msg.type === 'file' ? '📎 ' + (msg.fileName || 'File') : (msg.text || '')));
  banner.innerHTML = `<svg viewBox="0 0 24 24"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-1.5-7.5L19 5l-7 1-7-1 1.5 4.5z"/></svg><div class="pin-text"><b>📌 Pinned</b>${escapeHtml(previewText).substring(0, 60)}</div><button class="pin-close" id="unpinBtn">✕</button>`;
  const chatHeader = chatWindow.querySelector('.chat-header'); if (chatHeader) chatHeader.insertAdjacentElement('afterend', banner);
  chatMessages.classList.add('has-pinned');
  banner.querySelector('#unpinBtn').addEventListener('click', async () => { const col = activeGroupId ? 'groups' : 'chats'; try { await updateDoc(doc(db, col, activeChatId), { pinnedMessage: null }); pinnedMessage = null; removePinnedBanner(); showToast('Unpinned'); } catch (e) {} });
}
function removePinnedBanner() { document.getElementById('pinnedBanner')?.remove(); chatMessages.classList.remove('has-pinned'); }

function updateSendTextBtn() { const hasText = chatMessageInput.value.trim().length > 0; sendTextBtn