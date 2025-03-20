// Configuration for the chat application
const CONFIG = {
    // Backend API URL - Change this when deploying
    API_BASE_URL: 'yoururl/api',
    
    // MQTT Configuration
    MQTT: {
        BROKER_URL: 'broker.hivemq.com',
        WS_PORT: 8000,      // WebSocket port
        WSS_PORT: 8884,     // Secure WebSocket port
        USE_SSL: true,      // Whether to try SSL first
        KEEPALIVE: 60
    },
    
    // Authentication settings
    AUTH: {
        TOKEN_KEY: 'token',
        USER_ID_KEY: 'user_id',
        USERNAME_KEY: 'username'
    },
    
    // Application settings
    APP: {
        AUTO_RECONNECT: true,
        RECONNECT_TIMEOUT: 5000,
        STATUS_CHECK_INTERVAL: 30000
    }
};