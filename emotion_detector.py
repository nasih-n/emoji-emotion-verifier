import cv2
import numpy as np
from deepface import DeepFace
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import json
import threading
import time
from datetime import datetime

class EmotionDetector:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)  # Enable CORS for web interface
        self.cap = None
        self.is_detecting = False
        self.current_emotion = None
        self.emotion_confidence = 0.0
        self.detection_thread = None
        self.debug_mode = True  # Enable debug mode
        
        # Supported emotions
        self.emotions = ['happy', 'sad', 'angry', 'fear', 'neutral']
        
        # Setup routes
        self.setup_routes()
    
    def setup_routes(self):
        @self.app.route('/start_detection', methods=['POST'])
        def start_detection():
            try:
                self.start_camera()
                return jsonify({'status': 'success', 'message': 'Detection started'})
            except Exception as e:
                return jsonify({'status': 'error', 'message': str(e)})
        
        @self.app.route('/stop_detection', methods=['POST'])
        def stop_detection():
            try:
                self.stop_camera()
                return jsonify({'status': 'success', 'message': 'Detection stopped'})
            except Exception as e:
                return jsonify({'status': 'error', 'message': str(e)})
        
        @self.app.route('/get_emotion', methods=['GET'])
        def get_emotion():
            if self.current_emotion:
                return jsonify({
                    'emotion': self.current_emotion,
                    'confidence': self.emotion_confidence,
                    'timestamp': datetime.now().isoformat()
                })
            else:
                return jsonify({
                    'emotion': 'no_face',
                    'confidence': 0.0,
                    'timestamp': datetime.now().isoformat()
                })
        
        @self.app.route('/analyze_frame', methods=['POST'])
        def analyze_frame():
            try:
                data = request.get_json()
                frame_data = data.get('frame')
                
                if not frame_data:
                    return jsonify({'status': 'error', 'message': 'No frame data provided'})
                
                # Decode base64 image
                frame_bytes = base64.b64decode(frame_data.split(',')[1])
                frame_array = np.frombuffer(frame_bytes, dtype=np.uint8)
                frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)
                
                # Analyze emotion
                result = self.analyze_emotion(frame)
                return jsonify(result)
                
            except Exception as e:
                return jsonify({'status': 'error', 'message': str(e)})
        
        @self.app.route('/get_video_frame', methods=['GET'])
        def get_video_frame():
            """Get current video frame with face border overlay"""
            try:
                if self.cap and self.cap.isOpened():
                    ret, frame = self.cap.read()
                    if ret:
                        # Analyze emotion and get frame with border
                        result = self.analyze_emotion(frame)
                        
                        # Convert frame to base64 for transmission
                        _, buffer = cv2.imencode('.jpg', result['frame_with_border'])
                        frame_base64 = base64.b64encode(buffer).decode('utf-8')
                        
                        return jsonify({
                            'status': 'success',
                            'frame': f"data:image/jpeg;base64,{frame_base64}",
                            'emotion': result['emotion'],
                            'confidence': result['confidence']
                        })
                    else:
                        return jsonify({'status': 'error', 'message': 'Failed to capture frame'})
                else:
                    return jsonify({'status': 'error', 'message': 'Camera not available'})
                    
            except Exception as e:
                return jsonify({'status': 'error', 'message': str(e)})
    
    def start_camera(self):
        """Start camera capture"""
        if self.cap is None:
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                raise Exception("Could not open camera")
            
            self.is_detecting = True
            self.detection_thread = threading.Thread(target=self.detection_loop)
            self.detection_thread.daemon = True
            self.detection_thread.start()
            print("Camera started and detection loop initiated")
    
    def stop_camera(self):
        """Stop camera capture"""
        self.is_detecting = False
        if self.cap:
            self.cap.release()
            self.cap = None
        self.current_emotion = None
        self.emotion_confidence = 0.0
        print("Camera stopped")
    
    def detection_loop(self):
        """Main detection loop running in separate thread"""
        frame_count = 0
        while self.is_detecting:
            if self.cap and self.cap.isOpened():
                ret, frame = self.cap.read()
                if ret:
                    frame_count += 1
                    if self.debug_mode and frame_count % 30 == 0:  # Log every 30 frames
                        print(f"Processing frame {frame_count}")
                    
                    try:
                        result = self.analyze_emotion(frame)
                        if result['status'] == 'success':
                            self.current_emotion = result['emotion']
                            self.emotion_confidence = result['confidence']
                            if self.debug_mode:
                                print(f"Frame {frame_count}: {result['emotion']} ({result['confidence']:.2f})")
                        else:
                            if self.debug_mode:
                                print(f"Frame {frame_count}: {result['message']}")
                    except Exception as e:
                        print(f"Error in detection loop: {e}")
                else:
                    if self.debug_mode:
                        print("Failed to read frame from camera")
            else:
                if self.debug_mode:
                    print("Camera not available")
            
            time.sleep(0.1)  # Small delay to prevent excessive CPU usage
    
    def analyze_emotion(self, frame):
        """Analyze emotion in the given frame using DeepFace"""
        try:
            # Convert BGR to RGB (DeepFace expects RGB)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Try different detector backends if one fails
            detector_backends = ['opencv', 'mtcnn', 'retinaface']
            result = None
            
            for backend in detector_backends:
                try:
                    print(f"Trying detector backend: {backend}")
                    result = DeepFace.analyze(
                        frame_rgb, 
                        actions=['emotion'],
                        enforce_detection=False,
                        detector_backend=backend
                    )
                    print(f"Success with backend: {backend}")
                    break
                except Exception as backend_error:
                    print(f"Backend {backend} failed: {backend_error}")
                    continue
            
            if result is None:
                print("All detector backends failed")
                return {
                    'status': 'error',
                    'message': 'No face detected with any backend',
                    'emotion': 'neutral',
                    'confidence': 0.0,
                    'frame_with_border': frame
                }
            
            if isinstance(result, list):
                result = result[0]
            
            # Get emotion with highest confidence
            emotions = result['emotion']
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])
            
            print(f"Detected emotion: {dominant_emotion[0]} with confidence: {dominant_emotion[1]}%")
            
            # Map DeepFace emotions to our supported emotions
            emotion_mapping = {
                'happy': 'happy',
                'sad': 'sad', 
                'angry': 'angry',
                'fear': 'fear',
                'neutral': 'neutral',
                'surprise': 'fear',  # Map surprise to fear
                'disgust': 'angry'   # Map disgust to angry
            }
            
            mapped_emotion = emotion_mapping.get(dominant_emotion[0], 'neutral')
            confidence = dominant_emotion[1] / 100.0  # Convert percentage to decimal
            
            # Draw green border around detected face
            frame_with_border = self.draw_face_border(frame, result)
            
            return {
                'status': 'success',
                'emotion': mapped_emotion,
                'confidence': confidence,
                'raw_emotions': emotions,
                'frame_with_border': frame_with_border
            }
            
        except Exception as e:
            print(f"Error analyzing emotion: {e}")
            return {
                'status': 'error',
                'message': str(e),
                'emotion': 'neutral',
                'confidence': 0.0,
                'frame_with_border': frame
            }
    
    def draw_face_border(self, frame, result):
        """Draw green border around detected face"""
        try:
            # Get face region from DeepFace result
            if 'region' in result:
                region = result['region']
                x = region['x']
                y = region['y']
                w = region['w']
                h = region['h']
                
                # Draw green rectangle around face
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 3)
                
                # Add emotion label above the rectangle
                emotion = result.get('dominant_emotion', 'unknown')
                label = f"{emotion.upper()}"
                cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
            return frame
            
        except Exception as e:
            print(f"Error drawing face border: {e}")
            return frame
    
    def run(self, host='localhost', port=5000):
        """Run the Flask server"""
        print(f"Starting emotion detection server on {host}:{port}")
        print("Available endpoints:")
        print("  POST /start_detection - Start camera and detection")
        print("  POST /stop_detection - Stop camera and detection") 
        print("  GET  /get_emotion - Get current emotion and confidence")
        print("  POST /analyze_frame - Analyze emotion from base64 frame")
        self.app.run(host=host, port=port, debug=False)

if __name__ == "__main__":
    detector = EmotionDetector()
    detector.run()
