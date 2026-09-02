# ServiceDesk Pro

ServiceDesk Pro is a modern, responsive, ITSM-aligned Service Desk Platform built on the MERN stack (MongoDB, Express, React, Node.js) with Tailwind CSS for styling and shadcn/ui inspired components.

It includes role-based access control, automated SLA management, ticket routing, asset tracking, knowledge base, and AI-powered ticket classification and insights.

## Features Built

### Backend (Fully Functional API)
- **Role-Based Access Control (RBAC):** `admin`, `manager`, `technician`, `employee`, `asset_manager`
- **Ticket State Machine:** Enforced state transitions (e.g. Open -> Assigned -> In Progress -> Resolved -> Closed).
- **Service Level Agreements (SLA):** 
  - Dynamic deadline calculation including/excluding business hours.
  - Background cron job to check SLA breaches and trigger escalations/notifications.
- **AI Integration (Gemini):**
  - Automatically classifies new tickets (Hardware, Network, etc.), assigns priority, and provides a probable issue summary.
  - Generates recommended solutions from Knowledge Base articles.
- **Asset Management:** Tracks hardware/software lifecycle and warranties.
- **Knowledge Base:** Article lifecycle (Draft -> Published) with upvotes/downvotes.
- **Audit Logging:** Tracks all major changes to system entities for compliance.
- **Notifications & Reports:** CSV exports, system notifications.

### Frontend
- **Authentication:** Secure login with JWT (access tokens in memory, refresh tokens in HTTP-only cookies).
- **Dynamic Dashboards:** Recharts-powered analytics for Admin and Employee roles.
- **Tickets UI:** 
  - List view with priority/status badges.
  - Detail view with live comments, internal technician notes, and AI insights.

## Running the Application

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (local or Atlas)
- Gemini API Key

### Backend Setup
1. `cd backend`
2. Configure `.env`:
   ```bash
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/servicedeskpro
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_URL=http://localhost:5173
   ```
3. Run `npm install`
4. Seed the database (creates roles, users, SLA policies, categories, assets, and demo tickets):
   ```bash
   node scripts/seed.js
   ```
5. Start server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. `cd frontend`
2. Configure `.env` (optional, defaults to `http://localhost:5173`):
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```
3. Run `npm install`
4. Start dev server:
   ```bash
   npm run dev
   ```

### Demo Credentials
- **Admin:** `admin@techcorp.com` / `Admin@123`
- **Employee:** `emma@techcorp.com` / `Employee@123`
- **Technician:** `taylor@techcorp.com` / `Tech@123`
