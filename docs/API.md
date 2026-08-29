# KisanSetu — API Contract

> **Version:** 1.0.0-draft  
> **Status:** Design-complete. Not yet implemented.  
> **Last updated:** 2026-08-29  
> **Maintained by:** KisanSetu Engineering Team (SIH 2026)

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL & Versioning](#base-url--versioning)
3. [Standard Response Format](#standard-response-format)
4. [HTTP Status Codes](#http-status-codes)
5. [Authentication & Security Model](#authentication--security-model)
6. [Roles](#roles)
7. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Mandi Prices](#mandi-prices)
   - [Crop Lots](#crop-lots)
   - [Buyers](#buyers)
   - [Buyer Requirements](#buyer-requirements)
   - [Offers](#offers)
   - [Orders](#orders)
   - [Transport](#transport)
   - [Storage](#storage)
   - [Payments](#payments)
   - [Notifications](#notifications)
   - [Grievances](#grievances)
   - [AI Services](#ai-services)
   - [Market Net Value](#market-net-value)
8. [Architecture Integration](#architecture-integration)
9. [Unmapped Frontend Data](#unmapped-frontend-data)

---

## Overview

KisanSetu is a farmer-focused market intelligence and marketplace platform.

This document is the **single source of truth** for the API contract between:

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI Service | Python (FastAPI or Flask) |

> **Rule:** The frontend must never assume or invent data shapes.  
> **Rule:** The backend must never trust IDs sent from the frontend for ownership.  
> **Rule:** The AI service communicates only through the Node.js backend — never directly from the browser.

---

## Base URL & Versioning

```
Production:  https://api.kisansetu.in/api
Development: http://localhost:5000/api
```

All endpoints are prefixed with `/api`. No version segment is used in v1.  
When breaking changes are required a `/v2` prefix will be added explicitly.

---

## Standard Response Format

All API responses use the same envelope. The frontend must check `success` before reading `data`.

### Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 54
  }
}
```

> `meta` is only included on paginated list endpoints. Omit for single-resource responses.

### Error Response

```json
{
  "success": false,
  "message": "Human-readable error message in English",
  "messageHi": "हिंदी में त्रुटि संदेश",
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "details": {}
  }
}
```

`error.details` contains field-level validation errors where applicable:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "quantity": "Must be a positive number",
      "cropType": "Required"
    }
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | When used |
|------|---------|-----------|
| `200` | OK | Successful GET, PATCH |
| `201` | Created | Successful POST (new resource) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error, malformed body |
| `401` | Unauthorized | Missing or invalid JWT |
| `403` | Forbidden | Valid JWT but insufficient role/ownership |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource (e.g. duplicate offer) |
| `422` | Unprocessable | Semantically invalid input |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected backend failure |
| `503` | Service Unavailable | AI service down or timeout |

---

## Authentication & Security Model

### JWT Token Flow

1. Client calls `POST /api/auth/login` with credentials.
2. Server validates credentials, returns a signed **JWT** (JSON Web Token).
3. Client stores the token in an **httpOnly cookie** (preferred) or `localStorage`.
4. Every subsequent request includes the token in the `Authorization` header:
   ```
   Authorization: Bearer <token>
   ```
5. Server middleware verifies the token on every protected route.
6. On expiry, client calls `POST /api/auth/refresh` (future endpoint) or re-logs in.

### Critical Security Rules

> ⚠️ **NEVER trust `farmerId` or `buyerId` sent from the frontend.**
>
> The backend must derive the authenticated user's ID exclusively from the decoded JWT payload.
> Any `farmerId` or `buyerId` fields in the request body are **ignored** for ownership checks.

```
// Backend pseudo-code — correct pattern
const ownerId = req.user._id;           // from JWT, set by auth middleware
const lot = await Lot.findById(lotId);
if (!lot.farmerId.equals(ownerId)) {
  return res.status(403).json({ success: false, message: 'Forbidden' });
}
```

### Token Payload Shape

```json
{
  "sub": "60f1a2b3c4d5e6f7a8b9c0d1",
  "role": "farmer",
  "email": "ramesh@example.com",
  "iat": 1693300000,
  "exp": 1693386400
}
```

---

## Roles

| Role | Description |
|------|-------------|
| `farmer` | Individual farmer or farming household |
| `buyer` | Trader, wholesaler, processor, or retail chain |
| `fpo` | Farmer Producer Organisation — acts on behalf of multiple farmers |
| `admin` | KisanSetu platform administrator |

Role is set at registration and stored in the JWT. Only `admin` can change roles.

---

## Endpoints

---

### Auth

---

#### `POST /api/auth/register`

Register a new user account.

**Auth required:** No  
**Role required:** None

**Request Body:**

```json
{
  "name": "Ramesh Kumar",
  "nameHi": "रमेश कुमार",
  "email": "ramesh@example.com",
  "phone": "+919876543210",
  "password": "securePassword123",
  "role": "farmer",
  "location": "Karnal, Haryana",
  "state": "Haryana",
  "district": "Karnal"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | Full name in English |
| `nameHi` | string | ❌ | Name in Devanagari (optional) |
| `email` | string | ✅ | Unique, validated format |
| `phone` | string | ✅ | E.164 format, unique |
| `password` | string | ✅ | Min 8 chars, server-hashed |
| `role` | string | ✅ | `farmer` \| `buyer` \| `fpo` |
| `location` | string | ✅ | Human-readable location |
| `state` | string | ✅ | Indian state name |
| `district` | string | ✅ | District name |

**Success Response `201`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Ramesh Kumar",
      "email": "ramesh@example.com",
      "role": "farmer",
      "verified": false,
      "createdAt": "2026-08-29T14:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `400` | `VALIDATION_ERROR` | Missing required fields |
| `409` | `EMAIL_EXISTS` | Email already registered |
| `409` | `PHONE_EXISTS` | Phone already registered |

---

#### `POST /api/auth/login`

Authenticate with email/phone and password.

**Auth required:** No  
**Role required:** None

**Request Body:**

```json
{
  "email": "ramesh@example.com",
  "password": "securePassword123"
}
```

> Phone login alternative: send `phone` instead of `email`.

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Ramesh Kumar",
      "nameHi": "रमेश कुमार",
      "email": "ramesh@example.com",
      "phone": "+919876543210",
      "role": "farmer",
      "avatar": null,
      "location": "Karnal, Haryana",
      "state": "Haryana",
      "district": "Karnal",
      "aadhaarVerified": false,
      "bankLinked": false,
      "crops": [],
      "cropsHi": [],
      "memberSince": "2026",
      "verified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> The frontend replaces `DEMO_ACCOUNTS` and `AuthContext` hardcoded data with this response.  
> The `user` object is stored (without `password`) in the AuthContext and localStorage.

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `400` | `VALIDATION_ERROR` | Missing fields |
| `401` | `INVALID_CREDENTIALS` | Wrong email or password |
| `403` | `ACCOUNT_SUSPENDED` | Account suspended by admin |

---

#### `GET /api/auth/me`

Get the currently authenticated user's profile.

**Auth required:** ✅  
**Role required:** Any authenticated role

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Ramesh Kumar",
      "nameHi": "रमेश कुमार",
      "email": "ramesh@example.com",
      "phone": "+919876543210",
      "role": "farmer",
      "location": "Karnal, Haryana",
      "state": "Haryana",
      "district": "Karnal",
      "crops": ["Wheat", "Rice", "Mustard"],
      "cropsHi": ["गेहूँ", "धान", "सरसों"],
      "aadhaarVerified": true,
      "bankLinked": true,
      "verified": true,
      "memberSince": "2024",
      "stats": {
        "totalLots": 4,
        "activeOffers": 2,
        "totalRevenue": 205000
      }
    }
  }
}
```

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `401` | `TOKEN_MISSING` | No Authorization header |
| `401` | `TOKEN_EXPIRED` | JWT has expired |
| `401` | `TOKEN_INVALID` | JWT signature failed |

---

#### `POST /api/auth/logout`

Invalidate the current session.

**Auth required:** ✅  
**Role required:** Any authenticated role

**Request Body:** None

**Success Response `200`:**

```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

> Server-side: if using refresh tokens, invalidate the refresh token in the database.  
> Client-side: clear localStorage and AuthContext state.

---

### Mandi Prices

---

#### `GET /api/mandi`

Get current mandi prices. Optionally filter by crop, location, or market.

**Auth required:** ✅ (any role)  
**Role required:** None

**Query Parameters:**

| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `crop` | string | Filter by crop name | `?crop=wheat` |
| `state` | string | Filter by state | `?state=Haryana` |
| `district` | string | Filter by district | `?district=Karnal` |
| `market` | string | Filter by market/mandi name | `?market=karnal` |
| `date` | `YYYY-MM-DD` | Prices for specific date (default: today) | `?date=2026-08-29` |
| `limit` | number | Max records returned (default: 20, max: 100) | `?limit=10` |

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "mp_001",
      "cropName": "Wheat",
      "cropNameHi": "गेहूँ",
      "cropEmoji": "🌾",
      "mandiName": "Karnal Mandi",
      "mandiNameHi": "करनाल मंडी",
      "state": "Haryana",
      "district": "Karnal",
      "price": 2280,
      "unit": "quintal",
      "msp": 2275,
      "priceChange": 30,
      "priceChangePct": 1.33,
      "trend": "up",
      "date": "2026-08-29",
      "source": "Agmarknet",
      "updatedAt": "2026-08-29T08:00:00.000Z"
    }
  ],
  "meta": {
    "total": 8,
    "date": "2026-08-29"
  }
}
```

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `400` | `INVALID_DATE` | Date format incorrect |
| `401` | `TOKEN_MISSING` | Not authenticated |

---

#### `GET /api/mandi/:id`

Get a single mandi entry by its ID.

**Auth required:** ✅  
**Role required:** None

**URL Params:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Mandi price record ID |

**Success Response `200`:**

Returns a single mandi object (same shape as one item from the list above).

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `404` | `NOT_FOUND` | No mandi record with this ID |

---

#### `GET /api/mandi/:id/history`

Get historical price data for a specific mandi/crop entry.

**Auth required:** ✅  
**Role required:** None

**Query Parameters:**

| Param | Type | Description | Default |
|-------|------|-------------|---------|
| `days` | number | Number of days of history | `14` |

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "cropName": "Wheat",
    "cropNameHi": "गेहूँ",
    "mandiName": "Karnal Mandi",
    "history": [
      { "date": "2026-08-16", "price": 2200 },
      { "date": "2026-08-17", "price": 2210 },
      { "date": "2026-08-18", "price": 2190 },
      { "date": "2026-08-29", "price": 2280 }
    ]
  }
}
```

> The `history` array replaces the hardcoded `priceTrends` object in `mockMandi.js`.  
> The `Sparkline` component reads from `data.history`.

---

### Crop Lots

Farmers list their available crop inventory as "lots".

---

#### `POST /api/lots`

Create a new crop lot listing.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

> **Ownership:** `farmerId` on the lot is set from the JWT — never from the request body.

**Request Body:**

```json
{
  "cropType": "wheat",
  "cropName": "Wheat",
  "cropNameHi": "गेहूँ",
  "cropEmoji": "🌾",
  "quantity": 50,
  "unit": "quintal",
  "askingPrice": 2280,
  "quality": "faq",
  "qualityLabel": "Fair Average Quality",
  "qualityLabelHi": "सामान्य गुणवत्ता",
  "location": "Karnal, Haryana",
  "state": "Haryana",
  "district": "Karnal",
  "availableFrom": "2026-09-01",
  "description": "Well-stored wheat, no pests",
  "images": []
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `cropType` | string | ✅ | Lowercase key from crop list |
| `cropName` | string | ✅ | English display name |
| `cropNameHi` | string | ✅ | Hindi display name |
| `cropEmoji` | string | ❌ | Emoji for UI |
| `quantity` | number | ✅ | Positive integer |
| `unit` | string | ✅ | `quintal` \| `kg` \| `ton` |
| `askingPrice` | number | ✅ | ₹ per unit, positive |
| `quality` | string | ✅ | `premium` \| `grade_a` \| `faq` \| `local` |
| `location` | string | ✅ | Human-readable |
| `state` | string | ✅ | Indian state |
| `district` | string | ✅ | District |
| `availableFrom` | `YYYY-MM-DD` | ❌ | Default: today |
| `description` | string | ❌ | Max 500 chars |
| `images` | string[] | ❌ | Array of image URLs (CDN) |

**Success Response `201`:**

```json
{
  "success": true,
  "data": {
    "lot": {
      "_id": "lot_abc123",
      "farmerId": "60f1a2b3c4d5e6f7a8b9c0d1",
      "farmerName": "Ramesh Kumar",
      "farmerLocation": "Karnal, Haryana",
      "cropType": "wheat",
      "cropName": "Wheat",
      "cropNameHi": "गेहूँ",
      "cropEmoji": "🌾",
      "quantity": 50,
      "unit": "quintal",
      "askingPrice": 2280,
      "quality": "faq",
      "location": "Karnal, Haryana",
      "state": "Haryana",
      "district": "Karnal",
      "availableFrom": "2026-09-01",
      "description": "Well-stored wheat, no pests",
      "images": [],
      "status": "active",
      "offerCount": 0,
      "createdAt": "2026-08-29T14:30:00.000Z",
      "updatedAt": "2026-08-29T14:30:00.000Z"
    }
  }
}
```

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `400` | `VALIDATION_ERROR` | Missing/invalid fields |
| `403` | `FORBIDDEN_ROLE` | Role is not `farmer` or `fpo` |

---

#### `GET /api/lots/my`

Get all lots belonging to the authenticated farmer.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

> **Ownership:** Only returns lots where `farmerId` matches the JWT user ID.

**Query Parameters:**

| Param | Type | Description | Default |
|-------|------|-------------|---------|
| `status` | string | Filter: `active` \| `sold` \| `expired` | all |
| `page` | number | Pagination page | `1` |
| `limit` | number | Items per page | `20` |

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "lot_abc123",
      "cropName": "Wheat",
      "cropNameHi": "गेहूँ",
      "cropEmoji": "🌾",
      "quantity": 50,
      "askingPrice": 2280,
      "quality": "faq",
      "location": "Karnal, Haryana",
      "availableFrom": "2026-09-01",
      "status": "active",
      "offerCount": 3,
      "createdAt": "2026-08-29T14:30:00.000Z"
    }
  ],
  "meta": { "total": 4, "page": 1, "limit": 20 }
}
```

> Replaces hardcoded `lots.filter(l => l.farmerId === 'f1')` in `MyLots.jsx` and `FarmerDashboard.jsx`.

---

#### `GET /api/lots/:id`

Get a single lot by ID. Public — visible to buyers browsing the marketplace.

**Auth required:** ✅  
**Role required:** None

**Success Response `200`:**

Returns the full lot object (same shape as POST response `data.lot`), with an additional `farmer` sub-object:

```json
{
  "success": true,
  "data": {
    "lot": {
      "_id": "lot_abc123",
      "cropName": "Wheat",
      "farmerId": "60f1a2b3c4d5e6f7a8b9c0d1",
      "farmer": {
        "name": "Ramesh Kumar",
        "location": "Karnal, Haryana",
        "aadhaarVerified": true,
        "rating": 4.5,
        "totalDeals": 8
      }
    }
  }
}
```

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `404` | `NOT_FOUND` | Lot does not exist or is deleted |

---

#### `GET /api/lots`

Browse available lots in the marketplace. Used by buyers.

**Auth required:** ✅  
**Role required:** None

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `crop` | string | Filter by crop type |
| `state` | string | Filter by state |
| `district` | string | Filter by district |
| `minPrice` | number | Minimum asking price |
| `maxPrice` | number | Maximum asking price |
| `minQty` | number | Minimum quantity |
| `quality` | string | Filter by quality grade |
| `sort` | string | `newest` \| `price_asc` \| `price_desc` \| `quantity` |
| `page` | number | Page number |
| `limit` | number | Items per page (max 50) |

**Success Response `200`:** Same list shape as `GET /api/lots/my`.

> Replaces the hardcoded `lots` array in `Marketplace.jsx`. Only `status: 'active'` lots are returned.

---

#### `PATCH /api/lots/:id`

Update an existing lot (e.g. change price, quantity, or status).

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

> **Ownership:** Backend confirms `lot.farmerId === req.user._id`. Returns `403` otherwise.

**Request Body** (all fields optional — only send what changes):

```json
{
  "askingPrice": 2350,
  "quantity": 40,
  "status": "active",
  "description": "Updated description"
}
```

**Allowed patch fields:** `askingPrice`, `quantity`, `quality`, `status`, `availableFrom`, `description`, `images`

**Not patchable:** `farmerId`, `cropType`, `cropName`, `cropEmoji` (create a new lot to change crop)

**Success Response `200`:** Returns the updated lot object.

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `400` | `VALIDATION_ERROR` | Invalid field value |
| `403` | `FORBIDDEN` | Lot belongs to another farmer |
| `404` | `NOT_FOUND` | Lot does not exist |
| `409` | `LOT_HAS_ACCEPTED_OFFER` | Cannot update quantity when offer is accepted |

---

#### `DELETE /api/lots/:id`

Remove a lot listing (soft delete — sets `status: 'deleted'`).

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

> **Ownership:** Backend confirms `lot.farmerId === req.user._id`.

**Success Response `204`:** No content.

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `403` | `FORBIDDEN` | Not the owner |
| `404` | `NOT_FOUND` | Lot does not exist |
| `409` | `LOT_HAS_ACTIVE_ORDER` | Cannot delete a lot with an active order |

---

### Buyers

---

#### `GET /api/buyers`

Get a list of verified buyer profiles. Used by the `BuyerDetail` and marketplace pages.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `crop` | string | Buyers interested in this crop |
| `state` | string | Filter by location state |
| `minRating` | number | Minimum rating (1–5) |
| `verified` | boolean | Only verified buyers |
| `limit` | number | Max results |

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "b1",
      "name": "Ramesh Agarwal",
      "nameHi": "रमेश अग्रवाल",
      "company": "Agarwal Traders Pvt. Ltd.",
      "location": "Delhi",
      "state": "Delhi",
      "avatar": null,
      "verified": true,
      "gstLinked": true,
      "rating": 4.7,
      "totalReviews": 23,
      "paymentTerms": "Immediate",
      "paymentTermsHi": "तुरंत भुगतान",
      "preferredCrops": ["Wheat", "Rice"],
      "preferredCropsHi": ["गेहूँ", "धान"],
      "requirements": [
        {
          "crop": "Wheat",
          "quantity": 500,
          "qualityMin": "faq",
          "priceRange": { "min": 2200, "max": 2400 }
        }
      ],
      "memberSince": "2021"
    }
  ]
}
```

> Replaces the hardcoded `buyers` array in `mockBuyers.js`.

---

#### `GET /api/buyers/:id`

Get a single buyer's public profile. Used by `BuyerDetail.jsx` and `LotDetail.jsx`.

**Auth required:** ✅  
**Role required:** Any authenticated role

**Success Response `200`:** Returns the full buyer object (same shape as list item above plus `reviews` array).

```json
{
  "success": true,
  "data": {
    "buyer": {
      "_id": "b1",
      "name": "Ramesh Agarwal",
      "company": "Agarwal Traders Pvt. Ltd.",
      "rating": 4.7,
      "reviews": [
        {
          "fromFarmerName": "Sunita Devi",
          "rating": 5,
          "comment": "Very fair dealing, paid on time.",
          "createdAt": "2026-07-10T00:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### Buyer Requirements

Buyers post what crops they need, so farmers can see demand signals.

---

#### `POST /api/requirements`

Post a new buying requirement.

**Auth required:** ✅  
**Role required:** `buyer`

> **Ownership:** `buyerId` on the requirement is set from the JWT.

**Request Body:**

```json
{
  "cropType": "wheat",
  "cropName": "Wheat",
  "cropNameHi": "गेहूँ",
  "quantity": 500,
  "unit": "quintal",
  "qualityMin": "faq",
  "maxPrice": 2400,
  "deliveryState": "Delhi",
  "deliveryDistrict": "New Delhi",
  "requiredBy": "2026-09-15",
  "notes": "Well-cleaned wheat only"
}
```

**Success Response `201`:** Returns the created requirement object.

---

#### `GET /api/requirements`

Get buyer requirements visible to farmers (browsable demand board).

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

**Query Parameters:** `crop`, `state`, `minQty`, `page`, `limit`

**Success Response `200`:** Returns a paginated list of active requirements.

---

#### `GET /api/requirements/:id`

Get a single requirement by ID.

**Auth required:** ✅  
**Role required:** Any role

---

#### `PATCH /api/requirements/:id`

Update a requirement.

**Auth required:** ✅  
**Role required:** `buyer`

> **Ownership:** Backend confirms `requirement.buyerId === req.user._id`.

**Patchable fields:** `quantity`, `maxPrice`, `qualityMin`, `requiredBy`, `notes`, `status`

**Error Responses:** `403` if not owner, `404` if not found.

---

#### `DELETE /api/requirements/:id`

Delete (soft-delete) a requirement.

**Auth required:** ✅  
**Role required:** `buyer`

> **Ownership:** Backend confirms `requirement.buyerId === req.user._id`.

**Success Response `204`:** No content.

---

### Offers

Buyers make offers on specific farmer lots.

---

#### `POST /api/offers`

Make an offer on a farmer's lot.

**Auth required:** ✅  
**Role required:** `buyer`

> **Ownership:** `buyerId` is taken from the JWT, not the request body.

**Request Body:**

```json
{
  "lotId": "lot_abc123",
  "offerPrice": 2250,
  "quantity": 30,
  "messageHi": "अच्छी फसल के लिए बेहतर दाम",
  "message": "Better price for quality crop",
  "validUntil": "2026-09-05"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `lotId` | string | ✅ | Must reference an active lot |
| `offerPrice` | number | ✅ | ₹ per unit, must be positive |
| `quantity` | number | ✅ | ≤ lot's available quantity |
| `message` | string | ❌ | Optional message to farmer |
| `messageHi` | string | ❌ | Hindi message |
| `validUntil` | `YYYY-MM-DD` | ❌ | Offer expiry date |

**Success Response `201`:**

```json
{
  "success": true,
  "data": {
    "offer": {
      "_id": "offer_xyz789",
      "lotId": "lot_abc123",
      "buyerId": "60f1a2b3c4d5e6f7a8b9c0d2",
      "farmerId": "60f1a2b3c4d5e6f7a8b9c0d1",
      "offerPrice": 2250,
      "quantity": 30,
      "totalAmount": 67500,
      "message": "Better price for quality crop",
      "messageHi": "अच्छी फसल के लिए बेहतर दाम",
      "status": "pending",
      "validUntil": "2026-09-05",
      "createdAt": "2026-08-29T15:00:00.000Z"
    }
  }
}
```

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `400` | `QUANTITY_EXCEEDS_LOT` | Offer quantity > lot quantity |
| `404` | `LOT_NOT_FOUND` | Lot does not exist |
| `409` | `OFFER_ALREADY_EXISTS` | Buyer already has an active offer on this lot |
| `422` | `LOT_NOT_ACTIVE` | Lot is sold or deleted |

---

#### `GET /api/offers/farmer`

Get all offers received by the authenticated farmer, across all their lots.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

> **Ownership:** Returns only offers where `farmerId === req.user._id`.

**Query Parameters:** `status` (`pending` \| `accepted` \| `rejected` \| `countered`), `lotId`, `page`, `limit`

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "offer_xyz789",
      "lotId": "lot_abc123",
      "lotCropName": "Wheat",
      "lotCropNameHi": "गेहूँ",
      "lotCropEmoji": "🌾",
      "buyerId": "60f1a2b3c4d5e6f7a8b9c0d2",
      "buyerName": "Ramesh Agarwal",
      "buyerCompany": "Agarwal Traders Pvt. Ltd.",
      "offerPrice": 2250,
      "quantity": 30,
      "totalAmount": 67500,
      "status": "pending",
      "createdAt": "2026-08-29T15:00:00.000Z"
    }
  ],
  "meta": { "total": 4, "page": 1, "limit": 20 }
}
```

> Replaces `offers.filter(o => o.farmerId === 'f1')` in `FarmerOffers.jsx`.

---

#### `GET /api/offers/buyer`

Get all offers made by the authenticated buyer.

**Auth required:** ✅  
**Role required:** `buyer`

> **Ownership:** Returns only offers where `buyerId === req.user._id`.

**Success Response `200`:** Same list shape as farmer offers with farmer info instead of buyer info.

> Replaces `buyerOffers` mock array in `BuyerOffers.jsx`.

---

#### `GET /api/offers/:id`

Get a single offer by ID.

**Auth required:** ✅  
**Role required:** `farmer` or `buyer`

> **Authorization:** Only the offer's farmer or buyer may view it.

---

#### `PATCH /api/offers/:id/accept`

Farmer accepts an offer.

**Auth required:** ✅  
**Role required:** `farmer`

> **Ownership:** Backend confirms `offer.farmerId === req.user._id`.

**Request Body:** None

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "offer": { "_id": "offer_xyz789", "status": "accepted" },
    "order": {
      "_id": "ord_new123",
      "status": "ORDER_CONFIRMED"
    }
  }
}
```

> Accepting an offer automatically creates an Order record.

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `403` | `FORBIDDEN` | Not the lot's farmer |
| `409` | `OFFER_NOT_PENDING` | Offer already accepted/rejected |

---

#### `PATCH /api/offers/:id/reject`

Farmer rejects an offer.

**Auth required:** ✅  
**Role required:** `farmer`

> **Ownership:** Backend confirms `offer.farmerId === req.user._id`.

**Request Body:**

```json
{ "reason": "Price too low" }
```

**Success Response `200`:** Returns updated offer with `status: 'rejected'`.

---

#### `PATCH /api/offers/:id/counter`

Farmer makes a counter-offer with a new price.

**Auth required:** ✅  
**Role required:** `farmer`

> **Ownership:** Backend confirms `offer.farmerId === req.user._id`.

**Request Body:**

```json
{
  "counterPrice": 2320,
  "message": "Please consider this price"
}
```

**Success Response `200`:** Returns updated offer with `status: 'countered'` and `counterPrice`.

---

### Orders

An order is created automatically when a farmer accepts an offer.

---

#### `GET /api/orders`

Get all orders for the authenticated user.

**Auth required:** ✅  
**Role required:** `farmer` or `buyer`

> **Ownership:** Returns orders where `farmerId` or `buyerId` matches `req.user._id` based on role.

**Query Parameters:** `status`, `page`, `limit`

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "ord_new123",
      "offerId": "offer_xyz789",
      "lotId": "lot_abc123",
      "cropName": "Wheat",
      "cropNameHi": "गेहूँ",
      "cropEmoji": "🌾",
      "farmerId": "60f1a2b3...",
      "farmerName": "Ramesh Kumar",
      "farmerLocation": "Karnal, Haryana",
      "buyerId": "60f1a2b4...",
      "buyerName": "Ramesh Agarwal",
      "buyerCompany": "Agarwal Traders Pvt. Ltd.",
      "quantity": 30,
      "unit": "quintal",
      "pricePerUnit": 2250,
      "totalAmount": 67500,
      "status": "ORDER_CONFIRMED",
      "paymentStatus": "pending",
      "paymentStatusHi": "बाकी",
      "trackingId": "KS-TRK-0001",
      "logisticsProvider": null,
      "steps": [
        { "labelHi": "ऑर्डर कन्फर्म",  "done": true,  "date": "2026-08-29" },
        { "labelHi": "गुणवत्ता जाँच",   "done": false, "date": null },
        { "labelHi": "उठाया गया",       "done": false, "date": null },
        { "labelHi": "रास्ते में",       "done": false, "date": null },
        { "labelHi": "पहुँच गया",       "done": false, "date": null },
        { "labelHi": "भुगतान हो गया",   "done": false, "date": null }
      ],
      "createdAt": "2026-08-29T15:30:00.000Z"
    }
  ]
}
```

> Replaces hardcoded `orders` array in `mockOrders.js`.

---

#### `GET /api/orders/:id`

Get a single order by ID.

**Auth required:** ✅  
**Role required:** `farmer` or `buyer`

> **Authorization:** Only the order's farmer or buyer may view it.

---

#### `PATCH /api/orders/:id/status`

Update the order delivery/payment status.

**Auth required:** ✅  
**Role required:** `farmer`, `buyer`, or `admin` (depends on status transition — see table)

> **Authorization:** Role and ownership are checked. Not all roles can set all statuses.

**Request Body:**

```json
{
  "status": "PICKED_UP",
  "note": "Picked up at 10:00 AM",
  "date": "2026-08-30"
}
```

**Order Status Machine:**

| Status | Set by | Meaning |
|--------|--------|---------|
| `ORDER_CONFIRMED` | System (on offer accept) | Order created |
| `TRANSPORT_PENDING` | `farmer` | Awaiting transport booking |
| `PICKED_UP` | `farmer` / logistics | Crop picked up from farm |
| `IN_TRANSIT` | `farmer` / logistics | En route to buyer |
| `DELIVERED` | `buyer` | Buyer confirmed receipt |
| `PAYMENT_PENDING` | System | Delivery confirmed, payment awaited |
| `PAYMENT_RECEIVED` | `buyer` / `admin` | Payment marked complete |

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `400` | `INVALID_STATUS_TRANSITION` | Status jump not allowed by the state machine |
| `403` | `FORBIDDEN` | Role not allowed to set this status |

---

### Transport

---

#### `GET /api/transport/options`

Get available transport/logistics options for a route.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fromDistrict` | string | ✅ | Pickup location district |
| `toDistrict` | string | ✅ | Delivery location district |
| `quantity` | number | ✅ | Load in quintals |
| `date` | `YYYY-MM-DD` | ❌ | Preferred pickup date |

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "tr_001",
      "providerName": "KisanSetu Logistics",
      "vehicleType": "Mini Truck",
      "capacity": "100 quintal",
      "estimatedCost": 3500,
      "estimatedDays": 1,
      "rating": 4.5,
      "contact": "1800-XXX-YYYY"
    }
  ]
}
```

---

#### `POST /api/transport/arrange`

Book transport for a specific order.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

> **Ownership:** Verified against `order.farmerId === req.user._id`.

**Request Body:**

```json
{
  "orderId": "ord_new123",
  "transporterId": "tr_001",
  "pickupDate": "2026-09-01",
  "pickupAddress": "Ramesh Kumar Farm, Village Taraori, Karnal"
}
```

**Success Response `201`:** Returns transport booking details with tracking ID.

---

### Storage

---

#### `GET /api/storage/nearby`

Get storage and cold storage options near the farmer's location.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `district` | string | ✅ | Farmer's district |
| `state` | string | ✅ | Farmer's state |
| `crop` | string | ❌ | Filter for crop-compatible storage |
| `maxDistance` | number | ❌ | Max distance in km (default 50) |

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "s1",
      "name": "HAFED Warehouse",
      "nameHi": "हाफेड गोदाम",
      "type": "Government",
      "location": "Karnal, Haryana",
      "distanceKm": 8,
      "capacity": "10000 MT",
      "availableCapacity": "3500 MT",
      "ratePerMonth": 12,
      "crops": ["Wheat", "Rice", "Maize"],
      "facilities": ["Cold Storage", "Fumigation", "Weighbridge"],
      "contact": "0184-123456"
    }
  ]
}
```

> Replaces hardcoded `storageOptions` exported from `mockOrders.js`.  
> Used by `StoragePage.jsx`.

---

### Payments

---

#### `GET /api/payments/:orderId`

Get payment summary and history for a specific order.

**Auth required:** ✅  
**Role required:** `farmer` or `buyer`

> **Authorization:** Only the order's farmer or buyer may view payment details.

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "orderId": "ord_new123",
    "totalAmount": 67500,
    "amountPaid": 0,
    "amountDue": 67500,
    "paymentStatus": "pending",
    "paymentTerms": "Full payment on delivery",
    "transactions": []
  }
}
```

---

### Notifications

---

#### `GET /api/notifications`

Get all notifications for the authenticated user.

**Auth required:** ✅  
**Role required:** Any authenticated role

**Query Parameters:** `unreadOnly` (boolean), `page`, `limit`

**Success Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "n1",
      "userId": "60f1a2b3c4d5e6f7a8b9c0d1",
      "type": "offer",
      "icon": "🤝",
      "title": "नया ऑफर मिला",
      "titleEn": "New Offer Received",
      "message": "Ramesh Agarwal ने ₹2,250/क्विंटल का ऑफर दिया।",
      "read": false,
      "farmerLink": "/farmer/offers",
      "buyerLink": "/buyer/offers",
      "createdAt": "2026-08-29T14:00:00.000Z"
    }
  ],
  "meta": { "total": 4, "unreadCount": 2 }
}
```

> When using real API, the frontend `Notifications.jsx` must replace `readNotifIds` localStorage logic with the database-persisted `read` field.  
> `TopHeader`, `Sidebar`, and `BottomNavigation` should use `meta.unreadCount` from this endpoint.

---

#### `PATCH /api/notifications/:id/read`

Mark a single notification as read.

**Auth required:** ✅  
**Role required:** Any authenticated role

> **Ownership:** Backend confirms notification `userId === req.user._id`.

**Request Body:** None

**Success Response `200`:**

```json
{
  "success": true,
  "data": { "_id": "n1", "read": true }
}
```

---

### Grievances

---

#### `POST /api/grievances`

Submit a new grievance or support request.

**Auth required:** ✅  
**Role required:** Any authenticated role

**Request Body:**

```json
{
  "category": "payment",
  "subject": "Payment not received",
  "subjectHi": "भुगतान नहीं मिला",
  "description": "Order ord_new123 was delivered on Aug 30 but payment is still pending.",
  "relatedOrderId": "ord_new123",
  "relatedOfferId": null
}
```

| Field | Type | Required |
|-------|------|----------|
| `category` | string | ✅ | `payment` \| `quality` \| `transport` \| `fraud` \| `other` |
| `subject` | string | ✅ | Max 100 chars |
| `description` | string | ✅ | Max 1000 chars |
| `relatedOrderId` | string | ❌ | Link to order if applicable |

**Success Response `201`:**

```json
{
  "success": true,
  "data": {
    "grievance": {
      "_id": "grv_001",
      "ticketId": "KS-GRV-20260829-001",
      "status": "open",
      "createdAt": "2026-08-29T16:00:00.000Z",
      "expectedResolutionBy": "2026-09-05T16:00:00.000Z"
    }
  }
}
```

---

#### `GET /api/grievances`

Get all grievances submitted by the authenticated user.

**Auth required:** ✅  
**Role required:** Any authenticated role

> **Ownership:** Returns only grievances where `userId === req.user._id`.

**Success Response `200`:** Paginated list of grievance summaries.

---

#### `GET /api/grievances/:id`

Get a single grievance by ID with full detail and response history.

**Auth required:** ✅  
**Role required:** Any authenticated role

> **Authorization:** Only the grievance owner or admin may view it.

---

### AI Services

AI endpoints proxy to the Python AI service. The Node.js backend calls Python internally and returns the result to the frontend. **The browser never calls Python directly.**

---

#### `POST /api/ai/predict-price`

Get an AI-predicted price for a crop at a specific location and date.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

**Request Body:**

```json
{
  "cropType": "wheat",
  "state": "Haryana",
  "district": "Karnal",
  "targetDate": "2026-09-15",
  "quantity": 50
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "cropType": "wheat",
    "predictedPrice": 2350,
    "confidenceLow": 2280,
    "confidenceHigh": 2430,
    "trend": "up",
    "reasoning": "Post-harvest scarcity expected in September. MSP supports floor price.",
    "reasoningHi": "सितंबर में कटाई के बाद कमी की उम्मीद। MSP से नीचे नहीं जाएगा।",
    "modelVersion": "kisansetu-price-v1.2",
    "generatedAt": "2026-08-29T16:00:00.000Z"
  }
}
```

> Replaces hardcoded `priceRecommendations` in `mockMandi.js`.

**Error Responses:**

| Code | `error.code` | Reason |
|------|-------------|--------|
| `503` | `AI_SERVICE_UNAVAILABLE` | Python service is down |
| `422` | `CROP_NOT_SUPPORTED` | Model does not support this crop yet |

---

#### `POST /api/ai/match-buyers`

Find buyers whose requirements best match a farmer's lot.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

**Request Body:**

```json
{
  "lotId": "lot_abc123"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "buyerId": "b1",
        "buyerName": "Ramesh Agarwal",
        "matchScore": 0.92,
        "matchReasonHi": "फसल की गुणवत्ता और दाम दोनों मेल खाते हैं",
        "matchReason": "Quality grade and price range both match buyer's requirements",
        "paymentTerms": "Immediate",
        "rating": 4.7
      }
    ]
  }
}
```

---

#### `POST /api/ai/market-recommendation`

Get a sell/wait recommendation for a specific crop.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

**Request Body:**

```json
{
  "cropType": "wheat",
  "quantity": 50,
  "currentPrice": 2280,
  "district": "Karnal",
  "state": "Haryana"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "action": "sell",
    "confidence": 0.84,
    "reasonHi": "अगले 7 दिनों में दाम गिर सकते हैं।",
    "reason": "Prices expected to dip in next 7 days due to new arrivals.",
    "priceOutlook": "bearish",
    "modelVersion": "kisansetu-rec-v1.0",
    "generatedAt": "2026-08-29T16:00:00.000Z"
  }
}
```

---

### Market Net Value

---

#### `POST /api/market/net-value`

Calculate the estimated net value a farmer will receive after all deductions.

**Auth required:** ✅  
**Role required:** `farmer` or `fpo`

**Request Body:**

```json
{
  "cropType": "wheat",
  "quantity": 50,
  "sellingPrice": 2280,
  "fromDistrict": "Karnal",
  "toDistrict": "Delhi",
  "storageMonths": 0
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "data": {
    "grossValue": 114000,
    "deductions": {
      "transportCost": 3500,
      "storageCost": 0,
      "commissionFee": 1140,
      "loadingUnloading": 500,
      "miscCharges": 200
    },
    "totalDeductions": 5340,
    "estimatedNetValue": 108660,
    "netPricePerQuintal": 2173,
    "breakdownHi": {
      "ढुलाई": 3500,
      "भंडारण": 0,
      "कमीशन": 1140,
      "लदाई-उतराई": 500,
      "अन्य": 200
    }
  }
}
```

> This endpoint enables a "Net Price Calculator" feature for the farmer.  
> Currently no corresponding frontend page exists — this will be a Phase 4 UI addition.

---

## Architecture Integration

### 1. React ↔ Node.js (Frontend ↔ Backend)

```
Browser (React)
     │
     │  HTTP requests via fetch() / axios
     │  Authorization: Bearer <JWT>
     │  Content-Type: application/json
     │
     ▼
