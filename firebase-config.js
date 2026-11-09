
/* ============================================================
   ReelHub — app.js (PART 1/3)
   FIXED: AUTH + STATE + ROUTER + HOME FEED
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
   CONSTANTS
   ============================================================ */

const CLOUDINARY_ACCOUNTS = {
  videos: {
    cloudName: "s3eresx6",
    apiKey: "349223397331644",
    preset: "reelhub_video"
  },
  stories: {
    cloudName: "fepzqr9t",
    apiKey: "287332161532267",
    preset: "reelhub_story"
  }
};

/* ============================================================
   DOM SHORTCUTS
   ============================================================ */

function $id(id) {
  return document.getElementById(id);
}

const authScreen = $id('auth');
const loadingScreen = $id('loadingScreen');
const appScreen = $id('app');
const content = $id('content');

const playerModal = $id('playerModal');
const playerTitle = $id('playerTitle');
const playerContent = $id('playerContent');

/* ============================================================
   GLOBAL STATE
   ============================================================ */

let currentUser = null;
let currentProfile = null;
let appInitialized = false;

let viewedPostsSession = new Set();

let activeCommentPostId = null;
let activeReplyTo = null;
let activeChatId = null;
let activeChatUser = null;

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

let shortsObserver = null;
let storiesByUser = [];
let currentStoryUserIndex = 0;
let currentStoryIndex = 0;
let storyProgressInterval = null;
let currentStoryMediaEl = null;

let chatMessagesUnsub = null;

let selectedUploadFile = null;
let uploadType = 'short';

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

function safeNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function defaultAvatar(name) {
  const letter =
    (name || '?').trim().charAt(0).toUpperCase() || '?';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#1e1e28"/>
      <text x="50" y="50" font-size="44"
        font-family="sans-serif" font-weight="700"
        fill="#fff" text-anchor="middle"
        dominant-baseline="central">${escapeHtml(letter)}</text>
    </svg>
  `;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function showToast(message, duration = 2500) {
  const existing = $id('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');

  toast.id = 'toast';
  toast.textContent = message;

  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    color: #000;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    z-index: 99999;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  `;

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), duration);
}

function formatViews(count) {
  const n = safeNum(count);

  if (n >= 1000000) {
    return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  }

  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  }

  return n.toString();
}

function timeAgoShort(date) {
  if (!date) return 'now';

  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );

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
   SCREEN SWITCHING
   ============================================================ */

function showAuth() {
  if (loadingScreen) {
    loadingScreen.style.setProperty('display', 'none', 'important');
  }

  if (authScreen) {
    authScreen.classList.add('show');
    authScreen.style.setProperty('display', 'block', 'important');
  }

  if (appScreen) {
    appScreen.classList.remove('show');
    appScreen.style.setProperty('display', 'none', 'important');
  }
}

function showApp() {
  if (loadingScreen) {
    loadingScreen.style.setProperty('display', 'none', 'important');
  }

  if (authScreen) {
    authScreen.classList.remove('show');
    authScreen.style.setProperty('display', 'none', 'important');
  }

  if (appScreen) {
    appScreen.classList.add('show');
    appScreen.style.setProperty('display', 'flex', 'important');
  }
}

function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const active = item.dataset.page === page;

    item.classList.toggle('active', active);
    item.style.color = active ? '#fff' : '#888';
  });
}

/* ============================================================
   AUTH BRIDGE
   ============================================================ */

function startApp(user, profile) {
  if (!user) return;

  currentUser = user;
  currentProfile = profile || {};

  if (window.appState) {
    window.appState.currentUser = user;
    window.appState.currentProfile = profile || {};
  }

  if (appInitialized) return;

  appInitialized = true;

  console.log('App starting for:', user.email || user.uid);

  showApp();
  setActiveNav('home');
  renderPage('home');
}

window.addEventListener('auth:login', event => {
  startApp(event.detail?.user, event.detail?.profile);
});

window.addEventListener('auth:logout', () => {
  appInitialized = false;

  currentUser = null;
  currentProfile = null;

  if (chatMessagesUnsub) {
    chatMessagesUnsub();
    chatMessagesUnsub = null;
  }

  showAuth();
});

window.addEventListener('auth:error', event => {
  showToast('❌ ' + (event.detail || 'Authentication error'));
  showAuth();
});

/* ============================================================
   AUTH FALLBACK
   ============================================================ */

setTimeout(() => {
  if (window.appState?.ready) {
    if (window.appState.currentUser) {
      startApp(
        window.appState.currentUser,
        window.appState.currentProfile
      );
    } else {
      showAuth();
    }
  } else if (!currentUser) {
    showAuth();
  }
}, 2500);

/* ============================================================
   PAGE ROUTER
   ============================================================ */

function renderPage(page) {
  if (!currentUser) return;

  switch (page) {
    case 'home':
      renderHomeFeed();
      break;

    case 'shorts':
      renderShortsFeed();
      break;

    case 'chats':
      renderChatsPage();
      break;

    case 'profile':
      renderProfile();
      break;

    case 'search':
      renderSearchPage();
      break;

    case 'notifications':
      renderNotificationsPage();
      break;

    case 'settings':
      openSettings();
      break;

    default:
      renderHomeFeed();
  }
}

/* ============================================================
   NAVIGATION EVENTS
   ============================================================ */

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;

    setActiveNav(page);
    renderPage(page);
  });
});

document.querySelector('.nav-plus')?.addEventListener('click', () => {
  openUploadModal();
});

$id('searchBtn')?.addEventListener('click', () => {
  setActiveNav('');
  renderPage('search');
});

$id('notifBtn')?.addEventListener('click', () => {
  setActiveNav('');
  renderPage('notifications');
});

$id('settingsBtn')?.addEventListener('click', () => {
  setActiveNav('');
  renderPage('settings');
});

