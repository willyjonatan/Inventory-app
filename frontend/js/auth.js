const API_URL = '/api';

// ============================================
// REGISTER
// ============================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!name || !email || !password || !confirmPassword) {
            alert('Semua field wajib diisi!');
            return;
        }
        
        if (!email.endsWith('@gmail.com')) {
            alert('Email harus menggunakan @gmail.com!');
            return;
        }
        
        if (password.length < 8) {
            alert('Password minimal 8 karakter!');
            return;
        }
        
        if (!/^[A-Z]/.test(password)) {
            alert('Password harus diawali huruf besar!');
            return;
        }
        
        if (!/[0-9]/.test(password)) {
            alert('Password harus mengandung angka!');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Password tidak sama!');
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
                alert('Registrasi berhasil! Silakan login.');
                window.location.href = 'login.html';
            } else {
                alert(data.error || 'Registrasi gagal');
            }
        } catch (error) {
            console.error('Register error:', error);
            alert('Koneksi error!');
        }
    });
}

// ============================================
// LOGIN
// ============================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert('Email dan password wajib diisi!');
            return;
        }
        
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
                alert('Login berhasil!');
                window.location.href = 'index.html';
            } else {
                alert(data.error || 'Login gagal');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Koneksi error!');
        }
    });
}

// ============================================
// TAMPILKAN USER
// ============================================
function displayUser() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl && user.name) {
        userNameEl.textContent = user.name;
        userAvatarEl.textContent = user.name.charAt(0).toUpperCase();
    }
    
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profileName && user.name) {
        profileName.textContent = user.name;
        profileEmail.textContent = user.email || 'user@email.com';
        profileAvatar.textContent = user.name.charAt(0).toUpperCase();
    }
}

if (window.location.pathname.includes('index.html')) {
    displayUser();
}

// ============================================
// SHOW PROFILE & LOGOUT
// ============================================
function showProfile() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

function logout() {
    if (confirm('Yakin ingin logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('profileDropdown');
    const userInfo = document.querySelector('.user-info');
    
    if (dropdown && userInfo) {
        if (!userInfo.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    }
});