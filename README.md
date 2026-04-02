<div align="center">
  <img src="https://img.icons8.com/color/100/000000/brain.png" alt="Lexifyd Logo" width="100"/>
  <h1>Lexifyd AI Gamifier</h1>
  <p><strong>Transforming Learning into an Interactive Multiplayer Experience</strong></p>
  
  <p>
    <a href="#features"><img src="https://img.shields.io/badge/Features-Explore-blue?style=for-the-badge&logo=appveyor" alt="FeaturesBadge"/></a>
    <a href="#installation"><img src="https://img.shields.io/badge/Setup-Installation-success?style=for-the-badge&logo=npm" alt="SetupBadge"/></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Tech-Stack-orange?style=for-the-badge&logo=react" alt="TechStackBadge"/></a>
  </p>
</div>

---

## 🌟 Overview

**Lexifyd AI Gamifier** is a cutting-edge educational platform that gamifies the learning process. By combining real-time multiplayer challenges, interactive dashboards, and AI-powered knowledge representations, Lexifyd turns static study materials into dynamic, engaging experiences.

---

## ✨ Core Features

### 1. Interactive Dashboard
Track your progress, view your comprehensive learning stats, and access your daily challenges from a beautifully designed, user-centric dashboard.

<div align="center">
  <img src="./Screenshot 2026-04-02 095501.png" alt="Interactive Dashboard" style="border-radius: 10px; max-width: 100%; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-top: 10px; margin-bottom: 20px;"/>
</div>

### 2. Real-Time Friend Challenge Battle System
Compete against your peers in real-time! Our Socket.io-powered backend ensures a seamless, low-latency battle experience where learners can challenge each other, see live progress, and push their limits.

<div align="center">
  <img src="./Screenshot 2026-04-02 095511.png" alt="Multiplayer Arena" style="border-radius: 10px; max-width: 100%; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-top: 10px; margin-bottom: 20px;"/>
</div>

### 3. AI-Powered Knowledge Graph Generator
Visualize complex concepts! Lexifyd uses a local AI integration (via Ollama) to breakdown topics and D3.js to render them as interactive, interconnected knowledge graphs.

<div align="center">
  <img src="./WhatsApp Image 2026-04-02 at 3.04.45 PM.jpeg" alt="AI Knowledge Graph" style="border-radius: 10px; max-width: 100%; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-top: 10px; margin-bottom: 20px;"/>
</div>

---

## 🛠️ Tech Stack

**Frontend Framework**
- **React.js (Vite)**: Fast, modern UI development.
- **Tailwind CSS & Tailwind Merge**: Rapid, responsive, and robust styling.
- **Framer Motion**: Smooth, professional micro-animations.
- **D3.js**: Dynamic data visualizations and interactive graphing.
- **Lucide React**: Clean, consistent icon set.

**Backend & Real-time**
- **Node.js & Express**: Secure and lightweight API routing.
- **Socket.io**: Real-time bidirectional event-based communication.
- **Local AI**: Processing prompts and generating evaluation models offline via local LLM runtimes (like Ollama).

---

## 🚀 Getting Started

Follow these steps to run the platform locally.

### 1. Install Dependencies
Make sure you are in the project root directory, then run:

```bash
npm install
```

### 2. Start the Backend Server
Boot up the multiplayer battle arena (starts the socket server on port `3001`):

```bash
node server.js
```

### 3. Start the Frontend Application
Launch the interactive React application (starts the Vite dev server on port `5173`):

```bash
npm run dev
```

🎉 **Visit `http://localhost:5173` in your browser to start your learning journey!**

---

<div align="center">
  <p>Built with ❤️ by the development team.</p>
</div>
