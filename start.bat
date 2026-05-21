@echo off
echo Starting Role-Based Task Manager by Aman Varma...

cd Backend
start "Backend API" cmd /k "npm install && npm start"

cd ../Frontend
start "Frontend UI" cmd /k "npm install && npm run dev"

echo Both services are starting! 
echo Backend will be at http://localhost:5000/api-docs
echo Frontend will be at http://localhost:5173 (or 3000)
pause
