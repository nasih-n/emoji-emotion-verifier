# Emoji Picker with Emotion Verification

A web application that uses facial expression detection to verify whether a user's actual emotion matches the emoji they select. Features both Python backend (using OpenCV and DeepFace) and JavaScript frontend for maximum accuracy.

## Features

- **Dual Detection Systems**: 
  - **Python Backend**: High-accuracy emotion detection using OpenCV and DeepFace
  - **JavaScript Frontend**: Fallback detection using TensorFlow.js and MediaPipe Face Mesh
- **Real-time facial expression detection** with automatic backend switching
- **Emotion verification** that cross-checks selected emoji with detected facial expression
- **Limited emotion set**: Happy, Sad, Angry, Fear, and Neutral (No emotion)
- **Confidence scoring** to indicate how reliable the emotion detection is
- **Modern, responsive UI** with beautiful design

## How to Use

1. **Open the application** in a modern web browser (Chrome, Firefox, Safari, Edge)
2. **Allow camera permissions** when prompted
3. **Click "Start Camera"** to begin facial detection
4. **Select an emoji** that represents your current emotion
5. **Express the emotion** on your face
6. **View the verification result** to see if your expression matches your selection

## Emotion Detection

The application analyzes facial landmarks to detect emotions:

- **Happy**: Wide mouth, raised cheeks
- **Sad**: Downturned mouth, lowered eyebrows  
- **Angry**: Furrowed brows, tight mouth
- **Fear**: Wide eyes, raised eyebrows
- **Neutral**: Balanced facial features

## Verification Results

- **✅ Great match**: Your expression genuinely matches the selected emotion (high confidence)
- **⚠️ Low confidence**: Emotions match but detection confidence is low
- **❌ Mismatch**: Your facial expression doesn't match the selected emotion

## Technical Details

### Python Backend (Primary)
- **OpenCV**: Real-time video capture and image processing
- **DeepFace**: Pre-trained deep learning models for emotion recognition
- **Flask**: RESTful API server for communication with frontend
- **TensorFlow**: Underlying ML framework for emotion classification

### JavaScript Frontend (Fallback)
- Built with vanilla JavaScript, HTML5, and CSS3
- Uses TensorFlow.js for face landmark detection
- MediaPipe Face Mesh model for facial feature extraction
- Real-time video processing with WebRTC
- Responsive design for mobile and desktop

### Architecture
- **Automatic Fallback**: If Python backend is unavailable, automatically switches to TensorFlow.js
- **RESTful API**: Communication between frontend and Python backend
- **Real-time Polling**: Continuous emotion detection with 100ms intervals

## Browser Requirements

- Modern browser with WebRTC support
- Camera access permissions
- JavaScript enabled
- HTTPS connection (required for camera access in most browsers)

## Privacy

- All processing happens locally in your browser
- No video data is sent to external servers
- Camera access is only used for real-time emotion detection

## Getting Started

### Option 1: Python Backend (Recommended)
1. **Install Python dependencies**:
   ```bash
   python3 setup.py
   ```
   Or manually:
   ```bash
   pip3 install -r requirements.txt
   ```

2. **Start the Python backend**:
   ```bash
   python3 emotion_detector.py
   ```

3. **Open the web interface**:
   - Open `index.html` in your web browser
   - Or use the startup script: `./start_emotion_detector.sh`

### Option 2: JavaScript Only (Fallback)
1. Open `index.html` in a web browser
2. Allow camera permissions when prompted
3. The system will automatically use TensorFlow.js if Python backend is unavailable

### Quick Start
```bash
# Run the setup script
python3 setup.py

# Use the startup script (Linux/Mac)
./start_emotion_detector.sh

# Or start manually
python3 emotion_detector.py &
# Then open index.html in your browser
```

## Troubleshooting

### Python Backend Issues
- **Import errors**: Run `pip3 install -r requirements.txt` to install dependencies
- **Camera access denied**: Ensure camera permissions are granted to Python
- **Port 5000 in use**: Change the port in `emotion_detector.py` or kill the process using port 5000
- **DeepFace model download**: First run may take time to download pre-trained models

### Frontend Issues
- **Camera not working**: Ensure you've granted camera permissions to the website
- **Face not detected**: Make sure your face is clearly visible and well-lit
- **Model loading error**: Refresh the page and try again
- **Low confidence**: Try expressing the emotion more clearly or improve lighting

### General Issues
- **Backend connection failed**: The system will automatically fall back to TensorFlow.js
- **Performance issues**: Close other applications using the camera
- **Memory issues**: Restart the Python backend if it becomes unresponsive

## Limitations

- Emotion detection accuracy depends on lighting conditions
- Facial expressions must be clearly visible
- Works best with front-facing camera
- Detection may be less accurate with glasses or facial coverings
