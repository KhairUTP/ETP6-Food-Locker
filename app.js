import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously, // Changed from email login
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAFANgyw3F5wuVdksyEwGbH33EtwH3bJlM",
  authDomain: "etp6-food-locker.firebaseapp.com",
  databaseURL: "https://etp6-food-locker-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "etp6-food-locker",
  storageBucket: "etp6-food-locker.firebasestorage.app",
  messagingSenderId: "567922131715",
  appId: "1:567922131715:web:5d9e7ee27b34957fb29f36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);

// UI elements
const controlBox = document.getElementById("controlBox");
const authMsg = document.getElementById("authMsg");
const badge = document.getElementById("statusBadge");

const gpioButtons = {
  gpio1: document.getElementById("gpio1Btn"),
  gpio2: document.getElementById("gpio2Btn"),
  gpio3: document.getElementById("gpio3Btn")
};

const gpioLabels = {
  gpio1: document.getElementById("gpio1Status"),
  gpio2: document.getElementById("gpio2Status"),
  gpio3: document.getElementById("gpio3Status")
};

// AUTO-LOGIN: Trigger anonymous sign-in immediately
const startApp = async () => {
  try {
    await signInAnonymously(auth);
  } catch (e) {
    authMsg.textContent = "Guest access error: " + e.message;
  }
};

startApp();

// Auth state monitor
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Hide loading message and show controls
    document.getElementById("authBox").style.display = "none";
    controlBox.style.display = "block";
    badge.className = "status-badge online";
    badge.textContent = "Online (Guest)";
    startListeners();
  } else {
    badge.className = "status-badge offline";
    badge.textContent = "Connecting...";
  }
});

// Listen to DB
function startListeners() {
  ["gpio1", "gpio2", "gpio3"].forEach((key) => {
    onValue(ref(db, "/" + key), (snapshot) => {
      let value = snapshot.val() ? 1 : 0;
      updateUI(key, value);
    });
  });

  // Button click
  Object.values(gpioButtons).forEach((btn) => {
    btn.onclick = () => {
      let gpio = btn.dataset.gpio;
      let newState = btn.classList.contains("on") ? 0 : 1;
      set(ref(db, "/" + gpio), newState);
    };
  });
}

// Update UI
function updateUI(key, val) {
  let btn = gpioButtons[key];
  let lab = gpioLabels[key];

  if (val === 1) {
    btn.classList.add("on");
    lab.textContent = "Status: ON";
    lab.style.color = "#9effae";
  } else {
    btn.classList.remove("on");
    lab.textContent = "Status: OFF";
    lab.style.color = "#d1d1d1";
  }
}
