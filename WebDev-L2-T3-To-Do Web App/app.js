/**
 * TaskFlow — Interactive To-Do Web Application
 * Vanilla JavaScript implementation featuring state management, localStorage persistence,
 * inline editing, task counters, timestamps, search/filters, theme toggling, and toasts.
 */

(function () {
    'use strict';

    // --------------------------------------------------------------------------
    // 1. Constants & State Variables
    // --------------------------------------------------------------------------
    const STORAGE_KEY_TASKS = 'taskflow_tasks_v1';
    const STORAGE_KEY_THEME = 'taskflow_theme_v1';

    let tasks = [];
    let currentFilter = 'all'; // 'all' | 'pending' | 'completed'
    let searchQuery = '';
    let editingTaskId = null;

    // --------------------------------------------------------------------------
    // 2. DOM Elements
    // --------------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const currentDateDisplay = document.getElementById('current-date-display');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskPrioritySelect = document.getElementById('task-priority');
    
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');

    const pendingList = document.getElementById('pending-list');
    const completedList = document.getElementById('completed-list');
    const pendingEmpty = document.getElementById('pending-empty');
    const completedEmpty = document.getElementById('completed-empty');
    const pendingCountBadge = document.getElementById('pending-count-badge');
    const completedCountBadge = document.getElementById('completed-count-badge');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const toastContainer = document.getElementById('toast-container');

    // --------------------------------------------------------------------------
    // 3. Initialization
    // --------------------------------------------------------------------------
    function init() {
        initTheme();
        initDateDisplay();
        loadTasks();
        bindEvents();
        render();
    }

    // --------------------------------------------------------------------------
    // 4. Theme Management
    // --------------------------------------------------------------------------
    function initTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY_THEME, theme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        showToast(`Switched to ${newTheme} mode`, 'info');
    }

    // --------------------------------------------------------------------------
    // 5. Date Display
    // --------------------------------------------------------------------------
    function initDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
        if (currentDateDisplay) {
            currentDateDisplay.textContent = now.toLocaleDateString('en-US', options);
        }
        
        // Automatic Copyright Year for Footer
        const yearEl = document.getElementById("year");
        if (yearEl) {
            yearEl.textContent = now.getFullYear();
        }
    }

    // --------------------------------------------------------------------------
    // 6. Data Storage & Persistence
    // --------------------------------------------------------------------------
    function loadTasks() {
        try {
            const rawData = localStorage.getItem(STORAGE_KEY_TASKS);
            tasks = rawData ? JSON.parse(rawData) : getDefaultDemoTasks();
        } catch (e) {
            console.error('Failed to parse tasks from localStorage:', e);
            tasks = getDefaultDemoTasks();
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
        } catch (e) {
            console.error('Failed to save tasks to localStorage:', e);
            showToast('Storage error! Unable to save task.', 'danger');
        }
    }

    function getDefaultDemoTasks() {
        const now = new Date();
        const pastDate = new Date(now.getTime() - 2 * 60 * 60 * 1000);

        return [
            {
                id: 'demo_1',
                text: 'Welcome to TaskFlow! Try adding your daily tasks here.',
                completed: false,
                priority: 'medium',
                createdAt: pastDate.toISOString(),
                completedAt: null
            },
            {
                id: 'demo_2',
                text: 'Click the checkbox to mark a task as completed',
                completed: true,
                priority: 'low',
                createdAt: pastDate.toISOString(),
                completedAt: now.toISOString()
            }
        ];
    }

    // --------------------------------------------------------------------------
    // 7. Event Listeners Binding
    // --------------------------------------------------------------------------
    function bindEvents() {
        // Theme Toggle
        themeToggleBtn.addEventListener('click', toggleTheme);

        // Add Task Form Submit
        taskForm.addEventListener('submit', handleAddTask);

        // Search & Filter
        searchInput.addEventListener('input', handleSearchInput);
        clearSearchBtn.addEventListener('click', handleClearSearch);

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                currentFilter = btn.dataset.filter;
                render();
            });
        });

        // Clear Completed Tasks
        clearCompletedBtn.addEventListener('click', handleClearCompleted);

        // Event Delegation for Pending and Completed Task Lists
        pendingList.addEventListener('click', handleTaskAction);
        completedList.addEventListener('click', handleTaskAction);

        pendingList.addEventListener('keydown', handleTaskKeydown);
        completedList.addEventListener('keydown', handleTaskKeydown);
    }

    // --------------------------------------------------------------------------
    // 8. Task Actions (Add, Toggle, Edit, Delete, Clear)
    // --------------------------------------------------------------------------
    function handleAddTask(e) {
        e.preventDefault();
        const text = taskInput.value.trim();
        const priority = taskPrioritySelect.value || 'medium';

        if (!text) {
            showToast('Please enter a valid task description!', 'warning');
            taskInput.focus();
            return;
        }

        const newTask = {
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            text: text,
            completed: false,
            priority: priority,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        tasks.unshift(newTask);
        saveTasks();

        taskInput.value = '';
        taskPrioritySelect.value = 'medium';
        taskInput.focus();

        render();
        showToast('Task added successfully!', 'success');
    }

    function handleTaskAction(e) {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;

        const taskId = taskItem.dataset.id;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Checkbox Toggle
        if (target.matches('.task-checkbox')) {
            toggleTaskComplete(task);
            return;
        }

        // Edit Button
        if (target.closest('.edit-btn')) {
            startEditingTask(taskId);
            return;
        }

        // Save Edit Button
        if (target.closest('.save-btn')) {
            saveEditingTask(taskItem, taskId);
            return;
        }

        // Cancel Edit Button
        if (target.closest('.cancel-btn')) {
            cancelEditingTask();
            return;
        }

        // Delete Button
        if (target.closest('.delete-btn')) {
            deleteTask(taskItem, taskId);
            return;
        }
    }

    function handleTaskKeydown(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        const taskId = taskItem.dataset.id;

        if (e.target.matches('.edit-input')) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEditingTask(taskItem, taskId);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEditingTask();
            }
        }
    }

    function toggleTaskComplete(task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;

        saveTasks();
        render();

        const msg = task.completed ? 'Task marked as completed! 🎉' : 'Task moved back to pending.';
        showToast(msg, task.completed ? 'success' : 'info');
    }

    function startEditingTask(taskId) {
        editingTaskId = taskId;
        render();
    }

    function saveEditingTask(taskItem, taskId) {
        const editInput = taskItem.querySelector('.edit-input');
        if (!editInput) return;

        const newText = editInput.value.trim();
        if (!newText) {
            showToast('Task title cannot be empty!', 'warning');
            editInput.focus();
            return;
        }

        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.text = newText;
            saveTasks();
            editingTaskId = null;
            render();
            showToast('Task updated successfully!', 'success');
        }
    }

    function cancelEditingTask() {
        editingTaskId = null;
        render();
    }

    function deleteTask(taskItem, taskId) {
        taskItem.classList.add('animate-delete');

        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== taskId);
            if (editingTaskId === taskId) {
                editingTaskId = null;
            }
            saveTasks();
            render();
            showToast('Task deleted permanently.', 'info');
        }, 280);
    }

    function handleClearCompleted() {
        const completedCount = tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            showToast('No completed tasks to clear.', 'info');
            return;
        }

        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        render();
        showToast(`Cleared ${completedCount} completed task(s).`, 'success');
    }

    // --------------------------------------------------------------------------
    // 9. Search & Filter Handlers
    // --------------------------------------------------------------------------
    function handleSearchInput(e) {
        searchQuery = e.target.value.toLowerCase().trim();
        clearSearchBtn.hidden = searchQuery.length === 0;
        render();
    }

    function handleClearSearch() {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.hidden = true;
        searchInput.focus();
        render();
    }

    // --------------------------------------------------------------------------
    // 10. Rendering Engine
    // --------------------------------------------------------------------------
    function render() {
        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.text.toLowerCase().includes(searchQuery);
            if (currentFilter === 'pending') return !task.completed && matchesSearch;
            if (currentFilter === 'completed') return task.completed && matchesSearch;
            return matchesSearch;
        });

        const pendingTasks = filteredTasks.filter(t => !t.completed);
        const completedTasks = filteredTasks.filter(t => t.completed);

        // Update Counter Badges (Total pending/completed regardless of search query)
        const totalPendingCount = tasks.filter(t => !t.completed).length;
        const totalCompletedCount = tasks.filter(t => t.completed).length;

        pendingCountBadge.textContent = `${totalPendingCount} pending`;
        completedCountBadge.textContent = `${totalCompletedCount} completed`;

        // Filter sections visibility based on global filter tab
        const pendingSection = document.getElementById('pending-section');
        const completedSection = document.getElementById('completed-section');

        if (currentFilter === 'pending') {
            pendingSection.style.display = 'flex';
            completedSection.style.display = 'none';
        } else if (currentFilter === 'completed') {
            pendingSection.style.display = 'none';
            completedSection.style.display = 'flex';
        } else {
            pendingSection.style.display = 'flex';
            completedSection.style.display = 'flex';
        }

        // Render Pending List & Empty State
        renderList(pendingList, pendingTasks, pendingEmpty, false);

        // Render Completed List & Empty State
        renderList(completedList, completedTasks, completedEmpty, true);
    }

    function renderList(listEl, items, emptyEl, isCompletedList) {
        listEl.innerHTML = '';

        if (items.length === 0) {
            emptyEl.style.display = 'flex';
            listEl.style.display = 'none';
            return;
        }

        emptyEl.style.display = 'none';
        listEl.style.display = 'flex';

        items.forEach(task => {
            const li = createTaskElement(task, isCompletedList);
            listEl.appendChild(li);
        });
    }

    function createTaskElement(task, isCompletedList) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const isEditing = editingTaskId === task.id;

        if (isEditing) {
            li.innerHTML = `
                <div class="edit-form">
                    <input type="text" class="edit-input" value="${escapeHTML(task.text)}" aria-label="Edit task title" autofocus>
                    <div class="edit-actions">
                        <button type="button" class="action-btn save-btn" title="Save changes" aria-label="Save changes">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </button>
                        <button type="button" class="action-btn cancel-btn" title="Cancel editing" aria-label="Cancel editing">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            setTimeout(() => {
                const editInput = li.querySelector('.edit-input');
                if (editInput) {
                    editInput.focus();
                    editInput.setSelectionRange(editInput.value.length, editInput.value.length);
                }
            }, 0);
        } else {
            const timeLabel = isCompletedList && task.completedAt
                ? `Completed ${formatTime(task.completedAt)}`
                : `Added ${formatTime(task.createdAt)}`;

            li.innerHTML = `
                <div class="task-item-main">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete" title="${task.completed ? 'Mark pending' : 'Mark complete'}">
                    </div>
                    <div class="task-content">
                        <span class="task-title">${escapeHTML(task.text)}</span>
                        <div class="task-meta">
                            <span class="priority-badge priority-${task.priority}">
                                ${getPrioritySymbol(task.priority)} ${task.priority}
                            </span>
                            <span class="timestamp" title="${new Date(task.completedAt || task.createdAt).toLocaleString()}">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                ${timeLabel}
                            </span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button type="button" class="action-btn edit-btn" title="Edit task" aria-label="Edit task">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button type="button" class="action-btn delete-btn" title="Delete task" aria-label="Delete task">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        return li;
    }

    // --------------------------------------------------------------------------
    // 11. Helper Utilities (Time formatting, Priority icons, HTML escaping)
    // --------------------------------------------------------------------------
    function formatTime(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'just now';
        }
        if (diffInSeconds < 3600) {
            const mins = Math.floor(diffInSeconds / 60);
            return `${mins}m ago`;
        }
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        }

        // Format as short time string e.g. "Aug 24, 10:30 AM"
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    function getPrioritySymbol(priority) {
        switch (priority) {
            case 'high': return '🔥';
            case 'low': return '🌱';
            default: return '⚡';
        }
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --------------------------------------------------------------------------
    // 12. Toast Notification System
    // --------------------------------------------------------------------------
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconSvg = getToastIcon(type);
        toast.innerHTML = `
            ${iconSvg}
            <span>${escapeHTML(message)}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(1rem)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    function getToastIcon(type) {
        switch (type) {
            case 'success':
                return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
            case 'warning':
                return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            case 'danger':
                return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
            default:
                return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }
    }

    // Initialize application when DOM content is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

