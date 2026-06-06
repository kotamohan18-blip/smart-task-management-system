document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadDashboardCharts();
});

document.addEventListener('themechanged', () => {
    loadDashboardStats();
    loadDashboardCharts();
});

async function loadDashboardStats() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            
            // Stats Row
            document.getElementById('stat-total').textContent = stats.totalTasks;
            document.getElementById('stat-completed').textContent = stats.completedTasks;
            document.getElementById('stat-pending').textContent = stats.pendingTasks;
            document.getElementById('stat-overdue').textContent = stats.overdueTasks;
            
            // Progress Section
            const pctText = document.getElementById('progress-percentage-text');
            const completedTxt = document.getElementById('progress-completed-txt');
            const totalTxt = document.getElementById('progress-total-txt');
            const barFill = document.getElementById('progress-bar-fill');
            const quoteText = document.getElementById('progress-quote-text');
            
            if (pctText) pctText.textContent = `${stats.completionPercentage}%`;
            if (completedTxt) completedTxt.textContent = stats.completedTasks;
            if (totalTxt) totalTxt.textContent = stats.totalTasks;
            if (barFill) {
                // Triggering layout repaint for animation
                barFill.style.width = '0%';
                setTimeout(() => {
                    barFill.style.width = `${stats.completionPercentage}%`;
                }, 100);
            }
            
            // Set dynamic quote
            if (quoteText) {
                if (stats.totalTasks === 0) {
                    quoteText.textContent = `"Your workspace is clear. Create a task to start your journey!"`;
                } else if (stats.completionPercentage === 100) {
                    quoteText.textContent = `"Outstanding! You've accomplished everything on your list. Enjoy the success!"`;
                } else if (stats.completionPercentage >= 75) {
                    quoteText.textContent = `"Superb progress! You are in the home stretch."`;
                } else if (stats.completionPercentage >= 50) {
                    quoteText.textContent = `"Halfway there! Keep up the great momentum."`;
                } else if (stats.completionPercentage >= 25) {
                    quoteText.textContent = `"Great start! Every single step counts toward your goal."`;
                } else {
                    quoteText.textContent = `"A journey of a thousand miles begins with a single step. Start today!"`;
                }
            }
            
            // Welcome Banner Summary
            const userStr = localStorage.getItem('user');
            let userName = 'User';
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userName = user.name;
                } catch(e) {}
            }
            
            const hour = new Date().getHours();
            let greeting = 'Good evening';
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 18) greeting = 'Good afternoon';
            
            const welcomeTitle = document.getElementById('welcome-title');
            const welcomeSubtitle = document.getElementById('welcome-subtitle');
            
            if (welcomeTitle) welcomeTitle.textContent = `${greeting}, ${userName}!`;
            if (welcomeSubtitle) {
                if (stats.totalTasks === 0) {
                    welcomeSubtitle.textContent = "Start by creating your first task today.";
                } else {
                    welcomeSubtitle.textContent = `You have completed ${stats.completionPercentage}% of your tasks. Keep up the streak!`;
                }
            }
            
            // Update User Profile UI again just in case (Streak)
            const streakEl = document.getElementById('sidebar-streak');
            if (streakEl) streakEl.textContent = stats.streak;
            
            // Render Pie Chart
            renderCompletionPieChart(stats);
            
            // Fetch recent pending tasks for the table
            loadRecentPendingTasks();
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

async function loadRecentPendingTasks() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/tasks?status=Pending&sort=dueDate&limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('recent-tasks-body');
            
            if (data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No pending tasks found. Time to relax!</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            
            data.data.forEach(task => {
                const tr = document.createElement('tr');
                
                // Format Date
                const dateObj = new Date(task.dueDate);
                const isOverdue = dateObj < new Date(new Date().setHours(0,0,0,0));
                const dueDateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                const priorityClass = task.priority === 'High' ? 'badge-priority-high' : 
                                      task.priority === 'Medium' ? 'badge-priority-medium' : 'badge-priority-low';
                
                tr.innerHTML = `
                    <td>
                        <div class="task-title">${task.title}</div>
                        <div class="task-desc">${task.category}</div>
                    </td>
                    <td><span class="badge ${priorityClass}">${task.priority}</span></td>
                    <td><span class="badge badge-status-pending">Pending</span></td>
                    <td class="${isOverdue ? 'text-danger font-weight-600' : ''}">${dueDateStr} ${task.dueTime ? `<br><small class="text-muted">${task.dueTime}</small>`: ''}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" style="padding: 0.25rem 0.5rem;" onclick="quickComplete('${task._id}')">Complete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error(error);
    }
}

async function quickComplete(id) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'Completed' })
        });
        
        if (response.ok) {
            showToast('Task marked as completed!');
            loadDashboardStats();
            loadDashboardCharts();
        }
    } catch(e) {
        console.error(e);
    }
}

async function loadDashboardCharts() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/dashboard/charts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            renderCategoryBarChart(data.data.categoryCounts);
        }
    } catch (error) {
        console.error('Error fetching charts:', error);
    }
}

// Global chart instances to destroy them before re-rendering
let completionPieChartInstance = null;
let categoryBarChartInstance = null;

function renderCompletionPieChart(stats) {
    const canvas = document.getElementById('completionPieChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (completionPieChartInstance) completionPieChartInstance.destroy();
    
    const isDark = document.body.classList.contains('dark-theme');
    const labelColor = isDark ? '#94a3b8' : '#64748b';

    completionPieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [stats.completedTasks, stats.pendingTasks],
                backgroundColor: [
                    '#10b981', // Success Green
                    '#f59e0b'  // Pending Orange
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: labelColor }
                }
            }
        }
    });
}

function renderCategoryBarChart(data) {
    const canvas = document.getElementById('categoryBarChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (categoryBarChartInstance) categoryBarChartInstance.destroy();
    
    const labels = data.map(item => item._id || 'Other');
    const counts = data.map(item => item.count);
    
    const isDark = document.body.classList.contains('dark-theme');
    const labelColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#4f46e5';

    categoryBarChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tasks Count',
                data: counts,
                backgroundColor: primaryColor,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: labelColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: labelColor },
                    grid: { display: false }
                }
            }
        }
    });
}
