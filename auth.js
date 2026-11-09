/* ============================================================
   auth.js — Email, Google, & Phone OTP (DEBUG VERSION)
   ============================================================ */

import {
  auth, db,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut,
  sendPasswordResetEmail, sendEmailVerification,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, 
  RecaptchaVerifier, signInWithPhoneNumber,
  doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp
} from './firebase-config.js';

window.appState = { currentUser: null, currentProfile: null, ready: false };
const $id = (id) => document.getElementById(id);

function generateReferralCode(username) {
  const base = (username || 'REEL').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'REEL';
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return base + suffix;
}

async function checkAndCreateProfile(user) {
  console.log("Checking profile for:", user.uid);
  const userRef = doc(db, 'users', user.uid);
  
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      console.log("Profile found!");
      return userSnap.data();
    }

    console.log("New user! Creating profile...");
    const defaultName = user.displayName || user.phoneNumber || 'ReelHub User';
    const defaultUsername = 'user_' + Math.random().toString(36).substring(2, 8);
    
    const newProfile = {
      uid: user.uid, name: defaultName, user: defaultUsername,
      email: user.email || '', phone: user.phoneNumber || '',
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
    console.log("Profile created successfully!");
    return newProfile;
  } catch (error) {
    console.error("❌ PROFILE ERROR:", error);
    alert("Database Error: " + error.message + "\n\nAapko Firestore Rules update karni hongi.");
    throw error; // Re-throw to stop login process
  }
}

onAuthStateChanged(auth, async (user) => {
  try {
    if (user) {
      console.log("✅ Auth State: Logged In", user.email);
      const profile = await checkAndCreateProfile(user);
      
      if (profile.banned) {
        await signOut(auth);
        alert('🚫 Account banned.');
        return;
      }

      window.appState.currentUser = user;
      window.appState.currentProfile = profile;
      window.appState.ready = true;

      console.log("Dispatching auth:login event...");
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { user, profile } }));
    } else {
      console.log("❌ Auth State: Logged Out");
      window.appState.currentUser = null;
      window.appState.currentProfile = null;
      window.appState.ready = true;
      window.dispatchEvent(new Event('auth:logout'));
    }
  } catch (error) {
    console.error("Auth State Error:", error);
  }
});

/* 1. EMAIL SIGNUP */
let isSigningUp = false;
$id('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  if (isSigningUp) return;

  const name = $id('signupName').value.trim();
  const user = $id('signupUser').value.trim().toLowerCase();
  const email = $id('signupEmail').value.trim().toLowerCase();
  const pass = $id('signupPass').value;
  const msg = $id('signupMsg'); const btn = $id('signupBtn');

  msg.textContent = '';
  if (!name || !user || !email || !pass) { msg.textContent = 'Fill all fields.'; return; }

  isSigningUp = true; btn.textContent = 'Creating...';

  try {
    console.log("Attempting Signup...");
    const uSnap = await getDocs(query(collection(db, 'users'), where('user', '==', user)));
    if (!uSnap.empty) throw new Error('Username taken.');

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    console.log("Auth Created, UID:", cred.user.uid);
    await sendEmailVerification(cred.user).catch(() => {});

    let referredBy = null, referredByCode = null;
    const pendingRef = localStorage.getItem('reelhub_ref_code');
    if (pendingRef) {
      // Referral logic...
      localStorage.removeItem('reelhub_ref_code');
    }

    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid, name, user, email, phone: '', bio: '', photo: '',
      followers: [], following: [], videoCount: 0, savedPosts: [], blockedUsers: [],
      isPrivate: false, verified: false, banned: false,
      referralCode: generateReferralCode(user), walletBalance: 0, referralCount: 0, referralEarnings: 0,
      referredBy, referredByCode, createdAt: serverTimestamp()
    });

    msg.style.color = '#4ade80'; msg.textContent = 'Account created! 🎉';
  } catch (err) {
    console.error("Signup Error:", err);
    msg.style.color = '#ff4d4d'; msg.textContent = err.message || 'Signup failed.';
  } finally {
    isSigningUp = false; btn.textContent = 'Sign Up';
  }
});

/* 2. EMAIL LOGIN */
let isLoggingIn = false;
$id('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  if (isLoggingIn) return;

  const email = $id('loginEmail').value.trim().toLowerCase();
  const pass = $id('loginPass').value;
  const msg = $id('loginMsg'); const btn = $id('loginBtn');

  msg.textContent = '';
  if (!email || !pass) { msg.textContent = 'Enter email and password.'; return; }

  isLoggingIn = true; btn.textContent = 'Logging in...';

  try {
    console.log("Attempting Login for:", email);
    await signInWithEmailAndPassword(auth, email, pass);
    console.log("Login Successful!");
  } catch (err) {
    console.error("Login Error:", err);
    msg.style.color = '#ff4d4d'; 
    msg.textContent = (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') ? 'Invalid email or password.' : err.message;
  } finally {
    isLoggingIn = false; btn.textContent = 'Log In';
  }
});

/* 3. GOOGLE LOGIN */
$id('googleLoginBtn')?.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    console.log("Redirecting to Google...");
    await signInWithRedirect(auth, provider);
  } catch (err) {
    console.error("Google Error:", err);
    alert('Google login failed: ' + err.message);
  }
});

getRedirectResult(auth).catch((error) => {
  console.error("Redirect result error:", error);
});

/* 4. PHONE OTP */
let confirmationResult = null;
let recaptchaVerifier = null;

function setupRecaptcha() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
  }
}

$id('sendOtpBtn')?.addEventListener('click', async () => {
  const phone = $id('phoneNumberInput').value.trim();
  const msg = $id('phoneMsg'); const btn = $id('sendOtpBtn');

  if (!phone) { msg.textContent = 'Enter phone number.'; return; }
  btn.textContent = 'Sending...'; msg.textContent = '';

  try {
    setupRecaptcha();
    confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    $id('phoneLoginStep1').style.display = 'none';
    $id('phoneLoginStep2').style.display = 'block';
  } catch (err) {
    console.error("OTP Error:", err);
    msg.textContent = err.message;
    if (recaptchaVerifier) { recaptchaVerifier.clear(); recaptchaVerifier = null; }
  } finally {
    btn.textContent = 'Send OTP';
  }
});

$id('verifyOtpBtn')?.addEventListener('click', async () => {
  const otp = $id('otpInput').value.trim();
  const msg = $id('phoneMsg'); const btn = $id('verifyOtpBtn');
  if (!otp) return;

  try {
    await confirmationResult.confirm(otp);
  } catch (err) {
    msg.textContent = 'Invalid OTP.';
  }
});

/* 5. FORGOT PASSWORD */
$id('forgotLink')?.addEventListener('click', () => {
  $id('forgotEmail').value = $id('loginEmail').value.trim();
  $id('forgotModal').classList.add('show');
});

$id('sendResetBtn')?.addEventListener('click', async () => {
  const email = $id('forgotEmail').value.trim();
  try {
    await sendPasswordResetEmail(auth, email);
    alert('Reset link sent!');
    $id('forgotModal').classList.remove('show');
  } catch (err) {
    alert(err.message);
  }
});

$id('logoutBtn')?.addEventListener('click', async () => {
  if (confirm('Log out?')) {
    await signOut(auth);
    window.location.reload();
  }
});