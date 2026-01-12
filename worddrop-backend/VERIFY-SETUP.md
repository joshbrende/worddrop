# Backend Setup Verification

## ✅ Backend Location
The backend has been successfully moved to:
- `C:\wamp64\www\words\worddrop-crazygames\worddrop-backend\`

## ✅ Configuration Verified

### Database Connection
- **Host**: 127.0.0.1
- **Port**: 3306
- **Database**: worddrop
- **Username**: root
- **Password**: (none)

### Server Configuration
- **APP_URL**: http://192.168.0.153:8000
- **Network Access**: Enabled (0.0.0.0:8000)

### CORS Configuration
- ✅ Localhost:5173 and :3000 allowed
- ✅ Network IP (192.168.0.153:5173 and :3000) allowed
- ✅ Production domain (worddrop.live) allowed

### Sanctum Configuration
- ✅ Stateful domains include 192.168.0.153:8000

## ✅ Routes Verified
All 37 API routes are registered and working:
- Public game APIs (Word of Day, Sponsor Questions, Scores, Leaderboard)
- CrazyGames integration endpoints
- Admin endpoints (Words, Sponsors, Questions, Dashboard)
- Authentication endpoints

## 🚀 Starting the Server

### Option 1: From Root Folder
Double-click: `C:\wamp64\www\words\worddrop-crazygames\START-BACKEND.bat`

### Option 2: From Backend Folder
Double-click: `C:\wamp64\www\words\worddrop-crazygames\worddrop-backend\START-SERVER.bat`

### Option 3: Manual Command
```bash
cd C:\wamp64\www\words\worddrop-crazygames\worddrop-backend
php artisan serve --host=0.0.0.0 --port=8000
```

## 📍 Server URLs
Once started, the server will be available at:
- **Local**: http://localhost:8000
- **Network**: http://192.168.0.153:8000

## 🧪 Quick Test
Test the API is working:
```bash
curl http://192.168.0.153:8000/api/v1/word-of-day
```

## 📝 Frontend Integration
The frontend `GameApiService.ts` is already configured to use:
- `http://192.168.0.153:8000/api/v1`

No changes needed in the frontend!
