# 🌊 FloodGuard — Flood Disaster Management Platform

An intelligent, real-time flood monitoring, risk assessment, and emergency disaster response system built with **TanStack Start**, **React 19**, **Nitro**, and **Tailwind CSS**.

---

## 🚀 Live Deployment

- **Vercel Live Deployment:** [https://racing-steppe-z89mpcq.tmp.now](https://racing-steppe-z89mpcq.tmp.now)
- **Claim this Deployment to your Vercel Account:** [Claim Deployment on Vercel](https://vercel.com/claim-deployment?code=edbd28b1-be5e-4ee4-9603-55ec2e6439e4)
- **One-Click Deploy from GitHub:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F2511cs010404-design%2Fflood-disaster-management)

---

## ✨ Features

- **Real-Time Flood Risk Assessment:** Multi-tier threat evaluation (Normal, Advisory, Watch, Warning, Severe) with interactive risk gauges and live metrics.
- **Interactive Live Maps:** Geospatial flood risk zones, sensor water levels, rainfall overlays, and evacuation routes powered by Leaflet.
- **Rainfall & Water Level Forecasting:** Historical trends and predictive forecasts with dynamic charting powered by Recharts.
- **Emergency Alert Broadcast System:** Multi-channel public broadcast center with priority filtering, active incident reports, and hotline listings.
- **AI-Powered Live Flood Detection:** Visual computer vision flood detection from uploaded field images and live video streams.
- **Emergency Response & Evacuation:** Safe zone locators, emergency dispatch contact directories, and automated disaster checklists.
- **Role-Based Admin Console:** Secure management console for sensor threshold calibration, manual alert dispatches, and shelter capacity tracking.

---

## 🛠️ Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (Full-stack SSR React framework)
- **Engine / Server:** [Nitro](https://nitro.unjs.io/) (configured for seamless Vercel serverless deployment)
- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **Mapping & Charts:** [Leaflet](https://leafletjs.com/), [Recharts](https://recharts.org/)
- **Form & Validation:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)

---

## 📦 Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- `npm` or `bun`

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/2511cs010404-design/flood-disaster-management.git
   cd flood-disaster-management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🚀 Deploying to Vercel

### Method 1: Automatic GitHub Integration (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import repository `2511cs010404-design/flood-disaster-management`.
3. Vercel automatically detects the project settings (`npm run build`, output `.vercel/output`).
4. Click **Deploy**.

### Method 2: Vercel CLI
```bash
# Log in to Vercel
npx vercel login

# Deploy to Production
npx vercel --prod
```

---

## 📄 License

This project is licensed under the MIT License.
