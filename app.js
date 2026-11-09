/* ============================================================
   ReelHub — app.js (PART 1/5) — FULL FIXED v9
   ============================================================ */

import {
  auth, db,
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc,
  serverTimestamp, arrayUnion, arrayRemove,
  limit, writeBatch, onSnapshot, increment,
  signOut, EmailAuthProvider, reauthenticateWithCredential
} from './firebase-config.js';

/* ============================================================
   CONSTANTS & DOM SHORTCUTS
   ============================================================ */
const CLOUDINARY_ACCOUNTS = {
  videos: { cloudName: "s3eresx6", apiKey: "349223397331644", preset: "reelhub_video" },
  stories: { cloudName: "fepzqr9t", apiKey: "287332161532267", preset: "reelhub_story" }
};

function $id(id) { return document.getElementById(id); }

const authScreen = $id('auth');
const loadingScreen = $id('loadingScreen');
const appScreen = $id('app');
const content = $id('content');
const playerModal = $id('playerModal'), playerTitle = $id('playerTitle'), playerContent = $id('playerContent');

/* ============================================================
   GLOBAL STATE
   ============================================================ */
let currentUser = null;
let currentProfile = null;
let viewedPostsSession = new Set();
let appInitialized = false;

// Part 2, 3, 4, 5 ke liye baaki state variables
let activeCommentPostId = null;
let activeReplyTo = null;
let activeChatId = null;
let activeChatUser = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */
function safeNum(v) { const n = Number(v); return isNaN(n) || !isFinite(n) ? 0 : n; }
function safeArray(v) { return Array.isArray(v) ? v : []; }
function escapeHtml(str) { if (str === null || str === undefined) return ''; return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function defaultAvatar(name) { const letter = (name || '?').trim().charAt(0).toUpperCase().replace(/[<>&"']/g, '') || '?'; const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1e1e28"/><text x="50" y="50" font-size="44" font-family="sans-serif" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${letter}</text></svg>`; return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg); }

function showToast(message, duration = 2500) { 
  const existing = document.getElementById('toast'); 
  if (existing) existing.remove(); 
  const toast = document.createElement('div'); 
  toast.id = 'toast'; 
  toast.textContent = message; 
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#fff;color:#000;padding:10px 20px;border-radius:20px;font-size:14px;font-weight:bold;z-index:99999;box-shadow:0 4px 10px rgba(0,0,0,0.5);'; 
  document.body.appendChild(toast); 
  setTimeout(() => { toast.remove(); }, duration); 
}

/* ============================================================
   SCREEN SWITCHING (Forceful with !important)
   ============================================================ */
function showAuth() {
  if (loadingScreen) loadingScreen.style.setProperty('display', 'none', 'important');
  if (authScreen) { authScreen.classList.add('show'); authScreen.style.setProperty('display', 'block', 'important'); }
  if (appScreen) { appScreen.classList.remove('show'); appScreen.style.setProperty('display', 'none', 'important'); }
}

function showApp() {
  if (loadingScreen) loadingScreen.style.setProperty('display', 'none', 'important');
  if (authScreen) { authScreen.classList.remove('show'); authScreen.style.setProperty('display', 'none', 'important'); }
  if (appScreen) { appScreen.classList.add('show'); appScreen.style.setProperty('display', 'flex', 'important'); }
}

function setActiveNav(page) { 
  document.querySelectorAll('.nav-item').forEach(i => { 
    i.classList.toggle('active', i.dataset.page === page); 
    i.style.color = i.dataset.page === page ? '#fff' : '#888';
  }); 
}

/* ============================================================
   🚀 AUTH BRIDGE (Connects auth.js to app.js)
   ============================================================ */
function startApp(user, profile) {
  if (appInitialized) return;
  appInitialized = true;

  currentUser = user;
  currentProfile = profile;
  
  if (window.appState) {
    window.appState.currentUser = user;
    window.appState.currentProfile = profile;
  }

  console.log("App starting for:", user.email);
  showApp();
  setActiveNav('home');
  renderPage('home'); // Ye function Part 2 me banega
}

// Listen to auth.js signals
window.addEventListener('auth:login', (e) => {
  console.log("✅ auth:login received");
  startApp(e.detail.user, e.detail.profile);
});

window.addEventListener('auth:logout', () => {
  console.log("✅ auth:logout received");
  appInitialized = false;
  currentUser = null;
  currentProfile = null;
  showAuth();
});

window.addEventListener('auth:error', (e) => {
  showToast('❌ ' + e.detail);
  showAuth();
});

// Fallback: Agar auth.js response na de, toh 2.5s baad login screen dikhao
setTimeout(() => {
  if (window.appState && window.appState.ready) {
    if (window.appState.currentUser) {
      startApp(window.appState.currentUser, window.appState.currentProfile);
    } else {
      showAuth();
    }
  } else {
    showAuth();
  }
}, 2500);

/* ============================================================
   PAGE ROUTER & NAVIGATION
   ============================================================ */
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    setActiveNav(page);
    renderPage(page);
  });
});

document.querySelector('.nav-plus')?.addEventListener('click', () => {
  openUploadModal(); // Ye Part 2 me banega
});

function renderPage(page) {
  if (!currentUser) return; // Guard: Don't render if not logged in
  
  if (page === 'home') renderHomeFeed();
  else if (page === 'shorts') renderShortsFeed();
  else if (page === 'chats') renderChatsPage();
  else if (page === 'profile') renderProfile();
}

// Header buttons
$id('searchBtn')?.addEventListener('click', () => { setActiveNav(''); renderPage('search'); });
$id('notifBtn')?.addEventListener('click', () => { setActiveNav(''); renderPage('notifications'); });
$id('settingsBtn')?.addEventListener('click', () => { setActiveNav(''); renderPage('settings'); });

// Player close listener
document.getElementById('closePlayer')?.addEventListener('click', () => {
  if (playerModal) playerModal.style.setProperty('display', 'none', 'important');
  if (playerContent) playerContent.innerHTML = '';
});

console.log('✅ Part 1 loaded (App Router + State + Auth Bridge)');
/* ============================================================
   ReelHub — app.js (PART 2/5) — HOME FEED & UPLOAD
   ============================================================ */

/* ============================================================
   FORMATTING HELPERS
   ============================================================ */
function formatViews(count) {
  const n = safeNum(count);
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}

function timeAgoShort(date) {
  if (!date) return 'now';
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

/* ============================================================
   HOME FEED RENDERER
   ============================================================ */
async function renderHomeFeed() {
  if (!content) return;

  // 1. Render Basic Structure (Stories, Games, Shorts Placeholder, Feed)
  content.innerHTML = `
    <div class="home-feed">
      
      <!-- STORIES -->
      <div class="stories-wrap">
        <div class="story add" id="addStoryBtn">
          <div class="story-ring"><span>+</span></div>
          <p style="color:white;">Your story</p>
        </div>
        <!-- Fake stories for design (Will be replaced by real data later) -->
        <div class="story">
          <div class="story-ring"><img src="https://ui-avatars.com/api/?name=Founder&background=random" alt=""></div>
          <p>Founder</p>
        </div>
      </div>

      <!-- GAMES SHELF -->
      ${buildGamesShelfHTML()}

      <!-- SHORTS SHELF (Will be populated by JS) -->
      <div class="shelf-header">
        <div class="shelf-title">🔥 Shorts</div>
        <div class="shelf-more" onclick="renderPage('shorts')">View all ></div>
      </div>
      <div class="shorts-scroll" id="shortsShelfContainer">
        <!-- Shorts will load here -->
      </div>

      <!-- REGULAR FEED POSTS -->
      <div class="feed-container" id="feedContainer">
        <div style="text-align:center; padding:20px; color:#888;">Loading feed...</div>
      </div>

    </div>
  `;

  // Add event listener to plus button for story
  document.getElementById('addStoryBtn')?.addEventListener('click', () => {
    showToast('Story upload coming in Part 3!');
  });

  // 2. Fetch Real Data from Firebase
  await loadHomeFeedPosts();
}

/* ============================================================
   GAMES SHELF (Hardcoded UI)
   ============================================================ */
function buildGamesShelfHTML() {
  return `
    <div class="shelf-header">
      <div class="shelf-title">🎮 Games</div>
      <div class="shelf-more">View all ></div>
    </div>
    <div class="games-scroll">
      <div class="game-card">
        <div class="game-icon" style="background:#3b82f6;">🧱</div>
        <div class="game-name">Breaker</div>
      </div>
      <div class="game-card">
        <div class="game-icon" style="background:#eab308;">🎴</div>
        <div class="game-name">Memory</div>
      </div>
      <div class="game-card">
        <div class="game-icon" style="background:#a855f7;">🚀</div>
        <div class="game-name">Shooter</div>
      </div>
      <div class="game-card">
        <div class="game-icon" style="background:#06b6d4;">🎯</div>
        <div class="game-name">Brick Style</div>
      </div>
    </div>
  `;
}

/* ============================================================
   LOAD POSTS FROM FIREBASE
   ============================================================ */
async function loadHomeFeedPosts() {
  const feedContainer = document.getElementById('feedContainer');
  const shortsContainer = document.getElementById('shortsShelfContainer');
  if (!feedContainer || !shortsContainer) return;

  try {
    // Fetch top 20 posts
    const q = query(collection(db, 'posts'), limit(20));
    const snap = await getDocs(q);

    if (snap.empty) {
      feedContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#888;">No posts yet. Be the first to upload!</div>`;
      return;
    }

    let posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Filter blocked users
    const blocked = currentProfile?.blockedUsers || [];
    posts = posts.filter(p => !blocked.includes(p.userId));

    // Sort by newest
    posts.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));

    // Separate Shorts and Regular Posts
    const shorts = posts.filter(p => p.type === 'short');
    const regular = posts.filter(p => p.type !== 'short');

    // Render Shorts
    shortsContainer.innerHTML = '';
    if (shorts.length === 0) {
      shortsContainer.innerHTML = `<div style="color:#888; font-size:13px; padding:10px;">No shorts yet</div>`;
    } else {
      shorts.slice(0, 10).forEach(short => {
        shortsContainer.appendChild(makeShortShelfItem(short));
      });
    }

    // Render Regular Posts
    feedContainer.innerHTML = '';
    if (regular.length === 0) {
      feedContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#888;">No regular videos yet.</div>`;
    } else {
      regular.forEach(post => {
        feedContainer.appendChild(makeFeedPost(post));
      });
    }

  } catch (error) {
    console.error("Error loading posts:", error);
    feedContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#ff4d4d;">Failed to load posts. Check internet or rules.</div>`;
  }
}

