# KisanSetu Backend API

This is the backend foundation for the KisanSetu market intelligence platform.

**Note:** This backend is currently in Phase 5A (Foundation only). Business logic, database connectivity, and authentication are not yet implemented. All API routes currently return a `501 Not Implemented` placeholder response, except for the health check.

## Project Structure

```text
backend/
├── src/
│   ├── config/      # Future configuration files (e.g., db)
│   ├── controllers/ # Future request handlers
│   ├── middleware/  # Custom middleware (error handling, etc.)
│   ├── models/      # Future Mongoose schemas
│   ├── routes/      # Express route definitions
│   ├── services/    # Future business logic
│   ├── utils/       # Helper functions
│   ├── app.js       # Express app configuration
│   └── server.js    # HTTP server entry point
├── package.json
└── .env.example     # Template for environment variables
```

## Requirements

- Node.js (v18 or higher)
- npm

## Installation

```bash
cd backend
npm install
```

## Environment Configuration

Create a local `.env` file based on the provided example:

```bash
cp .env.example .env
```

Ensure you customize variables like `PORT`, `MONGO_URI`, and `JWT_SECRET` as needed in future phases.

## Starting the Server

### Development Mode (with hot-reloading)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Available Endpoints (Foundation)

- **GET `/api/health`**
  Returns `{ "success": true, "message": "KisanSetu API is running" }`

All other endpoints defined in the API contract (e.g., `/api/auth`, `/api/mandi`) are routed but return a `501 Not Implemented` response until Phase 5B.
