# Deployment Guide

This guide explains how to deploy **WordDROP** with its distributed architecture:
*   **Frontend**: Vercel (Static Site/SPA)
*   **Backend**: Shared Hosting (e.g., `worddrop.live`)

## 1. Architecture Overview
Your game runs in the browser (Frontend) and talks to the Backend API.
*   **Frontend (Vercel)** ➡️ **requests** ➡️ **Backend API (`https://worddrop.live/api/v1`)**
*   **Backend API** ➡️ **queries** ➡️ **Database (MySQL on Shared Hosting)**

The Frontend **NEVER** connects directly to the database. It only speaks to your API.

## 2. Deploy Backend (`worddrop-backend`)
1.  **Upload Code**: Upload the contents of `worddrop-backend` to your shared hosting (e.g., via FTP or Git).
2.  **Environment**: Create a `.env` file on your server similar to your local one, but pointing to your production database.
    ```ini
    APP_ENV=production
    APP_DEBUG=false
    APP_URL=https://worddrop.live
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=your_db_name
    DB_USERNAME=your_db_user
    DB_PASSWORD=your_db_password
    CACHE_DRIVER=file
    SESSION_DRIVER=file
    ```
3.  **Run Migrations**: Run `php artisan migrate` on your server to set up the database tables.

## 3. Deploy Frontend (`src`)
1.  **Push to Git**: Ensure your latest changes are pushed to GitHub.
2.  **Import to Vercel**:
    *   Go to Vercel Dashboard -> Add New Project.
    *   Import the `worddrop` repository.
    *   **Root Directory**: Leave as `./` (root).
    *   **Framework Preset**: Vite.
    *   **Build Command**: `npm run build`.
    *   **Output Directory**: `dist`.
3.  **Environment Variables**:
    *   Add a new Environment Variable in Vercel:
        *   **Key**: `VITE_API_BASE_URL`
        *   **Value**: `https://worddrop.live/api/v1`
4.  **Deploy**: Click Deploy!

## 4. Verification
1.  Open your Vercel URL (e.g., `https://worddrop.vercel.app`).
2.  Open the Browser Console (F12).
3.  Check the Network tab to ensure requests are going to `https://worddrop.live/api/v1/...` and returning `200 OK`.
