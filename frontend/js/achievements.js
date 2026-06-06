document.addEventListener('DOMContentLoaded', () => {
    loadAchievements();
});

async function loadAchievements() {
    const token = localStorage.getItem('token');
    if(!token) return;

    try {
        // Fetch user data for points
        const userRes = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();
        if(userData.success) {
            document.getElementById('user-score').textContent = userData.data.productivityScore || 0;
        }

        // Fetch achievements
        const res = await fetch(`${API_URL}/achievements`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        const container = document.getElementById('achievements-container');
        container.innerHTML = '';

        // All possible badges (mocked list for visual appeal)
        const allBadges = [
            { name: 'First Step', description: 'Created your first task', badgeIcon: '🏆' },
            { name: 'Getting Things Done', description: 'Completed your first task', badgeIcon: '✅' },
            { name: 'Task Master', description: 'Created 50 tasks', badgeIcon: '📝' },
            { name: 'Half Century', description: 'Completed 50 tasks', badgeIcon: '⚡' },
            { name: 'On Fire', description: '7 Day Productivity Streak', badgeIcon: '🔥' },
            { name: 'Unstoppable', description: '30 Day Productivity Streak', badgeIcon: '⭐' },
        ];

        let earnedNames = [];
        if(data.success && data.data.length > 0) {
            earnedNames = data.data.map(a => a.name);
        }

        allBadges.forEach(badge => {
            const isEarned = earnedNames.includes(badge.name);
            const div = document.createElement('div');
            div.className = `col-span-1 glass-card achievement-badge ${isEarned ? '' : 'achievement-locked'}`;
            
            div.innerHTML = `
                <div class="achievement-icon">${badge.badgeIcon}</div>
                <div>
                    <h4 class="mb-1">${badge.name}</h4>
                    <p class="text-sm text-muted">${badge.description}</p>
                </div>
                ${isEarned ? '<span class="badge bg-green-light text-green mt-2">Unlocked</span>' : '<span class="badge bg-main text-muted mt-2"><i class="fas fa-lock mr-1"></i> Locked</span>'}
            `;
            container.appendChild(div);
        });

    } catch(e) {
        console.error(e);
        document.getElementById('achievements-container').innerHTML = '<div class="col-span-4 text-center py-5 text-danger">Error loading achievements.</div>';
    }
}
