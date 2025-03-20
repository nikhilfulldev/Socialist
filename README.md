# Real-time Social Chat App

A simple social chat application with real-time messaging using Flask, SQLite, and MQTT.

## Features
- User registration and authentication
- Real-time messaging using MQTT
- Simple and clean interface
- User ID-based connections
- Message history

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```
The backend will run on http://localhost:5000

### Frontend Setup
1. The frontend is static HTML/CSS/JS, so you can simply open the `frontend/index.html` file in your browser, or serve it using a local server.

2. For example, using Python's built-in HTTP server:
```bash
cd frontend
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

## Usage
1. Register a new account or login with existing credentials
2. Click on a user from the sidebar to start chatting
3. Type your message and press Enter or click Send
4. Messages will appear in real-time for both users

## Technical Details
- Backend: Flask with SQLite database
- Frontend: Vanilla HTML, CSS, and JavaScript
- Real-time messaging: MQTT over WebSocket using HiveMQ's public broker
- Authentication: JWT tokens

## Security Notes
- Passwords are hashed using bcrypt
- JWT tokens are used for API authentication
- MQTT communication is done over WebSocket Secure (WSS)