/* ============================================================
   UI BUILDERS FOR POSTS
   ============================================================ */
function makeShortShelfItem(short) {
  const item = document.createElement('div');
  item.className = 'short-card';
  
  const thumbUrl = short.thumbnail || short.url;
  
  item.innerHTML = `
    <div class="short-thumb">
      <img src="${thumbUrl}" alt="" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&q=80'">
    </div>
    <div class="short-info">
      <h4>${escapeHtml(short.caption || 'Short video')}</h4>
      <p>${formatViews(short.views)} views</p>
    </div>
  `;

  item.addEventListener('click', () => {
    openPostPlayer(short);
    // In future: renderPage('shorts') and scroll to this short
  });

  return item;
}

function makeFeedPost(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  
  const thumbUrl = post.thumbnail || (post.type === 'photo' ? post.url : '');
  const avatar = post.userPhoto || defaultAvatar(post.userName);
  const timeStr = post.createdAt?.toDate?.() ? timeAgoShort(post.createdAt.toDate()) : 'Just now';

  card.innerHTML = `
    <div class="post-thumb">
      <img src="${thumbUrl}" alt="" loading="lazy" onerror="this.style.display='none'">
    </div>
    <div class="post-info">
      <img src="${avatar}" class="post-avatar" alt="">
      <div class="post-meta">
        <h3>${escapeHtml(post.caption || 'Untitled')}</h3>
        <p>${escapeHtml(post.userName || 'User')} • ${formatViews(post.views)} views • ${timeStr}</p>
      </div>
    </div>
  `;

  // Open player on click
  card.addEventListener('click', () => openPostPlayer(post));
  
  // Track view
  trackPostView(post.id);

  return card;
}

