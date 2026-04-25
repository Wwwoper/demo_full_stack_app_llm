// DevPlan AI - Frontend Application Logic

const API_BASE_URL = '';

// Theme Management
function initTheme() {
    const saved = localStorage.getItem("theme");
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const theme = saved || system || "dark";
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
        toggleBtn.textContent = theme === "dark" ? "🌙" : "☀️";
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeIcon(next);
}

// Initialize theme as early as possible
initTheme();

// DOM Elements
const createTaskForm = document.getElementById('create-task-form');
const tasksList = document.getElementById('tasks-list');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const refreshBtn = document.getElementById('refresh-btn');
const apiConsole = document.getElementById('api-console');
const clearConsoleBtn = document.getElementById('clear-console');

// Stats elements
const statTotal = document.getElementById('stat-total');
const statTodo = document.getElementById('stat-todo');
const statInProgress = document.getElementById('stat-in-progress');
const statDone = document.getElementById('stat-done');
const statOverdue = document.getElementById('stat-overdue');

// Utility: Log to console
function logToConsole(type, message) {
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    line.textContent = `[${timestamp}] ${message}`;
    apiConsole.appendChild(line);
    apiConsole.scrollTop = apiConsole.scrollHeight;
}

// Utility: Format date
function formatDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Utility: Check if date is overdue
function isOverdue(dateStr, status) {
    if (!dateStr || status === 'done') return false;
    const deadline = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today;
}

// API: Get tasks
async function getTasks(status = '', priority = '') {
    try {
        let url = `${API_BASE_URL}/tasks?`;
        if (status) url += `status=${status}&`;
        if (priority) url += `priority=${priority}&`;
        
        logToConsole('request', `GET ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        logToConsole('response', `Получено задач: ${data.length}`);
        return data;
    } catch (error) {
        logToConsole('error', `Ошибка получения задач: ${error.message}`);
        return [];
    }
}

// API: Create task
async function createTask(taskData) {
    try {
        const url = `${API_BASE_URL}/tasks`;
        logToConsole('request', `POST ${url}`, JSON.stringify(taskData));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка создания задачи');
        }
        
        const data = await response.json();
        logToConsole('response', `Задача создана: ID ${data.id}`);
        return data;
    } catch (error) {
        logToConsole('error', `Ошибка создания: ${error.message}`);
        throw error;
    }
}

// API: Update task status
async function updateTaskStatus(taskId, status) {
    try {
        const url = `${API_BASE_URL}/tools/update_task_status?task_id=${taskId}&status=${status}`;
        logToConsole('request', `POST ${url}`);
        
        const response = await fetch(url, { method: 'POST' });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка обновления статуса');
        }
        
        const data = await response.json();
        logToConsole('response', `Статус обновлён: ${data.new_status}`);
        return data;
    } catch (error) {
        logToConsole('error', `Ошибка обновления: ${error.message}`);
        throw error;
    }
}

// API: Delete task
async function deleteTask(taskId) {
    try {
        const url = `${API_BASE_URL}/tasks/${taskId}`;
        logToConsole('request', `DELETE ${url}`);
        
        const response = await fetch(url, { method: 'DELETE' });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка удаления задачи');
        }
        
        logToConsole('response', `Задача ${taskId} удалена`);
        return true;
    } catch (error) {
        logToConsole('error', `Ошибка удаления: ${error.message}`);
        throw error;
    }
}

// API: Get stats
async function getStats() {
    try {
        const url = `${API_BASE_URL}/tools/stats`;
        logToConsole('request', `GET ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        logToConsole('response', `Статистика: всего ${data.total} задач`);
        return data;
    } catch (error) {
        logToConsole('error', `Ошибка получения статистики: ${error.message}`);
        return null;
    }
}

// Render: Task card
function renderTaskCard(task) {
    const overdue = isOverdue(task.deadline, task.status);
    const deadlineText = task.deadline ? formatDate(task.deadline) : 'Нет срока';
    
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.id = task.id;
    
    card.innerHTML = `
        <div class="task-info">
            <h3>${escapeHtml(task.title)}</h3>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
                <span class="badge badge-priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
                <span class="badge badge-status-${task.status}">${getStatusLabel(task.status)}</span>
                <span class="task-deadline ${overdue ? 'overdue' : ''}">
                    📅 ${deadlineText}${overdue ? ' (просрочено!)' : ''}
                </span>
            </div>
        </div>
        <div class="task-actions">
            <select class="status-select" data-task-id="${task.id}">
                <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>К выполнению</option>
                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>В работе</option>
                <option value="done" ${task.status === 'done' ? 'selected' : ''}>Готово</option>
            </select>
            <button class="btn btn-danger btn-small btn-delete" data-task-id="${task.id}">
                🗑️ Удалить
            </button>
        </div>
    `;
    
    return card;
}

// Render: Tasks list
async function renderTasks() {
    const status = filterStatus.value;
    const priority = filterPriority.value;
    
    tasksList.innerHTML = '<p style="text-align:center;padding:20px;">Загрузка...</p>';
    
    const tasks = await getTasks(status, priority);
    
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <p>📭 Нет задач для отображения</p>
                <p style="font-size:0.9rem;margin-top:10px;">Создайте первую задачу!</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = '';
    tasks.forEach(task => {
        tasksList.appendChild(renderTaskCard(task));
    });
}

// Render: Stats
async function renderStats() {
    const stats = await getStats();
    if (!stats) return;
    
    statTotal.textContent = stats.total;
    statTodo.textContent = stats.by_status.todo;
    statInProgress.textContent = stats.by_status.in_progress;
    statDone.textContent = stats.by_status.done;
    statOverdue.textContent = stats.overdue;
}

// Helpers
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getPriorityLabel(priority) {
    const labels = {
        low: 'Низкий',
        medium: 'Средний',
        high: 'Высокий'
    };
    return labels[priority] || priority;
}

function getStatusLabel(status) {
    const labels = {
        todo: 'К выполнению',
        in_progress: 'В работе',
        done: 'Готово'
    };
    return labels[status] || status;
}

// Event Handlers
createTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(createTaskForm);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description') || null,
        priority: formData.get('priority'),
        deadline: formData.get('deadline') || null
    };
    
    try {
        await createTask(taskData);
        createTaskForm.reset();
        await renderTasks();
        await renderStats();
    } catch (error) {
        // Error already logged
    }
});

