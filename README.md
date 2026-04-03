# 🏛️ CivicPulse

> **Bridging the gap between active citizens and accountable tech-driven governance.**

CivicPulse is a modern, real-time civic engagement platform that empowers citizens to report local issues, track resolution metrics, and monitor government budget allocations natively within a clean, intuitive, glassmorphism-inspired UI. 

## ✨ Key Features
- **🌍 Real-Time Issue Reporting** — Instantly map, snap, and track civic issues directly from the site without downloading an app.
- **🗳️ Community Voting & Prioritization** — A streamlined, positive-only voting system that automatically rank-sorts local issues for neighborhood priority.
- **📈 Live Budget Dashboard** — Track millions in allocation with a multi-year dynamic visualizer projecting right into 2026-27.
- **🔐 Secure Role-Based Access** — Enterprise-grade Firestore Rules securely partition "Citizen" and "Authority" data access.
- **🌐 Seamless Internationalization** — Built-in native support for English, Hindi, and Marathi toggling right out of the box.

## 🛠️ Tech Stack
- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Custom Glass UI Design)
- **Database & Auth**: Firebase Firestore (Realtime NoSQL), Firebase Auth
- **Data Visualization**: Chart.js
- **Serverless API**: Python FastAPI (Backend utilities & LLM Chatbot)

## 🚀 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/CivicPulse.git
   cd CivicPulse
   ```

2. **Configure Firebase**
   - Head over to the [Firebase Console](https://console.firebase.google.com/) and create a new Web App project.
   - Go to **Project Settings** → **General** and copy your Firebase SDK config.
   - Open `js/firebase-config.js` and paste your specific keys into the `firebaseConfig` block.

3. **Secure Your Database**
   - In your Firebase Console, navigate to **Firestore Database** → **Rules**.
   - Copy the contents of the `firestore.rules` file in this repository and publish them to lock down anonymous write access.

4. **Run the Project Locally**
   - You can run the application using any simple local HTML server. For example:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
   - Open `http://localhost:8000` in your web browser.

## 🎭 User Roles
CivicPulse heavily depends on distinct roles to control how information flows:

- **Citizen (Default)**: Can browse open complaints, sign up/log in, submit localized issues for their ward, and track overall fund allocations. Can uniquely vote on their neighbors' issues.
- **Mayor / Authority (Elevated)**: Specialized accounts identified securely via Firestore fields. Have dashboard capabilities to transition complaints into "Resolved" status and oversee large-scale municipality reports.

## 🗺️ Future Roadmap
- [ ] **AI-Based Categorization**: Use machine learning (Gemini APIs) to automatically label issue categories from user-uploaded images.
- [ ] **Advanced In-App Notifications**: Deploy Firebase Cloud Messaging to send direct alerts to a user when their specific issue is set to `Resolved`.
- [ ] **Native Mobile App**: Wrap the existing PWA into React Native for offline tracking.
