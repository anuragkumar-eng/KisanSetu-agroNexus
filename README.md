# KisanSetu — Farmer Market Intelligence Platform

> **SIH / Prototype Demo Version — Phase 7**
>
> KisanSetu connects farmers and buyers for transparent, direct agricultural trade with AI-powered price intelligence and market insights.

## Quick Start

### Prerequisites
- Node.js >= 18.x
- Python >= 3.10
- MongoDB Atlas account (connection string in ackend/.env)

---

### 1. Python AI Service (Port 8000)

`
cd ai-service
python -m venv venv
venv\Scripts\activate         # Windows
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
`

Health check: http://localhost:8000/health

---

### 2. Node.js Backend (Port 5000)

`
cd backend
# Copy and fill in environment variables
copy .env.example .env
npm install
npm run dev
`

Health check: http://localhost:5000/api/health

---

### 3. React Frontend (Port 5173)

`
# In the project root directory
# Copy and fill in environment variables
copy .env.example .env
# Edit .env: set VITE_USE_MOCK=false
npm install
npm run dev
`

Open: http://localhost:5173

---

## Environment Variables

### backend/.env
| Variable | Description |
|---|---|
| PORT | Server port (default: 5000) |
| NODE_ENV | Environment: development / production |
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for JWT signing |
| PYTHON_AI_URL | AI service URL (default: http://localhost:8000) |
| CLIENT_URL | Frontend URL for CORS (default: http://localhost:5173) |

### .env (Frontend)
| Variable | Description |
|---|---|
| VITE_API_URL | Backend API base URL (default: http://localhost:5000/api) |
| VITE_USE_MOCK | alse for real backend, 	rue for local mock data |

---

## Demo Workflows

### Farmer Flow
1. Register as Farmer ? Login ? View Dashboard
2. Create a crop lot (??? ?? ???????)
3. Browse incoming offers on My Crops page
4. Accept / Reject / Counter an offer
5. Track resulting order status
6. View Mandi prices and price trends

### Buyer Flow
1. Register as Buyer ? Login ? View Dashboard
2. Browse Marketplace and filter by crop
3. View lot details
4. Make an offer (price + quantity)
5. Track accepted offers in Orders
6. View buyer profile and history

### AI Features
- Price Prediction (AI-assisted crop price estimate)
- Market Recommendation (best time to sell advice)
- Buyer Matching (AI-suggested buyers for a lot)

---

## Services & Ports

| Service | Port | Start Command |
|---|---|---|
| Python AI Service | 8000 | uvicorn main:app (in ai-service/) |
| Node.js Backend | 5000 | 
pm run dev (in backend/) |
| React Frontend | 5173 | 
pm run dev (in project root) |

---

## Project Structure

`
kisansetu/
+-- ai-service/         # Python FastAPI AI microservice
¦   +-- main.py
¦   +-- requirements.txt
+-- backend/            # Node.js Express REST API
¦   +-- src/
¦   ¦   +-- controllers/
¦   ¦   +-- models/
¦   ¦   +-- routes/
¦   ¦   +-- middleware/
¦   +-- .env.example
¦   +-- package.json
+-- src/                # React frontend
¦   +-- components/
¦   +-- context/
¦   +-- hooks/
¦   +-- pages/
¦   +-- services/
+-- docs/               # Phase reports and API documentation
+-- .env.example
+-- package.json
`

---

## Security Notes
- .env files are gitignored — never commit credentials
- JWT authentication required for all protected routes
- Role-based authorization enforced at route level
- CORS restricted to CLIENT_URL environment variable

---

## Known Limitations
- Python AI service uses heuristic fallbacks (no trained ML model in repo)
- Payment integration is conceptual only (no gateway wired)
- No deployed hosting — local demo only at this stage
