# ServiceDesk Pro - Frontend

This is the frontend application for ServiceDesk Pro, an AI-powered IT Service Management platform.

## Tech Stack
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Components:** Radix UI / shadcn/ui inspired
- **Animations:** Framer Motion & GSAP
- **Forms:** React Hook Form with Zod validation
- **Charts:** Recharts
- **HTTP Client:** Axios

## Getting Started

### Prerequisites
- Node.js (v18+)

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (create a `.env` file if needed, defaults to `http://localhost:5173`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```