Node.js Express Server
  ├── /api/auth/*
  ├── /api/lots/*
  ├── /api/offers/*
  ├── /api/orders/*
  └── ... all endpoints above
```

**Implementation guide for the React frontend:**

1. Create `src/services/api.js` — a thin wrapper around `fetch` that:
   - Reads the JWT from localStorage
   - Attaches `Authorization: Bearer <token>` header
   - Parses the standard response envelope
   - Throws on `success: false` so components can catch errors

2. Create `src/hooks/` — one custom hook per resource:
   - `useMandiPrices()` replaces `mockMandi.js`
   - `useMyLots()` replaces `lots.filter(l => l.farmerId === 'f1')`
   - `useOffers()` replaces `mockOffers.js`
   - `useOrders()` replaces `mockOrders.js`
   - `useNotifications()` replaces `mockNotifications.js`

3. Hardcoded IDs like `'f1'` and `'b1'` are replaced by `user._id` from `AuthContext`.

4. Mock data files (`mockMandi.js`, `mockLots.js`, etc.) remain during transition as fallback — each hook switches between mock and real API via an environment variable:
   ```js
   const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
   ```

---

### 2. Node.js ↔ MongoDB

```
Node.js Express
     │
     │  Mongoose ODM
     │  Connection string from .env
     │
     ▼
MongoDB Atlas (or self-hosted)
  ├── users          (farmers, buyers, FPOs, admins)
  ├── lots           (crop listings)
  ├── offers         (buyer offers on lots)
  ├── orders         (confirmed transactions)
  ├── requirements   (buyer demand posts)
  ├── notifications  (per-user)
  ├── grievances     (support tickets)
  ├── mandiprice     (daily price snapshots, indexed by date+crop+market)
  ├── storage        (storage facility master data)
  └── transport      (logistics provider data)
```

**Indexing recommendations:**

| Collection | Indexed fields |
|------------|----------------|
| `lots` | `farmerId`, `status`, `cropType`, `state`, `district` |
| `offers` | `farmerId`, `buyerId`, `lotId`, `status` |
| `orders` | `farmerId`, `buyerId`, `status` |
| `mandiprice` | `cropType`, `district`, `date` (compound) |
| `notifications` | `userId`, `read`, `createdAt` |

**Security:** The MongoDB connection string (`MONGO_URI`) is stored in `.env`. It is never exposed to the frontend or committed to source control.

---

### 3. Node.js ↔ Python AI Service

```
Node.js Express
     │
     │  Internal HTTP call (axios / node-fetch)
     │  NOT exposed to the browser
     │  Optional: API key header for service auth
     │
     ▼
Python AI Service (FastAPI or Flask)
  ├── POST /predict-price
  ├── POST /match-buyers
  └── POST /market-recommendation
```

**Call pattern in Node.js:**

```js
// Node.js route handler for POST /api/ai/predict-price
async function predictPrice(req, res) {
  try {
    const aiResponse = await fetch(`${process.env.AI_SERVICE_URL}/predict-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': process.env.AI_SERVICE_KEY,
      },
      body: JSON.stringify(req.body),
    });
    const aiData = await aiResponse.json();
    return res.json({ success: true, data: aiData });
  } catch (err) {
    return res.status(503).json({
      success: false,
      message: 'AI service unavailable',
      error: { code: 'AI_SERVICE_UNAVAILABLE' }
    });
  }
}
```

**Why this pattern?**
- The browser never knows the Python service exists
- API keys for the AI model are only on the server
- Node.js can cache AI responses to reduce load (e.g. price predictions valid for 1 hour)
- If Python is down, Node.js returns `503` gracefully instead of a CORS error in the browser

**Environment variables required:**

```env
# .env (server-side only — never commit)
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-256-bit-secret
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_KEY=your-ai-service-key
PORT=5000
NODE_ENV=development
```

---

## Unmapped Frontend Data

The following data currently exists in mock files but has **no corresponding API endpoint yet**, or requires additional design work:

| Mock Data | Current File | Status | Notes |
|-----------|-------------|--------|-------|
| `priceTrends` — hardcoded 14-day arrays | `mockMandi.js` | ⚠️ Partial | Covered by `GET /api/mandi/:id/history` |
| `priceRecommendations` — sell/wait advice | `mockMandi.js` | ✅ Mapped | `POST /api/ai/market-recommendation` |
| `buyers[].reviews` — individual review entries | `mockBuyers.js` | ✅ Mapped | Included in `GET /api/buyers/:id` |
| `cropTypes[]` — list of all crop types | `mockLots.js` | ❌ No endpoint | Should be `GET /api/config/crops` — a static config endpoint |
| `qualityGrades[]` — grade labels/values | `mockLots.js` | ❌ No endpoint | Should be `GET /api/config/quality-grades` |
| `storageOptions` — storage list | `mockOrders.js` | ✅ Mapped | `GET /api/storage/nearby` |
| `notifications[].farmerLink / buyerLink` — role routing | `mockNotifications.js` | ✅ Mapped | Returned from `GET /api/notifications` |
| Register form — accounts are not persisted | `Register.jsx` | ✅ Mapped | `POST /api/auth/register` |
| Net value calculation — no UI yet | — | ✅ Mapped | `POST /api/market/net-value` (Phase 4 UI needed) |
| FPO role — no pages exist yet | — | ❌ No UI | FPO dashboard is a future Phase |
| Admin role — no pages exist yet | — | ❌ No UI | Admin panel is a future Phase |

### Two Missing Config Endpoints (to add before Phase 4)

```
GET /api/config/crops
  Returns the master list of supported crop types
  (replaces cropTypes[] in mockLots.js)

GET /api/config/quality-grades
  Returns the quality grade options for lot creation
  (replaces qualityGrades[] in mockLots.js)
```

Both are public (no auth required) and change rarely — safe to cache client-side.

---

*End of API Contract — KisanSetu v1.0.0-draft*
