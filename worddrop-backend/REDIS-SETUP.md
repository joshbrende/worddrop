# Redis Setup Guide for Windows

## Option 1: Install Redis for Windows (Recommended)

### Download Redis for Windows
1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Or use Memurai (Redis-compatible): https://www.memurai.com/

### Install Memurai (Easiest for Windows)
1. Download Memurai from https://www.memurai.com/
2. Install the MSI package
3. Memurai runs as a Windows service automatically
4. Default port: 6379

### Manual Redis Installation
1. Extract Redis ZIP file
2. Run `redis-server.exe` to start Redis
3. Keep the terminal open (or install as Windows service)

## Option 2: Use Docker (If Docker is installed)
```bash
docker run -d -p 6379:6379 redis:latest
```

## Option 3: Use WSL2 (Windows Subsystem for Linux)
```bash
wsl
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

## Verify Redis is Running

```bash
# Test connection
redis-cli ping
# Should return: PONG
```

## Configuration

Your `.env` file is already configured:
```env
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null
```

**Note:** We've installed `predis/predis` which is a pure PHP Redis client. If Redis server is not running, the leaderboard will fall back to database queries (slower but functional).

## Testing Redis Connection

Run this in Laravel Tinker:
```bash
php artisan tinker
>>> Redis::ping()
```

If Redis is running, it should return `"PONG"`.

## For Production (worddrop.live)

On your shared hosting, you'll need to:
1. Install Redis on the server
2. Update `.env` with production Redis credentials
3. Or use a managed Redis service (Redis Cloud, AWS ElastiCache, etc.)