/* ============================================================
   PLAYER CLOSE
   ============================================================ */

$id('closePlayer')?.addEventListener('click', () => {
  if (playerModal) {
    playerModal.style.setProperty('display', 'none', 'important');
  }

  if (playerContent) {
    playerContent.innerHTML = '';
  }
});

/* ============================================================
   HOME FEED
   ============================================================ */

async function renderHomeFeed() {
  if (!content) return;

  content.innerHTML = `
    <div class="home-feed">

      <div class="stories-wrap">
        <div class="story add" id="addStoryBtn">
          <div class="story-ring"><span>+</span></div>
          <p style="color:white;">Your story</p>
        </div>

        <div class="story">
          <div class="story-ring">
            <img
              src="https://ui-avatars.com/api/?name=Founder&background=random"
              alt="Founder"
            >
          </div>
          <p>Founder</p>
        </div>
      </div>

      ${buildGamesShelfHTML()}

      <div class="shelf-header">
        <div class="shelf-title">🔥 Shorts</div>
        <div class="shelf-more" id="viewAllShorts">View all &gt;</div>
      </div>

      <div class="shorts-scroll" id="shortsShelfContainer"></div>

      <div class="feed-container" id="feedContainer">
        <div style="text-align:center;padding:20px;color:#888;">
          Loading feed...
        </div>
      </div>

    </div>
  `;

  $id('addStoryBtn')?.addEventListener('click', () => {
    showToast('Story upload coming soon!');
  });

  $id('viewAllShorts')?.addEventListener('click', () => {
    setActiveNav('shorts');
    renderPage('shorts');
  });

  await loadHomeFeedPosts();
}

/* ============================================================
   GAMES SHELF
   ============================================================ */

function buildGamesShelfHTML() {
  return `
    <div class="shelf-header">
      <div class="shelf-title">🎮 Games</div>
      <div class="shelf-more">View all &gt;</div>
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
   LOAD HOME FEED POSTS
   ============================================================ */

async function loadHomeFeedPosts() {
  const feedContainer = $id('feedContainer');
  const shortsContainer = $id('shortsShelfContainer');

  if (!feedContainer || !shortsContainer || !currentUser) return;

  try {
    const q = query(
      collection(db, 'posts'),
      limit(20)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      feedContainer.innerHTML = `
        <div style="text-align:center;padding:20px;color:#888;">
          No posts yet. Be the first to upload!
        </div>
      `;

      shortsContainer.innerHTML = `
        <div style="color:#888;padding:10px;">No shorts yet</div>
      `;

      return;
    }

    let posts = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    const blocked = safeArray(currentProfile?.blockedUsers);

    posts = posts.filter(post => !blocked.includes(post.userId));

    posts.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;

      return bTime - aTime;
    });

    const shorts = posts.filter(post => post.type === 'short');
    const regular = posts.filter(post => post.type !== 'short');

    shortsContainer.innerHTML = '';

    if (!shorts.length) {
      shortsContainer.innerHTML = `
        <div style="color:#888;font-size:13px;padding:10px;">
          No shorts yet
        </div>
      `;
    } else {
      shorts.slice(0, 10).forEach(short => {
        shortsContainer.appendChild(makeShortShelfItem(short));
      });
    }

    feedContainer.innerHTML = '';

    if (!regular.length) {
      feedContainer.innerHTML = `
        <div style="text-align:center;padding:20px;color:#888;">
          No regular posts yet.
        </div>
      `;
    } else {
      regular.forEach(post => {
        feedContainer.appendChild(makeFeedPost(post));
      });
    }

  } catch (error) {
    console.error('Error loading posts:', error);

    feedContainer.innerHTML = `
      <div style="text-align:center;padding:20px;color:#ff4d4d;">
        Failed to load posts. Check internet or Firebase Rules.
      </div>
    `;
  }
}

/* ============================================================
   SHORTS SHELF ITEM
   ============================================================ */

function makeShortShelfItem(short) {
  const item = document.createElement('div');
  item.className = 'short-card';

  const thumbUrl = short.thumbnail || short.url || '';

  const image = document.createElement('img');
  image.src = thumbUrl;
  image.alt = 'Short video';
  image.loading = 'lazy';

  image.onerror = () => {
    image.style.display = 'none';
  };

  const thumb = document.createElement('div');
  thumb.className = 'short-thumb';
  thumb.appendChild(image);

  const info = document.createElement('div');
  info.className = 'short-info';

  const heading = document.createElement('h4');
  heading.textContent = short.caption || 'Short video';

  const views = document.createElement('p');
  views.textContent = formatViews(short.views) + ' views';

  info.append(heading, views);
  item.append(thumb, info);

  item.addEventListener('click', () => {
    openPostPlayer(short);
  });

  return item;
}

/* ============================================================
   REGULAR FEED POST
   ============================================================ */

function makeFeedPost(post) {
  const card = document.createElement('div');
  card.className = 'post-card';

  const thumbUrl = post.thumbnail ||
    (post.type === 'photo' ? post.url : '');

  const avatar = post.userPhoto ||
    defaultAvatar(post.userName);

  const timeStr = post.createdAt?.toDate?.()
    ? timeAgoShort(post.createdAt.toDate())
    : 'Just now';

  const image = document.createElement('img');
  image.src = thumbUrl;
  image.alt = 'Post';
  image.loading = 'lazy';

  image.onerror = () => {
    image.style.display = 'none';
  };

  const thumb = document.createElement('div');
  thumb.className = 'post-thumb';
  thumb.appendChild(image);

  const info = document.createElement('div');
  info.className = 'post-info';

  const avatarImg = document.createElement('img');
  avatarImg.src = avatar;
  avatarImg.className = 'post-avatar';
  avatarImg.alt = 'User';

  const meta = document.createElement('div');
  meta.className = 'post-meta';

  const heading = document.createElement('h3');
  heading.textContent = post.caption || 'Untitled';

  const details = document.createElement('p');
  details.textContent =
    `${post.userName || 'User'} • ${formatViews(post.views)} views • ${timeStr}`;

  meta.append(heading, details);
  info.append(avatarImg, meta);

  card.append(thumb, info);

  card.addEventListener('click', () => {
    openPostPlayer(post);
  });

  // Track view function is implemented in Part 2.
  trackPostView(post.id);

  return card;
}

/* ============================================================
   POST PLAYER
   ============================================================ */

function openPostPlayer(post) {
  if (!post || !playerTitle || !playerContent) return;

  playerTitle.textContent =
    post.caption ||
    (post.type === 'photo' ? 'Photo' : 'Video');

  playerContent.innerHTML = '';

  if (post.type === 'photo') {
    const image = document.createElement('img');

    image.src = post.url;
    image.alt = post.caption || 'Photo';

    image.style.cssText =
      'width:100%;max-height:80vh;object-fit:contain;';

    playerContent.appendChild(image);

  } else {
    const video = document.createElement('video');

    video.src = post.url;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;

    video.style.cssText =
      'width:100%;max-height:80vh;background:#000;';

    playerContent.appendChild(video);
  }

  if (playerModal) {
    playerModal.style.setProperty('display', 'flex', 'important');
  }

  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

/* ============================================================
   UPLOAD MODAL OPEN
   ============================================================ */

function openUploadModal() {
  const modal = $id('uploadModal');

  if (modal) {
    modal.style.display = 'flex';
  }
}

console.log('✅ ReelHub Part 1 loaded');

/* ============================================================
   ReelHub — app.js (PART 2/3)
   SHORTS + LIKES + SHARES + COMMENTS + CHAT
   ============================================================ */

/* ============================================================
   TRACK POST VIEW
   ============================================================ */

async function trackPostView(postId) {
  if (!currentUser || !postId) return;

  // Same post is counted only once per session.
  if (viewedPostsSession.has(postId)) return;

  viewedPostsSession.add(postId);

  try {
    await updateDoc(doc(db, 'posts', postId), {
      views: increment(1)
    });
  } catch (error) {
    console.error('View tracking failed:', error);
  }
}

/* ============================================================
   LIKES
   ============================================================ */

async function toggleLike(postId, btnEl) {
  if (!currentUser || !btnEl || !postId) return;

  const isLiked = btnEl.classList.contains('liked');
  const countSpan = btnEl.querySelector('span');

  const currentCount = countSpan
    ? (parseInt(countSpan.textContent, 10) || 0)
    : 0;

  btnEl.classList.toggle('liked', !isLiked);

  if (countSpan) {
    countSpan.textContent = isLiked
      ? Math.max(0, currentCount - 1)
      : currentCount + 1;
  }

  btnEl.style.color = isLiked ? '#fff' : '#ff2e63';

  try {
    const postRef = doc(db, 'posts', postId);

    if (isLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(currentUser.uid)
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(currentUser.uid)
      });

      if (navigator.vibrate) navigator.vibrate(30);
    }

  } catch (error) {
    btnEl.classList.toggle('liked', isLiked);

    if (countSpan) {
      countSpan.textContent = currentCount;
    }

    btnEl.style.color = isLiked ? '#ff2e63' : '#fff';

    showToast('❌ Failed to like');
    console.error(error);
  }
}

/* ============================================================
   SHARE POST
   ============================================================ */

async function sharePost(post) {
  if (!post || !post.id) return;

  const appUrl = window.location.origin;

  const shareText =
    `🎬 Check out this post on ReelHub!\n\n` +
    `@${post.userHandle || 'user'}\n\n${appUrl}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'ReelHub Post',
        text: shareText,
        url: appUrl
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      showToast('✅ Link copied!');
    }

    await updateDoc(doc(db, 'posts', post.id), {
      shares: increment(1)
    });

  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error(error);
      showToast('❌ Could not share');
    }
  }
}

