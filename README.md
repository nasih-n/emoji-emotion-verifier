# Emoji Picker with Emotion Verification

A web application that uses facial expression detection to verify whether a user's actual emotion matches the emoji they select. Features both Python backend (using OpenCV and DeepFace) and JavaScript frontend for maximum accuracy.

## 🌟 Features

- **Dual Detection Systems**: 
  - **Python Backend**: High-accuracy emotion detection using OpenCV and DeepFace
  - **JavaScript Frontend**: Fallback detection using TensorFlow.js and MediaPipe Face Mesh
- **Real-time facial expression detection** with automatic backend switching
- **Emotion verification** that cross-checks selected emoji with detected facial expression
- **Limited emotion set**: Happy, Sad, Angry, Fear, and Neutral (No emotion)
- **Confidence scoring** to indicate how reliable the emotion detection is
- **Modern, responsive UI** with beautiful dark theme
- **Mobile-friendly** design that works on phones and tablets
- **Green face border** for clear visual feedback

## 📱 Mobile Support

### **Mobile Features:**
- **Responsive design**: Works on all screen sizes
- **Touch-friendly**: Large buttons and touch targets
- **Camera access**: Works with mobile cameras
- **Auto-rotation**: Adapts to portrait and landscape
- **Fast loading**: Optimized for mobile networks

### **Mobile Deployment Options:**

#### **Option 1: Local Network (Recommended)**
```bash
# Start Python backend
python3 emotion_detector.py

# Access from phone on same WiFi
# Replace YOUR_COMPUTER_IP with your computer's IP address
http://YOUR_COMPUTER_IP:5000
```

#### **Option 2: Cloud Deployment**
- **Heroku**: Deploy Python backend to cloud
- **Netlify/Vercel**: Deploy frontend to CDN
- **Docker**: Containerized deployment

#### **Option 3: Progressive Web App (PWA)**
- Install as app on phone
- Works offline with cached models
- Native app-like experience

## 🚀 Quick Start

### **Local Development:**
```bash
# Clone the repository
git clone https://github.com/yourusername/emotion-verifier.git
cd emotion-verifier

# Install Python dependencies
python3 setup.py

# Start the backend
python3 emotion_detector.py

# Open index.html in browser
# Or use the startup script
./start_emotion_detector.sh
```

### **Mobile Access:**
1. **Find your computer's IP address:**
   ```bash
   # On Linux/Mac
   ifconfig | grep "inet "
   
   # On Windows
   ipconfig | findstr "IPv4"
   ```

2. **Start the backend:**
   ```bash
   python3 emotion_detector.py
   ```

3. **Access from phone:**
   - Open browser on phone
   - Go to: `http://YOUR_COMPUTER_IP:5000`
   - Allow camera permissions

## 📋 Installation

### **Requirements:**
- Python 3.7+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Camera access
- Internet connection (for model downloads)

### **Python Backend (Primary)**
- **OpenCV**: Real-time video capture and image processing
- **DeepFace**: Pre-trained deep learning models for emotion recognition
- **Flask**: RESTful API server for communication with frontend
- **TensorFlow**: Underlying ML framework for emotion classification

### **JavaScript Frontend (Fallback)**
- Built with vanilla JavaScript, HTML5, and CSS3
- Uses TensorFlow.js for face landmark detection
- MediaPipe Face Mesh model for facial feature extraction
- Real-time video processing with WebRTC
- Responsive design for mobile and desktop

## 🎯 How to Use

1. **Open the application** in a web browser
2. **Allow camera permissions** when prompted
3. **Camera starts automatically** (no need to click start)
4. **Select an emoji** that represents your current emotion
5. **Express the emotion** on your face
6. **View the verification result** to see if your expression matches your selection

## 🔧 Technical Details

### **Architecture:**
- **Automatic Fallback**: If Python backend is unavailable, automatically switches to TensorFlow.js
- **RESTful API**: Communication between frontend and Python backend
- **Real-time Polling**: Continuous emotion detection with 100ms intervals
- **Mobile-first**: Responsive design optimized for phones

### **API Endpoints:**
- `POST /start_detection` - Start camera and detection
- `POST /stop_detection` - Stop camera and detection
- `GET /get_emotion` - Get current emotion and confidence
- `POST /analyze_frame` - Analyze emotion from base64 image
- `GET /get_video_frame` - Get video frame with face border

## 📱 Mobile Optimization

### **Responsive Design:**
- **Desktop**: Two-column layout with camera on left
- **Tablet**: Single column with camera on top
- **Mobile**: Optimized for small screens with touch-friendly controls

### **Performance:**
- **Lazy loading**: Models load only when needed
- **Caching**: Browser caches models for faster loading
- **Compression**: Optimized images and assets
- **Minimal dependencies**: Lightweight for mobile networks

## 🌐 Deployment

### **GitHub Pages (Frontend Only):**
```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Enable GitHub Pages in repository settings
# Access at: https://yourusername.github.io/repository-name
```

### **Heroku (Full Stack):**
```bash
# Create Procfile
echo "web: python3 emotion_detector.py" > Procfile

# Deploy to Heroku
heroku create your-app-name
git push heroku main
```

### **Docker:**
```bash
# Build and run with Docker
docker build -t emotion-verifier .
docker run -p 5000:5000 emotion-verifier
```

## 🐛 Troubleshooting

### **Mobile Issues:**
- **Camera not working**: Ensure HTTPS for camera access
- **Slow performance**: Check internet connection for model downloads
- **Layout issues**: Try landscape mode on phones
- **Touch not working**: Ensure touch-friendly button sizes

### **Network Issues:**
- **Backend connection failed**: Check firewall settings
- **Port 5000 blocked**: Change port in emotion_detector.py
- **CORS errors**: Ensure CORS is enabled in Flask

### **General Issues:**
- **Model loading errors**: Check internet connection
- **Memory issues**: Close other apps on mobile
- **Battery drain**: Optimize polling frequency

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues:
1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Run the test script: `python3 test_camera.py`
3. Open an issue on GitHub with details
4. Include your device/browser information

## 🎉 Acknowledgments

- **DeepFace**: For emotion detection models
- **TensorFlow.js**: For browser-based ML
- **MediaPipe**: For face landmark detection
- **OpenCV**: For computer vision capabilities
