@echo off
cd /d "%~dp0\worddrop-backend"
echo Starting WordDROP Backend Server...
echo.
echo Server will be available at:
echo   - Local: http://localhost:8000
echo   - Network: http://192.168.0.153:8000
echo.
echo Press Ctrl+C to stop the server
echo.
php artisan serve --host=0.0.0.0 --port=8000
