# Troubleshooting Guide

## "No Face Detected" Issues

### 🔍 **Step 1: Run Camera Test**
```bash
python3 test_camera.py
```
This will test:
- Camera access
- Face detection with different backends
- Continuous detection for 10 seconds

### 🎥 **Step 2: Check Camera Access**

#### **Linux:**
```bash
# Check if camera is detected
ls /dev/video*

# Test camera with v4l2
v4l2-ctl --list-devices

# Check camera permissions
ls -la /dev/video*
```

#### **Windows:**
- Open Device Manager
- Check "Imaging devices" or "Cameras"
- Ensure camera is enabled and working

#### **macOS:**
- System Preferences → Security & Privacy → Camera
- Ensure your terminal/application has camera access

### 💡 **Step 3: Common Solutions**

#### **Camera Permission Issues:**
```bash
# Linux - give camera permissions
sudo usermod -a -G video $USER

# Or run with sudo (temporary)
sudo python3 emotion_detector.py
```

#### **Camera in Use:**
```bash
# Check what's using the camera
lsof /dev/video0

# Kill processes using camera
sudo fuser -k /dev/video0
```

#### **Multiple Cameras:**
If you have multiple cameras, try different camera indices:
```python
# In emotion_detector.py, change:
self.cap = cv2.VideoCapture(0)  # Try 1, 2, etc.
```

### 🌟 **Step 4: Face Detection Tips**

#### **Lighting:**
- Ensure face is well-lit
- Avoid backlighting
- Use natural or bright artificial light

#### **Positioning:**
- Face should be clearly visible
- Not too close (minimum 30cm)
- Not too far (maximum 2m)
- Face should be centered in frame

#### **Camera Settings:**
- Ensure camera is focused
- Check camera resolution (640x480 recommended)
- Clean camera lens if dirty

### 🔧 **Step 5: Debug Mode**

The application now has debug mode enabled. Check the console output for:
- Frame processing messages
- Face detection attempts
- Error messages

### 📊 **Step 6: Test Different Backends**

The system tries multiple face detection backends:
1. **OpenCV** (fastest, most reliable)
2. **MTCNN** (more accurate)
3. **RetinaFace** (most accurate)

If one fails, it automatically tries the next.

### 🐛 **Step 7: Common Error Messages**

#### **"Camera not available"**
- Camera not connected
- Camera in use by another application
- Camera permissions denied

#### **"All detector backends failed"**
- Face not clearly visible
- Poor lighting conditions
- Face too close/far from camera

#### **"Failed to read frame from camera"**
- Camera hardware issue
- Driver problems
- Camera not properly connected

### 🚀 **Step 8: Quick Fixes**

#### **Restart Everything:**
```bash
# Kill any existing processes
pkill -f emotion_detector.py
pkill -f python

# Restart the application
python3 emotion_detector.py
```

#### **Clear Browser Cache:**
- Hard refresh the webpage (Ctrl+F5)
- Clear browser cache and cookies
- Try different browser

#### **Check Network:**
- Ensure Python backend is running on localhost:5000
- Check if port 5000 is available
- Try different port if needed

### 📞 **Step 9: Still Having Issues?**

1. **Run the test script** and share the output
2. **Check console logs** for error messages
3. **Try the JavaScript-only mode** (set `usePythonBackend = false` in script.js)
4. **Test with a different camera** if available

### 🎯 **Expected Behavior**

When working correctly, you should see:
- Green border around detected face
- Emotion label above the face
- Real-time emotion updates
- Confidence percentage display

If you're still having issues, please share:
- Operating system and version
- Python version (`python3 --version`)
- Output from `test_camera.py`
- Any error messages from the console
