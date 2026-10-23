/* ============================================================
   ReelHub — payment.js (APP VERSION — FINAL)
   ✅ Firebase duplicate-init fixed
   ✅ ₹1/1Day, ₹29/1Month, ₹99/1Year
   ✅ Step-by-Step UPI Flow
   ============================================================ */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, collection, getDocs, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6421R1kr0jYwUJFbjB2YzIerlJw_cdLc",
  authDomain: "reelhub-24616.firebaseapp.com",
  projectId: "reelhub-24616",
  storageBucket: "reelhub-24616.appspot.com",
  messagingSenderId: "397521504045",
  appId: "1:397521504045:web:bf6d3652a7375fd632b5a4"
};

/* ✅ FIX: Reuse app if already initialized */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const CLOUDINARY = {
  cloudName: "fepzqr9t",
  apiKey: "287332161532267",
  preset: "reelhub_story"
};

const DEFAULT_PLANS = [
  { amount: 1,  days: 1,   label: '1 Day',   badge: null },
  { amount: 29, days: 30,  label: '1 Month', badge: 'POPULAR' },
  { amount: 99, days: 365, label: '1 Year',  badge: 'BEST VALUE' }
];

const UPI_APPS = [
  { id: 'gpay',    name: 'Google Pay', icon: '🔵', scheme: 'tez' },
  { id: 'phonepe', name: 'PhonePe',    icon: '🟣', scheme: 'phonepe' },
  { id: 'paytm',   name: 'Paytm',      icon: '🔷', scheme: 'paytmmp' },
  { id: 'bhim',    name: 'BHIM',       icon: '🟠', scheme: 'bhim' },
  { id: 'amazon',  name: 'Amazon Pay', icon: '🟡', scheme: 'amazonpay' },
  { id: 'any',     name: 'Any UPI',    icon: '📱', scheme: 'upi' }
];

let currentUser = null;
let adminUpi = '';
let adminPayeeName = 'ReelHub';
let selectedAmount = 0;
let selectedDays = 0;
let selectedLabel = '';
let uploadedScreenshotUrl = null;

onAuthStateChanged(auth, (user) => {
  if (user) currentUser = user;
});

/* ============================================================
   OPEN PREMIUM MODAL
   ============================================================ */
window.openPremiumModal = async function() {
  console.log("🔵 Buy Button Clicked");

  const modal = document.getElementById('premiumModal');
  if (!modal) {
    alert("❌ Error: Premium Modal HTML not found!\nPlease update your index.html.");
    return;
  }

  const view1 = document.getElementById('view1-plans');
  const view2 = document.getElementById('view2-apps');
  const view3 = document.getElementById('view3-payment');
  const container = document.getElementById('dynamicPlansContainer');

  if (!view1 || !view2 || !view3 || !container) {
    alert("❌ Error: Old Premium Modal detected!\nPlease update your index.html with the new modal code.");
    return;
  }

  view1.style.display = 'block';
  view2.style.display = 'none';
  view3.style.display = 'none';
  document.getElementById('premiumModalTitle').textContent = '💎 Buy Blue Tick';
  
  const customAmt = document.getElementById('customPayAmount');
  if (customAmt) customAmt.value = '';

  modal.classList.add('show');
  renderPlans(DEFAULT_PLANS);

  try {
    const paySnap = await getDoc(doc(db, 'admin_config', 'payment'));
    if (paySnap.exists()) {
      adminUpi = paySnap.data().upiId || '';
      adminPayeeName = paySnap.data().payeeName || 'ReelHub';
    }

    if (!adminUpi) {
      container.innerHTML = '<div style="color:#ff4d4d; grid-column:1/-1; text-align:center; padding:20px;">⚠️ Admin has not set UPI yet.</div>';
      return;
    }

    const snap = await getDocs(collection(db, 'payment_plans'));
    if (!snap.empty) {
      const customPlans = snap.docs.map(d => {
        const data = d.data();
        return {
          amount: Number(data.amount) || 0,
          days: Number(data.days) || 0,
          label: formatDaysLabel(Number(data.days)),
          badge: null
        };
      });
      if (customPlans.length >= 3) {
        customPlans[1].badge = 'POPULAR';
        customPlans[customPlans.length - 1].badge = 'BEST VALUE';
      }
      renderPlans(customPlans);
    }
  } catch (err) {
    console.warn("Firebase fetch failed:", err);
  }
};

function renderPlans(plans) {
  const container = document.getElementById('dynamicPlansContainer');
  if (!container) return;

  container.innerHTML = '';
  plans.forEach(p => {
    const card = document.createElement('div');
    card.style.cssText = `
      background:#0a0a12; border:2px solid ${p.badge ? '#ff2e63' : '#2a2a38'};
      border-radius:14px; padding:18px 10px; cursor:pointer;
      transition:0.2s; position:relative; text-align:center;
    `;

    if (p.badge) {
      card.innerHTML = `<div style="position:absolute; top:-8px; left:50%; transform:translateX(-50%); background:#ff2e63; color:#fff; font-size:8px; font-weight:800; padding:3px 10px; border-radius:10px; white-space:nowrap;">${p.badge}</div>`;
    }

    card.innerHTML += `
      <div style="font-size:26px; font-weight:900; color:#fff; margin-bottom:6px;">₹${p.amount}</div>
      <div style="font-size:12px; color:${p.badge ? '#ff2e63' : '#888'}; font-weight:700;">${p.label}</div>
    `;

    card.onclick = () => {
      selectedAmount = p.amount;
      selectedDays = p.days;
      selectedLabel = p.label;
      showAppSelection();
    };
    container.appendChild(card);
  });
}

