const API_BASE = '/api';
let chart;
let currentEditId = null;

function getAuthHeaders(){
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'Application/json'
    };
}

function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
}

async function loadTasks() {
    const response = await fetch(`${API_BASE}/tasks`, {
        headers: getAuthHeaders()
    });
    if (response.ok){
        const tasks = await response.json();
        renderTasks(tasks);
    } else if (response.status === 401) {
        logout();
    }
}

function renderTasks(tasks) {
    const container = document.getElementById('tasksList');
    container.innerHTML = '';
    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `
            <strong>${escapeHtml(task.title)}</strong> - ${escapeHtml(task.description) || ''}
             (${task.dueDate || 'не указан'})
            <label>
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                onchange="toggleTask(${task.id}, this.checked)">
                Выполнено
            </label>
            <button onclick="editTask(${task.id})">Редактировать</button>
            <button onclick="deleteTask(${task.id})">Удалить</button>
        `;
        container.appendChild(div);
    });
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

async function createTask(){
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDesc').value;
    const dueDate = document.getElementById('taskDueDate').value;
    if (!title) return;

    const task = { title, description, dueDate, completed: false};
    const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(task)
    });
    if (response.ok){
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDesc').value = '';
        document.getElementById('taskDueDate').value = '';
        loadTasks();
        loadStats();
    }
}

async function toggleTask(id, completed){
    const tasksResp = await fetch(`${API_BASE}/tasks`, {headers: getAuthHeaders()});
    const tasks = await tasksResp.json();
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = completed;
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(task)
        });
        if (response.ok) {
            loadTasks();
            loadStats();
        }

    }
}

async function deleteTask(id) {
    if (!confirm('Удалить задачу?')) return;
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (response.ok) {
        loadTasks();
        loadStats();
    }

}

async function editTask(id){
    const response = await fetch(`${API_BASE}/tasks`, {headers: getAuthHeaders() });
    if (!response.ok) return;
    const tasks = await response.json();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    currentEditId = id;
    document.getElementById('editTitle').value = task.title || '';
    document.getElementById('editDesc').value = task.description || '';
    document.getElementById('editDueDate').value = task.dueDate || '';
    document.getElementById('editError').innerText =  '';
    document.getElementById('editModal').style.display = 'block';

}

async function saveEdit(){
    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDesc').value;
    const dueDate = document.getElementById('editDueDate').value;
    if (!title) {
        document.getElementById('editError').innerText = 'Название не может быть пустым';
        return;
    }

    const updatedTask = {
        title,
        description,
        dueDate,
        completed: false
    };

    const tasksResp = await fetch(`${API_BASE}/tasks`, {headers: getAuthHeaders()});
    const tasks = await tasksResp.json();
    const oldTask = tasks.find(t => t.id === currentEditId);
    if(oldTask) {
        updatedTask.completed = oldTask.completed;
    }

    const response = await fetch(`${API_BASE}/tasks/${currentEditId}`,{
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedTask)
    });
    if(response.ok){
        closeModal();
        loadTasks();
        loadStats();
    } else {
        const err = await response.text();
        document.getElementById('editError').innerText = err || 'Ошибка обновления';
    }
}

function closeModal(){
    document.getElementById('editModal').style.display = 'none';
}

async function loadStats(){
    const response = await fetch(`${API_BASE}/tasks/stats/last5days`, {
        headers: getAuthHeaders()
    });
    if (response.ok) {
        const stats = await response.json();
        const dates = [];
        const counts = [];

        const today  = new Date();
        for (let i=4; i>=0; i--){
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().slice(0,10);
            dates.push(dateStr);
            const found = stats.find(s => s[0] === dateStr);
            counts.push(found ? found[1] : 0);
        }
        if(chart) chart.destroy();
        const ctx = document.getElementById('statsChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Выполненные задачи',
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(39 87 160)',
                    borderWidth: 1
                }]
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/login.html';
        return;
    }
    document.getElementById('usernameSpan').innerText = username;
    loadTasks();
    loadStats();

    document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('editModal');
        if(event.target === modal) closeModal();
    });
});