# ServiceDesk Pro

ServiceDesk Pro is a modern, responsive, ITSM-aligned Service Desk Platform built on the MERN stack (MongoDB, Express, React, Node.js). It leverages AI to automate IT service management tasks such as ticket classification and provides a comprehensive suite for role-based access, automated SLA management, asset tracking, and knowledge base management.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS, shadcn/ui inspired components
- **Routing:** React Router v6
- **State Management & Data Fetching:** Context API, Axios
- **Forms & Validation:** React Hook Form, Zod
- **Animations:** Framer Motion, GSAP
- **Data Visualization:** Recharts

### Backend
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with HTTP-only cookies
- **AI Integration:** Google Generative AI (Gemini)
- **Task Scheduling:** node-cron (for SLA breach checks)
- **Security:** Helmet, Express Rate Limit, CORS, bcryptjs

---

## 🏗️ Folder Structure

The repository is organized into a monorepo-style structure containing both the frontend and backend applications.

```text
ServiceDeskPro/
├── backend/                  # Node.js / Express API
│   ├── config/               # Database and third-party configuration
│   ├── controllers/          # Request handlers and business logic
│   ├── middleware/           # Authentication, error handling, validation
│   ├── models/               # Mongoose schemas (User, Ticket, Asset, etc.)
│   ├── routes/               # Express API routes definition
│   ├── scripts/              # Database seeding scripts (e.g., seed.js)
│   ├── services/             # Third-party integrations (e.g., Gemini AI)
│   ├── utils/                # Helper functions
│   └── server.js             # Entry point for the backend application
│
├── frontend/                 # React / Vite Application
│   ├── src/
│   │   ├── assets/           # Static assets (images, fonts)
│   │   ├── components/       # Reusable UI components (common, motion, ui)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── layouts/          # Page layouts based on user roles
│   │   ├── lib/              # Utility libraries and Axios configuration
│   │   ├── pages/            # Application pages (Auth, Dashboard, Tickets, etc.)
│   │   ├── routes/           # Protected and public route definitions
│   │   ├── services/         # API call wrappers
│   │   ├── App.jsx           # Main React component
│   │   └── main.jsx          # React DOM rendering entry point
│   └── package.json          # Frontend dependencies and scripts
│
└── README.md                 # Project documentation
```

---

## 🔄 Data Flow & Role-Based Access Control (RBAC)

ServiceDesk Pro enforces a strict Role-Based Access Control (RBAC) system. The data flow and capabilities differ significantly based on the authenticated user's role.

### 1. Admin
- **Data Flow:** Full system access. Can view, create, update, and delete any resource in the database.
- **Capabilities:**
  - Manage users and roles.
  - Configure SLA policies and ticket categories.
  - Access system-wide analytics and audit logs.

### 2. Manager
- **Data Flow:** Broad operational oversight. Can view all tickets and assets, but limited configuration access.
- **Capabilities:**
  - Monitor SLA compliance and team performance via Manager Dashboards.
  - Reassign tickets and manage escalations.
  - Review and publish Knowledge Base articles.

### 3. Technician
- **Data Flow:** Focused on issue resolution. Interacts primarily with the Ticket and Knowledge Base models.
- **Capabilities:**
  - View assigned or unassigned open tickets.
  - Update ticket statuses (Open -> In Progress -> Resolved).
  - Add internal notes and communicate with the reporter.
  - Utilize AI-generated insights and recommended Knowledge Base articles for faster resolution.

### 4. Employee (End User)
- **Data Flow:** Restricted to self-service. Can only read and write data associated with their own `userId`.
- **Capabilities:**
  - Submit new IT support tickets.
  - View the status and history of their submitted tickets.
  - Communicate with technicians on active tickets.
  - Browse published Knowledge Base articles for self-help.

### 5. Asset Manager
- **Data Flow:** Focused on hardware and software lifecycles. Interacts primarily with the Asset models.
- **Capabilities:**
  - Add, update, and track IT assets (laptops, software licenses).
  - Monitor warranties and asset assignments to employees.

### Typical Ticket Data Flow
1. **Creation:** An `Employee` submits a ticket.
2. **AI Classification:** The Backend uses Gemini AI to parse the ticket description, auto-categorize it, assign priority, and suggest solutions.
3. **Assignment:** A `Technician` picks up the ticket or a `Manager` assigns it.
4. **Resolution:** The `Technician` works on the ticket, updates the status, and resolves it. SLA timers are monitored in the background by `node-cron`.
5. **Closure:** The `Employee` confirms resolution, and the ticket is closed.

---

## ✨ Features Built

### Backend (Fully Functional API)
- **Ticket State Machine:** Enforced state transitions (e.g., Open -> Assigned -> In Progress -> Resolved -> Closed).
- **Service Level Agreements (SLA):** Dynamic deadline calculation. Background cron job checks SLA breaches and triggers escalations.
- **AI Integration (Gemini):** Automatically classifies new tickets, assigns priority, and provides probable issue summaries.
- **Audit Logging:** Tracks all major changes to system entities for compliance.

### Frontend
- **Authentication:** Secure login with JWT (access tokens in memory, refresh tokens in HTTP-only cookies).
- **Dynamic Dashboards:** Recharts-powered analytics tailored to the user's role.
- **Tickets UI:** Detailed ticket views with live comments, internal technician notes, and AI insights.

---

## 🚀 Running the Application

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (local or Atlas)
- Gemini API Key

### Backend Setup
1. Navigate to the backend:
   ```bash
   cd backend
   ```
2. Configure `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/servicedeskpro
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_URL=http://localhost:5173
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database (creates roles, users, SLA policies, and demo tickets):
   ```bash
   node scripts/seed.js
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend:
   ```bash
   cd frontend
   ```
2. Configure `.env` (optional):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Demo Credentials
- **Admin:** `admin@techcorp.com` / `Admin@123`
- **Employee:** `emma@techcorp.com` / `Employee@123`
- **Technician:** `taylor@techcorp.com` / `Tech@123`
