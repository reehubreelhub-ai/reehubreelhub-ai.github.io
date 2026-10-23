/* ============================================================
   ReelHub — payment.js (FINAL V2)
   ✅ Default Plans: ₹1/1Day, ₹29/1Month, ₹99/1Year
   ✅ Step-by-Step Flow: Amount → Choose App → Pay
   ✅ Auto QR + UPI Deep Links
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const CLOUDINARY = {
  cloudName: "fepzqr9t",
  apiKey: "287332161532267",
  preset: "reelhub_story"
};

/* ============================================================
   ✅ DEFAULT PLANS (Used when admin has no custom plans)
   ============================================================ */
const DEFAULT_PLANS = [
  { amount: 1,  days: 1,   label: '1 Day',   badge: null },
  { amount: 29, days: 30,  label: '1 Month', badge: 'POPULAR' },
  { amount: 99, days: 365, label: '1 Year',  badge: 'BEST VALUE' }
];

/* ============================================================
   UPI APPS LIST
   ============================================================ */
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
let selectedApp = null;
let uploadedScreenshotUrl = null;
let qrInstance = null;
let timerInterval = null;

onAuthStateChanged(auth, (user) => {
  if (user) currentUser = user;
});

/* ============================================================
   ✅ OPEN PREMIUM MODAL — Step 1: Show Plans
   ============================================================ */
window.openPremiumModal = async function() {
  const modal = document.getElementById('premiumModal');
  const container = document.getElementById('dynamicPlansContainer');
  if (!modal || !container) return;

  // Reset views
  document.getElementById('view1-plans').style.display = 'block';
  document.getElementById('view2-apps').style.display = 'none';
  document.getElementById('view3-payment').style.display = 'none';
  document.getElementById('premiumModalTitle').textContent = '💎 Buy Blue Tick';
  document.getElementById('customPayAmount').value = '';
  container.innerHTML = '<div style="color:#888; grid-column:1/-1; text-align:center; padding:20px;">Loading plans...</div>';

  modal.classList.add('show');

  try {
    // 1. Load Admin UPI
    const paySnap = await getDoc(doc(db, 'admin_config', 'payment'));
    if (paySnap.exists()) {
      adminUpi = paySnap.data().upiId || '';
      adminPayeeName = paySnap.data().payeeName || 'ReelHub';
    }

    if (!adminUpi) {
      container.innerHTML = '<div style="color:#ff4d4d; grid-column:1/-1; text-align:center; padding:20px;">⚠️ Admin has not configured UPI yet. Please try again later.</div>';
      return;
    }

    // 2. Load Plans (custom from admin or defaults)
    let plans = [];
    try {
      const snap = await getDocs(collection(db, 'payment_plans'));
      if (!snap.empty) {
        plans = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            amount: Number(data.amount) || 0,
            days: Number(data.days) || 0,
            label: formatDaysLabel(Number(data.days)),
            badge: null
          };
        });
      }
    } catch (e) {
      console.warn('Could not load custom plans, using defaults', e);
    }

    // If no custom plans, use DEFAULT_PLANS
    if (plans.length === 0) {
      plans = DEFAULT_PLANS;
    } else {
      // Sort custom plans by amount
      plans.sort((a, b) => a.amount - b.amount);
      // Mark middle one as POPULAR
      if (plans.length >= 3) {
        plans[1].badge = 'POPULAR';
        plans[plans.length - 1].badge = 'BEST VALUE';
      } else if (plans.length === 2) {
        plans[1].badge = 'POPULAR';
      }
    }

    // 3. Render Plan Cards
    container.innerHTML = '';
    plans.forEach(p => {
      const card = document.createElement('div');
      card.style.cssText = `
        background:#0a0a12;
        border:2px solid ${p.badge ? '#ff2e63' : '#2a2a38'};
        border-radius:14px;
        padding:18px 10px;
        cursor:pointer;
        transition:0.2s;
        position:relative;
        text-align:center;
      `;

      if (p.badge) {
        card.innerHTML = `<div style="position:absolute; top:-8px; left:50%; transform:translateX(-50%); background:#ff2e63; color:#fff; font-size:8px; font-weight:800; padding:3px 10px; border-radius:10px; letter-spacing:0.5px; white-space:nowrap;">${p.badge}</div>`;
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

      // Hover effect
      card.onmouseover = () => card.style.transform = 'translateY(-3px)';
      card.onmouseout = () => card.style.transform = 'translateY(0)';

      container.appendChild(card);
    });

  } catch (err) {
    console.error('Payment modal error:', err);
    container.innerHTML = '<div style="color:#ff4d4d; grid-column:1/-1; text-align:center; padding:20px;">Failed to load. Please retry.</div>';
  }
};

