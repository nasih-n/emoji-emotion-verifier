<img width="3188" height="1202" alt="thinkerhub logo" src="https://github.com/user-attachments/assets/640387be-be41-4643-98fc-9f7bf8ed281a" />

 Emoji Picker with Emotion Verification

A web application that uses facial expression detection to verify whether a user's actual emotion matches the emoji they select. Features both Python backend (using OpenCV and DeepFace) and JavaScript frontend for maximum accuracy.

Basic Details
Team Name: QWERTY

Team Members
 * Team Lead: Muhammad Nasih N - GECI
 * Member 2: Abhiraj Krishna - GECI

Project Description
An over-engineered web application that uses your webcam to see if you're faking your emotions. It cross-references your real-time facial expression with the emoji you select, ensuring complete emotional transparency whether you want it or not.
The Problem (that doesn't exist)
In today's digital world, emoji fraud is rampant. People send a smiley face 🙂 while feeling dead inside, or an angry face 😠 when they're just mildly annoyed. We're tackling the global crisis of emotional inauthenticity by forcing users to prove they genuinely feel the emoji they send.
The Solution (that nobody asked for)
We present the Emoji Picker with Emotion Verification! This revolutionary tool uses not one, but two complex facial recognition systems to call you out on your emotional dishonesty. Simply pick an emoji, make the face, and our state-of-the-art "Truth-o-Meter" will tell you if you're a "Great match" or a dirty liar ("❌ Mismatch").
Technical Details
Technologies/Components Used
For Software:
 * Languages used: Python, JavaScript, HTML5, CSS3
 * Frameworks used:
   * Backend: Flask
   * Frontend: TensorFlow.js
 * Libraries used:
   * Python: OpenCV, DeepFace, TensorFlow
   * JavaScript: MediaPipe Face Mesh
 * Tools used: WebRTC, RESTful API
For Hardware:
 * List main components: A standard webcam
 * List specifications: Any modern webcam supported by your browser
 * List tools required: A computer with a web browser
Implementation
For Software:
Installation
# Recommended: Run the setup script
python3 setup.py

# Or install manually
pip3 install -r requirements.txt

Run
# Use the startup script (Linux/Mac)
./start_emotion_detector.sh

# Or start manually
python3 emotion_detector.py
# Then open index.html in your browser

Project Documentation
For Software:
Screenshots


Caption: The main user interface with the camera feed active and emoji selection panel.
<img width="3040" height="3180" alt="start page" src="https://github.com/user-attachments/assets/1be3ab54-acd2-427f-9243-d14e5247304d" />

Caption: A "✅ Great match" verification result after the user successfully matches their expression to the 'Happy' emoji.
<img width="3040" height="3294" alt="happy win" src="https://github.com/user-attachments/assets/b6082460-1f4b-4f7d-9fb8-960ef7ea0fab" />

Caption: A "✅ Great match" verification result after the user successfully matches their expression to the 'neutral' emoji.
<img width="3040" height="3294" alt="neutral win" src="https://github.com/user-attachments/assets/96e778c3-1711-4fed-80d4-0e0ba7263354" />


Caption: A "❌ Mismatch" result, indicating the user's expression does not align with the selected emoji(happy).
<img width="3040" height="3238" alt="happy fail" src="https://github.com/user-attachments/assets/5a1a472f-ce0a-42f1-a7ac-faf2ac6ab7e2" />


Caption: A "❌ Mismatch" result, indicating the user's expression does not align with the selected emoji(neutral).
<img width="3040" height="3294" alt="neutral fail" src="https://github.com/user-attachments/assets/ba4b4939-f972-4809-adff-217459acfdb3" />


Caption: A "⚠️ Questionable " result, indicating the user's expression align with the selected emoji(sad) but not with 100% certainty.
<img width="3040" height="3238" alt="sad questionable" src="https://github.com/user-attachments/assets/c89cf963-cfd9-4629-9331-ad9017eab0d5" />


Diagrams
![diagram](https://github.com/user-attachments/assets/c464c5c4-efe0-42bc-a49c-ac3410cf97d6)

Caption: The application's architecture. The frontend first attempts to communicate with the Python Flask backend via a REST API for high-accuracy emotion detection. If the backend is unavailable, it automatically falls back to the in-browser TensorFlow.js model for processing.

Team Contributions
 * Muhammad Nasih N : Devolpment & Implementation
 * Abhiraj Krishna : Documentation , Presentation & Concept Design


Made with ❤️ at TinkerHub Useless Projects