/* ============================================================
   SHORTS FEED
   ============================================================ */

async function renderShortsFeed() {
  if (!content || !currentUser) return;

  content.innerHTML = `
    <div
      class="shorts-wrap"
      id="shortsWrap"
      style="
        height:calc(100vh - 60px);
        overflow-y:auto;
        scroll-snap-type:y mandatory;
        background:#000;
      "
    >
      <div style="text-align:center;padding:20px;color:#fff;">
        Loading shorts...
      </div>
    </div>
  `;

  const wrap = $id('shortsWrap');
  if (!wrap) return;

  try {
    const q = query(
      collection(db, 'posts'),
      where('type', '==', 'short'),
      limit(20)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      wrap.innerHTML = `
        <div style="text-align:center;padding:50px 20px;color:#888;">
          No shorts yet.
        </div>
      `;
      return;
    }

    let shorts = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    const blocked = safeArray(currentProfile?.blockedUsers);

    shorts = shorts.filter(
      short => !blocked.includes(short.userId)
    );

    shorts.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;

      return bTime - aTime;
    });

    wrap.innerHTML = '';

    if (!shorts.length) {
      wrap.innerHTML = `
        <div style="text-align:center;padding:50px;color:#888;">
          No shorts available.
        </div>
      `;
      return;
    }

    shorts.forEach(short => {
      wrap.appendChild(makeShortItem(short));
    });

    setupShortsAutoplay(wrap);

  } catch (error) {
    console.error('Shorts loading error:', error);

    wrap.innerHTML = `
      <div style="text-align:center;padding:20px;color:red;">
        Failed to load shorts.
      </div>
    `;
  }
}

/* ============================================================
   SHORT ITEM
   ============================================================ */