function formatDaysLabel(days) {
  if (days === 1) return '1 Day';
  if (days === 7) return '1 Week';
  if (days === 30) return '1 Month';
  if (days === 90) return '3 Months';
  if (days === 365) return '1 Year';
  return days + ' Days';
}

document.getElementById('customPayAmount')?.addEventListener('change', (e) => {
  const val = parseInt(e.target.value, 10);
  if (val && val > 0) {
    selectedAmount = val;
    selectedDays = 30;
    selectedLabel = '30 Days';
    showAppSelection();
  }
});

function showAppSelection() {
  document.getElementById('view1-plans').style.display = 'none';
  document.getElementById('view2-apps').style.display = 'block';
  document.getElementById('premiumModalTitle').textContent = '📱 Choose Payment Method';
  document.getElementById('view2Amount').textContent = selectedAmount;

  const subText = document.querySelector('#view2-apps p');
  if (subText) subText.textContent = `You will get Blue Tick for ${selectedLabel}`;

  const grid = document.getElementById('upiAppsGrid');
  grid.innerHTML = '';

  UPI_APPS.forEach(app => {
    const btn = document.createElement('button');
    btn.style.cssText = `background:#1a1a24; border:1px solid #333; border-radius:14px; padding:18px 8px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:8px;`;
    btn.innerHTML = `
      <div style="font-size:32px;">${app.icon}</div>
      <div style="font-size:11px; font-weight:700; color:#fff;">${app.name}</div>
    `;
    btn.onclick = () => handleAppSelect(app);
    grid.appendChild(btn);
  });
}

window.paymentGoBack = function() {
  document.getElementById('view1-plans').style.display = 'block';
  document.getElementById('view2-apps').style.display = 'none';
  document.getElementById('view3-payment').style.display = 'none';
  document.getElementById('premiumModalTitle').textContent = '💎 Buy Blue Tick';
};

window.paymentGoBackToApps = function() {
  document.getElementById('view2-apps').style.display = 'block';
  document.getElementById('view3-payment').style.display = 'none';
  document.getElementById('premiumModalTitle').textContent = '📱 Choose Payment Method';
};

function handleAppSelect(app) {
  document.getElementById('view2-apps').style.display = 'none';
  document.getElementById('view3-payment').style.display = 'block';
  document.getElementById('premiumModalTitle').textContent = '💳 Complete Payment';

  document.getElementById('view3AppName').textContent = app.icon + ' ' + app.name;
  document.getElementById('view3Amount').textContent = selectedAmount;
  document.getElementById('view3PayeeName').textContent = adminPayeeName;
  document.getElementById('view3Upi').textContent = adminUpi || 'Not set';

  const upiLink = `upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=${encodeURIComponent(adminPayeeName)}&am=${selectedAmount}&cu=INR`;

  const qrContainer = document.getElementById('view3QRContainer');
  if (qrContainer && typeof QRCode !== 'undefined') {
    qrContainer.innerHTML = '';
    try {
      new QRCode(qrContainer, {
        text: upiLink, width: 200, height: 200,
        colorDark: '#000000', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } catch (e) { console.error(e); }
  }

  const payBtn = document.getElementById('view3PayBtn');
  payBtn.textContent = `💳 Open ${app.name}`;
  payBtn.onclick = () => {
    const appLink = app.scheme === 'upi' ? upiLink : upiLink.replace('upi://', `${app.scheme}://`);
    if (isMobile()) {
      window.location.href = appLink;
      setTimeout(() => {
        if (!document.hidden) window.location.href = upiLink;
      }, 2500);
    } else {
      document.getElementById('view3QRWrap').style.display = 'block';
      document.getElementById('paymentStatusMsg').textContent = '💻 Desktop: Scan QR code.';
    }
  };

  uploadedScreenshotUrl = null;
  document.getElementById('paymentStatusMsg').textContent = '';
  document.getElementById('view3QRWrap').style.display = 'none';
}

window.toggleQRView = function() {
  const qrWrap = document.getElementById('view3QRWrap');
  if (qrWrap) qrWrap.style.display = qrWrap.style.display === 'none' ? 'block' : 'none';
};

document.getElementById('paymentScreenshot')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showStatus('❌ Max 5 MB', '#ff4d4d');
    return;
  }

  showStatus('⏳ Uploading...', '#4ea8ff');

  try {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', CLOUDINARY.preset);
    form.append('api_key', CLOUDINARY.apiKey);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`, { method: 'POST', body: form });
    const data = await res.json();

    if (!data.secure_url) throw new Error('Upload failed');

    uploadedScreenshotUrl = data.secure_url;
    showStatus('✅ Uploaded. Submitting...', '#4ade80');

    if (!currentUser) {
      showStatus('❌ Please login first', '#ff4d4d');
      return;
    }

    await addDoc(collection(db, 'payment_requests'), {
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      amount: selectedAmount,
      days: selectedDays,
      label: selectedLabel,
      screenshotUrl: uploadedScreenshotUrl,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    showStatus('🎉 Submitted! Admin will verify in 24h.', '#4ade80');

    setTimeout(() => {
      document.getElementById('premiumModal').classList.remove('show');
    }, 3000);

  } catch (err) {
    console.error(err);
    showStatus('❌ Upload failed. Try again.', '#ff4d4d');
  }
});

function showStatus(msg, color) {
  const el = document.getElementById('paymentStatusMsg');
  if (el) {
    el.textContent = msg;
    el.style.color = color || '#4ade80';
  }
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

console.log("✅ payment.js loaded — App ready");