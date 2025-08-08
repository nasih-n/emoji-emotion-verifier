class EmotionVerifier {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.processedVideo = document.getElementById('processed-video');
        this.cameraLoading = document.getElementById('camera-loading');
        this.detector = null;
        this.isDetecting = false;
        this.selectedEmotion = null;
        this.currentEmotion = null;
        this.emotionConfidence = 0;
        this.pythonBackend = 'http://localhost:5000';
        this.usePythonBackend = true; // Set to false to use TensorFlow.js
        
        this.emotions = ['happy', 'sad', 'angry', 'fear', 'neutral'];
        this.emotionMap = {
            'happy': '😊',
            'sad': '😢',
            'angry': '😠',
            'fear': '😨',
            'neutral': '😐'
        };
        
        this.initializeEventListeners();
    }

    async initialize() {
        console.log('Initializing emotion detection system...');
        
        // Always initialize TensorFlow.js as primary detection method
        // Python backend causes camera conflicts when browser is using camera
        this.usePythonBackend = false;
        await this.initializeTensorFlow();
        
        console.log('🎯 Using TensorFlow.js for face detection to avoid camera conflicts');
        
        // Auto-start camera after initialization
        this.autoStartCamera();
    }

    async initializeTensorFlow() {
        try {
            console.log('🔄 Loading TensorFlow.js face detection model...');
            
            // Load the face landmarks detection model with improved settings
            this.detector = await faceLandmarksDetection.createDetector(
                faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
                {
                    runtime: 'tfjs',
                    refineLandmarks: false, // Disable for better performance
                    maxFaces: 1,
                    modelUrl: undefined // Use default model
                }
            );
            console.log('✅ TensorFlow.js face detection model loaded successfully');
        } catch (error) {
            console.error('❌ Error loading face detection model:', error);
            
            // Try fallback configuration
            try {
                console.log('🔄 Trying fallback configuration...');
                this.detector = await faceLandmarksDetection.createDetector(
                    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
                );
                console.log('✅ Fallback face detection model loaded');
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
                this.showError('Failed to load face detection model. Please refresh the page.');
            }
        }
    }

    initializeEventListeners() {
        // Camera controls
        document.getElementById('start-camera').addEventListener('click', () => this.startCamera());
        document.getElementById('stop-camera').addEventListener('click', () => this.stopCamera());
        document.getElementById('test-detection').addEventListener('click', () => this.testDetection());

        // Emoji selection
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectEmotion(e.target.dataset.emotion);
            });
        });
    }

    async startCamera() {
        try {
            console.log('🎥 Starting camera...');
            // Show loading indicator
            this.cameraLoading.style.display = 'block';
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 480, 
                    height: 360,
                    facingMode: 'user'
                } 
            });
            
            this.video.srcObject = stream;
            this.video.play();
            
            console.log('✅ Camera started successfully');
            
            // Hide loading indicator
            this.cameraLoading.style.display = 'none';
            
            document.getElementById('start-camera').disabled = true;
            document.getElementById('stop-camera').disabled = false;
            
            // Start emotion detection based on backend
            if (this.usePythonBackend) {
                console.log('🐍 Using Python backend for detection');
                await this.startPythonDetection();
            } else {
                console.log('⚡ Using TensorFlow.js for detection');
                this.startEmotionDetection();
            }
            
        } catch (error) {
            console.error('❌ Error accessing camera:', error);
            this.cameraLoading.style.display = 'none';
            this.showError('Camera access denied. Please allow camera permissions and try again.');
        }
    }

    async autoStartCamera() {
        try {
            console.log('Auto-starting camera...');
            await this.startCamera();
            console.log('Camera auto-started successfully');
        } catch (error) {
            console.error('Auto-start camera failed:', error);
            // Don't show error to user for auto-start, just log it
        }
    }

    async startPythonDetection() {
        try {
            // Start Python backend detection
            const response = await fetch(`${this.pythonBackend}/start_detection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('Python backend detection started');
                this.startPythonEmotionPolling();
            } else {
                throw new Error('Failed to start Python detection');
            }
        } catch (error) {
            console.error('Error starting Python detection:', error);
            this.showError('Failed to start Python emotion detection. Falling back to TensorFlow.js.');
            this.usePythonBackend = false;
            this.startEmotionDetection();
        }
    }

    startPythonEmotionPolling() {
        this.isDetecting = true;
        this.pollPythonEmotion();
        this.pollPythonVideo();
    }

    async pollPythonEmotion() {
        if (!this.isDetecting) return;

        try {
            const response = await fetch(`${this.pythonBackend}/get_emotion`);
            if (response.ok) {
                const data = await response.json();
                console.log('Python emotion data:', data);
                
                if (data.emotion === 'no_face') {
                    document.getElementById('emotion-text').textContent = 'Cannot locate suspect';
                    document.getElementById('emotion-confidence').style.setProperty('--confidence', '0%');
                } else {
                    this.currentEmotion = data.emotion;
                    this.emotionConfidence = data.confidence;
                    this.updateEmotionDisplay();
                    this.verifyEmotion();
                }
            } else {
                console.error('Python emotion response not ok:', response.status);
            }
        } catch (error) {
            console.error('Error polling Python emotion:', error);
        }

        // Continue polling
        setTimeout(() => this.pollPythonEmotion(), 100);
    }

    async pollPythonVideo() {
        if (!this.isDetecting) return;

        try {
            const response = await fetch(`${this.pythonBackend}/get_video_frame`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    // Update processed video with face border
                    this.processedVideo.src = data.frame;
                    this.processedVideo.style.display = 'block';
                    this.video.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error polling Python video:', error);
        }

        // Continue polling video
        setTimeout(() => this.pollPythonVideo(), 50); // Faster polling for video
    }

    async stopCamera() {
        const stream = this.video.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        this.video.srcObject = null;
        this.isDetecting = false;
        
        // Stop Python backend if using it
        if (this.usePythonBackend) {
            try {
                await fetch(`${this.pythonBackend}/stop_detection`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('Error stopping Python detection:', error);
            }
        }
        
        document.getElementById('start-camera').disabled = false;
        document.getElementById('stop-camera').disabled = true;
        
        // Reset UI
        document.getElementById('emotion-text').textContent = 'Surveillance terminated';
        document.getElementById('verification-text').textContent = 'Choose an emoji to begin your emotional trial';
        document.getElementById('emotion-confidence').style.setProperty('--confidence', '0%');
        
        // Reset video display
        this.video.style.display = 'block';
        this.processedVideo.style.display = 'none';
        this.canvas.style.display = 'none';
    }

    async startEmotionDetection() {
        if (!this.detector) {
            console.error('❌ Face detector not initialized');
            return;
        }

        console.log('⚡ Starting TensorFlow.js emotion detection...');
        this.isDetecting = true;
        this.detectEmotion();
        
        // Show canvas for TensorFlow.js detection
        this.canvas.style.display = 'block';
        this.video.style.display = 'none';
        console.log('🎨 Canvas displayed for face border drawing');
    }

    async detectEmotion() {
        if (!this.isDetecting) return;

        try {
            // Ensure video is ready
            if (this.video.readyState !== 4) {
                console.log('⏳ Video not ready yet, skipping frame...');
                requestAnimationFrame(() => this.detectEmotion());
                return;
            }

            // Draw video frame to canvas
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Detect face landmarks with improved error handling
            const faces = await this.detector.estimateFaces(this.canvas);
            
            if (faces && faces.length > 0) {
                console.log(`✅ TensorFlow.js detected ${faces.length} face(s)`);
                const face = faces[0];
                
                // Verify face has keypoints
                if (face.keypoints && face.keypoints.length > 0) {
                    const emotion = this.analyzeFacialExpression(face);
                    
                    console.log('🎭 TensorFlow.js emotion:', emotion);
                    
                    this.currentEmotion = emotion.emotion;
                    this.emotionConfidence = emotion.confidence;
                    
                    // Draw face border
                    this.drawFaceBorder(face);
                    
                    this.updateEmotionDisplay();
                    this.verifyEmotion();
                } else {
                    console.log('⚠️ Face detected but no keypoints available');
                    this.showNoFaceDetected();
                }
            } else {
                console.log('❌ No faces detected by TensorFlow.js');
                this.showNoFaceDetected();
            }
            
        } catch (error) {
            console.error('❌ Error detecting emotion:', error);
            // Show error in UI but don't stop detection
            document.getElementById('emotion-text').textContent = 'Detection error - retrying...';
            document.getElementById('emotion-confidence').style.setProperty('--confidence', '0%');
        }

        // Continue detection with a small delay to prevent overwhelming
        setTimeout(() => requestAnimationFrame(() => this.detectEmotion()), 100);
    }
    
    showNoFaceDetected() {
        document.getElementById('emotion-text').textContent = 'Suspect not found';
        document.getElementById('emotion-confidence').style.setProperty('--confidence', '0%');
        
        // Clear canvas and redraw video
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    }

    drawFaceBorder(face) {
        try {
            // Get face bounding box
            const keypoints = face.keypoints;
            console.log(`🎨 Drawing border for face with ${keypoints.length} keypoints`);
            
            if (keypoints && keypoints.length > 0) {
                // Calculate bounding box from keypoints
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                
                keypoints.forEach(point => {
                    if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                        minX = Math.min(minX, point.x);
                        minY = Math.min(minY, point.y);
                        maxX = Math.max(maxX, point.x);
                        maxY = Math.max(maxY, point.y);
                    }
                });
                
                // Validate bounding box
                if (minX !== Infinity && minY !== Infinity && maxX !== -Infinity && maxY !== -Infinity) {
                    console.log(`📐 Face bounding box: (${minX.toFixed(1)}, ${minY.toFixed(1)}) to (${maxX.toFixed(1)}, ${maxY.toFixed(1)})`);
                    
                    // Clear canvas and redraw video
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                    
                    // Add padding and ensure coordinates are within canvas bounds
                    const padding = 15;
                    const x = Math.max(0, minX - padding);
                    const y = Math.max(0, minY - padding);
                    const width = Math.min(this.canvas.width - x, maxX - minX + 2 * padding);
                    const height = Math.min(this.canvas.height - y, maxY - minY + 2 * padding);
                    
                    // Draw green rectangle around face
                    this.ctx.strokeStyle = '#00ff00';
                    this.ctx.lineWidth = 4;
                    this.ctx.strokeRect(x, y, width, height);
                    
                    // Add emotion label with background
                    if (this.currentEmotion) {
                        const label = this.currentEmotion.toUpperCase();
                        const labelY = Math.max(20, y - 5);
                        
                        // Draw background for text
                        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                        this.ctx.fillRect(x, labelY - 20, label.length * 12, 25);
                        
                        // Draw text
                        this.ctx.fillStyle = '#00ff00';
                        this.ctx.font = 'bold 16px Arial';
                        this.ctx.fillText(label, x + 5, labelY);
                    }
                    
                    console.log('✅ Green border drawn successfully');
                } else {
                    console.log('⚠️ Invalid bounding box coordinates');
                }
            } else {
                console.log('⚠️ No valid keypoints for face border');
            }
        } catch (error) {
            console.error('❌ Error drawing face border:', error);
        }
    }

    analyzeFacialExpression(face) {
        // Extract key facial landmarks for emotion analysis
        const landmarks = face.keypoints;
        
        // Calculate facial features
        const features = this.calculateFacialFeatures(landmarks);
        
        // Simple emotion classification based on facial features
        const emotion = this.classifyEmotion(features);
        
        return emotion;
    }

    calculateFacialFeatures(landmarks) {
        console.log('📐 Calculating facial features from', landmarks.length, 'landmarks');
        
        // Extract key points for emotion analysis
        const leftEye = landmarks[33]; // Left eye corner
        const rightEye = landmarks[263]; // Right eye corner
        const leftMouth = landmarks[61]; // Left mouth corner
        const rightMouth = landmarks[291]; // Right mouth corner
        const nose = landmarks[1]; // Nose tip
        
        // Calculate distances and ratios
        const eyeDistance = this.distance(leftEye, rightEye);
        const mouthWidth = this.distance(leftMouth, rightMouth);
        const mouthHeight = this.calculateMouthHeight(landmarks);
        const eyebrowHeight = this.calculateEyebrowHeight(landmarks);
        
        const features = {
            eyeDistance,
            mouthWidth,
            mouthHeight,
            eyebrowHeight,
            nosePosition: nose
        };
        
        console.log('📊 Facial features calculated:', features);
        return features;
    }

    distance(point1, point2) {
        return Math.sqrt(
            Math.pow(point1.x - point2.x, 2) + 
            Math.pow(point1.y - point2.y, 2)
        );
    }

    calculateMouthHeight(landmarks) {
        const upperLip = landmarks[13]; // Upper lip
        const lowerLip = landmarks[14]; // Lower lip
        return this.distance(upperLip, lowerLip);
    }

    calculateEyebrowHeight(landmarks) {
        const leftEyebrow = landmarks[70]; // Left eyebrow
        const rightEyebrow = landmarks[300]; // Right eyebrow
        const leftEye = landmarks[33]; // Left eye
        const rightEye = landmarks[263]; // Right eye
        
        const leftHeight = Math.abs(leftEyebrow.y - leftEye.y);
        const rightHeight = Math.abs(rightEyebrow.y - rightEye.y);
        
        return (leftHeight + rightHeight) / 2;
    }

    classifyEmotion(features) {
        console.log('🔍 Analyzing facial features:', features);
        
        // Improved emotion classification with better thresholds
        const emotions = [];
        
        // Happy: wide mouth, raised cheeks
        if (features.mouthWidth > 45 && features.mouthHeight > 12) {
            emotions.push({ emotion: 'happy', confidence: 0.85 });
            console.log('😊 Happy detected: wide mouth');
        }
        
        // Sad: downturned mouth, lowered eyebrows
        if (features.mouthHeight < 8 && features.eyebrowHeight > 18) {
            emotions.push({ emotion: 'sad', confidence: 0.75 });
            console.log('😢 Sad detected: downturned mouth');
        }
        
        // Angry: furrowed brows, tight mouth
        if (features.eyebrowHeight < 12 && features.mouthWidth < 35) {
            emotions.push({ emotion: 'angry', confidence: 0.7 });
            console.log('😠 Angry detected: furrowed brows');
        }
        
        // Fear: wide eyes, raised eyebrows
        if (features.eyeDistance > 55 && features.eyebrowHeight > 22) {
            emotions.push({ emotion: 'fear', confidence: 0.65 });
            console.log('😨 Fear detected: wide eyes');
        }
        
        // Neutral: balanced features (default)
        if (emotions.length === 0) {
            emotions.push({ emotion: 'neutral', confidence: 0.9 });
            console.log('😐 Neutral detected: balanced features');
        }
        
        // Return the emotion with highest confidence
        const result = emotions.reduce((max, current) => 
            current.confidence > max.confidence ? current : max
        );
        
        console.log('🎯 Final emotion classification:', result);
        return result;
    }

    selectEmotion(emotion) {
        console.log('🎯 Emotion selected:', emotion);
        
        // Remove previous selection
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection to clicked button
        event.target.classList.add('selected');
        
        this.selectedEmotion = emotion;
        console.log('✅ Emotion selection updated, running verification...');
        this.verifyEmotion();
    }

    verifyEmotion() {
        console.log('🔍 Verifying emotion:', {
            selected: this.selectedEmotion,
            detected: this.currentEmotion,
            confidence: this.emotionConfidence
        });
        
        if (!this.selectedEmotion || !this.currentEmotion) {
            console.log('⚠️ Cannot verify: missing selected or detected emotion');
            return;
        }

        const verificationText = document.getElementById('verification-text');
        const confidence = this.emotionConfidence;
        
        // Check if emotions match
        if (this.selectedEmotion === this.currentEmotion) {
            if (confidence > 0.7) {
                verificationText.textContent = `✅ VERDICT: Emotionally Honest! You're not a fraud (this time). Your ${this.selectedEmotion} expression is genuine with ${Math.round(confidence * 100)}% certainty.`;
                verificationText.className = 'verification-success';
                console.log('✅ Verification successful: emotions match with high confidence');
            } else {
                verificationText.textContent = `⚠️ VERDICT: Suspicious Activity! Emotions match but our Truth-o-Meter™ shows only ${Math.round(confidence * 100)}% confidence. We're watching you closely...`;
                verificationText.className = 'verification-neutral';
                console.log('⚠️ Verification partial: emotions match but low confidence');
            }
        } else {
            verificationText.textContent = `❌ VERDICT: EMOTIONAL FRAUD DETECTED! You selected ${this.selectedEmotion} but your face betrays ${this.currentEmotion} (${Math.round(confidence * 100)}% certainty). You've been caught red-handed!`;
            verificationText.className = 'verification-failure';
            console.log('❌ Verification failed: emotions do not match');
        }
    }

    updateEmotionDisplay() {
        const emotionText = document.getElementById('emotion-text');
        const confidenceBar = document.getElementById('emotion-confidence');
        
        emotionText.textContent = this.currentEmotion.charAt(0).toUpperCase() + this.currentEmotion.slice(1);
        
        // Update confidence bar
        const confidencePercent = Math.round(this.emotionConfidence * 100);
        confidenceBar.style.setProperty('--confidence', `${confidencePercent}%`);
        
        // Add confidence text
        confidenceBar.setAttribute('title', `${confidencePercent}% confidence`);
    }

    showError(message) {
        const verificationText = document.getElementById('verification-text');
        verificationText.textContent = message;
        verificationText.className = 'verification-failure';
    }

    async testDetection() {
        console.log('🧪 Running comprehensive face detection test...');
        
        const status = {
            detector: !!this.detector,
            video: !!this.video.srcObject,
            videoReady: this.video.readyState === 4,
            isDetecting: this.isDetecting,
            currentEmotion: this.currentEmotion,
            selectedEmotion: this.selectedEmotion,
            canvasSize: `${this.canvas.width}x${this.canvas.height}`,
            videoSize: `${this.video.videoWidth}x${this.video.videoHeight}`
        };
        
        console.log('📊 Current status:', status);
        
        if (!this.detector) {
            console.error('❌ No detector available');
            this.showError('No face detector available. Trying to reinitialize...');
            await this.initializeTensorFlow();
            return;
        }
        
        if (!this.video.srcObject) {
            console.error('❌ No video stream available');
            this.showError('No camera stream available. Please start camera first.');
            return;
        }
        
        if (this.video.readyState !== 4) {
            console.error('❌ Video not ready');
            this.showError('Video not ready. Please wait for camera to initialize.');
            return;
        }
        
        console.log('✅ Test conditions met, running detection...');
        
        try {
            // Draw current frame to canvas
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Force a single detection cycle
            const faces = await this.detector.estimateFaces(this.canvas);
            
            if (faces && faces.length > 0) {
                console.log(`🎯 Test SUCCESS: Detected ${faces.length} face(s)`);
                const face = faces[0];
                console.log(`📊 Face keypoints: ${face.keypoints ? face.keypoints.length : 0}`);
                
                this.showError(`✅ Test SUCCESS: ${faces.length} face(s) detected with ${face.keypoints ? face.keypoints.length : 0} keypoints`);
                
                // Draw test border
                if (face.keypoints && face.keypoints.length > 0) {
                    this.drawFaceBorder(face);
                }
            } else {
                console.log('❌ Test FAILED: No faces detected');
                this.showError('❌ Test FAILED: No faces detected. Try adjusting lighting or position.');
            }
            
        } catch (error) {
            console.error('❌ Test ERROR:', error);
            this.showError(`❌ Test ERROR: ${error.message}`);
        }
        
        console.log('📋 Final status:', {
            ...status,
            testCompleted: new Date().toISOString()
        });
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const verifier = new EmotionVerifier();
    await verifier.initialize();
    
    // Make verifier globally accessible for debugging
    window.emotionVerifier = verifier;
});