function makeShortItem(short) {
  const item = document.createElement('div');

  item.className = 'short-item';

  item.style.cssText = `
    height:100%;
    min-height:calc(100vh - 60px);
    width:100%;
    scroll-snap-align:start;
    position:relative;
    background:#000;
  `;

  const isLiked = safeArray(short.likes).includes(currentUser.uid);
  const likesCount = safeArray(short.likes).length;

  const video = document.createElement('video');

  video.src = short.url || '';
  video.loop = true;
  video.playsInline = true;
  video.muted = true;

  video.style.cssText = `
    width:100%;
    height:100%;
    object-fit:cover;
  `;

  const overlay = document.createElement('div');

  overlay.style.cssText = `
    position:absolute;
    bottom:0;
    left:0;
    width:100%;
    padding:20px;
    background:linear-gradient(transparent,rgba(0,0,0,.8));
    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    box-sizing:border-box;
  `;

  const left = document.createElement('div');

  left.style.cssText = `
    flex:1;
    padding-right:15px;
    color:#fff;
  `;

  const avatar = document.createElement('img');

  avatar.src = short.userPhoto || defaultAvatar(short.userName);
  avatar.alt = 'User';

  avatar.style.cssText = `
    width:36px;
    height:36px;
    border-radius:50%;
    object-fit:cover;
  `;

  const userRow = document.createElement('div');

  userRow.style.cssText = `
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom:10px;
  `;

  const username = document.createElement('b');

  username.textContent = short.userName || 'User';

  userRow.append(avatar, username);

  const caption = document.createElement('div');

  caption.textContent = short.caption || '';
  caption.style.marginBottom = '10px';

  left.append(userRow, caption);

  const actions = document.createElement('div');

  actions.style.cssText = `
    display:flex;
    flex-direction:column;
    gap:20px;
    align-items:center;
  `;

  const likeBtn = document.createElement('button');

  likeBtn.className = 'like-btn';

  likeBtn.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24"
      fill="${isLiked ? 'currentColor' : 'none'}"
      stroke="currentColor" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67
      l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06
      L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5
      0 0 0 0-7.78z"/>
    </svg>
    <span>${likesCount}</span>
  `;

  likeBtn.style.cssText = `
    background:none;
    border:none;
    color:${isLiked ? '#ff2e63' : '#fff'};
    display:flex;
    flex-direction:column;
    align-items:center;
    cursor:pointer;
  `;

  likeBtn.classList.toggle('liked', isLiked);

  const commentBtn = document.createElement('button');

  commentBtn.className = 'comment-btn';

  commentBtn.innerHTML = `
    <span style="font-size:25px;">💬</span>
    <span>${safeNum(short.commentsCount)}</span>
  `;

  const shareBtn = document.createElement('button');

  shareBtn.className = 'share-btn';
  shareBtn.innerHTML = '<span style="font-size:25px;">↗</span>';

  [commentBtn, shareBtn].forEach(btn => {
    btn.style.cssText = `
      background:none;
      border:none;
      color:#fff;
      display:flex;
      flex-direction:column;
      align-items:center;
      cursor:pointer;
    `;
  });

  likeBtn.addEventListener('click', () => {
    toggleLike(short.id, likeBtn);
  });

  commentBtn.addEventListener('click', () => {
    openComments(short.id, 'Comments');
  });

  shareBtn.addEventListener('click', () => {
    sharePost(short);
  });

  video.addEventListener('click', () => {
    video.muted = !video.muted;

    showToast(video.muted ? '🔇 Sound OFF' : '🔊 Sound ON');
  });

  actions.append(likeBtn, commentBtn, shareBtn);
  overlay.append(left, actions);

  item.append(video, overlay);

  trackPostView(short.id);

  return item;
}

/* ============================================================
   SHORTS AUTOPLAY
   ============================================================ */

function setupShortsAutoplay(wrap) {
  if (shortsObserver) {
    shortsObserver.disconnect();
  }

  if (!('IntersectionObserver' in window)) return;

  shortsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;

      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, {
    threshold: [0, 0.6, 1]
  });

  wrap.querySelectorAll('video').forEach(video => {
    shortsObserver.observe(video);
  });
}

/* ============================================================
   COMMENTS
   ============================================================ */

async function openComments(postId, title = 'Comments') {
  if (!currentUser) return;

  const titleEl = $id('commentsTitle');
  const list = $id('commentsList');
  const modal = $id('commentsModal');

  if (!titleEl || !list || !modal) {
    showToast('Comments section is missing from HTML');
    return;
  }

  activeCommentPostId = postId;

  titleEl.textContent = title;
  list.innerHTML = `
    <div style="text-align:center;color:#888;padding:20px;">
      Loading...
    </div>
  `;

  modal.style.display = 'flex';

  await loadComments();
}

/* ============================================================
   LOAD COMMENTS
   ============================================================ */

async function loadComments() {
  if (!activeCommentPostId) return;

  const list = $id('commentsList');
  if (!list) return;

  try {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', activeCommentPostId)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      list.innerHTML = `
        <div style="text-align:center;color:#888;padding:20px;">
          No comments yet. Start the conversation!
        </div>
      `;
      return;
    }

    const comments = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    comments.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;

      return aTime - bTime;
    });

    list.innerHTML = '';

    comments.forEach(comment => {
      const el = document.createElement('div');

      el.style.cssText = `
        display:flex;
        gap:10px;
        margin-bottom:15px;
      `;

      const avatar = document.createElement('img');

      avatar.src = comment.userPhoto ||
        defaultAvatar(comment.userName);

      avatar.alt = 'User';

      avatar.style.cssText = `
        width:32px;
        height:32px;
        border-radius:50%;
        object-fit:cover;
      `;

      const body = document.createElement('div');

      const name = document.createElement('div');

      name.textContent = comment.userName || 'User';

      name.style.cssText = `
        font-size:13px;
        font-weight:bold;
        color:#fff;
      `;

      const text = document.createElement('div');

      text.textContent = comment.text || '';

      text.style.cssText = `
        font-size:14px;
        color:#ccc;
        margin-top:2px;
      `;

      body.append(name, text);
      el.append(avatar, body);
      list.appendChild(el);
    });

  } catch (error) {
    console.error('Comments error:', error);

    list.innerHTML = `
      <div style="color:red;text-align:center;">
        Failed to load comments.
      </div>
    `;
  }
}

/* ============================================================
   COMMENT BUTTONS
   ============================================================ */

$id('closeComments')?.addEventListener('click', () => {
  const modal = $id('commentsModal');

  if (modal) modal.style.display = 'none';

  activeCommentPostId = null;
});

$id('postCommentBtn')?.addEventListener('click', async () => {
  const input = $id('commentInput');
  const btn = $id('postCommentBtn');

  if (!input || !btn || !currentUser || !activeCommentPostId) return;

  const text = input.value.trim();

  if (!text) return;

  btn.disabled = true;
  btn.textContent = 'Posting...';

  try {
    await addDoc(collection(db, 'comments'), {
      postId: activeCommentPostId,
      userId: currentUser.uid,
      userName: currentProfile?.name || 'User',
      userPhoto: currentProfile?.photo || '',
      text,
      likes: [],
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'posts', activeCommentPostId), {
      commentsCount: increment(1)
    });

    input.value = '';

    await loadComments();

  } catch (error) {
    console.error(error);
    showToast('❌ Failed to post comment');

  } finally {
    btn.disabled = false;
    btn.textContent = 'Post';
  }
});

/* ============================================================
   CHAT SYSTEM
   ============================================================ */

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

/* ============================================================
   CHATS PAGE
   ============================================================ */

async function renderChatsPage() {
  if (!content || !currentUser) return;

  content.innerHTML = `
    <div style="padding:15px;">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:15px;
      ">
        <h2 style="font-size:22px;font-weight:800;color:#fff;">
          Chats
        </h2>

        <button id="openNewChatBtn"
          style="
            background:#1c1c22;
            border:none;
            color:#fff;
            width:40px;
            height:40px;
            border-radius:50%;
            font-size:20px;
          ">
          +
        </button>
      </div>

      <div id="chatsList"
        style="display:flex;flex-direction:column;gap:10px;">
        <div style="text-align:center;color:#888;padding:20px;">
          Loading chats...
        </div>
      </div>

    </div>
  `;

  $id('openNewChatBtn')?.addEventListener(
    'click',
    openNewChatModal
  );

  await loadChatsList();
}

/* ============================================================
   LOAD CHATS
   ============================================================ */

async function loadChatsList() {
  const list = $id('chatsList');

  if (!list || !currentUser) return;

  try {
    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', currentUser.uid)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      list.innerHTML = `
        <div style="text-align:center;color:#888;padding:20px;">
          No chats yet. Start a conversation!
        </div>
      `;
      return;
    }

    const chats = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    chats.sort((a, b) => {
      const aTime = a.lastMessageTime?.toDate?.()?.getTime() || 0;
      const bTime = b.lastMessageTime?.toDate?.()?.getTime() || 0;

      return bTime - aTime;
    });

    list.innerHTML = '';

    for (const chat of chats) {
      const otherUid = safeArray(chat.members).find(
        member => member !== currentUser.uid
      );

      if (!otherUid) continue;

      const userSnap = await getDoc(
        doc(db, 'users', otherUid)
      );

      if (!userSnap.exists()) continue;

      const otherUser = userSnap.data();

      const el = document.createElement('div');

      el.style.cssText = `
        display:flex;
        align-items:center;
        gap:12px;
        padding:12px;
        background:#121215;
        border-radius:12px;
        cursor:pointer;
      `;

      const avatar = document.createElement('img');

      avatar.src = otherUser.photo ||
        defaultAvatar(otherUser.name);

      avatar.alt = 'User';

      avatar.style.cssText = `
        width:50px;
        height:50px;
        border-radius:50%;
        object-fit:cover;
      `;

      const info = document.createElement('div');

      info.style.flex = '1';

      const name = document.createElement('b');

      name.textContent = otherUser.name || 'User';

      name.style.color = '#fff';

      const message = document.createElement('div');

      message.textContent = chat.lastMessage || 'Start chatting...';

      message.style.cssText = `
        color:#888;
        font-size:13px;
        overflow:hidden;
        text-overflow:ellipsis;
      `;

      info.append(name, message);
      el.append(avatar, info);

      el.addEventListener('click', () => {
        openChatWindow({
          uid: otherUid,
          ...otherUser
        });
      });

      list.appendChild(el);
    }

  } catch (error) {
    console.error('Chat loading error:', error);

    list.innerHTML = `
      <div style="text-align:center;color:#ff4d4d;padding:20px;">
        Failed to load chats.
      </div>
    `;
  }
}

/* ============================================================
   NEW CHAT MODAL
   ============================================================ */

function openNewChatModal() {
  const modal = $id('newChatModal');
  const search = $id('newChatSearch');
  const results = $id('newChatResults');

  if (!modal || !search || !results) {
    showToast('New chat HTML elements missing');
    return;
  }

  modal.style.display = 'flex';

  search.value = '';
  results.innerHTML = '';

  search.focus();
}

$id('closeNewChat')?.addEventListener('click', () => {
  const modal = $id('newChatModal');

  if (modal) modal.style.display = 'none';
});

/* ============================================================
   SEARCH USERS FOR CHAT
   ============================================================ */

$id('newChatSearch')?.addEventListener('input', async event => {
  const term = event.target.value.trim().toLowerCase();

  const results = $id('newChatResults');

  if (!results || !currentUser) return;

  if (!term) {
    results.innerHTML = '';
    return;
  }

  results.innerHTML = `
    <div style="color:#888;text-align:center;padding:10px;">
      Searching...
    </div>
  `;

  try {
    const snap = await getDocs(collection(db, 'users'));

    const matches = snap.docs
      .map(d => ({
        id: d.id,
        ...d.data()
      }))
      .filter(user => user.id !== currentUser.uid)
      .filter(user =>
        (user.name || '').toLowerCase().includes(term) ||
        (user.user || '').toLowerCase().includes(term)
      )
      .slice(0, 10);

    if (!matches.length) {
      results.innerHTML = `
        <div style="color:#888;text-align:center;padding:10px;">
          No users found.
        </div>
      `;
      return;
    }

    results.innerHTML = '';

    matches.forEach(user => {
      const el = document.createElement('div');

      el.style.cssText = `
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px;
        cursor:pointer;
        border-bottom:1px solid #27272a;
      `;

      const avatar = document.createElement('img');

      avatar.src = user.photo ||
        defaultAvatar(user.name);

      avatar.alt = 'User';

      avatar.style.cssText = `
        width:40px;
        height:40px;
        border-radius:50%;
        object-fit:cover;
      `;

      const info = document.createElement('div');

      const name = document.createElement('div');
      name.textContent = user.name || 'User';

      name.style.cssText = `
        color:#fff;
        font-size:14px;
        font-weight:bold;
      `;

      const handle = document.createElement('div');

      handle.textContent = '@' + (user.user || '');

      handle.style.cssText = `
        color:#888;
        font-size:12px;
      `;

      info.append(name, handle);
      el.append(avatar, info);

      el.addEventListener('click', () => {
        const modal = $id('newChatModal');

        if (modal) modal.style.display = 'none';

        openChatWindow({
          uid: user.id,
          ...user
        });
      });

      results.appendChild(el);
    });

  } catch (error) {
    console.error(error);

    results.innerHTML = `
      <div style="color:red;text-align:center;">
        Search failed.
      </div>
    `;
  }
});

/* ============================================================
   OPEN CHAT WINDOW
   ============================================================ */

async function openChatWindow(otherUser) {
  if (!currentUser || !otherUser || !otherUser.uid) return;

  if (otherUser.uid === currentUser.uid) return;

  activeChatUser = otherUser;

  const requiredIds = [
    'chatHeaderAvatar',
    'chatHeaderName',
    'chatHeaderHandle',
    'chatMessages',
    'chatMessageInput',
    'chatWindowModal'
  ];

  if (requiredIds.some(id => !$id(id))) {
    showToast('Chat window HTML is incomplete');
    return;
  }

  $id('chatHeaderAvatar').src =
    otherUser.photo || defaultAvatar(otherUser.name);

  $id('chatHeaderName').textContent =
    otherUser.name || 'User';

  $id('chatHeaderHandle').textContent =
    '@' + (otherUser.user || '');

  $id('chatMessages').innerHTML = `
    <div style="text-align:center;color:#888;padding:20px;">
      Loading messages...
    </div>
  `;

  $id('chatMessageInput').value = '';

  $id('chatWindowModal').style.display = 'flex';

  const chatId = getChatId(
    currentUser.uid,
    otherUser.uid
  );

  activeChatId = chatId;

  if (chatMessagesUnsub) {
    chatMessagesUnsub();
    chatMessagesUnsub = null;
  }

  chatMessagesUnsub = onSnapshot(
    collection(db, 'chats', chatId, 'messages'),
    snap => {
      const messages = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      messages.sort((a, b) => {
        const aTime = a.time?.toDate?.()?.getTime() || 0;
        const bTime = b.time?.toDate?.()?.getTime() || 0;

        return aTime - bTime;
      });

      paintMessages(messages);
    },
    error => {
      console.error('Message listener error:', error);
      showToast('❌ Could not load messages');
    }
  );
}

/* ============================================================
   PAINT MESSAGES
   ============================================================ */

function paintMessages(messages) {
  const container = $id('chatMessages');

  if (!container || !currentUser) return;

  if (!messages.length) {
    container.innerHTML = `
      <div style="text-align:center;color:#888;margin-top:20px;">
        Say hi! 👋
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  messages.forEach(msg => {
    const isMe = msg.from === currentUser.uid;

    const time = msg.time?.toDate?.()?.toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    ) || '';

    const el = document.createElement('div');

    el.style.cssText = `
      display:flex;
      flex-direction:column;
      align-items:${isMe ? 'flex-end' : 'flex-start'};
      margin-bottom:10px;
    `;

    const bubble = document.createElement('div');

    bubble.textContent = msg.text || '';

    bubble.style.cssText = `
      background:${isMe ? '#3b82f6' : '#1c1c22'};
      color:#fff;
      padding:10px 14px;
      border-radius:18px;
      max-width:75%;
      font-size:14px;
      overflow-wrap:anywhere;
    `;

    const timeEl = document.createElement('span');

    timeEl.textContent = time;

    timeEl.style.cssText = `
      font-size:10px;
      color:#888;
      margin-top:4px;
    `;

    el.append(bubble, timeEl);
    container.appendChild(el);
  });

  container.scrollTop = container.scrollHeight;
}

