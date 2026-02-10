# 🚀 Quick Start Guide - Live GPS Tracking

## Setup (5 minutes)

### 1. Database Configuration ✅
**Status:** Already completed!
- Migration has been run
- `live_bus_locations` table created
- All indexes and triggers configured

### 2. Backend Setup

#### Start the backend server:
```bash
cd x:\project_safatiTix-v2\backend
npm start
```

**Verify it's running:** You should see:
```
Server running on port 5000
Database connected successfully
```

### 3. Frontend Setup

#### Install dependencies (if not already done):
```bash
cd x:\project_safatiTix-v2\project_safatiTix-dev
npm install --legacy-peer-deps
```

#### Configure Mapbox token:
1. Open `project_safatiTix-dev/.env`
2. Add this line (or use the demo token already in the code):
```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw
```

#### Start the frontend:
```bash
npm run dev
```

---

## 🧪 Test the System (10 minutes)

### Test 1: Driver Tracking

1. **Login as a driver**
   - Email: (your driver account)
   - Password: (your password)

2. **Navigate to Tracking**
   - Click "Start Tracking" button in top navigation
   - Or go to: `http://localhost:5173/driver/dashboard/tracking`

3. **Start a Trip**
   - Enter a valid Bus ID (get from company admin or database)
   - Click "Start Trip" button (green)
   - Allow location access when browser prompts
   - ✅ You should see: "Trip started! Your location is now being tracked."

4. **Verify Tracking**
   - Check the Current Location card
   - See latitude, longitude, speed updating
   - Status should show "TRIP ACTIVE" with green indicator

5. **End Trip**
   - Click "End Trip" button (red)
   - Confirm the dialog
   - ✅ Status should change to "NO ACTIVE TRIP"

### Test 2: Company Map View

1. **Login as company admin** (in new tab/window)
   - Email: (your company admin account)
   - Password: (your password)

2. **Navigate to Live Tracking**
   - Click "Live Tracking" in sidebar
   - Or go to: `http://localhost:5173/dashboard/company/tracking`

3. **View the Map**
   - ✅ You should see:
     - Interactive Mapbox map
     - Bus marker(s) with custom icon (🚌)
     - Statistics cards at top (Total, Active, Idle)
     - Bus list on the right side

4. **Interact with Markers**
   - Click a bus marker on the map
   - ✅ Popup should show:
     - Bus plate number
     - Driver name
     - Bus model
     - Current speed
     - Trip status

5. **Watch Real-time Updates**
   - Keep both tabs open (driver + company)
   - Move your computer/phone (if using mobile)
   - ✅ Map should update within 10 seconds
   - ✅ Speed should change based on movement

---

## 📊 Verify in Database

### Check active trips:
```sql
SELECT 
  l.id,
  b.plate_number,
  d.name as driver_name,
  l.latitude,
  l.longitude,
  l.speed,
  l.is_active,
  l.trip_status,
  l.updated_at
FROM live_bus_locations l
JOIN buses b ON l.bus_id = b.id
JOIN drivers d ON l.driver_id = d.id
WHERE l.is_active = true;
```

### Expected result:
```
plate_number | driver_name | latitude  | longitude | speed | is_active | trip_status
-------------|-------------|-----------|-----------|-------|-----------|------------
KAA 123X     | John Doe    | -1.286389 | 36.817223 | 45.30 | true      | active
```

---

## 🐛 Troubleshooting

### Backend Issues

**Issue:** "Cannot find module 'mapbox-gl'"
**Solution:**
```bash
cd project_safatiTix-dev
npm install mapbox-gl --legacy-peer-deps
```

**Issue:** "Migration failed: relation 'live_bus_locations' already exists"
**Solution:** Table already created - this is OK! Skip migration.

**Issue:** "Database connection failed"
**Solution:**
1. Check `backend/.env` has `DATABASE_URL`
2. Test connection: `npm run test-db`

### Frontend Issues

**Issue:** "Location permission denied"
**Solution:** 
- Use HTTPS or localhost (HTTP only works on localhost)
- Enable location in browser settings
- Try different browser (Chrome recommended)

**Issue:** Map shows gray box
**Solution:**
1. Check Mapbox token in `.env`
2. Check browser console for errors
3. Verify internet connection

