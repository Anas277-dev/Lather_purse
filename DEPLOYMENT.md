# Deployment Guide - Leather & Goods E-Commerce

## Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env
# Edit .env and add your database credentials

# Setup database
npm run migrate
npm run seed

# Start server
node index.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create .env file from example
cp .env.example .env

# Start dev server
npm run dev
```

---

## Production Deployment

### Option 1: Deploy Backend + Frontend Separately (Recommended)

#### Backend (Render/Railway/Heroku)
1. Push backend folder to GitHub
2. Connect to Render/Railway/Heroku
3. Set environment variables from `.env.example`
4. Add build command: `npm run migrate`
5. Start command: `node index.js`

#### Frontend (Vercel/Netlify)
1. Push frontend folder to GitHub
2. Connect to Vercel or Netlify
3. Build command: `npm run build`
4. Output directory: `build`
5. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

### Option 2: Deploy Together (Single Server)

1. Build frontend first:
```bash
cd frontend
npm install
npm run build
```

2. Set backend environment:
```bash
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

3. Backend will automatically serve the built frontend files from `../frontend/build`

---

## Database Hosting (Free Options)

### Railway (Recommended - Free Tier)
1. Go to railway.app
2. Create PostgreSQL database
3. Copy `DATABASE_URL` to your backend `.env`
4. Run migrations: `npm run migrate`

### Supabase (Free Tier)
1. Go to supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Use in your `.env` file

### Render (Free Tier)
1. Go to render.com
2. Create PostgreSQL instance
3. Copy connection details to `.env`

---

## Environment Variables Checklist

### Backend (.env)
- [ ] `PORT` - Server port (usually 5000 or use PORT from host)
- [ ] `DATABASE_URL` or `DB_HOST/PORT/NAME/USER/PASSWORD`
- [ ] `JWT_SECRET` - Strong random string
- [ ] `SMTP_USER/PASS` - For transactional emails
- [ ] `TWILIO_SID/AUTH_TOKEN/PHONE` - For SMS (optional)
- [ ] `FRONTEND_URL` - Your live frontend URL

### Frontend (.env)
- [ ] `VITE_API_URL` - Your live backend API URL

---

## Post-Deployment

1. Create admin account via registration, then manually set `is_admin = true` in database
2. Or use seed data: `npm run seed`
3. Upload product images to cloud storage (Cloudinary/AWS S3) and update image URLs
4. Configure domain and SSL certificate
5. Set up monitoring (UptimeRobot for free monitoring)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check `FRONTEND_URL` in backend `.env` |
| Database connection failed | Verify `DATABASE_URL` or individual DB credentials |
| Images not loading | Upload to cloud storage, don't use localhost URLs |
| JWT errors | Ensure `JWT_SECRET` is set and strong |
| 404 on refresh | Frontend routing is handled by backend in production mode |

---

## Free Hosting Stack Recommendation

| Service | Purpose | Cost |
|---------|---------|------|
| Railway | Backend + Database | Free tier |
| Vercel | Frontend hosting | Free |
| Cloudinary | Image hosting | Free tier |
| Gmail SMTP | Transactional emails | Free |
| UptimeRobot | Monitoring | Free |