/* ============================================================
   Format Days into Label
   ============================================================ */
function formatDaysLabel(days) {
  if (days === 1) return '1 Day';
  if (days === 7) return '1 Week';
  if (days === 30) return '1 Month';
  if (days === 90) return '3 Months';
  if (days === 180) return '6 Months';
  if (days === 365) return '1 Year';
  return days + ' Days';
}

/* ============================================================
   Custom Amount Input
   ============================================================ */
document.getElementById('customPayAmount')?.addEventListener('change', (e) => {
  const val = parseInt(e.target.value, 10);
  if (val && val > 0) {
    selectedAmount = val;
    // Default: 30 days for custom amount, unless matches default plans
    const matched = DEFAULT_PLANS.find(p => p.amount === val);
    selectedDays = matched ? matched.days : 30;
    selectedLabel = matched ? matched.label : '30 Days';
    showAppSelection();
  }
});

/* ============================================================
   ✅ STEP 2: Choose UPI App
   ============================================================ */
function showAppSelection() {
  document.getElementById('view1-plans').style.display = 'none';
  document.getElementById('view2-apps').style.display = 'block';
  document.getElementById('view3-payment').style.display = 'none';
  document.getElementById('premiumModalTitle').textContent = '📱 Choose Payment Method';
  document.getElementById('view2Amount').textContent = selectedAmount;

  // Update the sub-text to show validity
  const subText = document.querySelector('#view2-apps p');
  if (subText) {
    subText.textContent = `You will get Blue Tick for ${selectedLabel || (selectedDays + ' days')}`;
  }

  const grid = document.getElementById('upiAppsGrid');
  grid.innerHTML = '';

  UPI_APPS.forEach(app => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      background:#1a1a24;
      border:1px solid #333;
      border-radius:14px;
      padding:18px 8px;
      cursor:pointer;
      transition:0.2s;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:8px;
    `;
    btn.innerHTML = `
      <div style="font-size:32px; line-height:1;">${app.icon}</div>
      <div style="font-size:11px; font-weight:700; color:#fff; text-align:center;">${app.name}</div>
    `;

    btn.onmouseover = () => {
      btn.style.borderColor = '#ff2e63';
      btn.style.background = '#1e1e2e';
    };
    btn.onmouseout = () => {
      btn.style.borderColor = '#333';
      btn.style.background = '#1a1a24';
    };

    btn.onclick = () => handleAppSelect(app);
    grid.appendChild(btn);
  });
}

/* ============================================================
   Back Buttons
   ============================================================ */
window.paymentGoBack = function() {
  document.getElementById('view1-plans').style.display = 'block';
  document.getElementById('view2-apps').style.display = 'none';
  document.getElementById('view3-payment').style.display = 'none';
  document.getElementById('premiumModalTitle').textContent = '💎 Buy Blue Tick';
};

window.paymentGoBackToApps = function() {
  clearInterval(timerInterval);
  document.getElementById('view2-apps').style.display = 'block';
  document.getElementById('view3-payment').style.display = 'none';
  document.getElementById('premiumModalTitle').textContent = '📱 Choose Payment Method';
};

/* ============================================================
   ✅ STEP 3: Open Selected App
   ============================================================ */
function handleAppSelect(app) {
  selectedApp = app;

  document.getElementById('view2-apps').style.display = 'none';
  document.getElementById('view3-payment').style.display = 'block';
  document.getElementById('premiumModalTitle').textContent = '💳 Complete Payment';

  document.getElementById('view3AppName').textContent = app.icon + ' ' + app.name;
  document.getElementById('view3Amount').textContent = selectedAmount;
  document.getElementById('view3PayeeName').textContent = adminPayeeName;
  document.getElementById('view3Upi').textContent = adminUpi;

  // Build UPI Link
  const upiLink = buildUpiLink(selectedAmount);

  // Generate QR
  generatePaymentQR(upiLink);

  // Setup Pay Button
  const payBtn = document.getElementById('view3PayBtn');
  payBtn.textContent = `💳 Open ${app.name}`;
  payBtn.onclick = () => openUpiApp(upiLink, app.scheme);

  // Reset upload state
  uploadedScreenshotUrl = null;
  document.getElementById('paymentStatusMsg').textContent = '';
  document.getElementById('view3QRWrap').style.display = 'none';

  // Show timer
  startPaymentTimer();
}

/* ============================================================
   Build UPI Link
   ============================================================ */
function buildUpiLink(amount) {
  return `upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=${encodeURIComponent(adminPayeeName)}&am=${amount}&cu=INR`;
}

function buildAppLink(upiLink, scheme) {
  if (scheme === 'upi') return upiLink;
  // Convert upi:// to app-specific scheme
  return upiLink.replace('upi://', `${scheme}://`);
}

/* ============================================================
   Open UPI App
   ============================================================ */
function openUpiApp(upiLink, scheme) {
  const appLink = buildAppLink(upiLink, scheme);

  if (isMobile()) {
    try {
      window.location.href = appLink;

      // Fallback: if app doesn't open in 2.5 sec, try generic upi://
      setTimeout(() => {
        if (!document.hidden) {
          window.location.href = upiLink;
        }
      }, 2500);
    } catch (e) {
      window.location.href = upiLink;
    }
  } else {
    // Desktop - show QR
    document.getElementById('view3QRWrap').style.display = 'block';
    showPaymentStatus('💻 Desktop detected. Scan QR or copy UPI ID above.', '#4ea8ff');
  }
}

/* ============================================================
   Generate QR Code
   ============================================================ */
function generatePaymentQR(upiLink) {
  const qrContainer = document.getElementById('view3QRContainer');
  qrContainer.innerHTML = '';
  try {
    qrInstance = new QRCode(qrContainer, {
      text: upiLink,
      width: 200,
      height: 200,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch (e) {
    console.error('QR generation failed:', e);
  }
}

window.toggleQRView = function() {
  const qrWrap = document.getElementById('view3QRWrap');
  qrWrap.style.display = qrWrap.style.display === 'none' ? 'block' : 'none';
};

/* ============================================================
   Payment Timer
   ============================================================ */
function startPaymentTimer() {
  clearInterval(timerInterval);
  const timerWrap = document.getElementById('view3TimerWrap');
  if (timerWrap) {
    timerWrap.innerHTML = `<span style="font-size:13px; color:#ff2e63; font-weight:700;">⏳ Payment complete karo, phir screenshot upload karo</span>`;
  }
}

/* ============================================================
   Screenshot Upload
   ============================================================ */
document.getElementById('paymentScreenshot')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showPaymentStatus('❌ Max 5 MB allowed', '#ff4d4d');
    return;
  }

  showPaymentStatus('⏳ Uploading screenshot...', '#4ea8ff');

  try {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', CLOUDINARY.preset);
    form.append('api_key', CLOUDINARY.apiKey);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`;
    const res = await fetch(url, { method: 'POST', body: form });
    const data = await res.json();

    if (!data.secure_url) throw new Error('Upload failed');

    uploadedScreenshotUrl = data.secure_url;
    showPaymentStatus('✅ Screenshot uploaded. Submitting request...', '#4ade80');

    await submitPaymentRequest();

  } catch (err) {
    console.error(err);
    showPaymentStatus('❌ Upload failed. Please try again.', '#ff4d4d');
  }
});

/* ============================================================
   Submit Payment Request to Firestore
   ============================================================ */
async function submitPaymentRequest() {
  if (!currentUser) {
    showPaymentStatus('❌ Please login first', '#ff4d4d');
    return;
  }

  try {
    await addDoc(collection(db, 'payment_requests'), {
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      userHandle: '',
      amount: selectedAmount,
      days: selectedDays,
      label: selectedLabel,
      screenshotUrl: uploadedScreenshotUrl,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    showPaymentStatus('🎉 Payment submitted! Admin will verify within 24 hours.', '#4ade80');

    setTimeout(() => {
      document.getElementById('premiumModal').classList.remove('show');
      // Reset for next time
      uploadedScreenshotUrl = null;
      selectedApp = null;
    }, 3000);

  } catch (err) {
    console.error('Submit error:', err);
    showPaymentStatus('❌ Failed to submit. Please try again or contact support.', '#ff4d4d');
  }
}

/* ============================================================
   Helpers
   ============================================================ */
function showPaymentStatus(msg, color) {
  const el = document.getElementById('paymentStatusMsg');
  if (el) {
    el.textContent = msg;
    el.style.color = color || '#4ade80';
  }
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

console.log("✅ payment.js V2 loaded — Plans: ₹1/1Day, ₹29/1Month, ₹99/1Year");