**Issue:** No buses on map
**Solution:**
1. Ensure driver has started a trip
2. Check coordinates are not 0,0
3. Wait 10 seconds for first update
4. Check backend logs for errors

### API Issues

**Issue:** "401 Unauthorized"
**Solution:**
- Login again (token might have expired)
- Check `Authorization` header in Network tab

**Issue:** "Bus not found"
**Solution:**
- Verify Bus ID exists in database
- Check bus belongs to driver's company
- Query: `SELECT id FROM buses WHERE company_id = (SELECT company_id FROM drivers WHERE user_id = ?)`

---

## 📱 Mobile Testing

### Test on Your Phone:

1. **Find your computer's local IP:**
```bash
# Windows
ipconfig | findstr IPv4

# Result example: 192.168.1.100
```

2. **Update frontend to allow external access:**
```bash
cd project_safatiTix-dev
npm run dev -- --host
```

3. **Access from phone:**
- Connect phone to same WiFi
- Open browser: `http://192.168.1.100:5173`
- Login as driver
- Start tracking

4. **Test GPS accuracy:**
- Walk around with your phone
- Check company map updates in real-time
- Verify speed increases when you move

---

## 🎯 Key Endpoints Reference

### Driver Endpoints:
```
POST   /api/tracking/driver/location      - Update GPS (every 10s)
POST   /api/tracking/driver/trip/start    - Start trip
POST   /api/tracking/driver/trip/end      - End trip
GET    /api/tracking/driver/trip/status   - Check status
```

### Company Endpoints:
```
GET    /api/tracking/company/live-locations  - Get all active buses
```

### Test with cURL:
```bash
# Check if driver has active trip
curl -X GET http://localhost:5000/api/tracking/driver/trip/status \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN"

# Get company's live locations
curl -X GET http://localhost:5000/api/tracking/company/live-locations \
  -H "Authorization: Bearer YOUR_COMPANY_TOKEN"
```

---

## ✅ Success Checklist

After testing, you should be able to:
- [ ] Driver can start a trip
- [ ] Driver sees their GPS location updating
- [ ] Driver can end a trip
- [ ] Company sees bus marker on map
- [ ] Company sees real-time location updates
- [ ] Marker popup shows correct info
- [ ] Statistics cards show correct counts
- [ ] Bus list updates in sync with map
- [ ] Multiple buses can track simultaneously
- [ ] Ended trips disappear from map

---

## 📞 Need Help?

### Check Logs:

**Backend logs:**
```bash
cd backend
npm start
# Watch terminal for errors
```

**Frontend console:**
- Open Browser DevTools (F12)
- Go to Console tab
- Look for red errors

**Common log messages:**
```
✅ "Location updated successfully" - GPS working
✅ "Trip started:" - Trip created
❌ "Error updating driver location:" - Check API
❌ "Failed to fetch live locations" - Check auth
```

### Debug Mode:

Add console logs in `DriverTracking.tsx`:
```typescript
const sendLocationUpdate = async (...) => {
  console.log('📍 Sending location:', { latitude, longitude, speed });
  // ... rest of code
};
```

---

## 🚦 Production Deployment

### Before going live:

1. **Get production Mapbox token:**
   - Sign up at https://account.mapbox.com/
   - Create new token with Maps SDK access
   - Update `VITE_MAPBOX_TOKEN` in production `.env`

2. **Configure HTTPS:**
   - GPS requires HTTPS (except localhost)
   - Set up SSL certificate
   - Update backend CORS for production domain

3. **Database optimization:**
   - Review indexes for your data volume
   - Set up automated backup
   - Monitor query performance

4. **Set update frequency:**
   - Current: 10 seconds
   - Adjust in `DriverTracking.tsx` line 165:
   ```typescript
   const interval = setInterval(..., 10000); // Change to 30000 for 30s
   ```

5. **Error monitoring:**
   - Add Sentry or error tracking service
   - Monitor GPS accuracy issues
   - Track API latency

---

**Setup Time:** ~5 minutes  
**Test Time:** ~10 minutes  
**Status:** ✅ Ready to use!

Enjoy your new Live GPS Tracking System! 🎉