tasksList.addEventListener('change', async (e) => {
    if (e.target.classList.contains('status-select')) {
        const taskId = parseInt(e.target.dataset.taskId);
        const newStatus = e.target.value;
        
        try {
            await updateTaskStatus(taskId, newStatus);
            await renderTasks();
            await renderStats();
        } catch (error) {
            e.target.value = getStatusFromTaskId(taskId); // Revert on error
        }
    }
});

tasksList.addEventListener('click', async (e) => {
    if (e.target.closest('.btn-delete')) {
        const btn = e.target.closest('.btn-delete');
        const taskId = parseInt(btn.dataset.taskId);
        
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            try {
                await deleteTask(taskId);
                await renderTasks();
                await renderStats();
            } catch (error) {
                // Error already logged
            }
        }
    }
});

filterStatus.addEventListener('change', renderTasks);
filterPriority.addEventListener('change', renderTasks);
refreshBtn.addEventListener('click', async () => {
    await renderTasks();
    await renderStats();
});

clearConsoleBtn.addEventListener('click', () => {
    apiConsole.innerHTML = '<div class="console-line system">Консоль очищена</div>';
});

// Theme toggle button event listener
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

// Helper: Get current status for a task (for revert on error)
function getStatusFromTaskId(taskId) {
    const select = document.querySelector(`.status-select[data-task-id="${taskId}"]`);
    return select ? select.value : 'todo';
}

// Initialize
async function init() {
    logToConsole('system', 'Приложение загружено');
    logToConsole('system', `API URL: ${API_BASE_URL}`);
    
    try {
        // Test connection
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            logToConsole('system', '✅ Соединение с сервером установлено');
        } else {
            throw new Error('Сервер недоступен');
        }
    } catch (error) {
        logToConsole('error', `❌ Ошибка подключения: ${error.message}`);
        logToConsole('system', 'Убедитесь, что сервер запущен: uv run uvicorn backend.main:app --reload');
    }
    
    await renderTasks();
    await renderStats();
}

// Start application
document.addEventListener('DOMContentLoaded', init);