/* ============================================================
   POST PLAYER
   ============================================================ */
function openPostPlayer(post) {
  if (!post || !playerTitle || !playerContent) return;
  
  playerTitle.textContent = post.caption || (post.type === 'photo' ? 'Photo' : 'Video');
  
  if (post.type === 'photo') {
    playerContent.innerHTML = `<img src="${post.url}" style="width:100%; max-height:80vh; object-fit:contain;">`;
  } else {
    playerContent.innerHTML = `<video src="${post.url}" controls autoplay playsinline style="width:100%; max-height:80vh; background:#000;"></video>`;
  }
  
  if (playerModal) playerModal.style.setProperty('display', 'flex', 'important');
  if (navigator.vibrate) navigator.vibrate(20);
}

/* ============================================================
   UPLOAD MODAL LOGIC (Basic UI logic)
   ============================================================ */
function openUploadModal() {
  const modal = document.getElementById('uploadModal');
  if (modal) modal.style.display = 'flex';
}

// Close Modal
document.getElementById('closeUpload')?.addEventListener('click', () => {
  const modal = document.getElementById('uploadModal');
  if (modal) modal.style.display = 'none';
});

// Mock Upload Button Action (Actual upload in Part 5)
document.querySelector('#uploadModal button[style*="background: linear-gradient"]')?.addEventListener('click', () => {
  showToast('Video upload logic will be added in Part 5!');
  document.getElementById('uploadModal').style.display = 'none';
});

/* ============================================================
   PLACEHOLDERS FOR OTHER PAGES
   ============================================================ */
function renderShortsFeed() {
  if (content) content.innerHTML = `<div style="padding:20px;text-align:center;color:#fff;">Shorts Player (Coming in Part 3)</div>`;
}
function renderChatsPage() {
  if (content) content.innerHTML = `<div style="padding:20px;text-align:center;color:#fff;">Chats (Coming in Part 4)</div>`;
}
function renderProfile() {
  if (content) content.innerHTML = `<div style="padding:20px;text-align:center;color:#fff;">Profile (Coming in Part 5)</div>`;
}

console.log('✅ Part 2 loaded (Home Feed + Games + Shorts + Player)');/* ============================================================
   ReelHub — app.js (PART 3/5) — SHORTS + COMMENTS + STORIES
   ============================================================ */

