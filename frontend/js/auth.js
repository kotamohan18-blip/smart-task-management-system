// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data.data._id,
                    name: data.data.name,
                    email: data.data.email,
                    role: data.data.role,
                    streak: data.data.streak,
                    preferences: data.data.preferences
                }));
                
                window.location.href = 'dashboard.html';
            } else {
                const err = document.getElementById('error-message');
                err.textContent = data.message || 'Login failed.';
                err.style.display = 'block';
                setTimeout(() => err.style.display = 'none', 5000);
            }
        } catch (error) {
            console.error('Login error:', error);
            const err = document.getElementById('error-message');
            err.textContent = 'Server connection error.';
            err.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Login to Account';
        }
    });
}

// Handle Registration
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        const err = document.getElementById('error-message');
        
        if (password !== confirmPassword) {
            err.textContent = 'Passwords do not match';
            err.style.display = 'block';
            return;
        }
        
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data.data._id,
                    name: data.data.name,
                    email: data.data.email,
                    role: data.data.role,
                    streak: data.data.streak,
                    preferences: data.data.preferences
                }));
                
                window.location.href = 'dashboard.html';
            } else {
                err.textContent = data.message || 'Registration failed.';
                err.style.display = 'block';
                setTimeout(() => err.style.display = 'none', 5000);
            }
        } catch (error) {
            err.textContent = 'Server connection error.';
            err.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}
