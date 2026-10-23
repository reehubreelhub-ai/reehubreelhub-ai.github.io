<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Payment System</title>
  <!-- QR Code Library -->
  <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
  <style>
    body { background: #0a0a0f; color: #fff; font-family: sans-serif; padding: 20px; }
    button { padding: 15px 30px; background: #ff2e63; color: #fff; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; }
    .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); align-items: center; justify-content: center; z-index: 9999; }
    .modal-overlay.show { display: flex; }
    .modal { background: #121218; padding: 20px; border-radius: 16px; width: 100%; max-width: 400px; text-align: center; }
    .plan { background: #0a0a12; border: 1px solid #333; padding: 15px; margin: 10px 0; border-radius: 10px; cursor: pointer; }
    .plan:hover { border-color: #ff2e63; }
  </style>
</head>
<body>

  <h2>Test Payment System</h2>
  <p style="color: #888; margin-bottom: 20px;">Agar neeche wala button kaam karta hai, toh aapka code theek hai. Problem sirf purane `index.html` me hai.</p>

  <button onclick="openPremiumModal()">💎 Buy Blue Tick (Test)</button>

  <!-- MODAL -->
  <div class="modal-overlay" id="premiumModal">
    <div class="modal">
      <h3 id="premiumModalTitle">💎 Buy Blue Tick</h3>
      
      <!-- View 1: Plans -->
      <div id="view1-plans">
        <div id="dynamicPlansContainer">
          <div style="color:#888;">Loading plans...</div>
        </div>
      </div>

      <!-- View 2: Apps (Hidden) -->
      <div id="view2-apps" style="display:none;">
        <h4>Amount: ₹<span id="view2Amount">0</span></h4>
        <div id="upiAppsGrid"></div>
        <button onclick="paymentGoBack()" style="margin-top:10px; background:#333;">← Back</button>
      </div>

      <!-- View 3: Payment (Hidden) -->
      <div id="view3-payment" style="display:none;">
        <h4 id="view3AppName">Paying with</h4>
        <p>Amount: ₹<span id="view3Amount">0</span></p>
        <p>To: <span id="view3PayeeName">ReelHub</span></p>
        <p>UPI: <span id="view3Upi">loading...</span></p>
        
        <button id="view3PayBtn" style="width:100%; margin-top:10px;">💳 Open Payment App</button>
        
        <div id="view3QRWrap" style="display:none; background:#fff; padding:10px; margin-top:10px;">
          <div id="view3QRContainer"></div>
        </div>
        
        <div id="paymentStatusMsg" style="color:#4ade80; margin-top:10px;"></div>
      </div>

      <button onclick="document.getElementById('premiumModal').classList.remove('show')" style="margin-top:20px; background:#333;">Close</button>
    </div>
  </div>

  <!-- SCRIPT -->
  <script type="module">
    import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
    import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyC6421R1kr0jYwUJFbjB2YzIerlJw_cdLc",
      authDomain: "reelhub-24616.firebaseapp.com",
      projectId: "reelhub-24616",
      storageBucket: "reelhub-24616.appspot.com",
      messagingSenderId: "397521504045",
      appId: "1:397521504045:web:bf6d3652a7375fd632b5a4"
    };

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const DEFAULT_PLANS = [
      { amount: 1,  days: 1,   label: '1 Day' },
      { amount: 29, days: 30,  label: '1 Month' },
      { amount: 99, days: 365, label: '1 Year' }
    ];

    window.openPremiumModal = async function() {
      console.log("Button clicked!");
      document.getElementById('premiumModal').classList.add('show');
      
      const container = document.getElementById('dynamicPlansContainer');
      container.innerHTML = '<p>Loading...</p>';

      // Show default plans immediately
      container.innerHTML = '';
      DEFAULT_PLANS.forEach(p => {
        const div = document.createElement('div');
        div.className = 'plan';
        div.innerHTML = `<b>₹${p.amount}</b> - ${p.label}`;
        div.onclick = () => {
          document.getElementById('view1-plans').style.display = 'none';
          document.getElementById('view2-apps').style.display = 'block';
          document.getElementById('view2Amount').textContent = p.amount;
        };
        container.appendChild(div);
      });
    };

    window.paymentGoBack = function() {
      document.getElementById('view1-plans').style.display = 'block';
      document.getElementById('view2-apps').style.display = 'none';
    };
  </script>
</body>
</html>