let shortsObserver = null;
let storiesByUser = [];
let currentStoryUserIndex = 0;
let currentStoryIndex = 0;
let storyProgressInterval = null;
let currentStoryMediaEl = null;

/* ============================================================
   LIKES & SHARES
   ============================================================ */
async function toggleLike(postId, btnEl) {
  if (!currentUser || !btnEl) return;
  const isLiked = btnEl.classList.contains('liked');
  const countSpan = btnEl.querySelector('span');
  const currentCount = countSpan ? (parseInt(countSpan.textContent) || 0) : 0;
  
  // Optimistic UI Update
  btnEl.classList.toggle('liked');
  if (countSpan) countSpan.textContent = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
  btnEl.style.color = isLiked ? '#fff' : '#ff2e63';

  try {
    if (isLiked) {
      await updateDoc(doc(db, 'posts', postId), { likes: arrayRemove(currentUser.uid) });
    } else {
      await updateDoc(doc(db, 'posts', postId), { likes: arrayUnion(currentUser.uid) });
      if (navigator.vibrate) navigator.vibrate(30);
    }
  } catch (e) {
    // Revert on error
    btnEl.classList.toggle('liked');
    if (countSpan) countSpan.textContent = currentCount;
    showToast('❌ Failed to like');
  }
}

async function sharePost(post) {
  if (!post) return;
  const appUrl = window.location.origin;
  const shareText = `🎬 Check out this post on ReelHub!\n\n@${post.userHandle || 'user'}\n\n${appUrl}`;
  
  if (navigator.share) {
    try {
      await navigator.share({ title: 'ReelHub Post', text: shareText, url: appUrl });
      await updateDoc(doc(db, 'posts', post.id), { shares: increment(1) });
    } catch (err) {}
  } else {
    try {
      await navigator.clipboard.writeText(shareText);
      showToast('✅ Link copied!');
      await updateDoc(doc(db, 'posts', post.id), { shares: increment(1) });
    } catch (err) { showToast('❌ Could not share'); }
  }
}

/* ============================================================
   SHORTS FEED (Full Screen)
   ============================================================ */
async function renderShortsFeed() {
  if (!content) return;
  
  content.innerHTML = `
    <div class="shorts-wrap" id="shortsWrap" style="height: calc(100vh - 60px); overflow-y: scroll; scroll-snap-type: y mandatory; background: #000;">
      <div style="text-align:center; padding:20px; color:#fff;">Loading shorts...</div>
    </div>
  `;

  const wrap = document.getElementById('shortsWrap');
  if (!wrap) return;

  try {
    const q = query(collection(db, 'posts'), where('type', '==', 'short'), limit(20));
    const snap = await getDocs(q);

    if (snap.empty) {
      wrap.innerHTML = `<div style="text-align:center; padding:50px 20px; color:#888;">No shorts yet.</div>`;
      return;
    }

    let shorts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    shorts.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));

    wrap.innerHTML = '';
    shorts.forEach(short => wrap.appendChild(makeShortItem(short)));
    
    setupShortsAutoplay(wrap);

  } catch (e) {
    console.error(e);
    wrap.innerHTML = `<div style="text-align:center; padding:20px; color:red;">Failed to load shorts.</div>`;
  }
}

function makeShortItem(short) {
  const item = document.createElement('div');
  item.className = 'short-item';
  item.style.cssText = 'height: 100%; width: 100%; scroll-snap-align: start; position: relative; background: #000;';
  
  const avatar = short.userPhoto || defaultAvatar(short.userName);
  const isLiked = (short.likes || []).includes(currentUser.uid);
  const likesCount = safeArray(short.likes).length;

  item.innerHTML = `
    <video src="${short.url}" loop playsinline style="width:100%; height:100%; object-fit:cover;"></video>
    
    <!-- Overlay UI -->
    <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 20px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); display: flex; align-items: flex-end; justify-content: space-between;">
      
      <!-- Bottom Left Info -->
      <div style="flex: 1; padding-right: 15px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <img src="${avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
          <b style="font-size: 15px; color: white;">${escapeHtml(short.userName)}</b>
        </div>
        <div style="font-size: 14px; color: #fff; margin-bottom: 10px;">${escapeHtml(short.caption || '')}</div>
      </div>

      <!-- Right Side Actions -->
      <div style="display: flex; flex-direction: column; gap: 20px; align-items: center;">
        <button class="like-btn ${isLiked ? 'liked' : ''}" style="background: none; border: none; color: ${isLiked ? '#ff2e63' : '#fff'}; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span style="font-size: 12px; margin-top: 4px;">${likesCount}</span>
        </button>

        <button class="comment-btn" style="background: none; border: none; color: #fff; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span style="font-size: 12px; margin-top: 4px;">${short.commentsCount || 0}</span>
        </button>

        <button class="share-btn" style="background: none; border: none; color: #fff; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>
    </div>
  `;

  // Video click to mute/unmute
  const video = item.querySelector('video');
  video.addEventListener('click', () => {
    video.muted = !video.muted;
    showToast(video.muted ? '🔇 Sound OFF' : '🔊 Sound ON');
  });

  item.querySelector('.like-btn').addEventListener('click', (e) => toggleLike(short.id, e.currentTarget));
  item.querySelector('.comment-btn').addEventListener('click', () => openComments(short.id, 'Comments'));
  item.querySelector('.share-btn').addEventListener('click', () => sharePost(short));

  return item;
}