/* ============================================================
   SEND MESSAGE
   ============================================================ */

async function sendMessage(text) {
  if (!currentUser || !activeChatUser || !text.trim()) return;

  const chatId = getChatId(
    currentUser.uid,
    activeChatUser.uid
  );

  try {
    await addDoc(
      collection(db, 'chats', chatId, 'messages'),
      {
        from: currentUser.uid,
        to: activeChatUser.uid,
        text: text.trim(),
        type: 'text',
        time: serverTimestamp()
      }
    );

    await setDoc(
      doc(db, 'chats', chatId),
      {
        members: [
          currentUser.uid,
          activeChatUser.uid
        ],
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageBy: currentUser.uid
      },
      { merge: true }
    );

  } catch (error) {
    console.error('Send message error:', error);
    showToast('❌ Failed to send message');
  }
}

/* ============================================================
   SEND MESSAGE BUTTON
   ============================================================ */

$id('sendTextBtn')?.addEventListener('click', () => {
  const input = $id('chatMessageInput');

  if (!input) return;

  const text = input.value.trim();

  if (!text) return;

  input.value = '';

  sendMessage(text);
});

$id('chatMessageInput')?.addEventListener('keypress', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    $id('sendTextBtn')?.click();
  }
});

/* ============================================================
   CLOSE CHAT
   ============================================================ */

