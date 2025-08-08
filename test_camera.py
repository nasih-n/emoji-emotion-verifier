#!/usr/bin/env python3
"""
Simple camera test script to verify camera access and face detection
"""

import cv2
import numpy as np
from deepface import DeepFace
import time

def test_camera():
    """Test basic camera functionality"""
    print("🎥 Testing camera access...")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Failed to open camera")
        return False
    
    print("✅ Camera opened successfully")
    
    # Try to read a frame
    ret, frame = cap.read()
    if not ret:
        print("❌ Failed to read frame from camera")
        cap.release()
        return False
    
    print(f"✅ Frame captured successfully: {frame.shape}")
    cap.release()
    return True

def test_face_detection():
    """Test face detection with a captured frame"""
    print("\n🔍 Testing face detection...")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Failed to open camera for face detection test")
        return False
    
    # Capture a frame
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        print("❌ Failed to capture frame for face detection")
        return False
    
    # Convert BGR to RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Try different detector backends
    detector_backends = ['opencv', 'mtcnn', 'retinaface']
    
    for backend in detector_backends:
        try:
            print(f"  Trying {backend}...")
            result = DeepFace.analyze(
                frame_rgb,
                actions=['emotion'],
                enforce_detection=False,
                detector_backend=backend
            )
            print(f"  ✅ {backend} detected face successfully")
            
            if isinstance(result, list):
                result = result[0]
            
            emotions = result['emotion']
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])
            print(f"  📊 Detected emotion: {dominant_emotion[0]} ({dominant_emotion[1]:.1f}%)")
            
            return True
            
        except Exception as e:
            print(f"  ❌ {backend} failed: {str(e)}")
            continue
    
    print("❌ All face detection backends failed")
    return False

def test_continuous_detection():
    """Test continuous face detection for 10 seconds"""
    print("\n🔄 Testing continuous face detection (10 seconds)...")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Failed to open camera for continuous test")
        return False
    
    start_time = time.time()
    detection_count = 0
    total_frames = 0
    
    while time.time() - start_time < 10:
        ret, frame = cap.read()
        if not ret:
            continue
        
        total_frames += 1
        
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        try:
            result = DeepFace.analyze(
                frame_rgb,
                actions=['emotion'],
                enforce_detection=False,
                detector_backend='opencv'
            )
            
            if isinstance(result, list):
                result = result[0]
            
            emotions = result['emotion']
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])
            
            detection_count += 1
            print(f"  Frame {total_frames}: {dominant_emotion[0]} ({dominant_emotion[1]:.1f}%)")
            
        except Exception as e:
            print(f"  Frame {total_frames}: No face detected")
        
        time.sleep(0.1)  # Small delay
    
    cap.release()
    
    success_rate = (detection_count / total_frames) * 100
    print(f"\n📊 Detection Results:")
    print(f"  Total frames: {total_frames}")
    print(f"  Successful detections: {detection_count}")
    print(f"  Success rate: {success_rate:.1f}%")
    
    return success_rate > 50

def main():
    """Run all camera tests"""
    print("🧪 Camera and Face Detection Test")
    print("=" * 40)
    
    # Test 1: Basic camera access
    if not test_camera():
        print("\n❌ Camera test failed. Please check:")
        print("  - Camera is connected and working")
        print("  - No other application is using the camera")
        print("  - Camera permissions are granted")
        return
    
    # Test 2: Face detection
    if not test_face_detection():
        print("\n❌ Face detection test failed. Please check:")
        print("  - Face is clearly visible in camera")
        print("  - Good lighting conditions")
        print("  - Face is not too close or too far from camera")
        return
    
    # Test 3: Continuous detection
    if not test_continuous_detection():
        print("\n⚠️ Continuous detection had low success rate. Please check:")
        print("  - Face remains in camera view")
        print("  - Lighting is consistent")
        print("  - No rapid movements")
        return
    
    print("\n🎉 All tests passed! Camera and face detection are working correctly.")
    print("\n📝 You can now run the main application:")
    print("  python3 emotion_detector.py")

if __name__ == "__main__":
    main()
