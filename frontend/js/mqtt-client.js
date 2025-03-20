let mqttClient = null;
let selectedUser = null;

function initializeMQTT() {
    const clientId = `web_${Math.random().toString(16).substr(2, 8)}`;
    const userId = localStorage.getItem(CONFIG.AUTH.USER_ID_KEY);
    
    console.log('Initializing MQTT connection...');
    
    // Try secure connection first if configured
    if (CONFIG.MQTT.USE_SSL) {
        connectMQTT(CONFIG.MQTT.WSS_PORT, true);
    } else {
        connectMQTT(CONFIG.MQTT.WS_PORT, false);
    }
}

function connectMQTT(port, useSSL) {
    const clientId = `web_${Math.random().toString(16).substr(2, 8)}`;
    console.log(`Attempting MQTT connection on port ${port} (SSL: ${useSSL})`);
    
    mqttClient = new Paho.MQTT.Client(CONFIG.MQTT.BROKER_URL, port, clientId);
    mqttClient.onConnectionLost = onConnectionLost;
    mqttClient.onMessageArrived = onMessageArrived;

    const connectOptions = {
        onSuccess: () => {
            console.log('Connected to MQTT broker');
            const userId = localStorage.getItem(CONFIG.AUTH.USER_ID_KEY);
            mqttClient.subscribe(`chat/${userId}`);
            updateMQTTStatus(true);
        },
        onFailure: (err) => {
            console.error('MQTT connection failed:', err);
            updateMQTTStatus(false);
            
            // If SSL connection fails, try non-SSL
            if (useSSL && CONFIG.MQTT.WS_PORT !== port) {
                console.log('Retrying with non-SSL connection...');
                setTimeout(() => connectMQTT(CONFIG.MQTT.WS_PORT, false), 1000);
            }
        },
        useSSL: useSSL,
        timeout: CONFIG.MQTT.KEEPALIVE
    };

    try {
        mqttClient.connect(connectOptions);
    } catch (error) {
        console.error('MQTT connection error:', error);
        updateMQTTStatus(false);
    }
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log('MQTT connection lost:', responseObject.errorMessage);
        updateMQTTStatus(false);
        
        if (CONFIG.APP.AUTO_RECONNECT) {
            console.log('Attempting to reconnect...');
            setTimeout(initializeMQTT, CONFIG.APP.RECONNECT_TIMEOUT);
        }
    }
}

function onMessageArrived(message) {
    try {
        const data = JSON.parse(message.payloadString);
        console.log('MQTT message received:', data);
        
        if (data.type === 'new_message') {
            const messageObj = data.message;
            // Only show message if it's from the currently selected user
            if (selectedUser && messageObj.sender_id === selectedUser.id) {
                displayMessage(messageObj, false);
            }
        }
    } catch (error) {
        console.error('Error processing MQTT message:', error);
    }
}

function publishMessage(message) {
    if (!mqttClient || !selectedUser) return;

    const messageObj = {
        type: 'new_message',
        message: message
    };

    try {
        const mqtt_message = new Paho.MQTT.Message(JSON.stringify(messageObj));
        mqtt_message.destinationName = `chat/${selectedUser.id}`;
        mqttClient.send(mqtt_message);
        console.log('MQTT message sent:', messageObj);
    } catch (error) {
        console.error('Error publishing message:', error);
        updateMQTTStatus(false);
    }
}

function selectUser(user) {
    selectedUser = user;
    
    // Update UI
    const selectedUserElement = document.getElementById('selected-user');
    if (selectedUserElement) {
        selectedUserElement.textContent = user.username;
    }
    
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    if (messageInput && sendButton) {
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
    
    loadChatHistory();
}

async function loadChatHistory() {
    if (!selectedUser) return;

    try {
        const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
        const response = await fetch(`${CONFIG.API_BASE_URL}/messages/${selectedUser.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const messages = await response.json();
        const messagesContainer = document.getElementById('messages-container');
        
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            messages.forEach(message => {
                const isSent = message.sender_id.toString() === localStorage.getItem(CONFIG.AUTH.USER_ID_KEY);
                displayMessage(message, isSent);
            });
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

function displayMessage(message, isSent) {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
    messageElement.textContent = message.content;
    
    // Add timestamp if available
    if (message.timestamp) {
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date(message.timestamp).toLocaleTimeString();
        messageElement.appendChild(timestamp);
    }
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}