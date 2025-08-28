@echo off
echo Starting Cruise Platform Desktop App...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Install frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo.
)

REM Check if backend is built
if not exist "backend\dist" (
    echo Building backend...
    npm run backend:build
    echo.
)

echo Starting development environment...
echo - Backend API will start on http://localhost:5000
echo - Frontend will start on http://localhost:3000
echo - Electron app will launch automatically
echo.

npm run start
