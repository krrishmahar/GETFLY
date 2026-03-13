# GETFLY Backend

A professional Node.js Express backend using MVC architecture for the GETFLY backend system for internship. This service handles authentication, project lifecycle, and daily progress reporting (DPR) with role-based access control.

![Node.js](https://img.shields.io/badge/Node.js-20-green)
![Express](https://img.shields.io/badge/Express-4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-purple)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-blue)
![Postman](https://img.shields.io/badge/API-Tested-orange)

## 🚀 Features

- **MVC Architecture**: Clean separation of concerns with Controllers, Services, and Routes.
- **JWT Authentication**: Secure token-based auth with password hashing via `bcryptjs`.
- **Role-Based Access Control (RBAC)**: Distinct permissions for ADMIN, MANAGER, and WORKER.
- **Project Tracking**: Comprehensive project management with status updates and budget tracking.
- **Daily Progress Reports (DPR)**: Site-level reporting including weather, materials, challenges, and safety.
- **Automatic Documentation**: Built-in system info and health checks.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime Environment |
| **Express** | Web Framework |
| **TypeScript** | Static Typing |
| **Prisma** | ORM for PostgreSQL |
| **PostgreSQL** | Primary Database (NeonDB) |
| **JWT** | Auth Tokens |
| **Helmet** | Security Headers |

---

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL instance (NeonDB recommended)

### 1. Installation
```bash
git clone https://github.com/yourusername/getfly-backend.git
cd getfly-backend
npm install
```

### 2. Environment Setup
Create a `.env` file in the root:
```env
DATABASE_URL="postgresql://user:pass@ep-host.region.neon.tech/dbname?sslmode=require"
JWT_SECRET="your-secret-key"
PORT=3000
```

### 3. Database Initialization
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed sample data (Admin, Projects, DPRs)
npm run db:seed
```

### 4. Running for Development
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

---

## 📖 API Documentation

### System
- `GET /health` - Database connection and system health.
- `GET /about` - Project version and developer information.

### Authentication
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Login and receive JWT.

### Projects
- `GET /api/projects` - List projects (filtered by role/status).
- `POST /api/projects` - Create a new project (Admin/Manager).
- `GET /api/projects/:id` - Detailed project view.
- `PUT /api/projects/:id` - Update project details.
- `DELETE /api/projects/:id` - Remove a project.

### Daily Progress Reports
- `GET /api/projects/:id/dpr` - List reports for a project.
- `POST /api/projects/:id/dpr` - Submit a new daily report.

---

## 🧪 Testing

### Automated CLI Test
We provide a comprehensive bash script to test all flows:
```bash
sh api-test.sh
```

### Postman
Import `postman_collection.json` into Postman to explore and test the APIs visually.

---

## ☁️ Deployment (Render)

### 1. External Database
Use [Neon.tech](https://neon.tech) to create a free PostgreSQL instance and copy the connection string.

### 2. Configure Render
1. Create a "Web Service" on [Render](https://render.com).
2. Connect your GitHub repository.
3. **Environment**: `Node`.
4. **Build Command**: `npm install && npm run build`.
5. **Start Command**: `npm start`.
6. **Environment Variables**:
   - `DATABASE_URL`: Your Neon connection string.
   - `JWT_SECRET`: A strong random string.
   - `PORT`: `3000` (or leave as default).

### 3. Post-Deployment
If you need to seed data on production, you can run the seed command via Render's "Shell" tab:
```bash
npm run db:seed
```

---

## 🤝 Contributing
1. Fork it.
2. Create your feature branch (`git checkout -b feature/cool-feature`).
3. Commit changes (`git commit -m 'Add cool feature'`).
4. Push to branch (`git push origin feature/cool-feature`).
5. Open a Pull Request.

---

Developer: **Krrish Mahar**  
License: Apache License