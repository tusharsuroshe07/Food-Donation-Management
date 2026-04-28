// frontend/js/auth.js
let isLoginMode = true;
// Pointing to our new Python Flask API running on port 5000!
const API_BASE = 'http://localhost:5000/api';

const authForm = document.getElementById('authForm');
const nameGroup = document.getElementById('nameGroup');
const roleGroup = document.getElementById('roleGroup');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const submitBtn = document.getElementById('submitBtn');
const toggleText = document.getElementById('toggleText');
const toggleLink = document.getElementById('toggleLink');
const messageBox = document.getElementById('messageBox');

function showMessage(text, isError) {
    messageBox.textContent = text;
    messageBox.className = isError ? 'msg-error' : 'msg-success';
    messageBox.classList.remove('hidden');
    setTimeout(() => { messageBox.classList.add('hidden'); }, 5000);
}

function toggleMode() {
    isLoginMode = !isLoginMode; 
    if (isLoginMode) {
        nameGroup.classList.add('hidden'); roleGroup.classList.add('hidden');
        formTitle.textContent = "Welcome Back!"; formSubtitle.textContent = "Login to your account.";
        submitBtn.textContent = "Login"; toggleText.textContent = "Don't have an account?"; toggleLink.textContent = "Register here";
    } else {
        nameGroup.classList.remove('hidden'); roleGroup.classList.remove('hidden');
        formTitle.textContent = "Join the Movement"; formSubtitle.textContent = "Sign up to donate or rescue food.";
        submitBtn.textContent = "Create Account"; toggleText.textContent = "Already have an account?"; toggleLink.textContent = "Login here";
    }
}

authForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (isLoginMode) {
        fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.jwt) {
                localStorage.setItem('food_jwt', data.jwt);
                localStorage.setItem('food_role', data.role);
                localStorage.setItem('food_name', data.name);
                window.location.href = `${data.role}.html`;
            } else {
                showMessage(data.message || "Login failed.", true);
            }
        })
        .catch(err => {
            console.error("Login Error:", err);
            showMessage("Server error. Check if Flask is running on port 5000.", true);
        });
    } else {
        const name = document.getElementById('name').value.trim();
        const role = document.getElementById('role').value;
        fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "User was successfully registered.") {
                showMessage("Registration successful! You can now login.", false);
                toggleMode();
            } else {
                showMessage(data.message || "Registration failed.", true);
            }
        })
        .catch(err => {
            console.error("Registration Error:", err);
            showMessage("Server error. Check if Flask is running.", true);
        });
    }
});

window.onload = function() {
    const token = localStorage.getItem('food_jwt');
    const role = localStorage.getItem('food_role');
    if (token && role) {
        window.location.href = `${role}.html`;
    }
}
