// Global Configuration
const API_URL = 'https://todolist1-t3bp.onrender.com/api';

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
    let userStr = localStorage.getItem('user');

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

    // 3. Theme Toggle & Initialization
    window.initializeTheme = function() {
        const body = document.body;
        if (!body) return;

        let userTheme = localStorage.getItem('theme');
        let user = null;

        if (userStr) {
            try {
                user = JSON.parse(userStr);
                if (user && user.preferences && user.preferences.theme) {
                    userTheme = user.preferences.theme;
                }
            } catch(e) {}
        }

        if (!userTheme) {
            userTheme = 'light';
        }

        if (userTheme === 'dark') {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        }

        // Keep local storage settings in sync
        localStorage.setItem('theme', userTheme);
        if (user) {
            user.preferences = user.preferences || {};
            user.preferences.theme = userTheme;
            localStorage.setItem('user', JSON.stringify(user));
        }

        // Update UI elements
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = userTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            const span = themeBtn.querySelector('span');
            if (span) {
                span.textContent = userTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
            }
        }
    };

    // Run theme initialization immediately
    window.initializeTheme();

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const body = document.body;
            const isDark = body.classList.contains('dark-theme');
            const newTheme = isDark ? 'light' : 'dark';

            if (newTheme === 'dark') {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
            } else {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
            }

            localStorage.setItem('theme', newTheme);
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    user.preferences = user.preferences || {};
                    user.preferences.theme = newTheme;
                    const updatedUserStr = JSON.stringify(user);
                    localStorage.setItem('user', updatedUserStr);
                    userStr = updatedUserStr;
                } catch(e) {}
            }

            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            const span = themeBtn.querySelector('span');
            if (span) {
                span.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
            }

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