$id('closeChatWindow')?.addEventListener('click', () => {
  const modal = $id('chatWindowModal');

  if (modal) modal.style.display = 'none';

  if (chatMessagesUnsub) {
    chatMessagesUnsub();
    chatMessagesUnsub = null;
  }

  activeChatUser = null;
  activeChatId = null;
});

console.log('✅ ReelHub Part 2 loaded');

/* =========================================
   PART 3/3 — PROFILE, UPLOAD, CLOUDINARY,
   SEARCH, NOTIFICATIONS & SETTINGS
========================================= */

// ---------- PROFILE ----------

async function renderProfile(userId = currentUser?.uid) {
    if (!userId) return;

    const container = document.getElementById("profilePage");
    if (!container) return;

    container.innerHTML = `<p class="loading">Loading profile...</p>`;

    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            container.innerHTML = `<p>Profile not found.</p>`;
            return;
        }

        const profile = userSnap.data();
        const isOwnProfile = userId === currentUser.uid;

        const postsQuery = query(
            collection(db, "posts"),
            where("userId", "==", userId)
        );

        const postsSnap = await getDocs(postsQuery);
        const posts = postsSnap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        container.innerHTML = `
            <div class="profile-header">
                <img
                    class="profile-avatar"
                    src="${escapeHTML(profile.photoURL || "")}"
                    onerror="this.src='https://placehold.co/100x100'"
                    alt="Profile"
                >

                <h2>${escapeHTML(profile.displayName || "User")}</h2>
                <p>@${escapeHTML(profile.username || "user")}</p>
                <p>${escapeHTML(profile.bio || "")}</p>

                <div class="profile-stats">
                    <span><b>${posts.length}</b> Posts</span>
                    <span><b>${Number(profile.followersCount || 0)}</b> Followers</span>
                    <span><b>${Number(profile.followingCount || 0)}</b> Following</span>
                </div>

                ${isOwnProfile
                    ? `<button id="editProfileBtn">Edit Profile</button>`
                    : `<button id="followProfileBtn">Follow</button>`
                }
            </div>

            <div class="profile-posts" id="profilePosts">
                ${posts.length
                    ? posts.map(post => `
                        <div class="profile-post">
                            <img
                                src="${escapeHTML(post.thumbnail || post.mediaUrl || "")}"
                                alt="Post"
                            >
                        </div>
                    `).join("")
                    : `<p>No posts yet.</p>`
                }
            </div>
        `;

        document.getElementById("editProfileBtn")
            ?.addEventListener("click", editProfile);

        document.getElementById("followProfileBtn")
            ?.addEventListener("click", () => followUser(userId));

    } catch (error) {
        console.error("Profile error:", error);
        container.innerHTML = `<p>Could not load profile.</p>`;
    }
}


