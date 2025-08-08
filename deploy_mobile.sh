#!/bin/bash

# Mobile Deployment Script for Emotion Verifier
echo "🚀 Mobile Deployment Script"
echo "=========================="

# Get computer's IP address
echo "📱 Getting your computer's IP address..."
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo "Your computer's IP address: $IP_ADDRESS"

# Check if Python backend is running
echo "🔍 Checking if Python backend is running..."
if pgrep -f "emotion_detector.py" > /dev/null; then
    echo "✅ Python backend is already running"
else
    echo "⚠️ Python backend is not running"
    echo "Starting Python backend..."
    python3 emotion_detector.py &
    sleep 3
fi

# Test backend connection
echo "🧪 Testing backend connection..."
if curl -s http://localhost:5000/get_emotion > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is not responding"
    echo "Please start the backend manually: python3 emotion_detector.py"
    exit 1
fi

# Display mobile access instructions
echo ""
echo "📱 Mobile Access Instructions:"
echo "=============================="
echo "1. Make sure your phone is on the same WiFi network as this computer"
echo "2. Open your phone's web browser"
echo "3. Go to: http://$IP_ADDRESS:5000"
echo "4. Allow camera permissions when prompted"
echo ""
echo "🔧 Troubleshooting:"
echo "- If you can't access the app, check your firewall settings"
echo "- Make sure port 5000 is not blocked"
echo "- Try using a different port if needed"
echo ""
echo "🌐 Alternative access methods:"
echo "- Local: http://localhost:5000"
echo "- Network: http://$IP_ADDRESS:5000"
echo ""
echo "📋 Quick commands:"
echo "- Stop backend: pkill -f emotion_detector.py"
echo "- Restart backend: python3 emotion_detector.py"
echo "- Check status: curl http://localhost:5000/get_emotion"
