#!/usr/bin/env python3
"""
Setup script for Emotion Detection System
Installs required dependencies and provides setup instructions
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages"""
    print("Installing required Python packages...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All Python dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def create_startup_script():
    """Create a startup script for easy launching"""
    script_content = """#!/bin/bash
# Emotion Detection System Startup Script

echo "Starting Emotion Detection System..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

# Check if required packages are installed
python3 -c "import cv2, deepface, flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing required packages..."
    pip3 install -r requirements.txt
fi

# Start the Python backend
echo "🚀 Starting Python emotion detection server..."
python3 emotion_detector.py &

# Wait a moment for server to start
sleep 3

# Open the web interface
echo "🌐 Opening web interface..."
if command -v xdg-open &> /dev/null; then
    xdg-open index.html
elif command -v open &> /dev/null; then
    open index.html
else
    echo "Please open index.html in your web browser"
fi

echo "✅ Emotion Detection System is ready!"
echo "📝 Backend server running on http://localhost:5000"
echo "📝 Web interface available at index.html"
echo ""
echo "To stop the system, press Ctrl+C"
wait
"""

    with open("start_emotion_detector.sh", "w") as f:
        f.write(script_content)
    
    # Make the script executable
    os.chmod("start_emotion_detector.sh", 0o755)
    print("✅ Created startup script: start_emotion_detector.sh")

def main():
    """Main setup function"""
    print("🎭 Emotion Detection System Setup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        print("❌ Setup failed. Please check the error messages above.")
        sys.exit(1)
    
    # Create startup script
    create_startup_script()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Run the Python backend: python3 emotion_detector.py")
    print("2. Open index.html in your web browser")
    print("3. Or use the startup script: ./start_emotion_detector.sh")
    print("\n🔧 Troubleshooting:")
    print("- If you get camera permission errors, make sure to allow camera access")
    print("- If the Python backend fails to start, check if port 5000 is available")
    print("- For DeepFace issues, try: pip install --upgrade deepface")

if __name__ == "__main__":
    main()
