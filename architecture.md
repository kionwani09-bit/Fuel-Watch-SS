
# FuelWatch South Sudan Architecture

## 1. System Overview
FuelWatch is a distributed platform connecting local fuel stations with end-users in South Sudan. It utilizes crowd-sourced data vetted by admins to provide high-fidelity market information.

## 2. Technical Stack
- **Frontend**: React (Vite), Tailwind CSS, Recharts.
- **Backend**: Node.js/Express (RESTful API).
- **Database**: MongoDB (Mongoose) - chosen for flexible schema handling variations in station metadata.
- **Auth**: JWT with HTTP-only cookies and Role-Based Access Control (RBAC).

## 3. Database Schema (Mongoose)

### User Model
```js
{
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['PUBLIC', 'REGISTERED', 'ADMIN'], default: 'PUBLIC' },
  city: String,
  points: Number // Gamification for contributors
}
```

### Station Model
```js
{
  name: String,
  city: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  prices: {
    petrol: Number,
    diesel: Number
  },
  availability: { type: String, enum: ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK'] },
  lastUpdated: Date,
  isVerified: Boolean
}
```

### Submission Model
```js
{
  stationId: ObjectId,
  userId: ObjectId,
  proposedPrices: { petrol: Number, diesel: Number },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] },
  evidence: String, // URL to photo of fuel board
  createdAt: Date
}
```

## 4. API Route Design
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT
- `GET /api/stations` - Fetch with filters (city, radius)
- `GET /api/stations/:id` - Details + price history
- `POST /api/submissions` - Create update (Registered Users)
- `PUT /api/admin/submissions/:id` - Approve/Reject (Admins)
- `GET /api/analytics/trends` - Price data for charts

## 5. Monetization Strategy
1. **Premium Data API**: Sell high-frequency, reliable pricing data to NGOs and Logistics companies for supply chain optimization.
2. **Featured Stations**: Allow stations to pay for 'Verified' badges or top-placement when prices are competitive.
3. **Advertising**: In-app ads for automotive supplies, tires, and maintenance services.
4. **NGO Dashboards**: Custom SaaS reporting for humanitarian organizations tracking regional scarcity.

## 6. Scalability Plan
- **Caching**: Implement Redis to cache frequent `/api/stations` requests.
- **Geospatial Indexing**: Use MongoDB `$near` queries for high-performance location-based searches.
- **Microservices**: Split the Analytics/Chart generation and the User Submission pipeline into separate workers.
- **Offline Support**: PWA (Progressive Web App) functionality for boda riders in low-connectivity areas.
