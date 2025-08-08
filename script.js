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
        
        if (this.usePythonBackend) {
            try {
                // Test connection to Python backend
                const response = await fetch(`${this.pythonBackend}/get_emotion`);
                if (response.ok) {
                    console.log('✅ Python backend connected successfully');
                } else {
                    throw new Error('Python backend not available');
                }
            } catch (error) {
                console.warn('❌ Python backend not available, falling back to TensorFlow.js:', error);
                this.usePythonBackend = false;
                await this.initializeTensorFlow();
            }
        } else {
            await this.initializeTensorFlow();
        }
        
        // Auto-start camera after initialization
        this.autoStartCamera();
    }

    async initializeTensorFlow() {
        try {
            // Load the face landmarks detection model
            this.detector = await faceLandmarksDetection.createDetector(
                faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
                {
                    runtime: 'tfjs',
                    refineLandmarks: true,
                    maxFaces: 1
                }
            );
            console.log('TensorFlow.js face detection model loaded successfully');
        } catch (error) {
            console.error('Error loading face detection model:', error);
            this.showError('Failed to load face detection model. Please refresh the page.');
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
                    document.getElementById('emotion-text').textContent = 'No face detected';
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
        document.getElementById('emotion-text').textContent = 'Camera stopped';
        document.getElementById('verification-text').textContent = 'Select an emoji to verify your emotion';
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
            // Draw video frame to canvas
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Detect face landmarks
            const faces = await this.detector.estimateFaces(this.canvas);
            
            if (faces.length > 0) {
                console.log(`✅ TensorFlow.js detected ${faces.length} face(s)`);
                const face = faces[0];
                const emotion = this.analyzeFacialExpression(face);
                
                console.log('🎭 TensorFlow.js emotion:', emotion);
                
                this.currentEmotion = emotion.emotion;
                this.emotionConfidence = emotion.confidence;
                
                // Draw face border
                this.drawFaceBorder(face);
                
                this.updateEmotionDisplay();
                this.verifyEmotion();
            } else {
                console.log('❌ No faces detected by TensorFlow.js');
                document.getElementById('emotion-text').textContent = 'No face detected';
                document.getElementById('emotion-confidence').style.setProperty('--confidence', '0%');
                
                // Clear canvas when no face detected
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            }
            
        } catch (error) {
            console.error('❌ Error detecting emotion:', error);
            // Show error in UI
            document.getElementById('emotion-text').textContent = 'Detection error';
            document.getElementById('emotion-confidence').style.setProperty('--confidence', '0%');
        }

        // Continue detection
        requestAnimationFrame(() => this.detectEmotion());
    }

    drawFaceBorder(face) {
        try {
            // Get face bounding box
            const keypoints = face.keypoints;
            console.log(`🎨 Drawing border for face with ${keypoints.length} keypoints`);
            
            if (keypoints.length > 0) {
                // Calculate bounding box from keypoints
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                
                keypoints.forEach(point => {
                    minX = Math.min(minX, point.x);
                    minY = Math.min(minY, point.y);
                    maxX = Math.max(maxX, point.x);
                    maxY = Math.max(maxY, point.y);
                });
                
                console.log(`📐 Face bounding box: (${minX}, ${minY}) to (${maxX}, ${maxY})`);
                
                // Clear canvas and redraw video
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                
                // Draw green rectangle around face
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(minX - 15, minY - 15, maxX - minX + 30, maxY - minY + 30);
                
                // Add emotion label
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = 'bold 18px Arial';
                this.ctx.fillText(this.currentEmotion.toUpperCase(), minX, minY - 20);
                
                console.log('✅ Green border drawn successfully');
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
                verificationText.textContent = `✅ Great match! Your ${this.selectedEmotion} expression is genuine (${Math.round(confidence * 100)}% confidence)`;
                verificationText.className = 'verification-success';
                console.log('✅ Verification successful: emotions match with high confidence');
            } else {
                verificationText.textContent = `⚠️ Emotions match but confidence is low (${Math.round(confidence * 100)}%). Try expressing more clearly.`;
                verificationText.className = 'verification-neutral';
                console.log('⚠️ Verification partial: emotions match but low confidence');
            }
        } else {
            verificationText.textContent = `❌ Mismatch detected! You selected ${this.selectedEmotion} but your expression shows ${this.currentEmotion} (${Math.round(confidence * 100)}% confidence)`;
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

    testDetection() {
        console.log('🧪 Running face detection test...');
        
        if (!this.detector) {
            console.error('❌ No detector available');
            this.showError('No face detector available. Please wait for initialization.');
            return;
        }
        
        if (!this.video.srcObject) {
            console.error('❌ No video stream available');
            this.showError('No camera stream available. Please start camera first.');
            return;
        }
        
        console.log('✅ Test conditions met, running detection...');
        
        // Force a single detection cycle
        this.detectEmotion();
        
        // Show current status
        const status = {
            detector: !!this.detector,
            video: !!this.video.srcObject,
            isDetecting: this.isDetecting,
            currentEmotion: this.currentEmotion,
            selectedEmotion: this.selectedEmotion
        };
        
        console.log('📊 Current status:', status);
        this.showError(`Test completed. Check console for details. Status: ${JSON.stringify(status)}`);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const verifier = new EmotionVerifier();
    await verifier.initialize();
    
    // Make verifier globally accessible for debugging
    window.emotionVerifier = verifier;
});
