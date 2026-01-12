# API Testing Guide

## Base URL
- **Local Network**: `http://192.168.0.153:8000/api`
- **Localhost**: `http://localhost:8000/api`

## Start the Server

```bash
# Terminal 1: Start Laravel server
cd C:\wamp64\www\words\worddrop-backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Start Vite (for admin panel)
npm run dev
```

## 1. Create Admin User

### Using Tinker
```bash
php artisan tinker
>>> $user = App\Models\User::create(['name' => 'Admin', 'email' => 'admin@worddrop.live', 'password' => bcrypt('password123'), 'role' => 'admin']);
>>> exit
```

### Using API (if register endpoint is enabled)
```http
POST http://192.168.0.153:8000/api/auth/register
Content-Type: application/json

{
  "name": "Admin",
  "email": "admin@worddrop.live",
  "password": "password123",
  "password_confirmation": "password123"
}
```

## 2. Login and Get Token

```http
POST http://192.168.0.153:8000/api/auth/login
Content-Type: application/json

{
  "email": "admin@worddrop.live",
  "password": "password123"
}
```

**Response:**
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
    "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

**Save the token** for subsequent requests!

## 3. Test Public APIs (No Auth Required)

### Get Word of the Day
```http
GET http://192.168.0.153:8000/api/v1/word-of-day
```

### Get Random Sponsor Question
```http
GET http://192.168.0.153:8000/api/v1/sponsor-question?level=5
```

### Get Leaderboard
```http
GET http://192.168.0.153:8000/api/v1/leaderboard?type=all_time&limit=10
```

## 4. Test Admin APIs (Auth Required)

### Get Dashboard Stats
```http
GET http://192.168.0.153:8000/api/admin/dashboard/stats
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create Word
```http
POST http://192.168.0.153:8000/api/admin/words
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "word": "EXAMPLE",
  "date": "2026-01-12",
  "category": "General",
  "hint": "A thing characteristic of its kind",
  "difficulty": "medium",
  "points": 100,
  "is_active": true
}
```

### Create Sponsor
```http
POST http://192.168.0.153:8000/api/admin/sponsors
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "logo_url": "https://example.com/logo.png",
  "website_url": "https://acme.com",
  "description": "Leading provider of innovative solutions",
  "contact_email": "contact@acme.com",
  "contact_name": "John Doe",
  "is_active": true
}
```

### Create Question
```http
POST http://192.168.0.153:8000/api/admin/questions
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "sponsor_id": 1,
  "question": "What is the capital of France?",
  "answer": "PARIS",
  "category": "Geography",
  "difficulty": "easy",
  "points": 150,
  "hint": "It's a famous European city",
  "is_active": true
}
```

## Postman Collection

### Import Collection
1. Open Postman
2. Click "Import"
3. Create a new collection "WordDROP API"
4. Add environment variables:
   - `base_url`: `http://192.168.0.153:8000/api`
   - `token`: (leave empty, will be set after login)

### Environment Setup
Create a Postman Environment with:
- `base_url`: `http://192.168.0.153:8000/api`
- `token`: (set this after login)

### Pre-request Script (for Admin APIs)
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('token')
});
```

## Testing Checklist

- [ ] Server starts on `http://192.168.0.153:8000`
- [ ] Admin user created
- [ ] Login endpoint returns token
- [ ] Public APIs work without auth
- [ ] Admin APIs require token
- [ ] Can create words, sponsors, questions
- [ ] Leaderboard endpoint works
- [ ] Redis connection (if Redis installed)

## Common Issues

### CORS Error
- Check `config/cors.php` includes your frontend URL
- Ensure `APP_URL` in `.env` matches server URL

### 401 Unauthorized
- Check token is included in Authorization header
- Verify token hasn't expired
- Ensure user has `admin` role

### 500 Server Error
- Check Laravel logs: `storage/logs/laravel.log`
- Verify database connection
- Check Redis connection (if using Redis)

### Migration Errors
- Ensure MySQL is running
- Check database `worddrop` exists
- Verify user has proper permissions
