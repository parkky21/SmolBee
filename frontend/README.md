# LocalBee Frontend

The user interface for the Offline AI Voice Assistant, built with React and LiveKit.

## 🚀 Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The app will be accessible at `http://localhost:5173/` (or similar).

---

## 📂 Project Structure
- **`src/`**: Main source code.
  - **`components/`**: React components.
    - **`VoiceAssistant`**: Core component for voice interaction using LiveKit hooks.
  - **`App.jsx`**: Main application setup drawing together components.
- **`public/`**: Assets available directly (icons, logo).

---

## 🛠 Features
- **LiveKit React Components**: Out-of-the-box support for connecting to rooms, visualizers, and state management.
- **Tailwind CSS Integration**: Styled for sleek dark mode aesthetics.
