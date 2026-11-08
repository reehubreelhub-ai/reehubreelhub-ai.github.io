/* ============================================================
   auth.js — Email, Google (Redirect), & Phone OTP Authentication
   ============================================================ */

import {
  auth, db,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut,
  sendPasswordResetEmail, sendEmailVerification,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, 
  RecaptchaVerifier, signInWithPhoneNumber,
  doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp
} from './firebase-config.js';

/* ✅ SHARED STATE (App.js isko padhega) */
window.appState = { currentUser: null, currentProfile: null, ready: false };

const $id = (id) => document.getElementById(id);

// Helper: Generate Referral Code
function generateReferralCode(username) {
  const base = (username || 'REEL').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'REEL';
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return base + suffix;
}

// Helper: Google/Phone login ke liye auto-profile create karna
async function checkAndCreateProfile(user) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  // Agar profile pehle se hai, toh wahi return karo
  if (userSnap.exists()) return userSnap.data();

  // Agar naya user hai (Google ya Phone se aaya)
  const defaultName = user.displayName || user.phoneNumber || 'ReelHub User';
  const defaultUsername = 'user_' + Math.random().toString(36).substring(2, 8);
  
  const newProfile = {
    uid: user.uid,
    name: defaultName,
    user: defaultUsername,
    email: user.email || '',
    phone: user.phoneNumber || '',
    bio: '', photo: user.photoURL || '',
    followers: [], following: [], videoCount: 0,
    savedPosts: [], blockedUsers: [],
    isPrivate: false, verified: false, banned: false,
    referralCode: generateReferralCode(defaultUsername),
    walletBalance: 0, referralCount: 0, referralEarnings: 0,
    referredBy: null, referredByCode: null,
    createdAt: serverTimestamp()
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

/* ============================================================
   MAIN CONTROLLER (Login/Logout par App.js ko signal bhejta hai)
   ============================================================ */
onAuthStateChanged(auth, async (user) => {
  try {
    if (user) {
      const profile = await checkAndCreateProfile(user);
      
      // Agar account banned hai
      if (profile.banned) {
        await signOut(auth);
        window.dispatchEvent(new CustomEvent('auth:error', { detail: '🚫 Account banned.' }));
        return;
      }

      window.appState.currentUser = user;
      window.appState.currentProfile = profile;
      window.appState.ready = true;

      // Signal App.js to open home screen
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { user, profile } }));
    } else {
      window.appState.currentUser = null;
      window.appState.currentProfile = null;
      window.appState.ready = true;
      
      // Signal App.js to show auth screen
      window.dispatchEvent(new Event('auth:logout'));
    }
  } catch (error) {
    console.error("Auth State Error:", error);
    window.dispatchEvent(new Event('auth:logout'));
    alert("Database Error: " + error.message + "\n(Check Firestore Rules)");
  }
});

/* ============================================================
   1. EMAIL SIGNUP
   ============================================================ */
let isSigningUp = false;
$id('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  if (isSigningUp) return;

  const name = $id('signupName').value.trim();
  const user = $id('signupUser').value.trim().toLowerCase();
  const email = $id('signupEmail').value.trim().toLowerCase();
  const pass = $id('signupPass').value;
  const msg = $id('signupMsg'); const btn = $id('signupBtn');

  msg.className = 'error-msg'; msg.textContent = '';
  if (!name || !user || !email || !pass) { msg.textContent = 'Fill all fields.'; return; }
  if (pass.length < 6) { msg.textContent = 'Password min 6 chars.'; return; }

  isSigningUp = true; btn.disabled = true; btn.textContent = 'Creating...';

  try {
    // Check if username is taken
    const uSnap = await getDocs(query(collection(db, 'users'), where('user', '==', user)));
    if (!uSnap.empty) throw new Error('Username taken.');

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await sendEmailVerification(cred.user).catch(() => {});

    // Referral Check
    let referredBy = null, referredByCode = null;
    const pendingRef = localStorage.getItem('reelhub_ref_code');
    if (pendingRef) {
      const rSnap = await getDocs(query(collection(db, 'users'), where('referralCode', '==', pendingRef)));
      if (!rSnap.empty && rSnap.docs[0].id !== cred.user.uid) {
        referredBy = rSnap.docs[0].id;
        referredByCode = pendingRef;
        await addDoc(collection(db, 'referrals'), {
          referrerId: referredBy, referredId: cred.user.uid,
          referredName: name, status: 'pending', createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'users', referredBy), {
          referralCount: (rSnap.docs[0].data().referralCount || 0) + 1
        });
      }
      localStorage.removeItem('reelhub_ref_code');
    }

    // Create User Profile
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid, name, user, email,
      phone: '', bio: '', photo: '',
      followers: [], following: [], videoCount: 0,
      savedPosts: [], blockedUsers: [],
      isPrivate: false, verified: false, banned: false,
      referralCode: generateReferralCode(user),
      walletBalance: 0, referralCount: 0, referralEarnings: 0,
      referredBy, referredByCode,
      createdAt: serverTimestamp()
    });

    msg.className = 'success-msg'; msg.textContent = 'Account created! 🎉';
  } catch (err) {
    msg.className = 'error-msg';
    msg.textContent = err.code === 'auth/email-already-in-use' ? 'Email already registered.' : (err.message || 'Signup failed.');
  } finally {
    isSigningUp = false; btn.disabled = false; btn.textContent = 'Sign Up';
  }
});

