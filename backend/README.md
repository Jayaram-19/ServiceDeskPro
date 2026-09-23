# ServiceDesk Pro - Backend API

This is the backend REST API for ServiceDesk Pro, an AI-powered IT Service Management platform.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **AI Integration:** Google Generative AI (Gemini)
- **Background Jobs:** node-cron

## Features
- Role-Based Access Control (Admin, Manager, Technician, Employee, Asset Manager)
- Ticket State Machine
- Service Level Agreements (SLA) monitoring and escalation
- AI-powered ticket classification and insights (Gemini)
- Asset tracking and Knowledge Base management

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Google Gemini API Key

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/servicedeskpro
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_URL=http://localhost:5173
   ```

### Database Seeding
To populate the database with initial roles, users, and demo data:
```bash
npm run seed
```

### Running the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```
