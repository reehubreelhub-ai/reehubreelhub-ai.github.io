/* ============================================================
   ReelHub — payment.js (Standalone Premium Payment Module)
   Yeh file alag se load hogi, app.js se independent hai.
   ============================================================ */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, addDoc, getDocs, collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyC6421R1kr0jYwUJFbjB2YzIerlJw_cdLc",
  authDomain: "reelhub-24616.firebaseapp.com",
  projectId: "reelhub-24616",
  storageBucket: "reelhub-24616.appspot.com",
  messagingSenderId: "397521504045",
  appId: "1:397521504045:web:bf6d3652a7375fd632b5a4",
  measurementId: "G-81RN37XN6H"
};

/* Existing app use karo, dubara initialize mat karo */
const app = getApps()[0] || initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* Cloudinary (screenshot ke liye) */
const CLOUDINARY = {
  cloudName: "fepzqr9t",
  apiKey: "287332161532267",
  preset: "reelhub_story"
};

/* State */
let currentUser = null;
let currentProfile = null;
let currentPayAmount = 0;
let currentPayDays = 0;
let payTimerInterval = null;

/* User track karo */
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) currentProfile = snap.data();
    } catch (e) { console.warn('Profile load failed:', e); }
  } else {
    currentProfile = null;
  }
});

/* Toast helper */
function payToast(msg) {
  const existing = document.getElementById('pay-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'pay-toast';
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1e1e28;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;z-index:10000;box-shadow:0 8px 20px rgba(0,0,0,0.6);border:1px solid #333;max-width:90%;text-align:center;`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s';
    setTimeout(() => t.remove(), 300);
  }, 2500);
}

/* Screenshot Cloudinary Upload */
function uploadScreenshot(file, onProgress) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY.preset);
    formData.append('api_key', CLOUDINARY.apiKey);
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
        try { const d = JSON.parse(xhr.responseText); if (d.error?.message) errMsg = d.error.message; } catch (e) {}
        reject(new Error(errMsg));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));
    xhr.send(formData);
  });
}

/* Modal Open & Plans Load */
async function openPremiumModal() {
  document.getElementById('premiumModal').classList.add('show');
  document.getElementById('premiumPlansList').style.display = 'block';
  document.getElementById('premiumQrView').style.display = 'none';

  const container = document.getElementById('dynamicPlansContainer');
  container.innerHTML = '<div style="color:#888; width:100%; text-align:center;">Loading plans...</div>';

  try {
    const snap = await getDocs(collection(db, 'payment_plans'));
    if (snap.empty) {
      container.innerHTML = '<div style="color:#ff4d4d; width:100%; text-align:center; padding:20px;">Admin has not added any plans yet.</div>';
      return;
    }
    container.innerHTML = '';
    const plans = snap.docs.map(d => d.data()).sort((a, b) => a.amount - b.amount);
    plans.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'btn-outline';
      btn.style.cssText = 'flex:1; min-width:80px; padding:15px 10px; border-color:#ff2e63; margin:5px; border-radius:12px; cursor:pointer;';
      btn.innerHTML = `<b style="font-size:20px; color:#ff2e63;">₹${p.amount}</b><br><span style="font-size:12px; color:#aaa;">${p.days} Days</span>`;
      btn.onclick = () => startPayment(p.amount, p.days);
      container.appendChild(btn);
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div style="color:#ff4d4d; width:100%; text-align:center;">Error loading plans.</div>';
  }
}

/* Payment Start (QR + Timer) */
async function startPayment(amount, days) {
  if (!currentUser) { payToast('❌ Please login first'); return; }
  currentPayAmount = amount;
  currentPayDays = days;

  document.getElementById('premiumPlansList').style.display = 'none';
  document.getElementById('premiumQrView').style.display = 'block';
  document.getElementById('payAmountText').innerText = `Pay ₹${amount}`;
  document.getElementById('paymentUploadWrap').style.display = 'none';
  document.getElementById('paymentTimerWrap').style.display = 'block';
  document.getElementById('paymentStatusMsg').innerText = '';

  try {
    const snap = await getDoc(doc(db, 'admin_config', 'payment'));
    if (snap.exists()) {
      document.getElementById('payQrImage').src = snap.data().qrUrl || 'https://via.placeholder.com/200?text=No+QR';
      document.getElementById('payUpiId').innerText = snap.data().upiId || 'Not Set';
    } else {
      document.getElementById('payQrImage').src = 'https://via.placeholder.com/200?text=No+QR';
      document.getElementById('payUpiId').innerText = 'Not Set';
    }
  } catch (e) {}

  let timeLeft = 30;
  const timerEl = document.getElementById('payTimerVal');
  timerEl.innerText = timeLeft;
  if (payTimerInterval) clearInterval(payTimerInterval);
  payTimerInterval = setInterval(() => {
    timeLeft--;
    timerEl.innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(payTimerInterval);
      document.getElementById('paymentTimerWrap').style.display = 'none';
      document.getElementById('paymentUploadWrap').style.display = 'block';
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  }, 1000);
}

/* Screenshot Upload Handler */
document.addEventListener('DOMContentLoaded', () => {
  const screenshotInput = document.getElementById('paymentScreenshot');
  if (!screenshotInput) return;
  screenshotInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!currentUser || !currentProfile) { payToast('❌ Login required'); return; }
    if (!file.type.startsWith('image/')) { alert('Only image allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return; }

    const msgEl = document.getElementById('paymentStatusMsg');
    msgEl.style.color = '#ff8a00';
    msgEl.innerText = 'Uploading screenshot...';

    try {
      const res = await uploadScreenshot(file, (p) => { msgEl.innerText = `Uploading... ${p}%`; });
      await addDoc(collection(db, 'payment_requests'), {
        userId: currentUser.uid,
        userName: currentProfile.name,
        userHandle: currentProfile.user,
        amount: currentPayAmount,
        days: currentPayDays,
        screenshotUrl: res.secure_url,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      msgEl.style.color = '#4ade80';
      msgEl.innerText = '✅ Sent! Admin will verify soon.';
      setTimeout(() => {
        document.getElementById('premiumModal').classList.remove('show');
        payToast('Payment request sent to admin!');
      }, 3000);
    } catch (err) {
      console.error(err);
      msgEl.style.color = '#ff4d4d';
      msgEl.innerText = '❌ Upload failed. Try again.';
    }
  });
});

/* Globals expose karo so HTML buttons call these */
window.openPremiumModal = openPremiumModal;
window.startPayment = startPayment;

console.log('✅ Payment module loaded successfully');