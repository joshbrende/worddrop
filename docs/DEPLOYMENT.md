# Deployment Guide

This guide explains how to deploy **WordDROP** with its distributed architecture:
*   **Frontend**: Vercel (Static Site/SPA)
*   **Backend**: Shared Hosting (`worddrop.live`)

## 1. Architecture Overview
Your game runs in the browser (Frontend) and talks to the Backend API.
*   **Frontend (Vercel)** ➡️ **requests** ➡️ **Backend API (`https://worddrop.live/api/v1`)**
*   **Backend API** ➡️ **queries** ➡️ **Database (MySQL on Shared Hosting)**

**Crucial Point**: Your Vercel frontend DOES NOT connect to the database directly. It connects to your API on `worddrop.live`. The Backend on `worddrop.live` connects to the "localhost" database *on that same server*.

## 2. Deploy Backend (`worddrop-backend`)
### A. Database Setup (cPanel)
1.  Log in to cPanel: `https://cp61.domains.co.za:2083`
2.  Go to **MySQL Databases**.
3.  Create a new database (e.g., `worddrop_db`).
4.  Create a new user (e.g., `worddrop_user`) and password.
5.  **Add User to Database** with ALL PRIVILEGES.

### B. Upload Code (FTP)
1.  Use FileZilla to connect:
    *   **Host**: `ftp.worddrop.live`
    *   **User**: `worddrop`
    *   **Pass**: (Your Password)
2.  Upload the contents of `worddrop-backend` to a folder, e.g., `public_html/api` or just `public_html` if it's the only thing there.
    *   *Note: For security, it's best to put Laravel outside public_html, but for shared hosting simplicity, ensure `.env` is protected.*

### C. Configuration & Credentials (Crucial)
1.  **Edit the `.env` file** on the server (File Manager -> Settings -> Show Hidden Files).
2.  **Paste this exact configuration** (using the credentials you provided):

    ```ini
    APP_NAME=WordDrop
    APP_ENV=production
    APP_DEBUG=false
    # This URL must match your site. If accessing via /public, include it.
    APP_URL=https://worddrop.live
    
    # DATABASE CONNECTION (Credentials you provided)
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=worddrop_worddrop_db
    DB_USERNAME=worddrop_root
    DB_PASSWORD=Waterfalls@123!
    
    # Use file drivers for shared hosting simplicity
    CACHE_DRIVER=file
    SESSION_DRIVER=file
    queue_connection=sync
    ```

3.  **Run Migrations**: 
    *   If you have SSH access, run `php artisan migrate`.
    *   If NOT, you can import the local `database/database.sqlite` structure (converted to SQL) via phpMyAdmin, OR just hit a special route if you create one. *For now, try to import an SQL export of your local DB if standard migration isn't possible.*

## 3. Deploy Frontend (`src`) to Vercel
**Does Vercel handle the database?** NO. Vercel only hosts the game interface. It needs to know WHERE the backend is.

1.  **Determine your Backend URL**:
    *   If you uploaded the *contents* of `worddrop-backend` directly to `public_html`, your API URL is likely:
        `https://www.worddrop.live/public/api/v1`
    *   *Test this link in your browser after uploading backend. If you see a JSON response or "404", it's reachable.*

2.  **Vercel Environment Variable**:
    *   Key: `VITE_API_BASE_URL`
    *   Value: `https://www.worddrop.live/public/api/v1` (Adjust if your path is different)

## 4. Verification
1.  Open your Vercel URL (e.g., `https://worddrop.vercel.app`).
2.  Open the Browser Console (F12).
3.  Check the Network tab to ensure requests are going to `https://worddrop.live/api/v1/...` and returning `200 OK`.
