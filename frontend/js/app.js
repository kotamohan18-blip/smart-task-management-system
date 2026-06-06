// Global Configuration
const API_URL = 'http://localhost:5000/api';

// Global Utility for Toasts
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = type === 'success' ? '<i class="fas fa-check-circle text-success"></i>' :
               type === 'error' ? '<i class="fas fa-exclamation-circle text-danger"></i>' :
               '<i class="fas fa-info-circle text-primary"></i>';
               
    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Authentication Checks & Sidebar Population
document.addEventListener('DOMContentLoaded', () => {
    // 1. Password toggles
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });

    // 2. Mobile Menu
    const mobileOpen = document.querySelector('.mobile-menu-open');
    const mobileClose = document.querySelector('.mobile-menu-close');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileOpen && sidebar) {
        mobileOpen.addEventListener('click', () => sidebar.classList.add('open'));
    }
    if (mobileClose && sidebar) {
        mobileClose.addEventListener('click', () => sidebar.classList.remove('open'));
    }

    // 3. Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check saved theme
    let userTheme = localStorage.getItem('theme') || 'light';
    
    // Try to get from user profile if logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.preferences && user.preferences.theme) {
                userTheme = user.preferences.theme;
            }
        } catch(e) {}
    }

    if (userTheme === 'dark') {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        if (themeBtn) themeBtn.querySelector('i').className = 'fas fa-sun';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const isDark = body.classList.contains('dark-theme');
            const newTheme = isDark ? 'light' : 'dark';
            
            if (isDark) {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
                themeBtn.querySelector('i').className = 'fas fa-moon';
            } else {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
                themeBtn.querySelector('i').className = 'fas fa-sun';
            }
            
            localStorage.setItem('theme', newTheme);
            document.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: newTheme } }));
            
            // Sync with backend if logged in
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await fetch(`${API_URL}/users/profile`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ preferences: { theme: newTheme } })
                    });
                } catch(e) {}
            }
        });
    }

    // 4. Auth & Sidebar setup
    const isProtected = !['login.html', 'register.html', 'index.html', ''].includes(window.location.pathname.split('/').pop());
    const token = localStorage.getItem('token');
    
    if (isProtected && !token) {
        window.location.href = 'login.html';
        return;
    }

    if (isProtected && userStr) {
        const user = JSON.parse(userStr);
        const nameEl = document.getElementById('sidebar-name');
        const streakEl = document.getElementById('sidebar-streak');
        const avatarEl = document.getElementById('sidebar-avatar');
        
        if (nameEl) nameEl.textContent = user.name;
        if (streakEl) streakEl.textContent = user.streak || 0;
        if (avatarEl) {
            if (user.avatar && user.avatar.startsWith('http')) {
                avatarEl.src = user.avatar;
            } else {
                avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`;
            }
        }
    }

    // 5. Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // 6. User Profile Dropdown Toggle
    const dropdownBtn = document.getElementById('profile-dropdown-btn');
    const dropdownMenu = document.getElementById('profile-dropdown-menu');
    
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    }
    
    // Dropdown Logout
    const dropdownLogout = document.getElementById('dropdown-logout-btn');
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // Populate topbar username and avatar if elements exist
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const topbarName = document.getElementById('topbar-username');
            const topbarAvatar = document.getElementById('topbar-avatar');
            if (topbarName) topbarName.textContent = user.name.split(' ')[0]; // First name
            if (topbarAvatar) {
                if (user.avatar && user.avatar.startsWith('http')) {
                    topbarAvatar.src = user.avatar;
                } else {
                    topbarAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`;
                }
            }
        } catch(e) {}
    }
});
