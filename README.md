# Mood Meter App

An interactive React-based mood tracking application with a teacher dashboard for analyzing student emotional data.

## 📋 Project Overview

This project consists of three main components:

1. **Kiosk Student App** (`kiosk-srcMTapp/`) - Interactive mood meter interface for students
2. **Teacher Dashboard** (`dashboard-figma-dashboard/`) - Data visualization and analysis dashboard
3. **Backend API** (`server/`) - Node.js/Express server (Supabase-backed in production)


## 🎯 Features

### Student App
- Welcome page with getting started flow
- L1 mood selection (4 quadrants: High/Low Energy × Pleasant/Unpleasant)
- L2 detailed emotion selection (100 emotions across quadrants)
- Tap protection to prevent accidental submissions
- Time-to-select tracking for each mood entry
- Thank you page with additional resources

### Teacher Dashboard
- Real-time mood data visualization with Recharts
- Date range filtering and search
- Timeline customization
- Data comparison and correlation analysis
- Highlight specific trends
- Export data to PDF/CSV
- Stats cards showing key metrics
- L2 emotion breakdown by quadrant

### Backend
- RESTful API with Express
- File-based JSON storage (easy to migrate to database)
- CORS enabled for cross-origin requests
- Configurable port (defaults to 4000, dev uses 4001)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MoodMeter-Code
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Run all services at once**
   ```bash
   npm run dev:all
   ```

   This will start:
   - Backend API on http://localhost:4001
   - Student App on http://localhost:5178
   - Teacher Dashboard on http://localhost:5177

### Individual Service Commands

**Backend only:**
```bash
npm run dev:server
```

**Student kiosk only:**
```bash
npm run dev:kiosk
```

**Dashboard only:**
```bash
npm run dev:dashboard
```

## 📁 Project Structure

```
MoodMeter-Code/
├── kiosk-srcMTapp/              # Student-facing mood tracker (kiosk)
│   ├── components/              # React components (pages, UI)
│   ├── services/                # API client (server + Supabase)
│   ├── styles/                  # CSS and theme files
│   └── vite.config.ts           # Vite configuration
├── dashboard-figma-dashboard/   # Teacher dashboard
│   ├── src/components/          # React components (charts, filters)
│   ├── src/services/            # API client
│   └── vite.config.ts           # Vite configuration
├── server/                      # Backend API
│   ├── routes/                  # Express routes
│   ├── lib/                     # Supabase + helpers
│   └── index.js                 # Server entry point
├── src/                         # Standalone Vite app (deployed via vercel.json)
└── package.json                 # Root package with dev scripts
```

## 🔧 Configuration

### Environment Variables

Both frontend apps support custom API URLs via Vite environment variables:

**For development:**
```bash
set VITE_API_BASE_URL=http://localhost:4001
```

**Backend port:**
```bash
set PORT=4001
```

### Ports

- Backend: 4001 (configurable via PORT env var)
- Student App: 5174 → falls back to 5178 if busy
- Dashboard: 5175 → falls back to 5177 if busy

## 📊 API Endpoints

### GET `/api/moods`
Fetch all mood entries.

**Response:**
```json
[
  {
    "timestamp": "2025-10-27T12:00:00.000Z",
    "dateOnly": "2025-10-27",
    "l1": { "id": "high-pleasant", "label": "High energy pleasant" },
    "l2": { "id": "high-pleasant_l2_1", "label": "Joyful" },
    "timeToSelectMs": 3500
  }
]
```

### POST `/api/moods`
Submit a new mood entry.

**Request body:**
```json
{
  "timestamp": "2025-10-27T12:00:00.000Z",
  "dateOnly": "2025-10-27",
  "l1": { "id": "high-pleasant", "label": "High energy pleasant" },
  "l2": { "id": "high-pleasant_l2_1", "label": "Joyful" },
  "timeToSelectMs": 3500
}
```

### GET `/api/purpleair`
Proxy to the PurpleAir API so the frontend never sees the API key.

**Env (backend `server/.env` or Railway variables):**

- `PURPLEAIR_READ_KEY`: PurpleAir READ API key
- `PURPLEAIR_SENSOR_IDS`: Comma-separated sensor indexes (e.g. `127669,125385`)

**Response (simplified):**

```json
{
  "sensors": [
    {
      "name": "InnovationCenterPurple FLC - Outdoor",
      "sensor_index": 127669,
      "pm2.5_cf_1": 8.3,
      "pm2.5_atm": 7.9,
      "last_seen": 1731351234,
      "temperature": 65.2,
      "humidity": 42
    }
  ]
}
```

## 🧩 Adding new backend APIs for data correlation

When you need a new API for correlation or analytics (e.g. combining PurpleAir with mood data), follow this pattern:

1. **Create an Express route** in `server/routes/`  
   - Example: `server/routes/correlations.js`
   - Mount it in `server/index.js` with `app.use('/api/correlations', correlationsRouter);`
   - Keep the response shapes simple, typed, and focused on what the dashboard actually needs (arrays of objects with primitives).

2. **Call external services only from the backend**  
   - Put all secret keys in `server/.env` (local) and Railway variables (prod).
   - Do aggregation/joins here (e.g. fetch moods from Supabase + air quality from PurpleAir, return one combined array).

3. **Create a typed service in the dashboard**  
   - Add a file under `dashboard-figma-dashboard/src/services/`, for example `correlations.ts`.
   - Use the helper pattern from `purpleair.ts`:
     - Derive base URL from `VITE_API_BASE_URL`.
     - Define TypeScript interfaces for the response.
     - Export small functions like `fetchMoodAirQualityCorrelations()`.

4. **Render it via a dedicated component**  
   - Create a component in `dashboard-figma-dashboard/src/components/` (e.g. `MoodAirQualityCorrelation.tsx`).
   - Call the service in a `useEffect`, store data in local state, and render charts/cards.
   - Optionally add a new tab in `App.tsx` (like the **Air quality** tab) or a new section inside an existing tab.

This keeps the architecture consistent:

- **Server**: owns all secrets, talks to external APIs and the database, returns clean JSON.
- **Dashboard services**: thin wrappers around `/api/...` endpoints.
- **Dashboard components**: visualizations that consume those services.

## 🛠️ Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Radix UI components
- Recharts for data visualization
- Framer Motion for animations
- date-fns for date handling
- Lucide React for icons

**Backend:**
- Node.js
- Express
- CORS middleware
- File-based JSON storage

**Dev Tools:**
- Concurrently for running multiple services
- TypeScript compiler
- ESLint (configured per app)

## 🎨 Design

The UI design is based on Figma mockups with:
- Custom CSS tokens for theming
- Responsive layouts
- Accessible components via Radix UI
- Smooth animations and transitions

## 📦 Build for Production

**Build all apps:**
```bash
cd kiosk-srcMTapp && npm run build
cd ../dashboard-figma-dashboard && npm run build
```

**Backend production:**
```bash
cd server && npm start
```

## 🧹 Clearing Data

To reset all mood data:

```bash
echo [] > server/data/moods.json
```

Or delete the file:
```bash
del server/data/moods.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes.

## 👥 Team

Developed as part of a mood tracking and emotional wellness initiative.

## 🐛 Known Issues

- CJS build deprecation warning from Vite (non-critical)
- Some npm audit warnings for dev dependencies (non-critical)

## 📞 Support

For questions or issues, please open an issue in the GitHub repository.