function setupShortsAutoplay(wrap) {
  if (shortsObserver) shortsObserver.disconnect();
  const videos = wrap.querySelectorAll('video');
  
  shortsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, { threshold: [0, 0.6, 1] });

  videos.forEach(v => shortsObserver.observe(v));
}

/* ============================================================
   COMMENTS SYSTEM
   ============================================================ */
async function openComments(postId, title) {
  if (!currentUser) return;
  activeCommentPostId = postId;
  
  document.getElementById('commentsTitle').textContent = title;
  document.getElementById('commentsList').innerHTML = `<div style="text-align:center; color:#888; padding:20px;">Loading...</div>`;
  document.getElementById('commentsModal').style.display = 'flex';
  
  await loadComments();
}

document.getElementById('closeComments')?.addEventListener('click', () => {
  document.getElementById('commentsModal').style.display = 'none';
});

async function loadComments() {
  if (!activeCommentPostId) return;
  const list = document.getElementById('commentsList');
  
  try {
    const q = query(collection(db, 'comments'), where('postId', '==', activeCommentPostId));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      list.innerHTML = `<div style="text-align:center; color:#888; padding:20px;">No comments yet. Start the conversation!</div>`;
      return;
    }

    let comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    comments.sort((a, b) => (a.createdAt?.toDate?.()?.getTime() || 0) - (b.createdAt?.toDate?.()?.getTime() || 0));

    list.innerHTML = '';
    comments.forEach(c => {
      const el = document.createElement('div');
      el.style.cssText = 'display:flex; gap:10px; margin-bottom:15px;';
      el.innerHTML = `
        <img src="${c.userPhoto || defaultAvatar(c.userName)}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
        <div>
          <div style="font-size:13px; font-weight:bold; color:#fff;">${escapeHtml(c.userName)}</div>
          <div style="font-size:14px; color:#ccc; margin-top:2px;">${escapeHtml(c.text)}</div>
        </div>
      `;
      list.appendChild(el);
    });

  } catch (e) {
    list.innerHTML = `<div style="color:red; text-align:center;">Failed to load comments.</div>`;
  }
}

document.getElementById('postCommentBtn')?.addEventListener('click', async () => {
  const input = document.getElementById('commentInput');
  const text = input.value.trim();
  if (!text || !activeCommentPostId) return;

  const btn = document.getElementById('postCommentBtn');
  btn.disabled = true;
  btn.textContent = '...';

  try {
    await addDoc(collection(db, 'comments'), {
      postId: activeCommentPostId,
      userId: currentUser.uid,
      userName: currentProfile.name,
      userPhoto: currentProfile.photo || '',
      text: text,
      likes: [],
      createdAt: serverTimestamp()
    });

    // Update post count
    await updateDoc(doc(db, 'posts', activeCommentPostId), {
      commentsCount: increment(1)
    });

    input.value = '';
    await loadComments();
  } catch (e) {
    showToast('❌ Failed to post comment');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Post';
  }
});

/* ============================================================
   STORY VIEWER (Placeholder for future release)
   ============================================================ */
// (Real logic needs a proper stories collection and viewer, skipping for now to keep UI stable)

console.log('✅ Part 3 loaded (Shorts + Comments + Likes + Shares)');/* ============================================================
   ReelHub — app.js (PART 4/5) — CHAT SYSTEM
   ============================================================ */

let chatMessagesUnsub = null;
let activeChatUser = null;

/* ============================================================
   CHATS PAGE (Inbox)
   ============================================================ */
async function renderChatsPage() {
  if (!content) return;
  
  content.innerHTML = `
    <div style="padding: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h2 style="font-size: 22px; font-weight: 800; color: #fff;">Chats</h2>
        <button id="openNewChatBtn" style="background: #1c1c22; border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer;">+</button>
      </div>
      <div id="chatsList" style="display: flex; flex-direction: column; gap: 10px;">
        <div style="text-align: center; color: #888; padding: 20px;">Loading chats...</div>
      </div>
    </div>
  `;

  document.getElementById('openNewChatBtn')?.addEventListener('click', openNewChatModal);
  await loadChatsList();
}

