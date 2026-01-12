# Quick API Test Guide

## 1. Start the Server

```bash
# Option 1: Use the batch file
START-SERVER.bat

# Option 2: Manual command
php artisan serve --host=0.0.0.0 --port=8000
```

Server will be available at: `http://192.168.0.153:8000`

## 2. Test Login

**Request:**
```http
POST http://192.168.0.153:8000/api/auth/login
Content-Type: application/json

{
  "email": "admin@worddrop.live",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@worddrop.live",
      "role": "admin"
    },
    "token": "1|xxxxxxxxxxxxx"
  }
}
```

## 3. Test Public API (No Auth)

**Get Word of Day:**
```http
GET http://192.168.0.153:8000/api/v1/word-of-day
```

**Get Leaderboard:**
```http
GET http://192.168.0.153:8000/api/v1/leaderboard?type=all_time&limit=10
```

## 4. Test Admin API (With Auth)

Replace `YOUR_TOKEN` with the token from login:

**Get Dashboard Stats:**
```http
GET http://192.168.0.153:8000/api/admin/dashboard/stats
Authorization: Bearer YOUR_TOKEN
```

**Create Word:**
```http
POST http://192.168.0.153:8000/api/admin/words
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "word": "EXAMPLE",
  "date": "2026-01-12",
  "difficulty": "medium",
  "points": 100,
  "category": "General",
  "hint": "A sample word"
}
```

## Using cURL (Command Line)

### Login
```bash
curl -X POST http://192.168.0.153:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@worddrop.live\",\"password\":\"admin123\"}"
```

### Get Word of Day
```bash
curl http://192.168.0.153:8000/api/v1/word-of-day
```

### Get Dashboard Stats (with token)
```bash
curl http://192.168.0.153:8000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Default Admin Credentials

- **Email**: `admin@worddrop.live`
- **Password**: `admin123`

**⚠️ Change this password in production!**
