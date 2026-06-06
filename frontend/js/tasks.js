let currentTasks = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const filterPriority = document.getElementById('filter-priority');
    const sortBy = document.getElementById('sort-by');
    
    const taskModal = document.getElementById('task-modal');
    const openModalBtn = document.getElementById('open-task-modal');
    const closeBtns = document.querySelectorAll('.close-modal');
    const taskForm = document.getElementById('task-form');

    // Initial Load
    loadTasks();

    // Event Listeners for Filters
    if(searchInput) searchInput.addEventListener('input', debounce(() => loadTasks(), 500));
    if(filterStatus) filterStatus.addEventListener('change', () => loadTasks());
    if(filterPriority) filterPriority.addEventListener('change', () => loadTasks());
    if(sortBy) sortBy.addEventListener('change', () => loadTasks());

    // Modal Events
    if(openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            resetTaskForm();
            document.getElementById('modal-title').textContent = 'Create Task';
            document.getElementById('status-group').style.display = 'none'; // Hide status on create
            taskModal.classList.add('show');
        });
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            taskModal.classList.remove('show');
        });
    });

    // Form Submit
    if(taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveTask();
        });
    }
});

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

async function loadTasks() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('tasks-list');
    if(!tbody) return;
    
    // Get filter values
    const search = document.getElementById('search-input')?.value || '';
    const status = document.getElementById('filter-status')?.value || '';
    const priority = document.getElementById('filter-priority')?.value || '';
    const sort = document.getElementById('sort-by')?.value || '-createdAt';
    
    // Build Query URL
    let queryParams = [];
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (status) queryParams.push(`status=${status}`);
    if (priority) queryParams.push(`priority=${priority}`);
    if (sort) queryParams.push(`sort=${sort}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    
    try {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5"><i class="fas fa-spinner fa-spin text-2xl text-primary mb-2"></i><br>Loading tasks...</td></tr>';
        
        const response = await fetch(`${API_URL}/tasks${queryString}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            currentTasks = data.data;
            renderTasks(currentTasks);
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-danger">Error loading tasks.</td></tr>';
    }
}

function renderTasks(tasks) {
    const tbody = document.getElementById('tasks-list');
    if(!tbody) return;
    
    if (tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fas fa-folder-open text-3xl mb-3 d-block"></i> No tasks found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    tasks.forEach(task => {
        const isCompleted = task.status === 'Completed';
        
        // Date formatting
        const dueDateObj = new Date(task.dueDate);
        const isOverdue = task.status !== 'Completed' && dueDateObj < new Date(new Date().setHours(0,0,0,0));
        const dueDateStr = dueDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        // Badges
        const priorityClass = task.priority === 'High' ? 'badge-priority-high' : 
                              task.priority === 'Medium' ? 'badge-priority-medium' : 'badge-priority-low';
                              
        let statusClass = 'badge-status-pending';
        if(task.status === 'In Progress') statusClass = 'badge-status-progress';
        if(task.status === 'Completed') statusClass = 'badge-status-completed';
        if(isOverdue && !isCompleted) statusClass = 'badge-status-overdue';

        const tr = document.createElement('tr');
        if(isCompleted) tr.style.opacity = '0.6';
        
        tr.innerHTML = `
            <td class="text-center">
                <div class="custom-checkbox ${isCompleted ? 'checked' : ''}" onclick="toggleTaskStatus('${task._id}')">
                    <i class="fas fa-check"></i>
                </div>
            </td>
            <td>
                <div class="task-title" style="${isCompleted ? 'text-decoration: line-through;' : ''}">${task.title}</div>
                <div class="task-desc">${task.description || 'No description'}</div>
            </td>
            <td>
                <span class="badge badge-category mb-1">${task.category}</span><br>
                <span class="badge ${priorityClass}">${task.priority}</span>
            </td>
            <td>
                <div class="${isOverdue ? 'text-danger font-weight-600' : ''}"><i class="far fa-calendar-alt mr-1"></i> ${dueDateStr}</div>
                ${task.dueTime ? `<div class="text-sm text-muted mt-1"><i class="far fa-clock mr-1"></i> ${task.dueTime}</div>` : ''}
            </td>
            <td><span class="badge ${statusClass}">${isOverdue && !isCompleted ? 'Overdue' : task.status}</span></td>
            <td class="text-right">
                <button class="btn-icon" onclick="editTask('${task._id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="duplicateTask('${task._id}')" title="Duplicate"><i class="fas fa-copy"></i></button>
                <button class="btn-icon delete" onclick="deleteTask('${task._id}')" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function resetTaskForm() {
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dueDate').value = today;
}

async function saveTask() {
    const token = localStorage.getItem('token');
    const taskId = document.getElementById('task-id').value;
    
    const taskData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        priority: document.getElementById('priority').value,
        category: document.getElementById('category').value,
        dueDate: document.getElementById('dueDate').value,
        dueTime: document.getElementById('dueTime').value
    };

    if(taskId) {
        taskData.status = document.getElementById('status').value;
    }
    
    const url = taskId ? `${API_URL}/tasks/${taskId}` : `${API_URL}/tasks`;
    const method = taskId ? 'PUT' : 'POST';
    
    const btn = document.getElementById('save-task-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('task-modal').classList.remove('show');
            showToast(taskId ? 'Task updated successfully' : 'Task created successfully');
            loadTasks();
        } else {
            showToast(data.message || 'Error saving task', 'error');
        }
    } catch (error) {
        showToast('Server connection error', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Task';
    }
}

function editTask(id) {
    const task = currentTasks.find(t => t._id === id);
    if (!task) return;
    
    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('task-id').value = task._id;
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description || '';
    document.getElementById('priority').value = task.priority;
    document.getElementById('category').value = task.category;
    document.getElementById('dueTime').value = task.dueTime || '';
    
    const date = new Date(task.dueDate);
    document.getElementById('dueDate').value = date.toISOString().split('T')[0];
    
    document.getElementById('status').value = task.status;
    document.getElementById('status-group').style.display = 'block';
    
    document.getElementById('task-modal').classList.add('show');
}

async function duplicateTask(id) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/tasks/${id}/duplicate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if(data.success) {
            showToast('Task duplicated!');
            loadTasks();
        }
    } catch(e) {
        console.error(e);
    }
}

async function toggleTaskStatus(id) {
    const task = currentTasks.find(t => t._id === id);
    if (!task) return;
    
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            if(newStatus === 'Completed') showToast('Task completed! +Points', 'success');
            loadTasks();
        }
    } catch (error) {
        console.error(error);
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            showToast('Task deleted');
            loadTasks();
        }
    } catch (error) {
        console.error(error);
    }
}
