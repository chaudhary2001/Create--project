document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const itemNameInput = document.getElementById('item-name');
    const itemDescInput = document.getElementById('item-desc');
    const todoList = document.getElementById('todo-list');

    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    // Render existing todos
    renderTodos();

    // Add new todo
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = itemNameInput.value.trim();
        const desc = itemDescInput.value.trim();
        
        if (name) {
            const newTodo = {
                id: Date.now().toString(),
                name,
                desc,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            todos.unshift(newTodo);
            saveTodos();
            renderTodos();
            
            // Reset form
            todoForm.reset();
            
            // Add success animation
            const addButton = todoForm.querySelector('button');
            addButton.classList.add('success');
            setTimeout(() => addButton.classList.remove('success'), 1000);
        }
    });

    // Toggle todo completion
    function toggleTodo(todoId) {
        todos = todos.map(todo => 
            todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        );
        saveTodos();
        renderTodos();
    }

    // Delete todo
    function deleteTodo(todoId) {
        // Add animation before removing
        const todoElement = document.querySelector(`[data-id="${todoId}"]`);
        if (todoElement) {
            todoElement.classList.add('removing');
            setTimeout(() => {
                todos = todos.filter(todo => todo.id !== todoId);
                saveTodos();
                renderTodos();
            }, 300);
        }
    }

    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Render todos
    function renderTodos() {
        if (todos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>No tasks yet. Add one above!</p>
                </div>`;
            return;
        }

        todoList.innerHTML = '';
        
        todos.forEach(todo => {
            const todoElement = document.createElement('div');
            todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            todoElement.setAttribute('data-id', todo.id);
            
            const formattedDate = new Date(todo.createdAt).toLocaleString();
            
            todoElement.innerHTML = `
                <div class="todo-content">
                    <h3>${todo.name}</h3>
                    ${todo.desc ? `<p>${todo.desc}</p>` : ''}
                    <small class="todo-date">${formattedDate}</small>
                </div>
                <div class="todo-actions">
                    <button class="complete-btn" title="Mark as ${todo.completed ? 'incomplete' : 'complete'}">
                        <i class="fas fa-${todo.completed ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="delete-btn" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners
            const completeBtn = todoElement.querySelector('.complete-btn');
            const deleteBtn = todoElement.querySelector('.delete-btn');
            
            completeBtn.addEventListener('click', () => toggleTodo(todo.id));
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
            
            todoList.appendChild(todoElement);
        });
    }

    // Add floating particles effect
    createParticles();
});

// Create floating particles for background effect
function createParticles() {
    const container = document.querySelector('.container');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size between 2px and 6px
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration between 10s and 30s
        const duration = Math.random() * 20 + 10;
        particle.style.animation = `float ${duration}s linear infinite`;
        
        // Random delay
        particle.style.animationDelay = `-${Math.random() * 20}s`;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        
        container.appendChild(particle);
    }
    
    // Add styles for particles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(20px, 20px) rotate(90deg); }
            50% { transform: translate(0, 40px) rotate(180deg); }
            75% { transform: translate(-20px, 20px) rotate(270deg); }
        }
        
        .particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            transform-origin: center;
        }
    `;
    document.head.appendChild(style);
}

// Add service worker for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
