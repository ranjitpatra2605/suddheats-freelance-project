# Network Access Setup Guide

This guide explains how to access the SuddhEats application from your phone on your local network (e.g., 192.168.0.100).

## Issues Fixed

✅ Backend server now listens on `0.0.0.0` (accessible from any device)
✅ CORS automatically includes your local network IP
✅ Frontend API configuration supports environment variables
✅ Added debugging console logs for troubleshooting
✅ Request body validation and error handling improved

## Steps to Enable Network Access

### 1. Find Your Local Network IP Address

**On Windows Command Prompt:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.0.100`)

**On Mac/Linux Terminal:**
```bash
hostname -I
# or
ifconfig
```

### 2. Configure Frontend (.env.local)

Edit `frontend/.env.local`:

**Option A: Using Full URL (Recommended)**
```env
NEXT_PUBLIC_API_URL=http://192.168.0.100:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

**Option B: Using Host and Port**
```env
NEXT_PUBLIC_BACKEND_HOST=192.168.0.100
NEXT_PUBLIC_BACKEND_PORT=5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

### 3. Backend is Automatically Configured

The backend now:
- ✅ Listens on `0.0.0.0:5000` (all network interfaces)
- ✅ Automatically detects your local IP and logs it on startup
- ✅ Accepts CORS requests from your local IP
- ✅ Console logs show accessible URLs on startup

**Expected console output:**
```
✅ MongoDB Connected

🚀 ShuddhEats Server running on:
   - Local: http://localhost:5000
   - Network: http://192.168.x.x:5000
   - Health: http://localhost:5000/api/health
```

### 4. Restart Your Development Servers

**Backend:**
```bash
cd backend
npm start
# or
node server.js
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access from Phone

Open browser on your phone and navigate to:
```
http://192.168.0.100:3000
```

Replace `192.168.0.100` with your actual local IP address.

## Testing Checklist

- [ ] Backend server shows correct local IP at startup
- [ ] Health check works: `http://192.168.0.100:5000/api/health`
- [ ] Frontend loads from phone: `http://192.168.0.100:3000`
- [ ] Can create account (check backend console for logs)
- [ ] Can login (check backend console for password verification logs)
- [ ] Cart drawer opens and API calls work

## Debugging

### Check Backend Logs

Look for these logs in backend console:

**For Registration:**
```
📝 Register request: { name, email, phone, hasPassword: true }
✅ User registered: { _id: ..., email: ... }
```

**For Login:**
```
🔐 Login attempt: { email, hasPassword: true, bodyKeys: [...] }
✅ Login successful: { _id: ..., email, role: ... }
```

### Check Frontend Logs

Open browser console on phone (Chrome DevTools):
```javascript
// Check API configuration
console.log(API_URL)

// Check request headers and responses
```

### Common Issues

**Problem: "Cannot reach server"**
- Solution: Verify IP address matches (frontend .env.local vs actual local IP)
- Check backend is running and listening on `0.0.0.0`
- Verify phone is on same wifi network

**Problem: "Invalid credentials" on login**
- Check backend console for "🔐 Login attempt" logs
- Verify email and password are correct
- Check if user exists in database

**Problem: CORS error**
- Backend now auto-accepts requests from detected local IP
- If still fails, check IP in error message and update .env.local
- Server logs show all allowed origins on startup

**Problem: Credentials not being sent**
- Frontend sends JSON payload with email and password
- Backend receives and logs incoming data
- Verify Content-Type header is `application/json`

## Production Notes

When deploying to production:

1. **Replace localhost references** with your production domain
2. **Use environment variables** for different environments (dev/prod)
3. **Set secure CORS origins** instead of allowing all local IPs
4. **Use HTTPS** for remote access
5. **Keep sensitive data** in .env files (never commit them)

## Environment Variables Reference

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL          # Full API URL (highest priority)
NEXT_PUBLIC_BACKEND_HOST     # Backend IP/hostname
NEXT_PUBLIC_BACKEND_PORT     # Backend port
NEXT_PUBLIC_RAZORPAY_KEY_ID  # Razorpay public key
NODE_ENV                     # development/production (for debug logs)
```

### Backend (`.env`)
```
PORT                         # Backend port (default: 5000)
MONGO_URI                    # MongoDB connection string
JWT_SECRET                   # JWT signing secret
FRONTEND_URL                 # Optional: restrict CORS to specific URL
RAZORPAY_KEY_ID             # Razorpay API key
RAZORPAY_KEY_SECRET         # Razorpay API secret
```

## Need Help?

1. Check the console logs (browser dev tools on phone, terminal on laptop)
2. Look for colored emoji indicators:
   - 🌐 = Network configuration
   - 🚀 = Server startup info
   - 📝 = Request received
   - ✅ = Success
   - ⚠️ = Warning
   - ❌ = Error
3. Check that backend is actually listening on the IP shown at startup
4. Verify frontend .env.local is saved and server is restarted

