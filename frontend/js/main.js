// Status indicators
const backendStatus = document.getElementById('backend-status');
const mqttStatus = document.getElementById('mqtt-status');

function updateBackendStatus(isOnline) {
    if (backendStatus) {
        backendStatus.textContent = isOnline ? 'Online' : 'Offline';
        backendStatus.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
    }
}

function updateMQTTStatus(isOnline) {
    if (mqttStatus) {
        mqttStatus.textContent = isOnline ? 'Online' : 'Offline';
        mqttStatus.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
    }
}

// Check backend status periodically
async function checkBackendStatus() {
    try {
        const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
        if (!token) return;

        const response = await fetch(`${CONFIG.API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        updateBackendStatus(response.ok);
        
        // Log connection status for debugging
        console.log('Backend connection check:', response.ok ? 'Online' : 'Offline');
        
    } catch (error) {
        console.error('Backend status check failed:', error);
        updateBackendStatus(false);
    }
}

// Send message function
async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    if (!messageInput) return;

    const content = messageInput.value.trim();
    if (!content || !selectedUser) return;

    try {
        console.log('Sending message to:', selectedUser.username);
        const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                receiver_id: selectedUser.id,
                content: content
            })
        });

        const message = await response.json();
        
        if (response.ok) {
            console.log('Message sent successfully:', message);
            // Display message in chat
            displayMessage(message, true);
            // Publish to MQTT
            publishMessage(message);
            // Clear input
            messageInput.value = '';
            // Update backend status
            updateBackendStatus(true);
        } else {
            console.error('Failed to send message:', message);
            alert('Failed to send message');
            updateBackendStatus(false);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
        updateBackendStatus(false);
    }
}

// Handle enter key in message input
document.getElementById('message-input')?.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

// Initialize
console.log('Initializing chat application...');
console.log('API URL:', CONFIG.API_BASE_URL);
console.log('MQTT Broker:', CONFIG.MQTT.BROKER_URL);

checkBackendStatus();
setInterval(checkBackendStatus, CONFIG.APP.STATUS_CHECK_INTERVAL);