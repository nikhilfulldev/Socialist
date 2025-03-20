let currentUser = null;

async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    updateBackendStatus(false); // Set to offline while checking
    try {
        console.log('Attempting login...');
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (response.ok) {
            localStorage.setItem(CONFIG.AUTH.TOKEN_KEY, data.token);
            localStorage.setItem(CONFIG.AUTH.USER_ID_KEY, data.user_id);
            localStorage.setItem(CONFIG.AUTH.USERNAME_KEY, username);
            currentUser = { id: data.user_id, username };
            showChatInterface();
            initializeMQTT();
            await loadUsers();
            updateBackendStatus(true);
        } else {
            alert(data.error || 'Login failed');
            updateBackendStatus(false);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
        updateBackendStatus(false);
    }
}

async function handleRegister() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        console.log('Attempting registration...');
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Registration response:', data);

        if (response.ok) {
            localStorage.setItem(CONFIG.AUTH.TOKEN_KEY, data.token);
            localStorage.setItem(CONFIG.AUTH.USER_ID_KEY, data.user_id);
            localStorage.setItem(CONFIG.AUTH.USERNAME_KEY, username);
            currentUser = { id: data.user_id, username };
            showChatInterface();
            initializeMQTT();
            await loadUsers();
            updateBackendStatus(true);
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

function showChatInterface() {
    const authContainer = document.getElementById('auth-container');
    const chatContainer = document.getElementById('chat-container');
    
    if (authContainer && chatContainer) {
        authContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
    } else {
        console.error('Container elements not found');
    }
}

// Check if user is already logged in
async function checkAuth() {
    const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
    const userId = localStorage.getItem(CONFIG.AUTH.USER_ID_KEY);
    const username = localStorage.getItem(CONFIG.AUTH.USERNAME_KEY);
    
    // Check backend status immediately
    await checkBackendStatus();
    
    if (token && userId && username) {
        console.log('Found stored credentials, attempting auto-login...');
        currentUser = { id: userId, username };
        showChatInterface();
        initializeMQTT();
        await loadUsers();
    }
}

// Load users list
async function loadUsers() {
    try {
        console.log('Loading users list...');
        const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
        const response = await fetch(`${CONFIG.API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        console.log('Users loaded:', users);

        const usersList = document.getElementById('users-list');
        if (!usersList) {
            console.error('Users list element not found');
            return;
        }

        usersList.innerHTML = '';

        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.textContent = user.username;
            userElement.onclick = () => selectUser(user);
            usersList.appendChild(userElement);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        updateBackendStatus(false);
    }
}

// Initialize status indicators and check authentication
function initializeStatusIndicators() {
    // Add initial offline status
    updateBackendStatus(false);
    updateMQTTStatus(false);
    
    // Start periodic backend status check
    setInterval(checkBackendStatus, CONFIG.APP.STATUS_CHECK_INTERVAL);
}

// Initialize status indicators and check authentication
initializeStatusIndicators();
checkAuth();