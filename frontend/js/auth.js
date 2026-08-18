const API_URL = 'http://localhost:3000/api';

// Get current page
const currentPage = window.location.pathname.split('/').pop();

// Login form
if (currentPage === 'login.html' || currentPage === '') {
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                showAlert(data.error || 'Login failed');
            }
        } catch (error) {
            showAlert('Connection error. Please try again.');
        }
    });
}

// Register form
if (currentPage === 'register.html') {
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showAlert('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            showAlert('Password must be at least 6 characters');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                showAlert(data.error || 'Registration failed');
            }
        } catch (error) {
            showAlert('Connection error. Please try again.');
        }
    });
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Show alert
function showAlert(message, type = 'error') {
    const alertEl = document.getElementById('alertMessage');
    if (alertEl) {
        alertEl.textContent = message;
        alertEl.className = `alert ${type}`;
        alertEl.style.display = 'block';
        
        setTimeout(() => {
            alertEl.style.display = 'none';
        }, 5000);
    }
}

// Protect pages (redirect to login if not authenticated)
if (currentPage === 'index.html' || currentPage === '') {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}