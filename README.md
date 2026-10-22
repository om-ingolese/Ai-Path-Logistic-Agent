# 🚚 AI Path Logistics Agent (INR)

An intelligent, real-time logistics and fleet management platform engineered for Indian highway networks and supply chain corridors (NH-44, NH-48, Golden Quadrilateral).

![Project Preview](public/placeholder.svg)

---

## 🌟 Key Features

- **🗺️ Live Fleet Tracking (Multi-Layer Map)**:
  - Interactive Leaflet-powered live map with real-time speed, status, and telemetry tracking.
  - Multi-layer basemap support: **Street Map (OpenStreetMap)**, **Satellite Imagery (Esri World Imagery)**, and **Terrain (OpenTopoMap)**.
  - High-resolution road-snapped corridors with dynamic GPS simulation.
- **🚨 24/7 Support & Emergency Dispatch**:
  - Instant ticket raising with auto-attached GPS coordinates.
  - **Twilio SMS Alerts**: Dispatches instant emergency notifications to driver/fleet manager phones.
  - Indian Emergency Hotline integrations (Police, Ambulance, Roadside Help).
- **📊 Specialized Role-Based Dashboards**:
  - **Fleet Operator Dashboard**: Fleet-wide live tracking, vehicle telemetry, and AI path insights.
  - **Driver Dashboard**: Active load assignments, live speed & GPS updates, emergency requests.
  - **Supplier Dashboard**: Shipment dispatching, delivery status monitoring, and load metrics.
- **⚡ Real-Time Telemetry Streaming**:
  - Python Flask + Socket.IO server streaming real-time vehicle positions, speed calculation via Geopy, and persistent broadcast.
- **📦 Load & Corridor Optimization**:
  - Marketplace for Indian freight loads, pricing (₹/km), route assignment, and vehicle status management.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Radix UI (Shadcn/UI), Sonner.
- **Mapping & Geo**: React Leaflet, Leaflet, Geolib, OpenStreetMap, Esri World Imagery, OpenTopoMap.
- **Backend**: Python 3.x, Flask, Flask-SocketIO, Geopy, Simple-WebSocket.
- **Communication & AI**: Twilio SMS API, Google Gemini AI.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.10 or higher)

### 2. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-path-logistics-agent.git
cd ai-path-logistics-agent
```

### 3. Setup Frontend
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 4. Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 5. Configure `.env`
Update `.env` in the root directory with your credentials:
```env
VITE_GEMINI_API_KEY=your_gemini_key

# Twilio SMS Setup
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
TWILIO_TO_NUMBER=+918468912510
VITE_TWILIO_USE_WHATSAPP=false
```

---

## 🏃 Running the Application

### 1. Start Python Backend (Port 5000)
```bash
cd backend
.\venv\Scripts\python.exe app.py
```

### 2. Start Vite Frontend (Port 8080 / 8081)
```bash
# In the project root:
npm run dev
```

Open [http://localhost:8081](http://localhost:8081) (or port shown in terminal) in your browser.

---

## 📂 Project Structure

```
├── backend/
│   ├── app.py              # Flask + Socket.IO server & Twilio webhook
│   └── requirements.txt    # Python dependencies
├── public/
│   └── routes.json         # High-resolution Indian highway route coordinates
├── src/
│   ├── components/         # Reusable UI cards, forms, and layout
│   ├── hooks/              # Real-time data & support ticket hooks
│   ├── pages/              # LiveTracking, Fleet, Support, Dashboards, Loads
│   └── lib/                # Route definitions, Indian cities, emergency configs
└── .env.example            # Environment variable template
```

---

## 📄 License
MIT