async function loadChatsList() {
  const list = document.getElementById('chatsList');
  if (!list) return;

  try {
    // Fetch chats where current user is a member
    const q = query(collection(db, 'chats'), where('members', 'array-contains', currentUser.uid));
    const snap = await getDocs(q);

    if (snap.empty) {
      list.innerHTML = `<div style="text-align: center; color: #888; padding: 20px;">No chats yet. Start a conversation!</div>`;
      return;
    }

    let chats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    chats.sort((a, b) => (b.lastMessageTime?.toDate?.()?.getTime() || 0) - (a.lastMessageTime?.toDate?.()?.getTime() || 0));

    list.innerHTML = '';
    for (const chat of chats) {
      const otherUid = chat.members.find(m => m !== currentUser.uid);
      if (!otherUid) continue;

      // Fetch other user's profile
      const userSnap = await getDoc(doc(db, 'users', otherUid));
      if (!userSnap.exists()) continue;
      const otherUser = userSnap.data();

      const el = document.createElement('div');
      el.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 12px; background: #121215; border-radius: 12px; cursor: pointer;';
      
      const avatar = otherUser.photo || defaultAvatar(otherUser.name);
      const timeStr = chat.lastMessageTime?.toDate?.() ? timeAgoShort(chat.lastMessageTime.toDate()) : '';

      el.innerHTML = `
        <img src="${avatar}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between;">
            <b style="color: #fff; font-size: 15px;">${escapeHtml(otherUser.name)}</b>
            <span style="color: #888; font-size: 12px;">${timeStr}</span>
          </div>
          <div style="color: #888; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
            ${escapeHtml(chat.lastMessage || 'Start chatting...')}
          </div>
        </div>
      `;

      el.addEventListener('click', () => openChatWindow({ uid: otherUid, ...otherUser }));
      list.appendChild(el);
    }

  } catch (e) {
    console.error(e);
    list.innerHTML = `<div style="text-align: center; color: #ff4d4d; padding: 20px;">Failed to load chats.</div>`;
  }
}

/* ============================================================
   NEW CHAT MODAL
   ============================================================ */
function openNewChatModal() {
  document.getElementById('newChatModal').style.display = 'flex';
  document.getElementById('newChatSearch').value = '';
  document.getElementById('newChatResults').innerHTML = '';
  document.getElementById('newChatSearch').focus();
}

document.getElementById('closeNewChat')?.addEventListener('click', () => {
  document.getElementById('newChatModal').style.display = 'none';
});

document.getElementById('newChatSearch')?.addEventListener('input', async (e) => {
  const term = e.target.value.trim().toLowerCase();
  const results = document.getElementById('newChatResults');
  
  if (!term) { results.innerHTML = ''; return; }
  
  results.innerHTML = `<div style="color: #888; text-align: center; padding: 10px;">Searching...</div>`;

  try {
    const snap = await getDocs(collection(db, 'users'));
    const matches = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.id !== currentUser.uid)
      .filter(u => (u.name || '').toLowerCase().includes(term) || (u.user || '').toLowerCase().includes(term))
      .slice(0, 10);

    if (matches.length === 0) {
      results.innerHTML = `<div style="color: #888; text-align: center; padding: 10px;">No users found.</div>`;
      return;
    }

    results.innerHTML = '';
    matches.forEach(u => {
      const el = document.createElement('div');
      el.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 10px; cursor: pointer; border-bottom: 1px solid #27272a;';
      el.innerHTML = `
        <img src="${u.photo || defaultAvatar(u.name)}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
        <div>
          <div style="color: #fff; font-size: 14px; font-weight: bold;">${escapeHtml(u.name)}</div>
          <div style="color: #888; font-size: 12px;">@${escapeHtml(u.user)}</div>
        </div>
      `;
      el.addEventListener('click', () => {
        document.getElementById('newChatModal').style.display = 'none';
        openChatWindow({ uid: u.id, ...u });
      });
      results.appendChild(el);
    });

  } catch (err) {
    results.innerHTML = `<div style="color: red; text-align: center;">Search failed.</div>`;
  }
});

/* ============================================================
   CHAT WINDOW
   ============================================================ */
function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

async function openChatWindow(otherUser) {
  if (!otherUser || otherUser.uid === currentUser.uid) return;
  activeChatUser = otherUser;
  
  // Setup UI
  document.getElementById('chatHeaderAvatar').src = otherUser.photo || defaultAvatar(otherUser.name);
  document.getElementById('chatHeaderName').textContent = otherUser.name;
  document.getElementById('chatHeaderHandle').textContent = '@' + otherUser.user;
  document.getElementById('chatMessages').innerHTML = `<div style="text-align: center; color: #888; padding: 20px;">Loading messages...</div>`;
  document.getElementById('chatMessageInput').value = '';
  document.getElementById('chatWindowModal').style.display = 'flex';

  // Start real-time listener
  const chatId = getChatId(currentUser.uid, otherUser.uid);
  
  if (chatMessagesUnsub) chatMessagesUnsub();

  chatMessagesUnsub = onSnapshot(collection(db, 'chats', chatId, 'messages'), (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    msgs.sort((a, b) => (a.time?.toDate?.()?.getTime() || 0) - (b.time?.toDate?.()?.getTime() || 0));
    paintMessages(msgs);
  });
}

