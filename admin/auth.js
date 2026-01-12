import { auth } from '../firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');
const loginBtn = document.getElementById('login-btn');

// Check if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "/admin/index.html"; // Redirect to dashboard
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginBtn.textContent = "جاري الدخول...";
    loginBtn.disabled = true;
    errorMsg.classList.add('hidden');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "/admin/index.html";
    } catch (error) {
        console.error(error);
        loginBtn.textContent = "دخول";
        loginBtn.disabled = false;
        errorMsg.textContent = "فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.";
        errorMsg.classList.remove('hidden');
    }
});
