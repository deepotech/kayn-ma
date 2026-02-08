# 🚀 Cayn.ma - Production Deployment Guide

## Pre-Deployment Checklist

- [x] `output: 'standalone'` added to `next.config.mjs`
- [x] `.gitignore` updated to exclude all `.env*` files
- [x] No hardcoded `localhost` in source code
- [x] Scripts in `package.json` are correct (`dev`, `build`, `start`)

---

## 1️⃣ Git Commands - Initialize & Push

```powershell
# Stop dev server first (Ctrl+C)

# Initialize Git (if not already)
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial production-ready release"

# Set main branch
git branch -M main

# Add your GitHub repository (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/cayn-ma.git

# Push to GitHub
git push -u origin main
```

---

## 2️⃣ Railway Deployment Steps

### A. Create Project on Railway
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub Repo"**
4. Authorize Railway to access your GitHub
5. Select `cayn-ma` repository

### B. Railway Auto-Detection
Railway will automatically:
- ✅ Detect Next.js
- ✅ Run `npm install`
- ✅ Run `npm run build`
- ✅ Run `npm run start`

### C. Configure Environment Variables
In Railway Dashboard → Your Project → **Variables** tab:

```
NODE_ENV=production
MONGODB_URI=<your-mongodb-connection-string>
NEXT_PUBLIC_FIREBASE_API_KEY=<your-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
FIREBASE_ADMIN_PROJECT_ID=<your-project-id>
FIREBASE_ADMIN_CLIENT_EMAIL=<your-client-email>
FIREBASE_ADMIN_PRIVATE_KEY=<your-private-key>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
ADMIN_EMAIL=<your-admin-email>
```

> ⚠️ **IMPORTANT**: Copy values from your local `.env.local` file

---

## 3️⃣ Domain Configuration

### Add Custom Domain (cayn.ma)
1. Railway Dashboard → Settings → Domains
2. Click **"Add Custom Domain"**
3. Enter: `cayn.ma`
4. Add DNS records to your domain registrar:
   - Type: `CNAME`
   - Name: `@` or `www`
   - Value: `<railway-provided-value>`

---

## 4️⃣ Post-Deployment Verification

| Check | URL | Expected |
|-------|-----|----------|
| Homepage | `/` | Loads correctly |
| Arabic | `/ar` | RTL layout |
| French | `/fr` | LTR layout |
| Sitemap | `/sitemap.xml` | XML file |
| Robots | `/robots.txt` | Text file |
| Rent Agencies | `/ar/rent-agencies/marrakech` | Agency listing |
| 404 Page | `/nonexistent` | Custom 404 |

---

## 5️⃣ Common Railway + Next.js Issues

### Issue: Build fails with memory error
**Solution**: Add to Railway Variables:
```
NODE_OPTIONS=--max_old_space_size=4096
```

### Issue: Images not loading
**Solution**: Verify `remotePatterns` in `next.config.mjs` includes all image hosts

### Issue: API routes returning 500
**Solution**: Check Railway logs and verify all environment variables are set

### Issue: Slow cold starts
**Solution**: `output: 'standalone'` is already configured ✅

---

## 6️⃣ Monitoring

- **Railway Logs**: Dashboard → Deployments → View Logs
- **Health Check**: Railway automatically monitors `/`
- **Google Search Console**: Add `cayn.ma` after deployment

---

## ✅ Final Checklist

- [ ] GitHub repository created and pushed
- [ ] Railway project created
- [ ] All environment variables added
- [ ] Build successful on Railway
- [ ] Site accessible via Railway URL
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Sitemap accessible
- [ ] Google Search Console configured

---

## 7️⃣ Troubleshooting: Custom Domain Not Working

### Symptom: `www.cayn.ma` redirects too many times or shows an error.
**Cause:** The DNS record for `www` is pointing to an old server (e.g., `23.88.123.118`) instead of Railway.

**Fix:**
1. Login to your domain registrar (Namecheap, GoDaddy, etc.).
2. Locate the DNS settings for `cayn.ma`.
3. Find the **CNAME** record for **`www`**.
4. Change the value to: `kayn-ma-production.up.railway.app`.
   - **Type:** CNAME
   - **Host:** www
   - **Value:** kayn-ma-production.up.railway.app
   - **TTL:** Automatic (or 1 min)
5. Save changes and wait for propagation.

