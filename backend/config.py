import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///chat.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # MQTT Config
    MQTT_BROKER_URL = 'broker.hivemq.com'  # Free public MQTT broker
    MQTT_BROKER_PORT = 1883  # TCP port for backend
    MQTT_USERNAME = ''  # Not required for public broker
    MQTT_PASSWORD = ''  # Not required for public broker
    MQTT_KEEPALIVE = 60
    MQTT_TLS_ENABLED = False  # Using non-TLS port for backend
    
    # Note: Frontend uses WebSocket ports (8000 for WS, 8884 for WSS)
    # Backend uses TCP port 1883 for direct MQTT connection