function paintMessages(messages) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  
  if (messages.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #888; margin-top: 20px;">Say hi! 👋</div>`;
    return;
  }

  container.innerHTML = '';
  messages.forEach(msg => {
    const isMe = msg.from === currentUser.uid;
    const time = msg.time?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
    
    const el = document.createElement('div');
    el.style.cssText = `display: flex; flex-direction: column; align-items: ${isMe ? 'flex-end' : 'flex-start'};`;
    
    el.innerHTML = `
      <div style="background: ${isMe ? '#3b82f6' : '#1c1c22'}; color: #fff; padding: 10px 14px; border-radius: 18px; border-bottom-${isMe ? 'right' : 'left'}-radius: 4px; max-width: 75%; font-size: 14px; word-wrap: break-word;">
        ${escapeHtml(msg.text)}
      </div>
      <span style="font-size: 10px; color: #888; margin-top: 4px; margin-${isMe ? 'right' : 'left'}: 5px;">${time}</span>
    `;
    container.appendChild(el);
  });

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

/* ============================================================
   SEND MESSAGE
   ============================================================ */
async function sendMessage(text) {
  if (!text || !activeChatUser) return;
  
  const chatId = getChatId(currentUser.uid, activeChatUser.uid);
  
  try {
    // 1. Add message to sub-collection
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      from: currentUser.uid,
      to: activeChatUser.uid,
      text: text,
      type: 'text',
      time: serverTimestamp()
    });

    // 2. Create/Update main chat document
    await setDoc(doc(db, 'chats', chatId), {
      members: [currentUser.uid, activeChatUser.uid],
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      lastMessageBy: currentUser.uid
    }, { merge: true });

  } catch (e) {
    console.error(e);
    showToast('❌ Failed to send message');
  }
}

document.getElementById('sendTextBtn')?.addEventListener('click', () => {
  const input = document.getElementById('chatMessageInput');
  const text = input.value.trim();
  if (text) {
    input.value = '';
    sendMessage(text);
  }
});

document.getElementById('chatMessageInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('sendTextBtn').click();
  }
});

document.getElementById('closeChatWindow')?.addEventListener('click', () => {
  document.getElementById('chatWindowModal').style.display = 'none';
  if (chatMessagesUnsub) {
    chatMessagesUnsub();
    chatMessagesUnsub = null;
  }
  activeChatUser = null;
});

console.log('✅ Part 4 loaded (Chat System)');/* ============================================================
   ReelHub — app.js (PART 5/5) — PROFILE, UPLOAD, SETTINGS
   ============================================================ */

/* ============================================================
   PROFILE PAGE
   ============================================================ */
async function renderProfile() {
  if (!content || !currentProfile) return;

  content.innerHTML = `
    <div style="padding: 20px; padding-bottom: 100px;">
      <!-- Profile Header -->
      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
        <img src="${currentProfile.photo || defaultAvatar(currentProfile.name)}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #27272a;">
        <div style="display: flex; gap: 20px; text-align: center;">
          <div><b style="font-size: 18px; color: #fff;">${currentProfile.videoCount || 0}</b><br><span style="font-size: 12px; color: #888;">Videos</span></div>
          <div><b style="font-size: 18px; color: #fff;">${(currentProfile.followers || []).length}</b><br><span style="font-size: 12px; color: #888;">Followers</span></div>
          <div><b style="font-size: 18px; color: #fff;">${(currentProfile.following || []).length}</b><br><span style="font-size: 12px; color: #888;">Following</span></div>
        </div>
      </div>

      <!-- Bio -->
      <h2 style="font-size: 18px; font-weight: bold; color: #fff;">${escapeHtml(currentProfile.name)}</h2>
      <p style="color: #888; font-size: 14px; margin-bottom: 10px;">@${escapeHtml(currentProfile.user)}</p>
      <p style="color: #fff; font-size: 14px; margin-bottom: 20px;">${escapeHtml(currentProfile.bio || 'No bio yet.')}</p>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px;">
        <button onclick="showToast('Edit Profile will be added soon!')" style="flex: 1; padding: 12px; background: #1c1c22; border: 1px solid #27272a; color: #fff; border-radius: 8px; font-weight: bold;">Edit Profile</button>
      </div>

      <!-- My Posts Grid -->
      <div style="margin-top: 30px; border-top: 1px solid #27272a; padding-top: 20px;">
        <h3 style="font-size: 16px; font-weight: bold; color: #fff; margin-bottom: 15px;">My Posts</h3>
        <div id="myPostsGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;">
          <div style="color: #888; text-align: center; grid-column: span 3; padding: 20px;">Loading posts...</div>
        </div>
      </div>
    </div>
  `;

  // Load user's own posts
  loadUserPosts();
}