// ---------- EDIT PROFILE ----------

async function editProfile() {
    const newName = prompt(
        "Enter your display name:",
        currentProfile?.displayName || ""
    );

    if (newName === null) return;

    const newBio = prompt(
        "Enter your bio:",
        currentProfile?.bio || ""
    );

    if (newBio === null) return;

    try {
        await updateDoc(doc(db, "users", currentUser.uid), {
            displayName: newName.trim(),
            bio: newBio.trim()
        });

        currentProfile.displayName = newName.trim();
        currentProfile.bio = newBio.trim();

        showToast("Profile updated!");
        renderProfile();

    } catch (error) {
        console.error(error);
        showToast("Profile update failed.");
    }
}


// ---------- FOLLOW USER ----------

async function followUser(userId) {
    if (!currentUser || userId === currentUser.uid) return;

    try {
        const followId = `${currentUser.uid}_${userId}`;
        const followRef = doc(db, "follows", followId);
        const followSnap = await getDoc(followRef);

        if (followSnap.exists()) {
            showToast("Already following.");
            return;
        }

        await setDoc(followRef, {
            followerId: currentUser.uid,
            followingId: userId,
            createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, "users", userId), {
            followersCount: increment(1)
        });

        await updateDoc(doc(db, "users", currentUser.uid), {
            followingCount: increment(1)
        });

        showToast("Followed successfully!");
        renderProfile(userId);

    } catch (error) {
        console.error(error);
        showToast("Could not follow user.");
    }
}


// ---------- SEARCH PAGE ----------

function renderSearchPage() {
    const container = document.getElementById("searchPage");
    if (!container) return;

    container.innerHTML = `
        <div class="search-container">
            <h2>Search Users</h2>
            <input
                type="text"
                id="userSearchInput"
                placeholder="Search username..."
            >
            <div id="searchResults"></div>
        </div>
    `;

    const input = document.getElementById("userSearchInput");

    input?.addEventListener("input", async () => {
        const searchText = input.value.trim().toLowerCase();
        const results = document.getElementById("searchResults");

        if (!results) return;

        if (searchText.length < 2) {
            results.innerHTML = "";
            return;
        }

        results.innerHTML = `<p>Searching...</p>`;

        try {
            const usersQuery = query(
                collection(db, "users"),
                orderBy("username"),
                startAt(searchText),
                endAt(searchText + "\uf8ff"),
                limit(10)
            );

            const snapshot = await getDocs(usersQuery);

            results.innerHTML = snapshot.empty
                ? `<p>No users found.</p>`
                : snapshot.docs.map(d => {
                    const user = d.data();

                    return `
                        <div class="search-user">
                            <img
                                src="${escapeHTML(user.photoURL || "")}"
                                onerror="this.src='https://placehold.co/40x40'"
                                alt=""
                            >
                            <span>${escapeHTML(user.displayName || "User")}</span>
                            <button
                                onclick="renderProfile('${d.id}')"
                            >View</button>
                        </div>
                    `;
                }).join("");

        } catch (error) {
            console.error(error);
            results.innerHTML = `<p>Search failed.</p>`;
        }
    });
}


