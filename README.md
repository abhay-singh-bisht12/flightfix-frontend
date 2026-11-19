# FlightFix — Frontend

**FlightFix** is an enterprise-grade Aircraft Maintenance Management System (MRO) designed to optimize aircraft airworthiness, maintenance planning, work order dispatch, spare parts inventory, compliance tracking, and technician execution.

---

## Tech Stack

- **Runtime & Bundler:** [Vite](https://vite.dev/)
- **UI Library:** [React 18](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Networking:** [Axios](https://axios-http.com/)
- **Iconography:** [Lucide React](https://lucide.dev/)

---

## Production Backend Connection

The frontend connects to the live FlightFix Django REST Framework backend hosted on Render:

- **Live Backend URL:** `https://flightfix-backend.onrender.com`
- **API Base URL:** `https://flightfix-backend.onrender.com/api`
- **Health Check Endpoint:** `https://flightfix-backend.onrender.com/api/health/`

---

## Project Structure

```text
frontend/
├── public/
│   ├── favicon.svg                  # Aviation MRO vector favicon
│   └── icons.svg
├── src/
│   ├── api/
│   │   ├── client.js                # Central Axios client (JWT interceptors & error handler)
│   │   ├── endpoints.js             # API endpoint registry for all 10 modules
│   │   └── health.js                # Live backend health telemetry probe
│   ├── components/
│   │   └── common/
│   │       ├── Layout.jsx           # Global app layout with header & footer
│   │       ├── Navbar.jsx           # Top navigation with live backend telemetry indicator
│   │       ├── StatusBadge.jsx      # Color-coded operational status badges
│   │       └── LoadingSpinner.jsx   # Async loading state spinner
│   ├── context/
│   │   └── AuthContext.jsx          # JWT authentication and RBAC context
│   ├── pages/
│   │   ├── LandingPage.jsx          # Aerospace operations landing & module overview
│   │   ├── DashboardPlaceholder.jsx # Operations cockpit with live stats & shortcuts
│   │   ├── ModulePlaceholder.jsx    # Workspaces for all 10 backend modules
│   │   └── NotFoundPage.jsx         # 404 navigation fallback
│   ├── routes/
│   │   └── AppRoutes.jsx            # React Router route registry
│   ├── App.jsx                      # App root with providers
│   ├── main.jsx                     # Vite React entrypoint
│   └── index.css                    # Tailwind CSS imports & theme styles
├── .env.example                     # Environment template
├── .gitignore                       # Ignored node_modules, dist, and .env
├── package.json
└── vite.config.js                   # Vite configuration with React & Tailwind plugins
```

---

## Setup & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_BASE_URL=https://flightfix-backend.onrender.com/api
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for Production
```bash
npm run build
```
Build output will be generated cleanly in `dist/`.