async function loadUserPosts() {
  const grid = document.getElementById('myPostsGrid');
  if (!grid) return;

  try {
    const q = query(collection(db, 'posts'), where('userId', '==', currentUser.uid));
    const snap = await getDocs(q);

    if (snap.empty) {
      grid.innerHTML = `<div style="color: #888; text-align: center; grid-column: span 3; padding: 20px;">No posts yet.</div>`;
      return;
    }

    let posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    posts.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));

    grid.innerHTML = '';
    posts.forEach(post => {
      const el = document.createElement('div');
      el.style.cssText = 'aspect-ratio: 1; background: #111; position: relative; cursor: pointer; overflow: hidden;';
      
      const thumbUrl = post.thumbnail || (post.type === 'photo' ? post.url : '');
      el.innerHTML = `
        <img src="${thumbUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
        <div style="position: absolute; bottom: 5px; left: 5px; color: #fff; font-size: 10px; background: rgba(0,0,0,0.5); padding: 2px 5px; border-radius: 4px;">
          ▶ ${formatViews(post.views)}
        </div>
      `;
      el.addEventListener('click', () => openPostPlayer(post));
      grid.appendChild(el);
    });

  } catch (e) {
    grid.innerHTML = `<div style="color: red; text-align: center; grid-column: span 3; padding: 20px;">Failed to load posts.</div>`;
  }
}

/* ============================================================
   UPLOAD LOGIC
   ============================================================ */
let selectedUploadFile = null;
let uploadType = 'short';

// Tab Switching logic
document.querySelectorAll('.upload-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    document.querySelectorAll('.upload-tab').forEach(t => {
      t.style.background = '#1c1c22';
      t.style.borderColor = 'transparent';
      t.style.color = '#888';
    });
    e.target.style.background = 'rgba(255, 46, 99, 0.1)';
    e.target.style.borderColor = '#ff2e63';
    e.target.style.color = '#fff';
    uploadType = e.target.dataset.type;
  });
});

// File Selection
document.getElementById('uploadFileInput')?.addEventListener('change', (e) => {
  selectedUploadFile = e.target.files[0];
  if (selectedUploadFile) {
    document.getElementById('uploadFileName').textContent = selectedUploadFile.name;
    document.getElementById('uploadFileName').style.color = '#4ade80';
  }
});

// Close Upload Modal
document.getElementById('closeUpload')?.addEventListener('click', () => {
  document.getElementById('uploadModal').style.display = 'none';
  selectedUploadFile = null;
  document.getElementById('uploadFileName').textContent = 'Choose a file';
  document.getElementById('uploadFileName').style.color = '#fff';
  document.getElementById('uploadCaption').value = '';
});

// Handle Upload Button Click
document.getElementById('uploadSubmitBtn')?.addEventListener('click', async (e) => {
  if (!selectedUploadFile) {
    showToast('❌ Please select a file first');
    return;
  }

  const btn = e.target;
  const progressText = document.getElementById('uploadProgress');
  const caption = document.getElementById('uploadCaption').value.trim();

  btn.disabled = true;
  btn.textContent = 'Processing...';
  progressText.style.display = 'block';

  try {
    // 1. Upload to Cloudinary
    const url = await uploadToCloudinary(selectedUploadFile, uploadType);

    // 2. Save to Firestore
    await addDoc(collection(db, 'posts'), {
      userId: currentUser.uid,
      userName: currentProfile.name,
      userHandle: currentProfile.user,
      userPhoto: currentProfile.photo || '',
      type: uploadType,
      url: url,
      thumbnail: url,
      caption: caption,
      likes: [],
      commentsCount: 0,
      views: 0,
      shares: 0,
      createdAt: serverTimestamp()
    });

    // 3. Update user video count
    await updateDoc(doc(db, 'users', currentUser.uid), {
      videoCount: increment(1)
    });
    currentProfile.videoCount = (currentProfile.videoCount || 0) + 1;

    // 4. Success cleanup
    showToast('✅ Uploaded successfully!');
    document.getElementById('uploadModal').style.display = 'none';
    selectedUploadFile = null;
    document.getElementById('uploadFileName').textContent = 'Choose a file';
    document.getElementById('uploadCaption').value = '';

    // Refresh feed
    if (document.querySelector('.nav-item[data-page="home"]').classList.contains('active')) {
      renderHomeFeed();
    }

  } catch (err) {
    console.error(err);
    showToast('❌ Upload failed. Check connection.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Upload';
    progressText.style.display = 'none';
  }
});

// Cloudinary Helper
function uploadToCloudinary(file, type) {
  return new Promise((resolve, reject) => {
    const resourceType = type === 'photo' ? 'image' : 'video';
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_ACCOUNTS.videos.cloudName}/${resourceType}/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_ACCOUNTS.videos.preset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        document.getElementById('uploadProgress').textContent = `Uploading... ${percent}%`;
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).secure_url);
      } else {
        reject(new Error('Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

/* ============================================================
   SETTINGS LOGIC
   ============================================================ */
document.getElementById('settingsBtn')?.addEventListener('click', () => {
  document.getElementById('settingsModal').style.display = 'block';
});

console.log('✅ Part 5 loaded (Profile + Upload + Settings)');
console.log('🎉 ReelHub UI Ready!');