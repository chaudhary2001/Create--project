document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const itemNameInput = document.getElementById('item-name');
    const itemDescInput = document.getElementById('item-desc');
    const itemIdInput = document.getElementById('item-id');
    const itemUuidInput = document.getElementById('item-uuid');
    const itemHashInput = document.getElementById('item-hash');
    const todoList = document.getElementById('todo-list');
    const statusEl = document.getElementById('status');
    const submitButton = todoForm.querySelector('button[type="submit"]');

    function setStatus(message, type) {
        statusEl.textContent = message || '';
        statusEl.classList.remove('success', 'error');
        if (type) statusEl.classList.add(type);
        
        if (message) {
            setTimeout(() => {
                if (statusEl.textContent === message) {
                    statusEl.textContent = '';
                    statusEl.classList.remove('success', 'error');
                }
            }, 3000);
        }
    }

    function renderEmptyStateIfNeeded() {
        if (todoList.children.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>No items submitted yet. Add one above!</p>
                </div>`;
        }
    }

    function addTodoToList(todo) {
        const todoElement = document.createElement('div');
        todoElement.className = 'todo-item';
        todoElement.dataset.id = todo._id || '';

        const createdAt = todo.createdAt ? new Date(todo.createdAt).toLocaleString() : '';
        const isCompleted = todo.status === 'completed';

        todoElement.innerHTML = `
            <div class="todo-content">
                <h3>${escapeHtml(todo.itemName || '')}</h3>
                ${(todo.itemDescription || '').trim() ? `<p>${escapeHtml(todo.itemDescription)}</p>` : ''}
                ${todo.itemId ? `<p><strong>Item ID:</strong> ${escapeHtml(todo.itemId)}</p>` : ''}
                ${todo.itemUuid ? `<p><strong>Item UUID:</strong> ${escapeHtml(todo.itemUuid)}</p>` : ''}
                ${todo.itemHash ? `<p><strong>Item Hash:</strong> ${escapeHtml(todo.itemHash)}</p>` : ''}
                ${createdAt ? `<small class="todo-date">${escapeHtml(createdAt)}</small>` : ''}
            </div>
            <div class="todo-actions">
                ${isCompleted ? 
                    `<span class="done-text">Done</span>` :
                    `<button class="done-btn" onclick="markAsDone('${todo._id || ''}')" title="Mark as done">
                        <i class="fas fa-check"></i>
                    </button>`
                }
                <button class="delete-btn" onclick="deleteTodo('${todo._id || ''}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        if (isCompleted) {
            todoElement.classList.add('completed');
        }

        const empty = todoList.querySelector('.empty-state');
        if (empty) empty.remove();

        todoList.prepend(todoElement);
    }

    function escapeHtml(str) {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    async function loadTodos() {
        try {
            const resp = await fetch('/todos');
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.todos) {
                    todoList.innerHTML = ''; // Clear existing content
                    data.todos.forEach(todo => addTodoToList(todo));
                    renderEmptyStateIfNeeded();
                }
            }
        } catch (err) {
            console.error('Failed to load todos:', err);
        }
    }

    window.markAsDone = async function(todoId) {
        if (!todoId) return;
        
        try {
            const resp = await fetch(`/done/${todoId}`, {
                method: 'PUT'
            });
            
            if (resp.ok) {
                const todoElement = document.querySelector(`[data-id="${todoId}"]`);
                if (todoElement) {
                    todoElement.classList.add('completed');
                    const actionsDiv = todoElement.querySelector('.todo-actions');
                    actionsDiv.innerHTML = `
                        <span class="done-text">Done</span>
                        <button class="delete-btn" onclick="deleteTodo('${todoId}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                }
                setStatus('Item marked as done!', 'success');
            } else {
                setStatus('Failed to mark as done', 'error');
            }
        } catch (err) {
            setStatus('Error marking as done', 'error');
        }
    };

    window.deleteTodo = async function(todoId) {
        if (!todoId) return;
        
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        try {
            const resp = await fetch(`/delete/${todoId}`, {
                method: 'DELETE'
            });
            
            if (resp.ok) {
                const todoElement = document.querySelector(`[data-id="${todoId}"]`);
                if (todoElement) {
                    todoElement.style.animation = 'fadeOut 0.3s ease forwards';
                    setTimeout(() => {
                        todoElement.remove();
                        renderEmptyStateIfNeeded();
                    }, 300);
                }
                setStatus('Item deleted successfully!', 'success');
            } else {
                setStatus('Failed to delete item', 'error');
            }
        } catch (err) {
            setStatus('Error deleting item', 'error');
        }
    };

    loadTodos();

    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const itemName = itemNameInput.value.trim();
        const itemDescription = itemDescInput.value.trim();
        const itemId = itemIdInput.value.trim();
        const itemUuid = itemUuidInput.value.trim();
        const itemHash = itemHashInput.value.trim();

        if (!itemName) {
            setStatus('Item Name is required.', 'error');
            return;
        }

        submitButton.disabled = true;
        setStatus('Submitting...', null);

        try {
            const resp = await fetch('/submittodoitem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemName, itemDescription, itemId, itemUuid, itemHash })
            });

            const data = await resp.json().catch(() => ({}));

            if (!resp.ok) {
                const msg = data && data.message ? data.message : 'Failed to submit item.';
                throw new Error(msg);
            }

            if (data && data.todo) {
                addTodoToList(data.todo);
            }

            todoForm.reset();
            setStatus('Listed......', 'success');
        } catch (err) {
            setStatus(err && err.message ? err.message : 'Something went wrong.', 'error');
        } finally {
            submitButton.disabled = false;
        }
    });
});