// ---------- NOTIFICATIONS PAGE ----------

async function renderNotificationsPage() {
    const container = document.getElementById("notificationsPage");
    if (!container || !currentUser) return;

    container.innerHTML = `
        <h2>Notifications</h2>
        <p>No notifications available yet.</p>
    `;
}


// ---------- UPLOAD MODAL ----------

function openUploadModal() {
    const modal = document.getElementById("uploadModal");

    if (!modal) {
        showToast("Upload modal not found in HTML.");
        return;
    }

    modal.style.display = "flex";
}

function closeUploadModal() {
    const modal = document.getElementById("uploadModal");
    if (modal) modal.style.display = "none";

    selectedUploadFile = null;

    const fileInput = document.getElementById("uploadFileInput");
    if (fileInput) fileInput.value = "";

    const preview = document.getElementById("uploadPreview");
    if (preview) preview.innerHTML = "";
}


// ---------- SELECT UPLOAD FILE ----------

function setupUploadEvents() {
    const fileInput = document.getElementById("uploadFileInput");

    fileInput?.addEventListener("change", event => {
        const file = event.target.files?.[0];
        if (!file) return;

        const isPhoto = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isPhoto && !isVideo) {
            showToast("Please select an image or video.");
            fileInput.value = "";
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            showToast("File size must be under 100 MB.");
            fileInput.value = "";
            return;
        }

        selectedUploadFile = file;

        const preview = document.getElementById("uploadPreview");

        if (preview) {
            const url = URL.createObjectURL(file);

            preview.innerHTML = isPhoto
                ? `<img src="${url}" alt="Preview" style="max-width:100%">`
                : `<video src="${url}" controls style="max-width:100%"></video>`;
        }
    });

    document.getElementById("uploadSubmitBtn")
        ?.addEventListener("click", uploadPost);

    document.getElementById("uploadCloseBtn")
        ?.addEventListener("click", closeUploadModal);
}


// ---------- CLOUDINARY UPLOAD ----------

async function uploadToCloudinary(file, type = "video") {
    const isPhoto = file.type.startsWith("image/");

    const account = type === "story"
        ? CLOUDINARY_ACCOUNTS.stories
        : CLOUDINARY_ACCOUNTS.videos;

    const resourceType = isPhoto ? "image" : "video";

    if (!account?.cloudName || !account?.uploadPreset) {
        throw new Error("Cloudinary configuration missing.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", account.uploadPreset);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${account.cloudName}/${resourceType}/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Cloudinary upload failed.");
    }

    return {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType
    };
}


// ---------- UPLOAD POST ----------

async function uploadPost() {
    if (!currentUser) {
        showToast("Please login first.");
        return;
    }

    if (!selectedUploadFile) {
        showToast("Please select a file.");
        return;
    }

    const captionInput = document.getElementById("uploadCaption");
    const caption = captionInput?.value?.trim() || "";

    const submitButton = document.getElementById("uploadSubmitBtn");

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Uploading...";
    }

    try {
        const file = selectedUploadFile;
        const isPhoto = file.type.startsWith("image/");

        const uploadResult = await uploadToCloudinary(
            file,
            isPhoto ? "photo" : "video"
        );

        await addDoc(collection(db, "posts"), {
            userId: currentUser.uid,
            username: currentProfile?.username || "",
            displayName: currentProfile?.displayName || "",
            userPhoto: currentProfile?.photoURL || "",
            caption,
            mediaUrl: uploadResult.url,
            publicId: uploadResult.publicId,
            mediaType: isPhoto ? "photo" : "video",
            likes: [],
            likesCount: 0,
            commentsCount: 0,
            sharesCount: 0,
            views: 0,
            createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, "users", currentUser.uid), {
            videoCount: increment(1)
        });

        showToast("Post uploaded successfully!");
        closeUploadModal();

        if (typeof loadPosts === "function") {
            await loadPosts();
        }

        if (typeof renderHomeFeed === "function") {
            await renderHomeFeed();
        }

        document.querySelector('[data-page="home"]')?.click();

    } catch (error) {
        console.error("Upload error:", error);
        showToast(error.message || "Upload failed.");

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Upload";
        }
    }
}


// ---------- SETTINGS ----------

function openSettings() {
    const modal = document.getElementById("settingsModal");

    if (modal) {
        modal.style.display = "flex";
    } else {
        showToast("Settings modal not found.");
    }
}

function closeSettings() {
    const modal = document.getElementById("settingsModal");
    if (modal) modal.style.display = "none";
}


// ---------- LOGOUT ----------

async function logoutUser() {
    try {
        await signOut(auth);
        showToast("Logged out successfully.");
    } catch (error) {
        console.error(error);
        showToast("Logout failed.");
    }
}


// ---------- INITIALIZE PART 3 ----------

document.addEventListener("DOMContentLoaded", () => {
    setupUploadEvents();

    document.getElementById("settingsCloseBtn")
        ?.addEventListener("click", closeSettings);

    document.getElementById("logoutBtn")
        ?.addEventListener("click", logoutUser);
});
