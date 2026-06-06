document.addEventListener('DOMContentLoaded', () => {
    let currentDate = new Date();
    
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    const monthYearDisplay = document.getElementById('current-month-year');
    
    if(prevBtn) prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });
    
    if(nextBtn) nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    renderCalendar(currentDate);

    // Modal close
    document.querySelector('#day-modal .close-modal').addEventListener('click', () => {
        document.getElementById('day-modal').classList.remove('show');
    });
});

async function renderCalendar(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthYearDisplay = document.getElementById('current-month-year');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if(monthYearDisplay) monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Prepare date boundaries for API fetch
    const startStr = new Date(year, month, 1).toISOString();
    const endStr = new Date(year, month, daysInMonth, 23, 59, 59).toISOString();
    
    const token = localStorage.getItem('token');
    let groupedTasks = {};
    
    try {
        const res = await fetch(`${API_URL}/calendar?start=${startStr}&end=${endStr}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if(data.success) {
            groupedTasks = data.data;
        }
    } catch(e) {
        console.error("Error fetching calendar data", e);
    }

    const grid = document.getElementById('calendar-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    // Empty cells before start of month
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day empty';
        grid.appendChild(cell);
    }
    
    const today = new Date();
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        
        // Check if today
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add('today');
        }
        
        cell.innerHTML = `<div class="day-number">${day}</div>`;
        
        // Find tasks for this day
        // Construct date string YYYY-MM-DD local
        const cellDateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        
        const dayTasks = groupedTasks[cellDateStr] || [];
        
        if (dayTasks.length > 0) {
            cell.classList.add('has-tasks');
            dayTasks.forEach(task => {
                const indicator = document.createElement('div');
                indicator.className = `day-task-indicator ${task.status === 'Completed' ? 'completed' : ''}`;
                indicator.textContent = task.title;
                if(task.priority === 'High') indicator.style.borderLeftColor = 'var(--danger)';
                if(task.priority === 'Medium') indicator.style.borderLeftColor = 'var(--warning)';
                if(task.priority === 'Low') indicator.style.borderLeftColor = 'var(--success)';
                
                cell.appendChild(indicator);
            });
        }
        
        // Click event to show modal with tasks
        cell.addEventListener('click', () => {
            showDayModal(cellDateStr, dayTasks);
        });
        
        grid.appendChild(cell);
    }
}

function showDayModal(dateStr, tasks) {
    const modal = document.getElementById('day-modal');
    const title = document.getElementById('day-modal-title');
    const body = document.getElementById('day-modal-body');
    
    const d = new Date(dateStr);
    title.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    
    body.innerHTML = '';
    
    if (tasks.length === 0) {
        body.innerHTML = '<p class="text-center text-muted py-4">No tasks scheduled for this day.</p>';
    } else {
        const list = document.createElement('div');
        list.className = 'd-flex flex-column gap-2';
        
        tasks.forEach(task => {
            const isCompleted = task.status === 'Completed';
            const html = `
                <div class="glass-card p-3 d-flex justify-content-between align-items-center" style="box-shadow: none; ${isCompleted ? 'opacity: 0.6;' : ''}">
                    <div>
                        <div class="task-title" style="${isCompleted ? 'text-decoration: line-through;' : ''}">${task.title}</div>
                        <div class="text-sm text-muted">${task.dueTime ? `<i class="far fa-clock"></i> ${task.dueTime}` : 'All Day'}</div>
                    </div>
                    <span class="badge ${isCompleted ? 'badge-status-completed' : 'badge-status-pending'}">${task.status}</span>
                </div>
            `;
            list.innerHTML += html;
        });
        
        body.appendChild(list);
    }
    
    modal.classList.add('show');
}