/* ============================================================
   2. EMAIL LOGIN
   ============================================================ */
let isLoggingIn = false;
$id('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  if (isLoggingIn) return;

  const email = $id('loginEmail').value.trim().toLowerCase();
  const pass = $id('loginPass').value;
  const msg = $id('loginMsg'); const btn = $id('loginBtn');

  msg.className = 'error-msg'; msg.textContent = '';
  if (!email || !pass) { msg.textContent = 'Enter email and password.'; return; }

  isLoggingIn = true; btn.disabled = true; btn.textContent = 'Logging in...';

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    msg.className = 'success-msg'; msg.textContent = 'Welcome back!';
  } catch (err) {
    msg.className = 'error-msg';
    msg.textContent = (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') ? 'Invalid email or password.' : (err.message || 'Login failed.');
  } finally {
    isLoggingIn = false; btn.disabled = false; btn.textContent = 'Log In';
  }
});

/* ============================================================
   3. GOOGLE LOGIN (REDIRECT METHOD)
   ============================================================ */
$id('googleLoginBtn')?.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const btn = $id('googleLoginBtn');

  try {
    if (btn) { btn.disabled = true; btn.textContent = 'Redirecting to Google...'; }
    await signInWithRedirect(auth, provider);
  } catch (err) {
    console.error('Google Redirect error:', err);
    alert('Google login failed: ' + err.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Continue with Google'; }
  }
});

// Handle redirect result (jab user Google se wapas aayega)
getRedirectResult(auth).catch((error) => {
  console.error("❌ Redirect result error:", error);
  const msg = $id('loginMsg');
  if (msg) { msg.className = 'error-msg'; msg.textContent = 'Google login failed: ' + error.message; }
});

/* ============================================================
   4. PHONE OTP LOGIN
   ============================================================ */
let confirmationResult = null;
let recaptchaVerifier = null;

function setupRecaptcha() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {}
    });
  }
}

$id('sendOtpBtn')?.addEventListener('click', async () => {
  const phone = $id('phoneNumberInput').value.trim();
  const msg = $id('phoneMsg'); const btn = $id('sendOtpBtn');

  if (!phone || phone.length < 10) { msg.textContent = 'Enter valid phone (+919876543210)'; return; }
  btn.disabled = true; btn.textContent = 'Sending...'; msg.textContent = '';

  try {
    setupRecaptcha();
    confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    $id('phoneLoginStep1').style.display = 'none';
    $id('phoneLoginStep2').style.display = 'block';
    msg.textContent = 'OTP sent successfully!';
  } catch (err) {
    msg.textContent = err.message || 'Failed to send OTP.';
    if (recaptchaVerifier) { recaptchaVerifier.clear(); recaptchaVerifier = null; }
  } finally {
    btn.disabled = false; btn.textContent = 'Send OTP';
  }
});

$id('verifyOtpBtn')?.addEventListener('click', async () => {
  const otp = $id('otpInput').value.trim();
  const msg = $id('phoneMsg'); const btn = $id('verifyOtpBtn');

  if (!otp || otp.length !== 6) { msg.textContent = 'Enter 6-digit OTP.'; return; }
  btn.disabled = true; btn.textContent = 'Verifying...';

  try {
    await confirmationResult.confirm(otp);
    // Success! onAuthStateChanged will handle the rest.
  } catch (err) {
    msg.textContent = 'Invalid OTP. Please try again.';
  } finally {
    btn.disabled = false; btn.textContent = 'Verify OTP';
  }
});

/* ============================================================
   5. FORGOT PASSWORD & LOGOUT
   ============================================================ */
$id('forgotLink')?.addEventListener('click', () => {
  $id('forgotEmail').value = $id('loginEmail').value.trim();
  $id('forgotModal').classList.add('show');
});

$id('sendResetBtn')?.addEventListener('click', async () => {
  const email = $id('forgotEmail').value.trim();
  const msg = $id('forgotMsg');
  if (!email) { msg.textContent = 'Enter email.'; return; }
  
  try {
    await sendPasswordResetEmail(auth, email);
    msg.className = 'success-msg'; msg.textContent = 'Reset link sent!';
  } catch (err) {
    msg.className = 'error-msg'; msg.textContent = err.message;
  }
});

$id('logoutBtn')?.addEventListener('click', async () => {
  if (confirm('Are you sure you want to log out?')) {
    await signOut(auth);
    // Page ko reload karna zaroori hai taaki state clear ho jaye
    window.location.reload(); 
  }
});