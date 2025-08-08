#!/usr/bin/env python3
"""
Test script for the Python emotion detection backend
"""

import requests
import time
import json

def test_backend_connection():
    """Test if the backend is running and responding"""
    try:
        response = requests.get('http://localhost:5000/get_emotion')
        if response.status_code == 200:
            print("✅ Backend is running and responding")
            return True
        else:
            print(f"❌ Backend responded with status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running. Start it with: python3 emotion_detector.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

def test_start_detection():
    """Test starting the detection"""
    try:
        response = requests.post('http://localhost:5000/start_detection')
        if response.status_code == 200:
            print("✅ Detection started successfully")
            return True
        else:
            print(f"❌ Failed to start detection: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error starting detection: {e}")
        return False

def test_stop_detection():
    """Test stopping the detection"""
    try:
        response = requests.post('http://localhost:5000/stop_detection')
        if response.status_code == 200:
            print("✅ Detection stopped successfully")
            return True
        else:
            print(f"❌ Failed to stop detection: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error stopping detection: {e}")
        return False

def test_emotion_polling():
    """Test emotion polling for a few seconds"""
    print("🔄 Testing emotion polling for 5 seconds...")
    
    try:
        # Start detection
        requests.post('http://localhost:5000/start_detection')
        time.sleep(1)
        
        # Poll for emotions
        for i in range(10):
            response = requests.get('http://localhost:5000/get_emotion')
            if response.status_code == 200:
                data = response.json()
                print(f"   Emotion: {data['emotion']}, Confidence: {data['confidence']:.2f}")
            else:
                print(f"   ❌ Failed to get emotion: {response.status_code}")
            
            time.sleep(0.5)
        
        # Stop detection
        requests.post('http://localhost:5000/stop_detection')
        print("✅ Emotion polling test completed")
        return True
        
    except Exception as e:
        print(f"❌ Error during emotion polling: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Python Emotion Detection Backend")
    print("=" * 50)
    
    # Test 1: Connection
    if not test_backend_connection():
        return
    
    # Test 2: Start detection
    if not test_start_detection():
        return
    
    # Test 3: Emotion polling
    if not test_emotion_polling():
        return
    
    # Test 4: Stop detection
    if not test_stop_detection():
        return
    
    print("\n🎉 All tests passed! Backend is working correctly.")
    print("\n📝 Next steps:")
    print("1. Open index.html in your web browser")
    print("2. Allow camera permissions")
    print("3. Start using the emotion verification system")

if __name__ == "__main__":
    main()
