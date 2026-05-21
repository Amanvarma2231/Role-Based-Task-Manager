<<<<<<< HEAD
# Role-Based Task Manager 🚀

**Developed by: Aman Varma**

A 100% professional, scalable, production-ready full-stack task management application featuring a beautiful modern UI, secure authentication, and robust backend.

## ✨ Features

- 🔐 **Secure Authentication**: JWT-based login and registration system.
- 👥 **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin` and `User`.
- 📝 **Task Management**: Create, read, update, and delete (CRUD) tasks.
- 🎨 **Beautiful UI**: Modern, responsive React frontend powered by Tailwind CSS.
- ⚡ **Graceful Degradation**: Fallback to SQLite and running without Redis seamlessly for easy local testing.
- 🐳 **Docker Ready**: Complete Docker setup for effortless production deployment.
- 📚 **Interactive API Docs**: Built-in Swagger UI for exploring endpoints.

## 🛠 Tech Stack

### Backend
- **Node.js & Express.js**
- **Sequelize ORM** (PostgreSQL by default, gracefully falls back to SQLite locally)
- **Redis** (Caching)
- **JWT** (Authentication)
- **Swagger** (API Docs)

### Frontend
- **React (Vite)**
- **Tailwind CSS** (Styling)
- **React Router DOM** (Navigation)
- **Axios** (API Calls)
- **React Hook Form & Hot Toast**

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** installed on your machine.

### Method 1: The Easiest Way (Windows) 💻
You don't need Docker, Postgres, or Redis for this! The app will automatically configure itself.

1. **Clone the repository** (if you haven't already).
2. Double-click the **`start.bat`** file in the project folder.
   - This will automatically install dependencies and launch both the Backend and Frontend in separate windows.
3. **Access the application**:
   - Frontend UI: [http://localhost:5173](http://localhost:5173) (or check terminal for the port)
   - Backend API Docs: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

### Method 2: Manual Setup (Terminal) ⌨️

#### 1. Backend Setup
```bash
cd Backend
npm install
npm start
```
*Note: It will automatically use SQLite if PostgreSQL is not configured, and skip Redis if it's not running.*

#### 2. Frontend Setup
Open a new terminal window:
```bash
cd Frontend
npm install
npm run dev
```

---

### Method 3: Using Docker (Production) 🐳
If you want to run the full stack with PostgreSQL and Redis.

1. Run Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
2. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Docs (Swagger): [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## 🛡️ API Endpoints Overview
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/tasks` - Get all tasks
- `POST /api/v1/tasks` - Create a task
- `PATCH /api/v1/tasks/:id` - Update a task
- `DELETE /api/v1/tasks/:id` - Delete a task (Admin only)

---
*Created with ❤️ by Aman Varma*
=======
# Role-Based-Task-Manager
>>>>>>> f18a278bc3f75f89132b5b21f954bdbd724e6fea
